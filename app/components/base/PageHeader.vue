<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <header class="page-header">
    <div class="page-header-title-group">
      <h1 class="page-title">{{ title }}</h1>
      <slot name="subtitle" />
    </div>
    <div v-if="$slots.default" class="page-header-controls">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.page-header-title-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.page-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.page-header-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-left: auto;
}
</style>
