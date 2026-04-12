# showcase-02 — Project Instructions

> Update this file in the same commit as the code change it describes.

## Intent
An Oxide-inspired cloud infrastructure console built to demonstrate UX thinking for technical users and systems-level design. Built as a standalone Nuxt 4 app with a purpose-built design system — dark teal-black aesthetic, dense and keyboard-first.

Dev server defaults to port 3002 (`devServer.port` in `nuxt.config.ts`; `npm run dev`).

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

**Global singleton state** (module-level in `useDashboard.ts` — not SSR-safe, client-only):
- `liveSamples` — `shallowRef` seeded from `metricSamples`; in live mode the same array is mutated in place (`shift`/`push`) and `triggerRef(liveSamples)` runs so dependents update without allocating a new buffer each tick
- `liveInterval` — non-reactive timer handle (`ReturnType<typeof setInterval>`), not exposed

**Global singleton state** (module-level in composables — not SSR-safe, client-only):
- `useToast` — module-level `toasts` array, auto-dismiss via `setTimeout`
- `useTooltip` — module-level `shallowReactive` state (`show`, `x`, `yTop`, `yBottom`, `content`); `show(content, x, yTop, yBottom?)` / `hide()` — `yBottom` defaults to `yTop` for callers that pass a point rather than an element rect

**Nuxt `useState` singletons** (SSR-safe, keyed):
- `useDashboard` — `'dashboard.period'` (`Period`), `'dashboard.isLive'` (`boolean`)
- `useCommandPalette` — `'command-palette.isOpen'`
- `useAppDrawer` — `'app-drawer'` discriminated union `{ type: 'instance' | 'volume'; item }` or `null`
- `useInstancesView` — `'instances.view'` `'table' | 'rack'`
- `useSidebar` — `'sidebar.isOpen'`

**Generic table composable**:
- `useTableState<TItem, TSortKey>(source, options)` — shared sort + project-filter logic used internally by `useDashboard` (instances) and `useStorage` (volumes). Returns `{ selectedProject, sortKey, sortDir, filtered, toggleSort }`. Each call creates isolated `ref` state (not shared between callers).

**Storage composable**:
- `useStorage()` — parallel to `useDashboard` for volume data. Data flow: `selectedProject` + `sortKey` + `sortDir` → `filteredVolumes`. Sort key type: `VolumeSortKey`.

### VueUse
- `@vueuse/nuxt` is in `nuxt.config.ts` modules; it depends on `@vueuse/core` — keep only `@vueuse/nuxt` in `package.json` unless you need to pin `@vueuse/core` explicitly.
- VueUse composables (`useElementSize`, `useEventListener`, etc.) are Nuxt auto-imported; do not import from `@vueuse/core` in app code.

### CSS
- Token-first: always reach for `--space-*`, `--radius-*`, `--motion-*`, `--z-*`, `--chart-*`, `--font-mono` before hardcoding values
- Colors live in `_colors.css` — `--color-status-*` for instance states, `--color-positive/negative` for trends, `--color-scrim` for overlays
- Color mode handled by `@nuxtjs/color-mode` (with `dataValue: 'color-mode'`). Dark mode is the "home" aesthetic (Oxide-adjacent dark teal-black)
- All component styles in `<style scoped>`, no Tailwind, no CSS-in-JS
- Use `var(--font-mono)` for all technical values: IPs, IDs, percentages, sizes, timestamps

**Motion system** — use `--motion-*` semantic tokens (defined in `_animations.css`) instead of raw `--duration-*` / `--easing-*` values:
- `--motion-interactive` — buttons, hover controls
- `--motion-panel-in` / `--motion-panel-out` — drawer, sidebar, palette (asymmetric in/out)
- `--motion-tooltip` — tooltip, palette overlay
- `--motion-entrance` — card/section entrance animations
- `--motion-mount-leave` / `--motion-mount-enter` — MountSwap crossfade

**Vue transitions** — all `<Transition name="*">` CSS lives in `_transitions.css` (imported globally via `main.css`). Do not put transition CSS in component `<style scoped>` blocks. One entry per named transition; name must stay in sync with the `name` prop in the template.

**Z-index layers** — use `--z-*` tokens (defined in `_tokens.css`), never raw numbers:
| Token | Value | Who |
|-------|-------|-----|
| `--z-chrome` | 10 | mobile header, scroll fade gradients |
| `--z-sidebar-scrim` | 100 | mobile sidebar scrim |
| `--z-sidebar` | 200 | mobile sidebar panel |
| `--z-scrim` | 300 | drawer/palette scrim (dims sidebar too) |
| `--z-panel` | 400 | drawer, command palette |
| `--z-tooltip` | 500 | tooltip (above panels) |
| `--z-toast` | 600 | toast — always on top |

