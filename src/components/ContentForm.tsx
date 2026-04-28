import { useState, useRef } from 'react'
import type { UserContent, ColorPalette, FormConfig } from '../types'

// ── Color utilities ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}

function hexToHsl(hex: string): [number, number, number] {
  const [rr, gg, bb] = hexToRgb(hex).map(v => v / 255)
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6
  else if (max === gg) h = ((bb - rr) / d + 2) / 6
  else h = ((rr - gg) / d + 4) / 6
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

// 相对于主色的 HSL 偏移量，生成 8 个渐变色标
const GRADIENT_OFFSETS = [
  { dh: 24, dl: 9 },
  { dh: 40, dl: 8 },
  { dh: 2, dl: 0 },
  { dh: 1, dl: 3 },
  { dh: -6, dl: 0 },
  { dh: -12, dl: 4 },
  { dh: -21, dl: 8 },
  { dh: -46, dl: 23 },
]

function primaryToGradientStops(primary: string): string[] {
  const [h, s, l] = hexToHsl(primary)
  return GRADIENT_OFFSETS.map(({ dh, dl }) =>
    hslToHex(h + dh, Math.min(100, s), Math.min(95, Math.max(30, l + dl)))
  )
}

// 滑块锚点色（从左到右）
const SLIDER_ANCHORS = ['#FFB830', '#FF6030', '#FF2644', '#FF1080', '#C030C0', '#6040E0']

function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function sliderPosToPrimary(pos: number): string {
  const n = SLIDER_ANCHORS.length - 1
  const idx = Math.min(Math.floor(pos * n), n - 1)
  const t = pos * n - idx
  const [r, g, b] = lerpRgb(hexToRgb(SLIDER_ANCHORS[idx]), hexToRgb(SLIDER_ANCHORS[idx + 1]), t)
  return rgbToHex(r, g, b)
}

function primaryToSliderPos(primary: string): number {
  let best = 0.4, bestDist = Infinity
  for (let i = 0; i <= 200; i++) {
    const pos = i / 200
    const [r1, g1, b1] = hexToRgb(primary)
    const [r2, g2, b2] = hexToRgb(sliderPosToPrimary(pos))
    const dist = (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
    if (dist < bestDist) { bestDist = dist; best = pos }
  }
  return best
}

function GradientColorSlider({ primary, onChangePrimary }: {
  primary: string
  onChangePrimary: (primary: string, warmBg: string) => void
}) {
  const initPos = primaryToSliderPos(primary)
  const [pos, setPos] = useState(initPos)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const applyPos = (clientX: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const newPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setPos(newPos)
    const newPrimary = sliderPosToPrimary(newPos)
    const stops = primaryToGradientStops(newPrimary)
    onChangePrimary(newPrimary, `linear-gradient(to top right, ${stops.join(', ')})`)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    applyPos(e.clientX)
    const onMove = (e: MouseEvent) => { if (dragging.current) applyPos(e.clientX) }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const currentColor = sliderPosToPrimary(pos)
  const stops = primaryToGradientStops(currentColor)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, sans-serif' }}>
          渐变主色
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: currentColor, border: '1.5px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
            {currentColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 滑块轨道 */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          height: 28,
          borderRadius: 14,
          background: `linear-gradient(to right, ${SLIDER_ANCHORS.join(', ')})`,
          cursor: 'crosshair',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          userSelect: 'none',
        }}
      >
        {/* 拖拽圆点 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pos * 100}%`,
          transform: 'translate(-50%, -50%)',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: currentColor,
          border: '2.5px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* 生成渐变预览条 */}
      <div style={{
        height: 16,
        borderRadius: 8,
        background: `linear-gradient(to right, ${stops.join(', ')})`,
        opacity: 0.85,
      }} />
    </div>
  )
}

// 预设字体选项
const FONT_OPTIONS = {
  title: [
    { value: "'ZhanKuButter', 'ChillRoundF', sans-serif", label: "站酷庆科黄油体" },
    { value: "'ZhanKuWenYi', 'ChillRoundF', sans-serif", label: "站酷文艺体" },
    { value: "'CangErInk', 'ChillRoundF', sans-serif", label: "仓耳与墨" },
    { value: "'CangErRound', 'ChillRoundF', sans-serif", label: "仓耳舒圆" },
    { value: "'ChillRoundF', sans-serif", label: "ChillRoundF" },
    { value: "'YuanHei', 'Noto Sans SC', sans-serif", label: "圆黑体" },
    { value: "'FZMoFang', 'Noto Sans SC', sans-serif", label: "方正魔方" },
    { value: "'Noto Sans SC', sans-serif", label: "思源黑体" },
    { value: "'PingFang SC', sans-serif", label: "苹方" },
  ],
  brand: [
    { value: "'DouyinSans', 'ChillRoundF', sans-serif", label: "抖音Sans" },
    { value: "'CangErInk', 'ChillRoundF', sans-serif", label: "仓耳与墨" },
    { value: "'CangErRound', 'ChillRoundF', sans-serif", label: "仓耳舒圆" },
    { value: "'ChillRoundF', sans-serif", label: "ChillRoundF" },
    { value: "'YuanHei', 'Noto Sans SC', sans-serif", label: "圆黑体" },
    { value: "'FZMoFang', 'Noto Sans SC', sans-serif", label: "方正魔方" },
    { value: "'Noto Sans SC', sans-serif", label: "思源黑体" },
  ],
  subtitle: [
    { value: "'PingFang SC', 'Helvetica Neue', 'Noto Sans SC', sans-serif", label: "苹方" },
    { value: "'Noto Sans SC', sans-serif", label: "思源黑体" },
    { value: "'YuanHei', 'Noto Sans SC', sans-serif", label: "圆黑体" },
    { value: "'FZMoFang', 'Noto Sans SC', sans-serif", label: "方正魔方" },
    { value: "'ChillRoundF', sans-serif", label: "ChillRoundF" },
    { value: "'CangErInk', 'ChillRoundF', sans-serif", label: "仓耳与墨" },
    { value: "'CangErRound', 'ChillRoundF', sans-serif", label: "仓耳舒圆" },
  ],
  ui: [
    { value: "'ChillRoundF', sans-serif", label: "ChillRoundF" },
    { value: "'Noto Sans SC', sans-serif", label: "思源黑体" },
    { value: "'PingFang SC', sans-serif", label: "苹方" },
    { value: "'YuanHei', 'Noto Sans SC', sans-serif", label: "圆黑体" },
    { value: "'FZMoFang', 'Noto Sans SC', sans-serif", label: "方正魔方" },
    { value: "'CangErInk', 'ChillRoundF', sans-serif", label: "仓耳与墨" },
    { value: "'CangErRound', 'ChillRoundF', sans-serif", label: "仓耳舒圆" },
  ]
}

interface Props {
  content: UserContent
  colors: ColorPalette
  onChange: (content: UserContent) => void
  formConfig?: FormConfig
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'ChillRoundF, sans-serif',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 14,
          fontFamily: 'ChillRoundF, sans-serif',
          outline: 'none',
          transition: 'border-color 0.15s',
          background: 'rgba(255,255,255,0.05)',
          color: '#fff'
        }}
        onFocus={e => (e.target.style.borderColor = '#FF2C19')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
      />
    </div>
  )
}

