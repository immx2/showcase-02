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
  <TtRow tight>
    <TtMuted>{{ label }}</TtMuted>
  </TtRow>
  <TtRow>
    <TtDot :color="color" />
    <TtValue>{{ pct }}%</TtValue>
    <TtSep />
    <TtValue>{{ formatGib(value, 0) }}</TtValue>
  </TtRow>
</template>
