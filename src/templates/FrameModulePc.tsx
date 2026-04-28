import { useState, useEffect } from 'react'
import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts, titleSize } from './fonts'
import { DraggableElement, useTemplateState } from '../components/DraggableCanvas'

const W = 876
const H = 389

export function FrameModulePc({ colors: defaultColors, content, slots, sampledDecor, onSelect, isSelected, forExport, animationEnabled }: TemplateProps & { onSelect?: (key: string) => void; isSelected?: string | null; forExport?: boolean; animationEnabled?: boolean }) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)
  const [animationOffset, setAnimationOffset] = useState(0)

  // 为元素添加可拖拽状态
  const { state: titleState } = useTemplateState({
    templateId: 'frame-module-pc',
    elementKey: 'title',
    initialX: 20,
    initialY: 22,
    initialFontSize: 28,
  })

  const { state: heroState } = useTemplateState({
    templateId: 'frame-module-pc',
    elementKey: 'hero',
    initialX: 740,
    initialY: 0,
    initialFontSize: 16,
    initialRotation: 6,
  })

  // 动画效果
  useEffect(() => {
    if (!animationEnabled || forExport) return

    let startTime = performance.now()
    let animationId: number

    const animate = (time: number) => {
      const elapsed = time - startTime
      const offset = Math.sin(elapsed / 500) * 10 // 上下浮动10像素
      setAnimationOffset(offset)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [animationEnabled, forExport])

  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', borderRadius: 12, background: colors.warmBg, flexShrink: 0 }} onClick={() => onSelect?.(null)}>
      <DraggableElement
        templateId="frame-module-pc"
        elementKey="title"
        initialX={20}
        initialY={22}
        style={{ zIndex: 2, maxWidth: '60%' }}
        onSelect={onSelect}
        isSelected={isSelected === 'title'}
      >
        <div style={{ fontSize: titleState.fontSize, fontWeight: 900, color: colors.textOnDark, fontFamily: fonts.title, lineHeight: 1.15 }}>
          {content.title}
        </div>
      </DraggableElement>

      {slots.bannerHero && (
        <DraggableElement
          templateId="frame-module-pc"
          elementKey="hero"
          initialX={760}
          initialY={-8}
          onSelect={onSelect}
          isSelected={isSelected === 'hero'}
        >
          <img
            src={slots.bannerHero}
            alt=""
            style={{
              height: 108,
              width: 'auto',
              transition: animationEnabled && !forExport ? 'transform 0.1s ease-out' : 'none',
              transform: animationEnabled && !forExport ? `translateY(${animationOffset}px)` : 'none',
            }}
          />
        </DraggableElement>
      )}

      <DecorLayer elements={sampledDecor} width={W} height={H} templateId="frame-module-pc" onSelect={onSelect} isSelected={isSelected} />
    </div>
  )
}
