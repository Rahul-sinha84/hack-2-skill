import React, { useState, useEffect, useRef } from "react";
import { CommonProps, Steps } from "../../";
import {
  showToastError,
  showToastSuccess,
} from "../../../../../../../components/ReactToastify/ReactToastify";
import "./_connect_jira_step.scss";
import { IoIosArrowBack } from "react-icons/io";

const ConnectJiraStep: React.FC<CommonProps> = ({
  curStep,
  setCurStep,
  exportState,
  setExportState,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("");
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startPolling = () => {
    setPollingStatus("Checking authentication status...");

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Start polling every 5 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/jira/get-current-user");
        const data = await response.json();

        if (response.ok && data.accountId) {
          // Authentication successful
          setPollingStatus("Authentication successful!");
          setIsConnecting(false);

          if (setExportState) {
            setExportState((prev) => ({
              ...prev,
              isJiraConnected: true,
              selectedTool: "jira", // Ensure Jira is selected
            }));
          }
          showToastSuccess("Successfully connected to Jira!");

          // Clear polling and timeout
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          // Close auth window if still open
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          setAuthWindow(null);

          // Navigate to next step after a brief delay
          setTimeout(() => {
            setCurStep(Steps.SELECT_JIRA_PROJECT);
          }, 1500);
        } else {
          setPollingStatus("Waiting for authentication...");
        }
      } catch (error) {
        console.error("Error during polling:", error);
        setPollingStatus("Checking authentication status...");
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleConnectJira = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const response = await fetch("/api/jira/get-auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "123", // TODO: Get from session
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (data.authUrl) {
        // Open Jira authentication in new tab
        const newAuthWindow = window.open(
          data.authUrl,
          "_blank",
          "width=600,height=600,scrollbars=yes,resizable=yes"
        );

        if (!newAuthWindow) {
          throw new Error(
            "Failed to open authentication window. Please check your popup blocker settings."
          );
        }

        setAuthWindow(newAuthWindow);

        // Start polling for authentication status
        startPolling();

        // Set a timeout to stop polling if user doesn't complete auth
        timeoutRef.current = setTimeout(() => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (!newAuthWindow.closed) {
            newAuthWindow.close();
          }
          setAuthWindow(null);
          setIsConnecting(false);
          setPollingStatus("");
          setConnectionError("Authentication timed out. Please try again.");
        }, 300000); // 5 minutes timeout
      } else {
        throw new Error("No authentication URL received from server");
      }
    } catch (error) {
      console.error("Error connecting to Jira:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to connect to Jira. Please try again.";
      setConnectionError(errorMessage);
      showToastError(errorMessage);
      setIsConnecting(false);
    }
  };

  const handleBack = () => {
    // Clean up polling and close auth window
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (authWindow && !authWindow.closed) {
      authWindow.close();
    }
    setAuthWindow(null);
    setIsConnecting(false);
    setPollingStatus("");
    setCurStep(Steps.SELECT_EXPORT_TOOL);
  };

  return (
    <section className="connect-jira-step">
      <div className="connect-jira-step__container">
        <header className="connect-jira-step__header">
          <div className="connect-jira-step__header__back-btn">
            <button onClick={handleBack}>
              <IoIosArrowBack />
            </button>
          </div>
          <div className="connect-jira-step__header__content">
            <h3 className="connect-jira-step__title">Connect to Jira</h3>
            <p className="connect-jira-step__description">
              Connect your Jira account to export test cases
            </p>
          </div>
        </header>

        <main className="connect-jira-step__main">
          {connectionError && (
            <div
              className="connect-jira-step__error"
              role="alert"
              aria-live="assertive"
            >
              <div className="connect-jira-step__error-icon" aria-hidden="true">
                ⚠️
              </div>
              <div className="connect-jira-step__error-content">
                <h4>Connection Error</h4>
                <p>{connectionError}</p>
                <button
                  className="connect-jira-step__retry-btn"
                  onClick={handleConnectJira}
                  disabled={isConnecting}
                  aria-label="Retry Jira connection"
                >
                  {isConnecting ? "Retrying..." : "Try Again"}
                </button>
              </div>
            </div>
          )}

          <div className="connect-jira-step__content">
            <div className="connect-jira-step__icon" aria-hidden="true">
              🔗
            </div>
            <p className="connect-jira-step__info">
              You'll be redirected to Jira to authorize the connection. This
              allows us to create test case issues in your Jira project.
            </p>

            {isConnecting && (
              <div
                className="connect-jira-step__loading"
                role="status"
                aria-live="polite"
              >
                <div className="loading-spinner" aria-hidden="true"></div>
                <p>Opening Jira authentication...</p>
                {authWindow && (
                  <p className="connect-jira-step__auth-note">
                    Complete the authentication in the popup window, then return
                    here.
                  </p>
                )}
                {pollingStatus && (
                  <div
                    className={`connect-jira-step__polling-status ${
                      pollingStatus.includes("successful")
                        ? "connect-jira-step__polling-status--success"
                        : ""
                    }`}
                  >
                    {pollingStatus.includes("successful") ? (
                      <div className="success-indicator">
                        <div className="success-icon">✓</div>
                        <p className="success-text">{pollingStatus}</p>
                      </div>
                    ) : (
                      <>
                        <div className="polling-indicator">
                          <div className="polling-dot"></div>
                          <div className="polling-dot"></div>
                          <div className="polling-dot"></div>
                        </div>
                        <p className="polling-text">{pollingStatus}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="connect-jira-step__footer">
          <button
            className="connect-jira-step__connect-btn"
            onClick={handleConnectJira}
            disabled={isConnecting}
            aria-label={
              isConnecting
                ? "Connecting to Jira, please wait"
                : "Connect to Jira"
            }
            tabIndex={0}
          >
            {isConnecting ? "Connecting..." : "Connect to Jira"}
          </button>
        </footer>
      </div>
    </section>
  );
};

export default ConnectJiraStep;
