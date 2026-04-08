<script setup lang="ts">
defineProps<{
  label: string
  value: string
  color?: string
}>()
</script>

<template>
  <span class="tt-muted">{{ label }}</span>
  <div class="tt-row">
    <span v-if="color" class="tt-dot" :style="{ background: color }" />
    <span class="tt-value">{{ value }}</span>
  </div>
</template>
