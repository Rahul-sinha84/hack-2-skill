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
  const highlightsReadyRef = useRef(false);
  const prevHighlightDataRef = useRef<Array<HighlightData> | undefined>(
    highlightData
  );
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const utilsReadyRef = useRef(false);
  const highlightsRef = useRef<any[]>([]);
  const scrollToHighlightIdRef = useRef<string | undefined>(
    scrollToHighlightId
  );

  const [highlights, setHighlights] = useState<any[]>([]);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [scrollTrigger, setScrollTrigger] = useState(0); // State to trigger scrolls

  // Keep refs in sync with state
  useEffect(() => {
    highlightsRef.current = highlights;
  }, [highlights]);

  useEffect(() => {
    scrollToHighlightIdRef.current = scrollToHighlightId;
  }, [scrollToHighlightId]);

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
      // Check if highlightData actually changed (handle undefined/null cases)
      const currentDataStr = highlightData
        ? JSON.stringify(highlightData)
        : "null";
      const prevDataStr = prevHighlightDataRef.current
        ? JSON.stringify(prevHighlightDataRef.current)
        : "null";

      const dataChanged = currentDataStr !== prevDataStr;

      if (dataChanged) {
        highlightsReadyRef.current = false;
        prevHighlightDataRef.current = highlightData;
        // Clear highlights immediately when data changes
        setHighlights([]);
      }

      (async () => {
        try {
          // If no highlight data, clear highlights
          if (!highlightData || highlightData.length === 0) {
            setHighlights([]);
            highlightsReadyRef.current = true;
            return;
          }

          const highlights = await Promise.all(
            highlightData.map((data) => convertToHighlight(data, pdfDocument))
          );
          console.log("highlights from useEffect ", { highlights });
          setHighlights(highlights);

          // Mark highlights as ready after a brief delay to ensure rendering
          setTimeout(() => {
            highlightsReadyRef.current = true;
            // Trigger scroll by updating state
            if (utilsReadyRef.current && highlighterUtilsRef.current) {
              setScrollTrigger((prev) => prev + 1);
            }
          }, 150); // Slightly longer delay to ensure rendering
        } catch (error) {
          console.error("Error converting highlights:", error);
          setHighlights([]);
          highlightsReadyRef.current = true;
        }
      })();
    }
  }, [pdfDocument, highlightData]);

  // Scroll function with retry logic - uses refs to always get latest values
  const performScroll = (attempt: number = 1, maxAttempts: number = 4) => {
    try {
      if (!highlighterUtilsRef.current) return;

      const currentHighlights = highlightsRef.current;
      const currentScrollId = scrollToHighlightIdRef.current;

      if (currentScrollId) {
        // Scroll to specific highlight by ID
        const highlight = currentHighlights.find(
          (h) => h.id === currentScrollId
        );
        if (highlight) {
          console.log(
            "Scrolling to highlight:",
            highlight.id,
            "attempt:",
            attempt
          );
          highlighterUtilsRef.current.scrollToHighlight(highlight);

          // Retry with increasing delays to handle pages that need to be rendered
          if (attempt < maxAttempts) {
            const delays = [600, 1200, 1800, 2500]; // Progressive delays
            scrollTimeoutRef.current = setTimeout(() => {
              performScroll(attempt + 1, maxAttempts);
            }, delays[attempt - 1]);
          }
        } else {
          console.warn(
            "Highlight not found:",
            currentScrollId,
            "available:",
            currentHighlights.map((h) => h.id)
          );
        }
      } else if (currentHighlights.length > 0) {
        // Scroll to first highlight by default
        console.log("Scrolling to first highlight, attempt:", attempt);
        highlighterUtilsRef.current.scrollToHighlight(currentHighlights[0]);

        // Retry with increasing delays
        if (attempt < maxAttempts) {
          const delays = [600, 1200, 1800, 2500];
          scrollTimeoutRef.current = setTimeout(() => {
            performScroll(attempt + 1, maxAttempts);
          }, delays[attempt - 1]);
        }
      }
    } catch (error) {
      console.error("Error scrolling to highlight:", error);
      // Retry on error
      if (attempt < maxAttempts) {
        const delays = [600, 1200, 1800, 2500];
        scrollTimeoutRef.current = setTimeout(() => {
          performScroll(attempt + 1, maxAttempts);
        }, delays[attempt - 1]);
      }
    }
  };

  // Scroll to highlight when highlights are ready and utils are available
  useEffect(() => {
    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    // Wait for highlights to be ready and utils to be available
    if (
      !highlighterUtilsRef.current ||
      highlights.length === 0 ||
      !highlightsReadyRef.current ||
      !utilsReadyRef.current
    ) {
      return;
    }

    console.log("Scroll effect triggered:", {
      highlightsCount: highlights.length,
      scrollToHighlightId,
      highlightData: highlightData?.length,
    });

    // Use double requestAnimationFrame to ensure DOM is ready
    // Then start scrolling with a longer initial delay to allow pages to render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollTimeoutRef.current = setTimeout(() => {
          performScroll();
        }, 400); // Increased initial delay for page rendering
      });
    });

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [highlights, scrollToHighlightId, scrollTrigger]);

  // Additional effect to trigger scroll when highlightData changes
  useEffect(() => {
    if (
      highlightData &&
      highlightData.length > 0 &&
      utilsReadyRef.current &&
      highlighterUtilsRef.current &&
      highlightsReadyRef.current
    ) {
      // Small delay to ensure highlights are rendered
      const timer = setTimeout(() => {
        setScrollTrigger((prev) => prev + 1);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [highlightData]);

  return (
    // <div style={{ height: "10rem", width: "100%" }}>
    <PdfLoader document={pdfUrl}>
      {(pdfDocument) => (
        <PdfHighlighter
          pdfDocument={pdfDocument}
          highlights={highlights}
          utilsRef={(utils) => {
            console.log("utilsRef Ran ", { utils });
            const wasNull = highlighterUtilsRef.current === null;
            highlighterUtilsRef.current = utils;

            if (utils) {
              utilsReadyRef.current = true;

              // If utils were just set and highlights are ready, trigger scroll
              if (
                wasNull &&
                highlights.length > 0 &&
                highlightsReadyRef.current
              ) {
                // Trigger scroll via state update
                setScrollTrigger((prev) => prev + 1);
              }
            }
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
