import TestCategoryCardsWrapper from "./TestCaseWorkflow";
import {
  TestCase,
  TestCategory,
  TestCaseStatus,
} from "../../context/ChatContext";
import { Dispatch, SetStateAction } from "react";

export { TestCategoryCardsWrapper };

export enum Steps {
  SELECT_TEST_CATEGORY = "SELECT_TEST_CATEGORY",
  REVIEW_TEST_CASES = "REVIEW_TEST_CASES",
  EXPORT_TEST_CASES = "EXPORT_TEST_CASES",
  SELECT_EXPORT_TOOL = "SELECT_EXPORT_TOOL",
  CONNECT_JIRA = "CONNECT_JIRA",
  SELECT_JIRA_PROJECT = "SELECT_JIRA_PROJECT",
  EXPORT_TEST_CASES_STEP = "EXPORT_TEST_CASES_STEP",
  EXPORT_SUCCESS = "EXPORT_SUCCESS",
}

export interface ExportWorkflowState {
  selectedTool: "jira" | "azure" | "testrail" | "xray" | null;
  isJiraConnected: boolean;
  selectedProject: {
    key: string;
    name: string;
    id: string;
  } | null;
  selectedIssueType: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
  } | null;
  exportResults: {
    total: number;
    exported: number;
    errors: string[];
    exportedTestCases?: TestCase[];
  } | null;
}

export interface CommonProps {
  data: Array<TestCategory & { testCases: Array<TestCase> }>;
  curStep: Steps;
  setCurStep: Dispatch<SetStateAction<Steps>>;
  selectedTestCategory: (TestCategory & { testCases: Array<TestCase> }) | null;
  setSelectedTestCategory: Dispatch<
    SetStateAction<(TestCategory & { testCases: Array<TestCase> }) | null>
  >;
  exportState?: ExportWorkflowState;
  setExportState?: Dispatch<SetStateAction<ExportWorkflowState>>;
}
