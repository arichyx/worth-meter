## 1. Foundation — tokens & shared components

- [x] 1.1 Add `--shadow-sm/md/lg/xl/glow`, `--duration-fast/normal/slow`, and `--ease-default/emphasized` tokens to `src/app/globals.css` under `@theme inline` and `:root`/`.dark`; verify Tailwind v4 parses them.
- [x] 1.2 Add `prefers-reduced-motion` rule in `@layer base` that maps motion tokens to near-zero duration.
- [x] 1.3 Check whether `src/components/ui/` already has a toast/sonner component; if not, implement a lightweight `ToastProvider` and `useToast` hook based on existing `Dialog`/`Card`.
- [x] 1.4 Create `src/components/empty-state.tsx` supporting icon, title, description, and optional action button.
- [x] 1.5 Create `src/components/page-header.tsx` supporting left back/icon area, center title/subtitle area, and right action area; keep it `'use client'` and compatible with existing header props.
- [x] 1.6 Refactor `src/components/dashboard-header.tsx` and `src/app/assets/[id]/detail-header.tsx` to use the new `PageHeader` while preserving their current import interfaces.

## 2. Dashboard layout

- [x] 2.1 Create `src/components/overview-card.tsx` supporting title, main value, helper text, and optional progress bar.
- [x] 2.2 Refactor the top overview area of `src/app/page.tsx` to use three `OverviewCard` components for total investment, break-even count, and average break-even progress.
- [x] 2.3 Tighten dashboard asset group card padding and header height; use `EmptyState` for empty group lists instead of plain text.
- [x] 2.4 Adjust `AssetCard` styling: tighter padding and unified hover shadow using `--shadow-md` token.
- [x] 2.5 Use `EmptyState` for the dashboard empty-asset state.

## 3. Asset detail layout

- [x] 3.1 Add `Tabs` from `src/components/ui/tabs.tsx` to `src/app/assets/[id]/page.tsx`, splitting content into Overview, Trend, and Usage Records tabs.
- [x] 3.2 Keep the top spotlight card and four metric cards inside the Overview tab; ensure `MetricCard` styling aligns with tokens.
- [x] 3.3 Render `AssetChart` inside the Trend tab and ensure the chart empty-state placeholder is shown correctly.
- [x] 3.4 Use `UsageRecordsList` for both count and quota records inside the Usage Records tab; remove the existing inline quota list.
- [x] 3.5 Verify the detail page header (based on `PageHeader`) positions back button, title, edit/archive/delete, and theme/language toggles correctly.

## 4. Asset creation flow

- [x] 4.1 Consolidate scattered `useState` values in `src/app/assets/new/page.tsx` into one form-state object and add a `step` state (1/2/3).
- [x] 4.2 Reuse existing type-selection cards for step 1; advancing to step 2 after selection.
- [x] 4.3 Step 2 shows name, total cost, and purchase date fields with Back/Next buttons; validate before advancing.
- [x] 4.4 Step 3 shows type-specific fields and an information summary card, with Back/Create buttons.
- [x] 4.5 Add inline error messages for all fields; disable submit button and show loading text while submitting.
- [x] 4.6 After successful creation, redirect to `/assets/[id]` and show a success toast.

## 5. Feedback states

- [x] 5.1 Wire `ToastProvider` into global `src/app/providers.tsx`.
- [x] 5.2 Show toast feedback after successful edit, archive, and delete actions on the asset detail page.
- [x] 5.3 Show toast feedback after successful new-asset creation and usage/reset logging.
- [x] 5.4 Add `EmptyState` placeholder for `AssetChart` when there is no data or only a single data point.
- [x] 5.5 Create or update the global not-found / error page style using `EmptyState`.

## 6. Charts & data visualization

- [x] 6.1 Update `src/app/assets/[id]/asset-chart.tsx` to render `EmptyState` when `chartData.length === 0`.
- [x] 6.2 Add a helpful message when `chartData.length === 1`.
- [x] 6.3 Verify the chart container keeps the `h-72` minimum height across viewports.
- [x] 6.4 Verify `ChartTooltip` uses token colors in both light and dark themes.

## 7. i18n

- [x] 7.1 Add dashboard / detail / creation / feedback copy to `src/lib/i18n/locales/en.ts`.
- [x] 7.2 Sync the new keys to `src/lib/i18n/locales/zh.ts`, `zh-TW.ts`, and `ja.ts`.
- [x] 7.3 Ensure `TranslationKey` is automatically derived and no `as any` is needed.

## 8. Verification

- [x] 8.1 Run `pnpm check` / `pnpm lint` and fix biome errors.
- [x] 8.2 Run `pnpm test` and ensure existing tests pass; add unit tests for new components where appropriate.
- [x] 8.3 Run `pnpm build` and confirm a clean production build.
- [x] 8.4 Manually verify: dashboard overview cards, detail tabs, new-asset wizard, toast feedback, light/dark themes, and reduced-motion preference.
