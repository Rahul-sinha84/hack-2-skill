import React from "react";

import "./_test_case_card.scss";
import { TestCase, TestCaseStatus } from "../../../context/ChatContext";
import Tooltip from "@/components/Tooltip";

interface TestCaseCardProps {
  data: TestCase;
  selectedTestCase: TestCase | null;
}

const TestCaseCard = ({ data, selectedTestCase }: TestCaseCardProps) => {
  const handleCardClick = () => {
    if (data.traceability) {
      console.log("🔍 Traceability Details for Test Case:", data.title);
      console.log("📋 Full Traceability Data:", data.traceability);

      const {
        requirement_id,
        requirement_text,
        pdf_locations,
        compliance_references,
      } = data.traceability;

      if (requirement_id) {
        console.log("📝 Requirement ID:", requirement_id);
      }

      if (requirement_text) {
        console.log("📄 Requirement Text:", requirement_text);
      }

      if (pdf_locations && pdf_locations.length > 0) {
        console.log("📍 PDF Locations:");
        pdf_locations.forEach((location, index) => {
          console.log(
            `  ${index + 1}. Page ${location.page} (Chunk: ${
              location.chunk_id
            })`
          );
        });
      }

      if (compliance_references && compliance_references.length > 0) {
        console.log("⚖️ Compliance References:");
        compliance_references.forEach((ref, index) => {
          console.log(`  ${index + 1}. ${ref}`);
        });
      }
    } else {
      console.log("ℹ️ No traceability data available for:", data.title);
    }
  };

  const displayTestCaseName = (title: string) => {
    const maxLength = selectedTestCase ? 30 : 100;
    if (title.length >= maxLength) return title.slice(0, maxLength) + "...";
    return title;
  };

  const getStatusIndicator = (
    status: TestCaseStatus
  ): { text: string; color: string } => {
    switch (status) {
      case TestCaseStatus.APPROVED: {
        return { text: "Approved", color: "#4ade80" };
      }
      case TestCaseStatus.PENDING: {
        return { text: "Pending", color: "#facc15" };
      }
      case TestCaseStatus.EXPORTED: {
        return { text: "Exported", color: "#c8c2c2" };
      }
      case TestCaseStatus.REJECTED: {
        return { text: "Rejected", color: "#f87171" };
      }
      default: {
        return { text: "", color: "" };
      }
    }
  };

  const getConfidenceScore = (
    confidenceScore: number
  ): {
    text: string;
    color: string;
    priority: "critical" | "high" | "medium" | "low";
  } => {
    const confidenceScoreText = `${(+confidenceScore * 100).toFixed(2)}%`;

    const confidenceScoreColor =
      +confidenceScore >= 0.9
        ? "#4ade80"
        : +confidenceScore >= 0.8
        ? "#facc15"
        : "#f87171";

    return {
      text: confidenceScoreText,
      color: confidenceScoreColor,
      priority:
        +confidenceScore < 0.8
          ? "critical"
          : +confidenceScore < 0.85
          ? "high"
          : +confidenceScore < 0.9
          ? "medium"
          : "low",
    };
  };

  const getConfidenceScoreToolTipText = (confidenceScore: number): string => {
    const { text, priority } = getConfidenceScore(confidenceScore);

    let tooltipText = `The AI is about ${text} confident in the accuracy of this test case.`;
    if (priority === "critical") {
      tooltipText +=
        "\n\nThis is a lowest confidence score, you should manually review the test case.";
    } else if (priority === "high") {
      tooltipText +=
        "\n\nThis is a medium confidence score, manual review is recommended.";
    } else if (priority === "medium") {
      tooltipText +=
        "\n\nThis is a high confidence score, you can review the test case.";
    } else if (priority === "low") {
      tooltipText +=
        "\n\nThis is a highest confidence score, you can trust the result.";
    }

    return tooltipText;
  };

  return (
    <div
      className="test-case-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="test-case-card__container">
        <header className="test-case-card__header"></header>
        <main className="test-case-card__main">
          <div className="test-case-card__main__title-section">
            <h3 className="test-case-card__main__title">
              <Tooltip text={data.title}>
                <span>{displayTestCaseName(data.title)}</span>
              </Tooltip>
            </h3>
          </div>
          <div className="test-case-card__main__content">
            <div className="test-case-card__main__confidence_score">
              <Tooltip
                text={getConfidenceScoreToolTipText(
                  data.traceability.confidence_score
                )}
              >
                <span
                  style={{
                    // color: getConfidenceScore(
                    //   data.traceability.confidence_score
                    // ).color,
                    color: "#000000",
                    border: `1px solid ${
                      getConfidenceScore(data.traceability.confidence_score)
                        .color
                    }`,
                    backgroundColor: `${
                      getConfidenceScore(data.traceability.confidence_score)
                        .color
                    }`,
                  }}
                >
                  {getConfidenceScore(data.traceability.confidence_score).text}
                </span>
              </Tooltip>
            </div>
            <div className="test-case-card__main__status-indicator">
              <span style={{ color: getStatusIndicator(data.status).color }}>
                {getStatusIndicator(data.status).text}
              </span>
            </div>
          </div>
        </main>
        <footer className="test-case-card__footer"></footer>
      </div>
    </div>
  );
};

export default TestCaseCard;
