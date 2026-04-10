<script setup lang="ts">
import type { Volume } from '~/data/analytics'

const emit = defineEmits<{
  select: [volume: Volume]
}>()

const props = defineProps<{
  baseIndex: number
}>()

const { selectedProject, sortKey, sortDir, filteredVolumes, toggleSort } = useStorage()
const stagger = useStagger(props.baseIndex)
</script>

<template>
  <section class="volumes-section" v-bind="stagger(0)">
    <BaseSectionHeader title="Volumes" :count="filteredVolumes.length">
      <ProjectFilter v-model="selectedProject" />
    </BaseSectionHeader>
    <StorageTable
      :volumes="filteredVolumes"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      @sort="toggleSort"
      @select="emit('select', $event)"
    />
  </section>
</template>

<style scoped>
.volumes-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

</style>
