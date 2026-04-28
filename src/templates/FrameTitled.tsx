import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts, titleSize } from './fonts'

const W = 359
const H = 329

export function FrameTitled({ colors: defaultColors, content, slots, sampledDecor }: TemplateProps) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)

  const cardBg = colors.warmBg ?? '#FFEDCA'
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'visible', borderRadius: '0 0 16px 16px', background: cardBg, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {slots.bgPattern && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '80px auto', opacity: 0.08, zIndex: 0, borderRadius: '0 0 16px 16px' }} />
      )}

      {/* Title row */}
      <div style={{ position: 'relative', zIndex: 2, paddingTop: 12, paddingBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Mascot badge left of title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {slots.mascot && (
            <img src={slots.mascot} alt="" style={{ height: 36, width: 'auto', marginRight: 2, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))', flexShrink: 0 }} />
          )}
          <div style={{ background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, borderRadius: 10, padding: '7px 22px', position: 'relative', boxShadow: '0 3px 12px rgba(255,44,25,0.35)' }}>
            {/* Corner notch dots */}
            {[[-6,-6],[ 'calc(100% - 5px)',-6],[-6,'calc(100% - 5px)'],['calc(100% - 5px)','calc(100% - 5px)']].map(([l, t], i) => (
              <div key={i} style={{ position: 'absolute', left: l, top: t, width: 10, height: 10, background: cardBg, borderRadius: '50%' }} />
            ))}
            <span style={{ fontSize: titleSize(17, content.titleSizeAdjust), fontWeight: 900, color: '#fff', fontFamily: fonts.title, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
              {content.title}
            </span>
          </div>
        </div>

        {/* Tag pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px' }}>
          {content.tags.map((tag, i) => (
            <div key={i} style={{ background: colors.primary, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12, fontFamily: fonts.ui, letterSpacing: 0.3 }}>
              • {tag} •
            </div>
          ))}
        </div>
      </div>

      {/* Content card */}
      <div style={{ flex: 1, padding: '10px 12px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', height: '100%', boxSizing: 'border-box', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: fonts.ui, marginBottom: 10 }}>任务卡片</div>
          <div style={{ height: 9, background: '#f0f0f0', borderRadius: 5, marginBottom: 7, width: '88%' }} />
          <div style={{ height: 9, background: '#f0f0f0', borderRadius: 5, width: '65%' }} />
        </div>
      </div>

      <DecorLayer elements={sampledDecor} width={W} height={H} />
    </div>
  )
}
