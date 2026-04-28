import { useState, useRef, useEffect, useContext } from 'react'
import type { SampledDecorElement } from '../types'
import { CanvasContext } from '../components/DraggableCanvas'

interface Props {
  elements: SampledDecorElement[]
  width: number
  height: number
  templateId?: string
  onSelect?: (id: string | null) => void
  isSelected?: string | null
}

interface DecorElementState {
  x: number
  y: number
  scale: number
  rotation: number
}

const STORAGE_KEY = 'banner-decor-states-v2' // 更新了key，避免旧数据冲突

function loadDecorStates(templateId: string): Record<string, DecorElementState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const all = JSON.parse(stored)
      return all[templateId] || {}
    }
  } catch {}
  return {}
}

function saveDecorStates(templateId: string, states: Record<string, DecorElementState>) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const all = stored ? JSON.parse(stored) : {}
    all[templateId] = states
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

interface DraggableDecorProps {
  element: SampledDecorElement
  baseX: number
  baseY: number
  templateId?: string
  onSelect?: (id: string) => void
  isSelected?: boolean
}

function DraggableDecor({ element, baseX, baseY, templateId = 'default', onSelect, isSelected }: DraggableDecorProps) {
  const { scale, forExport } = useContext(CanvasContext)
  const [decorStates, setDecorStates] = useState<Record<string, DecorElementState>>(() => loadDecorStates(templateId))
  const elementRef = useRef<HTMLDivElement>(null)
  
  // 当 element 或 baseX/baseY 变化时，重新加载状态
  useEffect(() => {
    setDecorStates(loadDecorStates(templateId))
  }, [element.id, baseX, baseY, templateId])
  
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

  const getState = (): DecorElementState =>
    decorStates[element.id] || { x: baseX, y: baseY, scale: element.scale, rotation: element.rotation }

  const state = getState()

  const updateStateRef = useRef<(patch: Partial<DecorElementState>) => void>(() => {})
  updateStateRef.current = (patch) => {
    setDecorStates(prev => {
      const existing = prev[element.id] || { x: baseX, y: baseY, scale: element.scale, rotation: element.rotation }
      const next = { ...prev, [element.id]: { ...existing, ...patch } }
      saveDecorStates(templateId, next)
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

  // 点击选中装饰元素
  const handleDecorClick = (e: React.MouseEvent) => {
    if (forExport) return
    e.stopPropagation()
    e.preventDefault()
    onSelect?.(element.id)
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
    onSelect?.(element.id)
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
    onSelect?.(element.id)
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
    onSelect?.(element.id)
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

  const getCursor = () => {
    if (forExport) return 'default'
    if (dragModeRef.current === 'move') return 'grabbing'
    return 'grab'
  }

  // 视觉宽度 = 自然宽度 × scale，用 width 属性直接控制尺寸
  // 这样容器布局盒 = 图片视觉盒，手柄天然对齐到图片真实角落
  // 不需要 scale(1/state.scale) 反缩放，手柄始终是正常大小
  const visualWidth = element.baseSize * state.scale

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: state.x,
        top: state.y,
        // translate(-50%, -50%) 放在容器上：
        // 容器布局宽 = visualWidth，所以 -50% 准确指向图片视觉中心
        transform: element.centered ? 'translate(-50%, -50%)' : undefined,
        cursor: getCursor(),
        userSelect: 'none',
        zIndex: (!forExport && isSelected) ? 100 : element.zIndex,
      }}
    >
      {/* 图片主体：scale 通过 width 控制，transform 只做旋转 + 翻转 */}
      <img
        src={element.asset}
        alt=""
        onClick={forExport ? undefined : handleDecorClick}
        onMouseDown={forExport ? undefined : handleMoveMouseDown}
        style={{
          width: visualWidth,
          height: 'auto',
          display: 'block',
          // 只保留旋转和水平翻转，scale 已由 width 处理
          transform: `rotate(${state.rotation}deg) scaleX(${element.flipX ? -1 : 1})`,
          transformOrigin: 'center center',
          userSelect: 'none',
          outline: (!forExport && isSelected) ? '1.5px solid #0066FF' : 'none',
          outlineOffset: '2px',
          borderRadius: (!forExport && isSelected) ? 2 : 0,
        }}
      />

      {/* 控制手柄（仅选中且非导出模式时显示） */}
      {!forExport && isSelected && (
        <>
          {/* 4 个角落缩放手柄：布局盒已等于视觉盒，无需反缩放 */}
          {[
            { top: -5,    left: -5,    cursor: 'nwse-resize' },
            { top: -5,    right: -5,   cursor: 'nesw-resize' },
            { bottom: -5, left: -5,    cursor: 'nesw-resize' },
            { bottom: -5, right: -5,   cursor: 'nwse-resize' },
          ].map((pos, i) => (
            <div
              key={i}
              onMouseDown={handleScaleMouseDown}
              style={{
                position: 'absolute',
                ...pos,
                width: 8,
                height: 8,
                backgroundColor: '#ffffff',
                border: '1.5px solid #0066FF',
                borderRadius: 2,
                cursor: pos.cursor,
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                zIndex: 101,
              }}
            />
          ))}
          {/* 旋转手柄 - SVG 弧形箭头 */}
          <div
            onMouseDown={handleRotateMouseDown}
            style={{
              position: 'absolute',
              left: '50%',
              top: -36,
              transform: 'translateX(-50%)',
              cursor: 'grab',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="9" fill="white" stroke="#0066FF" strokeWidth="1.5"/>
              <path d="M6.5 10a3.5 3.5 0 1 1 3.5 3.5" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6.5 13.2 L6.5 10.2 L9.5 10.2" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ width: 1, height: 14, background: '#0066FF', opacity: 0.4 }} />
          </div>
        </>
      )}
    </div>
  )
}

export function DecorLayer({ elements, width, height, templateId, onSelect, isSelected }: Props) {
  return (
    <>
      {elements.map(el => {
        const baseX = (el.x / 100) * width
        const baseY = (el.y / 100) * height
        return (
          <DraggableDecor
            key={el.id}
            element={el}
            baseX={baseX}
            baseY={baseY}
            templateId={templateId}
            onSelect={onSelect}
            isSelected={isSelected === el.id}
          />
        )
      })}
    </>
  )
}
