import type { Component } from 'vue'

export type TooltipContent = string | { is: Component; props?: Record<string, unknown> }

const state = shallowReactive({
  show: false,
  x: 0,
  y: 0,
  content: '' as TooltipContent,
})

export function useTooltip() {
  function show(content: TooltipContent, x: number, y: number) {
    state.content = content
    state.x = x
    state.y = y
    state.show = true
  }

  function hide() {
    state.show = false
  }

  return { state: readonly(state), show, hide }
}
