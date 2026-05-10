# Asset Detail Loading Throttle in Next.js App Router

> We traced a repeatable 300ms skeleton on local navigations to the interaction between Next.js route-level loading UI and React Suspense fallback throttling, not to database or rendering work.

## Problem

We noticed a confusing production-only behavior in our local Next.js app:

- Opening `/assets/[id]` in a fresh tab felt instant.
- Navigating from the dashboard to the same asset detail page consistently showed a skeleton for about 300ms.
- The project was running locally with `pnpm start`, SQLite, and a very fast machine, so a real 300ms backend bottleneck did not make sense.

At first glance this looked like a database or network issue. It was neither.

## Why It's Hard

This problem is tricky because multiple layers overlap:

- The route is dynamic and reads cookies, so it does not behave like a purely static page.
- `loading.tsx` changes the navigation model by introducing a route-level Suspense fallback.
- App Router navigation time is not the same as database time or request time.
- Dev and production behave differently, especially around prefetching and loading boundaries.
- A direct page load and a client-side navigation do not exercise the same code path.

That makes it easy to blame the wrong thing: SQLite, `cookies()`, chart rendering, network latency, or client component size.

## Alternatives Considered

### Option A: Keep `loading.tsx` and treat the skeleton as expected

- How it works:
  Keep the route-level fallback and accept the 300ms loading state on dashboard-to-detail transitions.
- Pros:
  - Preserves an instant loading UI at the route level.
  - Stays closest to the default App Router pattern.
- Cons:
  - The detail page server work is already around 1-2ms, so the skeleton mostly exposes framework scheduling overhead instead of useful progress.
  - The UX feels slower than the route really is.

### Option B: Force prefetch or patch the runtime

- How it works:
  Either force `prefetch={true}` on dashboard links, or experimentally patch React's fallback throttle in `node_modules`.
- Pros:
  - Can reduce or hide the delay.
  - Helped us validate the hypothesis during debugging.
- Cons:
  - `prefetch` treats the symptom, not the route structure.
  - Runtime patching is not a maintainable product solution.
  - This behavior depends on the exact React/Next runtime copy used in the bundle.

### Option C: Remove route-level `loading.tsx` and use narrower Suspense later if needed

- How it works:
  Remove `app/assets/[id]/loading.tsx`, keep the page synchronous, and only add local `<Suspense>` boundaries around truly slow subtrees in the future.
- Pros:
  - Matches the real cost profile of the page.
  - Avoids the route-level fallback path that introduced the 300ms delay.
  - Keeps future optimization options open for specific slow widgets such as charts.
- Cons:
  - We lose the route-wide skeleton.
  - If the page becomes genuinely slow later, we will need to reintroduce loading UI more selectively.

## Solution

We chose Option C.

The key observation was that the page itself was already fast. We temporarily added timing probes and found:

- database lookup was roughly 1ms
- total server work was roughly 1-2ms
- the RSC request itself was roughly 10-12ms once active
- the visible delay was in the client navigation transition, not in page code

Once we removed the route-level `loading.tsx`, navigation dropped to around 45-60ms end-to-end, which matched expectations for a local production build.

## Root Cause Deep Dive

The interesting part was not that `loading.tsx` existed. The interesting part was **what it changed the router and React runtime into doing**.

### 1. `Link` click enters React transition work

The App Router `Link` implementation handles local clicks by preventing the browser's default navigation and dispatching a router action inside `React.startTransition`.

In `node_modules/next/dist/esm/client/app-dir/link.js`:

```js
e.preventDefault()

const { dispatchNavigateAction } = require('../components/app-router-instance')
React.startTransition(() => {
  dispatchNavigateAction(href, replace ? 'replace' : 'push', ...)
})
```

React's `startTransition` sets `ReactSharedInternals.T` while the callback runs. Later, React DOM maps updates created in that scope onto a transition lane:

```js
var transition = ReactSharedInternals.T
return null !== transition
  ? requestTransitionLane()
  : resolveUpdatePriority()
```

This matters because the 300ms throttle only applies to transition-priority work, not every React update.

### 2. Next.js treated the route as a partially-prefetchable dynamic route

The Next.js docs say two things that matter here:

- In production, `<Link>` prefetching is enabled.
- For dynamic routes, default prefetching only goes as far as the nearest `loading.js` boundary.

In `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`, the default `prefetch="auto"` behavior is documented as:

```md
- "auto" or null (default): ... For dynamic routes, the partial route down to
  the nearest segment with a loading.js boundary will be prefetched.
```

The broader navigation guide says the same thing more explicitly:

```md
- Dynamic Route: prefetching is skipped, or the route is partially prefetched
  if loading.tsx is present.
```

That means our dashboard-to-detail navigation was not a simple "click -> fetch full page -> render" path. Next.js already had a prefetched route-level fallback available and used that as part of the transition model.

### 3. `loading.tsx` implicitly wrapped the page in a Suspense boundary

The loading file docs state that `loading.js` creates route-level fallback UI and that Next.js automatically wraps the page contents in Suspense.

That matters because the navigation is no longer just about fetching data. It becomes a Suspense transition with:

