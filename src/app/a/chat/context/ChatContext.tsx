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
    const chatResponseId = Date.now().toString();
    const newChatResponse: ChatResponse = {
      id: chatResponseId,
      chatId,
      prompt: message,
      content:
        "Est exercitation mollit proident ipsum dolore dolore duis. Dolore in ullamco magna sunt dolor deserunt Lorem. Occaecat nisi ipsum cupidatat adipisicing laboris sint officia aute minim eu. Nisi cupidatat nulla anim Lorem dolor. Excepteur eu reprehenderit ipsum quis dolore veniam cupidatat officia cupidatat magna ullamco id. Elit quis ullamco amet sint pariatur esse et culpa cupidatat cupidatat enim tempor.",
      userId: "rahul-sinha",
      timestamp: new Date(),
    };
    setChatResponses([...chatResponses, newChatResponse]);

    const testCategoryId = Date.now().toString();
    const newTestCategory: TestCategory = {
      id: testCategoryId,
      chatResponseId,
      chatId,
      label: "Test Category 1",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    const newTestCategory1: TestCategory = {
      id: testCategoryId + 1,
      chatResponseId,
      chatId,
      label: "Test Category 2",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    const newTestCategory3: TestCategory = {
      id: testCategoryId + 2,
      chatResponseId,
      chatId,
      label: "Test Category 2",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    const newTestCategory4: TestCategory = {
      id: testCategoryId + 3,
      chatResponseId,
      chatId,
      label: "Test Category 2",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    const newTestCategory5: TestCategory = {
      id: testCategoryId + 4,
      chatResponseId,
      chatId,
      label: "Test Category 2",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    const newTestCategory6: TestCategory = {
      id: testCategoryId + 5,
      chatResponseId,
      chatId,
      label: "Test Category 2",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    const newTestCategory7: TestCategory = {
      id: testCategoryId + 7,
      chatResponseId,
      chatId,
      label: "Test Category 2",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    const newTestCategory8: TestCategory = {
      id: testCategoryId + 6,
      chatResponseId,
      chatId,
      label: "Test Category 2",
      description:
        "Test Category Description. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    };
    setTestCategories([
      ...testCategories,
      newTestCategory,
      newTestCategory1,
      newTestCategory3,
      newTestCategory4,
      newTestCategory5,
      newTestCategory6,
      newTestCategory7,
      newTestCategory8,
    ]);

    const testCaseId = Date.now().toString();
    const newTestCase: TestCase = {
      id: testCaseId,
      testCategoryId,
      chatResponseId,
      title: "Test Case 1",
      content:
        "Adipisicing exercitation duis laborum ea consectetur proident dolor mollit anim ullamco adipisicing sit dolore est. Aliqua est enim culpa sit qui excepteur. Excepteur laboris dolore eiusmod est sunt nostrud ipsum amet proident quis do cupidatat. \nPariatur quis elit sunt ullamco nisi ad adipisicing aliquip cillum est commodo qui. Pariatur laboris ut aute tempor nulla pariatur pariatur consequat. Dolore magna nostrud ad pariatur eu nostrud. Veniam ad excepteur qui commodo. Amet et Lorem in aliquip proident voluptate cupidatat proident occaecat officia tempor. Sunt ullamco eu sit amet cupidatat elit ipsum excepteur id est irure. Voluptate nisi voluptate laboris tempor culpa proident voluptate officia. Reprehenderit ex adipisicing proident nostrud reprehenderit cupidatat.\n Deserunt ut qui commodo velit aliqua sint ipsum minim id consectetur non ut aliqua nisi. Et non non nulla ad Lorem enim elit sunt velit aute. Laborum qui fugiat id mollit.",
      status: TestCaseStatus.APPROVED,
    };

    const newTestCase2: TestCase = {
      id: testCaseId + 1,
      testCategoryId,
      chatResponseId,
      title: "Test Case 2",
      content:
        "Adipisicing exercitation duis laborum ea consectetur proident dolor mollit anim ullamco adipisicing sit dolore est. Aliqua est enim culpa sit qui excepteur. Excepteur laboris dolore eiusmod est sunt nostrud ipsum amet proident quis do cupidatat. \nPariatur quis elit sunt ullamco nisi ad adipisicing aliquip cillum est commodo qui. Pariatur laboris ut aute tempor nulla pariatur pariatur consequat. Dolore magna nostrud ad pariatur eu nostrud. Veniam ad excepteur qui commodo. Amet et Lorem in aliquip proident voluptate cupidatat proident occaecat officia tempor. Sunt ullamco eu sit amet cupidatat elit ipsum excepteur id est irure. Voluptate nisi voluptate laboris tempor culpa proident voluptate officia. Reprehenderit ex adipisicing proident nostrud reprehenderit cupidatat.\n Deserunt ut qui commodo velit aliqua sint ipsum minim id consectetur non ut aliqua nisi. Et non non nulla ad Lorem enim elit sunt velit aute. Laborum qui fugiat id mollit.",
      status: TestCaseStatus.REJECTED,
    };
    setTestCases([...testCases, newTestCase, newTestCase2]);
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
