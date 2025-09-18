import React from "react";
import { TestCase, TestCaseStatus } from "../../../../context/ChatContext";
import "./_test_case_stats.scss";

interface TestCaseStatsProps {
  testCases: TestCase[];
  selectedProject: {
    key: string;
    name: string;
    id: string;
  } | null;
}

const TestCaseStats: React.FC<TestCaseStatsProps> = ({
  testCases,
  selectedProject,
}) => {
  const getStats = () => {
    const total = testCases.length;
    const approved = testCases.filter(
      (tc) => tc.status === TestCaseStatus.APPROVED
    ).length;
    const pending = testCases.filter(
      (tc) => tc.status === TestCaseStatus.PENDING
    ).length;
    const rejected = testCases.filter(
      (tc) => tc.status === TestCaseStatus.REJECTED
    ).length;
    const exported = testCases.filter(
      (tc) => tc.status === TestCaseStatus.EXPORTED
    ).length;

    return { total, approved, pending, rejected, exported };
  };

  const { total, approved, pending, rejected, exported } = getStats();

  return (
    <div className="test-case-stats">
      <div className="test-case-stats__header">
        <h4>Export Summary</h4>
        {selectedProject && (
          <div className="test-case-stats__project">
            <span className="project-label">Target Project:</span>
            <span className="project-name">{selectedProject.name}</span>
            <span className="project-key">({selectedProject.key})</span>
          </div>
        )}
      </div>

      <div className="test-case-stats__grid">
        <div className="stat-card stat-card--total">
          <div className="stat-card__number">{total}</div>
          <div className="stat-card__label">Total Test Cases</div>
        </div>

        <div className="stat-card stat-card--approved">
          <div className="stat-card__number">{approved}</div>
          <div className="stat-card__label">Approved</div>
        </div>

        <div className="stat-card stat-card--pending">
          <div className="stat-card__number">{pending}</div>
          <div className="stat-card__label">Pending</div>
        </div>

        <div className="stat-card stat-card--rejected">
          <div className="stat-card__number">{rejected}</div>
          <div className="stat-card__label">Rejected</div>
        </div>

        <div className="stat-card stat-card--exported">
          <div className="stat-card__number">{exported}</div>
          <div className="stat-card__label">Exported</div>
        </div>
      </div>

      <div className="test-case-stats__info">
        <p>
          Only <strong>approved</strong> test cases will be exported to Jira.
          {pending > 0 && (
            <span className="warning-text">
              {" "}
              You have {pending} pending test cases that won't be exported.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default TestCaseStats;
