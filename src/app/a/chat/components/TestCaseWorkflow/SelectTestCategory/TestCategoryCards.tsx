"use client";

import React from "react";
import "./_test_category_cards.scss";
import {
  TestCategory,
  TestCase,
  TestCaseStatus,
  useChat,
} from "../../../context/ChatContext";

interface TestCategoryCardsProps {
  data: TestCategory & { testCases: Array<TestCase> };
  onSelect: (
    testCategory: TestCategory & { testCases: Array<TestCase> }
  ) => void;
}

const TestCategoryCards: React.FC<TestCategoryCardsProps> = ({
  data,
  onSelect,
}) => {
  const { getTestCasesByTestCategoryId } = useChat();
  const testCases = getTestCasesByTestCategoryId(data.id);

  // Get category type for styling
  const getCategoryType = (label: string) => {
    const lowercaseLabel = label.toLowerCase();
    if (lowercaseLabel.includes("functional")) return "functional";
    if (lowercaseLabel.includes("performance")) return "performance";
    if (lowercaseLabel.includes("security")) return "security";
    if (lowercaseLabel.includes("ui") || lowercaseLabel.includes("ux"))
      return "ui-ux";
    if (lowercaseLabel.includes("integration")) return "integration";
    if (lowercaseLabel.includes("api")) return "api";
    if (lowercaseLabel.includes("compliance")) return "compliance";
    return "default";
  };

  const categoryType = getCategoryType(data.label);

  const calculateStats = (testCases: Array<TestCase>) => {
    const total = testCases.length;
    const approved = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.APPROVED
    ).length;
    const exported = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.EXPORTED
    ).length;
    const pending = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.PENDING
    ).length;
    const rejected = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.REJECTED
    ).length;

    return { approved, exported, pending, rejected, total };
  };
  const { approved, exported, pending, rejected, total } =
    calculateStats(testCases);

  const getProgressPercentage = () => {
    return total > 0
      ? Math.round(((approved + exported + rejected) / total) * 100)
      : 0;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <button
      onClick={() => onSelect({ ...data, testCases })}
      key={data.id}
      className={`test-category-card test-category-card--${categoryType}`}
    >
      <div className="test-category-card__header">
        <h3 className="test-category-card__title test-category-card__title--inline">
          {data.label}
        </h3>
        <div className="test-category-card__count-badge">{total}</div>
      </div>

      <div className="test-category-card__content">
        <p className="test-category-card__description">{data.description}</p>

        <div className="test-category-card__progress">
          <div className="test-category-card__progress-header">
            <span className="test-category-card__progress-label">Progress</span>
            <span className="test-category-card__progress-percentage">
              {progressPercentage}%
            </span>
          </div>
          <div className="test-category-card__progress-bar">
            <div
              className="test-category-card__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="test-category-card__footer">
        <div className="test-category-card__status-grid">
          <div className="test-category-card__status-item test-category-card__status-item--approved">
            <div className="test-category-card__status-dot test-category-card__status-dot--approved"></div>
            <div className="test-category-card__status-info">
              <span className="test-category-card__status-number">
                {approved}
              </span>
              <span className="test-category-card__status-label">Approved</span>
            </div>
          </div>
          <div className="test-category-card__status-item test-category-card__status-item--pending">
            <div className="test-category-card__status-dot test-category-card__status-dot--pending"></div>
            <div className="test-category-card__status-info">
              <span className="test-category-card__status-number">
                {pending}
              </span>
              <span className="test-category-card__status-label">Pending</span>
            </div>
          </div>
          <div className="test-category-card__status-item test-category-card__status-item--rejected">
            <div className="test-category-card__status-dot test-category-card__status-dot--rejected"></div>
            <div className="test-category-card__status-info">
              <span className="test-category-card__status-number">
                {rejected}
              </span>
              <span className="test-category-card__status-label">Rejected</span>
            </div>
          </div>
          <div className="test-category-card__status-item test-category-card__status-item--exported">
            <div className="test-category-card__status-dot test-category-card__status-dot--exported"></div>
            <div className="test-category-card__status-info">
              <span className="test-category-card__status-number">
                {exported}
              </span>
              <span className="test-category-card__status-label">Exported</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default TestCategoryCards;
