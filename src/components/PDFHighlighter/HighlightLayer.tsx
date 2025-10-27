"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  BoundingBox,
  PixelBoundingBox,
  PageDimensions,
  HighlightData,
} from "../../types/pdf-highlighter";
import {
  denormalizeBoundingBox,
  isPointInBoundingBox,
  generateHighlightId,
} from "./utils";

interface HighlightLayerProps {
  pageNumber: number;
  pageDimensions: PageDimensions;
  highlightData?: HighlightData;
  isActive: boolean;
  onHighlightClick?: (data: HighlightData) => void;
  className?: string;
}

const HighlightLayer: React.FC<HighlightLayerProps> = ({
  pageNumber,
  pageDimensions,
  highlightData,
  isActive,
  onHighlightClick,
  className = "",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredHighlight, setHoveredHighlight] = useState<string | null>(null);

  // Get highlights for the current page
  const currentPageHighlights =
    highlightData?.pdf_locations?.filter(
      (location) => location.page_number === pageNumber
    ) || [];

  // Convert bounding boxes to pixel coordinates
  const pixelHighlights = currentPageHighlights.map((location, index) => {
    const pixelBox = denormalizeBoundingBox(
      location.bounding_box,
      pageDimensions
    );
    return {
      id: generateHighlightId(
        highlightData?.test_id || "unknown",
        pageNumber,
        index
      ),
      pixelBox,
      location,
      testData: highlightData,
    };
  });

  // Handle click events on highlights
  const handleHighlightClick = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      if (!highlightData || !onHighlightClick) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Find which highlight was clicked
      const clickedHighlight = pixelHighlights.find((highlight) =>
        isPointInBoundingBox({ x: clickX, y: clickY }, highlight.pixelBox)
      );

      if (clickedHighlight) {
        onHighlightClick(highlightData);
      }
    },
    [highlightData, onHighlightClick, pixelHighlights]
  );

  // Handle mouse move for hover effects
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      if (!highlightData) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Find which highlight is being hovered
      const hoveredHighlight = pixelHighlights.find((highlight) =>
        isPointInBoundingBox({ x: mouseX, y: mouseY }, highlight.pixelBox)
      );

      setHoveredHighlight(hoveredHighlight?.id || null);
    },
    [highlightData, pixelHighlights]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredHighlight(null);
  }, []);

  // Render highlight rectangles
  const renderHighlights = () => {
    if (!isActive || pixelHighlights.length === 0) return null;

    return pixelHighlights.map((highlight) => {
      const isHovered = hoveredHighlight === highlight.id;
      const { x, y, width, height } = highlight.pixelBox;

      return (
        <rect
          key={highlight.id}
          x={x}
          y={y}
          width={width}
          height={height}
          className={`pdf-highlight ${isHovered ? "hovered" : ""}`}
          fill="rgba(255, 235, 59, 0.3)"
          stroke="rgba(255, 193, 7, 0.8)"
          strokeWidth="2"
          strokeDasharray={isHovered ? "5,5" : "0"}
          style={{
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            filter: isHovered
              ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              : "none",
          }}
          onClick={handleHighlightClick}
        />
      );
    });
  };

  // Render highlight labels
  const renderLabels = () => {
    if (!isActive || pixelHighlights.length === 0) return null;

    return pixelHighlights.map((highlight) => {
      const { x, y, width, height } = highlight.pixelBox;
      const isHovered = hoveredHighlight === highlight.id;

      return (
        <g key={`label-${highlight.id}`}>
          {/* Background circle for the label */}
          <circle
            cx={x + width - 8}
            cy={y + 8}
            r="8"
            fill="rgba(255, 193, 7, 0.9)"
            stroke="white"
            strokeWidth="1"
            style={{
              opacity: isHovered ? 1 : 0.7,
              transition: "opacity 0.2s ease-in-out",
            }}
          />
          {/* Label text */}
          <text
            x={x + width - 8}
            y={y + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pdf-highlight-label"
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              fill: "white",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            !
          </text>
        </g>
      );
    });
  };

  if (!isActive || pixelHighlights.length === 0) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      className={`pdf-highlight-layer ${className}`}
      width={pageDimensions.width * pageDimensions.scale}
      height={pageDimensions.height * pageDimensions.scale}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "auto",
        zIndex: 10,
      }}
      onClick={handleHighlightClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {renderHighlights()}
      {renderLabels()}
    </svg>
  );
};

export default HighlightLayer;
