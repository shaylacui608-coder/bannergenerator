import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts } from './fonts'

const W = 375
const H = 812

export function BackgroundSimple({ colors: defaultColors, content, slots, sampledDecor, forExport }: TemplateProps) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)

  const [from] = colors.gradients[content.gradientIndex] ?? colors.gradients[0]
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', borderRadius: 20, background: `linear-gradient(180deg, ${from} 0%, ${from} 40%, #ffffff 100%)`, flexShrink: 0 }}>
      {slots.bgPattern && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '100px auto', opacity: 0.07, zIndex: 0 }} />}
      <DecorLayer elements={sampledDecor} width={W} height={H} />
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, padding: '0 24px', zIndex: 2, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.2)', fontFamily: fonts.subtitle }}>页面内容区</div>
      </div>
    </div>
  )
}
