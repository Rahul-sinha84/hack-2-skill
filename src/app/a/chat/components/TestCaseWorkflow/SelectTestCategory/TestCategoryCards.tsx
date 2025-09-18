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

  const calculateProgress = (testCases: Array<TestCase>) => {
    const total = testCases.length;
    const approved = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.APPROVED
    ).length;
    return { approved, total };
  };
  const { approved, total } = calculateProgress(testCases);

  const getProgressPercentage = (approved: number, total: number) => {
    if (total === 0) return 0;
    return (approved / total) * 100;
  };

  const progressPercentage = getProgressPercentage(approved, total);

  return (
    <button
      onClick={() => onSelect({ ...data, testCases })}
      key={data.id}
      className="test-category-card"
    >
      <div className="test-category-card__header">
        <h3 className="test-category-card__title">{data.label}</h3>
        <div className="test-category-card__count">
          <span className="test-category-card__count-number">{total}</span>
        </div>
      </div>

      <div className="test-category-card__content">
        <p className="test-category-card__description">{data.description}</p>
      </div>

      <div className="test-category-card__footer">
        <div className="test-category-card__progress-text">
          {approved} of {total} approved
        </div>
        <div className="test-category-card__progress-bar">
          <div
            className="test-category-card__progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default TestCategoryCards;
