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
        <header className="select-test-category-step__header">
          {/* // todo add pie chart here */}
          <h5 className="select-test-category-step__header__title">
            Generated {totalCategories} test {totalCategories === 1 ? 'category' : 'categories'} with {totalTestCases} total test cases. 
            Average of {avgTestCasesPerCategory} test {avgTestCasesPerCategory === 1 ? 'case' : 'cases'} per category. 
            Select a category below to review and manage the test cases.
          </h5>
        </header>
        <main className="select-test-category-step__main">
          <div className="test-category-cards">
            {data.map((category) => (
              <TestCategoryCards
                key={category.id}
                data={category}
                onSelect={selectTestCategory}
              />
            ))}
          </div>
        </main>
        <footer className="select-test-category-step__footer"></footer>
      </div>
    </section>
  );
};

export default SelectTestCategoryStep;
