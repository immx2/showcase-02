<script setup lang="ts">
import type { Project } from '~/composables/useDashboard'
import type { Instance } from '~/data/analytics'

const {
  selectedProject,
  sortKey,
  sortDir,
  filteredInstances,
  toggleSort,
} = useDashboard()

useHead({ title: 'Instances · SaaS Cloud Console' })

const instancesView = ref<'table' | 'rack'>('table')
const selectedInstance = ref<Instance | null>(null)

useEventListener('keydown', (e: KeyboardEvent) => {
  const focused = document.activeElement
  const inInput = focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || (focused as HTMLElement).isContentEditable)
  if (inInput) return

  if (e.key === 'r' || e.key === 'R') {
    instancesView.value = instancesView.value === 'table' ? 'rack' : 'table'
  }
})

const projects: { value: Project; label: string }[] = [
  { value: 'all',   label: 'All projects' },
  { value: 'infra', label: 'infra' },
  { value: 'web',   label: 'web' },
  { value: 'data',  label: 'data' },
]
</script>

<template>
  <div class="page">
    <div class="instances-content">
      <div class="instances-header">
        <h1 class="page-title">Instances</h1>
        <div class="instances-controls">
          <div
            v-show="instancesView === 'table'"
            class="project-filter"
            role="group"
            aria-label="Filter by project"
          >
            <button
              v-for="p in projects"
              :key="p.value"
              :class="{ active: selectedProject === p.value }"
              @click="selectedProject = p.value"
            >
              {{ p.label }}
            </button>
          </div>

          <div class="view-toggle" role="group" aria-label="View mode">
            <button
              :class="{ active: instancesView === 'table' }"
              :aria-pressed="instancesView === 'table'"
              title="Table view (R)"
              @click="instancesView = 'table'"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="10" height="2" rx="0.5" fill="currentColor"/>
                <rect x="1" y="5" width="10" height="2" rx="0.5" fill="currentColor"/>
                <rect x="1" y="8" width="10" height="2" rx="0.5" fill="currentColor"/>
              </svg>
              Table
            </button>
            <button
              :class="{ active: instancesView === 'rack' }"
              :aria-pressed="instancesView === 'rack'"
              title="Rack view (R)"
              @click="instancesView = 'rack'"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="10" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
                <rect x="1" y="7" width="10" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/>
                <rect x="2.5" y="2.5" width="2" height="1" rx="0.3" fill="currentColor"/>
                <rect x="2.5" y="8.5" width="2" height="1" rx="0.3" fill="currentColor"/>
              </svg>
              Rack
            </button>
          </div>
        </div>
      </div>

      <Transition name="view-fade" mode="out-in">
        <div v-if="instancesView === 'table'" key="table">
          <ClientOnly>
            <InstanceTable
              :instances="filteredInstances"
              :sort-key="sortKey"
              :sort-dir="sortDir"
              @sort="toggleSort"
              @select="selectedInstance = $event"
            />
            <template #fallback>
              <SkeletonLoader height="320px" />
            </template>
          </ClientOnly>
        </div>

        <div v-else key="rack">
          <ClientOnly>
            <InstanceRackTopology @select-instance="selectedInstance = $event" />
            <template #fallback>
              <SkeletonLoader height="400px" />
            </template>
          </ClientOnly>
        </div>
      </Transition>
    </div>

    <AppCommandPalette
      @select-instance="selectedInstance = $event"
      @toggle-view="instancesView = instancesView === 'table' ? 'rack' : 'table'"
    />

    <InstanceDrawer
      :instance="selectedInstance"
      @close="selectedInstance = null"
    />
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.instances-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  container-type: inline-size;
}

.instances-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}


.instances-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-left: auto;
}

@media (width <= 480px) {
  .instances-controls {
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: var(--space-2);
  }
}

.project-filter,
.view-toggle {
  display: flex;
  align-items: center;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  overflow: hidden;
}

.project-filter button,
.view-toggle button {
  height: 100%;
  padding: 0 var(--space-3);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
  white-space: nowrap;
}

.view-toggle button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.project-filter button + button,
.view-toggle button + button {
  border-left: 1px solid var(--color-border);
}

.project-filter button.active,
.view-toggle button.active {
  background: var(--color-active-bg);
  color: var(--color-active-text);
}

.project-filter button:not(.active):hover,
.view-toggle button:not(.active):hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}

@container (width <= 560px) {
  .instances-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .instances-controls {
    width: 100%;
    justify-content: flex-end;
  }
}

/* Padding on the container itself can't use @container — viewport query only */
@media (width <= 768px) {
  .instances-content {
    padding: var(--space-4);
  }
}
</style>
