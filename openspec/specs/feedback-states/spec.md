# feedback-states Specification

## Purpose
TBD - created by archiving change optimize-frontend-ui-ux. Update Purpose after archive.
## Requirements
### Requirement: The app SHALL provide a unified EmptyState component
The app SHALL provide a unified `EmptyState` component for empty asset lists, empty charts, empty records, and similar scenarios, containing an icon, title, description, and optional action button.

#### Scenario: Dashboard with no assets
- **WHEN** the dashboard has no assets
- **THEN** the page uses `EmptyState` with helper text and a "Create your first asset" button

#### Scenario: Chart with no data
- **WHEN** an asset has no usage records
- **THEN** the chart area uses `EmptyState` with a "No data" message

### Requirement: Global action feedback SHALL use toast messages
After successful create, edit, archive, or delete actions, the app SHALL show a non-blocking success toast.

#### Scenario: Asset created successfully
- **WHEN** the user successfully creates an asset
- **THEN** a "Asset created" toast appears after redirecting to the detail page

#### Scenario: Asset archived successfully
- **WHEN** the user successfully archives an asset
- **THEN** an "Asset archived" toast appears on the current page

### Requirement: Form submissions SHALL show loading states
Form submit buttons SHALL be disabled and show loading text while a submission is in progress, preventing duplicate submits.

#### Scenario: Creating asset in progress
- **WHEN** the user clicks the create-asset button and the request is pending
- **THEN** the button becomes disabled and shows "Creating..."

### Requirement: Error pages SHALL use a unified style
`not-found` and global error pages SHALL use a unified error-state style with an error icon, description, and a back-to-home button.

#### Scenario: Visiting a non-existent asset
- **WHEN** the user visits a non-existent asset ID
- **THEN** the page shows an "Asset not found" error state with a button to return to the dashboard

### Requirement: Skeleton screens SHALL be used for async content placeholders
For content that loads client-side, the app SHALL use the `Skeleton` component as a placeholder to avoid layout shift.

#### Scenario: Chart theme loading
- **WHEN** chart theme tokens are resolving client-side
- **THEN** the chart area shows a skeleton placeholder that fades out once the chart is ready

