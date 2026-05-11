# globe-ai

<img width="1200" height="630" alt="og" src="https://github.com/user-attachments/assets/35c5aa90-d18e-401b-be1e-9634fe38e488" />

A live, interactive 3D globe for Solana DeFi. Protocols cluster on Earth by network, transactions arc in real time off the Solana block stream, and side panels surface live block history, TPS, and chain metrics as they happen. Powered by the [Trackall SDK](https://www.npmjs.com/package/@nightlylabs/trackall-sdk).

## What it does

- **Live globe.** A `cobe`-rendered Earth with country borders from `world-atlas` (topojson). DeFi protocols indexed by Trackall are placed on the globe and clustered by network into pins that fan open as you zoom in.
- **Real-time arcs.** Every Solana transaction that touches a tracked program is streamed in over WebSocket and spawns an arc on the globe between the programs it interacted with.
- **Live activity toasts.** The transaction firehose is debounced into three signal types: protocol activity bursts (≥10 matched tx in 5s), cross-program interactions (a single tx touching 2+ tracked programs), and failed interactions. Each toast deep-links into the protocol page or the Solana explorer.
- **Block + market panels.** A rolling buffer of the last 64 slots (with received-lag), a live TPS counter (5s sliding window), and Trackall chain/protocol metrics. On narrow screens the panels collapse into a bottom sheet with tabs.
- **Drill-downs.** Click a cluster pin to open a protocol page (positions, metrics, networks it spans). Click a network to filter the globe or open its dedicated network page. Click a country to drop a local wallet pin.
- **Portfolio view.** Paste any wallet address to inspect its DeFi positions across the protocols Trackall indexes (liquidity, lending, staking, vesting, trading, rewards).

### Routes

| Path | Page |
| --- | --- |
| `/` | Globe + live activity |
| `/network`, `/network/:id` | Network index / detail (with block stream) |
| `/projects` | Protocol index |
| `/protocol/:id` | Protocol detail (metrics, positions) |
| `/portfolio`, `/portfolio/:address` | Wallet portfolio |
| `/pricing` | Product pricing |

The active network filter is preserved as a `?network=` query param across navigations.

## How it works

### Data sources

- **Trackall SDK** (`@nightlylabs/trackall-sdk`) — Solana platforms, per-platform metrics, chain metrics, user DeFi positions. Polled on an interval (`trackallRefreshMs`).
- **Trackall WebSocket** at `wss://trackall.nightly.app/api/solana/ws?apiKey=…`. Two channels:
  - `blocks.meta` — slot, blockhash, parent, blockTime, server-side receivedAt. Drives the block panel and the received-lag readout.
  - `transactions.integrations` — signature, slot, instruction index, matched program IDs, account keys, failed flag. Drives the arcs, TPS, and live-activity toasts.
- **world-atlas / topojson-client** — country polygons for the globe's hit-testing overlay and wallet pin selection.

### Globe rendering

`GlobeScene` wraps a single `cobe` instance. Protocols are projected to lat/lon, then `clusterProtocols(protocols, normalizedZoom)` groups nearby protocols into a single marker based on the current zoom level. Clicking a cluster calls `zoomToSplit(cluster, MIN, MAX)` to compute the zoom that just barely separates its children, and the camera animates in. A scene handle exposes `spawnArcsForTransaction(matchedProgramIds)` so the WS layer can fire arcs without re-rendering React.

### Block stream

`useBlockStream` owns the WebSocket lifecycle: connect, subscribe to both channels, keep a rolling buffer of up to 64 blocks, maintain a 5-second sliding window of transactions for TPS, and reconnect with exponential backoff (1s → 30s). Each parsed `solana.transaction` message is handed to an `onTransaction` callback that fans out to (a) the live-activity toast pipeline and (b) the globe's arc spawner.

### Live-activity pipeline

In `App.tsx`, `useLiveGlobeActivity` keeps per-protocol burst windows and per-key cooldown maps so the toast stream stays readable under load:

- Global spacing: 1.2s minimum between any two toasts.
- Failure cooldown: 20s per protocol/program set.
- Cross-program cooldown: 8s per protocol/program set.
- Protocol burst: 10 tx within a 5s window, 18s cooldown per protocol.

Toasts are only shown while the home route is active; switching pages tears down outstanding toast IDs.

### Routing

There is no router library. `App.tsx` reads `window.location` via small helpers in `lib/network-route.ts`, `lib/protocol-route.ts`, and `lib/network-filter.ts`, then mutates history with `pushState` / `popstate`. Page transitions are double-buffered: the outgoing page stays mounted in one `<section>` while the incoming page mounts in the other, and a CSS-driven slide/fade plays between them.

## Environment

```bash
VITE_TRACKALL_API_KEY=...          # required, Trackall API key
VITE_TRACKALL_API_URL=...          # optional, defaults to https://trackall.nightly.app/
```

## Scripts

```bash
npm run dev          # vite dev on :4001
npm run build        # vite build
npm run preview      # vite preview on :4001
npm run typecheck    # tsc -b
```

## Source map

```
apps/globe-ai/src/
├── App.tsx                          → top-level shell, routing, live-activity orchestration
├── main.tsx                         → React entry
├── styles.css                       → globals (starfield, ambient grid, page transitions)
├── components/
│   ├── GlobeScene.tsx               → cobe globe, clustering, arc spawning, country hit-test
│   ├── AppHeader.tsx                → top nav
│   ├── Panels.tsx                   → block history + market metrics (+ mobile tab sheet)
│   ├── NetworkPage.tsx              → per-network detail with block stream
│   ├── NetworkIndexPage.tsx         → network picker
│   ├── NetworkFilterChip.tsx        → active filter chip
│   ├── ProjectIndexPage.tsx         → protocol index
│   ├── ProtocolPage.tsx             → protocol detail page
│   ├── ProtocolDetailPanel.tsx      → hover/preview card on the globe
│   ├── PortfolioPage.tsx            → wallet positions view
│   ├── WalletPinDialog.tsx          → country → local wallet pin
│   └── ProductPricingPage.tsx
└── lib/
    ├── use-block-stream.ts          → Solana WS client (reconnect, TPS window, block buffer)
    ├── trackall-api.ts              → Trackall SDK wrappers + platform → protocol mapping
    ├── clusters.ts                  → globe clustering + zoom-to-split math
    ├── countries.ts                 → topojson loader + country lookup
    ├── network-route.ts             → /network/:id parsing
    ├── protocol-route.ts            → /protocol/:id, /projects, /portfolio parsing
    ├── network-filter.ts            → ?network= query state
    ├── networks.ts                  → network metadata
    ├── protocols.ts                 → protocol metadata
    ├── network-stats.ts             → per-network derived stats
    ├── protocol-stats.ts            → per-protocol derived stats
    ├── series-change.ts             → percent-change helpers
    ├── portfolio-mock.ts            → portfolio fallback data
    ├── explorer.ts                  → Solana explorer URL builder
    ├── format.ts                    → number/duration formatters
    ├── solana.ts                    → Solana-specific constants
    └── types.ts                     → Protocol, WalletPin, etc.
```
