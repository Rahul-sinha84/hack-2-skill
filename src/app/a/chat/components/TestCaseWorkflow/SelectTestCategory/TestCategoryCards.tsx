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
        <div className="test-category-card__stats">
          <div className="test-category-card__stat-group">
            <div className="test-category-card__stat-group__title">Total</div>
            <div className="test-category-card__stat-group__items">
              <div className="test-category-card__stat-item test-category-card__stat-item--total">
                <span className="test-category-card__stat-number">{total}</span>
                <span className="test-category-card__stat-label">Total</span>
              </div>
            </div>
          </div>

          <div className="test-category-card__stat-group">
            <div className="test-category-card__stat-group__title">Status</div>
            <div className="test-category-card__stat-group__items">
              {approved > 0 && (
                <div className="test-category-card__stat-item test-category-card__stat-item--approved">
                  <span className="test-category-card__stat-number">
                    {approved}
                  </span>
                  <span className="test-category-card__stat-label">
                    Approved
                  </span>
                </div>
              )}

              {pending > 0 && (
                <div className="test-category-card__stat-item test-category-card__stat-item--pending">
                  <span className="test-category-card__stat-number">
                    {pending}
                  </span>
                  <span className="test-category-card__stat-label">
                    Pending
                  </span>
                </div>
              )}

              {rejected > 0 && (
                <div className="test-category-card__stat-item test-category-card__stat-item--rejected">
                  <span className="test-category-card__stat-number">
                    {rejected}
                  </span>
                  <span className="test-category-card__stat-label">
                    Rejected
                  </span>
                </div>
              )}
            </div>
          </div>

          {exported > 0 && (
            <div className="test-category-card__stat-group">
              <div className="test-category-card__stat-group__title">
                Exported
              </div>
              <div className="test-category-card__stat-group__items">
                <div className="test-category-card__stat-item test-category-card__stat-item--exported">
                  <span className="test-category-card__stat-number">
                    {exported}
                  </span>
                  <span className="test-category-card__stat-label">
                    Exported
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default TestCategoryCards;
