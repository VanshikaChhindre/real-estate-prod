"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetUserConversationsQuery, useGetAuthUserQuery } from "@/state/api";
import Navbar from "@/components/Navbar";

interface ApiError {
  message?: string;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ✅ Match DashboardLayout logic
  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        router.push("/login");
      } else {
        setIsLoadingPage(false);
      }
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser?.cognitoInfo?.userId) {
      setUser(authUser.cognitoInfo.userId);
    }
  }, [authUser]);

  
  const { data: conversations, error, isLoading: convLoading } =
  useGetUserConversationsQuery(user || "", {
    skip: !user, // ✅ Skip query until user is set
  });

  if (authLoading || isLoadingPage ) {
    return <div>Loading...</div>;
  }

  // ✅ Handle API error
  let errorMessage = "An unknown error occurred.";
  if (error) {
    if ("status" in error) {
      const apiError = error.data as ApiError;
      errorMessage = `Error ${error.status}: ${apiError.message || "Unknown error"}`;
    } else if ("message" in error) {
      errorMessage = error.message || "An unknown error occurred.";
    }
  }

  return (
    <div className="min-h-screen w-full bg-primary-100">
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Conversations</h1>
        {convLoading ? (
          <div>Loading conversations...</div>
        ) : conversations && conversations.length > 0 ? (
          <ul className="space-y-2">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                onClick={() => router.push(`/chat/${conversation.id}`)}
                className="cursor-pointer p-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                <h2 className="font-semibold">Conversation ID: {conversation.id}</h2>
                <p className="text-gray-600">
                  Last message: {conversation.messages[0]?.content || "No messages yet"}
                </p>
                <span className="text-gray-400 text-sm">
                  {new Date(conversation.createdat).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-600">No conversations found.</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
