import React from "react";
import { TestCase, TestCaseStatus } from "../../../../context/ChatContext";
import "./_test_case_list.scss";

interface TestCaseListProps {
  testCases: TestCase[];
  title: string;
  showCategory?: boolean;
  categories?: Array<{ id: string; label: string }>;
}

const TestCaseList: React.FC<TestCaseListProps> = ({
  testCases,
  title,
  showCategory = false,
  categories = [],
}) => {
  const getCategoryLabel = (testCase: TestCase) => {
    if (!showCategory) return null;
    const category = categories.find(
      (cat) => cat.id === testCase.testCategoryId
    );
    return category?.label || "Unknown Category";
  };

  if (testCases.length === 0) {
    return (
      <div className="test-case-list test-case-list--empty">
        <div className="empty-icon">📝</div>
        <p>No test cases to display</p>
      </div>
    );
  }

  return (
    <div className="test-case-list">
      <div className="test-case-list__header">
        <h4 className="test-case-list__title">{title}</h4>
        <span className="test-case-list__count">({testCases.length})</span>
      </div>

      <div className="test-case-list__items">
        {testCases.map((testCase, index) => (
          <div key={testCase.id} className="test-case-item">
            <div className="test-case-item__number">{index + 1}</div>

            <div className="test-case-item__content">
              <div className="test-case-item__header">
                <h5 className="test-case-item__title">{testCase.title}</h5>
                <div className="test-case-item__badges">
                  {testCase.status === TestCaseStatus.EXPORTED && (
                    <span className="test-case-item__status test-case-item__status--exported">
                      ✓ Exported
                    </span>
                  )}
                  {showCategory && (
                    <span className="test-case-item__category">
                      {getCategoryLabel(testCase)}
                    </span>
                  )}
                </div>
              </div>

              <p className="test-case-item__description">{testCase.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestCaseList;
