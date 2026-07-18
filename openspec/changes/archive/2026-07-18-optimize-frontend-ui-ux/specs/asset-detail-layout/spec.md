## ADDED Requirements

### Requirement: Asset detail page SHALL use tabs to organize content
The asset detail page SHALL organize content into three tabs: **Overview**, **Trend**, and **Usage Records**, with **Overview** active by default.

#### Scenario: User opens a detail page
- **WHEN** the user opens `/assets/[id]`
- **THEN** the page renders tabs, the Overview tab is active, and core spotlights plus detailed metrics are visible

#### Scenario: User switches tabs
- **WHEN** the user clicks the Trend or Usage Records tab
- **THEN** the corresponding content area switches, and the browser URL remains unchanged

### Requirement: Overview tab SHALL show core spotlights and detailed metrics
The Overview tab SHALL show the asset's core spotlight card at the top and four metric cards below, chosen according to the asset type.

#### Scenario: Time-based asset overview
- **WHEN** the user views a time-based asset
- **THEN** the spotlight shows daily cost, and the four cards show daily cost, days used, target days, and break-even progress

#### Scenario: Count-based asset overview
- **WHEN** the user views a count-based asset
- **THEN** the spotlight shows cost per use, and the four cards show cost per use, uses, target uses, and break-even progress

#### Scenario: Quota-based asset overview
- **WHEN** the user views a quota-based asset
- **THEN** the spotlight shows usage rate, and the four cards show usage rate, value recovered, expected weeks, and record count

### Requirement: Trend tab SHALL show only the chart and handle empty data
The Trend tab SHALL render only `AssetChart`, and display a chart empty state when there are no usage records.

#### Scenario: Records exist
- **WHEN** the asset has usage records
- **THEN** the Trend tab renders the corresponding type trend chart

#### Scenario: No records
- **WHEN** the asset has no usage records
- **THEN** the Trend tab shows a chart empty-state placeholder instead of a blank chart

### Requirement: Usage Records tab SHALL unify count and quota records
The Usage Records tab SHALL use a unified `UsageRecordsList` component for both count and quota records, sorted newest-first, with count-based records remaining paginated.

#### Scenario: Count-based records pagination
- **WHEN** the asset is count-based and has more records than the page size
- **THEN** the list is paginated and previous/next navigation is rendered

#### Scenario: Quota-based records shown
- **WHEN** the asset is quota-based
- **THEN** the list shows each record's remaining quota percentage before reset and the record date

### Requirement: Asset detail header SHALL keep archive, edit, and delete actions
The detail page header SHALL keep a back button and asset title on the left, and theme/language toggles plus edit/archive/delete actions on the right.

#### Scenario: Viewing detail header
- **WHEN** the user views any asset detail page
- **THEN** the header contains back, asset title, theme toggle, language toggle, and edit/archive/delete actions
