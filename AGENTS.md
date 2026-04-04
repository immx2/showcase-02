# showcase-02 — Project Instructions

> Update this file in the same commit as the code change it describes.

## Intent
An Oxide-inspired cloud infrastructure console built to demonstrate UX thinking for technical users and systems-level design. Built as a standalone Nuxt 4 app with a purpose-built design system — dark teal-black aesthetic, dense and keyboard-first.

Dev server defaults to port 3002 (`devServer.port` in `nuxt.config.ts`; `npm run dev`).

## Claude Code Settings
Permissions and plugin config live in `.claude/settings.json` (tracked in git) so they apply on every machine. Claude Code defaults new session-granted permissions to `.claude/settings.local.json` — move non-sensitive ones into `settings.json` manually.

When suggesting a permission to add:
- **Non-sensitive** (e.g. `npm run:*`, `WebFetch(domain:...)`, MCP read tools): suggest adding to `settings.json`
- **Sensitive** (e.g. broad `Bash(**)`, destructive commands, `git push`, `rm`): suggest adding to `settings.local.json` only, and note that it won't be shared across machines

## Linting & Typecheck
- Fix all errors before committing.
- **CSS/style-only changes** (only `.css` files or only `<style>` blocks in `.vue` files): run `npm run lint:css` (Stylelint only).
- **Code-only changes** (any `.ts` files, or `<script>` blocks in `.vue` files): run `npm run lint && npm run typecheck` (ESLint + typecheck, skip CSS).
- **Mixed changes** (both code and CSS): run `npm run lint:all && npm run typecheck`.
- `npm run lint` — ESLint only (JS/TS/Vue `<script>`)
- `npm run lint:css` — Stylelint only (CSS/Vue `<style>`)
- `npm run lint:all` — ESLint + Stylelint

## Conventions

### State
`useDashboard.ts` is the single source of truth. All components read from it via `useDashboard()` — no local state for anything shared. Data flows:
- `period` → `filteredMetrics` → `cpuSeries` / `memSeries` / `kpis`
- `isLive` / `toggleLive()` → `liveSamples` ticks every 3s, driving all reactive charts
- `selectedProject` + `sortKey` + `sortDir` → `filteredInstances` (instance table)
- `toggleSort(key)` updates `sortKey` and flips `sortDir` if key matches
- `sledMultiBarData` → grouped CPU/Mem/Disk bars per sled
- `allCpuSeries` / `allMemSeries` → full 90-day window for `ChartLine` context/brush

**Global singleton state** (module-level in `useDashboard.ts`):
- `liveSamples` — `shallowRef` seeded from `metricSamples`; in live mode the same array is mutated in place (`shift`/`push`) and `triggerRef(liveSamples)` runs so dependents update without allocating a new buffer each tick
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
- Use the single npm package `d3` with `import * as d3 from 'd3'` in chart components (no separate `d3-*` deps)
- D3 is used for math (scales, shapes, layouts, axes) — Vue handles rendering via SVG templates
- Axis DOM operations go in `onMounted` + `watch` (client-only). `ChartLine.vue` batches axis + brush DOM work via stable **data fingerprints** + `requestAnimationFrame` so live ticks do not re-run D3 work on every new scale object identity
- All chart components are wrapped in `ClientOnly` in `index.vue`
- Chart colors map semantically: chart-1 = CPU (green), chart-2 = memory (sky), chart-3 = disk (amber), chart-4 = network (violet)
- Axis text uses `var(--font-mono)`
- `ChartLine` supports `fullData`/`fullData2` props for the context minimap + D3 brushX

### Data
- Infrastructure data lives in `app/data/analytics.ts`
- Static metrics and tables are deterministic (seeded PRNG mulberry32) — no randomness between renders for the initial dataset
- **Live mode** adds bounded random drift to `liveSamples` every 3s (only while `isLive` is on)
- 24 instances: 18 running, 2 starting, 3 stopped, 1 faulted (realistic production mix)
- Each instance has a `sledId` distributing across 6 sleds (4 per sled)
- `instanceSparklines` / `instanceMemSparklines` — 20-point CPU/mem history per instance
- No backend; everything is static