**Scrim** — use `<BaseScrim :open="..." @close="...">` for all overlay scrims. Accepts `blur` prop (for palette) and `z` prop (string CSS value, e.g. `"var(--z-sidebar-scrim)"`) — defaults to `var(--z-scrim)` if omitted.

### D3 Charts
- Use the single npm package `d3` with `import * as d3 from 'd3'` in chart components (no separate `d3-*` deps)
- D3 is used for math (scales, shapes, layouts, axes) — Vue handles rendering via SVG templates
- Axis DOM operations go in `onMounted` + `watch` (client-only). `ChartLine.vue` batches axis + brush DOM work via stable **data fingerprints** + `requestAnimationFrame` so live ticks do not re-run D3 work on every new scale object identity
- All chart components are wrapped in `<MountSwap>` inside their `Section*` composite components (`DashboardSectionCharts`, `StorageSectionCharts`) — see Skeleton / mount swap below
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
`Ctrl+K` / `⌘K` opens the palette. `?` opens shortcuts view. `App/Sidebar.vue` has a search hint button. `App/CommandPalette.vue` (`<AppCommandPalette>`) is mounted inside `index.vue` and emits: `select-instance`, `set-period`, `toggle-view`, `toggle-live`.

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

### Tooltip system
`App/Tooltip.vue` (`<AppTooltip>`) is the single global tooltip renderer; mount it once in `app.vue`. All charts and UI route through it via `useTooltip`. It owns the `<Teleport>`, fade `<Transition>`, positioning, and flip logic (shows below the trigger when in the top quarter of the viewport).

**`TooltipContent` type**: `string | { is: Component; props?: Record<string, unknown> }` — pass a component reference for rich tooltips, a string for plain text.

Two ways to trigger:
- **Declarative**: `<TooltipTrigger :content="..." :delay="400">` wraps any element
- **Programmatic**: `v-bind="useTooltipTrigger(content, delay)"` spreads `onMouseenter`/`onMouseleave` directly onto an element (used in `RackTopology` for chip buttons)

**Tooltip primitives** live in `Tt/` and are Nuxt auto-imported. Use these to compose `*TooltipContent.vue` components — do not write bespoke tooltip styles or raw `tt-*` class markup.

| Component | Class | Notes |
|-----------|-------|-------|
| `<TtRow>` | `tt-row` | Flex row, `gap: --space-2`. Add `tight` prop (`tt-row-tight`) for `--space-1` (text + sep rows) |
| `<TtDot color>` | `tt-dot` | Colored circle; requires `color` prop |
| `<TtValue>` | `tt-value` | Mono semibold value |
| `<TtMuted>` | `tt-muted` | Mono muted text — dates, labels, secondary info |
| `<TtSep>` | `tt-sep` | Muted `·` separator |
| `<TtTitle>` | `tt-title` | Mono semibold header with border-bottom |
| `<TtKvRow>` | `tt-kv-row` | Key-value row: space-between, mono xs font set at row level |
| `<TtKvLabel>` | `tt-kv-label` | Muted key label (inherits font from `TtKvRow`) |
| `<TtKvVal>` | `tt-kv-val` | Value (inherits font from `TtKvRow`) |

**Two layout families:**
- **Chart** (`TtRow`, `TtDot`, `TtValue`, `TtMuted`, `TtSep`) — inline data series display
- **Key-value** (`TtTitle`, `TtKvRow`, `TtKvLabel`, `TtKvVal`) — structured property lists (e.g. `Instance/TooltipContent`)

Per-chart tooltip markup lives in `Chart/{Line,Bar,Heatmap,Donut}TooltipContent.vue`. Non-chart tooltips follow the same pattern: e.g. `Instance/TooltipContent.vue` (used by rack topology chips). Create a new `*TooltipContent.vue` alongside any new chart or UI surface rather than inlining HTML in the component.

### Instance detail drawer
`App/Drawer.vue` (`<AppDrawer>`) is the single drawer shell; it renders `<InstanceDrawerContent>` or `<StorageDrawerContent>` based on `useAppDrawer` state. Opened by clicking a table row, clicking an instance chip in rack view, or selecting from the command palette.

### Rack topology view
`Instance/RackTopology.vue` (`<InstanceRackTopology>`) reads `instances` + `sledUsage` from `analytics.ts`. Instances are grouped once into a module-level `Map<string, Instance[]>` (by `sledId`) so sled rows do not filter the full list per sled. Toggle between `instancesView = 'table' | 'rack'` in `index.vue` header controls. Keyboard shortcut `R`.

