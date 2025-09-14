import React, { useState, useEffect } from "react";
import { TestCase, TestCategory } from "../../../context/ChatContext";

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
              <SingleLineInput id={data.id} value={title} onChange={setTitle} />
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
              <TextAreaInput
                id={data.id}
                value={content}
                onChange={setContent}
              />
            </>
          )}
        </main>
        <footer className="amend-test-case__footer">
          {data ? (
            <div className="btn-container">
              <button className="reject-btn">Reject</button>
              <button className="approve-btn">Approve</button>
            </div>
          ) : null}
        </footer>
      </div>
    </section>
  );
};

export default AmendTestCase;
