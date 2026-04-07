<script setup lang="ts">
const props = defineProps<{
  index?: number
  label?: string
}>()

const style = computed(() =>
  props.index !== undefined ? { '--stagger-index': props.index } : undefined
)
</script>

<template>
  <div
    class="table-wrap ui-surface card-enter"
    role="region"
    :aria-label="label"
    :style="style"
  >
    <slot />
  </div>
</template>
