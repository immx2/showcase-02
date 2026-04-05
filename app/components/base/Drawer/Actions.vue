<template>
  <div class="drawer-actions">
    <slot />
  </div>
</template>

<style scoped>
.drawer-actions {
  flex-shrink: 0;
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
