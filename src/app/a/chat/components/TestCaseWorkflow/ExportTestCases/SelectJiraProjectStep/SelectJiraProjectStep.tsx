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

  useEffect(() => {
    loadProjects();
  }, []);

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

  const handleProjectSelect = (project: JiraProject) => {
    setSelectedProject(project);
    if (setExportState) {
      setExportState((prev) => ({
        ...prev,
        selectedProject: project,
      }));
    }
  };

  const handleContinue = () => {
    if (selectedProject) {
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
            >
              Continue
            </button>
          )}
        </footer>
      </div>
    </section>
  );
};

export default SelectJiraProjectStep;
