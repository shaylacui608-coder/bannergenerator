import { useState, useRef, useEffect, useContext, createContext } from 'react'
import type { ReactNode } from 'react'

// ── Canvas Context ────────────────────────────────────────────────────────────
// Provides scale (CSS transform ratio) and forExport flag to all draggable children.
// scale: divide mouse delta by this to convert screen px → template px
// forExport: suppress drag UI and event handlers in the hidden export render

interface CanvasCtx {
  scale: number
  forExport: boolean
}

export const CanvasContext = createContext<CanvasCtx>({ scale: 1, forExport: false })

export function CanvasProvider({
  scale,
  forExport,
  children,
}: {
  scale: number
  forExport: boolean
  children: ReactNode
}) {
  return <CanvasContext.Provider value={{ scale, forExport }}>{children}</CanvasContext.Provider>
}

// ── localStorage helpers ──────────────────────────────────────────────────────

interface ElementState {
  x: number
  y: number
  fontSize: number
  scale: number
  rotation: number
}

interface TemplateState {
  [templateId: string]: {
    [elementKey: string]: ElementState
  }
}

const STORAGE_KEY = 'banner-template-states-v2' // 更新了key，避免旧数据冲突
const PATTERN_KEY = 'banner-pattern-offset-v1'

function loadTemplateStates(): TemplateState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {}
}

function saveTemplateStates(states: TemplateState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
  } catch {}
}

// ── DraggableElement ──────────────────────────────────────────────────────────

interface DraggableProps {
  templateId: string
  elementKey: string
  initialX?: number
  initialY?: number
  initialFontSize?: number
  initialScale?: number
  initialRotation?: number
  children: ReactNode
  style?: React.CSSProperties
  onSelect?: (elementKey: string) => void
  isSelected?: boolean
}

