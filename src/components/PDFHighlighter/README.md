# PDF Highlighter Component

A reusable React component for displaying PDFs with interactive highlighting capabilities based on bounding box coordinates.

## Features

- **PDF Rendering**: Uses react-pdf for high-quality PDF display
- **Interactive Highlights**: Clickable highlights based on normalized bounding box coordinates
- **Split View**: Resizable split-pane layout with test cases on the left and PDF on the right
- **Navigation**: Page navigation and zoom controls
- **Responsive**: Works on desktop and mobile devices
- **TypeScript**: Full TypeScript support with comprehensive type definitions

## Components

### PDFHighlighter
Main PDF viewer component with highlighting capabilities.

```tsx
import { PDFHighlighter } from '../../components/PDFHighlighter';

<PDFHighlighter
  pdfFile={pdfFile}
  highlightData={highlightData}
  onHighlightClick={(data) => console.log('Clicked:', data)}
  showNavigation={true}
  showZoomControls={true}
  fitWidth={true}
/>
```

### PDFSplitView
Split-screen layout with test cases and PDF viewer.

```tsx
import { PDFSplitView } from '../../components/PDFHighlighter';

<PDFSplitView
  pdfFile={pdfFile}
  testCases={testCases}
  selectedTestCaseId={selectedId}
  onTestCaseSelect={(id) => setSelectedId(id)}
  onHighlightClick={(data) => console.log('Highlight clicked:', data)}
/>
```

## Data Format

The component expects traceability data in this format:

```typescript
interface HighlightData {
  test_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  pdf_locations: Array<{
    page_number: number;
    bounding_box: {
      x_min: number; // 0-1 normalized coordinates
      y_min: number;
      x_max: number;
      y_max: number;
    };
    chunk_id?: string;
    compliance_id?: string;
  }>;
  traceability?: TraceabilityData;
}
```

## Usage in TestCaseWorkflow

The component is integrated into the ReviewTestCases step of the TestCaseWorkflow. Users can:

1. Click "View PDF" button to toggle PDF view
2. Select test cases from the left panel
3. See highlights in the PDF corresponding to the selected test case
4. Click on highlights to see test case details
5. Navigate between pages and zoom in/out

## Styling

The component includes comprehensive SCSS styles:
- `_pdf_highlighter.scss` - Main PDF viewer styles
- `_pdf_split_view.scss` - Split view layout styles

## Dependencies

- `react-pdf` - PDF rendering
- `pdfjs-dist` - PDF.js library
- React 19+ (with TypeScript support)

## Browser Support

- Modern browsers with Canvas support
- Mobile responsive design
- Touch-friendly controls
