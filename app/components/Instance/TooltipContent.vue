<script setup lang="ts">
import type { Instance } from '~/data/analytics'

defineProps<{
  instance: Instance
}>()
</script>

<template>
  <div>
    <div class="tt-name">{{ instance.name }}</div>
    <div class="tt-row">
      <span class="tt-label">State</span>
      <StatusBadge :status="instance.state" />
    </div>
    <div class="tt-row">
      <span class="tt-label">Project</span>
      <span class="tt-val">{{ instance.project }}</span>
    </div>
    <div class="tt-row">
      <span class="tt-label">CPU</span>
      <span class="tt-val">{{ instance.cpuPct }}%</span>
    </div>
    <div class="tt-row">
      <span class="tt-label">Mem</span>
      <span class="tt-val">{{ instance.memPct }}%</span>
    </div>
    <div class="tt-row">
      <span class="tt-label">IPv4</span>
      <span class="tt-val">{{ instance.ipv4 }}</span>
    </div>
  </div>
</template>

<style scoped>
.tt-name {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border-subtle);
}

.tt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: 2px 0;
}

.tt-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.tt-val {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text);
}
</style>
