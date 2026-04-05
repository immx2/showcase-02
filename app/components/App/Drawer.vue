<script setup lang="ts">
const { state, close } = useAppDrawer()

const drawerLabel = computed(() => {
  if (!state.value) return ''
  return state.value.type === 'instance'
    ? `Instance details: ${state.value.item.name}`
    : `Volume: ${state.value.item.name}`
})

const headerStatus = computed(() => {
  if (!state.value) return 'stopped' as const
  return state.value.type === 'instance'
    ? state.value.item.state
    : stateToStatus(state.value.item.state)
})
</script>

<template>
  <BaseDrawer :open="!!state" :label="drawerLabel" @close="close()">
    <template v-if="state">
      <BaseDrawerHeader
        :title="state.item.name"
        :status="headerStatus"
        :project="state.item.project"
        @close="close()"
      />
      <InstanceDrawerContent v-if="state.type === 'instance'" :item="state.item" />
      <StorageDrawerContent  v-else-if="state.type === 'volume'" :item="state.item" />
    </template>
  </BaseDrawer>
</template>
