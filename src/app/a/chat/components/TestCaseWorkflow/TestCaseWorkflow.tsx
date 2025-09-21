import React, { JSX, useState, useMemo } from "react";
import { TestCase, TestCategory, useChat } from "../../context/ChatContext";
import "./_test_case_workflow.scss";
import { CommonProps, Steps, ExportWorkflowState } from ".";
import { SelectTestCategoryStep } from "./SelectTestCategory";
import { ReviewTestCases } from "./ReviewTestCases";
import {
  SelectExportToolStep,
  ConnectJiraStep,
  SelectJiraProjectStep,
  ExportTestCasesStep,
  ExportSuccessStep,
} from "./ExportTestCases";

interface TestCaseWorkflowProps {
  data: Array<TestCategory & { testCases: Array<TestCase> }>;
}

const TestCaseWorkflow: React.FC<TestCaseWorkflowProps> = ({
  data: initialData,
}) => {
  const { testCategories, testCases } = useChat();

  // Create updated data by combining categories with their current test cases from context
  const data = useMemo(() => {
    return initialData.map((category) => ({
      ...category,
      testCases: testCases.filter((tc) => tc.testCategoryId === category.id),
    }));
  }, [initialData, testCases]);
  const [curStep, setCurStep] = useState<Steps>(Steps.SELECT_TEST_CATEGORY);
  const [selectedTestCategory, setSelectedTestCategory] = useState<
    (TestCategory & { testCases: Array<TestCase> }) | null
  >(null);
  const [exportState, setExportState] = useState<ExportWorkflowState>({
    selectedTool: null,
    isJiraConnected: false,
    selectedProject: null,
    selectedIssueType: null,
    exportResults: null,
  });

  const commonProps: CommonProps = {
    data,
    curStep,
    setCurStep,
    selectedTestCategory,
    setSelectedTestCategory,
    exportState,
    setExportState,
  };

  const renderSteps = (_curStep: Steps): JSX.Element => {
    switch (_curStep) {
      case Steps.SELECT_TEST_CATEGORY: {
        return <SelectTestCategoryStep {...commonProps} />;
      }
      case Steps.REVIEW_TEST_CASES: {
        return <ReviewTestCases {...commonProps} />;
      }
      case Steps.EXPORT_TEST_CASES:
      case Steps.SELECT_EXPORT_TOOL: {
        return <SelectExportToolStep {...commonProps} />;
      }
      case Steps.CONNECT_JIRA: {
        return <ConnectJiraStep {...commonProps} />;
      }
      case Steps.SELECT_JIRA_PROJECT: {
        return <SelectJiraProjectStep {...commonProps} />;
      }
      case Steps.EXPORT_TEST_CASES_STEP: {
        return <ExportTestCasesStep {...commonProps} />;
      }
      case Steps.EXPORT_SUCCESS: {
        return <ExportSuccessStep {...commonProps} />;
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
