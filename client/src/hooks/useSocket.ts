import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth"; // Ensure you are importing from AWS Amplify

// Replace with your backend Socket.IO URL
const SOCKET_URL = "http://localhost:3001"; 

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

const useSocket = (conversationId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    const getToken = async () => {
      try {
        const user = await getCurrentUser(); // Get the current user
        if (!user) {
          console.error("User is not authenticated.");
          return;
        }

        const session = await fetchAuthSession(); // Fetch the session
        const idTokenString = session.tokens?.idToken?.toString();
         // This is the token you will use for authentication
         if (!idTokenString) {
          console.error("Token not found.");
          return;
        }
    

        // Create socket connection with Cognito token for authentication
        const socketConnection = io(SOCKET_URL, {
          auth: {
            token: idTokenString, 
          },
        });

        socketConnection.emit("joinRoom", { conversationId });

        socketConnection.on("messageHistory", (messageHistory: Message[]) => {
          setMessages(messageHistory);
        });

        socketConnection.on("receiveMessage", (message: Message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        setSocket(socketConnection);

        

      } catch (error) {
        console.error("Error during token fetch or socket connection:", error);
      }
    };

    getToken();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit("sendMessage", { conversationId, content: newMessage });
      setNewMessage(""); // Clear input after sending
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
  };
};

export default useSocket;
