import type { UserContent, ColorPalette, FormConfig } from '../types'

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

      {/* Gradient selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, sans-serif' }}>
          渐变色方案
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {colors.gradients.map(([from, to], i) => (
            <button
              key={i}
              onClick={() => onChange({ ...content, gradientIndex: i })}
              title={`${from} → ${to}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${from}, ${to})`,
                border: content.gradientIndex === i ? '3px solid rgba(255,255,255,0.6)' : '3px solid transparent',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: content.gradientIndex === i ? '0 0 0 2px #000, 0 0 0 4px rgba(255,255,255,0.3)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

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
