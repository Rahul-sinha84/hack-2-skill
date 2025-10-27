export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface PDFLocation {
  page_number: number;
  bounding_box: BoundingBox;
  chunk_id?: string;
  compliance_id?: string;
}

export interface TraceabilityData {
  test_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  derived_from: string;
  expected_result: string;
  compliance_standards: string[];
  traceability: {
    requirement_id: string;
    requirement_text: string;
    pdf_locations: PDFLocation[];
    linked_edges: string[];
    compliance_references: string[];
    traceability_id: string;
    source_document: string;
    confidence_score: number;
    kg_mapping: {
      kg_nodes: Array<{
        id: string;
        type: string;
        text: string;
        confidence: number;
      }>;
      kg_edges: Array<{
        id: string;
        relation: string;
        to: string;
        confidence: number;
      }>;
      kg_coverage: number;
      kg_relationships: number;
    };
  };
}

export interface HighlightData {
  test_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  pdf_locations: PDFLocation[];
  traceability?: TraceabilityData;
}

export interface PDFHighlighterProps {
  pdfFile: File | Blob | string;
  highlightData?: HighlightData;
  onHighlightClick?: (data: HighlightData) => void;
  onPageChange?: (pageNumber: number) => void;
  className?: string;
  showNavigation?: boolean;
  showZoomControls?: boolean;
  initialPage?: number;
  zoom?: number;
  fitWidth?: boolean;
  fitHeight?: boolean;
}

export interface PDFSplitViewProps {
  pdfFile: File | Blob | string;
  testCases: Array<{
    id: string;
    title: string;
    content: string;
    traceability?: TraceabilityData;
  }>;
  selectedTestCaseId?: string;
  onTestCaseSelect?: (testCaseId: string) => void;
  onHighlightClick?: (data: HighlightData) => void;
  className?: string;
}

export interface HighlightState {
  isActive: boolean;
  isHovered: boolean;
  isSelected: boolean;
}

export interface PixelBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageDimensions {
  width: number;
  height: number;
  scale: number;
}

