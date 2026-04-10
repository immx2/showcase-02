<script setup lang="ts">
defineProps<{
  label: string
  subLabel?: string
  value: string
  color?: string
}>()
</script>

<template>
  <TtRow tight>
    <TtMuted>{{ label }}</TtMuted>
    <template v-if="subLabel">
      <TtSep />
      <TtMuted>{{ subLabel }}</TtMuted>
    </template>
  </TtRow>
  <TtRow>
    <TtDot v-if="color" :color="color" />
    <TtValue>{{ value }}</TtValue>
  </TtRow>
</template>
