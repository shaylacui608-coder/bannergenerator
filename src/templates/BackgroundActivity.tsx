import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors } from './fonts'

const W = 375
const H = 938

export function BackgroundActivity({ colors: defaultColors, content, sampledDecor, onSelect, isSelected, forExport }: TemplateProps & { onSelect?: (key: string) => void; isSelected?: string | null; forExport?: boolean }) {
  const colors = mergeColors(defaultColors, content.customColors)

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', background: colors.warmBg, flexShrink: 0 }} onClick={() => onSelect?.(null)}>
      {/* 背景素材层：仅顶部100px，透明度从15%渐变到0% */}
      <div style={{
        position: 'absolute',
        inset: 0,
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0) 100px)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0) 100px)',
      }}>
        <DecorLayer elements={sampledDecor} width={W} height={H} templateId="background-activity" onSelect={onSelect} isSelected={isSelected} />
      </div>
    </div>
  )
}