## Patterns

### Command Palette
`Ctrl+K` / `⌘K` opens the palette. `?` opens shortcuts view. `App/Nav.vue` has a search hint button. `App/CommandPalette.vue` (`<AppCommandPalette>`) is mounted inside `index.vue` and emits: `select-instance`, `set-period`, `toggle-view`, `toggle-live`.

### Keyboard shortcuts (global)
Registered via `useEventListener` in `App/CommandPalette.vue` (Ctrl+K, ?) and `index.vue` (R, L, ←, →).

| Key | Action |
|-----|--------|
| `Ctrl/⌘ K` | Open command palette |
| `?` | Shortcuts overlay (inside palette) |
| `Esc` | Close palette / drawer |
| `L` | Toggle live mode |
| `R` | Toggle rack / table view |
| `←` `→` | Change time period |

### Toast notifications
`useToast().addToast(message, type, duration?)` from any component. `App/Toast.vue` (`<AppToast>`) is mounted in `app.vue` via `<Teleport to="body">`.

### Instance detail drawer
`Instance/Drawer.vue` (`<InstanceDrawer>`) receives `:instance` from `index.vue`'s `selectedInstance` ref. Opened by clicking a table row, clicking an instance chip in rack view, or selecting from the command palette.

### Rack topology view
`Instance/RackTopology.vue` (`<InstanceRackTopology>`) reads `instances` + `sledUsage` from `analytics.ts`. Instances are grouped once into a module-level `Map<string, Instance[]>` (by `sledId`) so sled rows do not filter the full list per sled. Toggle between `instancesView = 'table' | 'rack'` in `index.vue` header controls. Keyboard shortcut `R`.

### Live mode
`toggleLive()` from `useDashboard` starts/stops a `setInterval` that appends to `liveSamples`. All charts and KPIs update reactively. Keyboard shortcut `L`.

### KPI cards and live metrics
`DashboardKpiCard` receives `:live="isLive"` from `index.vue`. When live is on, `useAnimatedCounter` **snaps** the displayed value (no RAF easing) so rapid ticks do not spin four animation loops. Sparklines still update from the `kpis` computed data.

### D3 brush (ChartLine)
Pass `:full-data` and `:full-data2` to `<ChartLine>` to enable the context minimap. Brush emits `update:brush-range` with `[Date, Date] | null`. `index.vue` displays the zoomed range in the `<ChartCard>` description.

### Instance table sort
Click a column header → `emit('sort', key)` → `useDashboard.toggleSort(key)` → reactive `filteredInstances` re-sorts.

### Component naming (Nuxt auto-import)
Subdirectory names are prepended to the component name: `Chart/Bar.vue` → `<ChartBar>`. Follow this convention when adding new components.

| Directory | Convention | Example |
|-----------|------------|---------|
| `App/` | App chrome | `App/Nav.vue` → `<AppNav>` |
| `Chart/` | Chart primitives | `Chart/Bar.vue` → `<ChartBar>` |
| `Dashboard/` | Dashboard composites | `Dashboard/Header.vue` → `<DashboardHeader>` |
| `Instance/` | Instance UI | `Instance/Drawer.vue` → `<InstanceDrawer>` |
| root | Shared utilities | `StatusBadge.vue` → `<StatusBadge>` |

### Adding a new chart
1. Create a component in `app/components/Chart/` following existing chart patterns
2. Wire data through `useDashboard.ts`
3. Add inside `<ChartCard>` + `<ClientOnly>` in `index.vue`

### Instance states
Use `<StatusBadge :status="inst.state" />` anywhere you need to display instance health. States: `running` (pulsing green dot), `starting` (pulsing amber dot), `stopped` (static gray dot), `faulted` (static red dot).

## Boundaries
- This app is standalone — no shared code or styles from other repos
- No Tailwind
- Prefer `var(--font-mono)` for any number or technical string shown to users
