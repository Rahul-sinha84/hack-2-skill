// Example usage of PDF Highlighter components
// This file demonstrates how to use the PDF highlighting components

import React, { useState } from "react";
import { PDFHighlighter, PDFSplitView, HighlightData } from "./index";

// Mock PDF file (in real usage, this would come from file upload)
const mockPDFFile = new File([""], "sample.pdf", { type: "application/pdf" });

// Mock highlight data matching the format from your example
const mockHighlightData: HighlightData = {
  test_id: "TC_001",
  title: "Authentication: Verify User Login with Valid Credentials",
  description:
    "1. Navigate to the login page.\n2. Enter a valid username and password.\n3. Click the 'Login' button.\n4. Verify that the user is successfully logged in and redirected to the dashboard.",
  category: "Security Tests",
  priority: "Critical",
  pdf_locations: [
    {
      page_number: 7,
      bounding_box: {
        x_min: 0.1461888551712036,
        y_min: 0.09318681061267853,
        x_max: 0.8549488186836243,
        y_max: 0.21714285016059875,
      },
      chunk_id: "chunk_007",
    },
  ],
  traceability: {
    test_id: "TC_001",
    title: "Authentication: Verify User Login with Valid Credentials",
    description:
      "1. Navigate to the login page.\n2. Enter a valid username and password.\n3. Click the 'Login' button.\n4. Verify that the user is successfully logged in and redirected to the dashboard.",
    category: "Security Tests",
    priority: "Critical",
    derived_from: "REQ-001",
    expected_result:
      "User is logged in successfully and redirected to the dashboard.",
    compliance_standards: ["SOC2 Type II", "ISO 27001"],
    traceability: {
      requirement_id: "REQ-001",
      requirement_text:
        "Pricing Model: Will the Al-based PRD Reviewer remain free or require a subscription tier for advanced features",
      pdf_locations: [
        {
          page_number: 7,
          bounding_box: {
            x_min: 0.1461888551712036,
            y_min: 0.09318681061267853,
            x_max: 0.8549488186836243,
            y_max: 0.21714285016059875,
          },
          chunk_id: "chunk_007",
        },
      ],
      linked_edges: ["REQ-001 → TC-001", "TC-001 → COMP-002"],
      compliance_references: ["GDPR:2016/679", "CCPA:CA-CIV-1798.100"],
      traceability_id: "TRACE_001",
      source_document: "Document chunk 1",
      confidence_score: 0.86,
      kg_mapping: {
        kg_nodes: [
          {
            id: "REQ-001",
            type: "REQUIREMENT",
            text: "Al-driven assistance: With the increasing availability of Al solutions, there is a growing opp",
            confidence: 0.7,
          },
        ],
        kg_edges: [
          {
            id: "EDGE_chunk_004_001",
            relation: "REQUIRES_COMPLIANCE",
            to: "COMP_002",
            confidence: 0.7,
          },
        ],
        kg_coverage: 1,
        kg_relationships: 4,
      },
    },
  },
};

// Mock test cases
const mockTestCases = [
  {
    id: "tc_1",
    title: "Authentication: Verify User Login with Valid Credentials",
    content: "Test the login functionality with valid credentials",
    traceability: mockHighlightData.traceability,
  },
  {
    id: "tc_2",
    title: "Authentication: Verify Invalid Login Attempts",
    content: "Test the login functionality with invalid credentials",
    traceability: undefined, // No PDF traceability
  },
];

// Example 1: Basic PDF Highlighter
export const BasicPDFHighlighterExample: React.FC = () => {
  const [pdfFile] = useState<File>(mockPDFFile);
  const [highlightData] = useState<HighlightData>(mockHighlightData);

  const handleHighlightClick = (data: HighlightData) => {
    console.log("Highlight clicked:", data);
    alert(`Clicked on test case: ${data.title}`);
  };

  return (
    <div style={{ height: "600px", border: "1px solid #ccc" }}>
      <PDFHighlighter
        pdfFile={pdfFile}
        highlightData={highlightData}
        onHighlightClick={handleHighlightClick}
        showNavigation={true}
        showZoomControls={true}
        fitWidth={true}
      />
    </div>
  );
};

// Example 2: PDF Split View
export const PDFSplitViewExample: React.FC = () => {
  const [pdfFile] = useState<File>(mockPDFFile);
  const [testCases] = useState(mockTestCases);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(
    null
  );

  const handleTestCaseSelect = (testCaseId: string) => {
    setSelectedTestCaseId(testCaseId);
    console.log("Selected test case:", testCaseId);
  };

  const handleHighlightClick = (data: HighlightData) => {
    console.log("Highlight clicked:", data);
    alert(`Clicked on test case: ${data.title}`);
  };

  return (
    <div style={{ height: "600px", border: "1px solid #ccc" }}>
      <PDFSplitView
        pdfFile={pdfFile}
        testCases={testCases}
        selectedTestCaseId={selectedTestCaseId}
        onTestCaseSelect={handleTestCaseSelect}
        onHighlightClick={handleHighlightClick}
      />
    </div>
  );
};

// Example 3: Integration with existing TestCaseWorkflow
export const TestCaseWorkflowIntegrationExample: React.FC = () => {
  const [showPDFView, setShowPDFView] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(
    null
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #ccc" }}>
        <h2>Test Case Review</h2>
        <button
          onClick={() => setShowPDFView(!showPDFView)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {showPDFView ? "Hide PDF" : "View PDF"}
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {showPDFView ? (
          <PDFSplitView
            pdfFile={mockPDFFile}
            testCases={mockTestCases}
            selectedTestCaseId={selectedTestCaseId}
            onTestCaseSelect={setSelectedTestCaseId}
            onHighlightClick={(data) => console.log("Highlight clicked:", data)}
          />
        ) : (
          <div style={{ padding: "16px" }}>
            <h3>Test Cases List</h3>
            {mockTestCases.map((testCase) => (
              <div
                key={testCase.id}
                style={{
                  padding: "12px",
                  border: "1px solid #ccc",
                  marginBottom: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedTestCaseId === testCase.id ? "#f0f8ff" : "white",
                }}
                onClick={() => setSelectedTestCaseId(testCase.id)}
              >
                <h4>{testCase.title}</h4>
                <p>{testCase.content}</p>
                {testCase.traceability && (
                  <span style={{ color: "green", fontSize: "12px" }}>
                    📍 Has PDF traceability
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

