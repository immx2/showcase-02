<script setup lang="ts">
import type { TooltipContent } from '~/composables/useTooltip'

const props = defineProps<{
  content: TooltipContent
  delay?: number
}>()

const wrapRef = ref<HTMLElement | null>(null)
const { show, hide } = useTooltip()
let showTimer: ReturnType<typeof setTimeout> | null = null

function onEnter() {
  showTimer = setTimeout(() => {
    const rect = wrapRef.value?.getBoundingClientRect()
    if (!rect) return
    show(props.content, rect.left + rect.width / 2, rect.top)
  }, props.delay ?? 400)
}

function onLeave() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null }
  hide()
}
</script>

<template>
  <div ref="wrapRef" class="tt-wrap" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
  </div>
</template>

<style scoped>
.tt-wrap {
  display: inline-flex;
}
</style>
