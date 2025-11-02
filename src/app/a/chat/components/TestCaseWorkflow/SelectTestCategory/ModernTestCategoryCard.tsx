"use client";

import React from "react";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import {
  TestCategory,
  TestCase,
  TestCaseStatus,
  useChat,
} from "../../../context/ChatContext";

interface ModernTestCategoryCardProps {
  data: TestCategory & { testCases: Array<TestCase> };
  onSelect: (
    testCategory: TestCategory & { testCases: Array<TestCase> }
  ) => void;
}

// Helper to clamp and normalize percentages
const normalizePercentages = (
  approved: number,
  rejected: number,
  pending: number
) => {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  let a = clamp(approved);
  let r = clamp(rejected);
  let p = clamp(pending);
  const total = a + r + p;
  if (total !== 100 && total > 0) {
    const k = 100 / total;
    a = Math.round(a * k);
    r = Math.round(r * k);
    p = Math.max(0, 100 - a - r);
  }
  return { a, r, p };
};

const ModernTestCategoryCard: React.FC<ModernTestCategoryCardProps> = ({
  data,
  onSelect,
}) => {
  const { getTestCasesByTestCategoryId } = useChat();
  const testCases = getTestCasesByTestCategoryId(data.id);

  // Get category type for styling
  const getCategoryType = (label: string) => {
    const lowercaseLabel = label.toLowerCase();
    if (lowercaseLabel.includes("functional")) return "functional";
    if (lowercaseLabel.includes("performance")) return "performance";
    if (lowercaseLabel.includes("security")) return "security";
    if (lowercaseLabel.includes("ui") || lowercaseLabel.includes("ux"))
      return "ui-ux";
    if (lowercaseLabel.includes("integration")) return "integration";
    if (lowercaseLabel.includes("api")) return "api";
    if (lowercaseLabel.includes("compliance")) return "compliance";
    return "default";
  };

  const categoryType = getCategoryType(data.label);

  // Calculate statistics
  const calculateStats = (testCases: Array<TestCase>) => {
    const total = testCases.length;
    const approved = testCases.filter(
      (tc) => tc.status === TestCaseStatus.APPROVED
    ).length;
    const exported = testCases.filter(
      (tc) => tc.status === TestCaseStatus.EXPORTED
    ).length;
    const pending = testCases.filter(
      (tc) => tc.status === TestCaseStatus.PENDING
    ).length;
    const rejected = testCases.filter(
      (tc) => tc.status === TestCaseStatus.REJECTED
    ).length;

    return { approved, exported, pending, rejected, total };
  };

  const { approved, exported, pending, rejected, total } =
    calculateStats(testCases);

  // Calculate Priority Breakdown
  const calculatePriorityBreakdown = () => {
    return {
      critical: testCases.filter((tc) => tc.priority === "Critical").length,
      high: testCases.filter((tc) => tc.priority === "High").length,
      medium: testCases.filter((tc) => tc.priority === "Medium").length,
      low: testCases.filter((tc) => tc.priority === "Low").length,
    };
  };

  const priorityBreakdown = calculatePriorityBreakdown();

  // Get Unique Requirements
  const getUniqueRequirements = (): number => {
    const uniqueReqs = new Set(
      testCases.map((tc) => tc.traceability?.requirement_id).filter(Boolean)
    );
    return uniqueReqs.size;
  };

  const uniqueRequirements = getUniqueRequirements();

  // Calculate Health Score (0-100) - weighted by priority
  const calculateHealthScore = (): number => {
    if (total === 0) return 0;
    const weightedScore =
      priorityBreakdown.critical * 4 +
      priorityBreakdown.high * 3 +
      priorityBreakdown.medium * 2 +
      priorityBreakdown.low * 1;
    return Math.round((weightedScore / (total * 4)) * 100);
  };

  const healthScore = calculateHealthScore();

  // Calculate Traceability Completeness
  const calculateTraceabilityCompleteness = (): number => {
    if (total === 0) return 0;
    const withTraceability = testCases.filter(
      (tc) =>
        tc.traceability &&
        tc.traceability.requirement_id &&
        tc.traceability.pdf_locations?.length > 0
    ).length;
    return Math.round((withTraceability / total) * 100);
  };

  const traceabilityCompleteness = calculateTraceabilityCompleteness();

  // Calculate Test Coverage (approved + exported / total)
  const calculateTestCoverage = (): number => {
    if (total === 0) return 0;
    return Math.round(((approved + exported) / total) * 100);
  };

  const testCoverage = calculateTestCoverage();

  // Calculate Test Density Trend (simplified: comparing approved vs pending)
  const testDensityTrend = approved > pending ? "up" : "down";

  // Calculate progress bar percentages (normalized to 100)
  const rawApproved = total > 0 ? (approved / total) * 100 : 0;
  const rawRejected = total > 0 ? (rejected / total) * 100 : 0;
  const rawPending = total > 0 ? (pending / total) * 100 : 0;
  const {
    a: approvedPercentage,
    r: rejectedPercentage,
    p: pendingPercentage,
  } = normalizePercentages(rawApproved, rawRejected, rawPending);

  // Get gradient colors based on category type
  // Color Palette: #F14A00 (orange), #C62300 (red), #500073 (purple), #2A004E (dark purple)
  const getGradientColors = (type: string) => {
    const colorMap: Record<
      string,
      { from: string; to: string; border: string; glow: string }
    > = {
      functional: {
        from: "#F14A00",
        to: "#C62300",
        border: "#F14A00",
        glow: "rgba(241, 74, 0, 0.5)",
      },
      performance: {
        from: "#C62300",
        to: "#F14A00",
        border: "#C62300",
        glow: "rgba(198, 35, 0, 0.5)",
      },
      security: {
        from: "#500073",
        to: "#2A004E",
        border: "#500073",
        glow: "rgba(80, 0, 115, 0.5)",
      },
      "ui-ux": {
        from: "#2A004E",
        to: "#500073",
        border: "#2A004E",
        glow: "rgba(42, 0, 78, 0.5)",
      },
      integration: {
        from: "#F14A00",
        to: "#500073",
        border: "#F14A00",
        glow: "rgba(147, 37, 57, 0.5)",
      },
      api: {
        from: "#C62300",
        to: "#2A004E",
        border: "#C62300",
        glow: "rgba(120, 19, 39, 0.5)",
      },
      compliance: {
        from: "#500073",
        to: "#C62300",
        border: "#500073",
        glow: "rgba(150, 16, 57, 0.5)",
      },
      default: {
        from: "#F14A00",
        to: "#C62300",
        border: "#F14A00",
        glow: "rgba(241, 74, 0, 0.5)",
      },
    };
    return colorMap[type] || colorMap.default;
  };

  const colors = getGradientColors(categoryType);

  // Get category description
  const getCategoryDescription = (type: string) => {
    const descriptionMap: Record<string, string> = {
      functional: "Validates core features and user workflows",
      performance: "Tests speed, scalability, and resource usage",
      security: "Ensures data protection and access controls",
      "ui-ux": "Evaluates interface design and user experience",
      integration: "Verifies system component interactions",
      api: "Tests API endpoints and data exchange",
      compliance: "Checks regulatory and policy adherence",
      default: "Comprehensive test coverage validation",
    };

    return descriptionMap[type] || descriptionMap.default;
  };

  return (
    <div className="ftc-wrap">
      <button
        className="card"
        onClick={() => onSelect({ ...data, testCases })}
        type="button"
      >
        <div className="card-content">
          {/* Header */}
          <div className="header">
            <div className="title-wrap">
              {/* <h2 className="title">{data.label}</h2>
              <p className="sub">
                Requirements: <span>{uniqueRequirements}</span>{" "}
                &nbsp;&nbsp;&nbsp; Coverage: <span>{testCoverage}%</span>
              </p> */}
            </div>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="left">
              <h3 className="big purple">{total}</h3>
              <p className="density">Total Test Cases</p>
            </div>
            <div className="right">
              <h3
                className={`big ${
                  healthScore >= 70
                    ? "green"
                    : healthScore >= 40
                    ? "yellow"
                    : "red"
                }`}
              >
                {healthScore}%
              </h3>
              <p
                className={`comp ${
                  healthScore >= 70
                    ? "green-text"
                    : healthScore >= 40
                    ? "yellow-text"
                    : "red-text"
                }`}
              >
                Health Score
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Test Summary */}
          <div className="test-summary">
            <h4 className="summary-heading">Test Summary</h4>
            <p className="summary-text">
              {getCategoryDescription(categoryType)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="progress">
            <div
              className="bar approved"
              style={{ width: `${approvedPercentage}%` }}
            />
            <div
              className="bar rejected"
              style={{
                left: `${approvedPercentage}%`,
                width: `${rejectedPercentage}%`,
              }}
            />
            <div
              className="bar pending"
              style={{
                left: `${approvedPercentage + rejectedPercentage}%`,
                width: `${pendingPercentage}%`,
              }}
            />
          </div>

          <div className="labels">
            <span className="lab lab-approved">
              <i /> Approved
            </span>
            <span className="lab lab-rejected">
              <i /> Rejected
            </span>
            <span className="lab lab-pending">
              <i /> Pending
            </span>
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="view-test-btn">View Tests</div>
            {/* <p className="avg">
              Priority:{" "}
              <span className="priority-critical">
                {priorityBreakdown.critical} Critical
              </span>
              ,{" "}
              <span className="priority-high">
                {priorityBreakdown.high} High
              </span>
              ,{" "}
              <span className="priority-medium">
                {priorityBreakdown.medium} Med
              </span>
              ,{" "}
              <span className="priority-low">{priorityBreakdown.low} Low</span>
            </p> */}
          </div>
        </div>
      </button>

      <style jsx>{`
        /* Layout */
        .ftc-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5f5f5;
          -webkit-font-smoothing: antialiased;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Inter, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }
        .card {
          position: relative;
          width: 100%;
          max-width: 48rem;
          border-radius: 24px;
          border: 1px solid #27272a;
          background: #1f1f1f;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transition: all 0.5s ease;
          backdrop-filter: blur(20px);
          cursor: pointer;
          padding: 0;
        }
        .card:hover {
          transform: scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          background: #1a1a1a;
        }

        .card-content {
          position: relative;
          z-index: 1;
          padding: 24px;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f5f5f5;
          margin: 0 0 8px 0;
          line-height: 1.2;
          text-align: left;
        }
        .sub {
          margin: 0;
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 500;
          text-align: left;
        }
        .sub span {
          color: #e5e7eb;
          font-weight: 600;
        }

        /* Stats */
        .stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .left,
        .right {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
        }
        .stat-label-above {
          font-size: 0.65rem;
          font-weight: 200;
          color: #9ca3af;
          margin: 8px 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .label {
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6b7280;
          margin: 0;
        }
        .big {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
          margin: 0 0 8px 0;
          text-align: left;
        }
        .purple {
          color: #8b5cf6;
        }
        .yellow {
          color: #facc15;
        }
        .green {
          color: #10b981;
        }
        .red {
          color: #ef4444;
        }
        .density {
          font-size: 0.875rem;
          color: #8b5cf6;
          font-weight: 500;
          margin: 0;
        }
        .density .arrow {
          display: inline-flex;
          animation: bounce-slow 1.8s infinite;
        }
        .comp {
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0;
        }
        .green-text {
          color: #34d399;
        }
        .yellow-text {
          color: #fde047;
        }
        .red-text {
          color: #f87171;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: #27272a;
          margin: 16px 0;
        }

        /* Test Summary */
        .test-summary {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin: 12px 0;
          gap: 6px;
        }
        .summary-heading {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }
        .summary-text {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.4;
          text-align: left;
          margin: 0;
        }

        .progress {
          position: relative;
          background: #27272a;
          height: 10px;
          border-radius: 9999px;
          overflow: hidden;
          margin-top: 10px;
        }
        .bar {
          position: absolute;
          top: 0;
          height: 100%;
          transition: width 1.2s ease-in-out;
        }
        .approved {
          left: 0;
          background: rgba(16, 185, 129, 0.9);
          border-top-left-radius: 9999px;
          border-bottom-left-radius: 9999px;
        }
        .rejected {
          background: rgba(239, 68, 68, 1);
        }
        .pending {
          background: rgba(250, 204, 21, 0.9);
          border-top-right-radius: 9999px;
          border-bottom-right-radius: 9999px;
        }

        .labels {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 0.875rem;
          color: #d4d4d8;
        }
        .lab {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: default;
          transition: color 0.3s ease;
        }
        .lab:hover {
          opacity: 0.8;
        }
        .lab i {
          width: 12px;
          height: 12px;
          display: inline-block;
          border-radius: 50%;
        }
        .lab-approved i {
          background: #10b981;
          color: #10b981;
        }
        .lab-rejected i {
          background: #ef4444;
          color: #ef4444;
        }
        .lab-pending i {
          background: #facc15;
          color: #facc15;
        }

        /* Footer */
        .footer {
          text-align: center;
          margin-top: 1.5rem;
        }
        .view-test-btn {
          margin: 0 0 12px 0;
          background: #27272a;
          color: #f9fafb;
          padding: 10px 20px;
          border-radius: 9999px;
          border: 1.5px solid rgba(139, 92, 246, 0.5);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        .view-test-btn:hover {
          background: #3f3f46;
          border-color: rgba(139, 92, 246, 0.8);
          transform: translateY(-1px);
        }
        .avg {
          color: #a1a1aa;
          font-size: 0.75rem;
          margin: 0;
        }
        .avg span {
          font-weight: 600;
        }
        .priority-critical {
          color: #ef4444;
        }
        .priority-high {
          color: #f97316;
        }
        .priority-medium {
          color: #facc15;
        }
        .priority-low {
          color: #10b981;
        }

        /* Animations */
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </div>
  );
};

export default ModernTestCategoryCard;
