import React, { useState } from "react";

import "./_test_cases_container.scss";
import {
  TestCase,
  TestCaseStatus,
  useChat,
} from "../../../context/ChatContext";
import { TestCaseCard } from ".";

interface TestCasesContainerProps {
  testCategoryId: string;
  onSelect: (testcase: TestCase) => void;
  selectedTestCase: TestCase | null;
}

const TestCasesContainer = ({
  testCategoryId,
  onSelect,
  selectedTestCase,
}: TestCasesContainerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { getTestCasesByTestCategoryId } = useChat();

  const testCases = getTestCasesByTestCategoryId(testCategoryId);

  const handleSelection = (testcase: TestCase) => {
    // Don't allow selection of exported test cases
    if (testcase.status === TestCaseStatus.EXPORTED) {
      return;
    }
    setSelectedId(testcase.id);
    onSelect(testcase);
  };

  return (
    <section className="test-cases-container">
      <div className="test-cases-container__container">
        <header className="test-cases-container__header"></header>
        <main className="test-cases-container__main">
          <ul className="test-cases-card-container">
            {testCases.map((testcase) => {
              const isExported = testcase.status === TestCaseStatus.EXPORTED;
              return (
                <li key={testcase.id}>
                  <input
                    type="radio"
                    name="test-case-selection"
                    id={testcase.id}
                    checked={selectedId === testcase.id}
                    disabled={isExported}
                    onChange={() => handleSelection(testcase)}
                  />

                  <label
                    htmlFor={testcase.id}
                    tabIndex={isExported ? -1 : 0}
                    className={`test-case-status-${
                      testcase.status === TestCaseStatus.APPROVED
                        ? "approved"
                        : testcase.status === TestCaseStatus.PENDING
                        ? "pending"
                        : testcase.status === TestCaseStatus.EXPORTED
                        ? "exported"
                        : "rejected"
                    }`}
                    onClick={() => handleSelection(testcase)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelection(testcase);
                      }
                    }}
                  >
                    <TestCaseCard
                      data={testcase}
                      selectedTestCase={selectedTestCase}
                    />
                  </label>
                </li>
              );
            })}
          </ul>
        </main>
        <footer className="test-cases-container__footer"></footer>
      </div>
    </section>
  );
};

export default TestCasesContainer;
