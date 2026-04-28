import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts, titleSize } from './fonts'

const W = 359
const H = 80

export function BannerStandard({ colors: defaultColors, content, slots, sampledDecor, forExport }: TemplateProps) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)

  const [from, to] = colors.gradients[content.gradientIndex] ?? colors.gradients[0]
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', borderRadius: 12, background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', flexShrink: 0 }}>
      {slots.bgPattern && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '60px auto', opacity: 0.07, zIndex: 0 }} />}
      
      {/* 左侧文本区域 - 距离左边12px */}
      <div style={{ position: 'relative', zIndex: 2, minWidth: 0, maxWidth: 'calc(100% - 12px - 64px - 12px - 16px)' }}>
        {/* 大标题 */}
        <div style={{ fontSize: titleSize(20, content.titleSizeAdjust), fontWeight: 900, color: colors.textOnDark, fontFamily: fonts.title, lineHeight: 1.15, letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {content.title}
        </div>
        {/* 一行小字 */}
        <div style={{ fontSize: 12, color: colors.textOnDark, opacity: 0.9, fontFamily: fonts.subtitle, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {content.subtitle}
        </div>
      </div>

      {/* 装饰元素区域 - 整个背景 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <DecorLayer elements={sampledDecor} width={W} height={H} />
      </div>

      {/* 右侧按钮 - 距离右边12px，64*24 */}
      <div style={{ position: 'relative', zIndex: 2, width: 64, height: 24, background: 'rgba(255,255,255,0.25)', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.textOnDark, fontFamily: fonts.ui, textAlign: 'center' }}>
          {content.tags[0] ?? '立即查看'}
        </span>
      </div>
    </div>
  )
}
