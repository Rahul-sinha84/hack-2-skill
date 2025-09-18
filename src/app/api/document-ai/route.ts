import { NextRequest, NextResponse } from "next/server";
import DocumentAIClientSingleton from '@/utils/documentAIClient';
import { google } from "@google-cloud/documentai/build/protos/protos";

/**
 * Helper function to safely extract text from a document text anchor.
 * @param {object} textAnchor - The textAnchor object from the Document AI response.
 * @param {string} text - The full text of the document.
 * @returns {string} The extracted text segment.
 */
const getText = (
  textAnchor: google.cloud.documentai.v1.Document.ITextAnchor,
  text: string
): string => {
  if (!textAnchor?.textSegments || textAnchor.textSegments.length === 0) {
    return "";
  }
  // First shard in document doesn't have startIndex property
  const startIndex = textAnchor.textSegments[0].startIndex
    ? parseInt(textAnchor.textSegments[0].startIndex.toString(), 10)
    : 0;
  const endIndex = parseInt(
    textAnchor.textSegments[0].endIndex!.toString(),
    10
  );
  return text.substring(startIndex, endIndex);
};

// ================== CLIENT INSTANTIATION ==================

const DOCUMENT_AI_PROJECT_ID = process.env.DOCUMENT_AI_PROJECT_ID;
const DOCUMENT_AI_LOCATION = process.env.DOCUMENT_AI_LOCATION || "us";
const DOCUMENT_AI_PROCESSOR_ID = process.env.DOCUMENT_AI_PROCESSOR_ID;

/**
 * API route handler for processing a document with Google Cloud Document AI.
 */
export async function POST(request: NextRequest) {
  try {

    // Client is initialized safely on the first request
    const client = await DocumentAIClientSingleton.getClient();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a base64 encoded string
    const bytes = await file.arrayBuffer();
    const encodedImage = Buffer.from(bytes).toString("base64");

    // Construct the full resource name of the processor using hardcoded values
    const name = `projects/${DOCUMENT_AI_PROJECT_ID}/locations/${DOCUMENT_AI_LOCATION}/processors/${DOCUMENT_AI_PROCESSOR_ID}`;

    console.log("Processing document with processor:", name);
    console.log("File info:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Create the request payload for the Document AI API
    const requestPayload = {
      name,
      skipHumanReview: true,
      rawDocument: {
        mimeType: file.type || "application/pdf", // Use file's MIME type, fallback to PDF
        content: encodedImage,
      },
    };

    // Call the Document AI API to process the document
    const [result] = await client.processDocument(requestPayload);

    // DEBUG LINE: Log the full, pretty-printed response from the API to the server console
    // console.log(
    //   "Full Document AI API Response:",
    //   JSON.stringify(result, null, 2)
    // );

    const { document } = result;

    if (!document || !document.text) {
      return NextResponse.json(
        { error: "Failed to process document or document is empty" },
        { status: 500 }
      );
    }

    const { text, pages } = document;

    // Handle cases where the document has no pages
    if (!pages || pages.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          fullText: text,
          paragraphs: [],
          tables: [],
          fileName: file.name,
          fileSize: file.size,
        },
      });
    }

    // Extract paragraphs from all pages in the document
    const extractedParagraphs =
      pages.flatMap(
        (page) =>
          page.paragraphs?.map((paragraph) =>
            getText(paragraph.layout!.textAnchor!, text!)
          ) || []
      );

    // Extract tables from all pages
    const extractedTables = pages.flatMap((page) =>
      (page.tables || []).map((table) => {
        const header =
          table.headerRows?.[0]?.cells
            ?.map((cell) => getText(cell.layout!.textAnchor!, text!))
            .join(" | ") || "";
        const body =
          table.bodyRows
            ?.map(
              (row) =>
                row.cells
                  ?.map((cell) => getText(cell.layout!.textAnchor!, text!))
                  .join(" | ") || ""
            )
            .join("\\n") || "";
        return `${header}\\n${body}`;
      })
    );

    // Truncate the full text to a reasonable limit
    const MAX_TEXT_LENGTH = 15000;
    const truncatedText =
      text!.length > MAX_TEXT_LENGTH
        ? text!.substring(0, MAX_TEXT_LENGTH) + "..."
        : text;

    // Return a successful response with the extracted data
    return NextResponse.json({
      success: true,
      data: {
        fullText: truncatedText,
        paragraphs: extractedParagraphs,
        tables: extractedTables,
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error("Error in Document AI processing:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        error: "Document processing failed on the server",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}