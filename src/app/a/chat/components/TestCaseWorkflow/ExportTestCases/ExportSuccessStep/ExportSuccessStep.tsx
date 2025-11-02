import React from "react";
import { CommonProps, Steps } from "../../";
import TestCaseList from "../ExportTestCasesStep/TestCaseList";
import "./_export_success_step.scss";

const ExportSuccessStep: React.FC<CommonProps> = ({
  curStep,
  setCurStep,
  exportState,
}) => {
  const handleClose = () => {
    // Close the modal or return to main workflow
    setCurStep(Steps.SELECT_TEST_CATEGORY);
  };

  const handleViewInJira = () => {
    if (exportState?.selectedProject) {
      // This would need the actual Jira URL - for now just show a message
      alert(`Would open Jira project: ${exportState.selectedProject.name}`);
    }
  };

  const exportResults = exportState?.exportResults;
  const selectedProject = exportState?.selectedProject;

  return (
    <section className="export-success-step">
      <div className="export-success-step__container">
        <header className="export-success-step__header">
          <div className="export-success-step__icon">✅</div>
          <h3 className="export-success-step__title">Export Successful!</h3>
          <p className="export-success-step__subtitle">
            Your test cases have been successfully exported to Jira
          </p>
        </header>

        <main className="export-success-step__main">
          <div className="export-success-step__summary">
            <div className="summary-card">
              <div className="summary-card__number">
                {exportResults?.exported || 0}
              </div>
              <div className="summary-card__label">Test Cases Exported</div>
            </div>

            <div className="summary-card">
              <div className="summary-card__number">
                {exportResults?.total || 0}
              </div>
              <div className="summary-card__label">Total Processed</div>
            </div>
          </div>

          {selectedProject && (
            <div className="export-success-step__project-info">
              <h4>Exported to Project:</h4>
              <div className="project-info">
                <span className="project-name">{selectedProject.name}</span>
                <span className="project-key">({selectedProject.key})</span>
              </div>
            </div>
          )}

          {exportResults?.errors && exportResults.errors.length > 0 && (
            <div className="export-success-step__errors">
              <h4>⚠️ Some Issues Occurred:</h4>
              <ul className="error-list">
                {exportResults.errors.map((error, index) => (
                  <li key={index} className="error-item">
                    {typeof error === "string" ? error : JSON.stringify(error)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exportResults?.exportedTestCases &&
            exportResults.exportedTestCases.length > 0 && (
              <TestCaseList
                testCases={exportResults.exportedTestCases}
                title="Successfully Exported Test Cases"
                showCategory={false}
              />
            )}

          <div className="export-success-step__timestamp">
            <p>Exported on {new Date().toLocaleString()}</p>
          </div>
        </main>

        <footer className="export-success-step__footer">
          <button
            className="export-success-step__view-btn"
            onClick={handleViewInJira}
            disabled={!selectedProject}
          >
            View in Jira
          </button>

          <button
            className="export-success-step__close-btn"
            onClick={handleClose}
          >
            Close
          </button>
        </footer>
      </div>
    </section>
  );
};

export default ExportSuccessStep;
