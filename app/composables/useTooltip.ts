import { markRaw } from 'vue'
import type { Component } from 'vue'

export type TooltipContent = string | { is: Component; props?: Record<string, unknown> }

const state = shallowReactive({
  show: false,
  x: 0,
  yTop: 0,
  yBottom: 0,
  content: '' as TooltipContent,
})

export function useTooltip() {
  function show(content: TooltipContent, x: number, yTop: number, yBottom: number = yTop) {
    state.content = typeof content === 'string' ? content : { ...content, is: markRaw(content.is) }
    state.x = x
    state.yTop = yTop
    state.yBottom = yBottom
    state.show = true
  }

  function hide() {
    state.show = false
  }

  return { state: readonly(state), show, hide }
}