- a prefetched fallback shell
- a streamed page payload
- React deciding when to reveal fallback vs continue suspended work

The concrete implementation is in `node_modules/next/dist/esm/client/components/layout-router.js`:

```js
function LoadingBoundary({ name, loading, children }) {
  if (loading !== null) {
    return (
      <Suspense
        name={name}
        fallback={<>{loadingStyles}{loadingScripts}{loadingRsc}</>}
      >
        {children}
      </Suspense>
    )
  }

  return <>{children}</>
}
```

Without `loading.tsx`, this route-level `Suspense` wrapper is not created.

### 4. The segment cache renders partial data first and creates deferred RSC promises

When the route has a prefetched shell but still needs dynamic page data, Next creates cache nodes that can render the partial state immediately and fill missing RSC later.

In `node_modules/next/dist/esm/client/components/router-reducer/ppr-navigations.js`, `createCacheNodeForSegment` explicitly models this:

```js
// A partial state to show immediately while we wait for the final data to arrive.
let prefetchRsc

// The final, resolved segment data. If the data is missing, this will be a
// promise that resolves to the eventual data.
let rsc

if (isCachedRscPartial) {
  prefetchRsc = cachedRsc
  rsc = createDeferredRsc()
}
```

The layout router then uses the prefetched value first and switches to the final `rsc` when it resolves:

```js
const resolvedPrefetchRsc =
  cacheNode.prefetchRsc !== null ? cacheNode.prefetchRsc : cacheNode.rsc

const rsc = useDeferredValue(cacheNode.rsc, resolvedPrefetchRsc)
```

That is the bridge between Next's partial prefetch model and React's Suspense runtime.

### 5. Next spawns the missing dynamic RSC request in the navigation task

The source-level path is important because it corrects a tempting but too-strong conclusion.

In `node_modules/next/dist/esm/client/components/segment-cache/navigation.js`, a prefetched route tree goes through `navigateToKnownRoute`, which creates a navigation task and then calls `spawnDynamicRequests` when dynamic data is missing:

```js
const task = startPPRNavigation(...)

if (task !== null) {
  spawnDynamicRequests(task, url, nextUrl, freshnessPolicy, accumulation, ...)
  return completeSoftNavigation(...)
}
```

And `spawnDynamicRequests` starts the missing dynamic request without awaiting it:

```js
const primaryRequestPromise =
  fetchMissingDynamicData(task, dynamicRequestTree, primaryUrl, ...)
```

The actual RSC fetch is in `fetch-server-response.js`:

```js
let processed = fetch(fetchUrl, fetchOptions).then(processFetch)
```

So the source code does **not** support the overly broad claim that React directly waits 300ms before Next ever calls `fetch`. What it does support is:

- Next constructs a partial route state immediately.
- Next creates deferred RSC promises for missing data.
- Next spawns the dynamic request for those promises.
- React controls when the transition with that Suspense/fallback state is committed.

If Chrome DevTools shows a request as queued near the 300ms mark, we need to line up its timestamp with an explicit `performance.mark()` from the click handler before treating it as click-relative. The stronger source-backed root cause is the transition commit/retry throttle, not fetch initiation itself.

### 6. React tracks recent fallback reveals and throttles them

Inside the React DOM runtime bundled by Next.js, there is a global constant:

```js
globalMostRecentFallbackTime = 0,
FALLBACK_THROTTLE_MS = 300,
```

This appears in `node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js`.

More importantly, React updates `globalMostRecentFallbackTime` when a Suspense boundary flips fallback visibility:

```js
finishedWork.child.flags & 8192 &&
  (null !== finishedWork.memoizedState) !==
    (null !== current && null !== current.memoizedState) &&
  (globalMostRecentFallbackTime = now$1());
```

So React is explicitly remembering the time of the most recent fallback transition.

### 7. Transition-priority work is held inside that throttle window

Later in the same runtime, React checks whether the current render is in the transition lane group and whether it is still within the fallback throttle window:

```js
(lanes & 62914560) === lanes &&
((renderWasConcurrent =
  globalMostRecentFallbackTime +
  FALLBACK_THROTTLE_MS -
  now$1()),
10 < renderWasConcurrent)
```

If that condition is true, React marks the root as suspended and schedules completion later:

```js
markRootSuspended(...)
pendingEffectsLanes = lanes
forceSync.timeoutHandle = scheduleTimeout(...)
```

There is a second related check when suspended work pings again:

```js
workInProgressRootExitStatus === RootSuspended &&
(workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes &&
now$1() - globalMostRecentFallbackTime < FALLBACK_THROTTLE_MS
```

In that case React restarts with `prepareFreshStack(root, 0)` instead of continuing immediately.

The key point is not the exact helper names. The key point is that **React has a real 300ms timing gate around Suspense fallback behavior for transition-priority work**.

### 8. Why the page stayed behind the skeleton for about 300ms

Our measurements showed:

- click to visible detail page mount: about 300ms
- request/response itself, once active: about 10ms
- server page work: about 1-2ms

That looked impossible until we combined the Next.js navigation model with the React throttle behavior:

