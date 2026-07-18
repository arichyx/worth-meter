## Context

WorthMeter's cost-per-use metrics are only as good as the usage logs behind them. Today logging a use requires navigating to the asset detail page and opening a dialog - enough friction that users skip it, and stale counts make every downstream metric (cost-per-use, break-even, leaderboard) misleading. The existing `addUsageRecordAction(assetId, value, recordedAt)` server action already creates count records with `value = 1`; the detail-page `UsageDialog` uses it. This change adds a frictionless +1 entry point on dashboard cards and a stale-logging nudge that reminds users to log before data goes stale.

## Goals / Non-Goals

**Goals:**
- One-tap +1 logging on count asset cards, no modal, no navigation.
- Valid markup: the +1 button is a sibling of the card's navigation link, not nested.
- Dashboard nudge section for stale count assets, each nudge directly actionable via its own +1.
- Pure, tested nudge computation.

**Non-Goals:**
- No schema changes, no new server actions (reuse `addUsageRecordAction`).
- No push notifications or scheduling; nudges are computed on dashboard render.
- No quick-log on the detail page (it already has a Log Use dialog).
- No nudges for time/quota types (time auto-accumulates; quota has a different cadence).

## Decisions

### Decision 1 - Reuse `addUsageRecordAction(assetId, 1)`, no new action
The +1 button calls the existing server action with `value = 1` and no `recordedAt` (defaults to now), exactly matching the detail-page count log path. Then `router.refresh()` + success toast, mirroring `UsageDialog`.
- *Alternative:* A dedicated `quickLogAction`. Rejected - duplicates existing behavior and risks drift.
- *Consequence:* The button is a client component (`'use client'`) since it calls a server action and uses `useRouter`/`useToast`.

### Decision 2 - Button is a sibling of the `<Link>`, positioned absolutely
The dashboard `AssetCard` currently wraps the whole card in `<Link>`. Nesting a `<button>` inside an `<a>` is invalid HTML and an a11y issue. The card is restructured into a `relative` wrapper containing the `<Link>` (the card) and, for count assets, a `<QuickLogButton>` absolutely positioned in the corner. Clicking the button does not bubble to the link because they are siblings, not nested.
- *Alternative:* Make the whole card a non-link and use `onClick` navigation. Rejected - loses the native link semantics (middle-click, copy-link) that the rest of the app relies on.
- *Consequence:* The `AssetCard` markup changes; existing styling/hover is preserved by keeping the `<Link>` wrapping the `<Card>`.

### Decision 3 - Pure `deriveNudges(assets, nowIso)`
For each active count asset: `daysSinceLastUse = differenceInDays(now, max(recordedAt) or purchaseDate)`. Flag when `daysSinceLastUse >= NUDGE_STALE_DAYS` and `!isBreakEven` (break-even via `calculateCountBased`). Returns `{ assetId, name, daysSinceLastUse }[]`. `nowIso` injected for determinism/tests.
- *Alternative:* Compute inline in the page. Rejected - untestable threshold logic.
- *Consequence:* Break-even check reuses `calculateCountBased`; assets without a target (`breakEvenProgress` null) are still nudged (stale logging matters regardless of whether a target is set), since the point is to keep the count fresh.

### Decision 4 - Nudge is directly actionable
Each nudge row includes its own `QuickLogButton`, so tapping +1 logs a use and, on `router.refresh()`, the stale period resets and the nudge disappears. This turns a passive reminder into an action, which is the whole point.
- *Alternative:* Nudges as plain text with a link to the detail page. Rejected - reintroduces the friction we are removing.

## Risks / Trade-offs

- [Nudges can feel nagging] -> Only shown past the 7-day threshold and only for non-broken-even assets, so a healthy account shows none. *Mitigation:* The threshold constant is centralized; a future change can make it per-asset or dismissible.
- [Absolute positioning on small screens] -> The +1 button in the card corner could overlap the cost text on very narrow viewports. *Mitigation:* Position it top-right with a small size and verify in the build; the card already truncates the title.
- [Stale nudge after refresh race] -> `router.refresh()` revalidates server data; the nudge recomputes from the new last-use date. *Mitigation:* This is the existing pattern from `UsageDialog`, already shipping.

## Migration Plan

Additive - new client component, new pure helper, new tests, new i18n keys, and a refactor of `AssetCard` + a new section in `page.tsx`. No schema, route, or action changes. Rollback is removing the component/helper and reverting `AssetCard` and i18n keys.

## Open Questions

None blocking. A future change may add per-asset nudge thresholds or a "snooze" affordance.
