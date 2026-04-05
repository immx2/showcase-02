<template>
  <div class="drawer-body">
    <slot />
  </div>
</template>

<style scoped>
.drawer-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
</style>
