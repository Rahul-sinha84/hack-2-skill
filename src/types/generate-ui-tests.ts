// Type definitions for the new /generate-ui-tests endpoint

export interface GenerateUITestsResponse {
  status: "success";
  agent: string;
  filename: string;
  gdpr_mode: boolean;
  
  // Main UI data
  test_suite: {
    test_categories: TestCategory[];
    statistics: {
      total_tests: number;
      total_categories: number;
      priority_breakdown: {
        Critical: number;
        High: number;
        Medium: number;
        Low: number;
      };
      compliance_coverage: number;
      requirements_covered: number;
    };
    pdf_outline: {
      document_name: string;
      total_pages: number;
      pages: PageOutline[];
    };
  };
  
  // Knowledge Graph for visualization
  knowledge_graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    metadata: GraphMetadata;
  };
  
  // Pipeline metadata
  pipeline_metadata: {
    step_1_docai: StepMetadata;
    step_2_dlp: StepMetadata;
    step_3_rag: StepMetadata;
    step_4_kg: StepMetadata;
    step_5_gemini: StepMetadata;
    step_6_ui_enrichment: StepMetadata;
  };
  
  warning?: string; // If fallback was used
}

export interface TestCategory {
  category_name: string;
  category_icon: string;
  total_tests: number;
  test_cases: TestCase[];
}

export interface TestCase {
  test_id: string;
  title: string;
  description: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Not Run" | "Passed" | "Failed" | "Skipped";
  expected_result: string;
  steps: string[];
  
  // Enhanced traceability
  traceability: {
    requirement_id: string;
    requirement_text: string;
    pdf_locations: PDFLocation[];
    linked_edges: string[];
    compliance_references: string[];
  };
  
  // Enhanced compliance tags
  compliance_tags: ComplianceTag[];
  
  // Enhanced tooltip
  tooltip: string;
  
  // Enhanced metadata
  metadata: {
    created_by: "Gemini AI with RAG Context";
    confidence: number;
    auto_generated: boolean;
    rag_enhanced: boolean;
  };
}

export interface ComplianceTag {
  id: string;
  name: string;
  full_name: string;
  color: string;
  confidence: number;
  source: "RAG Context" | "Knowledge Graph";
}

export interface PDFLocation {
  page: number;
  bounding_box: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
  source_file: string;
  chunk_id: string;
}

export interface PageOutline {
  page_number: number;
  chunks: ChunkOutline[];
  has_requirements: boolean;
  has_compliance: boolean;
  has_pii: boolean;
}

export interface ChunkOutline {
  chunk_id: string;
  text_preview: string;
  bounding_box: BoundingBox;
  has_requirements: boolean;
  has_compliance: boolean;
  has_pii: boolean;
}

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
}

export interface GraphMetadata {
  total_nodes: number;
  total_edges: number;
  node_types: Record<string, number>;
  edge_types: Record<string, number>;
}

export interface StepMetadata {
  status: "completed" | "failed" | "skipped";
  duration_ms: number;
  input_size: number;
  output_size: number;
  error_message?: string;
}

// Helper types for frontend integration
export interface EnhancedTestCategory {
  id: string;
  chatResponseId: string;
  chatId: string;
  label: string;
  description: string;
  icon: string;
  total_tests: number;
  test_cases: EnhancedTestCase[];
  compliance_coverage?: number;
  priority_breakdown?: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
}

export interface EnhancedTestCase {
  id: string;
  testCategoryId: string;
  chatResponseId: string;
  title: string;
  content: string;
  status: "Not Run" | "Passed" | "Failed" | "Skipped";
  priority: "Critical" | "High" | "Medium" | "Low";
  expected_result: string;
  steps: string[];
  traceability: {
    requirement_id: string;
    requirement_text: string;
    pdf_locations: PDFLocation[];
    linked_edges: string[];
    compliance_references: string[];
  };
  compliance_tags: ComplianceTag[];
  tooltip: string;
  metadata: {
    created_by: string;
    confidence: number;
    auto_generated: boolean;
    rag_enhanced: boolean;
  };
}
