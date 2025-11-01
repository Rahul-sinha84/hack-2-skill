"use client";

import React, { useState, useRef, useEffect } from "react";
import "./_tooltip.scss";

interface TooltipProps {
  children: React.ReactElement;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const [tooltipStyles, setTooltipStyles] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Smart positioning based on available space using fixed positioning
  useEffect(() => {
    if (isVisible && wrapperRef.current && tooltipRef.current) {
      // Use requestAnimationFrame to ensure the tooltip is fully rendered and measured
      requestAnimationFrame(() => {
        if (!wrapperRef.current || !tooltipRef.current) return;

        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Calculate available space below
        const spaceBelow = viewportHeight - wrapperRect.bottom;
        const spaceAbove = wrapperRect.top;

        // Tooltip height with offset (8px padding)
        const tooltipHeight = tooltipRect.height + 8;
        const tooltipWidth = tooltipRect.width;

        // Calculate ideal horizontal center position (center of trigger element)
        const idealLeft = wrapperRect.left + wrapperRect.width / 2;

        // Margin from screen edges
        const edgeMargin = 12;

        // Since we use transform: translateX(-50%), the tooltip extends
        // tooltipWidth/2 to the left and right from the left position
        // Calculate bounds to keep entire tooltip within viewport
        const minLeft = tooltipWidth / 2 + edgeMargin; // Minimum left to keep left edge visible
        const maxLeft = viewportWidth - tooltipWidth / 2 - edgeMargin; // Maximum left to keep right edge visible

        // Clamp the left position to stay within bounds
        const clampedLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft));

        // If not enough space below and more space above, position on top
        if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
          setPosition("top");
          setTooltipStyles({
            top: wrapperRect.top - tooltipRect.height - 8,
            left: clampedLeft,
          });
        } else {
          setPosition("bottom");
          setTooltipStyles({
            top: wrapperRect.bottom + 8,
            left: clampedLeft,
          });
        }
      });
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      className="tooltip__wrapper"
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && text && (
        <div
          ref={tooltipRef}
          className={`tooltip__content tooltip__content--${position}`}
          role="tooltip"
          style={{
            left: `${tooltipStyles.left}px`,
            top: `${tooltipStyles.top}px`,
            transform: "translateX(-50%)",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
