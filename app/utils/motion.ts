export type EasingFn = (t: number) => number

function bezierCoord(t: number, p1: number, p2: number): number {
  return 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFn {
  return (t: number): number => {
    if (t === 0 || t === 1) return t
    let lo = 0, hi = 1, mid = t
    for (let i = 0; i < 8; i++) {
      const x = bezierCoord(mid, x1, x2)
      if (Math.abs(x - t) < 1e-5) break
      if (x < t) lo = mid
      else hi = mid
      mid = (lo + hi) / 2
    }
    return bezierCoord(mid, y1, y2)
  }
}

const KEYWORD_EASINGS: Record<string, EasingFn> = {
  linear:        t => t,
  ease:          cubicBezier(0.25, 0.1, 0.25, 1.0),
  'ease-in':     cubicBezier(0.42, 0, 1.0, 1.0),
  'ease-out':    cubicBezier(0, 0, 0.58, 1.0),
  'ease-in-out': cubicBezier(0.42, 0, 0.58, 1.0),
}

function parseEasing(str: string): EasingFn {
  if (str in KEYWORD_EASINGS) return KEYWORD_EASINGS[str]!
  const m = str.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.-]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/)
  if (m) return cubicBezier(+m[1]!, +m[2]!, +m[3]!, +m[4]!)
  return KEYWORD_EASINGS['ease-in-out']!
}

/**
 * Read a --motion-* CSS custom property and return its duration in milliseconds.
 */
export function getMotionMs(token: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token)
  return parseFloat(raw) || 0
}

/**
 * Read a --motion-* CSS custom property and return both duration (ms) and a
 * callable JS easing function. Supports CSS keyword easings and cubic-bezier().
 */
export function getMotion(token: string): { duration: number; easing: EasingFn } {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  const duration = parseFloat(raw) || 0
  const easingStr = raw.replace(/^[\d.]+ms?\s*/, '').trim()
  return { duration, easing: parseEasing(easingStr) }
}
