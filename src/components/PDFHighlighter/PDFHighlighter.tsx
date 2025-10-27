"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  PDFHighlighterProps,
  PageDimensions,
} from "../../types/pdf-highlighter";
import {
  createPDFBlobURL,
  revokePDFBlobURL,
  getPageDimensions,
  debounce,
} from "./utils";
import HighlightLayer from "./HighlightLayer";
import "./_pdf_highlighter.scss";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

const PDFHighlighter: React.FC<PDFHighlighterProps> = ({
  pdfFile,
  highlightData,
  onHighlightClick,
  onPageChange,
  className = "",
  showNavigation = true,
  showZoomControls = true,
  initialPage = 1,
  zoom = 1,
  fitWidth = true,
  fitHeight = false,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  // Create blob URL from PDF file
  useEffect(() => {
    const url = createPDFBlobURL(pdfFile);
    setPdfUrl(url);

    return () => {
      revokePDFBlobURL(url);
    };
  }, [pdfFile]);

  // Handle PDF load success
  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
    },
    []
  );

  // Handle PDF load error
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("PDF load error:", error);
    setError("Failed to load PDF document");
    setIsLoading(false);
  }, []);

  // Handle page load success
  const onPageLoadSuccess = useCallback((page: any) => {
    const dimensions = getPageDimensions(page);
    setPageDimensions(dimensions);
  }, []);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= (numPages || 1)) {
        setCurrentPage(newPage);
        onPageChange?.(newPage);
      }
    },
    [numPages, onPageChange]
  );

  // Navigation handlers
  const goToPreviousPage = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const goToNextPage = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const goToLastPage = useCallback(() => {
    handlePageChange(numPages || 1);
  }, [numPages, handlePageChange]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setCurrentZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCurrentZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setCurrentZoom(1);
  }, []);

  const handleZoomFit = useCallback(() => {
    if (containerRef.current && pageDimensions) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const scale = calculateFitScale(
        pageDimensions.width,
        pageDimensions.height,
        containerWidth,
        containerHeight,
        fitWidth
      );
      setCurrentZoom(scale);
    }
  }, [pageDimensions, fitWidth]);

  // Calculate fit scale helper
  const calculateFitScale = (
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number,
    fitWidth: boolean
  ): number => {
    if (fitWidth) {
      return containerWidth / contentWidth;
    } else {
      return Math.min(
        containerWidth / contentWidth,
        containerHeight / contentHeight
      );
    }
  };

  // Debounced zoom fit for window resize
  const debouncedZoomFit = useCallback(
    debounce(() => {
      if (fitWidth || fitHeight) {
        handleZoomFit();
      }
    }, 250),
    [fitWidth, fitHeight, handleZoomFit]
  );

  // Handle window resize
  useEffect(() => {
    window.addEventListener("resize", debouncedZoomFit);
    return () => window.removeEventListener("resize", debouncedZoomFit);
  }, [debouncedZoomFit]);

  // Auto-fit on initial load
  useEffect(() => {
    if (pageDimensions && (fitWidth || fitHeight)) {
      handleZoomFit();
    }
  }, [pageDimensions, fitWidth, fitHeight, handleZoomFit]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`pdf-highlighter loading ${className}`}>
        <div className="pdf-loading">
          <div className="pdf-loading-spinner"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`pdf-highlighter error ${className}`}>
        <div className="pdf-error">
          <div className="pdf-error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render PDF viewer
  return (
    <div className={`pdf-highlighter ${className}`} ref={containerRef}>
      {/* Navigation Controls */}
      {showNavigation && (
        <div className="pdf-navigation">
          <div className="pdf-navigation-controls">
            <button
              onClick={goToFirstPage}
              disabled={currentPage <= 1}
              className="pdf-nav-button"
              title="First page"
            >
              ⏮
            </button>
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="pdf-nav-button"
              title="Previous page"
            >
              ⏪
            </button>
            <span className="pdf-page-info">
              {currentPage} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= (numPages || 1)}
              className="pdf-nav-button"
              title="Next page"
            >
              ⏩
            </button>
            <button
              onClick={goToLastPage}
              disabled={currentPage >= (numPages || 1)}
              className="pdf-nav-button"
              title="Last page"
            >
              ⏭
            </button>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      {showZoomControls && (
        <div className="pdf-zoom-controls">
          <button
            onClick={handleZoomOut}
            className="pdf-zoom-button"
            title="Zoom out"
          >
            −
          </button>
          <span className="pdf-zoom-info">
            {Math.round(currentZoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="pdf-zoom-button"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomReset}
            className="pdf-zoom-button"
            title="Reset zoom"
          >
            ⌂
          </button>
          <button
            onClick={handleZoomFit}
            className="pdf-zoom-button"
            title="Fit to width"
          >
            ⇄
          </button>
        </div>
      )}

      {/* PDF Document */}
      <div className="pdf-document-container">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="pdf-page-loading">Loading page...</div>}
          error={<div className="pdf-page-error">Failed to load page</div>}
        >
          <div className="pdf-page-wrapper" ref={pageRef}>
            <Page
              pageNumber={currentPage}
              scale={currentZoom}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />

            {/* Highlight Layer */}
            {pageDimensions && highlightData && (
              <HighlightLayer
                pageNumber={currentPage}
                pageDimensions={{
                  ...pageDimensions,
                  scale: currentZoom,
                }}
                highlightData={highlightData}
                isActive={true}
                onHighlightClick={onHighlightClick}
              />
            )}
          </div>
        </Document>
      </div>
    </div>
  );
};

export default PDFHighlighter;
