import React, { useState } from "react";
import { CommonProps, Steps } from "..";
import { IoIosArrowBack } from "react-icons/io";
import { AmendTestCase, TestCasesContainer } from ".";
import { PDFSplitView } from "@/components/PDFHighlighter";
import { useChat } from "../../../context/ChatContext";

import "./_review_test_cases.scss";
import { TestCase } from "../../../context/ChatContext";

const ReviewTestCases = ({
  data,
  curStep,
  setCurStep,
  selectedTestCategory,
  setSelectedTestCategory,
}: CommonProps) => {
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null
  );
  const [showPDFView, setShowPDFView] = useState(false);
  const { chatResponses } = useChat();

  const selectTestCase = (testcase: TestCase) => {
    setSelectedTestCase(testcase);
  };

  // Get the PDF file from the chat responses
  const pdfFile = chatResponses.find(
    (response) => response.uploadedPDF && response.messageType === "user"
  )?.uploadedPDF;

  // Get test cases for the selected category
  const testCases = selectedTestCategory?.testCases || [];

  const handleTestCaseSelect = (testCaseId: string) => {
    const testCase = testCases.find((tc) => tc.id === testCaseId);
    if (testCase) {
      setSelectedTestCase(testCase);
    }
  };

  const handleHighlightClick = (data: any) => {
    console.log("Highlight clicked:", data);
  };

  return (
    <section className="review-test-cases">
      <div className="review-test-cases__container">
        <header className="review-test-cases__header">
          <div className="review-test-cases__header__back-btn">
            <button onClick={() => setCurStep(Steps.SELECT_TEST_CATEGORY)}>
              <IoIosArrowBack />
            </button>
          </div>
          <h3 className="review-test-cases__header__title">
            {selectedTestCategory?.label}
          </h3>
          {pdfFile && (
            <div className="review-test-cases__header__actions">
              <button
                className="review-test-cases__pdf-toggle"
                onClick={() => setShowPDFView(!showPDFView)}
              >
                {showPDFView ? "Hide PDF" : "View PDF"}
              </button>
            </div>
          )}
        </header>
        <main className="review-test-cases__main">
          {showPDFView && pdfFile ? (
            <div className="review-test-cases__pdf-view">
              <PDFSplitView
                pdfFile={pdfFile}
                testCases={testCases}
                selectedTestCaseId={selectedTestCase?.id}
                onTestCaseSelect={handleTestCaseSelect}
                onHighlightClick={handleHighlightClick}
              />
            </div>
          ) : (
            <>
              <div className="review-test-cases__main__left">
                <AmendTestCase
                  data={selectedTestCase}
                  testCategory={selectedTestCategory!}
                />
              </div>
              <div className="review-test-cases__main__right">
                <TestCasesContainer
                  testCategoryId={selectedTestCategory!.id}
                  onSelect={selectTestCase}
                />
              </div>
            </>
          )}
        </main>
        <footer className="review-test-cases__footer"></footer>
      </div>
    </section>
  );
};

export default ReviewTestCases;
