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
import { VertexAgentResponse } from "@/types/vertex-agent-response";
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
    setCurrentFile,
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
  const chatLayoutRef = useRef<HTMLElement>(null);

  const scrollToBottom = () => {
    // Scroll the window/document instead of a container
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Force scroll to bottom with multiple delays to catch rendering
  const forceScrollToBottom = () => {
    const scrollToEnd = () => {
      // Scroll the window/document to the bottom
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "auto", // Use auto for instant scroll in delayed calls
        });
      }
    };

    // Multiple delayed scrolls to catch different rendering phases
    setTimeout(scrollToEnd, 0);
    setTimeout(scrollToEnd, 100);
    setTimeout(scrollToEnd, 300);
    setTimeout(scrollToEnd, 500);
    setTimeout(scrollToEnd, 800);
    setTimeout(scrollToEnd, 1200);
  };

  const processFileAndGenerateTestCases = async (
    file: File,
    userQuery: string,
    chatId: string,
    processingMessageId: string,
    gdprMode: boolean = true
  ) => {
    try {
      // Only use mock tests if explicitly disabled via NEXT_PUBLIC_LIVE=false
      // This allows testing the real API in development
      const useMockTests = process.env.NEXT_PUBLIC_LIVE === "false";

      if (useMockTests) {
        // Start the actual API call immediately
        const generationStart =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        const testCaseResponse = await fetch("/api/auth/get-mock-test-cases", {
          method: "GET",
        });

        if (!testCaseResponse.ok) {
          const errorText = await testCaseResponse.text();
          console.error("API Error:", errorText);
          throw new Error(
            `Failed to generate test cases: ${testCaseResponse.status} ${testCaseResponse.statusText}`
          );
        }

        const responseData = await testCaseResponse.json();

        if (!responseData.success) {
          throw new Error(
            responseData.error || "Failed to generate test cases"
          );
        }

        const apiResponse: VertexAgentResponse =
          responseData.metadata.enhancedData;
        const transformedData = responseData.data;

        // Debug: Check the new response structure
        console.log("🔍 Debugging response from Vertex Agent API:");
        console.log("Response structure:", apiResponse);
        console.log(
          `Total tests: ${apiResponse.test_suite.statistics.total_tests}`
        );
        console.log(
          `Categories: ${apiResponse.test_suite.test_categories?.length || 0}`
        );
        console.log(
          `Knowledge graph nodes: ${
            apiResponse.knowledge_graph.metadata.total_nodes || 0
          }`
        );
        console.log(
          `Coverage score: ${
            apiResponse.coverage_analysis?.coverage_score || 0
          }`
        );

        const generationEnd =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        const generationSeconds = (generationEnd - generationStart) / 1000;

        // Step 6: Show real metrics from the response
        const totalPages = apiResponse.test_suite.pdf_outline?.total_pages || 0;
        const pagesWithReqs =
          apiResponse.test_suite.pdf_outline?.summary
            ?.pages_with_requirements || 0;
        const pagesWithPII =
          apiResponse.test_suite.pdf_outline?.summary?.pages_with_pii || 0;
        const totalTests = apiResponse.test_suite.statistics.total_tests;

        updateProcessingMessage(
          processingMessageId,
          `Analyzed ${totalPages} pages | Found ${pagesWithReqs} requirements | Detected ${pagesWithPII} PII instances | Generated ${totalTests} test cases`
        );
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Consistent with other stages

        // Step 7: Complete processing
        // Use the documentSummary from the transformed data (which includes real PDF analysis)
        const latencyInfo = `Generated in ${generationSeconds.toFixed(
          1
        )} seconds.`;
        const finalContent = `${transformedData.documentSummary}\n${latencyInfo}`;

        // Extract enhanced metadata for dashboard
        const enhancedMetadata = {
          coverageScore: apiResponse.coverage_analysis?.coverage_score || 0,
          complianceStandards:
            apiResponse.compliance_dashboard?.standards_coverage?.map(
              (standard) => ({
                standard_name: standard.standard_name,
                coverage: standard.coverage,
                status: standard.status,
              })
            ) || [],
          totalPages: apiResponse.test_suite.pdf_outline?.total_pages || 0,
          requirementsCount:
            apiResponse.test_suite.statistics?.requirements_covered || 0,
          pagesWithCompliance:
            apiResponse.test_suite.pdf_outline?.summary
              ?.pages_with_compliance || 0,
          pagesWithPII:
            apiResponse.test_suite.pdf_outline?.summary?.pages_with_pii || 0,
          pdfOutline: apiResponse.test_suite.pdf_outline
            ? {
                pages:
                  apiResponse.test_suite.pdf_outline.pages?.map((page) => ({
                    page_number: page.page_number,
                    has_requirements: page.has_requirements,
                    has_compliance: page.has_compliance,
                    has_pii: page.has_pii,
                  })) || [],
              }
            : undefined,
        };

        completeProcessingMessage(
          processingMessageId,
          finalContent,
          transformedData,
          enhancedMetadata
        );

        // Scroll after completing the response
        setTimeout(() => {
          scrollToBottom();
          forceScrollToBottom();
        }, 100);
        // Store the file data in context for PDF rendering
        setCurrentFile({
          file,
          documentText: transformedData.documentText,
          fileName: file.name,
          uploadedAt: new Date(),
        });

        return {
          documentText: `Enhanced document processing completed`,
          testCases: transformedData,
          fileName: file.name,
          enhancedData: apiResponse, // Store the full enhanced data
        };
      }

      setIsProcessing(true);

      // Start the actual API call immediately
      const generationStart =
        typeof performance !== "undefined" ? performance.now() : Date.now();

      // Use the secure PDF processor endpoint
      const formData = new FormData();
      formData.append("file", file);
      formData.append("gdpr_mode", gdprMode.toString());

      // Show progression stages while API is processing
      const stages = [
        "Processing document with Document AI...",
        "Analyzing document for sensitive data...",
        "Enhancing with RAG context...",
        "Building knowledge graph...",
        "Generating comprehensive test cases with Gemini AI...",
      ];

      let currentStage = 0;

      // Initial stage
      updateProcessingMessage(processingMessageId, stages[currentStage]);

      // Update stage every 5 seconds while API is processing
      const stageInterval = setInterval(() => {
        currentStage = (currentStage + 1) % stages.length;
        updateProcessingMessage(processingMessageId, stages[currentStage]);
      }, 5000); // Change stage every 5 seconds

      // Make the API call (this will take 30+ seconds)
      const testCaseResponse = await fetch(`/api/generate-ui-tests`, {
        method: "POST",
        body: formData,
      });

      // Clear the interval once API responds
      clearInterval(stageInterval);

      if (!testCaseResponse.ok) {
        const errorText = await testCaseResponse.text();
        console.error("API Error:", errorText);
        throw new Error(
          `Failed to generate test cases: ${testCaseResponse.status} ${testCaseResponse.statusText}`
        );
      }

      const responseData = await testCaseResponse.json();

      if (!responseData.success) {
        throw new Error(responseData.error || "Failed to generate test cases");
      }

      const apiResponse: VertexAgentResponse =
        responseData.metadata.enhancedData;
      const transformedData = responseData.data;

      // Debug: Check the new response structure
      console.log("🔍 Debugging response from Vertex Agent API:");
      console.log("Response structure:", apiResponse);
      console.log(
        `Total tests: ${apiResponse.test_suite.statistics.total_tests}`
      );
      console.log(
        `Categories: ${apiResponse.test_suite.test_categories?.length || 0}`
      );
      console.log(
        `Knowledge graph nodes: ${
          apiResponse.knowledge_graph.metadata.total_nodes || 0
        }`
      );
      console.log(
        `Coverage score: ${apiResponse.coverage_analysis?.coverage_score || 0}`
      );

      const generationEnd =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const generationSeconds = (generationEnd - generationStart) / 1000;

      // Step 6: Show real metrics from the response
      const totalPages = apiResponse.test_suite.pdf_outline?.total_pages || 0;
      const pagesWithReqs =
        apiResponse.test_suite.pdf_outline?.summary?.pages_with_requirements ||
        0;
      const pagesWithPII =
        apiResponse.test_suite.pdf_outline?.summary?.pages_with_pii || 0;
      const totalTests = apiResponse.test_suite.statistics.total_tests;

      updateProcessingMessage(
        processingMessageId,
        `Analyzed ${totalPages} pages | Found ${pagesWithReqs} requirements | Detected ${pagesWithPII} PII instances | Generated ${totalTests} test cases`
      );
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Consistent with other stages

      // Step 7: Complete processing
      // Use the documentSummary from the transformed data (which includes real PDF analysis)
      const latencyInfo = `Generated in ${generationSeconds.toFixed(
        1
      )} seconds.`;
      const finalContent = `${transformedData.documentSummary}\n${latencyInfo}`;

      // Extract enhanced metadata for dashboard
      const enhancedMetadata = {
        coverageScore: apiResponse.coverage_analysis?.coverage_score || 0,
        complianceStandards:
          apiResponse.compliance_dashboard?.standards_coverage?.map(
            (standard) => ({
              standard_name: standard.standard_name,
              coverage: standard.coverage,
              status: standard.status,
            })
          ) || [],
        totalPages: apiResponse.test_suite.pdf_outline?.total_pages || 0,
        requirementsCount:
          apiResponse.test_suite.statistics?.requirements_covered || 0,
        pagesWithCompliance:
          apiResponse.test_suite.pdf_outline?.summary?.pages_with_compliance ||
          0,
        pagesWithPII:
          apiResponse.test_suite.pdf_outline?.summary?.pages_with_pii || 0,
        pdfOutline: apiResponse.test_suite.pdf_outline
          ? {
              pages:
                apiResponse.test_suite.pdf_outline.pages?.map((page) => ({
                  page_number: page.page_number,
                  has_requirements: page.has_requirements,
                  has_compliance: page.has_compliance,
                  has_pii: page.has_pii,
                })) || [],
            }
          : undefined,
      };

      completeProcessingMessage(
        processingMessageId,
        finalContent,
        transformedData,
        enhancedMetadata
      );

      // Scroll after completing the response
      setTimeout(() => {
        scrollToBottom();
        forceScrollToBottom();
      }, 100);
      // Store the file data in context for PDF rendering
      setCurrentFile({
        file,
        documentText: transformedData.documentText,
        fileName: file.name,
        uploadedAt: new Date(),
      });

      return {
        documentText: `Enhanced document processing completed`,
        testCases: transformedData,
        fileName: file.name,
        enhancedData: apiResponse, // Store the full enhanced data
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

  const handleMessageSubmit = async (
    message: string,
    file?: File,
    gdprMode?: boolean
  ) => {
    try {
      const currentChatId = chatId || generateUniqueId("chat_");

      // Add user message first
      console.log("NextAuth session.user:", session?.user);
      addUserMessage(currentChatId, message, file, session?.user);

      // Immediately scroll after adding the user message
      scrollToBottom();
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
        scrollToBottom();
        forceScrollToBottom();
      }, 200);
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
    // Scroll when chat responses change
    setTimeout(() => {
      if (curChatResponses.length > 0) {
        scrollToBottom();
        forceScrollToBottom();
      }
    }, 100);
  }, [curChatResponses]);

  // Also scroll when chat ID changes (new conversation)
  useEffect(() => {
    if (chatId) {
      scrollToBottom();
      forceScrollToBottom();
    }
  }, [chatId]);

  return (
    <section className="chat__layout" ref={chatLayoutRef}>
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
                      if (parent && typeof document !== "undefined") {
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
            <div className="chat__layout__chats">
              <ChatResponses responses={curChatResponses} chatId={chatId} />
            </div>
          ) : (
            <div className="chat__layout__chats"></div>
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
