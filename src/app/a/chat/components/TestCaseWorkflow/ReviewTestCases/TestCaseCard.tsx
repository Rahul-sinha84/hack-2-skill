import React from "react";

import "./_test_case_card.scss";
import { TestCase, TestCaseStatus } from "../../../context/ChatContext";

interface TestCaseCardProps {
  data: TestCase;
}

const TestCaseCard = ({ data }: TestCaseCardProps) => {
  const handleCardClick = () => {
    if (data.traceability) {
      console.log("🔍 Traceability Details for Test Case:", data.title);
      console.log("📋 Full Traceability Data:", data.traceability);
      
      const { requirement_id, requirement_text, pdf_locations, compliance_references } = data.traceability;
      
      if (requirement_id) {
        console.log("📝 Requirement ID:", requirement_id);
      }
      
      if (requirement_text) {
        console.log("📄 Requirement Text:", requirement_text);
      }
      
      if (pdf_locations && pdf_locations.length > 0) {
        console.log("📍 PDF Locations:");
        pdf_locations.forEach((location, index) => {
          console.log(`  ${index + 1}. Page ${location.page} (Chunk: ${location.chunk_id})`);
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

  return (
    <div 
      className="test-case-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="test-case-card__container">
        <header className="test-case-card__header"></header>
        <main className="test-case-card__main">
          <div className="test-case-card__main__title-section">
            <h3 className="test-case-card__main__title">{data.title}</h3>
            {data.traceability && (
              <span className="test-case-card__traceability-indicator" title="Click to see traceability details in console">
                🔍
              </span>
            )}
          </div>
          <div
            className={`test-case-card__main__status ${
              data.status === TestCaseStatus.APPROVED
                ? "approved"
                : data.status === TestCaseStatus.PENDING
                ? "pending"
                : data.status === TestCaseStatus.EXPORTED
                ? "exported"
                : "rejected"
            }`}
          >
            <div className="test-case-card__main__status__icon"></div>
            <div className={`test-case-card__main__status__text`}>
              {data.status === TestCaseStatus.APPROVED
                ? "Approved"
                : data.status === TestCaseStatus.PENDING
                ? "Pending"
                : data.status === TestCaseStatus.EXPORTED
                ? "Exported"
                : "Rejected"}
            </div>
          </div>
        </main>
        <footer className="test-case-card__footer"></footer>
      </div>
    </div>
  );
};

export default TestCaseCard;
