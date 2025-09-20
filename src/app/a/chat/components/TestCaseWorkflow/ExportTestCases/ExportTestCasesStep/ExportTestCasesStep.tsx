import React, { useState } from "react";
import { CommonProps, Steps } from "../../";
import { TestCaseStatus, useChat } from "../../../../context/ChatContext";
import TestCaseStats from "./TestCaseStats";
import TestCaseList from "./TestCaseList";
import {
  showToastError,
  showToastSuccess,
} from "../../../../../../../components/ReactToastify/ReactToastify";
import { IoIosArrowBack } from "react-icons/io";
import "./_export_test_cases_step.scss";

const ExportTestCasesStep: React.FC<CommonProps> = ({
  curStep,
  setCurStep,
  data,
  exportState,
  setExportState,
}) => {
  const { markTestCasesAsExported } = useChat();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Get all test cases from all categories
  const allTestCases = data.flatMap((category) => category.testCases);

  // Filter only approved test cases that haven't been exported yet
  const approvedTestCases = allTestCases.filter(
    (tc) => tc.status === TestCaseStatus.APPROVED
  );

  // Get exported test cases for display
  const exportedTestCases = allTestCases.filter(
    (tc) => tc.status === TestCaseStatus.EXPORTED
  );

  const handleExport = async () => {
    if (!exportState?.selectedProject) {
      showToastError("No project selected for export");
      return;
    }

    if (approvedTestCases.length === 0) {
      showToastError("No approved test cases to export");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch("/api/jira/issue/upload-bulk-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testCases: approvedTestCases.map((testCase) => ({
            ...testCase,
            testCategory:
              data.find((cat) =>
                cat.testCases.some((tc) => tc.id === testCase.id)
              )?.label || "Unknown Category",
          })),
          projectKey: exportState.selectedProject.key,
          // ? default issue type is Task
          issueType: "Task",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to export test cases");
      }

      // Complete progress
      setExportProgress(100);
      clearInterval(progressInterval);

      // Mark test cases as exported in the context
      if (result.createdIssues && result.createdIssues.length > 0) {
        markTestCasesAsExported(approvedTestCases.map((tc) => tc.id));
      }

      // Update export results
      if (setExportState) {
        setExportState((prev) => ({
          ...prev,
          exportResults: {
            total: approvedTestCases.length,
            exported: result.createdIssues?.length || 0,
            errors: result.errors || [],
            exportedTestCases: approvedTestCases, // Store the actual test cases that were exported
          },
        }));
      }

      showToastSuccess(
        `Successfully exported ${
          result.createdIssues?.length || 0
        } test cases to Jira!`
      );

      // Navigate to success step
      setCurStep(Steps.EXPORT_SUCCESS);
    } catch (error: any) {
      console.error("Export failed:", error);
      showToastError(error.message || "Failed to export test cases");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleContinueReviewing = () => {
    setCurStep(Steps.SELECT_TEST_CATEGORY);
  };

  const handleBack = () => {
    setCurStep(Steps.SELECT_JIRA_PROJECT);
  };

  const handleGetIssueTypes = async () => {
    const response = await fetch("/api/jira/issue/get-issue-type-of-project", {
      method: "POST",
      body: JSON.stringify({
        projectId: exportState?.selectedProject?.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    console.log(result);
  };

  return (
    <section className="export-test-cases-step">
      <div className="export-test-cases-step__container">
        <header className="export-test-cases-step__header">
          <div className="export-test-cases-step__header__back-btn">
            <button onClick={handleBack}>
              <IoIosArrowBack />
            </button>
          </div>
          <div className="export-test-cases-step__header__content">
            <h3 className="export-test-cases-step__title">Export Test Cases</h3>
            <p className="export-test-cases-step__description">
              Review the test cases that will be exported to Jira
            </p>
          </div>
        </header>

        <main className="export-test-cases-step__main">
          <TestCaseStats
            testCases={allTestCases}
            selectedProject={exportState?.selectedProject || null}
          />

          <div className="export-test-cases-step__content">
            {exportedTestCases.length > 0 && (
              <TestCaseList
                testCases={exportedTestCases}
                title="Already Exported Test Cases"
                showCategory={true}
                categories={data.map((cat) => ({
                  id: cat.id,
                  label: cat.label,
                }))}
              />
            )}

            {approvedTestCases.length > 0 ? (
              <TestCaseList
                testCases={approvedTestCases}
                title="Test Cases to Export"
                showCategory={true}
                categories={data.map((cat) => ({
                  id: cat.id,
                  label: cat.label,
                }))}
              />
            ) : (
              <div className="export-test-cases-step__empty">
                <div className="empty-icon">⚠️</div>
                <h4>
                  {exportedTestCases.length > 0
                    ? "All Test Cases Already Exported"
                    : "No Approved Test Cases"}
                </h4>
                <p>
                  {exportedTestCases.length > 0
                    ? "All your approved test cases have already been exported to Jira. You can continue reviewing to approve more test cases."
                    : "You need to approve some test cases before exporting. Go back to review and approve test cases."}
                </p>
              </div>
            )}
          </div>

          {isExporting && (
            <div className="export-progress">
              <div className="export-progress__header">
                <h4>Exporting to Jira...</h4>
                <span className="progress-percentage">
                  {Math.round(exportProgress)}%
                </span>
              </div>
              <div className="export-progress__bar">
                <div
                  className="export-progress__fill"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="export-progress__status">
                Creating {approvedTestCases.length} test case issues in Jira...
              </p>
            </div>
          )}
        </main>

        <footer className="export-test-cases-step__footer">
          <div className="export-test-cases-step__actions">
            {approvedTestCases.length > 0 && (
              <button
                className="export-test-cases-step__export-btn"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting
                  ? "Exporting..."
                  : `Export ${approvedTestCases.length} test cases`}
              </button>
            )}

            <button
              className="export-test-cases-step__continue-btn"
              onClick={handleContinueReviewing}
              disabled={isExporting}
            >
              Continue reviewing
            </button>
          </div>

          {/* <button onClick={handleGetIssueTypes}>Get Issue Types</button> */}
        </footer>
      </div>
    </section>
  );
};

export default ExportTestCasesStep;