export function DraggableElement({
  templateId,
  elementKey,
  initialX = 0,
  initialY = 0,
  initialFontSize = 16,
  initialScale = 1,
  initialRotation = 0,
  children,
  style,
  onSelect,
  isSelected,
}: DraggableProps) {
  const { scale, forExport } = useContext(CanvasContext)
  const [templateStates, setTemplateStates] = useState<TemplateState>(loadTemplateStates)
  const elementRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  
  // 拖拽模式：'move' | 'scale' | 'rotate' | null
  const dragModeRef = useRef<'move' | 'scale' | 'rotate' | null>(null)
  const startDataRef = useRef({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    startClientX: 0,
    startClientY: 0,
    centerX: 0,
    centerY: 0,
  })

  const getState = (): ElementState => {
    const ts = templateStates[templateId] || {}
    return ts[elementKey] || { 
      x: initialX, 
      y: initialY, 
      fontSize: initialFontSize,
      scale: initialScale,
      rotation: initialRotation
    }
  }

  const state = getState()

  // Use ref so the mousemove handler always calls the latest version (fixes stale closure)
  const updateStateRef = useRef<(patch: Partial<ElementState>) => void>(() => {})
  updateStateRef.current = (patch: Partial<ElementState>) => {
    setTemplateStates(prev => {
      const existing = (prev[templateId] || {})[elementKey] || { 
        x: initialX, 
        y: initialY, 
        fontSize: initialFontSize,
        scale: initialScale,
        rotation: initialRotation
      }
      const next = {
        ...prev,
        [templateId]: {
          ...(prev[templateId] || {}),
          [elementKey]: { ...existing, ...patch },
        },
      }
      saveTemplateStates(next)
      return next
    })
  }

  // 获取元素中心点（屏幕坐标）
  const getElementCenter = () => {
    if (!elementRef.current) return { x: 0, y: 0 }
    const rect = elementRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  // 点击选中元素
  const handleElementClick = (e: React.MouseEvent) => {
    if (forExport) return
    e.stopPropagation()
    e.preventDefault()
    onSelect?.(elementKey)
  }

  // 移动操作
  const handleMoveMouseDown = (e: React.MouseEvent) => {
    if (forExport) return
    e.stopPropagation()
    e.preventDefault()
    dragModeRef.current = 'move'
    const curState = getState()
    startDataRef.current = {
      ...startDataRef.current,
      x: curState.x,
      y: curState.y,
      startClientX: e.clientX,
      startClientY: e.clientY,
    }
    onSelect?.(elementKey)
  }

  // 缩放操作
  const handleScaleMouseDown = (e: React.MouseEvent) => {
    if (forExport) return
    e.stopPropagation()
    e.preventDefault()
    dragModeRef.current = 'scale'
    const curState = getState()
    const center = getElementCenter()
    startDataRef.current = {
      ...startDataRef.current,
      scale: curState.scale,
      startClientX: e.clientX,
      startClientY: e.clientY,
      centerX: center.x,
      centerY: center.y,
    }
    onSelect?.(elementKey)
  }

  // 旋转操作
  const handleRotateMouseDown = (e: React.MouseEvent) => {
    if (forExport) return
    e.stopPropagation()
    e.preventDefault()
    dragModeRef.current = 'rotate'
    const curState = getState()
    const center = getElementCenter()
    startDataRef.current = {
      ...startDataRef.current,
      rotation: curState.rotation,
      startClientX: e.clientX,
      startClientY: e.clientY,
      centerX: center.x,
      centerY: center.y,
    }
    onSelect?.(elementKey)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragModeRef.current) return

      const { startClientX, startClientY, centerX, centerY } = startDataRef.current

      if (dragModeRef.current === 'move') {
        // 移动
        const deltaX = (e.clientX - startClientX) / scale
        const deltaY = (e.clientY - startClientY) / scale
        const newX = startDataRef.current.x + deltaX
        const newY = startDataRef.current.y + deltaY
        updateStateRef.current({ x: newX, y: newY })
      } else if (dragModeRef.current === 'scale') {
        // 缩放
        const startDist = Math.sqrt(
          Math.pow(startClientX - centerX, 2) + Math.pow(startClientY - centerY, 2)
        )
        const endDist = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        )
        if (startDist > 0) {
          const scaleDelta = endDist / startDist
          const newScale = Math.max(0.2, Math.min(5, startDataRef.current.scale * scaleDelta))
          updateStateRef.current({ scale: newScale })
        }
      } else if (dragModeRef.current === 'rotate') {
        // 旋转
        const startAngle = Math.atan2(startClientY - centerY, startClientX - centerX)
        const endAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
        const deltaAngle = (endAngle - startAngle) * (180 / Math.PI)
        const newRotation = startDataRef.current.rotation + deltaAngle
        updateStateRef.current({ rotation: newRotation })
      }
    }

    const handleMouseUp = () => {
      dragModeRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [scale]) // 添加 scale 作为依赖

  // 每次渲染后更新内层 div 的自然（变换前）尺寸，用于精确计算手柄位置
  useEffect(() => {
    if (!innerRef.current) return
    const w = innerRef.current.offsetWidth
    const h = innerRef.current.offsetHeight
    if (w > 0 && h > 0 && (w !== naturalSize.w || h !== naturalSize.h)) {
      setNaturalSize({ w, h })
    }
  })

  const getCursor = () => {
    if (forExport) return 'default'
    if (dragModeRef.current === 'move') return 'grabbing'
    if (dragModeRef.current === 'scale') return 'nwse-resize'
    if (dragModeRef.current === 'rotate') return 'grab'
    return 'grab'
  }

  // 根据当前 scale + rotation 精确计算四角在外层容器坐标系中的位置
  const { w: nw, h: nh } = naturalSize
  const θ = (state.rotation * Math.PI) / 180
  const cosR = Math.cos(θ)
  const sinR = Math.sin(θ)
  const sc = state.scale

  // 将元素局部坐标 (cx, cy)（以自然中心为原点）转换为外层容器坐标
  const toOuter = (cx: number, cy: number) => ({
    x: nw / 2 + sc * (cx * cosR - cy * sinR),
    y: nh / 2 + sc * (cx * sinR + cy * cosR),
  })

  const ptTL = toOuter(-nw / 2, -nh / 2)
  const ptTR = toOuter(nw / 2, -nh / 2)
  const ptBL = toOuter(-nw / 2, nh / 2)
  const ptBR = toOuter(nw / 2, nh / 2)
  const ptTC = toOuter(0, -nh / 2) // 顶部中心

  // 旋转手柄：在元素局部 "上方" 36px 处（沿元素旋转轴方向）
  const rotHandlePt = {
    x: ptTC.x + 36 * sinR,
    y: ptTC.y - 36 * cosR,
  }

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: state.x,
        top: state.y,
        cursor: getCursor(),
        userSelect: forExport ? undefined : 'none',
        zIndex: (!forExport && isSelected) ? 100 : undefined,
        ...style,
      }}
    >
      {/* 元素主体（挂 innerRef 以测量自然尺寸） */}
      <div
        ref={innerRef}
        style={{
          transform: `matrix(${sc * cosR}, ${sc * sinR}, ${-sc * sinR}, ${sc * cosR}, 0, 0)`,
          transformOrigin: 'center center',
        }}
        onClick={forExport ? undefined : handleElementClick}
      >
        {/* Figma 风格蓝色选中边框 */}
        <div style={{
          outline: (!forExport && isSelected) ? '1.5px solid #0066FF' : 'none',
          outlineOffset: '1px',
        }}>
          <div onMouseDown={forExport ? undefined : handleMoveMouseDown}>
            {children}
          </div>
        </div>
      </div>

      {/* 控制手柄（仅选中且非导出模式且已测量到自然尺寸时显示） */}
      {!forExport && isSelected && nw > 0 && (
        <>
          {/* 4 个角落缩放手柄 —— 位置由数学公式精确算出，始终跟随元素视觉角落 */}
          {[
            { pt: ptTL, cursor: 'nwse-resize' },
            { pt: ptTR, cursor: 'nesw-resize' },
            { pt: ptBL, cursor: 'nesw-resize' },
            { pt: ptBR, cursor: 'nwse-resize' },
          ].map(({ pt, cursor }, i) => (
            <div
              key={i}
              onMouseDown={handleScaleMouseDown}
              style={{
                position: 'absolute',
                left: pt.x - 4, // 手柄宽 8px，居中
                top: pt.y - 4,  // 手柄高 8px，居中
                width: 8,
                height: 8,
                backgroundColor: '#ffffff',
                border: '1.5px solid #0066FF',
                borderRadius: 2,
                cursor,
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                zIndex: 101,
                transform: `rotate(${-state.rotation}deg)`, // 保持视觉方正
                transformOrigin: 'center center',
              }}
            />
          ))}

          {/* 旋转手柄 - SVG 弧形箭头，沿元素局部 "上方" 36px */}
          <div
            onMouseDown={handleRotateMouseDown}
            style={{
              position: 'absolute',
              left: rotHandlePt.x - 10, // SVG 宽 20px，居中
              top: rotHandlePt.y - 20,  // SVG 高 20px，中心对齐到 rotHandlePt
              cursor: 'grab',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `rotate(${-state.rotation}deg)`,
              transformOrigin: 'center top',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" fill="white" stroke="#0066FF" strokeWidth="1.5"/>
              <path d="M6.5 10a3.5 3.5 0 1 1 3.5 3.5" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6.5 13.2 L6.5 10.2 L9.5 10.2" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* 连接线 */}
            <div style={{ width: 1, height: 14, background: '#0066FF', opacity: 0.4 }} />
          </div>
        </>
      )}
    </div>
  )
}

