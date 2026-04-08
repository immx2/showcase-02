<script setup lang="ts">
import { instances, type Instance } from '~/data/analytics'

const { isOpen, close } = useCommandPalette()
const { period, toggleLive } = useDashboard()
const { openInstance } = useAppDrawer()
const { toggle: toggleView } = useInstancesView()
const colorMode = useColorMode()

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement>()

// Auto-focus + reset on open
watch(isOpen, async (v) => {
  if (v) {
    query.value = ''
    activeIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

// Global keyboard listeners
useEventListener('keydown', (e: KeyboardEvent) => {
  const focused = document.activeElement
  const inInput = focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || (focused as HTMLElement).isContentEditable)

  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    useCommandPalette().toggle()
    return
  }

  if (!isOpen.value && !inInput && e.key === '?') {
    e.preventDefault()
    useCommandPalette().open()
    nextTick(() => { query.value = '?' })
    return
  }

  if (isOpen.value && e.key === 'Escape') {
    close()
    return
  }
})

const showShortcuts = computed(() => query.value.trim() === '?')

const SHORTCUTS = [
  { keys: ['Ctrl+K'], desc: 'Open command palette' },
  { keys: ['?'], desc: 'Show keyboard shortcuts' },
  { keys: ['Esc'], desc: 'Close palette / drawer' },
  { keys: ['L'], desc: 'Toggle live mode' },
  { keys: ['R'], desc: 'Toggle rack / table view' },
  { keys: ['←', '→'], desc: 'Change time period' },
  { keys: ['↑', '↓'], desc: 'Navigate results' },
  { keys: ['Enter'], desc: 'Select result' },
]

interface ActionItem {
  id: string
  label: string
  hint?: string
  category: string
  action: () => void
}

const ALL_ACTIONS = computed<ActionItem[]>(() => [
  { id: 'period-7d',  label: 'Set period: 7 days',       hint: '7d',  category: 'Period',     action: () => { period.value = '7d';  close() } },
  { id: 'period-30d', label: 'Set period: 30 days',      hint: '30d', category: 'Period',     action: () => { period.value = '30d'; close() } },
  { id: 'period-90d', label: 'Set period: 90 days',      hint: '90d', category: 'Period',     action: () => { period.value = '90d'; close() } },
  { id: 'view-rack',  label: 'Toggle rack / table view', hint: 'R',   category: 'Navigation', action: () => { toggleView();          close() } },
  { id: 'live',       label: 'Toggle live mode',         hint: 'L',   category: 'Navigation', action: () => { toggleLive();          close() } },
  { id: 'mode-light', label: 'Color mode: Light',                     category: 'Appearance', action: () => { colorMode.preference = 'light';  close() } },
  { id: 'mode-dark',  label: 'Color mode: Dark',                      category: 'Appearance', action: () => { colorMode.preference = 'dark';   close() } },
  { id: 'mode-auto',  label: 'Color mode: Auto',                      category: 'Appearance', action: () => { colorMode.preference = 'system'; close() } },
])

const q = computed(() => query.value.toLowerCase().trim())

const filteredInstances = computed(() => {
  if (!q.value || q.value === '?') return []
  return instances.filter(i =>
    i.name.toLowerCase().includes(q.value) ||
    i.ipv4.includes(q.value) ||
    i.project.includes(q.value) ||
    i.state.includes(q.value),
  ).slice(0, 7)
})

const filteredActions = computed(() => {
  if (q.value === '?') return []
  if (!q.value) return ALL_ACTIONS.value
  return ALL_ACTIONS.value.filter(a => a.label.toLowerCase().includes(q.value))
})

// Flat list for keyboard navigation
interface FlatResult {
  type: 'instance' | 'action'
  inst?: Instance
  action?: ActionItem
}

const flatResults = computed<FlatResult[]>(() => [
  ...filteredInstances.value.map(inst => ({ type: 'instance' as const, inst })),
  ...filteredActions.value.map(action => ({ type: 'action' as const, action })),
])

function onKeydown(e: KeyboardEvent) {
  const total = flatResults.value.length
  if (!total) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % total
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + total) % total
  } else if (e.key === 'Enter') {
    e.preventDefault()
    selectByIndex(activeIndex.value)
  }
}

watch(q, () => { activeIndex.value = 0 })

function selectByIndex(idx: number) {
  const r = flatResults.value[idx]
  if (!r) return
  if (r.type === 'instance' && r.inst) {
    openInstance(r.inst)
    close()
  } else if (r.type === 'action' && r.action) {
    r.action.action()
  }
}

function instanceFlatIdx(localIdx: number): number {
  return localIdx
}

function actionFlatIdx(localIdx: number): number {
  return filteredInstances.value.length + localIdx
}

// Group actions by category when showing all
const actionGroups = computed(() => {
  const groups: Record<string, ActionItem[]> = {}
  for (const a of filteredActions.value) {
    ;(groups[a.category] ??= []).push(a)
  }
  return groups
})

