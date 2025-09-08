"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  chatId: string;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (content: string, chatId: string) => void;
  getMessagesByChatId: (chatId: string) => Message[];
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (content: string, chatId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      chatId,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const getMessagesByChatId = (chatId: string) => {
    return messages.filter((message) => message.chatId === chatId);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value: ChatContextType = {
    messages,
    addMessage,
    getMessagesByChatId,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