- Next.js had already prefetched the loading boundary, so the navigation could immediately enter the fallback/transition path.
- The detail page itself was dynamic, so the full page payload still had to be requested.
- React treated the navigation as transition-priority Suspense work and applied the fallback throttle window.

The result was not "the server is slow". The result was "the client transition commit is intentionally being paced by the Suspense runtime".

### 9. Why direct loads and client navigations behaved differently

The Next.js instant navigation guide explains that page loads and client navigations produce different shells.

- On a page load, the page renders from the document root.
- On a client navigation, Next.js re-renders only below the shared layout boundary.

That matches what we saw:

- fresh-tab page loads felt instant
- dashboard-to-detail client navigations hit the route-level loading boundary and exposed the throttle behavior

### 10. Why patching `react-dom` only worked after we patched the right copy

We first changed the top-level `react-dom` package and saw no effect.

That turned out to be a packaging detail:

- the app bundle was using Next.js' vendored React DOM runtime under `node_modules/next/dist/compiled/react-dom/`
- not the top-level `node_modules/react-dom/` copy we patched first

Once we patched the vendored runtime and rebuilt, the delay collapsed from about 300ms to about 50-60ms. That was the strongest validation that the throttle path was real.

## What We Measured

During debugging, we instrumented the page and query layer. The important conclusion was not the exact tooling, but the shape of the numbers:

```ts
const asset = getAssetWithRecords(id)
if (!asset) notFound()

switch (asset.type) {
  case 'time':
    metrics = calculateTimeBased(asset)
    break
  case 'count':
    metrics = calculateCountBased(asset, asset.usageRecords)
    break
  case 'quota':
    metrics = calculateQuotaBased(asset, asset.usageRecords)
    break
}
```

This work in `src/app/assets/[id]/page.tsx` was never the bottleneck.

The query path was also straightforward:

```ts
export function getAssetWithRecords(id: string) {
  seedIfNeeded()
  const db = getDb()
  const asset = db.select().from(schema.assets).where(eq(schema.assets.id, id)).get()
  if (!asset) return null

  const records = db
    .select()
    .from(schema.usageRecords)
    .where(eq(schema.usageRecords.assetId, id))
    .all()

  return { ...asset, usageRecords: records }
}
```

That function in `src/lib/db/queries.ts` was already fast enough.

## What the Final Implementation Looks Like

The dashboard now links directly to the detail route without custom navigation instrumentation:

```tsx
function AssetCard({ asset, summary, archived, sym }: AssetWithSummary & { archived?: boolean; sym: string }) {
  return (
    <Link href={`/assets/${asset.id}`} className="block">
      <Card size="sm" className={cn('gap-2 py-3 transition-all cursor-pointer', archived && 'opacity-60')}>
        {/* card content */}
      </Card>
    </Link>
  )
}
```

This lives in `src/app/page.tsx`.

We also removed the route-level loading file for `app/assets/[id]`. If we later find a genuinely slow subtree, we will wrap that subtree in a local `<Suspense>` boundary instead of suspending the whole route.

## Key Takeaways

- A 300ms client-side navigation delay does not imply 300ms of server or database work.
- In App Router, `loading.tsx` changes navigation behavior, not just visuals.
- Dynamic-route prefetching plus route-level loading UI can route a navigation into a Suspense path that behaves very differently from a direct page load.
- React has an actual `FALLBACK_THROTTLE_MS = 300` gate in the Suspense runtime used by Next.js.
- Production behavior matters here; `pnpm dev` is not a reliable proxy for App Router navigation UX.
- Route-level loading UI is not always a win. When the real route work is already cheap, it can make the app feel slower.
- If we need loading UI later, a narrower page-internal Suspense boundary is safer than suspending the entire route segment.

## References

- `src/app/page.tsx` — Dashboard asset cards and the entry point for dashboard-to-detail navigation.
- `src/app/assets/[id]/page.tsx` — Asset detail page server work and metrics rendering.
- `src/lib/db/queries.ts` — SQLite access for asset and usage record lookup.
- `node_modules/next/dist/esm/client/app-dir/link.js` — App Router `<Link>` click handling and transition dispatch.
- `node_modules/next/dist/esm/client/components/app-router-instance.js` — Navigation action queue creation and dispatch.
- `node_modules/next/dist/esm/client/components/segment-cache/navigation.js` — Segment Cache navigation entry point and dynamic request spawning.
- `node_modules/next/dist/esm/client/components/router-reducer/ppr-navigations.js` — Partial route navigation tasks, deferred RSC promises, and dynamic data fulfillment.
- `node_modules/next/dist/esm/client/components/layout-router.js` — `loading.tsx` conversion into route-level Suspense boundaries and deferred RSC rendering.
- `node_modules/next/dist/esm/client/components/router-reducer/fetch-server-response.js` — RSC request construction and Flight response decoding.
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` — Dynamic route prefetching, loading boundaries, and client-side transitions.
- `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` — Why page loads and client navigations can produce different shells.
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` — Default Link prefetch behavior for dynamic routes.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md` — `loading.tsx` semantics and the note that it does not guarantee instant client-side navigation.
- `node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js` — The Suspense fallback timestamping and 300ms throttle checks used by the bundled runtime.
