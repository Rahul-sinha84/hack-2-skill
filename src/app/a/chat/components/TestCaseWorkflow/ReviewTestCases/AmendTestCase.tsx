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

interface AmendTestCaseProps {
  data: TestCase | null;
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
      <div className="amend-test-case__container">
        <header className="amend-test-case__header">
          {!data ? (
            <h3 className="amend-test-case__header__title">
              {testCategory.label}
            </h3>
          ) : (
            <>
              {isExported ? (
                <div className="amend-test-case__readonly-header">
                  <h3 className="amend-test-case__readonly-title">
                    {data.title}
                  </h3>
                  <span className="amend-test-case__exported-badge">
                    ✓ Exported
                  </span>
                </div>
              ) : (
                <SingleLineInput
                  id={data.id}
                  value={title}
                  onChange={setTitle}
                />
              )}
            </>
          )}
        </header>
        <main className="amend-test-case__main">
          {!data ? (
            <p className="amend-test-case__main__para">
              {testCategory.description}
            </p>
          ) : (
            <>
              {isExported ? (
                <div className="amend-test-case__readonly-content">
                  <p className="amend-test-case__readonly-text">
                    {data.content}
                  </p>
                  <div className="amend-test-case__readonly-notice">
                    <span className="notice-icon">ℹ️</span>
                    <span>
                      This test case has been exported to Jira and cannot be
                      modified.
                    </span>
                  </div>
                </div>
              ) : (
                <TextAreaInput
                  id={data.id}
                  value={content}
                  onChange={setContent}
                />
              )}
            </>
          )}
        </main>
        <footer className="amend-test-case__footer">
          {data ? (
            isExported ? (
              <div className="amend-test-case__exported-footer">
                <span className="exported-message">
                  This test case has been exported and cannot be modified.
                </span>
              </div>
            ) : (
              <div className="btn-container">
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
                <button className="upload-btn" onClick={uploadTestCase}>
                  Upload
                </button>
              </div>
            )
          ) : null}
        </footer>
      </div>
    </section>
  );
};

export default AmendTestCase;
