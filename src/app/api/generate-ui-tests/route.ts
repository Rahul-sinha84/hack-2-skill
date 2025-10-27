import { NextRequest, NextResponse } from 'next/server';
import { VertexAgentResponse } from '@/types/vertex-agent-response';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const gdprMode = formData.get('gdpr_mode') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name} with GDPR mode: ${gdprMode}`);

    // Get the Vertex Agent API URL from environment variables
    const vertexAgentApiUrl = process.env.VERTEX_AGENT_API_URL;
    
    if (!vertexAgentApiUrl) {
      throw new Error('Vertex Agent API URL is not configured. Please set VERTEX_AGENT_API_URL environment variable.');
    }

    // Call the Vertex Agent API
    const vertexAgentResponse = await fetch(
      `${vertexAgentApiUrl}/generate-ui-tests?gdpr_mode=${gdprMode}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!vertexAgentResponse.ok) {
      const errorText = await vertexAgentResponse.text();
      console.error('Vertex Agent API Error:', errorText);
      throw new Error(`Failed to generate test cases: ${vertexAgentResponse.status} ${vertexAgentResponse.statusText}`);
    }

    const apiResponse: VertexAgentResponse = await vertexAgentResponse.json();

    // Validate the response structure
    if (!apiResponse.test_suite || !apiResponse.test_suite.test_categories) {
      throw new Error('Invalid response structure from Vertex Agent API');
    }

    console.log(`Successfully generated ${apiResponse.test_suite.statistics.total_tests} test cases across ${apiResponse.test_suite.test_categories.length} categories`);

    // Transform the response to match the existing frontend structure
    const transformedData = transformVertexAgentResponse(apiResponse);

    return NextResponse.json({
      success: true,
      data: transformedData,
      metadata: {
        fileName: file.name,
        gdprMode,
        generatedAt: new Date().toISOString(),
        totalCategories: apiResponse.test_suite.test_categories.length,
        totalTestCases: apiResponse.test_suite.statistics.total_tests,
        coverageScore: apiResponse.coverage_analysis?.coverage_score || 0,
        auditReadiness: apiResponse.compliance_dashboard?.overview?.audit_readiness || 'UNKNOWN',
        usingVertexAgent: true,
        enhancedData: apiResponse // Store the full enhanced data for advanced features
      }
    });

  } catch (error) {
    console.error('Test case generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate test cases', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Transform the Vertex Agent API response to match existing frontend structure
function transformVertexAgentResponse(apiResponse: VertexAgentResponse) {
  console.log("🔄 Transforming Vertex Agent API response...");
  
  const categories = apiResponse.test_suite.test_categories.map((category, categoryIndex) => ({
    id: `category_${categoryIndex + 1}`,
    label: category.category_name,
    description: `Enhanced ${category.category_name} with ${category.total_tests} test cases`,
    testCases: category.test_cases.map((test, testIndex) => {
      console.log(`📝 Mapping test case: ${test.title}`, {
        requirement_id: test.traceability?.requirement_id,
        page_number: test.traceability?.pdf_locations?.[0]?.page_number,
        confidence_score: test.traceability?.confidence_score
      });
      
      return {
        id: test.test_id,
        title: test.title,
        content: `${test.description}\n\nExpected Result: ${test.expected_result}\n\nDerived From: ${test.derived_from}`,
        priority: test.priority,
        status: "Not Run", // Default status for new tests
        traceability: {
          requirement_id: test.traceability?.requirement_id,
          requirement_text: test.traceability?.requirement_text,
          page_number: test.traceability?.pdf_locations?.[0]?.page_number,
          bounding_box: test.traceability?.pdf_locations?.[0]?.bounding_box,
          chunk_id: test.traceability?.pdf_locations?.[0]?.chunk_id,
          confidence_score: test.traceability?.confidence_score,
          linked_edges: test.traceability?.linked_edges || [],
          compliance_references: test.traceability?.compliance_references || []
        },
        compliance_tags: test.compliance_standards?.map((standard: string) => ({
          id: standard,
          name: standard,
          full_name: standard,
          color: "#4CAF50",
          confidence: 0.9,
          source: "RAG Context"
        })) || [],
        tooltip: `Test case derived from: ${test.derived_from}`,
        metadata: {
          created_by: "Vertex Agent AI",
          confidence: test.traceability?.confidence_score || 0.8,
          auto_generated: true,
          rag_enhanced: true
        },
      };
    }),
  }));

  return {
    documentSummary: `Enhanced test generation for ${apiResponse.filename}`,
    categories,
    enhancedMetadata: {
      coverageScore: apiResponse.coverage_analysis?.coverage_score || 0,
      auditReadiness: apiResponse.compliance_dashboard?.overview?.audit_readiness || 'UNKNOWN',
      totalRequirements: apiResponse.test_suite.statistics.requirements_covered,
      complianceStandards: apiResponse.knowledge_graph.metadata.compliance_by_type,
      knowledgeGraphNodes: apiResponse.knowledge_graph.metadata.total_nodes,
      knowledgeGraphEdges: apiResponse.knowledge_graph.metadata.total_edges,
      pipelineSteps: apiResponse.pipeline_metadata
    }
  };
}
