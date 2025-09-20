import React from "react";
import "./_project_card.scss";

interface ProjectCardProps {
  project: {
    key: string;
    name: string;
    id: string;
  };
  isSelected: boolean;
  onSelect: (project: { key: string; name: string; id: string }) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      className={`project-card ${isSelected ? "project-card--selected" : ""}`}
      onClick={() => onSelect(project)}
    >
      <div className="project-card__header">
        <div className="project-card__key">{project.key}</div>
        {/* <div className="project-card__status">{isSelected ? "✓" : ""}</div> */}
      </div>

      <div className="project-card__content">
        <h4 className="project-card__name">{project.name}</h4>
        <p className="project-card__id">ID: {project.id}</p>
      </div>
    </button>
  );
};

export default ProjectCard;
