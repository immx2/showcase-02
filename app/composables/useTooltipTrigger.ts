import type { TooltipContent } from '~/composables/useTooltip'

export function useTooltipTrigger(
  content: TooltipContent | (() => TooltipContent),
  delay: number | (() => number | undefined) = 400,
) {
  const { show, hide } = useTooltip()
  let timer: ReturnType<typeof setTimeout> | null = null

  function onMouseenter(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement
    const resolvedDelay = typeof delay === 'function' ? (delay() ?? 400) : delay
    timer = setTimeout(() => {
      const rect = target.getBoundingClientRect()
      const resolvedContent = typeof content === 'function' ? content() : content
      show(resolvedContent, rect.left + rect.width / 2, rect.top, rect.bottom)
    }, resolvedDelay)
  }

  function onMouseleave() {
    if (timer) { clearTimeout(timer); timer = null }
    hide()
  }

  return { onMouseenter, onMouseleave }
}
