import React, { useState, useEffect } from "react";
import {
  TestCase,
  TestCategory,
  useChat,
  TestCaseStatus,
} from "../../../context/ChatContext";

import "./_amend_test_case.scss";
import {
  SingleLineInput,
  TextAreaInput,
} from "@/app/a/chat/[id]/components/TextCaseInput";
import { RiRobot2Fill } from "react-icons/ri";
import Tooltip from "@/components/Tooltip";
import { showToastInfo } from "@/components/ReactToastify/ReactToastify";

interface AmendTestCaseProps {
  data: TestCase;
  testCategory: TestCategory & {
    testCases: TestCase[];
  };
}

const AmendTestCase = ({ data, testCategory }: AmendTestCaseProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { updateTestCaseStatus, updateTestCaseDetails } = useChat();

  // Check if the test case is exported
  const isExported = data?.status === TestCaseStatus.EXPORTED;

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setContent(data.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [data]);

  const uploadTestCase = async () => {
    try {
      const response = await fetch("/api/jira/issue/upload-issue", {
        method: "POST",
        body: JSON.stringify({ testCase: data, projectKey: "10000" }),
      });
      const responseData = await response.json();
      console.log({ responseData });
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <section className="amend-test-case">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient
            id="gradient-robot-icon"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ff00ff" />
            <stop offset="50%" stopColor="#ff1493" />
            <stop offset="100%" stopColor="#8a2be2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="amend-test-case__container">
        <header className="amend-test-case__header">
          {isExported ? (
            <div className="amend-test-case__readonly-header">
              <h3 className="amend-test-case__readonly-title">{data.title}</h3>
              <span className="amend-test-case__exported-badge">
                ✓ Exported
              </span>
            </div>
          ) : (
            <SingleLineInput id={data.id} value={title} onChange={setTitle} />
          )}
        </header>
        <main className="amend-test-case__main">
          {isExported ? (
            <div className="amend-test-case__readonly-content">
              <p className="amend-test-case__readonly-text">{data.content}</p>
              <div className="amend-test-case__readonly-notice">
                <span className="notice-icon">ℹ️</span>
                <span>
                  This test case has been exported to Jira and cannot be
                  modified.
                </span>
              </div>
            </div>
          ) : (
            <TextAreaInput id={data.id} value={content} onChange={setContent} />
          )}
        </main>
        <footer className="amend-test-case__footer">
          <div className="amend-test-case__footer__container">
            {data.traceability?.compliance_references &&
              data.traceability.compliance_references.length > 0 && (
                <div className="amend-test-case__compliance-tags">
                  <h4 className="amend-test-case__compliance-title">
                    Compliance standards
                  </h4>
                  <div className="amend-test-case__compliance-tags-container">
                    {data.traceability.compliance_references.map(
                      (ref, index) => (
                        <span
                          key={index}
                          className="amend-test-case__compliance-tag"
                        >
                          {ref}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            <div className="ai-refinement-btn">
              <Tooltip text="AI Refinement">
                <button
                  onClick={() => {
                    showToastInfo("Feature coming soon!");
                  }}
                  className="ai-refinement"
                >
                  <i className="icon">
                    <RiRobot2Fill size={20} />
                  </i>
                </button>
              </Tooltip>
            </div>
          </div>
          {isExported ? (
            <div className="amend-test-case__exported-footer">
              <span className="exported-message">
                This test case has been exported and cannot be modified.
              </span>
            </div>
          ) : (
            <div className="btn-container">
              <div className="action-btns">
                <button
                  className="reject-btn"
                  onClick={() =>
                    updateTestCaseStatus(data.id, TestCaseStatus.REJECTED)
                  }
                >
                  Reject
                </button>
                <button
                  className="approve-btn"
                  onClick={() => {
                    updateTestCaseDetails(data.id, title, content);
                    updateTestCaseStatus(data.id, TestCaseStatus.APPROVED);
                  }}
                >
                  Approve
                </button>
              </div>
              {/* <button className="upload-btn" onClick={uploadTestCase}>
                  Upload
                </button> */}
            </div>
          )}
        </footer>
      </div>
    </section>
  );
};

export default AmendTestCase;
