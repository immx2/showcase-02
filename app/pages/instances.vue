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

    <Transition name="view" mode="out-in">
      <div v-if="instancesView === 'table'" key="table" class="card-enter">
        <ClientOnly>
          <InstanceTable
            :instances="filteredInstances"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            @sort="toggleSort"
            @select="openInstance($event)"
          />
          <template #fallback>
            <BaseSkeleton height="320px" />
          </template>
        </ClientOnly>
      </div>

      <div v-else key="rack" class="card-enter">
        <ClientOnly>
          <InstanceRackTopology @select-instance="openInstance($event)" />
          <template #fallback>
            <BaseSkeleton height="400px" />
          </template>
        </ClientOnly>
      </div>
    </Transition>
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
