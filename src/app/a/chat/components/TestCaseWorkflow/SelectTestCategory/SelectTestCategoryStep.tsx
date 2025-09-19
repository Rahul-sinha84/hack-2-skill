import React, { useState } from "react";
import { CommonProps, Steps } from "..";
import { TestCategoryCards } from ".";

import "./_select_test_category_step.scss";
import { TestCategory } from "../../../context/ChatContext";

const SelectTestCategoryStep = ({
  data,
  curStep,
  setCurStep,
  setSelectedTestCategory,
}: CommonProps) => {
  const selectTestCategory = (testCategory: TestCategory) => {
    setSelectedTestCategory(testCategory);
    setCurStep(Steps.REVIEW_TEST_CASES);
  };

  // Calculate statistics from the data
  const totalCategories = data.length;
  const totalTestCases = data.reduce((sum, category) => sum + category.testCases.length, 0);
  const avgTestCasesPerCategory = totalCategories > 0 ? Math.round(totalTestCases / totalCategories) : 0;

  return (
    <section className="select-test-category-step">
      <div className="select-test-category-step__container">
        <div className="select-test-category-step__layout">
          {/* Summary Section */}
          <aside className="select-test-category-step__summary">
            <div className="summary-card">
              <div className="summary-card__header">
                <h3 className="summary-card__title">Test Overview</h3>
                <div className="summary-card__badge">{totalCategories} Categories</div>
              </div>
              
              <div className="summary-card__stats">
                <div className="stat-item">
                  <div className="stat-item__value">{totalTestCases}</div>
                  <div className="stat-item__label">Total Test Cases</div>
                </div>
                <div className="stat-item">
                  <div className="stat-item__value">{avgTestCasesPerCategory}</div>
                  <div className="stat-item__label">Avg per Category</div>
                </div>
              </div>

              <div className="summary-card__categories">
                <h4 className="categories-title">Categories Breakdown</h4>
                <div className="categories-list">
                  {data.map((category, index) => (
                    <div key={category.id} className="category-summary-item">
                      <div className="category-summary-item__icon">
                        {index + 1}
                      </div>
                      <div className="category-summary-item__info">
                        <div className="category-summary-item__name">{category.label}</div>
                        <div className="category-summary-item__count">
                          {category.testCases.length} test cases
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="summary-card__footer">
                <p className="summary-card__instruction">
                  Select a category card to review and manage test cases
                </p>
              </div>
            </div>
          </aside>

          {/* Cards Section */}
          <main className="select-test-category-step__main">
            <div className="main-section-header">
              <h3 className="main-section-title">Test Categories</h3>
              <p className="main-section-subtitle">Click on any category to explore detailed test cases</p>
            </div>
            <div className="test-category-cards test-category-cards--compact">
              {data.map((category) => (
                <TestCategoryCards
                  key={category.id}
                  data={category}
                  onSelect={selectTestCategory}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default SelectTestCategoryStep;
