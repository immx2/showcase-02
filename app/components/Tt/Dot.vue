<script setup lang="ts">
defineProps<{ color: string }>()
</script>

<template>
  <span class="tt-dot" :style="{ background: color }" />
</template>
