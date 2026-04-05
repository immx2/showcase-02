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

    <Transition name="view-fade" mode="out-in">
      <div v-if="instancesView === 'table'" key="table">
        <ClientOnly>
          <InstanceTable
            :instances="filteredInstances"
            :sort-key="sortKey"
            :sort-dir="sortDir"
            :index="0"
            @sort="toggleSort"
            @select="openInstance($event)"
          />
          <template #fallback>
            <BaseSkeleton height="320px" />
          </template>
        </ClientOnly>
      </div>

      <div v-else key="rack">
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
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}
</style>
