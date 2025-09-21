import React, { useState, useEffect } from "react";
import { CommonProps, Steps } from "../../";
import ProjectCard from "./ProjectCard";
import "./_select_jira_project_step.scss";
import { IoIosArrowBack } from "react-icons/io";

interface JiraProject {
  key: string;
  name: string;
  id: string;
}

interface IssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

const SelectJiraProjectStep: React.FC<CommonProps> = ({
  curStep,
  setCurStep,
  exportState,
  setExportState,
}) => {
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(
    exportState?.selectedProject || null
  );
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType | null>(
    exportState?.selectedIssueType || null
  );
  const [loadingIssueTypes, setLoadingIssueTypes] = useState(false);
  const [issueTypesError, setIssueTypesError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  // Load issue types if a project is already selected
  useEffect(() => {
    if (selectedProject && issueTypes.length === 0 && !loadingIssueTypes) {
      loadIssueTypes(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/jira/get-projects");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load projects");
      }

      setProjects(data.projects || []);
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadIssueTypes = async (projectId: string) => {
    try {
      setLoadingIssueTypes(true);
      setIssueTypesError(null);

      const response = await fetch(
        "/api/jira/issue/get-issue-type-of-project",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load issue types");
      }

      // Extract issue types from the response
      const issueTypes =
        data.issueTypeData?.map((issueType: any) => ({
          id: issueType.id,
          name: issueType.name,
          description: issueType.description,
          iconUrl: issueType.iconUrl,
        })) || [];

      setIssueTypes(issueTypes);
    } catch (err: any) {
      console.error("Failed to load issue types:", err);
      setIssueTypesError(err.message || "Failed to load issue types");
      setIssueTypes([]);
    } finally {
      setLoadingIssueTypes(false);
    }
  };

  const handleProjectSelect = (project: JiraProject) => {
    setSelectedProject(project);
    setSelectedIssueType(null); // Reset issue type selection when project changes
    setIssueTypes([]); // Clear previous issue types

    if (setExportState) {
      setExportState((prev) => ({
        ...prev,
        selectedProject: project,
        selectedIssueType: null,
      }));
    }

    // Load issue types for the selected project
    loadIssueTypes(project.id);
  };

  const handleIssueTypeSelect = (issueType: IssueType) => {
    setSelectedIssueType(issueType);
    if (setExportState) {
      setExportState((prev) => ({
        ...prev,
        selectedIssueType: issueType,
      }));
    }
  };

  const handleContinue = () => {
    if (selectedProject && selectedIssueType) {
      setCurStep(Steps.EXPORT_TEST_CASES_STEP);
    }
  };

  const handleBack = () => {
    // If Jira is already connected, go back to tool selection
    // Otherwise, go to connection step
    if (exportState?.isJiraConnected) {
      setCurStep(Steps.SELECT_EXPORT_TOOL);
    } else {
      setCurStep(Steps.CONNECT_JIRA);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="select-jira-project-step__loading">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="select-jira-project-step__error">
          <div className="error-icon">⚠️</div>
          <h4>Failed to load projects</h4>
          <p>{error}</p>
          <button className="retry-btn" onClick={loadProjects}>
            Try Again
          </button>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="select-jira-project-step__empty">
          <div className="empty-icon">📁</div>
          <h4>No Projects Found</h4>
          <p>No projects created, please create it on Jira platform</p>
          <a
            href="https://id.atlassian.com/manage-profile/security/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="jira-link"
          >
            Go to Jira
          </a>
        </div>
      );
    }

    return (
      <div className="select-jira-project-step__content">
        <div className="select-jira-project-step__projects">
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProject?.id === project.id}
                onSelect={handleProjectSelect}
              />
            ))}
          </div>
        </div>

        {selectedProject && (
          <div className="select-jira-project-step__issue-types">
            <h4 className="select-jira-project-step__issue-types-title">
              Select Issue Type
            </h4>
            <p className="select-jira-project-step__issue-types-description">
              Choose the issue type for test cases in {selectedProject.name}
            </p>

            {loadingIssueTypes ? (
              <div className="select-jira-project-step__issue-types-loading">
                <div className="loading-spinner"></div>
                <p>Loading issue types...</p>
              </div>
            ) : issueTypesError ? (
              <div className="select-jira-project-step__issue-types-error">
                <div className="error-icon">⚠️</div>
                <p>{issueTypesError}</p>
                <button
                  className="retry-btn"
                  onClick={() => loadIssueTypes(selectedProject.id)}
                >
                  Try Again
                </button>
              </div>
            ) : issueTypes.length > 0 ? (
              <>
                <div className="issue-types-grid">
                  {issueTypes.map((issueType) => (
                    <button
                      key={issueType.id}
                      className={`issue-type-card ${
                        selectedIssueType?.id === issueType.id
                          ? "issue-type-card--selected"
                          : ""
                      }`}
                      onClick={() => handleIssueTypeSelect(issueType)}
                    >
                      <span className="issue-type-card__name">
                        {issueType.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="select-jira-project-step__issue-types-warning">
                  <span className="warning-asterisk">*</span>
                  <span className="warning-text">
                    This is a prototype - test cases may not be exported to some
                    issue types. Please check if the export works with your
                    selected issue type.
                  </span>
                </div>
              </>
            ) : (
              <div className="select-jira-project-step__issue-types-empty">
                <p>No issue types found for this project</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="select-jira-project-step">
      <div className="select-jira-project-step__container">
        <header className="select-jira-project-step__header">
          <div className="select-jira-project-step__header__back-btn">
            <button onClick={handleBack}>
              <IoIosArrowBack />
            </button>
          </div>
          <div className="select-jira-project-step__header__content">
            <h3 className="select-jira-project-step__title">
              Select Jira Project
            </h3>
            <p className="select-jira-project-step__description">
              Choose the Jira project where test cases will be exported
            </p>
          </div>
        </header>

        <main className="select-jira-project-step__main">
          {renderContent()}
        </main>

        <footer className="select-jira-project-step__footer">
          {selectedProject && (
            <button
              className="select-jira-project-step__continue-btn"
              onClick={handleContinue}
              disabled={!selectedIssueType || loadingIssueTypes}
            >
              {loadingIssueTypes ? "Please wait..." : "Continue"}
            </button>
          )}
        </footer>
      </div>
    </section>
  );
};

export default SelectJiraProjectStep;
