"use client" 
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";;
import ChatComponent from "@/components/ChatComponent";
import { useGetAuthUserQuery } from "@/state/api";
import { useRouter } from "next/navigation";

const ChatPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const [userId, setUserId] = useState<any>(null);


  const conversationId = params?.id as string;
  
  
    useEffect(() => {
      if (!authUser) {
        router.push("/login");
      }
      if (authUser?.cognitoInfo?.userId) {
        setUserId(authUser.cognitoInfo.userId);
      }
    }, [authUser]);


  if (!conversationId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Chat</h1>
      <ChatComponent conversationId={conversationId as string} userId={userId as string}/>
    </div>
  );
};

export default ChatPage;
