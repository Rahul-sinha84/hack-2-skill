"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export enum TestCaseStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  timestamp: Date;
}

export interface ChatResponse {
  id: string;
  prompt: string;
  content: string;
  chatId: string;
  userId: string; // for indexing the response
  timestamp: Date;
}

export interface TestCategory {
  id: string;
  chatResponseId: string;
  chatId: string; // for indexing the test category
  label: string;
  description: string;
}

export interface TestCase {
  id: string;
  testCategoryId: string;
  chatResponseId: string; // for indexing the test case
  title: string;
  content: string;
  status: TestCaseStatus;
}

export interface ChatContextType {
  chats: Array<Chat>;
  chatResponses: Array<ChatResponse>;
  testCategories: Array<TestCategory>;
  testCases: Array<TestCase>;
  getChatResponsesByChatId: (chatId: string) => Array<ChatResponse>;
  getTestCategoriesByChatResponseId: (
    chatResponseId: string
  ) => Array<TestCategory>;
  getTestCasesByTestCategoryId: (testCategoryId: string) => Array<TestCase>;
  addChatResponse: (chatId: string, message: string) => ChatResponse;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Array<Chat>>([]);
  const [chatResponses, setChatResponses] = useState<Array<ChatResponse>>([]);
  const [testCategories, setTestCategories] = useState<Array<TestCategory>>([]);
  const [testCases, setTestCases] = useState<Array<TestCase>>([]);

  const getChatResponsesByChatId = (chatId: string): Array<ChatResponse> =>
    chatResponses.filter((val) => val.chatId === chatId);

  const getTestCategoriesByChatResponseId = (
    chatResponseId: string
  ): Array<TestCategory> =>
    testCategories.filter((val) => val.chatResponseId === chatResponseId);

  const getTestCasesByTestCategoryId = (
    testCategoryId: string
  ): Array<TestCase> =>
    testCases.filter((val) => val.testCategoryId === testCategoryId);

  const addChatResponse = (chatId: string, message: string): ChatResponse => {
    const newChatResponse: ChatResponse = {
      id: Date.now().toString(),
      chatId,
      prompt: message,
      content:
        "Est exercitation mollit proident ipsum dolore dolore duis. Dolore in ullamco magna sunt dolor deserunt Lorem. Occaecat nisi ipsum cupidatat adipisicing laboris sint officia aute minim eu. Nisi cupidatat nulla anim Lorem dolor. Excepteur eu reprehenderit ipsum quis dolore veniam cupidatat officia cupidatat magna ullamco id. Elit quis ullamco amet sint pariatur esse et culpa cupidatat cupidatat enim tempor.",
      userId: "rahul-sinha",
      timestamp: new Date(),
    };
    setChatResponses([...chatResponses, newChatResponse]);
    return newChatResponse;
  };

  const value: ChatContextType = {
    chats,
    chatResponses,
    testCategories,
    testCases,
    getChatResponsesByChatId,
    getTestCategoriesByChatResponseId,
    getTestCasesByTestCategoryId,
    addChatResponse,
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
