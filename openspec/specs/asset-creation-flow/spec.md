# asset-creation-flow Specification

## Purpose
TBD - created by archiving change optimize-frontend-ui-ux. Update Purpose after archive.
## Requirements
### Requirement: New-asset flow SHALL use a three-step wizard
The new-asset page SHALL split creation into three steps: 1) select asset type; 2) fill basic info; 3) fill type-specific fields and submit.

#### Scenario: Opening the new-asset page
- **WHEN** the user opens `/assets/new`
- **THEN** the page shows step 1 "Select asset type" with the three type cards

#### Scenario: Selecting a type advances to step 2
- **WHEN** the user clicks a type card on step 1
- **THEN** the page advances to step 2 "Basic info" with name, total cost, and purchase date fields

#### Scenario: Returning from step 2 to step 1
- **WHEN** the user clicks "Back" on step 2
- **THEN** the page returns to step 1 and the previously selected type remains highlighted

### Requirement: Wizard steps SHALL show a progress indicator
The top of the wizard SHALL show the current step number, step name, and a progress bar so the user knows where they are.

#### Scenario: Step 2 progress
- **WHEN** the user reaches step 2
- **THEN** the progress indicator shows 2/3 and the current step name is highlighted

### Requirement: Form fields SHALL provide real-time validation and error messages
The page SHALL validate required fields, numeric ranges, and date sensibility as the user fills them, showing inline error text below each invalid field.

#### Scenario: Name is empty
- **WHEN** the user leaves the name field empty and tries to advance
- **THEN** an inline error message appears below the name field and advancement is blocked

#### Scenario: Total cost is negative
- **WHEN** the user enters a negative or invalid number for total cost
- **THEN** an inline error message appears below the total cost field

### Requirement: Step 3 SHALL show an information summary before submission
Step 3 SHALL render a summary card above the form showing the selected type, name, total cost, and key type-specific fields before the user submits.

#### Scenario: Reaching step 3
- **WHEN** the user completes step 2 and advances to step 3
- **THEN** the page renders a summary card with the entered information

### Requirement: Successful submission SHALL redirect to the asset detail page with feedback
After successful creation, the page SHALL redirect to `/assets/[id]` and display a success toast.

#### Scenario: Asset created successfully
- **WHEN** the user completes the form and clicks Create
- **THEN** the app creates the asset, navigates to `/assets/[id]`, and shows a global success message

