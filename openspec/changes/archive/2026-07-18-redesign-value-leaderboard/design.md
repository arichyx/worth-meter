## Context

The existing leaderboard normalizes every asset to break-even progress. Count and time assets without an optional target receive no score, so only 1 of the current 8 active assets can be ranked. The app already calculates target-independent observed metrics for every asset type, and the leaderboard is a server-rendered App Router page backed by local SQLite data.

## Goals / Non-Goals

**Goals:**

- Make the leaderboard useful without requiring target configuration.
- Use transparent metrics already derived from recorded asset data.
- Avoid presenting unlike units as a mathematically comparable global score.
- Preserve the existing route, URL filter, database schema, and server-rendered architecture.
- Retain configured target progress as supporting context.

**Non-Goals:**

- Creating a new universal economic-value formula.
- Adding default targets or migrating existing asset records.
- Changing break-even calculations on asset detail and simulation pages.
- Adding charts, new dependencies, or client-side leaderboard state.

## Decisions

### Rank only within an asset type

The calculation module will expose a type-specific observed-value ranking. Time assets sort by holding cost per day ascending, count assets with recorded uses sort by cost per use ascending, and quota assets sort by usage ratio descending. Ties sort by lower total cost and then stable asset ID.

This keeps every rank interpretable in its native unit. Percentile normalization was rejected because the small number of assets would make scores unstable and would describe relative position rather than real value.

### Separate unrecorded count assets from ranked count assets

A count asset with zero usage records has no observed cost per use. It will appear after ranked assets with no rank number and a "waiting for first use" status. Treating its fallback `totalCost` value as a real cost per use would imply an observation that never occurred.

### Make the all-assets view an insight overview

The default `all` filter will show one best-value card per available asset type and a short attention list. Attention selection uses the inverse of each type's ranking: highest holding cost per day for time, an unrecorded asset first or highest cost per use for count, and lowest utilization for quota. The UI will label the concrete reason instead of calling an asset a regret.

Detailed numbered rankings remain available through the existing type filters.

### Keep target progress as optional secondary context

Count and time assets with valid targets continue to expose their clamped break-even progress. The page may render this as a secondary progress indicator, but it never changes observed-value ordering or eligibility. Quota utilization remains its primary metric.

### Keep rendering on the server

The page will continue reading `searchParams`, cookies, and SQLite in a Server Component. Filter controls remain ordinary links, avoiding a new hydration boundary and client bundle cost.

## Risks / Trade-offs

- [Time assets are ranked by days held, not confirmed daily use] → Label the metric "holding cost per day" rather than "usage cost per day."
- [Usage logging completeness affects count and quota results] → Clearly flag count assets with no records and describe rankings as based on recorded activity.
- [Attention selection can repeat a leader when a type has only one asset] → Suppress duplicate attention entries that would provide no additional insight.
- [Removing a global rank reduces competitive simplicity] → Keep concise per-type leaders on the overview and numbered lists under type filters.
