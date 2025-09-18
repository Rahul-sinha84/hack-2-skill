import { NextRequest, NextResponse } from 'next/server';
import GeminiAuthSingleton from '@/utils/geminiAuth'; 

// Configuration validation and setup
function getGeminiConfig() {
  const projectId = GeminiAuthSingleton.getProjectId();
  const location = process.env.GOOGLE_CLOUD_LOCATION;
  const model = process.env.GEMINI_MODEL;
  
  if (!location) {
    throw new Error('GEMINI_LOCATION environment variable is required');
  }
  
  if (!model) {
    throw new Error('GEMINI_MODEL environment variable is required');
  }
  
  return { projectId, location, model };
}

// Clean and parse JSON response from Gemini
function parseGeminiResponse(text: string) {
  // Clean the generated text to ensure it's valid JSON
  let cleanedText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Find the first '{' and last '}' to extract the JSON object
  const startIndex = cleanedText.indexOf("{");
  const endIndex = cleanedText.lastIndexOf("}");
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("No valid JSON object found in the response");
  }
  
  cleanedText = cleanedText.substring(startIndex, endIndex + 1);
  
  try {
    return JSON.parse(cleanedText);
  } catch (parseError) {
    console.error("Failed to parse JSON from Vertex AI response. Response text:", cleanedText);
    throw new Error(
      `SyntaxError: Failed to parse JSON from AI response. Details: ${
        (parseError as Error).message
      }`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = getGeminiConfig();
    console.log(`Using project: ${config.projectId} for Vertex AI`);
    
    const { documentText, tables, userQuery, fileName } = await request.json();

    if (!documentText) {
      return NextResponse.json({ error: 'No document text provided' }, { status: 400 });
    }

    console.log("Using Vertex AI to generate test cases for:", fileName);

    const prompt = `Generate test cases for this PRD.

                    **Primary Goal:**
                    Follow the user's request. The user's request is: "${
                      userQuery || "Generate test cases"
                    }"

                    **If the user's request specifies a number of test cases or categories, you MUST follow it.**

                    **If the user's request is generic, follow this default guideline:**
                    Create 8-12 test cases across 4-5 categories (Functional, UI, Performance, Security).

                    **Document Details:**
                    - Document: ${fileName}
                    - PRD Content:
                    ${documentText}
                    - Tables (pay special attention to these):
                    ${tables.join("\\n\\n")}

                    **General Guidelines:**
                    - Focus on key features and requirements.
                    - Keep test cases concise but complete.
                    
                    **Output Format:**
                    Respond with JSON only:
                    {
                      "documentSummary": "Brief 1-2 sentence summary of what this PRD is about",
                      "categories": [
                        {
                          "id": "functional",
                          "label": "Functional Testing", 
                          "description": "Core functionality tests",
                          "testCases": [
                            {
                              "id": "tc_1",
                              "title": "Brief test title",
                              "content": "Test steps:\\n1. Action\\n2. Verify\\nExpected: Result",
                              "priority": "High"
                            }
                          ]
                        }
                      ]
                    }`;

    let testData;
    try {
      // Get a cached access token from the singleton
      const accessToken = await GeminiAuthSingleton.getAccessToken();

      // Build the endpoint URL using configuration
      const apiEndpoint = `https://aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${config.model}:generateContent`;
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1, // Lower temperature for faster, more consistent responses
            maxOutputTokens: 8192, // Limit output for faster generation
            topP: 0.8,
            topK: 10,
          },
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Vertex AI response received, parsing JSON...");

      // Extract text from Vertex AI response format
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error("No generated text found in response");
      }

      // Parse the response using our utility function
      testData = parseGeminiResponse(generatedText);
    } catch (apiError) {
      console.error("Vertex AI API error:", apiError);
      return NextResponse.json(
        { 
          error: 'Failed to generate test cases via Vertex AI', 
          details: apiError instanceof Error ? apiError.message : 'Unknown API error' 
        },
        { status: 500 }
      );
    }

    // Validate the structure of the response from the AI
    if (!testData.categories || !Array.isArray(testData.categories)) {
      throw new Error('Invalid JSON structure in Vertex AI response');
    }

    // Add unique IDs to the response data for easier frontend handling
    testData.categories = testData.categories.map((category: any, catIndex: number) => ({
      ...category,
      id: category.id || `category_${catIndex + 1}`,
      testCases: (category.testCases || []).map((testCase: any, tcIndex: number) => ({
        ...testCase,
        id: testCase.id || `tc_${catIndex + 1}_${tcIndex + 1}`,
      })),
    }));

    console.log(`Generated ${testData.categories.length} categories with total test cases:`, 
      testData.categories.reduce((sum: number, cat: any) => sum + (cat.testCases?.length || 0), 0));

    // Return a successful response
    return NextResponse.json({
      success: true,
      data: testData,
      metadata: {
        fileName,
        userQuery,
        documentSummary: testData.documentSummary || `PRD document "${fileName}" processed for test case generation`,
        generatedAt: new Date().toISOString(),
        totalCategories: testData.categories.length,
        totalTestCases: testData.categories.reduce((sum: number, cat: any) => sum + (cat.testCases?.length || 0), 0),
        usingVertexAI: true
      }
    });

  } catch (error) {
    console.error('Overall test case generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate test cases', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}