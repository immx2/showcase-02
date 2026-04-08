<script setup lang="ts">
import type { TooltipContent } from '~/composables/useTooltip'

const props = defineProps<{
  content: TooltipContent
  delay?: number
}>()

const { onMouseenter, onMouseleave } = useTooltipTrigger(() => props.content, () => props.delay)
</script>

<template>
  <div class="tt-wrap" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
    <slot />
  </div>
</template>

<style scoped>
.tt-wrap {
  display: inline-flex;
}
</style>
