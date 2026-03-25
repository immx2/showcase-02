<script setup lang="ts">
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
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <AppToast />
  </div>
</template>
