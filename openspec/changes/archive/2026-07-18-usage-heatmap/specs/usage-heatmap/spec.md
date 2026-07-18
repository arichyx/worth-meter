# usage-heatmap Specification

## ADDED Requirements

### Requirement: The count asset detail page SHALL render a usage calendar heatmap
The count-based asset detail page SHALL render a `UsageHeatmap` in the Usage Records tab, above the paginated records list, showing a calendar grid of the last `26` weeks with each day cell colored by the number of usages logged on that date.

#### Scenario: Heatmap appears on count detail records tab
- **WHEN** a user opens the Usage Records tab of a count-based asset that has usage records
- **THEN** a calendar heatmap is rendered above the records list

#### Scenario: Heatmap is absent for non-count assets
- **WHEN** a user views a time-based or quota-based asset detail page
- **THEN** no heatmap is rendered

#### Scenario: Heatmap is absent when there are no usage records
- **WHEN** a count-based asset has zero usage records
- **THEN** no heatmap is rendered (the records area shows its empty state)

### Requirement: Day cells SHALL be bucketed by calendar date and intensity-scaled by usage count
Each day cell SHALL represent one calendar date (derived from a record's `recordedAt` date portion) and SHALL be colored with the count type token at an opacity that scales with the number of usages on that date: 0 uses = faint/empty, 1 = light, 2 = medium, 3+ = full.

#### Scenario: A day with no uses renders as faint
- **WHEN** a day in the heatmap range has no usage records
- **THEN** its cell renders with the empty/faint style, not the count-tinted style

#### Scenario: A day with three uses renders at full intensity
- **WHEN** a day has 3 or more usage records
- **THEN** its cell renders with the strongest count-tinted style

#### Scenario: Records on the same date aggregate into one cell
- **WHEN** two usage records share the same calendar date
- **THEN** a single day cell represents that date and its intensity reflects count 2

### Requirement: Each day cell SHALL expose a hover tooltip with date and count
Each day cell SHALL carry a native `title` attribute stating the date and the number of uses on that date (or a "no uses" string when zero), so hovering explains intensity without client-side interactivity.

#### Scenario: Tooltip shows uses on a used day
- **WHEN** a user hovers a day cell that has 2 uses on 2026-07-01
- **THEN** the tooltip mentions the date and "2 uses"

#### Scenario: Tooltip shows no-uses text on an empty day
- **WHEN** a user hovers a day cell with no records
- **THEN** the tooltip shows a "no uses" string for that date

### Requirement: The heatmap SHALL render a legend and span the trailing weeks ending today
The heatmap SHALL render the trailing 26 weeks ending at the current date, with a small legend indicating the less-to-more intensity scale, so the grid is interpretable without prior context.

#### Scenario: Legend distinguishes less from more
- **WHEN** the heatmap renders
- **THEN** a legend with at least two swatches (fewer uses, more uses) is visible

#### Scenario: The grid ends at the current date
- **WHEN** the heatmap renders
- **THEN** the most recent column includes the current date

### Requirement: Heatmap copy SHALL be localized
The heatmap title, the per-day tooltip text (uses count and date, and the no-uses string), and the legend labels SHALL come from the active locale's translation table, with keys added to every locale (`en`, `zh`, `zh-TW`, `ja`).

#### Scenario: Heatmap renders in the active locale
- **WHEN** the active locale is `ja`
- **THEN** the heatmap title, tooltips, and legend render Japanese strings from the translation table
