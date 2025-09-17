import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// Initialize Google Auth for Vertex AI
const auth = new GoogleAuth({
  keyFilename: './key.json',
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

export async function POST(request: NextRequest) {
  try {
    console.log('Using project: poc-genai-hacks for Vertex AI');
    
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
      // Get access token
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      // Make direct API call to Vertex AI with optimized config
      const response = await fetch('https://aiplatform.googleapis.com/v1/projects/poc-genai-hacks/locations/global/publishers/google/models/gemini-2.0-flash-001:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
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
      let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error("No generated text found in response");
      }

      // Clean the generated text to ensure it's valid JSON
      // Remove markdown fences and trim whitespace
      generatedText = generatedText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Find the first '{' and last '}' to extract the JSON object
      const startIndex = generatedText.indexOf("{");
      const endIndex = generatedText.lastIndexOf("}");
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("No valid JSON object found in the response");
      }
      generatedText = generatedText.substring(startIndex, endIndex + 1);

      try {
        testData = JSON.parse(generatedText);
      } catch (parseError) {
        console.error(
          "Failed to parse JSON from Vertex AI response. Response text:",
          generatedText
        );
        // Re-throw a more informative error
        throw new Error(
          `SyntaxError: Failed to parse JSON from AI response. Details: ${
            (parseError as Error).message
          }`
        );
      }
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