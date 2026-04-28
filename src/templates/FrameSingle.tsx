import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts } from './fonts'

const W = 351
const H = 329

export function FrameSingle({ colors: defaultColors, content, slots, sampledDecor, forExport = false }: TemplateProps & { forExport?: boolean }) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)

  const [from, to] = colors.gradients[content.gradientIndex] ?? colors.gradients[0]
  
  // 导出版本：干净的全渐变画框！
  if (forExport) {
    return (
      <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', borderRadius: 16, background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* 全渐变背景 */}
        {slots.bgPattern && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '50px auto', opacity: 0.08 }} />}
        <DecorLayer elements={sampledDecor} width={W} height={H} />
      </div>
    )
  }

  // 预览版本：全渐变画框 + Header 文字！
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'visible', borderRadius: 16, background: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* 全渐变背景 */}
      {slots.bgPattern && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '50px auto', opacity: 0.08 }} />}
      
      {/* Header 文字层 */}
      <div style={{ height: 58, position: 'relative', flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <span style={{ position: 'relative', zIndex: 2, fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: fonts.ui }}>
          {content.tags[0] ?? '爆品线索卡'}
        </span>
      </div>
      
      {/* 装饰层 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <DecorLayer elements={sampledDecor} width={W} height={H} />
      </div>

      {/* 内容区域：card-context 图 */}
      <div style={{ flex: 1, padding: 10, paddingTop: 0, position: 'relative', zIndex: 2, top: -12 }}>
        <img
          src="/assets/context/APP_助手页card-context.png"
          alt="商品助手卡片"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}
