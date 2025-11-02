"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CommonProps, Steps } from "..";
import { IoIosArrowBack } from "react-icons/io";
import { AmendTestCase, TestCasesContainer } from ".";

import "./_review_test_cases.scss";
import { TestCase, useChat } from "../../../context/ChatContext";
import PDFErrorBoundary from "./PDFErrorBoundary";

// Dynamically import PDFViewer with SSR disabled to prevent window/document errors during build
// Add loading component to handle race conditions on first load
const PDFViewer = dynamic(() => import("@/components/PdfModule/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: "20px",
      }}
    >
      <div>Loading PDF viewer...</div>
    </div>
  ),
});

const ReviewTestCases = ({
  data,
  curStep,
  setCurStep,
  selectedTestCategory,
  setSelectedTestCategory,
  setModalTitleComponent,
}: CommonProps) => {
  const { currentFile } = useChat();

  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Use refs to track blob URL and file identity to prevent premature revocation
  const blobUrlRef = useRef<string | null>(null);
  const fileKeyRef = useRef<string | null>(null);
  const revokeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure component is mounted before rendering PDF (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create stable file key to detect actual file changes (not just reference changes)
  const getFileKey = (file: File | null): string | null => {
    if (!file) return null;
    return `${file.name}-${file.size}-${file.lastModified}`;
  };

  // Manage blob URL lifecycle - only create new URL when file actually changes
  useEffect(() => {
    const currentFileKey = getFileKey(currentFile?.file || null);

    // If file hasn't actually changed, keep existing blob URL
    if (currentFileKey === fileKeyRef.current && blobUrlRef.current) {
      return;
    }

    // Clear any pending revocation timeout
    if (revokeTimeoutRef.current) {
      clearTimeout(revokeTimeoutRef.current);
      revokeTimeoutRef.current = null;
    }

    // Store old blob URL for delayed cleanup
    const oldBlobUrl = blobUrlRef.current;

    // Create new blob URL for new file first (before revoking old one)
    if (currentFile?.file && currentFileKey) {
      try {
        const newBlobUrl = URL.createObjectURL(currentFile.file);
        blobUrlRef.current = newBlobUrl;
        fileKeyRef.current = currentFileKey;
        setPdfUrl(newBlobUrl);

        // Revoke old blob URL after a delay to ensure PdfLoader has finished using it
        if (oldBlobUrl) {
          revokeTimeoutRef.current = setTimeout(() => {
            URL.revokeObjectURL(oldBlobUrl);
            revokeTimeoutRef.current = null;
          }, 1000); // 1 second delay to allow any ongoing fetches to complete
        }
      } catch (error) {
        console.error("Error creating blob URL:", error);
        blobUrlRef.current = null;
        fileKeyRef.current = null;
        setPdfUrl(null);
        // Still revoke old URL even on error
        if (oldBlobUrl) {
          revokeTimeoutRef.current = setTimeout(() => {
            URL.revokeObjectURL(oldBlobUrl);
            revokeTimeoutRef.current = null;
          }, 1000);
        }
      }
    } else {
      // No file - just clean up and clear state
      fileKeyRef.current = null;
      setPdfUrl(null);
      if (oldBlobUrl) {
        revokeTimeoutRef.current = setTimeout(() => {
          URL.revokeObjectURL(oldBlobUrl);
          revokeTimeoutRef.current = null;
        }, 1000);
        blobUrlRef.current = null;
      }
    }
  }, [currentFile?.file, currentFile?.fileName]);

  // Cleanup blob URL only on unmount
  useEffect(() => {
    return () => {
      // Clear any pending revocation timeout
      if (revokeTimeoutRef.current) {
        clearTimeout(revokeTimeoutRef.current);
        revokeTimeoutRef.current = null;
      }
      // Immediately revoke blob URL on unmount
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const selectTestCase = (testcase: TestCase) => {
    setSelectedTestCase(testcase);
  };

  return (
    <section className="review-test-cases">
      <div className="review-test-cases__container">
        {/* <header className="review-test-cases__header">
          <div className="review-test-cases__header__back-btn">
            <button onClick={() => setCurStep(Steps.SELECT_TEST_CATEGORY)}>
              <IoIosArrowBack />
            </button>
          </div>
          <h3 className="review-test-cases__header__title">
            {selectedTestCategory?.label}
          </h3>
        </header> */}
        <main className="review-test-cases__main">
          <div className="review-test-cases__main__test-case-container">
            <div className="test-cases-list">
              <TestCasesContainer
                testCategoryId={selectedTestCategory!.id}
                onSelect={selectTestCase}
                selectedTestCase={selectedTestCase}
              />
            </div>
            {selectedTestCase ? (
              <div className="test-case-container">
                <AmendTestCase
                  data={selectedTestCase}
                  testCategory={selectedTestCategory!}
                />
              </div>
            ) : null}
          </div>
          <div className="review-test-cases__main__pdf-container">
            {isMounted && currentFile?.file && pdfUrl ? (
              <PDFErrorBoundary
                onError={(error) => {
                  console.error("PDF Viewer Error:", error);
                }}
              >
                <PDFViewer
                  pdfUrl={pdfUrl}
                  highlightData={
                    selectedTestCase
                      ? [
                          {
                            page_number:
                              selectedTestCase.traceability.page_number,
                            bounding_box:
                              selectedTestCase.traceability?.bounding_box,
                            chunk_id: selectedTestCase.traceability?.chunk_id,
                          },
                        ]
                      : []
                  }
                  scrollToHighlightId={
                    selectedTestCase?.traceability?.chunk_id ?? ""
                  }
                />
              </PDFErrorBoundary>
            ) : !isMounted ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  padding: "20px",
                }}
              >
                <div>Initializing PDF viewer...</div>
              </div>
            ) : null}
          </div>
        </main>
        <footer className="review-test-cases__footer"></footer>
      </div>
    </section>
  );
};

export default ReviewTestCases;
