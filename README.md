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
- **Composable state architecture** — domain composables (`useDashboard`, `useStorage`, `useAppDrawer`, etc.) as SSR-safe singletons via `useState`; components pull what they need directly, no prop drilling

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
- Grouped bar chart (CPU / memory / disk per sled)
- Donut chart (storage breakdown by type)
- Heatmap chart (API request rate)
- Sparklines per instance row
- KPI cards with trend indicators and animated counters
- Instance table with multi-key sort and project filter
- Rack topology view — 6 sleds, 4 instances each, color-coded by state
- Instance detail drawer — click any row or rack chip, or select from command palette
- Volume detail drawer — click any row on the Storage page
- Storage page — capacity KPIs, growth chart, volume table with sort and filter
- Command palette with instance search and action dispatch
- Live mode — appends real-time samples every 3 s; all charts and KPIs update reactively
- Time period selector — 7d / 30d / 90d
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
      CommandPalette.vue   # <AppCommandPalette> — Ctrl+K palette + shortcuts overlay
      Drawer.vue           # <AppDrawer> — single drawer shell; switches Instance/Storage content
      Sidebar.vue          # <AppSidebar> — nav + search hint + color mode picker
      Toast.vue            # <AppToast> — toast renderer (Teleport to body)
      Tooltip.vue          # <AppTooltip> — tooltip overlay (Teleport + flip positioning)
    base/
      Button.vue           # <BaseButton>
      Card.vue             # <BaseCard>
      Drawer.vue           # <BaseDrawer> — Teleport shell, backdrop, slide transition
      Drawer/
        Actions.vue        # <BaseDrawerActions> — button row
        Body.vue           # <BaseDrawerBody> — scrollable content wrapper
        EventLog.vue       # <BaseDrawerEventLog>
        Header.vue         # <BaseDrawerHeader>
        MetaGrid.vue       # <BaseDrawerMetaGrid>
        ModePicker.vue     # <BaseDrawerModePicker>
        StatRow.vue        # <BaseDrawerStatRow>
      PageContent.vue      # <BasePageContent>
      PageHeader.vue       # <BasePageHeader>
      SectionHeader.vue    # <BaseSectionHeader>
      Skeleton.vue         # <BaseSkeleton>
      TableWrap.vue        # <BaseTableWrap> — scrollable table container
    Card/
      Chart.vue            # <CardChart> — chart wrapper with title + description
      Kpi.vue              # <CardKpi> — KPI card with sparkline + trend
      StorageBreakdown.vue # <CardStorageBreakdown>
    Chart/
      Bar.vue              # <ChartBar> — grouped bar chart
      Donut.vue            # <ChartDonut>
      Heatmap.vue          # <ChartHeatmap>
      Line.vue             # <ChartLine> — line chart + context minimap + D3 brush
      SkeletonLine.vue     # <ChartSkeletonLine>
      Sparkline.vue        # <ChartSparkline>
    Dashboard/
      Header.vue           # <DashboardHeader> — period + live controls
      SectionCharts.vue    # <DashboardSectionCharts>
      SectionKpis.vue      # <DashboardSectionKpis>
    Instance/
      DrawerContent.vue    # <InstanceDrawerContent> — instance detail body
      RackTopology.vue     # <InstanceRackTopology>
      Table.vue            # <InstanceTable>
      TooltipContent.vue   # <InstanceTooltipContent> — instance tooltip body
      ViewToggle.vue       # <InstanceViewToggle> — table / rack switcher
    Storage/
      DrawerContent.vue    # <StorageDrawerContent> — volume detail body
      SectionCharts.vue    # <StorageSectionCharts>
      SectionKpis.vue      # <StorageSectionKpis>
      SectionVolumes.vue   # <StorageSectionVolumes>
      Table.vue            # <StorageTable>
    ProjectFilter.vue      # <ProjectFilter>
    Sidebar/
      ModePicker.vue       # <SidebarModePicker> — color mode picker in sidebar
    StatusBadge.vue        # <StatusBadge> — animated state indicator
    Tt/
      Row.vue              # <TtRow> — flex row (tight prop for tighter gap)
      Dot.vue              # <TtDot> — colored circle
      Value.vue            # <TtValue> — mono semibold value
      Muted.vue            # <TtMuted> — mono muted text
      Sep.vue              # <TtSep> — · separator
      Title.vue            # <TtTitle> — header with border-bottom
      KvRow.vue            # <TtKvRow> — key-value row
      KvLabel.vue          # <TtKvLabel> — kv label
      KvVal.vue            # <TtKvVal> — kv value
    TooltipTrigger.vue     # <TooltipTrigger> — tooltip anchor wrapper
  composables/
    useAppDrawer.ts        # Single drawer state (discriminated union: instance | volume)
    useCommandPalette.ts
    useDashboard.ts        # Metrics, KPIs, live simulation, instance sort/filter
    useInstancesView.ts    # Table / rack toggle state
    useSidebar.ts
    useStorage.ts          # Volume sort/filter state
    useTableState.ts       # Generic sort + project-filter composable
    useToast.ts
    useIsMounted.ts
    useAnimatedCounter.ts
    useStagger.ts          # Card-enter stagger attrs factory — v-bind="stagger(i)"
  data/
    analytics.ts           # Deterministic infrastructure data (seeded PRNG)
  utils/
    format.ts              # formatGib, formatPercent, formatNumber, formatThroughput
    storage.ts             # usedPct, stateToStatus
  pages/
    index.vue              # Dashboard (Overview)
    instances.vue          # Instances page
    storage.vue            # Storage page
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
