import { useState, useEffect } from 'react'
import type { TemplateProps } from '../types'
import { DecorLayer } from './DecorLayer'
import { mergeColors, getFonts, titleSize } from './fonts'
import { DraggableElement, useTemplateState } from '../components/DraggableCanvas'

const W = 351
const H = 66

export function BannerWarm({ colors: defaultColors, content, slots, sampledDecor, onSelect, isSelected, forExport, animationEnabled }: TemplateProps & { onSelect?: (key: string) => void; isSelected?: string | null; forExport?: boolean; animationEnabled?: boolean }) {
  const colors = mergeColors(defaultColors, content.customColors)
  const fonts = getFonts(content)
  const [animationOffset, setAnimationOffset] = useState(0)

  const isDarkBg = colors.warmBg.includes('gradient') || colors.warmBg.startsWith('#F') || colors.warmBg.startsWith('rgb')
  const titleColor = colors.warmBg.includes('gradient') ? colors.textOnDark : colors.primary
  const subtitleColor = colors.warmBg.includes('gradient') ? 'rgba(255,255,255,0.85)' : '#888'

  // 为元素添加可拖拽状态
  const { state: textState } = useTemplateState({
    templateId: 'banner-warm',
    elementKey: 'text',
    initialX: 14,
    initialY: 16,
    initialFontSize: 20,
  })

  const { state: heroState } = useTemplateState({
    templateId: 'banner-warm',
    elementKey: 'hero',
    initialX: 200,
    initialY: 0,
    initialFontSize: 16,
    initialRotation: 7,
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
    <div style={{ width: W, height: H, position: 'relative', overflow: forExport ? 'hidden' : 'visible', borderRadius: 10, background: colors.warmBg, display: 'flex', alignItems: 'center', flexShrink: 0 }} onClick={() => onSelect?.(null)}>
      {slots.bgPattern && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slots.bgPattern})`, backgroundSize: '50px auto', opacity: 0.1, zIndex: 0 }} />
      )}
      {/* Invisible spacer to keep CTA pushed right */}
      <div style={{ flex: 1 }} />
      <DraggableElement 
        templateId="banner-warm" 
        elementKey="text" 
        initialX={14} 
        initialY={16} 
        style={{ zIndex: 3, maxWidth: '62%' }}
        onSelect={onSelect}
        isSelected={isSelected === 'text'}
      >
        <div style={{ fontSize: textState.fontSize, fontWeight: 900, color: titleColor, fontFamily: fonts.title, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {content.title}
        </div>
        <div style={{ fontSize: 10, color: subtitleColor, fontFamily: fonts.subtitle, marginTop: 2 }}>
          {content.subtitle}
        </div>
      </DraggableElement>
      {!slots.bannerHero && (
        <div style={{ position: 'relative', zIndex: 3, marginRight: 8, flexShrink: 0 }}>
          <div style={{ background: colors.primary, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 14, fontFamily: fonts.ui, whiteSpace: 'nowrap' }}>
            {content.cta}
          </div>
        </div>
      )}
      {slots.bannerHero && (
        <DraggableElement
          templateId="banner-warm"
          elementKey="hero"
          initialX={200}
          initialY={0}
          onSelect={onSelect}
          isSelected={isSelected === 'hero'}
        >
          <img 
            src={slots.bannerHero} 
            alt="" 
            style={{ 
              height: H * 1.3, 
              width: 'auto',
              transition: animationEnabled && !forExport ? 'transform 0.1s ease-out' : 'none',
              transform: animationEnabled && !forExport ? `translateY(${animationOffset}px)` : 'none',
            }} 
          />
        </DraggableElement>
      )}
      <DecorLayer elements={sampledDecor} width={W} height={H} templateId="banner-warm" onSelect={onSelect} isSelected={isSelected} />
    </div>
  )
}
