"use client";

import React from "react";
import "./_metrics_dashboard.scss";

interface DocumentAnalysisTagsProps {
  totalPages?: number;
  requirementsCount?: number;
  pagesWithCompliance?: number;
  pagesWithPII?: number;
}

const DocumentAnalysisTags: React.FC<DocumentAnalysisTagsProps> = ({
  totalPages = 0,
  requirementsCount = 0,
  pagesWithCompliance = 0,
  pagesWithPII = 0,
}) => {
  if (totalPages === 0) return null;

  return (
    <div className="document-analysis-tags">
      <span className="analysis-tag">
        {totalPages} pages analyzed
      </span>
      {requirementsCount > 0 && (
        <span className="analysis-tag tag-requirements">
          {requirementsCount} requirements
        </span>
      )}
      {pagesWithCompliance > 0 && (
        <span className="analysis-tag tag-compliance">
          {pagesWithCompliance} with compliance
        </span>
      )}
      <span className="analysis-tag tag-pii">
        {pagesWithPII} with PII
      </span>
    </div>
  );
};

export default DocumentAnalysisTags;

