# value-leaderboard Specification

## Purpose
TBD - created by archiving change value-leaderboard. Update Purpose after archive.
## Requirements
### Requirement: The app SHALL rank assets by value recovered on a dedicated page
The app SHALL expose a `/leaderboard` route that lists all non-archived assets ranked by a normalized `valueScore` derived from each asset's break-even progress, highest first, so the best-value and worst-value purchases are visible at a glance.

#### Scenario: Leaderboard is reachable from the dashboard
- **WHEN** a user is on the dashboard
- **THEN** a "Leaderboard" entry point is visible that navigates to `/leaderboard`

#### Scenario: Assets are ranked by value score descending
- **WHEN** a user opens `/leaderboard` with several assets of varying break-even progress
- **THEN** assets are ordered by `valueScore` from highest to lowest, and each row shows its rank starting at 1

#### Scenario: Assets that already broke even rank above those that have not
- **WHEN** an asset has reached break-even (`isBreakEven` true)
- **THEN** it ranks above any asset that has not, among assets with a measurable target

### Requirement: Value score SHALL be comparable across asset types
The `valueScore` SHALL be the existing calculators' `breakEvenProgress` clamped to `[0, 1]`, so a time asset, a count asset, and a quota asset are rankable on one axis. Quota assets SHALL use `min(usageRatio, 1)` as their progress.

#### Scenario: Count progress uses uses over target
- **WHEN** a count asset has 10 of 20 target uses
- **THEN** its `valueScore` is 0.5

#### Scenario: Quota progress is capped at 1
- **WHEN** a quota asset has a usageRatio of 1.5
- **THEN** its `valueScore` is 1, not 1.5

### Requirement: Assets without a measurable target SHALL sort to the bottom
Assets whose `breakEvenProgress` is `null` (no target field set) SHALL be listed below all measurable assets, under a distinct "not yet measurable" grouping, and SHALL NOT receive a competing rank number.

#### Scenario: No-target assets appear last
- **WHEN** an asset has no `targetUnitCost`/`targetDailyCost` and is therefore null-progress
- **THEN** it appears after every measurable asset in the list

#### Scenario: No-target assets show an explanatory note
- **WHEN** the leaderboard renders a null-progress asset
- **THEN** the row shows a "not yet measurable" note instead of a progress bar

### Requirement: The leaderboard SHALL surface a champion and a biggest regret
The leaderboard SHALL compute and prominently display a "champion" (the asset with the highest `valueScore`, tie-broken by lower total cost) and a "biggest regret" (the non-broke-even asset with the highest unrecovered value `(1 - valueScore) * totalCost`).

#### Scenario: Champion is the top-ranked asset
- **WHEN** the leaderboard has at least one measurable asset
- **THEN** the champion summary names the rank-1 asset and its value score

#### Scenario: Biggest regret weights cost
- **WHEN** two non-broke-even assets have equal progress but different total costs
- **THEN** the higher-cost asset is chosen as the biggest regret

#### Scenario: No extremes when no measurable assets exist
- **WHEN** no asset has a non-null progress
- **THEN** the champion and regret summaries are hidden

### Requirement: The leaderboard SHALL support a type filter via URL
The active type filter SHALL be driven by a `?type=` query parameter accepting `all` (default), `time`, `count`, or `quota`, so the filter is bookmarkable and reflects in the URL.

#### Scenario: Default filter is all
- **WHEN** a user opens `/leaderboard` with no `type` parameter
- **THEN** assets of all types are shown

#### Scenario: Type filter narrows the list
- **WHEN** a user navigates to `/leaderboard?type=count`
- **THEN** only count assets are shown, and the count filter control is marked active

#### Scenario: Invalid type falls back to all
- **WHEN** the `type` parameter is not one of the allowed values (e.g. `?type=banana`)
- **THEN** all assets are shown and no filter is marked active as an invalid value

### Requirement: Leaderboard copy SHALL be localized
All leaderboard labels, filter names, rank/summary headings, and the "not yet measurable" note SHALL come from the active locale's translation table, with keys added to every locale (`en`, `zh`, `zh-TW`, `ja`).

#### Scenario: Leaderboard renders in the active locale
- **WHEN** the active locale is `ja`
- **THEN** the leaderboard headings, filter controls, and summaries render Japanese strings from the translation table
