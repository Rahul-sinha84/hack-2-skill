"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import generateUniqueId from "@/utils/generateUniqueId";

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

export enum MessageType {
  USER = "user",
  ASSISTANT = "assistant",
  PROCESSING = "processing",
  SYSTEM = "system",
}

export interface ChatResponse {
  id: string;
  prompt: string;
  content: string;
  chatId: string;
  userId: string; // for indexing the response
  timestamp: Date;
  messageType: MessageType;
  isProcessing?: boolean;
  processingStatus?: string;
  attachedFile?: {
    name: string;
    type: string;
    size: number;
  };
  user?: {
    name?: string | null;
    image?: string | null;
  };
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
  addChatResponseWithTestCases: (chatId: string, message: string, testCaseData: any, fileName?: string) => ChatResponse;
  addUserMessage: (chatId: string, message: string, file?: File, user?: { name?: string | null; image?: string | null }) => ChatResponse;
  addProcessingMessage: (chatId: string, status: string) => ChatResponse;
  updateProcessingMessage: (responseId: string, status: string) => void;
  completeProcessingMessage: (responseId: string, finalContent: string, testCaseData?: any) => void;
  updateTestCaseStatus: (testCaseId: string, status: TestCaseStatus) => void;
  updateTestCaseDetails: (testCaseId: string, title: string, content: string) => void;
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

  const addUserMessage = (chatId: string, message: string, file?: File, user?: { name?: string | null; image?: string | null }): ChatResponse => {
    const chatResponseId = generateUniqueId('user_msg_');
    const newChatResponse: ChatResponse = {
      id: chatResponseId,
      chatId,
      prompt: message,
      content: message,
      userId: "rahul-sinha", // This could be replaced with a dynamic user ID from session
      timestamp: new Date(),
      messageType: MessageType.USER,
      attachedFile: file ? {
        name: file.name,
        type: file.type,
        size: file.size,
      } : undefined,
      user,
    };
    setChatResponses(prev => [...prev, newChatResponse]);
    return newChatResponse;
  };

  const addProcessingMessage = (chatId: string, status: string): ChatResponse => {
    const chatResponseId = generateUniqueId('processing_msg_');
    const newChatResponse: ChatResponse = {
      id: chatResponseId,
      chatId,
      prompt: "",
      content: status,
      userId: "assistant",
      timestamp: new Date(),
      messageType: MessageType.PROCESSING,
      isProcessing: true,
      processingStatus: status,
    };
    setChatResponses(prev => [...prev, newChatResponse]);
    return newChatResponse;
  };

  const updateProcessingMessage = (responseId: string, status: string): void => {
    setChatResponses(prev => prev.map(response => 
      response.id === responseId 
        ? { ...response, content: status, processingStatus: status }
        : response
    ));
  };

  const completeProcessingMessage = (responseId: string, finalContent: string, testCaseData?: any): void => {
    setChatResponses(prev => prev.map(response => 
      response.id === responseId 
        ? { 
            ...response, 
            content: finalContent, 
            messageType: MessageType.ASSISTANT,
            isProcessing: false,
            processingStatus: undefined 
          }
        : response
    ));

    // Process test case data if provided
    if (testCaseData && testCaseData.categories) {
      const newTestCategories: TestCategory[] = [];
      const newTestCases: TestCase[] = [];

      testCaseData.categories.forEach((category: any, categoryIndex: number) => {
        const testCategoryId = generateUniqueId(`cat_${categoryIndex}_`);
        
        const chatResponse = chatResponses.find(r => r.id === responseId);
        const newTestCategory: TestCategory = {
          id: testCategoryId,
          chatResponseId: responseId,
          chatId: chatResponse?.chatId || "",
          label: category.label || `Test Category ${categoryIndex + 1}`,
          description: category.description || "Generated test category",
        };
        newTestCategories.push(newTestCategory);

        // Add test cases for this category
        if (category.testCases && Array.isArray(category.testCases)) {
          category.testCases.forEach((testCase: any, testCaseIndex: number) => {
            const testCaseId = generateUniqueId(`tc_${categoryIndex}_${testCaseIndex}_`);
            
            const newTestCase: TestCase = {
              id: testCaseId,
              testCategoryId,
              chatResponseId: responseId,
              title: testCase.title || `Test Case ${testCaseIndex + 1}`,
              content: testCase.content || "Generated test case content",
              status: TestCaseStatus.PENDING ,
            };
            newTestCases.push(newTestCase);
          });
        }
      });

      setTestCategories(prev => [...prev, ...newTestCategories]);
      setTestCases(prev => [...prev, ...newTestCases]);
    }
  };