### Live mode
`toggleLive()` from `useDashboard` starts/stops a `setInterval` that appends to `liveSamples`. All charts and KPIs update reactively. Keyboard shortcut `L`.

### Skeleton / mount swap
`<MountSwap>` (`MountSwap.vue`) is the standard wrapper for any chart or content that needs a skeleton placeholder before the client is ready. It calls `useIsMounted()` internally and crossfades between the `#skeleton` slot and the default slot using a `<Transition mode="out-in">` (120ms leave, 200ms enter).

```vue
<MountSwap>
  <template #skeleton>
    <BaseSkeleton height="240px" />
  </template>
  <ChartLine ... />
</MountSwap>
```

**Two patterns — when to use each:**
- **`<MountSwap>`** — for any chart or content block that needs a skeleton. Handles `useIsMounted` internally; do not prop-drill `isMounted` to section components.
- **`ClientOnly` + `#fallback`** — only for content that requires guards against hydration mismatches (e.g. the instances view toggle), not for chart skeletons.

`CardKpi` uses `<MountSwap>` internally with its own inline skeleton markup to get the crossfade between skeleton and content — the animated swap is what justifies using `MountSwap` over `ClientOnly` + `#fallback` there.

### KPI cards and live metrics
`<CardKpi>` (`Card/Kpi.vue`) receives `:live="isLive"` from `index.vue`. When live is on, `useAnimatedCounter` **snaps** the displayed value (no RAF easing) so rapid ticks do not spin four animation loops. Sparklines still update from the `kpis` computed data.

### Entrance animations and stagger
`.card-enter` (defined in `_animations.css`) is the single entrance animation — opacity + translateY slide-up over 400ms. Apply it at the **page or section level**, never inside base primitives (`BaseCard`, `BaseTableWrap` are animation-agnostic).

Use `useStagger(baseIndex)` to produce `v-bind`-ready attrs for staggered sequences. `baseIndex` is the section's starting position in the page's overall stagger sequence; `i` is the item's position within the section:

```ts
const stagger = useStagger(props.baseIndex)
// in template:
<CardKpi v-for="(kpi, i)" v-bind="stagger(i)" />
<CardChart v-bind="stagger(0)" />
```

`baseIndex` is required on all section components — the page always declares the full sequence explicitly (dashboard: KPIs 0, charts 4; storage: KPIs 0, charts 4, volumes 6).

### D3 brush (ChartLine)
Pass `:full-data` and `:full-data2` to `<ChartLine>` to enable the context minimap. Brush emits `update:brush-range` with `[Date, Date] | null`. `index.vue` displays the zoomed range in the `<ChartCard>` description.

### Instance table sort
Click a column header → `emit('sort', key)` → `useDashboard.toggleSort(key)` → reactive `filteredInstances` re-sorts.

### Component naming (Nuxt auto-import)
Subdirectory names are prepended to the component name: `Chart/Bar.vue` → `<ChartBar>`. Follow this convention when adding new components.

| Directory | Convention | Example |
|-----------|------------|---------|
| `App/` | App chrome | `App/Sidebar.vue` → `<AppSidebar>` |
| `base/` | Base primitives | `base/Button.vue` → `<BaseButton>`, `base/Scrim.vue` → `<BaseScrim>` |
| `Card/` | Card variants | `Card/Chart.vue` → `<CardChart>` |
| `Chart/` | Chart primitives | `Chart/Bar.vue` → `<ChartBar>` |
| `Dashboard/` | Dashboard composites | `Dashboard/Header.vue` → `<DashboardHeader>` |
| `Instance/` | Instance UI | `Instance/Table.vue` → `<InstanceTable>` |
| `Sidebar/` | Sidebar UI | `Sidebar/ModePicker.vue` → `<SidebarModePicker>` |
| `Storage/` | Storage UI | `Storage/Table.vue` → `<StorageTable>` |
| `Tt/` | Tooltip primitives | `Tt/Row.vue` → `<TtRow>` |
| root | Shared utilities | `StatusBadge.vue` → `<StatusBadge>` |

### Adding a new chart
1. Create a component in `app/components/Chart/` following existing chart patterns
2. Wire data through `useDashboard.ts`
3. Add inside `<CardChart>` + `<MountSwap>` in the relevant `Section*` composite component (`DashboardSectionCharts`, `StorageSectionCharts`, etc.)

### Instance states
Use `<StatusBadge :status="inst.state" />` anywhere you need to display instance health. States: `running` (pulsing green dot), `starting` (pulsing amber dot), `stopped` (static gray dot), `faulted` (static red dot).

## Boundaries
- This app is standalone — no shared code or styles from other repos
- No Tailwind