const stateColors: Record<string, string> = {
  running:  'var(--color-status-running)',
  starting: 'var(--color-status-starting)',
  stopped:  'var(--color-text-muted)',
  faulted:  'var(--color-status-faulted)',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="isOpen" class="palette-backdrop" @mousedown.self="close">
        <div
          class="palette-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <!-- Search input -->
          <div class="palette-search">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
              <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="palette-input"
              placeholder="Search instances, actions…  or type ? for shortcuts"
              autocomplete="off"
              spellcheck="false"
              @keydown="onKeydown"
            >
            <kbd class="esc-badge" @click="close">Esc</kbd>
          </div>

          <div class="palette-body">
            <!-- Shortcuts view -->
            <template v-if="showShortcuts">
              <div class="palette-section">
                <div class="section-label">Keyboard shortcuts</div>
                <div class="shortcuts-grid">
                  <div v-for="s in SHORTCUTS" :key="s.desc" class="shortcut-row">
                    <span class="shortcut-desc">{{ s.desc }}</span>
                    <span class="shortcut-keys">
                      <kbd v-for="k in s.keys" :key="k">{{ k }}</kbd>
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Normal results -->
            <template v-else>
              <!-- Instance results -->
              <div v-if="filteredInstances.length" class="palette-section">
                <div class="section-label">Instances</div>
                <button
                  v-for="(inst, i) in filteredInstances"
                  :key="inst.id"
                  :class="['result-row', { active: activeIndex === instanceFlatIdx(i) }]"
                  @mouseenter="activeIndex = instanceFlatIdx(i)"
                  @click="openInstance(inst); close()"
                >
                  <span
                    class="state-dot"
                    :style="{ background: stateColors[inst.state] ?? 'currentColor' }"
                    aria-hidden="true"
                  />
                  <span class="result-name">{{ inst.name }}</span>
                  <span class="result-meta">
                    <span class="result-tag" :class="inst.project">{{ inst.project }}</span>
                    <span class="result-ip">{{ inst.ipv4 }}</span>
                  </span>
                </button>
              </div>

              <!-- Action results, grouped -->
              <template v-for="(actions, category) in actionGroups" :key="category">
                <div v-if="actions.length" class="palette-section">
                  <div class="section-label">{{ category }}</div>
                  <button
                    v-for="action in actions"
                    :key="action.id"
                    :class="['result-row', { active: activeIndex === actionFlatIdx(filteredActions.indexOf(action)) }]"
                    @mouseenter="activeIndex = actionFlatIdx(filteredActions.indexOf(action))"
                    @click="action.action()"
                  >
                    <span class="action-icon" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                    <span class="result-name">{{ action.label }}</span>
                    <kbd v-if="action.hint" class="action-hint">{{ action.hint }}</kbd>
                  </button>
                </div>
              </template>

              <!-- Empty state -->
              <div v-if="q && !filteredInstances.length && !filteredActions.length" class="palette-empty">
                No results for "{{ query }}"
              </div>

              <!-- Shortcuts hint (idle state) -->
              <div v-if="!q" class="palette-footer">
                <span>Type <kbd>?</kbd> to view keyboard shortcuts</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: rgb(0 0 0 / 55%);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.palette-modal {
  width: 100%;
  max-width: 560px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--color-border-subtle);
  overflow: hidden;
}

/* Search row */
.palette-search {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.palette-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text);
  padding: 0;
  min-width: 0;
}

.palette-input::placeholder {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.esc-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  background: var(--color-surface-2);
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
}

/* Body */
.palette-body {
  max-height: 380px;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

/* Sections */
.palette-section {
  padding: var(--space-2) 0;
}

.palette-section + .palette-section {
  border-top: 1px solid var(--color-border-subtle);
}

.section-label {
  padding: var(--space-1) var(--space-4);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

/* Result rows */
.result-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--duration-fast);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.result-row:hover,
.result-row.active {
  background: var(--color-surface-2);
}

.state-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.action-icon {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.result-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.result-tag {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.result-tag.infra { color: var(--chart-1); }
.result-tag.web   { color: var(--chart-2); }
.result-tag.data  { color: var(--chart-3); }

.result-ip {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.action-hint {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  background: var(--color-surface-2);
}

/* Shortcuts grid */
.shortcuts-grid {
  padding: var(--space-2) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.shortcut-row:last-child {
  border-bottom: none;
}

.shortcut-desc {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.shortcut-keys {
  display: flex;
  gap: var(--space-1);
}

.shortcut-keys kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 7px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  color: var(--color-text);
}

/* Footer / empty */
.palette-empty,
.palette-footer {
  padding: var(--space-4) var(--space-4);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  text-align: center;
}

.palette-footer kbd {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
}

/* Transition */
.palette-enter-active,
.palette-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.palette-enter-active .palette-modal,
.palette-leave-active .palette-modal {
  transition: opacity var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette-modal,
.palette-leave-to .palette-modal {
  opacity: 0;
  transform: scale(0.97) translateY(-8px);
}
</style>
