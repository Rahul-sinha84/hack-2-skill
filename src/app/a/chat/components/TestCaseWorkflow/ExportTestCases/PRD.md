# Export Test Cases Workflow - Product Requirements Document

## Overview
This document outlines the requirements for implementing an Export Test Cases workflow within the existing TestCaseWorkflow component. The workflow allows users to export generated test cases to various tools, with Jira as the primary integration and support for future AML tools.

## Current System Analysis

### Existing Architecture
- **TestCaseWorkflow**: Main workflow component with step-based navigation
- **Steps Enum**: Currently includes `SELECT_TEST_CATEGORY`, `REVIEW_TEST_CASES`, `EXPORT_TEST_CASES`
- **CommonProps Interface**: Shared props for all workflow steps
- **ChatContext**: Manages test cases with status tracking (PENDING, APPROVED, REJECTED)
- **Jira Integration**: Existing API endpoints for authentication, projects, and bulk issue creation

### Current UI Patterns
- Step-based navigation with back buttons
- Card-based layouts for selection
- Progress indicators and statistics
- Consistent styling with SCSS modules
- Responsive design with mobile-first approach

## Requirements

### 1. Integration Points

#### 1.1 SelectTestCategoryStep Enhancement
- **Location**: `src/app/a/chat/components/TestCaseWorkflow/SelectTestCategory/SelectTestCategoryStep.tsx`
- **Enhancement**: Add "Export test cases" button in the footer
- **Behavior**: Navigate to `EXPORT_TEST_CASES` step when clicked
- **UI**: Button should be prominently placed, consistent with existing design

#### 1.2 TestCaseWorkflow Updates
- **Location**: `src/app/a/chat/components/TestCaseWorkflow/TestCaseWorkflow.tsx`
- **Enhancement**: Add new step handling for export workflow
- **Navigation**: Support for export-specific step transitions

### 2. Export Workflow Steps

#### 2.1 SelectExportToolStep
**Purpose**: Allow users to choose their export destination

**UI Components**:
- Header with title: "Choose Export Destination"
- Four tool selection buttons:
  - **Jira** (primary, functional)
  - **Azure DevOps** (coming soon)
  - **TestRail** (coming soon)
  - **Xray** (coming soon)
- Footer with back button to return to test category selection

**Behavior**:
- Jira button: Check connection status, proceed to appropriate next step
- Other buttons: Show "Coming soon" toast/notification
- Back button: Return to `SELECT_TEST_CATEGORY` step

**API Integration**:
- Check Jira connection status using existing authentication flow
- Determine next step based on connection status

#### 2.2 ConnectJiraStep
**Purpose**: Handle Jira authentication for unconnected users

**UI Components**:
- Header with title: "Connect to Jira"
- Description: "Connect your Jira account to export test cases"
- Primary button: "Connect to Jira"
- Footer with back button

**Behavior**:
- "Connect to Jira" button: Call `/api/jira/get-auth-url`
- Open authentication URL in new tab
- Handle authentication callback
- Navigate to project selection upon successful connection
- Back button: Return to tool selection

**API Integration**:
- `POST /api/jira/get-auth-url` - Get authentication URL
- Handle OAuth callback flow
- Store authentication tokens

#### 2.3 SelectJiraProjectStep
**Purpose**: Allow users to select target Jira project

**UI Components**:
- Header with title: "Select Jira Project"
- Project list with cards showing:
  - Project name
  - Project key
  - Project description (if available)
- "No Projects" state with message
- Footer with back button

**Behavior**:
- Load projects on component mount
- Display project cards in selectable format
- Store selected project in state
- Navigate to export confirmation
- Handle empty state gracefully
- Back button: Return to connection step

**API Integration**:
- `GET /api/jira/get-projects` - Fetch available projects
- Handle authentication errors
- Display project information

**Empty State**:
- Message: "No Projects created, please create it on Jira platform"
- Action: Provide link to Jira project creation

#### 2.4 ExportTestCasesStep
**Purpose**: Confirm export details and execute export

**UI Components**:
- Header with title: "Export Test Cases"
- Statistics display:
  - Total test cases count
  - Approved test cases count
  - Pending test cases count
  - Rejected test cases count
- Selected project information
- Two action buttons:
  - "Export" (primary)
  - "Continue reviewing" (secondary)

**Behavior**:
- Display comprehensive test case statistics
- Show selected project information
- "Export" button: Call bulk export API, show loading state
- "Continue reviewing" button: Return to `SELECT_TEST_CATEGORY`
- Handle export success/error states
- Navigate to success step upon completion

**API Integration**:
- `POST /api/jira/issue/upload-bulk-issues` - Export test cases
- Pass test cases, project key, and issue type
- Handle bulk export response
- Track export progress

#### 2.5 ExportSuccessStep
**Purpose**: Confirm successful export and provide next actions

**UI Components**:
- Success icon/indicator
- Export summary:
  - "X of Y test cases exported successfully"
  - Project information
  - Export timestamp
- "Close" button to dismiss modal
- Optional: "View in Jira" link

**Behavior**:
- Display export results
- Provide clear success confirmation
- Close button dismisses the entire workflow
- Optional navigation to Jira project

