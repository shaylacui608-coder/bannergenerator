import { useState, useRef } from 'react'
import { CATEGORY_CONFIG, type UnifiedAsset } from '../lib/unified-assets'
import { useAssetManager } from '../lib/asset-manager'

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>

interface AssetLibraryProps {
  campaignId: string
}

export function AssetLibrary({ campaignId }: AssetLibraryProps) {
  const { assets, selectedAssets, moveAsset, uploadAsset, deleteAsset, toggleHero, toggleDecor, toggleBackground } = useAssetManager(campaignId)
  const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: 'hero' | 'decor' | 'background'
  ) => {
    const files = e.target.files
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
          await uploadAsset(file, category)
        }
      }
      e.target.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {CATEGORIES.map(cat => {
        const config = CATEGORY_CONFIG[cat]
        const items = assets.filter(a => a.category === cat)

        const handleDragOver = (e: React.DragEvent) => {
          e.preventDefault()
        }

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault()
          const assetId = e.dataTransfer.getData('text/plain')
          if (assetId) {
            moveAsset(assetId, cat)
            setDraggedAssetId(null)
          }
        }

        const handleToggle = (assetId: string) => {
          if (cat === 'hero') {
            toggleHero(assetId)
          } else if (cat === 'decor') {
            toggleDecor(assetId)
          } else if (cat === 'background') {
            toggleBackground(assetId)
          }
        }

        const isSelected = (assetId: string): boolean => {
          if (cat === 'hero') {
            return selectedAssets.hero === assetId
          } else if (cat === 'decor') {
            return selectedAssets.decor.includes(assetId)
          } else if (cat === 'background') {
            return selectedAssets.background.includes(assetId)
          }
          return false
        }

        return (
          <div key={cat}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, DouyinSans, sans-serif' }}>
                  {config.label}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'ChillRoundF, sans-serif' }}>
                  {cat === 'hero' ? (selectedAssets.hero ? '(已选 1 个)' : '(未选择)') : `(已选 ${cat === 'decor' ? selectedAssets.decor.length : selectedAssets.background.length} 个)`}
                </span>
              </div>
              <input
                ref={(el) => (fileInputRefs.current[cat] = el)}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e, cat)}
              />
              <button
                onClick={() => fileInputRefs.current[cat]?.click()}
                style={{
                  fontSize: 10,
                  padding: '4px 8px',
                  borderRadius: 4,
                  backgroundColor: config.color,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + 上传
              </button>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                minHeight: '60px',
                padding: '8px',
                borderRadius: '8px',
                border: draggedAssetId ? `2px dashed ${config.color}` : '2px solid transparent',
                background: draggedAssetId ? `${config.color}11` : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {items.length === 0 && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'ChillRoundF, sans-serif', padding: '6px 4px' }}>
                  暂无素材，拖拽素材到这里
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {items.map(asset => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    accentColor={config.color}
                    onDragStart={() => setDraggedAssetId(asset.id)}
                    onDragEnd={() => setDraggedAssetId(null)}
                    onDelete={() => deleteAsset(asset.id)}
                    onToggle={() => handleToggle(asset.id)}
                    isSelected={isSelected(asset.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface AssetCardProps {
  asset: any
  accentColor: string
  onDragStart: () => void
  onDragEnd: () => void
  onDelete: () => void
  onToggle: () => void
  isSelected: boolean
}

function AssetCard({ asset, accentColor, onDragStart, onDragEnd, onDelete, onToggle, isSelected }: AssetCardProps) {
  const isUserUploaded = 'isUserUploaded' in asset

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={onToggle}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', asset.id)
          onDragStart()
        }}
        onDragEnd={onDragEnd}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          borderRadius: 8,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          border: isSelected ? `3px solid ${accentColor}` : '1px solid rgba(255,255,255,0.3)',
          cursor: 'pointer',
          boxSizing: 'border-box',
          boxShadow: isSelected ? `0 0 8px ${accentColor}55` : 'none',
        }}
      >
        <div style={{ width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'rgba(255,255,255,0.9)', borderRadius: 4 }}>
          <img src={asset.path} alt={asset.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
        </div>
      </div>

      {isUserUploaded && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('确定要删除这个素材吗？')) {
              onDelete()
            }
          }}
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            fontSize: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
