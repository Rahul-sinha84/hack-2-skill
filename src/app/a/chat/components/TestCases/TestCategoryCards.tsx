"use client";

import React from "react";
import "./_test_category_cards.scss";
import {
  TestCategory,
  TestCase,
  TestCaseStatus,
} from "../../context/ChatContext";

interface TestCategoryCardsProps {
  data: Array<TestCategory & { testCases: Array<TestCase> }>;
}

const TestCategoryCards: React.FC<TestCategoryCardsProps> = ({ data }) => {
  const calculateProgress = (testCases: Array<TestCase>) => {
    const total = testCases.length;
    const approved = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.APPROVED
    ).length;
    return { approved, total };
  };

  const getProgressPercentage = (approved: number, total: number) => {
    if (total === 0) return 0;
    return (approved / total) * 100;
  };

  return (
    <div className="test-category-cards">
      {data.map((category) => {
        const { approved, total } = calculateProgress(category.testCases);
        const progressPercentage = getProgressPercentage(approved, total);

        return (
          <div key={category.id} className="test-category-card">
            <div className="test-category-card__header">
              <h3 className="test-category-card__title">{category.label}</h3>
              <div className="test-category-card__count">
                <span className="test-category-card__count-number">
                  {total}
                </span>
              </div>
            </div>

            <div className="test-category-card__content">
              <p className="test-category-card__description">
                {category.description}
              </p>
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
          </div>
        );
      })}
    </div>
  );
};

export default TestCategoryCards;
