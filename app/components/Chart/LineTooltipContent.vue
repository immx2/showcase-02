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
  <TtMuted>{{ date }}</TtMuted>
  <TtRow>
    <TtDot :color="color" />
    <TtValue>{{ value }}</TtValue>
    <template v-if="value2 && color2">
      <TtSep />
      <TtDot :color="color2" />
      <TtValue>{{ value2 }}</TtValue>
    </template>
  </TtRow>
</template>