export function ContentForm({ content, colors, onChange, formConfig }: Props) {
  const set = (key: keyof UserContent) => (value: string) =>
    onChange({ ...content, [key]: value })

  const setTag = (i: number) => (value: string) => {
    const tags = [...content.tags]
    tags[i] = value
    onChange({ ...content, tags })
  }

  const setCustomColor = (key: keyof ColorPalette, value: string) => {
    onChange({
      ...content,
      customColors: {
        ...content.customColors,
        [key]: value
      }
    })
  }

  const setFont = (type: keyof NonNullable<UserContent['fonts']>, value: string) => {
    onChange({
      ...content,
      fonts: {
        ...content.fonts,
        [type]: value
      }
    })
  }

  // 获取当前使用的颜色（默认颜色或自定义颜色）
  const getCurrentColor = (key: keyof ColorPalette) => {
    return content.customColors?.[key] ?? colors[key]
  }

  // 默认显示所有字段
  const showEventName = formConfig?.showEventName ?? true
  const showTags = formConfig?.showTags ?? true
  const showSubtitle = formConfig?.showSubtitle ?? true
  const showCta = formConfig?.showCta ?? true

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {showEventName && (
        <Field label="活动名称" value={content.eventName} onChange={set('eventName')} placeholder="抖音新春吃喝玩乐节" />
      )}
      <Field label="主标题" value={content.title} onChange={set('title')} placeholder="春节卖爆品赢奖励" />
      {showSubtitle && (
        <Field label="副标题" value={content.subtitle} onChange={set('subtitle')} placeholder="新春平台营销活动火热招商中" />
      )}
      {showCta && (
        <Field label="CTA 按钮" value={content.cta} onChange={set('cta')} placeholder="立即参与" />
      )}

      {/* Tags */}
      {showTags && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, sans-serif' }}>
            标签 Pills（最多 3 个）
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <input
                key={i}
                value={content.tags[i] ?? ''}
                onChange={e => setTag(i)(e.target.value)}
                placeholder={['流量大曝光', '300元补贴金', '平台货补扶持'][i]}
                style={{
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 14,
                  fontFamily: 'ChillRoundF, sans-serif',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff'
                }}
                onFocus={e => (e.target.style.borderColor = '#FF2C19')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gradient color slider */}
      <GradientColorSlider
        primary={content.customColors?.primary ?? colors.primary}
        onChangePrimary={(primary, warmBg) => {
          onChange({
            ...content,
            customColors: { ...content.customColors, primary, warmBg },
          })
        }}
      />

      {/* Custom Colors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, sans-serif' }}>
          自定义颜色
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { key: 'primary' as const, label: '主色' },
            { key: 'secondary' as const, label: '辅色' },
            { key: 'textOnDark' as const, label: '深色背景文字' },
            { key: 'textOnLight' as const, label: '浅色背景文字' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'ChillRoundF, sans-serif' }}>
                {label}
              </label>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                  type="color"
                  value={getCurrentColor(key)}
                  onChange={(e) => setCustomColor(key, e.target.value)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                />
                <input
                  type="text"
                  value={getCurrentColor(key)}
                  onChange={(e) => setCustomColor(key, e.target.value)}
                  style={{
                    width: 70,
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, sans-serif' }}>
          字体选择
        </label>
        {(['title', 'subtitle'] as const).map((fontType) => (
          <div key={fontType} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'ChillRoundF, sans-serif' }}>
              {fontType === 'title' ? '标题字体' : '副标题字体'}
            </label>
            <select
              value={content.fonts?.[fontType] || ''}
              onChange={(e) => setFont(fontType, e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: 13,
                fontFamily: 'ChillRoundF, sans-serif',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">默认字体</option>
              {FONT_OPTIONS[fontType].map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Title size adjust */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, sans-serif' }}>
            标题字号
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => onChange({ ...content, titleSizeAdjust: Math.max(-10, content.titleSizeAdjust - 1) })}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1.5px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            −
          </button>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 40,
            borderRadius: 10,
            border: '1.5px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: content.titleSizeAdjust === 0 ? 'rgba(255,255,255,0.6)' : '#fff',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'ChillRoundF, sans-serif'
          }}>
            {content.titleSizeAdjust > 0 ? `+${content.titleSizeAdjust}px` : content.titleSizeAdjust < 0 ? `${content.titleSizeAdjust}px` : 'Default'}
          </div>
          <button
            onClick={() => onChange({ ...content, titleSizeAdjust: Math.min(10, content.titleSizeAdjust + 1) })}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1.5px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            +
          </button>
        </div>
        <input
          type="range"
          min={-10}
          max={10}
          step={1}
          value={content.titleSizeAdjust}
          onChange={e => onChange({ ...content, titleSizeAdjust: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#FF2C19', cursor: 'pointer' }}
        />
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'PingFang SC, sans-serif', margin: 0, lineHeight: 1.4 }}>
          副标题固定 PingFang 12px，不受此影响
        </p>
      </div>
    </div>
  )
}
