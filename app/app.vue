<script setup lang="ts">
import { PortfolioNav } from '@immx2/portfolio-nav'

// Mirror color-mode preference to html[data-color-pref] for _global.css nav pill styles.
const colorMode = useColorMode()

watch(
  () => colorMode.preference,
  (pref) => {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-color-pref', String(pref))
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <PortfolioNav current="showcase-02" />
    <div class="page-slot">
      <NuxtPage />
    </div>
    <AppToast />
  </div>
</template>

<style>
.app-shell {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-slot {
  flex: 1;
  min-height: 0;
}
</style>
