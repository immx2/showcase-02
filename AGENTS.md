# showcase-02 — Project Instructions

> Update this file in the same commit as the code change it describes.

## Intent
An interactive analytics dashboard — the second showcase project for the portfolio at `../my-portfolio`. Built as a standalone Nuxt 4 app. The design system is intentionally distinct from the portfolio's; don't borrow styles or tokens from `../my-portfolio`.

Dev server runs on port 3002 (`npm run dev -- --port 3002`) to avoid conflicting with the portfolio (3000) and showcase-01 (3001).

## Conventions

### State
`useDashboard.ts` is the single source of truth. All components read from it via `useDashboard()` — no local state for anything shared. When adding a new chart or filter, add its data/state here first, then wire up in the component.

### CSS
- Token-first: always reach for `--space-*`, `--radius-*`, `--duration-*`, `--chart-*` before hardcoding values
- Colors live in `_global.css` — 3-tier color mode (auto/light/dark) via `data-color-mode` on `<html>`
- Color mode handled by `@nuxtjs/color-mode` (configured in `nuxt.config.ts` with `dataValue: 'color-mode'`)
- All component styles in `<style scoped>`, no Tailwind, no CSS-in-JS

### D3 Charts
- D3 is used for math (scales, shapes, layouts, axes) — Vue handles rendering via SVG templates
- Axis DOM operations go in `onMounted` + `watch` (client-only)
- All chart components are wrapped in `ClientOnly` in `index.vue`
- Each chart accepts data as props and is fully reactive
- Unique SVG gradient/clip IDs via `useId()`

### Data
- Mock SaaS analytics data lives in `app/data/analytics.ts`
- Data is deterministic (seeded PRNG) — no randomness between renders
- No backend; everything is static JSON

## Patterns

### Adding a chart
1. Create a new component in `app/components/` following the existing chart pattern (props, D3 scales, Vue SVG template)
2. Wire data through `useDashboard.ts`
3. Add the chart inside a `ChartCard` + `ClientOnly` wrapper in `index.vue`

### Adding a KPI
1. Add the computation to `kpis` computed in `useDashboard.ts`
2. The `KpiCard` component auto-renders it with animated counter and sparkline

## Boundaries
- This app is standalone — don't reach into `../my-portfolio` or `../showcase-01` for anything
- No Tailwind
