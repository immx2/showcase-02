<script setup lang="ts">
</script>

<template>
  <div class="base-card ui-surface">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>