  const addChatResponse = (chatId: string, message: string): ChatResponse => {
    const chatResponseId = generateUniqueId('assistant_msg_');
    const newChatResponse: ChatResponse = {
      id: chatResponseId,
      chatId,
      prompt: message,
      content:
        "This is a response to a message without a file. Test cases are not generated for this type of message.",
      userId: "rahul-sinha",
      timestamp: new Date(),
      messageType: MessageType.ASSISTANT,
    };
    setChatResponses(prev => [...prev, newChatResponse]);
    return newChatResponse;
  };

  const addChatResponseWithTestCases = (chatId: string, message: string, testCaseData: any, fileName?: string): ChatResponse => {
    const chatResponseId = generateUniqueId('assistant_msg_');
    const responseContent = fileName 
      ? `Document "${fileName}" processed successfully. Generated ${testCaseData.categories?.length || 0} test categories with comprehensive test cases.`
      : "Test cases generated successfully based on your input.";
    
    const newChatResponse: ChatResponse = {
      id: chatResponseId,
      chatId,
      prompt: message,
      content: responseContent,
      userId: "rahul-sinha",
      timestamp: new Date(),
      messageType: MessageType.ASSISTANT,
    };
    setChatResponses(prev => [...prev, newChatResponse]);

    // Process the test case data from Gemini API
    if (testCaseData && testCaseData.categories) {
      const newTestCategories: TestCategory[] = [];
      const newTestCases: TestCase[] = [];

      testCaseData.categories.forEach((category: any, categoryIndex: number) => {
        const testCategoryId = generateUniqueId(`cat_${categoryIndex}_`);
        
        const newTestCategory: TestCategory = {
          id: testCategoryId,
          chatResponseId,
          chatId,
          label: category.label || `Test Category ${categoryIndex + 1}`,
          description: category.description || "Generated test category",
        };
        newTestCategories.push(newTestCategory);

        // Add test cases for this category
        if (category.testCases && Array.isArray(category.testCases)) {
          category.testCases.forEach((testCase: any, testCaseIndex: number) => {
            const testCaseId = generateUniqueId(`tc_${categoryIndex}_${testCaseIndex}_`);
            
            const newTestCase: TestCase = {
              id: testCaseId,
              testCategoryId,
              chatResponseId,
              title: testCase.title || `Test Case ${testCaseIndex + 1}`,
              content: testCase.content || "Generated test case content",
              status: TestCaseStatus.PENDING ,
            };
            newTestCases.push(newTestCase);
          });
        }
      });

      setTestCategories(prev => [...prev, ...newTestCategories]);
      setTestCases(prev => [...prev, ...newTestCases]);
    }

    return newChatResponse;
  };

  const updateTestCaseStatus = (testCaseId: string, status: TestCaseStatus): void => {
    setTestCases(prev => prev.map(testCase => 
      testCase.id === testCaseId 
        ? { ...testCase, status }
        : testCase
    ));
  };

  const updateTestCaseDetails = (testCaseId: string, title: string, content: string): void => {
    setTestCases(prev => prev.map(testCase => 
      testCase.id === testCaseId 
        ? { ...testCase, title, content }
        : testCase
    ));
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
    addChatResponseWithTestCases,
    addUserMessage,
    addProcessingMessage,
    updateProcessingMessage,
    completeProcessingMessage,
    updateTestCaseStatus,
    updateTestCaseDetails,
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
