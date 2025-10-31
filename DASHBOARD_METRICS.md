# Response Dashboard Metrics

Based on the API response structure from `/api/generate-ui-tests`, here are all the metrics that can be displayed in a response dashboard:

## 1. Test Suite Statistics

### Basic Metrics
- **Total Test Cases** (`test_suite.statistics.total_tests`)
- **Total Categories** (`test_suite.statistics.total_categories`)
- **Requirements Covered** (`test_suite.statistics.requirements_covered`)
- **Compliance Coverage** (`test_suite.statistics.compliance_coverage`)

### Priority Breakdown
- **Critical Tests** (`test_suite.statistics.priority_breakdown.Critical`)
- **High Priority Tests** (`test_suite.statistics.priority_breakdown.High`)
- **Medium Priority Tests** (`test_suite.statistics.priority_breakdown.Medium`)
- **Low Priority Tests** (`test_suite.statistics.priority_breakdown.Low`)

### Category Distribution
- Test count per category (`test_suite.test_categories[].total_tests`)
- Category icons (`test_suite.test_categories[].category_icon`)

## 2. Document Analysis Metrics

### PDF Outline Metrics
- **Total Pages** (`test_suite.pdf_outline.total_pages`)
- **Pages with Requirements** (`test_suite.pdf_outline.summary.pages_with_requirements`)
- **Pages with Compliance** (`test_suite.pdf_outline.summary.pages_with_compliance`)
- **Pages with PII** (`test_suite.pdf_outline.summary.pages_with_pii`)
- Page-level details (`test_suite.pdf_outline.pages[]`)

## 3. Knowledge Graph Metrics

### Graph Statistics
- **Total Nodes** (`knowledge_graph.metadata.total_nodes`)
- **Total Edges** (`knowledge_graph.metadata.total_edges`)
- **Requirement Nodes** (`knowledge_graph.metadata.requirement_nodes`)
- **Compliance Nodes** (`knowledge_graph.metadata.compliance_nodes`)
- **Test Case Nodes** (`knowledge_graph.metadata.test_case_nodes`)
- **Graph Density** (`knowledge_graph.metadata.graph_density`)
- **Average Confidence** (`knowledge_graph.metadata.avg_confidence`)
- **Cross-page Links** (`knowledge_graph.metadata.cross_page_links`)
- **Normalized Compliance Count** (`knowledge_graph.metadata.normalized_compliance_count`)

### Compliance Distribution
- Compliance by type (`knowledge_graph.metadata.compliance_by_type`)
- Edges by relation (`knowledge_graph.metadata.edges_by_relation`)
- Top connected nodes (`knowledge_graph.metadata.top_connected_nodes`)

## 4. Compliance Dashboard Metrics

### Overview
- **Audit Readiness** (`compliance_dashboard.overview.audit_readiness`) - e.g., "READY", "NEEDS_IMPROVEMENT"
- **Coverage Score** (`compliance_dashboard.overview.coverage_score`) - Percentage 0-100
- **Total Requirements** (`compliance_dashboard.overview.total_requirements`)
- **Requirements Tested** (`compliance_dashboard.overview.requirements_tested`)
- **Requirements Untested** (`compliance_dashboard.overview.requirements_untested`)
- **Total Tests** (`compliance_dashboard.overview.total_tests`)
- **Total Compliance Standards** (`compliance_dashboard.overview.total_compliance_standards`)

### Compliance Gaps
- Gap ID (`compliance_dashboard.gaps[].gap_id`)
- Severity (`compliance_dashboard.gaps[].severity`)
- Gap Type (`compliance_dashboard.gaps[].type`)
- Message (`compliance_dashboard.gaps[].message`)
- Issue Description (`compliance_dashboard.gaps[].issue`)
- Recommendation (`compliance_dashboard.gaps[].recommendation`)

