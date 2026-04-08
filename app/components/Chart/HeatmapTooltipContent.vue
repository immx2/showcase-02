<script setup lang="ts">
defineProps<{
  label: string
  value: string
  color: string
}>()
</script>

<template>
  <span class="tt-row">
    <span class="tt-label">{{ label }}</span>
  </span>
  <span class="tt-row">
    <span class="tt-dot" :style="{ background: color }" />
    <span class="tt-value">{{ value }}</span>
  </span>
</template>
