<script setup lang="ts">
defineProps<{ tight?: boolean }>()
</script>

<template>
  <div class="tt-row" :class="{ 'tt-row--tight': tight }"><slot /></div>
</template>
