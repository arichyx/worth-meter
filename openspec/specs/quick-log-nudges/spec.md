# quick-log-nudges Specification

## Purpose
TBD - created by archiving change quick-log-nudges. Update Purpose after archive.
## Requirements
### Requirement: Count asset cards SHALL offer a one-tap quick-log button
Each active (non-archived) count-based asset card on the dashboard SHALL render a "+1" quick-log button that, when activated, records one count usage without opening a modal and without navigating away from the dashboard.

#### Scenario: Quick-log button appears on active count cards
- **WHEN** the dashboard renders an active count-based asset
- **THEN** a "+1" quick-log button is visible on that card

#### Scenario: Quick-log button is absent on archived cards
- **WHEN** the dashboard renders an archived count-based asset
- **THEN** no quick-log button is rendered

#### Scenario: Quick-log button is absent on non-count cards
- **WHEN** the dashboard renders a time-based or quota-based asset
- **THEN** no quick-log button is rendered

### Requirement: The quick-log button SHALL not navigate the card
Activating the quick-log button SHALL NOT trigger the card's navigation to the asset detail page. The button SHALL be a sibling of the card's navigation link in the DOM (not nested inside it), so the markup remains valid and the click is isolated.

#### Scenario: Clicking +1 stays on the dashboard
- **WHEN** a user clicks the quick-log button on a count card
- **THEN** a usage record is added and the dashboard refreshes in place, with no navigation to `/assets/[id]`

#### Scenario: Clicking the card body still navigates
- **WHEN** a user clicks the card body (not the +1 button)
- **THEN** the browser navigates to the asset detail page as before

### Requirement: Quick-log SHALL reuse the existing usage-record server action
The quick-log button SHALL create the usage record by calling the existing `addUsageRecordAction(assetId, 1)` server action, producing the same record shape (value `1`, `recordedAt` defaulting to now) as the detail-page usage dialog. No new server action is introduced.

#### Scenario: A usage record with value 1 is created
- **WHEN** a user clicks +1 on a count card
- **THEN** a usage record with `value = 1` is inserted for that asset, identical to what the detail-page "Log Use" dialog would create

#### Scenario: Success feedback is shown
- **WHEN** the quick-log succeeds
- **THEN** a success toast appears and the dashboard data refreshes

### Requirement: The dashboard SHALL surface stale-logging nudges for count assets
The dashboard SHALL compute, for each active count asset, the number of days since its most recent usage record (or since purchase if none) and SHALL display a nudge for any count asset whose stale period exceeds `NUDGE_STALE_DAYS` (7) and that has not yet broken even.

#### Scenario: A stale count asset shows a nudge
- **WHEN** an active count asset has not been logged in 9 days and has not broken even
- **THEN** the dashboard renders a nudge naming the asset and the days since last use

#### Scenario: A recently-logged asset shows no nudge
- **WHEN** an active count asset was logged 2 days ago
- **THEN** no nudge is rendered for it

#### Scenario: A broken-even asset shows no nudge
- **WHEN** a count asset has already broken even but is stale
- **THEN** no nudge is rendered (it already paid off)

#### Scenario: Days since last use falls back to purchase date
- **WHEN** a count asset has no usage records
- **THEN** its "days since last use" is computed from the purchase date

### Requirement: Each nudge SHALL be directly actionable via quick-log
Each rendered nudge SHALL include an inline quick-log button for its asset, so the user can clear the nudge by logging a use immediately.

#### Scenario: Logging from a nudge clears it
- **WHEN** a user clicks the inline +1 on a nudge
- **THEN** a usage record is added and, on refresh, the nudge is no longer shown (its stale period resets)

### Requirement: Quick-log and nudge copy SHALL be localized
The "+1" label and aria-label, the nudge sentence (with `{name}` and `{days}` placeholders), and the nudge section heading SHALL come from the active locale's translation table, with keys added to every locale (`en`, `zh`, `zh-TW`, `ja`).

#### Scenario: Nudges render in the active locale
- **WHEN** the active locale is `ja`
- **THEN** the nudge sentence and +1 label render Japanese strings from the translation table
