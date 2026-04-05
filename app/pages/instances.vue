<script setup lang="ts">
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
</script>

<template>
  <div class="page">
    <BasePageContent>
      <BasePageHeader title="Instances">
        <ProjectFilter v-show="instancesView === 'table'" v-model="selectedProject" />
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
      </BasePageHeader>

      <Transition name="view-fade" mode="out-in">
        <div v-if="instancesView === 'table'" key="table">
          <ClientOnly>
            <InstanceTable
              :instances="filteredInstances"
              :sort-key="sortKey"
              :sort-dir="sortDir"
              :index="0"
              @sort="toggleSort"
              @select="selectedInstance = $event"
            />
            <template #fallback>
              <BaseSkeleton height="320px" />
            </template>
          </ClientOnly>
        </div>

        <div v-else key="rack">
          <ClientOnly>
            <InstanceRackTopology @select-instance="selectedInstance = $event" />
            <template #fallback>
              <BaseSkeleton height="400px" />
            </template>
          </ClientOnly>
        </div>
      </Transition>
    </BasePageContent>

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

.view-toggle {
  display: flex;
  align-items: center;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-toggle button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 100%;
  padding: 0 var(--space-3);
  border: none;
  background-color: var(--color-surface-2);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
  white-space: nowrap;
}

.view-toggle button + button {
  border-left: 1px solid var(--color-border);
}

.view-toggle button.active {
  background: var(--color-surface);
  color: var(--color-active-text);
}

.view-toggle button:not(.active):hover {
  background: var(--color-table-row);
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

</style>
