import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json(mockResponse);
};

const mockResponse = {
  success: true,
  data: {
    documentSummary:
      "The Al-powered PRD Reviewer is a tool that analyzes and grades PRDs, providing actionable feedback to improve clarity, completeness, and alignment with product management best practices. It supports document upload/paste, AI-driven analysis, and versioning.",
    categories: [
      {
        id: "functional",
        label: "Functional Testing",
        description:
          "Core functionality tests related to PRD review and analysis.",
        testCases: [
          {
            id: "tc_1",
            title: "Upload .docx PRD and verify analysis",
            content:
              "Test steps:\n1. Upload a .docx file containing a PRD.\n2. Verify that the system parses the document correctly.\n3. Verify that the system generates a grade and feedback.\nExpected: The system should successfully upload, parse, and analyze the PRD, providing a grade and feedback report.",
            priority: "High",
          },
          {
            id: "tc_2",
            title: "Paste PRD text and verify analysis",
            content:
              "Test steps:\n1. Paste PRD text into the text editor.\n2. Verify that the system parses the text correctly.\n3. Verify that the system generates a grade and feedback.\nExpected: The system should successfully parse and analyze the pasted PRD text, providing a grade and feedback report.",
            priority: "High",
          },
          {
            id: "tc_3",
            title: "Verify structural analysis",
            content:
              "Test steps:\n1. Upload a PRD with missing sections (e.g., no Success Metrics).\n2. Verify that the system flags the missing sections.\nExpected: The system should identify and report the missing PRD sections.",
            priority: "High",
          },
          {
            id: "tc_4",
            title: "Verify feedback recommendations",
            content:
              "Test steps:\n1. Upload a PRD with unclear statements.\n2. Verify that the system provides specific suggestions to improve clarity.\nExpected: The system should provide actionable feedback to clarify the ambiguous statements.",
            priority: "High",
          },
        ],
      },
      {
        id: "ui",
        label: "UI Testing",
        description: "Tests related to the user interface and user experience.",
        testCases: [
          {
            id: "tc_5",
            title: "Verify intuitive upload process",
            content:
              "Test steps:\n1. Navigate to the PRD Reviewer tool.\n2. Attempt to upload a PRD using the available methods.\n3. Verify that the upload process is clear and easy to understand.\nExpected: The upload process should be intuitive and require minimal effort from the user.",
            priority: "Medium",
          },
          {
            id: "tc_6",
            title: "Verify clear feedback format",
            content:
              "Test steps:\n1. Upload a PRD and receive feedback.\n2. Verify that the feedback is presented in a clear and understandable format.\nExpected: The feedback should be easy to read and prompt users to make improvements.",
            priority: "Medium",
          },
        ],
      },
      {
        id: "performance",
        label: "Performance Testing",
        description:
          "Tests related to the performance and scalability of the system.",
        testCases: [
          {
            id: "tc_7",
            title: "Response time for small documents",
            content:
              "Test steps:\n1. Upload a PRD document under 10 pages.\n2. Measure the time taken for the system to generate a grade and feedback.\nExpected: The response time should be under 10 seconds.",
            priority: "Medium",
          },
          {
            id: "tc_8",
            title: "Handle concurrent users",
            content:
              "Test steps:\n1. Simulate 100 concurrent users uploading and analyzing PRDs.\n2. Monitor system performance and identify any degradation.\nExpected: The system should handle 100 concurrent users without significant performance degradation.",
            priority: "Medium",
          },
        ],
      },
      {
        id: "security",
        label: "Security Testing",
        description: "Tests related to the security and privacy of user data.",
        testCases: [
          {
            id: "tc_9",
            title: "Verify data encryption",
            content:
              "Test steps:\n1. Upload a PRD document.\n2. Verify that the data transmission is over HTTPS.\n3. Verify that the uploaded document is stored with encryption.\nExpected: All data transmission should be over HTTPS, and the uploaded document should be stored with encryption.",
            priority: "High",
          },
          {
            id: "tc_10",
            title: "Verify data deletion",
            content:
              "Test steps:\n1. Upload a PRD document.\n2. Request deletion of the uploaded document.\n3. Verify that the document is fully deleted from the system.\nExpected: The user content should be fully deleted upon request.",
            priority: "High",
          },
        ],
      },
    ],
  },
  metadata: {
    fileName: "PRD Example - AI PRD Reviewer.pdf",
    userQuery: "Generate test cases",
    documentSummary:
      "The Al-powered PRD Reviewer is a tool that analyzes and grades PRDs, providing actionable feedback to improve clarity, completeness, and alignment with product management best practices. It supports document upload/paste, AI-driven analysis, and versioning.",
    generatedAt: "2025-09-18T16:11:13.844Z",
    totalCategories: 4,
    totalTestCases: 10,
    usingVertexAI: true,
    enhancedData: {
      test_suite: {
        statistics: {
          requirements_covered: 25
        },
        pdf_outline: {
          total_pages: 15,
          summary: {
            pages_with_requirements: 8,
            pages_with_compliance: 3,
            pages_with_pii: 2,
          }
        }
      },
      coverage_analysis: {
        coverage_score: 85
      },
      compliance_dashboard: {
        standards_coverage: [
          { standard: "HIPAA", coverage: 92 },
          { standard: "GDPR", coverage: 88 },
          { standard: "FDA", coverage: 75 }
        ]
      }
    }
  },
};
