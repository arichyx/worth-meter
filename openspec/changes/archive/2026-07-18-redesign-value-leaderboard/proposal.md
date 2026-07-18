## Why

The current leaderboard only ranks assets with break-even targets, but the existing dataset has targets on just 1 of 8 active assets. Optional goal configuration therefore prevents the page from delivering useful insights for most assets.

## What Changes

- Replace the cross-type break-even leaderboard with target-independent value rankings within each asset type.
- Rank time assets by lowest holding cost per day, count assets by lowest cost per recorded use, and quota assets by highest usage ratio.
- Treat count assets with no recorded uses as "waiting for first use" instead of allowing a zero cost-per-use value to win.
- Turn the all-assets view into an insight summary that highlights each type's best value and assets needing attention, without inventing a cross-type rank.
- Keep configured break-even target progress as optional secondary information rather than a ranking prerequisite.
- Replace target-dependent "champion", "biggest regret", and "not measurable" language with value and utilization language that works for all assets.
- Preserve the bookmarkable type filter and localized copy.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `value-leaderboard`: Change ranking from target-dependent normalized progress across types to target-independent, type-specific observed value metrics and an all-assets insight summary.

## Impact

- Affects leaderboard calculation helpers, the `/leaderboard` server-rendered page, localization strings, and associated unit tests.
- Keeps existing database schema, asset records, route, filters, and dependencies unchanged.
- Existing break-even calculations remain available on asset detail views and become optional supporting context on the leaderboard.
