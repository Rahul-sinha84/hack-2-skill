// Type definitions for the Vertex Agent API response

export interface VertexAgentResponse {
  status: "success";
  agent: string;
  filename: string;
  gdpr_mode: boolean;
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
      total_pages: number;
      pages: PageOutline[];
      summary: {
        pages_with_requirements: number;
        pages_with_compliance: number;
        pages_with_pii: number;
      };
    };
  };
  knowledge_graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    metadata: {
      total_nodes: number;
      total_edges: number;
      requirement_nodes: number;
      compliance_nodes: number;
      test_case_nodes: number;
      graph_density: number;
      avg_confidence: number;
      cross_page_links: number;
      compliance_by_type: Record<string, number>;
      edges_by_relation: Record<string, number>;
      top_connected_nodes: Array<{
        node_id: string;
        connections: number;
      }>;
      normalized_compliance_count: number;
      tooltips: string[];
    };
  };
  flow_visualization: {
    status: string;
    total_requirements: number;
    total_compliance_standards: number;
    total_test_cases: number;
    requirement_coverage: Array<{
      requirement_id: string;
      requirement_text: string;
      test_cases: Array<{
        test_id: string;
        title: string;
        category: string;
        priority: string;
      }>;
      compliance_standards: string[];
    }>;
    compliance_coverage: Array<{
      standard_id: string;
      standard_name: string;
      standard_type: string;
      test_cases: string[];
      requirements: string[];
    }>;
    flow_metrics: {
      avg_tests_per_requirement: number;
      avg_requirements_per_standard: number;
      coverage_completeness: number;
    };
    visualization_data: {
      nodes: Array<{
        id: string;
        type: string;
        label: string;
        title: string;
        test_count?: number;
        category?: string;
        priority?: string;
      }>;
      edges: Array<{
        from: string;
        to: string;
        type: string;
        label: string;
      }>;
    };
  };
  compliance_summary: {
    coverage_score: number;
    status: string;
    status_icon: string;
    status_color: string;
    quick_stats: {
      total_requirements: number;
      requirements_tested: number;
      requirements_untested: number;
      total_tests: number;
      critical_gaps: number;
    };
    top_standards: Array<{
      name: string;
      coverage: number;
      status: string;
      color: string;
    }>;
  };
  compliance_dashboard: {
    overview: {
      audit_readiness: string;
      coverage_score: number;
      total_requirements: number;
      requirements_tested: number;
      requirements_untested: number;
      total_tests: number;
      total_compliance_standards: number;
    };
    gaps: Array<{
      gap_id: string;
      severity: string;
      type: string;
      message: string;
      issue: string;
      recommendation: string;
    }>;
    standards_coverage: Array<{
      standard_id: string;
      standard_name: string;
      standard_type: string;
      coverage: number;
      status: string;
      status_text: string;
      color: string;
      requirements_total: number;
      requirements_verified: number;
      requirements_unverified: number;
    }>;
    audit_report: {
      status: string;
      report_type: string;
      generated_at: string;
      summary: {
        total_requirements: number;
        requirements_verified: number;
        requirements_unverified: number;
        verification_percentage: number;
        total_compliance_standards: number;
        total_tests: number;
      };
      traceability_matrix: Array<{
        requirement_id: string;
        requirement_text: string;
        requirement_full_text: string;
        page_number: number;
        confidence: number;
        test_cases: Array<{
          test_id: string;
          title: string;
          category: string;
          priority: string;
        }>;
        test_count: number;
        compliance_standards: Array<{
          standard_id: string;
          standard_name: string;
          standard_type: string;
        }>;
        status: string;
        status_icon: string;
      }>;
      compliance_coverage: Array<{
        standard_id: string;
        standard_name: string;
        standard_type: string;
        total_requirements: number;
        requirements_verified: number;
        requirements_unverified: number;
        coverage_percentage: number;
      }>;
    };
  };
  pipeline_metadata: {
    step_1_docai: StepMetadata;
    step_2_dlp: StepMetadata;
    step_3_rag: StepMetadata;
    step_4_kg: StepMetadata;
    step_5_tests: StepMetadata;
    step_6_ui: StepMetadata;
    step_7_flow: StepMetadata;
    step_8_compliance: StepMetadata;
  };
  enhanced_traceability: {
    kg_utilization: {
      requirements_mapped: number;
      total_kg_nodes: number;
      total_kg_edges: number;
    };
    coverage_score: number;
    flow_metrics: {
      avg_tests_per_requirement: number;
      avg_requirements_per_standard: number;
      coverage_completeness: number;
    };
  };
  coverage_analysis: {
    status: string;
    coverage_score: number;
    total_requirements: number;
    total_compliance_standards: number;
    total_tests: number;
    test_distribution: Record<string, number>;
    coverage_gaps: Array<{
      type: string;
      message: string;
      severity: string;
    }>;
    recommendations: string[];
    kg_utilization: {
      requirements_mapped: number;
      total_kg_nodes: number;
      total_kg_edges: number;
    };
  };
}

export interface TestCategory {
  category_name: string;
  category_icon: string;
  test_cases: TestCase[];
  total_tests: number;
}

export interface TestCase {
  test_id: string;
  title: string;
  description: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  derived_from: string;
  expected_result: string;
  compliance_standards: string[];
  traceability: {
    requirement_id: string;
    requirement_text: string;
    pdf_locations: Array<{
      page_number: number;
      bounding_box: {
        x_min: number;
        y_min: number;
        x_max: number;
        y_max: number;
      };
      chunk_id: string;
    }>;
    linked_edges: string[];
    compliance_references: string[];
    traceability_id: string;
    source_document: string;
    confidence_score: number;
    kg_mapping: {
      kg_nodes: Array<{
        id: string;
        type: string;
        text: string;
        confidence: number;
      }>;
      kg_edges: Array<{
        id: string;
        relation: string;
        to: string;
        confidence: number;
      }>;
      kg_coverage: number;
      kg_relationships: number;
    };
  };
}

export interface PageOutline {
  page_number: number;
  sections: Array<{
    section_id: string;
    text_preview: string;
    has_requirements: boolean;
    has_compliance: boolean;
    has_pii: boolean;
  }>;
  has_requirements: boolean;
  has_compliance: boolean;
  has_pii: boolean;
}

export interface GraphNode {
  id: string;
  type: string;
  title: string;
  text: string;
  confidence: number;
  page_number: number;
  priority?: string;
  source?: string;
  standard_type?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  relation: string;
  confidence: number;
  source: string;
  page: number;
}

export interface StepMetadata {
  status: string;
  chunks_extracted?: number;
  entities_found?: number;
  chunks_masked?: number;
  pii_found?: number;
  context_docs?: number;
  policies_matched?: number;
  nodes_created?: number;
  edges_created?: number;
  tests_generated?: number;
  model_used?: string;
  categories_created?: number;
  total_tests?: number;
  requirements_mapped?: number;
  compliance_standards_mapped?: number;
  audit_report_generated?: boolean;
  compliance_standards_tracked?: number;
  coverage_score?: number;
  audit_readiness?: string;
}
