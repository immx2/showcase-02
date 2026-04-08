<script setup lang="ts">
defineProps<{
  date: string
  value: string
  color: string
  value2?: string
  color2?: string
}>()
</script>

<template>
  <span class="tt-muted">{{ date }}</span>
  <span class="tt-row">
    <span class="tt-dot" :style="{ background: color }" />
    <span class="tt-value">{{ value }}</span>
    <template v-if="value2 && color2">
      <span class="tt-sep">·</span>
      <span class="tt-dot" :style="{ background: color2 }" />
      <span class="tt-value">{{ value2 }}</span>
    </template>
  </span>
</template>
