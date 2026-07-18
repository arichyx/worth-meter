# value-leaderboard Specification

## Purpose
TBD - created by archiving change value-leaderboard. Update Purpose after archive.
## Requirements
### Requirement: The leaderboard SHALL support a type filter via URL
The active type filter SHALL be driven by a `?type=` query parameter accepting `all` (default), `time`, `count`, or `quota`. The all filter SHALL render the insight overview, while a concrete type SHALL render that type's detailed ranking.

#### Scenario: Default filter is all
- **WHEN** a user opens `/leaderboard` with no `type` parameter
- **THEN** the all-assets insight overview is shown

#### Scenario: Type filter shows a detailed ranking
- **WHEN** a user navigates to `/leaderboard?type=count`
- **THEN** only count assets are shown in the detailed count ranking, and the count filter control is marked active

#### Scenario: Invalid type falls back to all
- **WHEN** the `type` parameter is not one of the allowed values
- **THEN** the all-assets insight overview is shown and the all filter is marked active

### Requirement: Leaderboard copy SHALL be localized
All leaderboard titles, descriptions, filter names, metric labels, insight headings, target-progress labels, and waiting-for-use explanations SHALL come from every supported locale's translation table (`en`, `zh`, `zh-TW`, `ja`).

#### Scenario: Leaderboard renders in the active locale
- **WHEN** the active locale is `ja`
- **THEN** the overview, filters, rankings, metrics, and supporting labels render Japanese strings from the translation table

### Requirement: The app SHALL rank assets by observed value within each asset type
The app SHALL expose `/leaderboard` and provide detailed rankings whose order is derived from target-independent observed metrics within a single asset type.

#### Scenario: Time assets rank by holding cost per day
- **WHEN** a user opens the time ranking
- **THEN** non-archived time assets are numbered by `dailyCost` ascending

#### Scenario: Count assets rank by recorded cost per use
- **WHEN** a user opens the count ranking
- **THEN** count assets with at least one usage record are numbered by `costPerUse` ascending

#### Scenario: Quota assets rank by utilization
- **WHEN** a user opens the quota ranking
- **THEN** quota assets are numbered by `usageRatio` descending

#### Scenario: Ranking ties are deterministic
- **WHEN** two same-type assets have equal observed metrics
- **THEN** the lower-cost asset ranks first, followed by a stable asset identifier tie-break

### Requirement: The all-assets view SHALL summarize type-specific insights
The default all-assets view SHALL avoid a cross-type numeric rank and SHALL summarize best-value and attention insights using each asset type's native observed metric.

#### Scenario: Best value is shown for each available type
- **WHEN** active assets exist in two asset types
- **THEN** the overview shows one best-value asset for each of those two types

#### Scenario: Attention insight explains its metric
- **WHEN** an asset is selected for attention
- **THEN** the UI labels the concrete reason, such as highest holding cost, highest cost per use, lowest utilization, or waiting for first use

#### Scenario: A single asset is not both best and attention
- **WHEN** an asset type contains only one active asset
- **THEN** that asset appears as best value but is omitted from the attention list

### Requirement: Targets SHALL be optional leaderboard context
Count and time target progress SHALL be displayed only as supporting context when configured and SHALL NOT affect ranking order or ranking eligibility.

#### Scenario: Asset without target remains ranked
- **WHEN** a time or used count asset has no target
- **THEN** it receives a rank based on its observed metric

#### Scenario: Configured target progress remains visible
- **WHEN** a ranked count or time asset has valid target progress
- **THEN** the row displays the clamped target progress as secondary information

### Requirement: Unrecorded count assets SHALL wait outside the numbered ranking
Count assets with no usage records SHALL appear after ranked count assets without a rank number because no observed cost per use exists yet.

#### Scenario: Zero-use count asset does not win
- **WHEN** a count asset has no usage records
- **THEN** it is excluded from numbered positions and shown with a "waiting for first use" explanation

