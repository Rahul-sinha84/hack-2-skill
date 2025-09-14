import React, { useState } from "react";

import "./_test_cases_container.scss";
import { TestCase } from "../../../context/ChatContext";
import { TestCaseCard } from ".";

interface TestCasesContainerProps {
  data: Array<TestCase>;
  onSelect: (testcase: TestCase) => void;
}

const TestCasesContainer = ({ data, onSelect }: TestCasesContainerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelection = (testcase: TestCase) => {
    setSelectedId(testcase.id);
    onSelect(testcase);
  };

  return (
    <section className="test-cases-container">
      <div className="test-cases-container__container">
        <header className="test-cases-container__header"></header>
        <main className="test-cases-container__main">
          <ul className="test-cases-card-container">
            {data.map((testcase) => (
              <li key={testcase.id}>
                <input
                  type="radio"
                  name="test-case-selection"
                  id={testcase.id}
                  checked={selectedId === testcase.id}
                  onChange={() => handleSelection(testcase)}
                />

                <label
                  htmlFor={testcase.id}
                  tabIndex={0}
                  onClick={() => handleSelection(testcase)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelection(testcase);
                    }
                  }}
                >
                  <TestCaseCard data={testcase} />
                </label>
              </li>
            ))}
          </ul>
        </main>
        <footer className="test-cases-container__footer"></footer>
      </div>
    </section>
  );
};

export default TestCasesContainer;
