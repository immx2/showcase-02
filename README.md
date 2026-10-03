<div align="center">

# Showcase 02

**An Oxide-inspired cloud infrastructure console.**

Dense, keyboard-first, and built from scratch. Its signature look is dark teal-black. D3 draws the charts and Vue renders them.

![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)
![D3](https://img.shields.io/badge/D3-7-F9A03C?logo=d3dotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)

</div>

---

## Overview

Showcase 02 is a portfolio piece. It shows UX thinking for technical users and systems-level UI design. The interface has no UI framework. The design system is built for this project.

## What it demonstrates

- **Designing for technical users.** Tables are data-dense. Values use monospace type. Status colors carry meaning. The information hierarchy follows how operators think.
- **Systems-level thinking.** The rack topology view shows physical infrastructure. Every number on screen maps to a real operational concept.
- **Keyboard-first UX.** A command palette (`Ctrl+K`), global shortcuts, and escape hatches keep power users on the keyboard.
- **Custom D3 charts in Vue.** D3 does the math: scales, axes, and shapes. Vue renders the SVG. No chart library sits in between.
- **Live data simulation.** A reactive metrics pipeline streams new samples. All charts and KPIs update together.
- **Composable state.** Domain composables (`useDashboard`, `useStorage`, `useAppDrawer`, and others) hold the state. Components read what they need. No prop drilling.

## Features

- Line chart with a context minimap and a D3 brush for zoom and range selection
- Grouped bar chart for CPU, memory, and disk per sled
- Donut chart for the storage breakdown by type
- Heatmap chart for the API request rate
- Sparklines on every instance row
- KPI cards with trend indicators and animated counters
- Instance table with multi-key sort and a project filter
- Rack topology view with 6 sleds and 4 instances each, colored by state
- Instance detail drawer. Open it from a table row, a rack chip, or the command palette.
- Volume detail drawer. Open it from a row on the Storage page.
- Storage page with capacity KPIs, a growth chart, and a sortable, filterable volume table
- Command palette with instance search and action dispatch
- Live mode. It adds a real-time sample every 3 seconds.
- Time period selector: 7d, 30d, and 90d
- Rich tooltips for charts and rack chips
- Toast notifications and skeleton loaders
- Light, dark, or system color mode. System is the default.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `Ctrl / ⌘ K` | Open the command palette |
| `?` | Show the shortcuts reference (inside the palette) |
| `Esc` | Close the palette or drawer |
| `L` | Toggle live mode |
| `R` | Toggle the rack or table view |
| `←` `→` | Step through the time periods |

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) + Vue 3 |
| Charts | [D3](https://d3js.org) v7. D3 does the math and Vue renders the SVG. |
| Styling | Scoped CSS with design tokens. No UI framework and no Tailwind. |
| Fonts | Inter, JetBrains Mono, and Montserrat through `@nuxt/fonts` |
| Color mode | `@nuxtjs/color-mode`: light, dark, or system. System is the default. |
| Utilities | [VueUse](https://vueuse.org) through `@vueuse/nuxt` |
| Shared navigation | `@immx2/portfolio-nav`, the top strip shared with the portfolio site |
| Language | TypeScript |
| Linting | ESLint (`@nuxt/eslint`) and Stylelint |
| Hosting | Vercel, with Analytics and Speed Insights |

## Design system

The design system is built for this project. All files live in `app/assets/styles/`.

- **Colors.** `colors.css` holds the palette. It includes `--color-status-*` for instance states and `--color-positive` and `--color-negative` for trends.
- **Tokens.** `tokens.css` holds spacing, radius, layout sizes, fonts, and the z-index layers (`--z-*`).
- **Motion.** `animations.css` holds semantic `--motion-*` tokens. Examples are `--motion-interactive`, `--motion-panel-enter`, and `--motion-chart-draw`. Motion respects `prefers-reduced-motion`.
- **Transitions.** `transitions.css` holds the CSS for every named Vue `<Transition>`.
- **Shared styles.** `global.css`, `tables.css`, and `tooltip.css` hold base, table, and tooltip styles.
- **Type.** Technical values use `--font-mono`: IPs, IDs, percentages, sizes, and timestamps.
- **Component styles.** Each component uses `<style scoped>`.

## Getting started

Install the dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open <http://localhost:3002>.

### Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start the dev server on port 3002 |
| `npm run build` | Create a production build |
| `npm run generate` | Create static output |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run lint:css` | Run Stylelint |
| `npm run lint:all` | Run ESLint and Stylelint |
| `npm run typecheck` | Run the TypeScript check |

## Data

The app has no backend. A seeded PRNG (`mulberry32`) generates all data. The values are the same on every render and in every environment.

- 24 instances: 18 running, 2 starting, 3 stopped, and 1 faulted
- 6 sleds with 4 instances each
- 90 days of metric history
- A 20-point CPU sparkline and a 20-point memory sparkline for each instance

## Architecture

### State

`useDashboard` is the source of truth for metrics, KPIs, live mode, and the instance table. `useStorage` does the same for volumes. `useTableState` is a generic sort and project-filter composable. Both use it.

Shared UI state uses Nuxt `useState`, so it is safe for SSR: the drawer, the command palette, the sidebar, and the instances view.

### Tooltips

One global tooltip renderer (`AppTooltip`) serves the whole app. Charts and UI elements trigger it through `TooltipTrigger` or `useTooltipTrigger`. A tooltip body is a string or a component. The `Tt*` primitives build the rich tooltip content.

### Charts

D3 creates scales, axes, shapes, and layouts. Vue renders the SVG. Chart components sit inside `MountSwap`, which swaps a skeleton for the chart. `resolveCssColor` converts CSS colors for D3. `getMotion` reads motion tokens in JavaScript.

### Project structure

```
app/
  app.vue                      App shell
  components/
    App/                       CommandPalette, Drawer, Sidebar, Toast, Tooltip
    base/                      Button, Card, Drawer (+ parts), Scrim, Skeleton,
                               PageContent, PageHeader, SectionHeader, TableWrap
    Card/                      Chart, Kpi, StorageBreakdown
    Chart/                     Bar, Donut, Heatmap, Line, Sparkline, SkeletonLine
                               and a TooltipContent for each chart
    Dashboard/                 Header, SectionCharts, SectionKpis
    Instance/                  Table, RackTopology, DrawerContent,
                               TooltipContent, ViewToggle
    Storage/                   Table, DrawerContent, SectionCharts,
                               SectionKpis, SectionVolumes
    Sidebar/ModePicker.vue     Color mode picker
    Tt/                        Tooltip content primitives
    MountSwap.vue              Skeleton-to-content swap
    ProjectFilter.vue
    StatusBadge.vue            Animated state indicator
    TooltipTrigger.vue         Tooltip anchor wrapper
  composables/
    useDashboard.ts            Metrics, KPIs, live simulation, instance sort and filter
    useStorage.ts              Volume sort and filter
    useTableState.ts           Generic sort and project filter
    useAppDrawer.ts            Single drawer state (instance or volume)
    useCommandPalette.ts
    useInstancesView.ts        Table or rack view
    useSidebar.ts
    useToast.ts
    useTooltip.ts
    useTooltipTrigger.ts
    useAnimatedCounter.ts
    useStagger.ts              Card entrance stagger
    useIsMounted.ts
  data/
    analytics.ts               Deterministic infrastructure data
  utils/
    color.ts                   resolveCssColor
    format.ts                  formatGib, formatPercent, formatNumber, formatThroughput
    motion.ts                  getMotion
    storage.ts                 usedPct, stateToStatus
  pages/
    index.vue                  Dashboard
    instances.vue              Instances
    storage.vue                Storage
  assets/styles/               colors, tokens, global, animations,
                               transitions, tables, tooltip
```

## License

[MIT](LICENSE)
