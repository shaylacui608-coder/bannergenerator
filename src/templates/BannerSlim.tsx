import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts, titleSize } from './fonts'

const W = 1104
const H = 72

export function BannerSlim({ colors: defaultColors, content, slots, sampledDecor, forExport }: TemplateProps) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)

  const [from, to] = colors.gradients[content.gradientIndex] ?? colors.gradients[0]

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', borderRadius: 8, background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {slots.bgPattern && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '60px auto', opacity: 0.07, zIndex: 0 }} />
      )}

      <div style={{ position: 'relative', zIndex: 2, padding: '0 18px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: colors.textOnDark, opacity: 0.9, fontFamily: fonts.brand, letterSpacing: 0.3 }}>
            {content.eventName}
          </span>
          <span style={{ background: colors.yellow, color: '#C8400A', fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 3, fontFamily: fonts.brand }}>
            新春
          </span>
        </div>
        <div style={{ fontSize: titleSize(20, content.titleSizeAdjust), fontWeight: 900, color: colors.yellow, fontFamily: fonts.title, letterSpacing: 1, lineHeight: 1.15, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
          {content.title}
        </div>
      </div>

      {slots.bannerHero && (
        <img src={slots.bannerHero} alt="" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: H + 8, width: 'auto', zIndex: 2, pointerEvents: 'none' }} />
      )}

      <DecorLayer elements={sampledDecor} width={W} height={H} />
    </div>
  )
}
