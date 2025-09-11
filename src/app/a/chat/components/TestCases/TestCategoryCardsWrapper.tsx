import React from "react";
import { TestCase, TestCategory } from "../../context/ChatContext";
import TestCategoryCards from "./TestCategoryCards";
import "./_test_category_cards_wrapper.scss";

interface TestCategoryCardsWrapperProps {
  data: Array<TestCategory & { testCases: Array<TestCase> }>;
}

const TestCategoryCardsWrapper: React.FC<TestCategoryCardsWrapperProps> = ({
  data,
}) => {
  return (
    <section className="test-category-cards-wrapper">
      <div className="test-category-cards-wrapper__container">
        <header className="test-category-cards-wrapper__header">
          <h5 className="test-category-cards-wrapper__header__title">
            Aliquip irure officia Lorem non aute eiusmod ex aute Lorem officia
            nulla. Velit dolore in minim incididunt consectetur ut quis eiusmod.
            Fugiat quis excepteur minim sit ipsum. Lorem aute laborum
            adipisicing velit elit incididunt ullamco commodo sint do nulla.
          </h5>
        </header>
        <main className="test-category-cards-wrapper__main">
          {/* // todo: show a pie chart here. */}
          <TestCategoryCards data={data} />
        </main>
        <footer className="test-category-cards-wrapper__footer"></footer>
      </div>
    </section>
  );
};

export default TestCategoryCardsWrapper;
