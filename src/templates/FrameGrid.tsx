import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts } from './fonts'

const W = 876
const H = 389

export function FrameGrid({ colors: defaultColors, content, slots, sampledDecor, forExport }: TemplateProps) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)

  const [from, to] = colors.gradients[content.gradientIndex] ?? colors.gradients[0]
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', borderRadius: 16, background: colors.primary, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ height: 60, background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`, position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        {slots.bgPattern && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '60px auto', opacity: 0.08 }} />}
        {slots.mascot && <img src={slots.mascot} alt="" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-62%)', height: 80, width: 'auto', zIndex: 3, pointerEvents: 'none', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.2))' }} />}
        <DecorLayer elements={sampledDecor} width={W} height={60} />
      </div>
      <div style={{ flex: 1, padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', fontFamily: fonts.ui, marginBottom: 8 }}>爆品线索卡</div>
            <div style={{ height: 9, background: '#f0f0f0', borderRadius: 4, marginBottom: 6, width: '85%' }} />
            <div style={{ height: 9, background: '#f0f0f0', borderRadius: 4, width: '65%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
