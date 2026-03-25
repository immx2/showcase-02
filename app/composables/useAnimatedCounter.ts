export function useAnimatedCounter(
  target: Ref<number>,
  duration = 600,
  /** When true, skip easing and snap to the target (e.g. live metric ticks). */
  snap?: Ref<boolean>,
) {
  const display = ref(target.value)
  let rafId: number | null = null

  function cancelRaf() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function animate(from: number, to: number) {
    cancelRaf()
    const diff = to - from
    if (Math.abs(diff) < 0.01) {
      display.value = to
      return
    }

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      display.value = from + diff * eased

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        rafId = null
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  watch(target, (newVal, oldVal) => {
    if (snap?.value) {
      cancelRaf()
      display.value = newVal
      return
    }
    animate(oldVal ?? 0, newVal)
  })

  onMounted(() => {
    animate(0, target.value)
  })

  onUnmounted(() => {
    cancelRaf()
  })

  return display
}