### 3. State Management

#### 3.1 Export Workflow State
```typescript
interface ExportWorkflowState {
  selectedTool: 'jira' | 'azure' | 'testrail' | 'xray' | null;
  isJiraConnected: boolean;
  selectedProject: {
    key: string;
    name: string;
    id: string;
  } | null;
  exportResults: {
    total: number;
    exported: number;
    errors: string[];
  } | null;
}
```

#### 3.2 CommonProps Enhancement
```typescript
interface CommonProps {
  // Existing props...
  exportState?: ExportWorkflowState;
  setExportState?: Dispatch<SetStateAction<ExportWorkflowState>>;
}
```

### 4. API Integration Details

#### 4.1 Jira Connection Check
- Endpoint: Check existing authentication status
- Method: Verify access token validity
- Response: Connection status and user information

#### 4.2 Project Selection
- Endpoint: `/api/jira/get-projects`
- Method: GET
- Headers: Authorization token
- Response: Array of project objects

#### 4.3 Bulk Export
- Endpoint: `/api/jira/issue/upload-bulk-issues`
- Method: POST
- Payload: Test cases array, project key, issue type
- Response: Export results with success/error details

### 5. Error Handling

#### 5.1 Authentication Errors
- Display user-friendly error messages
- Provide retry mechanisms
- Fallback to re-authentication flow

#### 5.2 API Errors
- Handle network failures gracefully
- Display specific error messages
- Provide retry options

#### 5.3 Export Errors
- Show partial success scenarios
- Display failed test cases
- Provide retry for failed exports

### 6. UI/UX Requirements

#### 6.1 Design Consistency
- Follow existing SCSS module patterns
- Use consistent color scheme and typography
- Maintain responsive design principles
- Follow existing component structure

#### 6.2 Loading States
- Show loading indicators during API calls
- Disable buttons during processing
- Provide progress feedback for bulk operations

#### 6.3 Accessibility
- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus management between steps

### 7. File Structure

```
src/app/a/chat/components/TestCaseWorkflow/ExportTestCases/
├── index.ts
├── SelectExportToolStep/
│   ├── index.ts
│   ├── SelectExportToolStep.tsx
│   └── _select_export_tool_step.scss
├── ConnectJiraStep/
│   ├── index.ts
│   ├── ConnectJiraStep.tsx
│   └── _connect_jira_step.scss
├── SelectJiraProjectStep/
│   ├── index.ts
│   ├── SelectJiraProjectStep.tsx
│   ├── ProjectCard.tsx
│   └── _select_jira_project_step.scss
├── ExportTestCasesStep/
│   ├── index.ts
│   ├── ExportTestCasesStep.tsx
│   ├── TestCaseStats.tsx
│   └── _export_test_cases_step.scss
├── ExportSuccessStep/
│   ├── index.ts
│   ├── ExportSuccessStep.tsx
│   └── _export_success_step.scss
└── PRD.md
```

### 8. Implementation Phases

#### Phase 1: Core Infrastructure
- Update TestCaseWorkflow component
- Add export step handling
- Create base component structure
- Implement navigation logic

#### Phase 2: Jira Integration
- Implement SelectExportToolStep
- Create ConnectJiraStep
- Build SelectJiraProjectStep
- Add project selection logic

#### Phase 3: Export Functionality
- Implement ExportTestCasesStep
- Add bulk export functionality
- Create ExportSuccessStep
- Handle export results

#### Phase 4: Polish & Testing
- Add comprehensive error handling
- Implement loading states
- Add accessibility features
- Test complete workflow

### 9. Success Criteria

#### 9.1 Functional Requirements
- Users can navigate through export workflow
- Jira authentication works seamlessly
- Project selection functions correctly
- Bulk export completes successfully
- Error states are handled gracefully

#### 9.2 Performance Requirements
- Export workflow loads within 2 seconds
- Bulk export completes within 30 seconds
- No memory leaks during navigation
- Responsive UI during API calls

#### 9.3 User Experience Requirements
- Intuitive navigation flow
- Clear progress indicators
- Helpful error messages
- Consistent visual design
- Accessible interface

## Technical Considerations

### 10.1 State Management
- Use React state for local component state
- Leverage ChatContext for test case data
- Implement proper state cleanup
- Handle state persistence across navigation

### 10.2 API Error Handling
- Implement retry mechanisms
- Provide user-friendly error messages
- Handle network timeouts
- Graceful degradation for API failures

### 10.3 Performance Optimization
- Lazy load export components
- Implement proper cleanup
- Optimize API calls
- Minimize re-renders

### 10.4 Security Considerations
- Secure token storage
- Validate API responses
- Handle authentication expiration
- Protect against CSRF attacks

## Conclusion

This PRD provides a comprehensive roadmap for implementing the Export Test Cases workflow. The implementation should follow existing patterns, maintain design consistency, and provide a seamless user experience for exporting test cases to Jira and future AML tools.

The modular approach allows for incremental implementation and testing, ensuring a robust and maintainable solution that integrates well with the existing TestCaseWorkflow system.
