import type { DecorElementRule, SampledDecorElement } from '../types'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function seededRandom(seed: number) {
  // Simple LCG — good enough for layout variation
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function sampleLayout(
  rules: DecorElementRule[],
  seed: number = Date.now()
): SampledDecorElement[] {
  const rand = seededRandom(seed)
  return rules.map((rule, i) => {
    const r = () => rand()
    const x = lerp(rule.zone.x[0], rule.zone.x[1], r())
    const y = lerp(rule.zone.y[0], rule.zone.y[1], r())
    const rotation = lerp(rule.rotation[0], rule.rotation[1], r())
    const scale = lerp(rule.scale[0], rule.scale[1], r())
    const flipX = rule.flipX ? r() > 0.5 : false
    return {
      id: rule.id,
      asset: rule.asset,
      x,
      y,
      rotation,
      scale,
      flipX,
      zIndex: rule.zIndex ?? i,
      baseSize: rule.baseSize ?? 80,
      centered: rule.centered !== undefined ? rule.centered : true, // 默认 true
    }
  })
}

export function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff)
}
