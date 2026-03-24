# showcase-02 — Project Instructions

> Update this file in the same commit as the code change it describes.

## Intent
An Oxide-inspired cloud infrastructure console — the second showcase project for the portfolio at `../my-portfolio`. Built to demonstrate UX thinking for technical users and systems-level design, specifically targeting Oxide Computer's design and engineering standards.

Built as a standalone Nuxt 4 app. The design system is intentionally distinct from the portfolio's; don't borrow styles or tokens from `../my-portfolio`.

Dev server runs on port 3002 (`npm run dev -- --port 3002`).

## Conventions

### State
`useDashboard.ts` is the single source of truth. All components read from it via `useDashboard()` — no local state for anything shared. Data flows:
- `period` → `filteredMetrics` → `cpuSeries` / `memSeries` / `kpis`
- `selectedProject` + `sortKey` + `sortDir` → `filteredInstances` (instance table)
- `toggleSort(key)` updates `sortKey` and flips `sortDir` if key matches

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

### Data
- Infrastructure data lives in `app/data/analytics.ts` (kept filename for compatibility)
- Data is deterministic (seeded PRNG mulberry32) — no randomness between renders
- 24 instances: 18 running, 2 starting, 3 stopped, 1 faulted (realistic production mix)
- No backend; everything is static

## Patterns

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