### Standards Coverage
For each standard:
- **Standard Name** (`compliance_dashboard.standards_coverage[].standard_name`)
- **Standard Type** (`compliance_dashboard.standards_coverage[].standard_type`)
- **Coverage Percentage** (`compliance_dashboard.standards_coverage[].coverage`)
- **Status** (`compliance_dashboard.standards_coverage[].status`)
- **Status Color** (`compliance_dashboard.standards_coverage[].color`)
- **Requirements Total** (`compliance_dashboard.standards_coverage[].requirements_total`)
- **Requirements Verified** (`compliance_dashboard.standards_coverage[].requirements_verified`)
- **Requirements Unverified** (`compliance_dashboard.standards_coverage[].requirements_unverified`)

### Audit Report
- **Report Status** (`compliance_dashboard.audit_report.status`)
- **Report Type** (`compliance_dashboard.audit_report.report_type`)
- **Generated At** (`compliance_dashboard.audit_report.generated_at`)
- **Verification Percentage** (`compliance_dashboard.audit_report.summary.verification_percentage`)
- **Traceability Matrix** - Full mapping of requirements to test cases
- **Compliance Coverage Array** - Detailed coverage per standard

## 5. Coverage Analysis Metrics

### Coverage Statistics
- **Coverage Score** (`coverage_analysis.coverage_score`) - Overall percentage
- **Status** (`coverage_analysis.status`) - e.g., "GOOD", "NEEDS_IMPROVEMENT"
- **Total Requirements** (`coverage_analysis.total_requirements`)
- **Total Compliance Standards** (`coverage_analysis.total_compliance_standards`)
- **Total Tests** (`coverage_analysis.total_tests`)

### Test Distribution
- Tests per category (`coverage_analysis.test_distribution`)

### Coverage Gaps
- Gap Type (`coverage_analysis.coverage_gaps[].type`)
- Gap Message (`coverage_analysis.coverage_gaps[].message`)
- Gap Severity (`coverage_analysis.coverage_gaps[].severity`)

### Recommendations
- List of recommendations (`coverage_analysis.recommendations[]`)

### Knowledge Graph Utilization
- **Requirements Mapped** (`coverage_analysis.kg_utilization.requirements_mapped`)
- **Total KG Nodes** (`coverage_analysis.kg_utilization.total_kg_nodes`)
- **Total KG Edges** (`coverage_analysis.kg_utilization.total_kg_edges`)

## 6. Compliance Summary Metrics

### Quick Stats
- **Total Requirements** (`compliance_summary.quick_stats.total_requirements`)
- **Requirements Tested** (`compliance_summary.quick_stats.requirements_tested`)
- **Requirements Untested** (`compliance_summary.quick_stats.requirements_untested`)
- **Total Tests** (`compliance_summary.quick_stats.total_tests`)
- **Critical Gaps** (`compliance_summary.quick_stats.critical_gaps`)

### Top Standards
- Standard Name (`compliance_summary.top_standards[].name`)
- Coverage (`compliance_summary.top_standards[].coverage`)
- Status (`compliance_summary.top_standards[].status`)
- Color (`compliance_summary.top_standards[].color`)

### Overall Coverage
- **Coverage Score** (`compliance_summary.coverage_score`)
- **Status** (`compliance_summary.status`)
- **Status Icon** (`compliance_summary.status_icon`)
- **Status Color** (`compliance_summary.status_color`)

## 7. Flow Visualization Metrics

### Flow Statistics
- **Total Requirements** (`flow_visualization.total_requirements`)
- **Total Compliance Standards** (`flow_visualization.total_compliance_standards`)
- **Total Test Cases** (`flow_visualization.total_test_cases`)
- **Status** (`flow_visualization.status`)

### Flow Metrics
- **Average Tests per Requirement** (`flow_visualization.flow_metrics.avg_tests_per_requirement`)
- **Average Requirements per Standard** (`flow_visualization.flow_metrics.avg_requirements_per_standard`)
- **Coverage Completeness** (`flow_visualization.flow_metrics.coverage_completeness`)

### Requirement Coverage
- Requirement ID and text
- Associated test cases
- Compliance standards per requirement

