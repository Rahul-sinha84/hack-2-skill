"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { PDFSplitViewProps, HighlightData } from "../../types/pdf-highlighter";
import PDFHighlighter from "./PDFHighlighter";
import "./_pdf_split_view.scss";

const PDFSplitView: React.FC<PDFSplitViewProps> = ({
  pdfFile,
  testCases,
  selectedTestCaseId,
  onTestCaseSelect,
  onHighlightClick,
  className = "",
}) => {
  const [activeTestCaseId, setActiveTestCaseId] = useState<string | null>(
    selectedTestCaseId || null
  );
  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const splitterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the active test case
  const activeTestCase = testCases.find((tc) => tc.id === activeTestCaseId);

  // Get highlight data for the active test case
  const highlightData: HighlightData | undefined = activeTestCase?.traceability
    ? {
        test_id: activeTestCase.id,
        title: activeTestCase.title,
        description: activeTestCase.content,
        category: activeTestCase.traceability.category,
        priority: activeTestCase.traceability.priority,
        pdf_locations: activeTestCase.traceability.traceability.pdf_locations,
        traceability: activeTestCase.traceability,
      }
    : undefined;

  // Handle test case selection
  const handleTestCaseSelect = useCallback(
    (testCaseId: string) => {
      setActiveTestCaseId(testCaseId);
      onTestCaseSelect?.(testCaseId);
    },
    [onTestCaseSelect]
  );

  // Handle highlight click
  const handleHighlightClick = useCallback(
    (data: HighlightData) => {
      onHighlightClick?.(data);
    },
    [onHighlightClick]
  );

  // Handle splitter mouse down
  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Handle mouse move for resizing
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 80%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftPanelWidth(constrainedWidth);
    },
    [isResizing]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Update active test case when selectedTestCaseId prop changes
  useEffect(() => {
    if (selectedTestCaseId && selectedTestCaseId !== activeTestCaseId) {
      setActiveTestCaseId(selectedTestCaseId);
    }
  }, [selectedTestCaseId, activeTestCaseId]);

  // Render test case list
  const renderTestCaseList = () => {
    if (testCases.length === 0) {
      return (
        <div className="pdf-split-view__no-test-cases">
          <div className="pdf-split-view__no-test-cases__icon">📋</div>
          <p>No test cases available</p>
        </div>
      );
    }

    return (
      <div className="pdf-split-view__test-cases">
        <div className="pdf-split-view__test-cases__header">
          <h3>Test Cases</h3>
          <span className="pdf-split-view__test-cases__count">
            {testCases.length} {testCases.length === 1 ? "case" : "cases"}
          </span>
        </div>
        <div className="pdf-split-view__test-cases__list">
          {testCases.map((testCase) => {
            const hasTraceability = !!testCase.traceability;
            const isActive = testCase.id === activeTestCaseId;

            return (
              <div
                key={testCase.id}
                className={`pdf-split-view__test-case ${
                  isActive ? "active" : ""
                } ${hasTraceability ? "has-traceability" : "no-traceability"}`}
                onClick={() =>
                  hasTraceability && handleTestCaseSelect(testCase.id)
                }
              >
                <div className="pdf-split-view__test-case__header">
                  <h4 className="pdf-split-view__test-case__title">
                    {testCase.title}
                  </h4>
                  {hasTraceability && (
                    <div className="pdf-split-view__test-case__indicator">
                      📍
                    </div>
                  )}
                </div>
                <div className="pdf-split-view__test-case__content">
                  <p>{testCase.content}</p>
                </div>
                {!hasTraceability && (
                  <div className="pdf-split-view__test-case__no-traceability">
                    No PDF traceability data
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render active test case details
  const renderActiveTestCaseDetails = () => {
    if (!activeTestCase) {
      return (
        <div className="pdf-split-view__no-selection">
          <div className="pdf-split-view__no-selection__icon">👈</div>
          <p>Select a test case to view PDF highlights</p>
        </div>
      );
    }

    return (
      <div className="pdf-split-view__active-test-case">
        <div className="pdf-split-view__active-test-case__header">
          <h3>{activeTestCase.title}</h3>
          <button
            className="pdf-split-view__active-test-case__close"
            onClick={() => setActiveTestCaseId(null)}
            title="Close selection"
          >
            ✕
          </button>
        </div>
        <div className="pdf-split-view__active-test-case__content">
          <p>{activeTestCase.content}</p>
        </div>
        {activeTestCase.traceability && (
          <div className="pdf-split-view__active-test-case__traceability">
            <h4>Traceability Information</h4>
            <div className="pdf-split-view__traceability-details">
              <div className="pdf-split-view__traceability-item">
                <strong>Category:</strong>{" "}
                {activeTestCase.traceability.category}
              </div>
              <div className="pdf-split-view__traceability-item">
                <strong>Priority:</strong>{" "}
                {activeTestCase.traceability.priority}
              </div>
              <div className="pdf-split-view__traceability-item">
                <strong>PDF Locations:</strong>{" "}
                {activeTestCase.traceability.traceability.pdf_locations.length}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`pdf-split-view ${className}`} ref={containerRef}>
      {/* Left Panel - Test Cases */}
      <div
        className="pdf-split-view__left-panel"
        style={{ width: `${leftPanelWidth}%` }}
      >
        {renderTestCaseList()}
        {renderActiveTestCaseDetails()}
      </div>

      {/* Splitter */}
      <div
        ref={splitterRef}
        className={`pdf-split-view__splitter ${isResizing ? "resizing" : ""}`}
        onMouseDown={handleSplitterMouseDown}
      >
        <div className="pdf-split-view__splitter__handle"></div>
      </div>

      {/* Right Panel - PDF Viewer */}
      <div
        className="pdf-split-view__right-panel"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        {pdfFile ? (
          <PDFHighlighter
            pdfFile={pdfFile}
            highlightData={highlightData}
            onHighlightClick={handleHighlightClick}
            showNavigation={true}
            showZoomControls={true}
            fitWidth={true}
          />
        ) : (
          <div className="pdf-split-view__no-pdf">
            <div className="pdf-split-view__no-pdf__icon">📄</div>
            <p>No PDF file available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFSplitView;
