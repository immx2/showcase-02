<script setup lang="ts">
const {
  selectedProject,
  sortKey,
  sortDir,
  filteredInstances,
  toggleSort,
} = useDashboard()

const { openInstance } = useAppDrawer()
const { instancesView, toggle: toggleView } = useInstancesView()

useHead({ title: 'Instances · SaaS Cloud Console' })

useEventListener('keydown', (e: KeyboardEvent) => {
  const focused = document.activeElement
  const inInput = focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || (focused as HTMLElement).isContentEditable)
  if (inInput) return

  if (e.key === 'r' || e.key === 'R') toggleView()
})
</script>

<template>
  <BasePageContent>
    <BasePageHeader title="Instances">
      <ProjectFilter v-show="instancesView === 'table'" v-model="selectedProject" />
      <InstanceViewToggle />
    </BasePageHeader>

    <ClientOnly>
      <Transition name="view">
        <div v-if="instancesView === 'table'" key="table" class="card-enter">
          <InstanceTable
            :instances="filteredInstances"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            @sort="toggleSort"
            @select="openInstance($event)"
          />
        </div>

        <div v-else key="rack" class="card-enter">
          <InstanceRackTopology @select-instance="openInstance($event)" />
        </div>
      </Transition>

      <template #fallback>
        <BaseSkeleton height="320px" />
      </template>
    </ClientOnly>
  </BasePageContent>
</template>

<style scoped>
.view-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.view-leave-to {
  opacity: 0;
}
</style>