### Compliance Coverage Flow
- Standard details
- Test cases per standard
- Requirements per standard

## 8. Pipeline Metadata Metrics

### Step-by-Step Processing
For each pipeline step:
- **Status** (`pipeline_metadata.step_X.status`)
- **Chunks Extracted** (`step_1_docai.chunks_extracted`)
- **Entities Found** (`step_2_dlp.entities_found`)
- **Chunks Masked** (`step_2_dlp.chunks_masked`)
- **PII Found** (`step_2_dlp.pii_found`)
- **Context Documents** (`step_3_rag.context_docs`)
- **Policies Matched** (`step_3_rag.policies_matched`)
- **Nodes Created** (`step_4_kg.nodes_created`)
- **Edges Created** (`step_4_kg.edges_created`)
- **Tests Generated** (`step_5_tests.tests_generated`)
- **Model Used** (`step_5_tests.model_used`)
- **Categories Created** (`step_6_ui.categories_created`)
- **Requirements Mapped** (`step_8_compliance.requirements_mapped`)
- **Coverage Score** (`step_8_compliance.coverage_score`)
- **Audit Readiness** (`step_8_compliance.audit_readiness`)

## 9. Enhanced Traceability Metrics

### Knowledge Graph Utilization
- **Requirements Mapped** (`enhanced_traceability.kg_utilization.requirements_mapped`)
- **Total KG Nodes** (`enhanced_traceability.kg_utilization.total_kg_nodes`)
- **Total KG Edges** (`enhanced_traceability.kg_utilization.total_kg_edges`)

### Coverage Metrics
- **Coverage Score** (`enhanced_traceability.coverage_score`)
- **Average Tests per Requirement** (`enhanced_traceability.flow_metrics.avg_tests_per_requirement`)
- **Average Requirements per Standard** (`enhanced_traceability.flow_metrics.avg_requirements_per_standard`)
- **Coverage Completeness** (`enhanced_traceability.flow_metrics.coverage_completeness`)

## 10. Individual Test Case Metrics

For each test case:
- **Test ID** (`test_id`)
- **Title** (`title`)
- **Priority** (`priority`)
- **Category** (`category`)
- **Compliance Standards** (`compliance_standards[]`)
- **Confidence Score** (`traceability.confidence_score`)
- **Page Number** (`traceability.pdf_locations[].page_number`)
- **Requirement ID** (`traceability.requirement_id`)
- **KG Coverage** (`traceability.kg_mapping.kg_coverage`)
- **KG Relationships** (`traceability.kg_mapping.kg_relationships`)

## 11. Request Metadata

### File Information
- **Filename** (`filename`)
- **GDPR Mode** (`gdpr_mode`)
- **Agent** (`agent`)
- **Generated At** (timestamp from metadata)

## Suggested Dashboard Layout

### Main Dashboard Cards (Top Row)
1. **Overall Coverage Score** - Large percentage card with status color
2. **Total Test Cases** - With category breakdown
3. **Audit Readiness** - Status badge with readiness level
4. **Requirements Coverage** - Tested vs Untested requirements

### Secondary Metrics Row
1. **Priority Distribution** - Pie/Donut chart (Critical/High/Medium/Low)
2. **Compliance Standards** - Top standards with coverage percentages
3. **Knowledge Graph Stats** - Nodes, edges, density
4. **Pipeline Status** - Step-by-step completion status

### Detailed Sections
1. **Category Breakdown** - Bar chart showing tests per category
2. **Compliance Gaps** - List of identified gaps with severity
3. **Standards Coverage** - Detailed table of all standards
4. **Traceability Matrix** - Requirements to test cases mapping
5. **Page Analysis** - Pages with requirements, compliance, PII
6. **Top Connected Nodes** - Most referenced requirements/test cases

### Advanced Visualizations
1. **Knowledge Graph Visualization** - Interactive graph
2. **Flow Diagram** - Requirements → Tests → Standards flow
3. **Coverage Heatmap** - Page-by-page coverage visualization
4. **Timeline** - Pipeline execution timeline

