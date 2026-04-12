/**
 * Resolve a CSS custom property to an rgb() string that D3 can parse.
 * Uses a hidden element to resolve the var(), then paints it to a 1×1 canvas
 * to force sRGB serialization — needed because getComputedStyle returns oklch()
 * as-is in modern Chrome, which D3 cannot parse.
 */
export function resolveCssColor(token: string): string {
  const el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.visibility = 'hidden'
  el.style.backgroundColor = `var(${token})`
  document.body.appendChild(el)
  const computed = getComputedStyle(el).backgroundColor
  document.body.removeChild(el)

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = computed
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}
