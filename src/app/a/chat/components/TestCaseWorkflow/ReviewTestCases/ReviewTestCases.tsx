import React, { useState } from "react";
import { CommonProps, Steps } from "..";
import { IoIosArrowBack } from "react-icons/io";
import { AmendTestCase, TestCasesContainer } from ".";

import "./_review_test_cases.scss";
import { TestCase, useChat } from "../../../context/ChatContext";
import PDFViewer from "@/components/PdfModule/PdfViewer";

const ReviewTestCases = ({
  data,
  curStep,
  setCurStep,
  selectedTestCategory,
  setSelectedTestCategory,
}: CommonProps) => {
  const { currentFile } = useChat();

  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null
  );

  console.log("selectedTestCase ", selectedTestCase);

  const selectTestCase = (testcase: TestCase) => {
    setSelectedTestCase(testcase);
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
        </header>
        <main className="review-test-cases__main">
          <div className="review-test-cases__main__pdf-container">
            {currentFile?.file ? (
              <PDFViewer
                pdfUrl={URL.createObjectURL(currentFile.file)}
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
            ) : null}
          </div>
          <div className="review-test-cases__main__test-case-container">
            <TestCasesContainer
              testCategoryId={selectedTestCategory!.id}
              onSelect={selectTestCase}
            />
          </div>
          {/* <div className="review-test-cases__main__left">
            <AmendTestCase
              data={selectedTestCase}
              testCategory={selectedTestCategory!}
            />
          </div>
          <div className="review-test-cases__main__right">
          </div> */}
        </main>
        <footer className="review-test-cases__footer"></footer>
      </div>
    </section>
  );
};

export default ReviewTestCases;
