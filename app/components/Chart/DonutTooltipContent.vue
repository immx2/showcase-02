<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number
  total: number
  color: string
}>()

const pct = computed(() =>
  props.total > 0 ? ((props.value / props.total) * 100).toFixed(1) : '0',
)
</script>

<template>
  <span class="tt-label">{{ label }} · {{ formatGib(value) }}</span>
  <div class="tt-row">
    <span class="tt-dot" :style="{ background: color }" />
    <span class="tt-value">{{ pct }}%</span>
  </div>
</template>
