import { HighlightType } from "react-pdf-highlighter-extended";
import type { PDFDocumentProxy } from "pdfjs-dist";

// Your input format
export interface HighlightData {
  page_number: number;
  bounding_box: {
    x_min: number; // 0-1 range
    y_min: number; // 0-1 range
    x_max: number; // 0-1 range
    y_max: number; // 0-1 range
  };
  chunk_id: string;
}

// Convert to library format
export const convertToHighlight = async (
  data: HighlightData,
  pdfDocument: PDFDocumentProxy
) => {
  const page = await pdfDocument.getPage(data.page_number);
  const viewPort = page.getViewport({ scale: 1.0 });

  const pageWidth = viewPort.width;
  const pageHeight = viewPort.height;

  const { x_min, y_min, x_max, y_max } = data.bounding_box;

  // Convert normalized coordinates to PDF points
  // NOTE: PDF coordinates have origin at BOTTOM-LEFT
  // So we need to invert Y coordinates
  const x1 = x_min * pageWidth;
  const y1 = (1 - y_max) * pageHeight; // Inverted Y!
  const x2 = x_max * pageWidth;
  const y2 = (1 - y_min) * pageHeight; // Inverted Y!

  return {
    id: data.chunk_id,
    type: "area" as HighlightType,
    position: {
      pageNumber: data.page_number,
      boundingRect: {
        x1: x_min * pageWidth,
        y1: y_min * pageHeight,
        x2: x_max * pageWidth,
        y2: y_max * pageHeight,
        width: pageWidth,
        height: pageHeight,
        pageNumber: data.page_number,
      },
      rects: [],
    },
    content: {
      text: "",
    },
    comment: {
      text: "",
      emoji: "",
    },
  };
};
