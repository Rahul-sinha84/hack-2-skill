"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import generateUniqueId from "@/utils/generateUniqueId";
import ChatInput from "./ChatInput";
import ChatResponses from "./ChatResponses";
import {
  ChatResponse,
  TestCase,
  TestCategory,
  MessageType,
  useChat,
} from "../context/ChatContext";
import { showToastError, showToastInfo } from "@/components/ReactToastify/ReactToastify";
import "./_chat_layout.scss";

const SmoothChatLayout: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const {
    chatResponses,
    addChatResponse,
    addUserMessage,
    addProcessingMessage,
    updateProcessingMessage,
    completeProcessingMessage,
    getChatResponsesByChatId,
    getTestCategoriesByChatResponseId,
    getTestCasesByTestCategoryId,
  } = useChat();

  // Extract chatId from pathname
  const chatId = pathname === "/a/chat" ? undefined : pathname.split("/").pop();

  const [curChatResponses, setCurChatResponses] = useState<
    Array<
      ChatResponse & {
        testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
      }
    >
  >([]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const processFileAndGenerateTestCases = async (
    file: File, 
    userQuery: string, 
    chatId: string,
    processingMessageId: string
  ) => {
    try {
      setIsProcessing(true);

      // Step 1: Scanning document
      updateProcessingMessage(processingMessageId, "📄 Scanning PRD document...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX

      const formData = new FormData();
      formData.append('file', file);

      const documentResponse = await fetch('/api/document-ai', {
        method: 'POST',
        body: formData,
      });

      if (!documentResponse.ok) {
        throw new Error('Failed to process document');
      }

      // Step 2: Reading document
      updateProcessingMessage(processingMessageId, "🔍 Reading document content...");
      await new Promise(resolve => setTimeout(resolve, 800));

      const documentData = await documentResponse.json();
      let documentText = documentData.data.fullText;
      let tables = documentData.data.tables || [];

      // Optimize: Truncate very long documents to speed up Gemini processing
      const MAX_CHARS = 50000; // ~12,500 words limit for faster processing
      if (documentText.length > MAX_CHARS) {
        documentText = documentText.substring(0, MAX_CHARS) + '\n\n[Document truncated for faster processing...]';
        console.log(`Document truncated from ${documentData.data.fullText.length} to ${documentText.length} characters`);
      }

      // Step 3: Understanding context
      updateProcessingMessage(processingMessageId, "🧠 Understanding context and requirements...");
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Step 4: Generating test cases
      updateProcessingMessage(processingMessageId, "⚡ Generating comprehensive test cases...");

      const testCaseResponse = await fetch('/api/gemini/generate-test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText,
          tables,
          userQuery,
          fileName: file.name,
        }),
      });

      if (!testCaseResponse.ok) {
        throw new Error('Failed to generate test cases');
      }

      const testCaseData = await testCaseResponse.json();
      
      // Step 5: Complete processing
      const documentSummary = testCaseData.metadata?.documentSummary || `PRD document "${file.name}" processed successfully`;
      const finalContent = `${documentSummary}. Generated ${testCaseData.data.categories?.length || 0} test categories with comprehensive test cases.`;
      completeProcessingMessage(processingMessageId, finalContent, testCaseData.data);

      return {
        documentText,
        testCases: testCaseData.data,
        fileName: file.name,
      };

    } catch (error) {
      console.error('Error processing file:', error);
      completeProcessingMessage(processingMessageId, "❌ Failed to process document and generate test cases. Please try again.");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMessageSubmit = async (message: string, file?: File) => {
    try {
      const currentChatId = chatId || generateUniqueId('chat_');
      
      // Add user message first
      console.log('NextAuth session.user:', session?.user);
      addUserMessage(currentChatId, message, file, session?.user);
      
      if (file) {
        // Add processing message for file uploads
        const processingMessage = addProcessingMessage(currentChatId, "🚀 Starting document processing...");
        
        // Process the file asynchronously
        processFileAndGenerateTestCases(file, message, currentChatId, processingMessage.id);
      } else {
        // For text-only messages, just add a simple response
        addChatResponse(currentChatId, message);
      }

      // Navigate to chat if we're not already there
      if (!chatId) {
        router.push(`/a/chat/${currentChatId}`);
      }
    } catch (error) {
      console.error('Error in handleMessageSubmit:', error);
      showToastError('Failed to send message');
    }
  };

  // This function is now implemented in ChatContext

  useEffect(() => {
    if (chatId) {
      const chatResponsesForId = getChatResponsesByChatId(chatId);

      const requiredData = chatResponsesForId.map((chatResponse) => {
        const { id } = chatResponse;
        const testCategories = getTestCategoriesByChatResponseId(id);

        const testCategoriesWithTestCases = testCategories.map(
          (testCategory) => {
            const { id: testCategoryId } = testCategory;
            const testCases = getTestCasesByTestCategoryId(testCategoryId);
            return {
              ...testCategory,
              testCases,
            };
          }
        );

        return {
          ...chatResponse,
          testCategories: testCategoriesWithTestCases,
        };
      });

      setCurChatResponses(requiredData);
      
      // Auto-scroll to bottom when new messages are added
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [chatId, chatResponses, getChatResponsesByChatId, getTestCategoriesByChatResponseId, getTestCasesByTestCategoryId]);

  // Also scroll when processing status updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [curChatResponses]);

  return (
    <section className="chat__layout">
      <div className="chat__layout__container">
        <header className="chat__layout__header">
          <div className="chat__layout__topbar">
            <div className="topbar__left">
              <h2 className="app__title">Test Case Generator</h2>
            </div>
            <div className="topbar__right">
              <div className="topbar__avatar">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const span = document.createElement('span');
                        span.textContent = (session?.user?.name?.charAt(0) || 'U').toUpperCase();
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span>{(session?.user?.name?.charAt(0) || 'U').toUpperCase()}</span>
                )}
              </div>
              <button className="topbar__logout" onClick={() => signOut({ callbackUrl: '/login' })}>
                Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="chat__layout__main">
          {chatId ? (
            <div className="chat__layout__chats" ref={chatContainerRef}>
              <ChatResponses responses={curChatResponses} chatId={chatId} />
            </div>
          ) : (
            <div className="chat__layout__chats" ref={chatContainerRef}></div>
          )}

          <div className={`chat__layout__input`}>
            <ChatInput onSubmit={handleMessageSubmit} />
          </div>
        </main>
        <footer className="chat__layout__footer"></footer>
      </div>
    </section>
  );
};

export default SmoothChatLayout;
