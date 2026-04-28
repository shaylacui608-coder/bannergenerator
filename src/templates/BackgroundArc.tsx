import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors } from './fonts'

const W = 375
const H = 812

// ZONE_YAOFENG constants (from placement-spec.ts)
// Top edge at y ≈ 30% = 244px, bottom cloud tips at y ≈ 46% = 374px.
// The frame-titled overlay starts at y=374 (right after the cloud tips),
// so the entire yaofeng shape is visible in the gradient zone.
const YAOFENG_Y      = 244   // top edge (px)
const YAOFENG_W      = 356   // width ≈ 95% of canvas
const YAOFENG_H      = 130   // height including cloud bumps
const YAOFENG_CLOUDS = 5     // number of cloud bumps at bottom

// ── SVG fallback 腰封 (rendered when slots.yaofeng is not provided) ────────────
// Matches the golden-cloud-border shape from the branding guide.
function YaofengFallback() {
  const w = YAOFENG_W
  const h = YAOFENG_H
  const r = 18          // corner radius (top corners)
  const bumpR = 28      // cloud bump circle radius
  const bumpCount = YAOFENG_CLOUDS

  // Build bottom cloud-bump path
  // Bumps are evenly distributed across the bottom edge
  const bodyH = h - bumpR         // rectangular body height
  const bumpSpacing = w / bumpCount
  let bottomPath = `L ${w} ${bodyH} `
  for (let i = bumpCount - 1; i >= 0; i--) {
    const cx = bumpSpacing * i + bumpSpacing / 2
    bottomPath += `Q ${cx + bumpR} ${bodyH} ${cx + bumpR} ${bodyH + bumpR} `
    bottomPath += `Q ${cx + bumpR} ${bodyH + bumpR * 2} ${cx} ${bodyH + bumpR * 2} `
    bottomPath += `Q ${cx - bumpR} ${bodyH + bumpR * 2} ${cx - bumpR} ${bodyH + bumpR} `
    bottomPath += `Q ${cx - bumpR} ${bodyH} ${cx - bumpR} ${bodyH} `
  }
  bottomPath += `L 0 ${bodyH} `

  const d = `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} ${bottomPath} L 0 ${r} Q 0 0 ${r} 0 Z`

  return (
    <svg
      style={{
        position: 'absolute',
        left: (W - w) / 2,
        top: YAOFENG_Y,
        zIndex: 2,
        pointerEvents: 'none',
        overflow: 'visible',
        filter: 'drop-shadow(0 4px 16px rgba(160,80,0,0.22))',
      }}
      width={w}
      height={h + 4}
      viewBox={`0 0 ${w} ${h + 4}`}
    >
      <defs>
        <linearGradient id="yaofengGold" x1="0" y1="0" x2={w} y2={h} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#C9864A" />
          <stop offset="30%"  stopColor="#F5D08A" />
          <stop offset="65%"  stopColor="#E8B860" />
          <stop offset="100%" stopColor="#C07840" />
        </linearGradient>
      </defs>
      {/* White fill */}
      <path d={d} fill="rgba(255,252,245,0.92)" />
      {/* Gold border stroke */}
      <path d={d} fill="none" stroke="url(#yaofengGold)" strokeWidth="2.5" />
    </svg>
  )
}

// ── ✦ Sparkles ────────────────────────────────────────────────────────────────
// Scattered in the gradient area above the 腰封 (y < 252px)
// ZONE_SPARKLE: left cluster x 5-22%, right cluster x 72-90%, y 8-26%
const SPARKLES = [
  { x: 16,  y: 46,  s: 7,  o: 0.55 },
  { x: 48,  y: 78,  s: 5,  o: 0.40 },
  { x: 285, y: 52,  s: 8,  o: 0.55 },
  { x: 332, y: 90,  s: 5,  o: 0.35 },
  { x: 158, y: 28,  s: 5,  o: 0.35 },
  { x: 72,  y: 165, s: 5,  o: 0.30 },
  { x: 308, y: 172, s: 6,  o: 0.38 },
]

function Sparkle({ x, y, s, o }: { x: number; y: number; s: number; o: number }) {
  const p = `M${s} 0 L${s + s * 0.15} ${s - s * 0.15} L${s * 2} ${s} L${s + s * 0.15} ${s + s * 0.15} L${s} ${s * 2} L${s - s * 0.15} ${s + s * 0.15} L0 ${s} L${s - s * 0.15} ${s - s * 0.15} Z`
  return (
    <svg style={{ position: 'absolute', left: x, top: y, opacity: o, pointerEvents: 'none', overflow: 'visible' }} width={s * 2} height={s * 2} viewBox={`0 0 ${s * 2} ${s * 2}`}>
      <path d={p} fill="rgba(255,255,255,0.9)" />
    </svg>
  )
}

// ── Template ──────────────────────────────────────────────────────────────────
export function BackgroundArc({ colors: defaultColors, content, slots, sampledDecor, forExport }: TemplateProps) {
  const colors = mergeColors(defaultColors, content.customColors)
  const [from, to] = colors.gradients[content.gradientIndex] ?? colors.gradients[0]

  return (
    <div style={{
      width: W, height: H,
      position: 'relative', overflow: forExport ? 'hidden' : 'visible', borderRadius: 20, flexShrink: 0,
      // GRADIENT_SPEC: 170deg, 4-stop warm shift (placement-spec.ts)
      background: `linear-gradient(170deg, ${from} 0%, color-mix(in srgb,${from} 60%,${to} 40%) 40%, ${to} 72%, #FF8C3A 100%)`,
    }}>

      {/* B3 background pattern — z=0, 5% opacity */}
      {slots.bgPattern && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '90px auto', opacity: 0.05, zIndex: 0 }} />
      )}

      {/* ZONE_SPARKLE — ✦ stars in upper gradient area */}
      {SPARKLES.map((sp, i) => <Sparkle key={i} {...sp} />)}

      {/* ZONE_HERO — main subject, centred top, z=5 */}
      {slots.arcGroup && (
        <img
          src={slots.arcGroup}
          alt=""
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            height: 295,
            width: 'auto',
            zIndex: 5,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 10px 28px rgba(180,40,0,0.35))',
          }}
        />
      )}

      {/* ZONE_DECOR_TL / TR / ARC_L / ARC_R — auxiliary elements, z=2-3 */}
      <DecorLayer elements={sampledDecor} width={W} height={H} />

      {/* ZONE_YAOFENG — decorative sash, z=2, fixed position y=252px */}
      {slots.yaofeng
        ? (
          <img
            src={slots.yaofeng}
            alt=""
            style={{
              position: 'absolute',
              top: YAOFENG_Y,
              left: (W - YAOFENG_W) / 2,
              width: YAOFENG_W,
              height: 'auto',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        )
        : <YaofengFallback />
      }

    </div>
  )
}
