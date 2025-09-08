"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { useChat } from "../context/ChatContext";

const SmoothChatLayout: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { addMessage, getMessagesByChatId } = useChat();

  // Extract chatId from pathname
  const chatId = pathname === "/a/chat" ? undefined : pathname.split("/").pop();

  // Get messages for the current chat
  const currentChatMessages = chatId ? getMessagesByChatId(chatId) : [];

  const handleMessageSubmit = (message: string) => {
    if (chatId) {
      // If we're already in a chat, just add the message
      addMessage(message, chatId);
    } else {
      // If we're on the main chat page, create a new chat
      const newChatId = Date.now().toString();

      // Add the message to the new chat
      addMessage(message, newChatId);

      router.push(`/a/chat/${newChatId}`, { scroll: false });
    }
  };

  console.log({ messages: currentChatMessages, chatId, pathname });

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
      <header className="bg-white border-b p-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {chatId ? `Chat ${chatId}` : "New Chat"}
        </h1>
      </header>

      <ChatMessages messages={currentChatMessages} chatId={chatId} />

      <div className="bg-white border-t">
        <ChatInput onSubmit={handleMessageSubmit} />
      </div>
    </div>
  );
};

export default SmoothChatLayout;
