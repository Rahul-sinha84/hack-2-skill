import {
  BoundingBox,
  PixelBoundingBox,
  PageDimensions,
} from "../../types/pdf-highlighter";

/**
 * Convert normalized bounding box coordinates (0-1 range) to pixel coordinates
 */
export function denormalizeBoundingBox(
  boundingBox: BoundingBox,
  pageDimensions: PageDimensions
): PixelBoundingBox {
  const { x_min, y_min, x_max, y_max } = boundingBox;
  const { width, height, scale } = pageDimensions;

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return {
    x: x_min * scaledWidth,
    y: y_min * scaledHeight,
    width: (x_max - x_min) * scaledWidth,
    height: (y_max - y_min) * scaledHeight,
  };
}

/**
 * Check if a point is within a bounding box
 */
export function isPointInBoundingBox(
  point: { x: number; y: number },
  boundingBox: PixelBoundingBox
): boolean {
  return (
    point.x >= boundingBox.x &&
    point.x <= boundingBox.x + boundingBox.width &&
    point.y >= boundingBox.y &&
    point.y <= boundingBox.y + boundingBox.height
  );
}

/**
 * Create a blob URL from a File or Blob object
 */
export function createPDFBlobURL(pdfFile: File | Blob | string): string {
  if (typeof pdfFile === "string") {
    return pdfFile;
  }
  return URL.createObjectURL(pdfFile);
}

/**
 * Clean up blob URL to prevent memory leaks
 */
export function revokePDFBlobURL(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Calculate the scale factor to fit content within container
 */
export function calculateFitScale(
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
  fitWidth: boolean = true
): number {
  if (fitWidth) {
    return containerWidth / contentWidth;
  } else {
    return Math.min(
      containerWidth / contentWidth,
      containerHeight / contentHeight
    );
  }
}

/**
 * Scroll to a specific highlight within the PDF viewer
 */
export function scrollToHighlight(
  container: HTMLElement,
  highlightElement: HTMLElement
): void {
  const containerRect = container.getBoundingClientRect();
  const highlightRect = highlightElement.getBoundingClientRect();

  const scrollTop =
    container.scrollTop + highlightRect.top - containerRect.top - 50;
  const scrollLeft =
    container.scrollLeft + highlightRect.left - containerRect.left - 50;

  container.scrollTo({
    top: Math.max(0, scrollTop),
    left: Math.max(0, scrollLeft),
    behavior: "smooth",
  });
}

/**
 * Generate a unique ID for highlights
 */
export function generateHighlightId(
  testId: string,
  pageNumber: number,
  locationIndex: number
): string {
  return `highlight_${testId}_${pageNumber}_${locationIndex}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Validate PDF file type
 */
export function isValidPDFFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

/**
 * Get page dimensions from PDF page
 */
export function getPageDimensions(page: any): PageDimensions {
  const viewport = page.getViewport({ scale: 1 });
  return {
    width: viewport.width,
    height: viewport.height,
    scale: 1,
  };
}
