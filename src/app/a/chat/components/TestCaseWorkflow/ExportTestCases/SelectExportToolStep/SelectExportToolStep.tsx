import React, { useEffect, useState } from "react";
import { CommonProps, Steps } from "../../";
import {
  showToastInfo,
  showToastError,
} from "../../../../../../../components/ReactToastify/ReactToastify";
import "./_select_export_tool_step.scss";
import { IoIosArrowBack } from "react-icons/io";
import Image from "next/image";
import JiraLogo from "@/assets/jira_logo.png";
import AzureLogo from "@/assets/azure_devops_logo.png";
import PolarianLogo from "@/assets/polarian_logo.webp";

const SelectExportToolStep: React.FC<CommonProps> = ({
  curStep,
  setCurStep,
  exportState,
  setExportState,
}) => {
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    checkJiraConnection();
  }, []);

  // Update connection status when exportState changes
  useEffect(() => {
    if (exportState?.isJiraConnected) {
      setConnectionError(null);
    }
  }, [exportState?.isJiraConnected]);

  const checkJiraConnection = async () => {
    try {
      setIsCheckingConnection(true);
      setConnectionError(null);

      const response = await fetch("/api/jira/get-current-user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accountId && setExportState) {
          setExportState((prev) => ({ ...prev, isJiraConnected: true }));
        }
      } else if (response.status === 401) {
        // Not authenticated, that's fine
        if (setExportState) {
          setExportState((prev) => ({ ...prev, isJiraConnected: false }));
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error checking Jira connection:", error);
      setConnectionError("Failed to check Jira connection. Please try again.");
      if (setExportState) {
        setExportState((prev) => ({ ...prev, isJiraConnected: false }));
      }
    } finally {
      setIsCheckingConnection(false);
    }
  };
  const handleToolSelection = (
    tool: "jira" | "azure" | "polarian" | "xray"
  ) => {
    if (setExportState) {
      setExportState((prev) => ({
        ...prev,
        selectedTool: tool as "jira" | "azure" | "xray" | "testrail" | null,
      }));
    }

    if (tool === "jira") {
      // Check if Jira is connected and navigate accordingly
      if (exportState?.isJiraConnected) {
        setCurStep(Steps.SELECT_JIRA_PROJECT);
      } else {
        setCurStep(Steps.CONNECT_JIRA);
      }
    } else {
      // Show "Coming soon" for other tools
      showToastInfo(
        `${
          tool.charAt(0).toUpperCase() + tool.slice(1)
        } integration coming soon!`
      );
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    tool: "jira" | "azure" | "polarian" | "xray"
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToolSelection(tool);
    }
  };

  const handleBack = () => {
    setCurStep(Steps.SELECT_TEST_CATEGORY);
  };

  return (
    <section className="select-export-tool-step">
      <div className="select-export-tool-step__container">
        <header className="select-export-tool-step__header">
          <div className="select-export-tool-step__header__back-btn">
            <button onClick={handleBack}>
              <IoIosArrowBack />
            </button>
          </div>
          <div className="select-export-tool-step__header__content">
            <h3 className="select-export-tool-step__title">
              Choose Export Destination
            </h3>
            <p
              className="select-export-tool-step__subtitle"
              role="status"
              aria-live="polite"
            >
              Select the tool where you want to export your test cases
            </p>
          </div>
        </header>

        <main className="select-export-tool-step__main">
          {/* {connectionError && (
            <div
              className="connection-error"
              role="alert"
              aria-live="assertive"
            >
              <div className="connection-error__icon" aria-hidden="true">
                ⚠️
              </div>
              <div className="connection-error__content">
                <h4>Connection Error</h4>
                <p>{connectionError}</p>
                <button
                  className="connection-error__retry-btn"
                  onClick={checkJiraConnection}
                  disabled={isCheckingConnection}
                  aria-label="Retry connection check"
                >
                  {isCheckingConnection ? "Retrying..." : "Retry"}
                </button>
              </div>
            </div>
          )} */}

          <div className="export-tool-options">
            <button
              className="export-tool-option export-tool-option--jira"
              onClick={() => handleToolSelection("jira")}
              onKeyDown={(e) => handleKeyDown(e, "jira")}
              disabled={isCheckingConnection}
              aria-label="Export to Jira"
              aria-describedby="jira-description"
              tabIndex={0}
            >
              <div className="export-tool-option__icon">
                <Image src={JiraLogo} alt="Jira Logo" width={40} height={40} />
              </div>
              <div className="export-tool-option__content">
                <h4>Jira</h4>
                <p id="jira-description">Export test cases to Jira issues</p>
                {isCheckingConnection ? (
                  <div className="export-tool-option__status export-tool-option__status--loading">
                    <div className="loading-spinner"></div>
                    Checking connection...
                  </div>
                ) : exportState?.isJiraConnected ? (
                  <div className="export-tool-option__status export-tool-option__status--connected">
                    ✓ Connected
                  </div>
                ) : (
                  <div className="export-tool-option__status export-tool-option__status--disconnected">
                    Not connected
                  </div>
                )}
              </div>
            </button>

            <button
              className="export-tool-option export-tool-option--azure"
              onClick={() => handleToolSelection("azure")}
              onKeyDown={(e) => handleKeyDown(e, "azure")}
              aria-label="Export to Azure DevOps (Coming soon)"
              tabIndex={0}
            >
              <div className="export-tool-option__icon" aria-hidden="true">
                <Image
                  src={AzureLogo}
                  alt="Azure Logo"
                  width={40}
                  height={40}
                />
              </div>
              <div className="export-tool-option__content">
                <h4>Azure DevOps</h4>
                <p>Export to Azure DevOps work items</p>
              </div>
            </button>

            <button
              className="export-tool-option export-tool-option--polarian"
              onClick={() => handleToolSelection("polarian")}
              onKeyDown={(e) => handleKeyDown(e, "polarian")}
              aria-label="Export to TestRail (Coming soon)"
              tabIndex={0}
            >
              <div className="export-tool-option__icon" aria-hidden="true">
                <Image
                  src={PolarianLogo}
                  alt="Polarian Logo"
                  width={40}
                  height={40}
                />
              </div>
              <div className="export-tool-option__content">
                <h4>Polarian</h4>
                <p>Export to Polarian test cases</p>
              </div>
            </button>

            <button
              className="export-tool-option export-tool-option--xray"
              onClick={() => handleToolSelection("xray")}
              onKeyDown={(e) => handleKeyDown(e, "xray")}
              aria-label="Export to Xray (Coming soon)"
              tabIndex={0}
            >
              <div className="export-tool-option__icon" aria-hidden="true">
                🔍
              </div>
              <div className="export-tool-option__content">
                <h4>Xray</h4>
                <p>Export to Xray test management</p>
              </div>
            </button>
          </div>
        </main>

        <footer className="select-export-tool-step__footer"></footer>
      </div>
    </section>
  );
};

export default SelectExportToolStep;
