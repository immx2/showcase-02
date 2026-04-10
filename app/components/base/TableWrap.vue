<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <div
    class="table-wrap ui-surface"
    role="region"
    :aria-label="label"
  >
    <slot />
  </div>
</template>
