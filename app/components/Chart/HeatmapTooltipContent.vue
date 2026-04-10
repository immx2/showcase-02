<script setup lang="ts">
defineProps<{
  day: string
  time: string
  value: string
  color: string
}>()
</script>

<template>
  <TtRow tight>
    <TtMuted>{{ day }}</TtMuted>
    <TtSep />
    <TtMuted>{{ time }}</TtMuted>
  </TtRow>
  <TtRow>
    <TtDot :color="color" />
    <TtValue>{{ value }}</TtValue>
  </TtRow>
</template>
