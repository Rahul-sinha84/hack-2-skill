import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userQuery = formData.get('userQuery') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    
    // Step 1: Process document with Document AI
    const documentAIFormData = new FormData();
    documentAIFormData.append('file', file);

    const docAIResponse = await fetch(`${baseUrl}/api/document-ai`, {
      method: 'POST',
      body: documentAIFormData,
    });

    if (!docAIResponse.ok) {
      const error = await docAIResponse.json();
      throw new Error(`Document AI processing failed: ${error.error}`);
    }

    const docAIResult = await docAIResponse.json();
    
    // Step 2: Generate test cases with Gemini
    const geminiResponse = await fetch(`${baseUrl}/api/gemini/generate-test-cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText: docAIResult.data.fullText,
        userQuery: userQuery || 'Generate comprehensive test cases for this PRD',
        fileName: file.name,
      }),
    });

    if (!geminiResponse.ok) {
      const error = await geminiResponse.json();
      throw new Error(`Test case generation failed: ${error.error}`);
    }

    const geminiResult = await geminiResponse.json();

    // Step 3: Combine results
    return NextResponse.json({
      success: true,
      data: {
        document: {
          fileName: file.name,
          fileSize: file.size,
          fullText: docAIResult.data.fullText,
          paragraphs: docAIResult.data.paragraphs,
        },
        testCases: geminiResult.data,
        userQuery: userQuery || 'Generate comprehensive test cases for this PRD',
        processedAt: new Date().toISOString(),
        metadata: geminiResult.metadata,
      },
    });

  } catch (error) {
    console.error('PRD processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process PRD', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
