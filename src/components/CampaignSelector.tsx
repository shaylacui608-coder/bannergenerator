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
          onClick={() => onSelect(c.id)}
          style={{
            background: selected === c.id ? c.colors.primary : 'rgba(255,255,255,0.05)',
            color: selected === c.id ? '#fff' : 'rgba(255,255,255,0.8)',
            border: selected === c.id ? `2px solid ${c.colors.primary}` : '2px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'ChillRoundF, sans-serif',
            transition: 'all 0.15s',
          }}
        >
          {c.name}
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
