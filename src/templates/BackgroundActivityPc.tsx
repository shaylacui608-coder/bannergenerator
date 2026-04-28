import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors } from './fonts'

const W = 480
const H = 900

export function BackgroundActivityPc({ colors: defaultColors, content, sampledDecor, onSelect, isSelected, forExport }: TemplateProps & { onSelect?: (key: string) => void; isSelected?: string | null; forExport?: boolean }) {
  const colors = mergeColors(defaultColors, content.customColors)

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', background: colors.warmBg, borderRadius: 12, flexShrink: 0 }} onClick={() => onSelect?.(null)}>
      {/* 背景素材层：仅顶部100px，透明度从15%渐变到0% */}
      <div style={{
        position: 'absolute',
        inset: 0,
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0) 100px)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0) 100px)',
      }}>
        <DecorLayer elements={sampledDecor} width={W} height={H} templateId="background-activity-pc" onSelect={onSelect} isSelected={isSelected} />
      </div>
    </div>
  )
}
