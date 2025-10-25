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
import {
  showToastError,
  showToastInfo,
} from "@/components/ReactToastify/ReactToastify";
import { GenerateUITestsResponse } from "@/types/generate-ui-tests";
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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Force scroll to bottom with a slight delay
  const forceScrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        const container = chatContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  };

  const processFileAndGenerateTestCases = async (
    file: File,
    userQuery: string,
    chatId: string,
    processingMessageId: string,
    gdprMode: boolean = true
  ) => {
    try {
      if (process.env.NEXT_PUBLIC_LIVE === "false") {
        const testCaseResponse = await fetch("/api/auth/get-mock-test-cases", {
          method: "GET",
        });

        if (!testCaseResponse.ok) {
          throw new Error("Failed to get mock test cases");
        }

        const testCaseData = await testCaseResponse.json();

        completeProcessingMessage(
          processingMessageId,
          testCaseData.data.documentSummary,
          testCaseData.data
        );

        return {
          documentText: testCaseData.data.documentText,
          testCases: testCaseData.data.testCases,
          fileName: file.name,
        };
      }

      setIsProcessing(true);

      // Step 1: Document AI Processing
      updateProcessingMessage(
        processingMessageId,
        "📄 Processing document with Document AI..."
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: DLP Analysis
      updateProcessingMessage(
        processingMessageId,
        "🔒 Analyzing document for sensitive data..."
      );
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 3: RAG Enhancement
      updateProcessingMessage(
        processingMessageId,
        "🧠 Enhancing with RAG context..."
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Knowledge Graph Generation
      updateProcessingMessage(
        processingMessageId,
        "🕸️ Building knowledge graph..."
      );
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 5: Gemini AI Generation
      updateProcessingMessage(
        processingMessageId,
        "⚡ Generating comprehensive test cases with Gemini AI..."
      );
      const generationStart =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      // Use the external API endpoint
      const formData = new FormData();
      formData.append("file", file);

        const testCaseResponse = await fetch(`http://localhost:8080/generate-ui-tests?gdpr_mode=${gdprMode}`, {
        method: "POST",
        body: formData,
      });

      if (!testCaseResponse.ok) {
        const errorText = await testCaseResponse.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to generate test cases: ${testCaseResponse.status} ${testCaseResponse.statusText}`);
      }

      const uiTestData: GenerateUITestsResponse = await testCaseResponse.json();
      
      // Debug: Check if each test case has unique traceability data
      console.log("🔍 Debugging traceability data from API:");
      uiTestData.test_suite.test_categories.forEach((category, catIndex) => {
        console.log(`Category ${catIndex + 1} (${category.category_name}):`);
        category.test_cases.forEach((testCase, tcIndex) => {
          console.log(`  Test Case ${tcIndex + 1} (${testCase.title}):`, {
            requirement_id: testCase.traceability?.requirement_id,
            requirement_text: testCase.traceability?.requirement_text?.substring(0, 50) + "...",
            pdf_locations_count: testCase.traceability?.pdf_locations?.length || 0
          });
        });
      });
      
      const generationEnd =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const generationSeconds = (generationEnd - generationStart) / 1000;

      // Step 6: UI Enrichment
      updateProcessingMessage(
        processingMessageId,
        "🎨 Enriching UI data..."
      );
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Transform the response to match the existing structure
      const transformedData = transformUITestResponse(uiTestData);

      // Step 7: Complete processing
      const documentSummary = `Document "${file.name}" processed with enhanced AI pipeline`;
      const latencyInfo = `✨ Generated in ${generationSeconds.toFixed(1)} seconds.`;
      const statsInfo = `📊 ${uiTestData.test_suite.statistics.total_tests} test cases across ${uiTestData.test_suite.statistics.total_categories} categories`;
      const complianceInfo = `🛡️ ${uiTestData.test_suite.statistics.compliance_coverage}% compliance coverage`;
      const finalContent = `${documentSummary}. ${statsInfo}. ${complianceInfo}.\n${latencyInfo}`;
      
      completeProcessingMessage(
        processingMessageId,
        finalContent,
        transformedData
      );

      return {
        documentText: `Enhanced document processing with ${uiTestData.test_suite.pdf_outline.total_pages} pages`,
        testCases: transformedData,
        fileName: file.name,
        enhancedData: uiTestData, // Store the full enhanced data
      };
    } catch (error) {
      console.error("Error processing file:", error);
      
      // Check if it's a connection error to the external API
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        completeProcessingMessage(
          processingMessageId,
          "❌ Cannot connect to the test generation API. Please check your internet connection and try again."
        );
      } else {
        completeProcessingMessage(
          processingMessageId,
          "❌ Failed to process document and generate test cases. Please try again."
        );
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Transform the new response format to match existing structure
  const transformUITestResponse = (uiTestData: GenerateUITestsResponse) => {
    console.log("🔄 Transforming UI test response...");
    
    const categories = uiTestData.test_suite.test_categories.map((category, categoryIndex) => ({
      id: `category_${categoryIndex + 1}`,
      label: category.category_name,
      description: `Enhanced ${category.category_name} with ${category.total_tests} test cases`,
      testCases: category.test_cases.map((testCase, testCaseIndex) => {
        console.log(`📝 Mapping test case: ${testCase.title}`, {
          original_traceability: testCase.traceability,
          requirement_id: testCase.traceability?.requirement_id
        });
        
        return {
          id: testCase.test_id,
          title: testCase.title,
          content: `${testCase.description}\n\nExpected Result: ${testCase.expected_result}\n\nSteps:\n${testCase.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
          priority: testCase.priority,
          status: testCase.status,
          traceability: testCase.traceability,
          compliance_tags: testCase.compliance_tags,
          tooltip: testCase.tooltip,
          metadata: testCase.metadata,
        };
      }),
    }));

    return {
      documentSummary: `Enhanced test generation for ${uiTestData.filename}`,
      categories,
      statistics: uiTestData.test_suite.statistics,
      knowledge_graph: uiTestData.knowledge_graph,
      pipeline_metadata: uiTestData.pipeline_metadata,
    };
  };

  const handleMessageSubmit = async (message: string, file?: File, gdprMode?: boolean) => {
    try {
      const currentChatId = chatId || generateUniqueId("chat_");

      // Add user message first
      console.log("NextAuth session.user:", session?.user);
      addUserMessage(currentChatId, message, file, session?.user);

      // Immediately scroll after adding the user message
      setTimeout(scrollToBottom, 0);
      forceScrollToBottom();

      if (file) {
        // Add processing message for file uploads
        const processingMessage = addProcessingMessage(
          currentChatId,
          "🚀 Starting document processing..."
        );

        // Process the file asynchronously
        processFileAndGenerateTestCases(
          file,
          message,
          currentChatId,
          processingMessage.id,
          gdprMode || true
        );
      } else {
        // For text-only messages, just add a simple response
        addChatResponse(currentChatId, message);
      }

      // Navigate to chat if we're not already there
      if (!chatId) {
        router.push(`/a/chat/${currentChatId}`);
      }
    } catch (error) {
      console.error("Error in handleMessageSubmit:", error);
      showToastError("Failed to send message");
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
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [
    chatId,
    chatResponses,
    getChatResponsesByChatId,
    getTestCategoriesByChatResponseId,
    getTestCasesByTestCategoryId,
  ]);

  // Multiple scroll triggers to ensure it works
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    scrollToBottom();
    forceScrollToBottom();
  }, [curChatResponses]);

  // Also scroll when chat ID changes (new conversation)
  useEffect(() => {
    scrollToBottom();
    forceScrollToBottom();
  }, [chatId]);

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
                    src={`/api/proxy-image?url=${encodeURIComponent(
                      session.user.image
                    )}`}
                    alt={session.user.name || "User"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement)
                        .parentElement;
                      if (parent) {
                        const span = document.createElement("span");
                        span.textContent = (
                          session?.user?.name?.charAt(0) || "U"
                        ).toUpperCase();
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span>
                    {(session?.user?.name?.charAt(0) || "U").toUpperCase()}
                  </span>
                )}
              </div>
              <button
                className="topbar__logout topbar__logout--gradient"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
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
