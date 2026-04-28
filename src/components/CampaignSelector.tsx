import type { CampaignConfig } from '../types'

interface Props {
  campaigns: CampaignConfig[]
  selected: string
  onSelect: (id: string) => void
}

export function CampaignSelector({ campaigns, selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 flex-wrap">
      {campaigns.map(c => (
        <button
          key={c.id}
          onClick={() => {
            if (c.disabled) {
              alert('该场景暂未开放，敬请期待！')
              return
            }
            onSelect(c.id)
          }}
          style={{
            background: c.disabled ? 'rgba(255,255,255,0.03)' : (selected === c.id ? c.colors.primary : 'rgba(255,255,255,0.05)'),
            color: c.disabled ? 'rgba(255,255,255,0.4)' : (selected === c.id ? '#fff' : 'rgba(255,255,255,0.8)'),
            border: c.disabled ? '2px solid rgba(255,255,255,0.08)' : (selected === c.id ? `2px solid ${c.colors.primary}` : '2px solid rgba(255,255,255,0.1)'),
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: 15,
            fontWeight: 700,
            cursor: c.disabled ? 'not-allowed' : 'pointer',
            fontFamily: 'ChillRoundF, sans-serif',
            transition: 'all 0.15s',
            opacity: c.disabled ? 0.6 : 1,
          }}
          disabled={c.disabled}
          title={c.disabled ? '暂未开放' : undefined}
        >
          {c.name}
          {c.disabled && <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.8 }}>(即将上线)</span>}
        </button>
      ))}
      <button
        style={{
          background: 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.4)',
          border: '2px dashed rgba(255,255,255,0.2)',
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: 15,
          fontWeight: 500,
          cursor: 'not-allowed',
          fontFamily: 'ChillRoundF, sans-serif',
        }}
        disabled
        title="即将推出"
      >
        + 添加场景
      </button>
    </div>
  )
}
