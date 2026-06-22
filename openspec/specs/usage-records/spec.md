# usage-records Specification

## Purpose
TBD - created by archiving change paginate-count-usage-records. Update Purpose after archive.
## Requirements
### Requirement: Count-based usage records SHALL be displayed in a paginated list
The count-based asset detail page SHALL render its usage records in pages of a fixed size (default 10), newest-first, instead of rendering every record at once.

#### Scenario: Default view shows the first page
- **WHEN** a user opens a count-based asset detail page with 25 usage records and no `page` query parameter
- **THEN** the page renders the 10 most recent records only

#### Scenario: Page size bounds the rendered list
- **WHEN** a count-based asset has more usage records than the page size
- **THEN** the rendered list contains at most `USAGE_RECORDS_PAGE_SIZE` rows

#### Scenario: Newest-first ordering is preserved
- **WHEN** the usage-records list is rendered for any page
- **THEN** records are ordered by `recordedAt` descending within the displayed window

### Requirement: Page state SHALL be driven by the `page` URL query parameter
The active page SHALL be determined by the `page` search parameter on `/assets/[id]`, so that page state is bookmarkable, shareable, and reflects in the URL.

#### Scenario: Page is read from the URL
- **WHEN** a user navigates to `/assets/[id]?page=2`
- **THEN** the second page of records is rendered

#### Scenario: Missing page parameter defaults to page 1
- **WHEN** the `page` parameter is absent
- **THEN** page 1 is rendered

#### Scenario: Navigation updates the URL
- **WHEN** a user activates the next-page control from page 1
- **THEN** the browser navigates to `/assets/[id]?page=2` and the URL reflects the new page

### Requirement: Invalid or out-of-range page values SHALL be clamped
The system SHALL normalize the `page` parameter defensively so the page never errors or renders an empty out-of-bounds window.

#### Scenario: Non-numeric page falls back to page 1
- **WHEN** the `page` parameter is non-numeric (e.g. `page=abc`)
- **THEN** page 1 is rendered

#### Scenario: Zero or negative page falls back to page 1
- **WHEN** the `page` parameter is `0` or negative
- **THEN** page 1 is rendered

#### Scenario: Page above the last page clamps to the last page
- **WHEN** an asset has 25 records (3 pages) and the URL is `?page=99`
- **THEN** page 3 is rendered

### Requirement: Record numbering SHALL remain global and stable across pages
Each row's index badge SHALL reflect the record's absolute position in the full, newest-first history, not its position within the current page, so numbering continues correctly across pages.

#### Scenario: Numbering continues on the second page
- **WHEN** an asset has 25 records and the user views page 2 (rows 11–20 by recency)
- **THEN** the badges show the absolute use numbers continuing from page 1 (e.g. `#15` down to `#6`), not `#10` down to `#1`

### Requirement: Pagination controls SHALL be localized and reflect availability
The list SHALL render previous/next navigation and a page indicator, with next/previous disabled at the boundaries, using translated strings from the active locale.

#### Scenario: Next control is disabled on the last page
- **WHEN** the user is viewing the last page of records
- **THEN** the next-page control is visually and semantically disabled

#### Scenario: Previous control is disabled on the first page
- **WHEN** the user is viewing the first page of records
- **THEN** the previous-page control is visually and semantically disabled

#### Scenario: Controls use the active locale's strings
- **WHEN** the locale is `ja`
- **THEN** the previous/next and page-indicator labels are rendered in Japanese

#### Scenario: No controls when records fit one page
- **WHEN** an asset has fewer records than the page size (e.g. 5 records)
- **THEN** pagination navigation controls are not rendered (the single page is shown as-is)

