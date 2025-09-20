import React, { useState } from "react";
import { CommonProps, Steps } from "..";
import { TestCategoryCards } from ".";

import "./_select_test_category_step.scss";
import { TestCase, TestCategory } from "../../../context/ChatContext";

const SelectTestCategoryStep = ({
  data,
  curStep,
  setCurStep,
  setSelectedTestCategory,
}: CommonProps) => {
  const selectTestCategory = (
    testCategory: TestCategory & { testCases: Array<TestCase> }
  ) => {
    setSelectedTestCategory(testCategory);
    setCurStep(Steps.REVIEW_TEST_CASES);
  };

  // Calculate statistics from the data
  // const totalCategories = data.length;
  // const totalTestCases = data.reduce(
  //   (sum, category) => sum + category.testCases.length,
  //   0
  // );
  // const avgTestCasesPerCategory =
  //   totalCategories > 0 ? Math.round(totalTestCases / totalCategories) : 0;

  // const connectJira = async () => {
  //   try {
  //     const response = await fetch("/api/jira/get-auth-url", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         userId: "123",
  //       }),
  //     });
  //     const { authUrl } = await response.json();

  //     // const jiraConnect = await fetch("/api/jira/connect-jira", {
  //     //   method: "POST",
  //     //   body: JSON.stringify({
  //     //     authUrl,
  //     //   }),
  //     // });
  //     // const jiraConnectData = await jiraConnect.json();
  //     // console.log({ jiraConnectData });

  //     window.open(authUrl, "_blank");
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  // const getCloudId = async () => {
  //   try {
  //     const response = await fetch("/api/jira/get-cloud-id");
  //     const data = await response.json();
  //     console.log({ data });
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  // const getCurrentUser = async () => {
  //   try {
  //     const response = await fetch("/api/jira/get-current-user");
  //     const data = await response.json();
  //     console.log({ data });
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  // const getProjects = async () => {
  //   try {
  //     const response = await fetch("/api/jira/get-projects");
  //     const data = await response.json();
  //     console.log({ data });
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  // const refreshAccessToken = async () => {
  //   try {
  //     const response = await fetch("/api/jira/refresh-access-token");
  //     const data = await response.json();
  //     console.log({ data });
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  // const getIssueTypesOfUser = async () => {
  //   try {
  //     const response = await fetch("/api/jira/issue/get-issue-type-of-user");
  //     const { issueTypeData } = await response.json();
  //     console.log({ issueTypeData });
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  // const getIssueTypesOfProject = async () => {
  //   try {
  //     const response = await fetch("/api/jira/issue/get-issue-type-of-project");
  //     const { issueTypeData } = await response.json();
  //     console.log({ issueTypeData });
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  // const uploadBulkIssues = async () => {
  //   try {
  //     const response = await fetch("/api/jira/issue/upload-bulk-issues", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         testCases: data[0].testCases
  //           .map((testCase) => {
  //             return { ...testCase, testCategory: data[0].label };
  //           })
  //           .flat(),
  //         projectKey: "DP",
  //         issueType: "Task",
  //       }),
  //     });
  //     const responseData = await response.json();
  //     console.log({ responseData });
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // };

  return (
    <section className="select-test-category-step">
      <div className="select-test-category-step__container">
        <div className="select-test-category-step__layout">
          {/* Cards Section - Full Width */}
          <main className="select-test-category-step__main select-test-category-step__main--full-width">
            <div className="main-section-header">
              <h3 className="main-section-title">Test Categories</h3>
              <p className="main-section-subtitle">
                Click on any category to explore detailed test cases
              </p>
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
          <footer className="select-test-category-step__footer">
            <button
              className="select-test-category-step__export-btn"
              onClick={() => setCurStep(Steps.EXPORT_TEST_CASES)}
            >
              Export test cases
            </button>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default SelectTestCategoryStep;
