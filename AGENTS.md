# showcase-02 — Project Instructions

> Update this file in the same commit as the code change it describes.

## Intent
An Oxide-inspired cloud infrastructure console — the second showcase project for the portfolio at `../my-portfolio`. Built to demonstrate UX thinking for technical users and systems-level design, specifically targeting Oxide Computer's design and engineering standards.

Built as a standalone Nuxt 4 app. The design system is intentionally distinct from the portfolio's; don't borrow styles or tokens from `../my-portfolio`.

Dev server defaults to port 3002 (`devServer.port` in `nuxt.config.ts`; `npm run dev`).

## Conventions

### State
`useDashboard.ts` is the single source of truth. All components read from it via `useDashboard()` — no local state for anything shared. Data flows:
- `period` → `filteredMetrics` → `cpuSeries` / `memSeries` / `kpis`
- `isLive` / `toggleLive()` → `liveSamples` ticks every 3s, driving all reactive charts
- `selectedProject` + `sortKey` + `sortDir` → `filteredInstances` (instance table)
- `toggleSort(key)` updates `sortKey` and flips `sortDir` if key matches
- `sledMultiBarData` → grouped CPU/Mem/Disk bars per sled
- `allCpuSeries` / `allMemSeries` → full 90-day window for `LineChart` context/brush

**Global singleton state** (module-level in `useDashboard.ts`):
- `liveSamples` — reactive copy of `metricSamples`, appended to in live mode
- `isLive` — whether live simulation is running

**Global singleton state** (module-level in composables):
- `useToast` — module-level `toasts` array, auto-dismiss via `setTimeout`
- `useCommandPalette` — module-level `isOpen` ref

### VueUse
- `@vueuse/nuxt` is in `nuxt.config.ts` modules; it depends on `@vueuse/core` — keep only `@vueuse/nuxt` in `package.json` unless you need to pin `@vueuse/core` explicitly.
- VueUse composables (`useElementSize`, `useEventListener`, etc.) are Nuxt auto-imported; do not import from `@vueuse/core` in app code.

### CSS
- Token-first: always reach for `--space-*`, `--radius-*`, `--duration-*`, `--chart-*`, `--font-mono` before hardcoding values
- Colors live in `_global.css` — `--color-status-*` for instance states, `--color-positive/negative` for trends
- Color mode handled by `@nuxtjs/color-mode` (with `dataValue: 'color-mode'`). Dark mode is the "home" aesthetic (Oxide-adjacent dark teal-black)
- All component styles in `<style scoped>`, no Tailwind, no CSS-in-JS
- Use `var(--font-mono)` for all technical values: IPs, IDs, percentages, sizes, timestamps

### D3 Charts
- D3 is used for math (scales, shapes, layouts, axes) — Vue handles rendering via SVG templates
- Axis DOM operations go in `onMounted` + `watch` (client-only)
- All chart components are wrapped in `ClientOnly` in `index.vue`
- Chart colors map semantically: chart-1 = CPU (green), chart-2 = memory (sky), chart-3 = disk (amber), chart-4 = network (violet)
- Axis text uses `var(--font-mono)`
- `LineChart` supports `fullData`/`fullData2` props for the context minimap + D3 brushX

### Data
- Infrastructure data lives in `app/data/analytics.ts`
- Data is deterministic (seeded PRNG mulberry32) — no randomness between renders
- 24 instances: 18 running, 2 starting, 3 stopped, 1 faulted (realistic production mix)
- Each instance has a `sledId` distributing across 6 sleds (4 per sled)
- `instanceSparklines` / `instanceMemSparklines` — 20-point CPU/mem history per instance
- No backend; everything is static

## Patterns

### Command Palette
`Ctrl+K` / `⌘K` opens the palette. `?` opens shortcuts view. `AppNav` has a search hint button. `CommandPalette.vue` is mounted inside `index.vue` and emits: `select-instance`, `set-period`, `toggle-view`, `toggle-live`.

### Keyboard shortcuts (global)
Registered via `useEventListener` in `CommandPalette.vue` (Ctrl+K, ?) and `index.vue` (R, L, ←, →).

| Key | Action |
|-----|--------|
| `Ctrl/⌘ K` | Open command palette |
| `?` | Shortcuts overlay (inside palette) |
| `Esc` | Close palette / drawer |
| `L` | Toggle live mode |
| `R` | Toggle rack / table view |
| `←` `→` | Change time period |

### Toast notifications
`useToast().addToast(message, type, duration?)` from any component. `AppToast.vue` is mounted in `app.vue` via `<Teleport to="body">`.

### Instance detail drawer
`InstanceDrawer.vue` receives `:instance` from `index.vue`'s `selectedInstance` ref. Opened by clicking a table row, clicking an instance chip in rack view, or selecting from the command palette.

### Rack topology view
`RackTopology.vue` reads `instances` + `sledUsage` from `analytics.ts`. Toggle between `instancesView = 'table' | 'rack'` in `index.vue` header controls. Keyboard shortcut `R`.

### Live mode
`toggleLive()` from `useDashboard` starts/stops a `setInterval` that appends to `liveSamples`. All charts and KPIs update reactively. Keyboard shortcut `L`.

### D3 brush (LineChart)
Pass `:full-data` and `:full-data2` to `LineChart` to enable the context minimap. Brush emits `update:brush-range` with `[Date, Date] | null`. `index.vue` displays the zoomed range in the `ChartCard` description.

### Instance table sort
Click a column header → `emit('sort', key)` → `useDashboard.toggleSort(key)` → reactive `filteredInstances` re-sorts.

### Adding a new chart
1. Create a component in `app/components/` following existing chart patterns
2. Wire data through `useDashboard.ts`
3. Add inside `ChartCard` + `ClientOnly` in `index.vue`

### Instance states
Use `<StatusBadge :status="inst.state" />` anywhere you need to display instance health. States: `running` (pulsing green dot), `starting` (pulsing amber dot), `stopped` (static gray dot), `faulted` (static red dot).

## Boundaries
- This app is standalone — don't reach into `../my-portfolio` or `../showcase-01` for anything
- No Tailwind
- Prefer `var(--font-mono)` for any number or technical string shown to users
