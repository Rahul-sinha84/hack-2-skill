// PDF.js configuration for Next.js
import { pdfjs } from "react-pdf";

// Configure PDF.js worker for client-side rendering
if (typeof window !== "undefined") {
  // Use CDN worker for better compatibility
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

export default pdfjs;
