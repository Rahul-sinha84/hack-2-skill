import React, { JSX, useState } from "react";
import { TestCase, TestCategory } from "../../context/ChatContext";
import "./_test_case_workflow.scss";
import { CommonProps, Steps } from ".";
import { SelectTestCategoryStep } from "./SelectTestCategory";
import { ReviewTestCases } from "./ReviewTestCases";

interface TestCaseWorkflowProps {
  data: Array<TestCategory & { testCases: Array<TestCase> }>;
}

const TestCaseWorkflow: React.FC<TestCaseWorkflowProps> = ({ data }) => {
  const [curStep, setCurStep] = useState<Steps>(Steps.SELECT_TEST_CATEGORY);
  const [selectedTestCategory, setSelectedTestCategory] = useState<
    (TestCategory & { testCases: Array<TestCase> }) | null
  >(null);

  const commonProps: CommonProps = {
    data,
    curStep,
    setCurStep,
    selectedTestCategory,
    setSelectedTestCategory,
  };

  const renderSteps = (_curStep: Steps): JSX.Element => {
    switch (_curStep) {
      case Steps.SELECT_TEST_CATEGORY: {
        return <SelectTestCategoryStep {...commonProps} />;
      }
      case Steps.REVIEW_TEST_CASES: {
        return <ReviewTestCases {...commonProps} />;
      }

      default: {
        return <></>;
      }
    }
  };

  return (
    <section className="test-case-workflow">
      <div className="test-case-workflow__container">
        <header className="test-case-workflow__header"></header>
        <main className="test-case-workflow__main">{renderSteps(curStep)}</main>
        <footer className="test-case-workflow__footer"></footer>
      </div>
    </section>
  );
};

export default TestCaseWorkflow;
