"use client";

import {
  useHighlightContainerContext,
  AreaHighlight,
  TextHighlight,
} from "react-pdf-highlighter-extended";
import "react-pdf-highlighter-extended/dist/esm/style/pdf_viewer.css";
import "react-pdf-highlighter-extended/dist/esm/style/PdfHighlighter.css";
import "react-pdf-highlighter-extended/dist/esm/style/AreaHighlight.css";
import "react-pdf-highlighter-extended/dist/esm/style/TextHighlight.css";

function HighlightContainer() {
  const { highlight, isScrolledTo } = useHighlightContainerContext();

  const isAreaHighlight = highlight.type === "area";

  return isAreaHighlight ? (
    <AreaHighlight
      highlight={highlight}
      isScrolledTo={isScrolledTo}
      style={{
        background: "yellow",
        opacity: 1,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  ) : (
    <TextHighlight
      highlight={highlight}
      isScrolledTo={isScrolledTo}
      style={{
        background: "rgba(255, 143, 143, 0.4)",
      }}
    />
  );
}

export default HighlightContainer;
