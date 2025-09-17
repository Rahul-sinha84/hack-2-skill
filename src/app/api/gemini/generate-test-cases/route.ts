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
    
    const { documentText, userQuery, fileName } = await request.json();

    if (!documentText) {
      return NextResponse.json({ error: 'No document text provided' }, { status: 400 });
    }

    console.log('Using Vertex AI to generate test cases for:', fileName);

    const prompt = `Generate test cases for this PRD. Focus on key features and requirements.

                    Document: ${fileName}
                    Request: ${userQuery || 'Generate test cases'}

                    PRD:
                    ${documentText}

                    Create 8-12 test cases across 3-4 categories (Functional, UI, Performance, Security). Keep test cases concise but complete.

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
                              "content": "Test steps:\n1. Action\n2. Verify\nExpected: Result",
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
            responseMimeType: 'application/json',
            temperature: 0.1, // Lower temperature for faster, more consistent responses
            maxOutputTokens: 4000, // Limit output for faster generation
            topP: 0.8,
            topK: 10
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Vertex AI response received, parsing JSON...');
      
      // Extract text from Vertex AI response format
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('No generated text found in response');
      }
      
      testData = JSON.parse(generatedText);

    } catch (apiError) {
      console.error('Vertex AI API error:', apiError);
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