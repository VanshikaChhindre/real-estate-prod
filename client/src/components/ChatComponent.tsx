import React from "react";
import useSocket from "@/hooks/useSocket"; // Adjust the import path as necessary

interface ChatComponentProps {
  conversationId: string;
  userId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ conversationId, userId }) => {
  const { messages, newMessage, setNewMessage, sendMessage } = useSocket(conversationId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 border border-gray-300 rounded-lg">
        {messages.map((message, index) => (
          <div key={`${message.id}-${index}`} className="mb-2">
            <strong>{message.senderId}</strong>
            <span className={`p-1 px-2 rounded text-white ${userId != message.senderid? "bg-gray-500" : "bg-blue-500"}`}>{message.content}</span>
            <div className={`text-gray-500 text-xs`}>{new Date(message.createdat).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow border border-gray-300 rounded-lg p-2"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 text-white rounded-lg px-4 py-2"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;