# purchase-simulation Specification

## Purpose
TBD - created by archiving change purchase-simulator. Update Purpose after archive.
## Requirements
### Requirement: The app SHALL provide a non-persisting pre-purchase simulator
The app SHALL expose a `/simulate` route that lets a user project the break-even of a *prospective* purchase without creating or modifying any asset or usage record. The simulator SHALL accept the same type-specific target fields as the asset model (`targetDailyCost` for time, `targetUnitCost` for count, billing cycle for quota) plus optional resale value and expiry, and SHALL NOT write to the database under any input.

#### Scenario: Simulator is reachable from the dashboard
- **WHEN** a user is on the dashboard
- **THEN** a "Simulate" entry point is visible that navigates to `/simulate`

#### Scenario: Visiting the simulator does not create data
- **WHEN** a user opens `/simulate` and changes any input
- **THEN** no rows are inserted into `assets` or `usage_records`, and the existing asset list is unchanged

#### Scenario: Inputs mirror the asset model
- **WHEN** a user selects type `count` in the simulator
- **THEN** the simulator presents `totalCost`, `purchaseDate`, and `targetUnitCost` inputs (and optional `expiryDate`), matching the count-asset creation fields

### Requirement: Projections SHALL reuse the existing break-even calculation engine
The simulator SHALL compute the projected break-even by constructing a synthetic, non-persisted asset and running the existing `calculateTimeBased` / `calculateCountBased` / `calculateQuotaBased` functions over it, so that a projection uses identical math to a real tracked asset of the same shape.

#### Scenario: Count projection matches the real calculation
- **WHEN** a user simulates a count purchase with `totalCost=1200` and `targetUnitCost=60`, and the simulated usage count reaches 20
- **THEN** the projected `costPerUse` equals what `calculateCountBased` would return for a real asset with 20 usage records and the same cost

#### Scenario: Time projection uses effective cost
- **WHEN** a user simulates a time purchase with `totalCost=8000` and `resaleValue=3000` and `targetDailyCost=20`
- **THEN** the projected target-days derivation subtracts the resale value (effective cost = 5000), matching `calculateTimeBased`

### Requirement: The simulator SHALL derive the user's historical usage velocity for comparison
For the selected type, the simulator SHALL compute a historical velocity statistic from the user's existing assets (e.g. average uses-per-day across count assets, average realized daily cost across time assets) and SHALL display it alongside the projection as a realistic "your track record" baseline.

#### Scenario: Count velocity is averaged across count assets
- **WHEN** a user has count assets and selects type `count` in the simulator
- **THEN** the track-record panel shows the average uses-per-day derived from those assets' usage records and days-since-purchase

#### Scenario: No history yields a graceful baseline
- **WHEN** a user has no assets of the selected type
- **THEN** the track-record panel shows an explanatory empty state instead of a velocity number, and the projection still renders from the target-based math alone

### Requirement: The simulator SHALL surface the most recent same-type asset's actual outcome
The simulator SHALL identify the user's most recent non-archived asset of the selected type and display its current break-even progress and time-to-break-even (or "broke even on <date>" if already past), giving a concrete peer comparison rather than only an aggregate average.

#### Scenario: A comparable recent asset exists
- **WHEN** a user has a non-archived count asset and simulates a count purchase
- **THEN** the comparison panel names that asset and shows its current `costPerUse` and break-even progress

### Requirement: The simulator SHALL emit a verdict from projected break-even vs. historical velocity
Given the target-based projected break-even and the historical velocity, the simulator SHALL classify the purchase as `worth-it`, `on-the-fence`, or `unlikely`, using velocity-adjusted projection (extrapolating the user's actual pace, not just the stated target) and a configurable horizon.

#### Scenario: Velocity-adjusted projection breaks even within the horizon
- **WHEN** the user's historical pace projects break-even within the comparison horizon
- **THEN** the verdict is `worth-it`

#### Scenario: Stated target breaks even but historical pace does not
- **WHEN** the target-based projection breaks even but the velocity-adjusted projection exceeds the horizon
- **THEN** the verdict is `on-the-fence` and the UI surfaces the gap between target and track record

#### Scenario: Neither target nor pace breaks even in horizon
- **WHEN** both projections exceed the horizon
- **THEN** the verdict is `unlikely`

### Requirement: The simulator SHALL project cost-per-unit at fixed horizons
The simulator SHALL display the projected cost-per-unit (cost-per-use for count, daily cost for time, usage ratio for quota) at 6-month and 12-month horizons under the velocity-adjusted pace, so the user can read the decay over time.

#### Scenario: Count projection shows 6- and 12-month cost-per-use
- **WHEN** a user simulates a count purchase with a known velocity
- **THEN** the result panel shows projected cost-per-use at 6 months and 12 months at that pace

### Requirement: The simulator SHALL offer a path to create the simulated asset
The simulator SHALL render a "Create this asset" action that links to `/assets/new`. This change SHALL NOT pre-fill the creation form (no query-param contract is introduced); it is a plain navigation affordance.

#### Scenario: Create action navigates to the new-asset page
- **WHEN** a user activates "Create this asset" in the simulator
- **THEN** the browser navigates to `/assets/new`

### Requirement: Simulator copy SHALL be localized
All simulator labels, input placeholders, verdict strings, horizon headings, and track-record sentences SHALL be sourced from the active locale's translation table, with keys added to every locale (`en`, `zh`, `zh-TW`, `ja`).

#### Scenario: Simulator renders in the active locale
- **WHEN** the active locale is `ja`
- **THEN** the simulator verdict, inputs, and comparison panel render Japanese strings from the translation table
