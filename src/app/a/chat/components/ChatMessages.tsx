"use client";

import React from "react";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  chatId?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, chatId }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {chatId && (
        <div className="mb-4 p-2 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600">Chat ID: {chatId}</p>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <div key={message.id} className="p-3 bg-white border rounded-md">
              <p className="text-gray-800">{message.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
