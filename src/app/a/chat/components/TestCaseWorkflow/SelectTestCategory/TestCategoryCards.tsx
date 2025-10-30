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

  // Get icon based on category type
  const getCategoryIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      functional: "/neural.png",
      performance: "/cpu.png",
      security: "/cyber-security.png",
      "ui-ux": "/shapes.png",
      integration: "/settings.png",
      api: "/abstract-shape.png",
      compliance: "/abstract-shape.png",
      default: "/abstract-shape.png",
    };

    const iconSrc = iconMap[type] || iconMap.default;

    return (
      <img
        src={iconSrc}
        alt={`${type} icon`}
        className="test-category-card__icon-image"
      />
    );
  };

  return (
    <button
      onClick={() => onSelect({ ...data, testCases })}
      key={data.id}
      className={`test-category-card test-category-card--${categoryType}`}
    >
      {/* Header with Icon + Title */}
      <div className="test-category-card__header">
        <div className="test-category-card__header-left">
          <div className="test-category-card__icon-wrapper">
            {getCategoryIcon(categoryType)}
          </div>
          <h2 className="test-category-card__title">{data.label}</h2>
        </div>
      </div>

      {/* Total Count Badge */}
      <div className="test-category-card__count-section">
        <span className="test-category-card__count-label">Total Cases</span>
        <p className="test-category-card__count-value">{total}</p>
      </div>

      {/* Stats Grid */}
      <div className="test-category-card__stats-grid">
        <div className="test-category-card__stat test-category-card__stat--approved">
          <span className="test-category-card__stat-label">Approved</span>
          <p className="test-category-card__stat-value">{approved}</p>
        </div>
        <div className="test-category-card__stat test-category-card__stat--rejected">
          <span className="test-category-card__stat-label">Rejected</span>
          <p className="test-category-card__stat-value">{rejected}</p>
        </div>
        <div className="test-category-card__stat test-category-card__stat--pending">
          <span className="test-category-card__stat-label">Pending</span>
          <p className="test-category-card__stat-value">{pending}</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="test-category-card__progress-section">
        <div className="test-category-card__progress-wrapper">
          <div className="test-category-card__progress-bar">
            <div
              className="test-category-card__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="test-category-card__progress-percentage">
            {progressPercentage}<span className="test-category-card__progress-percentage-symbol">%</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default TestCategoryCards;
