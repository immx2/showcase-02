<script setup lang="ts">
const isMounted = useIsMounted()
</script>

<template>
  <Transition name="skel-swap" mode="out-in">
    <div v-if="!isMounted" key="skeleton" class="mount-swap-wrap">
      <slot name="skeleton" />
    </div>
    <div v-else key="content" class="mount-swap-wrap">
      <slot />
    </div>
  </Transition>
</template>

<style scoped>
.mount-swap-wrap { width: 100%; }
</style>
