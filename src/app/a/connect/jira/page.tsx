"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, Suspense, useState } from "react";
import "./_jira_connect.scss";

const JiraConnectContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/jira/get-access-token", {
          method: "POST",
          body: JSON.stringify({ code, userId }),
        });

        if (response.ok) {
          setIsSuccess(true);
        } else {
          setError("Failed to connect to Jira. Please try again.");
        }
      } catch (err) {
        setError(
          "An error occurred while connecting to Jira. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (code && userId) {
      fetchAccessToken();
    } else {
      setError("Invalid connection parameters. Please try again.");
      setIsLoading(false);
    }
  }, [code, userId, router]);

  return (
    <div className="jira-connect-page">
      <div className="jira-connect-page__container">
        {isLoading && (
          <div className="jira-connect-page__loading">
            <div className="jira-connect-page__spinner">
              <div className="jira-connect-page__spinner__circle"></div>
            </div>
            <h2 className="jira-connect-page__title">Connecting to Jira...</h2>
            <p className="jira-connect-page__message">
              Please wait here, do not close this tab.
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="jira-connect-page__success">
            <div className="jira-connect-page__success__icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="jira-connect-page__title">
              Successfully Connected!
            </h2>
            <p className="jira-connect-page__message">
              You are successfully connected to Jira and can close this tab now.
            </p>
          </div>
        )}

        {error && (
          <div className="jira-connect-page__error">
            <div className="jira-connect-page__error__icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="jira-connect-page__title">Connection Failed</h2>
            <p className="jira-connect-page__message">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const JiraConnectPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JiraConnectContent />
    </Suspense>
  );
};

export default JiraConnectPage;
