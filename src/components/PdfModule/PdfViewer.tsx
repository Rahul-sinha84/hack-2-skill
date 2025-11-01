"use client";

import { useEffect, useRef, useState } from "react";
import {
  PdfLoader,
  PdfHighlighter,
  PdfHighlighterUtils,
} from "react-pdf-highlighter-extended";
import { convertToHighlight, HighlightData } from ".";
import HighlightContainer from "./HighlightContainer";
import { useChat } from "@/app/a/chat/context/ChatContext";
import { PDFDocumentProxy, getDocument } from "pdfjs-dist";

interface PDFViewerProps {
  pdfUrl: string;
  highlightData?: Array<HighlightData>;
  scrollToHighlightId?: string;
}

export default function PDFViewer({
  pdfUrl,
  highlightData = [
    // {
    //   page_number: 2,
    //   bounding_box: {
    //     x_min: 0.17633675038814545,
    //     y_min: 0.7723076939582825,
    //     x_max: 0.8435722589492798,
    //     y_max: 0.8039560317993164,
    //   },
    //   chunk_id: "kg_node_REQ-008",
    // },
  ],
  scrollToHighlightId = "kg_node_REQ-008",
}: PDFViewerProps) {
  const { currentFile } = useChat();

  const highlighterUtilsRef = useRef<PdfHighlighterUtils>(null);

  const [highlights, setHighlights] = useState<any[]>([]);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);

  // convert the pdf file in PDFDocumentProxy
  useEffect(() => {
    const loadPdfDocument = async () => {
      if (currentFile?.file) {
        try {
          // Convert File to ArrayBuffer
          const arrayBuffer = await currentFile.file.arrayBuffer();
          // Load PDF document using PDF.js
          const pdfDoc = await getDocument(arrayBuffer).promise;
          setPdfDocument(pdfDoc);
        } catch (error) {
          console.error("Error loading PDF document:", error);
        }
      }
    };

    loadPdfDocument();
  }, [currentFile?.fileName]);

  // Convert highlight data to library format
  useEffect(() => {
    if (pdfDocument) {
      (async () => {
        const highlights = await Promise.all(
          highlightData.map((data) => convertToHighlight(data, pdfDocument))
        );
        console.log("highlights from useEffect ", { highlights });
        setHighlights(highlights);
      })();
    }
  }, [pdfDocument, highlightData, scrollToHighlightId]);

  // scrolling to the highlights once the pdf and highlights are loaded
  // TODO check and make sure to load this every time when the highlights are changing
  useEffect(() => {
    console.log("useEffect Ran ", highlighterUtilsRef, highlights.length);
    if (!highlighterUtilsRef.current || highlights.length === 0) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (scrollToHighlightId) {
        // Scroll to specific highlight by ID
        const highlight = highlights.find((h) => h.id === scrollToHighlightId);
        if (highlight) {
          highlighterUtilsRef.current?.scrollToHighlight(highlight);
        }
      } else {
        // Scroll to first highlight by default
        highlighterUtilsRef.current?.scrollToHighlight(highlights[0]);
      }
    }, 300); // 300ms delay for smooth scrolling

    return () => clearTimeout(timer);
  }, [highlights, scrollToHighlightId, highlighterUtilsRef.current]);

  return (
    // <div style={{ height: "10rem", width: "100%" }}>
    <PdfLoader document={pdfUrl}>
      {(pdfDocument) => (
        <PdfHighlighter
          pdfDocument={pdfDocument}
          highlights={highlights}
          utilsRef={(utils) => {
            console.log("utilsRef Ran ", { utils });
            highlighterUtilsRef.current = utils;
          }}
          // enableAreaSelection={(event) => event.altKey}
        >
          <HighlightContainer />
        </PdfHighlighter>
      )}
    </PdfLoader>
    // </div>
  );
}
