# dashboard-layout Specification

## Purpose
TBD - created by archiving change optimize-frontend-ui-ux. Update Purpose after archive.
## Requirements
### Requirement: Dashboard overview SHALL use three Overview Cards
The top of the dashboard SHALL use an equal-width card group showing total investment, break-even count, and average break-even progress, replacing the current hero + progress mix.

#### Scenario: User opens the dashboard
- **WHEN** the user opens `/`
- **THEN** the top of the page renders three equal-width Overview Cards displaying total investment amount, break-even asset count, and average break-even progress percentage

#### Scenario: Dashboard with no assets
- **WHEN** the user opens `/` with no assets
- **THEN** the overview cards display neutral empty values (e.g. `—` or `0%`) and omit meaningless progress bars

### Requirement: Asset group cards SHALL keep type-themed colors and unified headers
The dashboard asset group cards SHALL render by `time`/`count`/`quota` type, each card header using the corresponding type theme color and icon, with consistent internal spacing and header height.

#### Scenario: Group card header
- **WHEN** the user views any asset-type group
- **THEN** the card header shows the type icon, type name, and a badge with the asset count, and all three type headers share the same height

#### Scenario: Type colors resolve through tokens
- **WHEN** the user views group cards in light or dark mode
- **THEN** type icons, titles, and background tints resolve through `--type-*` tokens, preserving hue across themes

### Requirement: Asset cards SHALL clearly show break-even status and progress
Each asset card SHALL display name, total cost, core metric, helper text, and an optional break-even badge; when progress exists, a thin progress bar is shown.

#### Scenario: Asset not yet break-even
- **WHEN** an asset has not reached break-even
- **THEN** the card shows the core metric, helper text, and progress bar, but no break-even badge

#### Scenario: Asset has reached break-even
- **WHEN** an asset has reached break-even
- **THEN** the card shows a break-even badge next to the core metric

### Requirement: Empty asset list SHALL provide a creation prompt
When the user has no assets, the dashboard SHALL render a unified empty state with explanatory text and a primary "Create your first asset" button.

#### Scenario: Empty state shown
- **WHEN** the asset count is 0
- **THEN** the page renders the empty-state component with helper text and a button linking to `/assets/new`

