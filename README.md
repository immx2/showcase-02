# Showcase 02 — Cloud Infrastructure Console

An Oxide-inspired cloud infrastructure console built as a portfolio showcase, demonstrating UX thinking for technical users and systems-level UI design.

Dark teal-black aesthetic. Dense, functional, keyboard-first. Built with Nuxt 4, D3, and TypeScript. No UI framework — intentional design system from scratch.

---

## What it demonstrates

- **Designing for technical users** — data-dense tables, monospace values, status semantics, and information hierarchy that respects operator mental models
- **Systems-level thinking** — rack topology view visualizes physical infrastructure; every number on screen maps to a real operational concept
- **Keyboard-first UX** — command palette (`Ctrl+K`), global shortcuts, and escape hatches that let power users stay on the keyboard
- **Custom D3 charts in Vue** — D3 for math (scales, axes, shapes); Vue for rendering. No chart library abstraction
- **Live data simulation** — reactive metrics pipeline that streams new samples and drives all charts simultaneously
- **Composable architecture** — `useDashboard.ts` is the single source of truth; all components read from it, none coordinate directly

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 4 + Vue 3 |
| Charts | D3 v7 (math only; Vue renders SVG) |
| Language | TypeScript |
| Color mode | `@nuxtjs/color-mode` — dark as default |
| Utilities | `@vueuse/nuxt` |

---

## Features

- Line chart with context minimap and D3 brush for zoom / range selection
- Bar chart (grouped CPU / memory / disk per sled)
- Donut chart (instance state distribution)
- Heatmap chart
- Sparklines per instance row
- KPI cards with trend indicators
- Instance table with multi-key sort
- Rack topology view — 6 sleds, 4 instances each, color-coded by state
- Instance detail drawer — click any row or rack chip
- Command palette with fuzzy search and keyboard navigation
- Live mode — appends real-time samples every 3 s, all charts update reactively
- Time period selector — 1h / 6h / 24h / 7d / 30d / 90d
- Toast notification system
- Skeleton loaders

### Keyboard shortcuts

| Key | Action |
|---|---|
| `Ctrl / ⌘ K` | Open command palette |
| `?` | Shortcuts reference (inside palette) |
| `Esc` | Close palette / drawer |
| `L` | Toggle live mode |
| `R` | Toggle rack / table view |
| `←` `→` | Step through time periods |

---

## Data

No backend. All data is generated deterministically via a seeded PRNG (`mulberry32`) — same values on every render, reproducible across environments.

- 24 instances: 18 running, 2 starting, 3 stopped, 1 faulted
- 6 sleds, 4 instances each
- 90-day metric history; per-instance 20-point CPU and memory sparklines

---

## Project structure

```
app/
  components/
    App/
      Nav.vue              # <AppNav> — navigation + period selector + live toggle
      Toast.vue            # <AppToast> — toast renderer (Teleport to body)
      CommandPalette.vue   # <AppCommandPalette> — Ctrl+K palette + shortcuts overlay
    Chart/
      Card.vue             # <ChartCard> — chart wrapper with title, description, actions
      Line.vue             # <ChartLine> — line chart + context minimap + D3 brush
      Bar.vue              # <ChartBar> — grouped bar chart
      Donut.vue            # <ChartDonut>
      Heatmap.vue          # <ChartHeatmap>
      Sparkline.vue        # <ChartSparkline>
    Dashboard/
      Header.vue           # <DashboardHeader> — period / live controls
      KpiCard.vue          # <DashboardKpiCard>
    Instance/
      Table.vue            # <InstanceTable> — sortable table with sparklines + status badges
      Drawer.vue           # <InstanceDrawer> — slide-in detail panel
      RackTopology.vue     # <InstanceRackTopology> — physical rack / sled visualization
    StatusBadge.vue        # <StatusBadge> — animated status indicator
    SkeletonLoader.vue     # <SkeletonLoader>
  composables/
    useDashboard.ts        # All state, derived data, and live simulation
    useToast.ts
    useCommandPalette.ts
  data/
    analytics.ts           # Deterministic infrastructure data
  pages/
    index.vue
```

---

## Running locally

```bash
npm install
npm run dev  # http://localhost:3002
```

```bash
npm run build    # production build
npm run generate # static output
npm run preview  # preview production build
```
