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

  return (
    <section className="select-test-category-step">
      <div className="select-test-category-step__container">
        <header className="select-test-category-step__header">
          {/* // todo add pie chart here */}
          <h5 className="select-test-category-step__header__title">
            Aliquip irure officia Lorem non aute eiusmod ex aute Lorem officia
            nulla. Velit dolore in minim incididunt consectetur ut quis eiusmod.
            Fugiat quis excepteur minim sit ipsum. Lorem aute laborum
            adipisicing velit elit incididunt ullamco commodo sint do nulla.
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
