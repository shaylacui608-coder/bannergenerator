import { useState } from 'react'
import type { TemplateId, TemplateProps, TemplateSlots, SampledDecorElement } from '../types'
import { TEMPLATE_REGISTRY, TEMPLATE_INFO } from '../templates'
import { CanvasProvider } from './DraggableCanvas'
import { mergeColors } from '../templates/fonts'

interface Props extends TemplateProps {
  templateId: TemplateId
  onExportRef?: (el: HTMLElement | null) => void
  /** Required when templateId has compositeWith — props for the background template */
  bgSlots?: TemplateSlots
  bgSampledDecor?: SampledDecorElement[]
  animationEnabled?: boolean
  mode?: 'ai' | 'manual'
  aiImage?: string
  onModeSwitch?: (templateId: TemplateId, mode: 'ai' | 'manual') => void
}

export function TemplatePreviewCard({ templateId, onExportRef, bgSlots, bgSampledDecor, animationEnabled, mode, aiImage, onModeSwitch, ...props }: Props) {
  const info = TEMPLATE_INFO[templateId]
  const Template = TEMPLATE_REGISTRY[templateId]
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  console.log(`TemplatePreviewCard (${templateId}) 收到 props:`, props)
  console.log(`TemplatePreviewCard (${templateId}) 收到 slots:`, props.slots)
  console.log(`TemplatePreviewCard (${templateId}) 收到 bannerHero:`, props.slots?.bannerHero)
  console.log(`TemplatePreviewCard (${templateId}) mode:`, mode, 'aiImage:', !!aiImage)

  // --- Hidden export template (always rendered with forExport=true) ---
  // 外层负责将元素移出视野；ref 挂在内层 (position 0,0) 上，
  // 这样 html-to-image 捕获时不会因 left:-99999 导致内容渲染在 SVG viewBox 之外。
  const renderExportTemplate = () => (
    <div style={{ position: 'absolute', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden="true">
      <div
        ref={el => { onExportRef?.(el) }}
        style={{ width: info.width, height: info.height }}
      >
        <CanvasProvider scale={1} forExport={true}>
          <Template {...props} forExport={true} />
        </CanvasProvider>
      </div>
    </div>
  )

  // --- AI模式的渲染 ---
  const renderAIMode = (scale: number) => {
    const displayW = Math.round(info.width * scale)
    const displayH = Math.round(info.height * scale)

    return (
      <div style={{ width: displayW, height: displayH, overflow: 'hidden', position: 'relative', background: 'var(--bg-base)', flexShrink: 0 }}>
        <img
          src={aiImage}
          alt="AI Generated"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'top left',
          }}
        />
      </div>
    )
  }

  // --- 模式切换UI ---
  const renderModeSwitcher = () => {
    if (!aiImage) return null

    return (
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '6px 8px',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-dim)',
      }}>
        <button
          onClick={() => onModeSwitch?.(templateId, 'manual')}
          style={{
            flex: 1,
            padding: '5px 10px',
            borderRadius: 5,
            border: mode === 'manual' ? '1px solid var(--border-mid)' : '1px solid transparent',
            background: mode === 'manual' ? 'var(--bg-elevated)' : 'transparent',
            color: mode === 'manual' ? 'var(--text-hi)' : 'var(--text-lo)',
            fontSize: 11,
            fontWeight: mode === 'manual' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: 'ChillRoundF, sans-serif',
          }}
        >
          ✏️ 手动
        </button>
        <button
          onClick={() => onModeSwitch?.(templateId, 'ai')}
          style={{
            flex: 1,
            padding: '5px 10px',
            borderRadius: 5,
            border: mode === 'ai' ? '1px solid var(--border-mid)' : '1px solid transparent',
            background: mode === 'ai' ? 'var(--bg-elevated)' : 'transparent',
            color: mode === 'ai' ? 'var(--text-hi)' : 'var(--text-lo)',
            fontSize: 11,
            fontWeight: mode === 'ai' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: 'ChillRoundF, sans-serif',
          }}
        >
          🤖 AI
        </button>
      </div>
    )
  }

  // --- Composite mode: render a background template, overlay this template on top ---
  if (info.compositeWith && bgSlots && bgSampledDecor) {
    const comp = info.compositeWith
    const bgInfo = TEMPLATE_INFO[comp.templateId]
    const BgTemplate = TEMPLATE_REGISTRY[comp.templateId]
    const scale = comp.displayScale ?? 1.0

    const outerW = Math.round(bgInfo.width * scale)
    const outerH = Math.round(bgInfo.height * scale)

    // 检查是否AI模式
    if (mode === 'ai' && aiImage) {
      return (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-dim)', display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
          {renderExportTemplate()}
          {renderAIMode(scale)}
          {renderModeSwitcher()}
          {/* Footer */}
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-dim)', flexShrink: 0, background: 'var(--bg-panel)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', fontFamily: 'ChillRoundF, sans-serif' }}>
              {info.label}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-lo)', fontFamily: 'monospace' }}>
              {info.width}×{info.height}
            </span>
          </div>
        </div>
      )
    }

    return (
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-dim)', display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
        {/* Hidden export template */}
        {renderExportTemplate()}
        
        <div style={{ width: outerW, height: outerH, position: 'relative', overflow: 'visible', flexShrink: 0 }}>
          {/* Background template — full size scaled to display */}
          <div style={{ width: bgInfo.width, height: bgInfo.height, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
            <CanvasProvider scale={scale} forExport={false}>
              <BgTemplate {...props} slots={bgSlots} sampledDecor={bgSampledDecor} forExport={false} onSelect={setSelectedElement} isSelected={selectedElement} />
            </CanvasProvider>
          </div>

          {/* Middle frame for banner-warm (商机中心) — 351×342 at x=12,y=317, not for export */}
          {templateId === 'banner-warm' && (
            <div
              style={{
                position: 'absolute',
                left: 12 * scale,
                top: 317 * scale,
                width: 351 * scale,
                height: 342 * scale,
                background: props.colors?.warmBg,
                borderRadius: 12,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          )}

          {/* Foreground template — positioned over the background (preview only) */}
          <div
            style={{
              position: 'absolute',
              left: comp.x * scale,
              top: comp.y * scale,
              width: info.width * scale,
              height: info.height * scale,
              overflow: 'visible',
              zIndex: 2,
            }}
          >
            <div style={{ width: info.width, height: info.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <div style={{ width: info.width, height: info.height, position: 'relative' }}>
                <CanvasProvider scale={scale} forExport={false}>
                  <Template {...props} forExport={false} onSelect={setSelectedElement} isSelected={selectedElement} animationEnabled={animationEnabled} />
                </CanvasProvider>
              </div>
            </div>
          </div>

          {/* Context overlay — UI chrome on top of everything */}
          {comp.overlay && (
            <img
              src={comp.overlay}
              alt=""
              style={{ position: 'absolute', left: 0, top: 0, width: outerW, height: outerH, objectFit: 'contain', objectPosition: 'top left', pointerEvents: 'none', zIndex: 3 }}
            />
          )}
        </div>

        {renderModeSwitcher()}

        {/* Footer */}
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-dim)', flexShrink: 0, background: 'var(--bg-panel)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', fontFamily: 'ChillRoundF, sans-serif' }}>
            {info.label}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-lo)', fontFamily: 'monospace' }}>
            {info.width}×{info.height}
          </span>
        </div>
      </div>
    )
  }

  // --- Context preview mode: template placed over a static app-screen image ---
  if (info.contextPreview) {
    const ctx = info.contextPreview
    const scale = ctx.displayScale ?? info.previewScale
    const outerW = Math.round(ctx.bgWidth * scale)
    const outerH = Math.round(ctx.bgHeight * scale)

    // 检查是否AI模式
    if (mode === 'ai' && aiImage) {
      return (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-dim)', display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
          {renderExportTemplate()}
          {renderAIMode(scale)}
          {renderModeSwitcher()}
          {/* Footer */}
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-dim)', flexShrink: 0, background: 'var(--bg-panel)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', fontFamily: 'ChillRoundF, sans-serif' }}>
              {info.label}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-lo)', fontFamily: 'monospace' }}>
              {info.width}×{info.height}
            </span>
          </div>
        </div>
      )
    }

    const hasOverlayOffset = (ctx.overlayX ?? 0) !== 0 || (ctx.overlayY ?? 0) !== 0

    return (
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-dim)', display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
        {/* Hidden export template */}
        {renderExportTemplate()}

        <div style={{ width: outerW, height: outerH, position: 'relative', overflow: 'visible', flexShrink: 0 }}>
          {/* Background image — omitted when the template itself is the background */}
          {ctx.image && (
            <img
              src={ctx.image}
              alt=""
              style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                width: outerW, 
                height: outerH, 
                objectFit: 'contain', 
                objectPosition: 'top left',
                pointerEvents: 'none' 
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              left: ctx.x * scale,
              top: ctx.y * scale,
              width: info.width * scale,
              height: info.height * scale,
              overflow: 'hidden',
            }}
          >
            <div style={{ width: info.width, height: info.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <div style={{ width: info.width, height: info.height, position: 'relative' }}>
                <CanvasProvider scale={scale} forExport={false}>
                  <Template {...props} forExport={false} onSelect={setSelectedElement} isSelected={selectedElement} animationEnabled={animationEnabled} />
                </CanvasProvider>
              </div>
            </div>
          </div>
          {/* banner-warm 专属：背景卡片 frame + 覆盖层，仅预览，不导出 */}
          {templateId === 'banner-warm' && (() => {
            const effectiveColors = mergeColors(props.colors, props.content.customColors)
            return (
              <>
                {/* 渐变背景 frame */}
                <div
                  style={{
                    position: 'absolute',
                    left: 12 * scale,
                    top: 314 * scale,
                    width: 351 * scale,
                    height: 327 * scale,
                    background: effectiveColors.warmBg,
                    borderRadius: 12 * scale,
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
                {/* UI 覆盖层 */}
                <img
                  src="/assets/context/daily_商机中心APP覆盖层.png"
                  alt=""
                  style={{
                    position: 'absolute',
                    left: 23 * scale,
                    top: 303 * scale,
                    width: 328 * scale,
                    height: 306 * scale,
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
              </>
            )
          })()}

          {/* Overlay — full-cover or positionally offset */}
          {ctx.overlay && (
            <img
              src={ctx.overlay}
              alt=""
              style={hasOverlayOffset
                ? { 
                    position: 'absolute', 
                    left: (ctx.overlayX ?? 0) * scale, 
                    top: (ctx.overlayY ?? 0) * scale, 
                    width: (ctx.overlayWidth ?? 351) * scale, 
                    height: (ctx.overlayHeight ?? 350) * scale, 
                    pointerEvents: 'none', 
                    zIndex: 3 
                  }
                : { position: 'absolute', left: 0, top: 0, width: outerW, height: outerH, objectFit: 'contain', objectPosition: 'top left', pointerEvents: 'none', zIndex: 3 }
              }
            />
          )}
        </div>

        {renderModeSwitcher()}

        {/* Footer */}
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-dim)', flexShrink: 0, background: 'var(--bg-panel)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', fontFamily: 'ChillRoundF, sans-serif' }}>
            {info.label}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-lo)', fontFamily: 'monospace' }}>
            {info.width}×{info.height}
          </span>
        </div>
      </div>
    )
  }

  // --- Standard preview mode ---
  const scale = info.previewScale

  // 检查是否AI模式
  if (mode === 'ai' && aiImage) {
    return (
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-dim)', display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
        {renderExportTemplate()}
        {renderAIMode(scale)}
        {renderModeSwitcher()}
        {/* Footer */}
        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-dim)', flexShrink: 0, background: 'var(--bg-panel)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', fontFamily: 'ChillRoundF, sans-serif' }}>
            {info.label}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-lo)', fontFamily: 'monospace' }}>
            {info.width}×{info.height}
          </span>
        </div>
      </div>
    )
  }

  const displayW = Math.round(info.width * scale)
  const displayH = Math.round(info.height * scale)

  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-dim)', display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
      {/* Hidden export template */}
      {renderExportTemplate()}

      <div style={{ width: displayW, height: displayH, overflow: 'visible', position: 'relative', background: 'var(--bg-base)', flexShrink: 0 }}>
        <div style={{ width: info.width, height: info.height, transform: `scale(${scale})`, transformOrigin: 'top left', flexShrink: 0 }}>
          <div style={{ width: info.width, height: info.height, position: 'relative' }}>
            <CanvasProvider scale={scale} forExport={false}>
              <Template {...props} forExport={false} onSelect={setSelectedElement} isSelected={selectedElement} animationEnabled={animationEnabled} />
            </CanvasProvider>
          </div>
        </div>
      </div>

      {renderModeSwitcher()}

      {/* Footer */}
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-dim)', flexShrink: 0, background: 'var(--bg-panel)' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mid)', fontFamily: 'ChillRoundF, sans-serif' }}>
          {info.label}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-lo)', fontFamily: 'monospace' }}>
          {info.width}×{info.height}
        </span>
      </div>
    </div>
  )
}