// ── FontSizeSelector ──────────────────────────────────────────────────────────

interface FontSizeSelectorProps {
  templateId: string
  elementKey: string
  initialFontSize?: number
  label?: string
}

export function FontSizeSelector({ templateId, elementKey, initialFontSize = 16, label }: FontSizeSelectorProps) {
  const [templateStates, setTemplateStates] = useState<TemplateState>(loadTemplateStates)

  const getState = (): ElementState => {
    const ts = templateStates[templateId] || {}
    return ts[elementKey] || { x: 0, y: 0, fontSize: initialFontSize, scale: 1, rotation: 0 }
  }

  const updateFontSize = (newSize: number) => {
    setTemplateStates(prev => {
      const existing = getState()
      const next = {
        ...prev,
        [templateId]: {
          ...(prev[templateId] || {}),
          [elementKey]: { ...existing, fontSize: newSize },
        },
      }
      saveTemplateStates(next)
      return next
    })
  }

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]
  const state = getState()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{label}</span>}
      <select
        value={state.fontSize}
        onChange={e => updateFontSize(parseInt(e.target.value))}
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, cursor: 'pointer', outline: 'none' }}
      >
        {fontSizes.map(size => <option key={size} value={size}>{size}</option>)}
      </select>
    </div>
  )
}

// ── useTemplateState ──────────────────────────────────────────────────────────

interface UseTemplateStateProps {
  templateId: string
  elementKey: string
  initialX?: number
  initialY?: number
  initialFontSize?: number
  initialScale?: number
  initialRotation?: number
}

export function useTemplateState({ templateId, elementKey, initialX = 0, initialY = 0, initialFontSize = 16, initialScale = 1, initialRotation = 0 }: UseTemplateStateProps) {
  const [templateStates, setTemplateStates] = useState<TemplateState>(loadTemplateStates)

  const getState = (): ElementState => {
    const ts = templateStates[templateId] || {}
    return ts[elementKey] || { x: initialX, y: initialY, fontSize: initialFontSize, scale: initialScale, rotation: initialRotation }
  }

  const updateState = (patch: Partial<ElementState>) => {
    setTemplateStates(prev => {
      const existing = (prev[templateId] || {})[elementKey] || { x: initialX, y: initialY, fontSize: initialFontSize, scale: initialScale, rotation: initialRotation }
      const next = {
        ...prev,
        [templateId]: {
          ...(prev[templateId] || {}),
          [elementKey]: { ...existing, ...patch },
        },
      }
      saveTemplateStates(next)
      return next
    })
  }

  return { state: getState(), updateState }
}

// ── usePatternOffset ──────────────────────────────────────────────────────────
// Tracks background pattern position offset per template.

interface PatternOffset { x: number; y: number }

function loadPatternOffsets(): Record<string, PatternOffset> {
  try {
    const stored = localStorage.getItem(PATTERN_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {}
}

function savePatternOffset(templateId: string, offset: PatternOffset) {
  try {
    const all = loadPatternOffsets()
    all[templateId] = offset
    localStorage.setItem(PATTERN_KEY, JSON.stringify(all))
  } catch {}
}

export function usePatternOffset(templateId: string) {
  const [offsets, setOffsets] = useState<Record<string, PatternOffset>>(loadPatternOffsets)
  const offset = offsets[templateId] || { x: 0, y: 0 }

  const setOffset = (o: PatternOffset) => {
    setOffsets(prev => ({ ...prev, [templateId]: o }))
    savePatternOffset(templateId, o)
  }

  return { offset, setOffset }
}

// ── resetAllDragState ─────────────────────────────────────────────────────────
// Clears all three localStorage keys used by the drag system.

export function resetAllDragState() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PATTERN_KEY)
  localStorage.removeItem('banner-decor-states-v1')
  localStorage.removeItem('banner-decor-states-v2')
}
