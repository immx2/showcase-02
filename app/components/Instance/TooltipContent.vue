<script setup lang="ts">
import type { Instance } from '~/data/analytics'

defineProps<{
  instance: Instance
}>()
</script>

<template>
  <TtTitle>{{ instance.name }}</TtTitle>
  <TtKvRow>
    <TtKvLabel>State</TtKvLabel>
    <StatusBadge :status="instance.state" />
  </TtKvRow>
  <TtKvRow>
    <TtKvLabel>Project</TtKvLabel>
    <TtKvVal>{{ instance.project }}</TtKvVal>
  </TtKvRow>
  <TtKvRow>
    <TtKvLabel>CPU</TtKvLabel>
    <TtKvVal>{{ instance.cpuPct }}%</TtKvVal>
  </TtKvRow>
  <TtKvRow>
    <TtKvLabel>Mem</TtKvLabel>
    <TtKvVal>{{ instance.memPct }}%</TtKvVal>
  </TtKvRow>
  <TtKvRow>
    <TtKvLabel>IPv4</TtKvLabel>
    <TtKvVal>{{ instance.ipv4 }}</TtKvVal>
  </TtKvRow>
</template>
