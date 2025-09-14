import React from "react";

import "./_test_case_card.scss";
import { TestCase, TestCaseStatus } from "../../../context/ChatContext";

interface TestCaseCardProps {
  data: TestCase;
}

const TestCaseCard = ({ data }: TestCaseCardProps) => {
  return (
    <div className="test-case-card">
      <div className="test-case-card__container">
        <header className="test-case-card__header"></header>
        <main className="test-case-card__main">
          <h3 className="test-case-card__main__title">{data.title}</h3>
          <div
            className={`test-case-card__main__status ${
              data.status === TestCaseStatus.APPROVED
                ? "approved"
                : data.status === TestCaseStatus.PENDING
                ? "pending"
                : "rejected"
            }`}
          >
            <div className="test-case-card__main__status__icon"></div>
            <div className={`test-case-card__main__status__text`}>
              {data.status === TestCaseStatus.APPROVED
                ? "Approved"
                : data.status === TestCaseStatus.PENDING
                ? "Pending"
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
