import type { CampaignConfig } from '../types'

interface Props {
  campaigns: CampaignConfig[]
  selected: string
  onSelect: (id: string) => void
}

export function CampaignSelector({ campaigns, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {campaigns.map(c => {
        const isSelected = selected === c.id
        return (
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
              background: c.disabled
                ? 'var(--bg-panel)'
                : isSelected
                  ? c.colors.primary
                  : 'var(--bg-elevated)',
              color: c.disabled
                ? 'var(--text-lo)'
                : isSelected
                  ? '#fff'
                  : 'var(--text-mid)',
              border: c.disabled
                ? '1px solid var(--border-dim)'
                : isSelected
                  ? `1px solid ${c.colors.primary}`
                  : '1px solid var(--border-mid)',
              borderRadius: 8,
              padding: '7px 18px',
              fontSize: 14,
              fontWeight: isSelected ? 700 : 500,
              cursor: c.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'ChillRoundF, sans-serif',
              transition: 'all 0.15s',
              opacity: c.disabled ? 0.5 : 1,
            }}
            disabled={c.disabled}
            title={c.disabled ? '暂未开放' : undefined}
          >
            {c.name}
            {c.disabled && <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>(即将上线)</span>}
          </button>
        )
      })}
      <button
        style={{
          background: 'transparent',
          color: 'var(--text-lo)',
          border: '1px dashed var(--border-dim)',
          borderRadius: 8,
          padding: '7px 18px',
          fontSize: 13,
          fontWeight: 400,
          cursor: 'not-allowed',
          fontFamily: 'ChillRoundF, sans-serif',
          letterSpacing: '0.03em',
        }}
        disabled
        title="即将推出"
      >
        + 添加场景
      </button>
    </div>
  )
}
