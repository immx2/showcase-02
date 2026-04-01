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
    <div class="console-shell">
      <AppSidebar />
      <div class="page-slot">
        <NuxtPage />
      </div>
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

.console-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.page-slot {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.page-slot::before,
.page-slot::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 24px;
  pointer-events: none;
  z-index: 10;
}

.page-slot::after {
  top: 0;
  background: linear-gradient(to bottom, var(--color-bg), transparent);
}

.page-slot::before {
  bottom: 0;
  background: linear-gradient(to top, var(--color-bg), transparent);
}
</style>
