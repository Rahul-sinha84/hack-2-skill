import TestCategoryCardsWrapper from "./TestCaseWorkflow";
import { TestCase, TestCategory } from "../../context/ChatContext";
import { Dispatch, SetStateAction } from "react";

export { TestCategoryCardsWrapper };

export enum Steps {
  SELECT_TEST_CATEGORY = "SELECT_TEST_CATEGORY",
  REVIEW_TEST_CASES = "REVIEW_TEST_CASES",
}

export interface CommonProps {
  data: Array<TestCategory & { testCases: Array<TestCase> }>;
  curStep: Steps;
  setCurStep: Dispatch<SetStateAction<Steps>>;
  selectedTestCategory: (TestCategory & { testCases: Array<TestCase> }) | null;
  setSelectedTestCategory: Dispatch<
    SetStateAction<(TestCategory & { testCases: Array<TestCase> }) | null>
  >;
}
