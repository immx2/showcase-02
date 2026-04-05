<template>
  <div class="page-content">
    <slot />
  </div>
</template>

<style scoped>
.page-content {
  height: 100%;
  overflow-y: auto;
  padding: var(--space-5) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  container-type: inline-size;
}

@media (width <= 768px) {
  .page-content {
    padding: var(--space-4);
  }
}
</style>
