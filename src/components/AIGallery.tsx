import { useState } from 'react'
import { ImageEditor } from './ImageEditor'
import { saveAs } from 'file-saver'

interface AIGalleryProps {
  images: string[]
  onRegenerate?: () => void
}

export function AIGallery({ images, onRegenerate }: AIGalleryProps) {
  const [editingImage, setEditingImage] = useState<string | null>(null)

  const handleDownload = (image: string, index: number) => {
    saveAs(image, `ai-banner-${index + 1}.png`)
  }

  const handleEditSave = (_editedImage: string) => {
    setEditingImage(null)
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <div>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: 'rgba(255,255,255,0.5)', 
          marginBottom: 16, 
          fontFamily: 'ChillRoundF, sans-serif', 
          letterSpacing: 1, 
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🎨 生成结果</span>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF2C19',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'ChillRoundF, sans-serif'
              }}
            >
              🔄 重新生成
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          {images.map((image, index) => (
            <div key={index} style={{ 
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              flex: '0 0 auto'
            }}>
              <img
                src={image}
                alt={`Banner ${index + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: 300,
                  borderRadius: 8,
                  objectFit: 'contain'
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => setEditingImage(image)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'ChillRoundF, sans-serif',
                    color: 'rgba(255,255,255,0.8)'
                  }}
                >
                  ✏️ 编辑
                </button>
                <button
                  onClick={() => handleDownload(image, index)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#FF2C19',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'ChillRoundF, sans-serif',
                    color: '#fff'
                  }}
                >
                  ⬇️ 下载
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingImage && (
        <ImageEditor
          image={editingImage}
          onSave={handleEditSave}
          onClose={() => setEditingImage(null)}
        />
      )}
    </>
  )
}
