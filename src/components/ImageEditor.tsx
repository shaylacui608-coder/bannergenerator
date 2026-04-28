import { useState } from 'react'

interface ImageEditorProps {
  image: string
  onSave: (editedImage: string) => void
  onClose: () => void
}

interface Filters {
  brightness: number
  contrast: number
  saturation: number
  blur: number
}

export function ImageEditor({ image, onSave, onClose }: ImageEditorProps) {
  const [filters, setFilters] = useState<Filters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  })
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)

  const filterStyle = {
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`,
    transform: `rotate(${rotation}deg) scale(${scale})`
  }

  const handleReset = () => {
    setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 })
    setRotation(0)
    setScale(1)
  }

  const handleSave = () => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.filter = filterStyle.filter
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(scale, scale)
        ctx.drawImage(img, -img.width / 2, -img.height / 2)
        ctx.restore()
        onSave(canvas.toDataURL('image/png'))
      }
    }
    img.src = image
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.8)', 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        background: '#fff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: 'ChillRoundF, sans-serif' }}>
          🎨 图片编辑器
        </h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'ChillRoundF, sans-serif'
            }}
          >
            重置
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#FF2C19',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'ChillRoundF, sans-serif',
              color: '#fff'
            }}
          >
            保存
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'ChillRoundF, sans-serif'
            }}
          >
            关闭
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: 40,
          overflow: 'auto'
        }}>
          <img
            src={image}
            alt="编辑中"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              ...filterStyle
            }}
          />
        </div>

        <div style={{ 
          width: 300, 
          background: '#fff',
          padding: 24,
          borderLeft: '1px solid #eee',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginBottom: 12, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
                滤镜调整
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>亮度</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{filters.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => setFilters(f => ({ ...f, brightness: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>对比度</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{filters.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => setFilters(f => ({ ...f, contrast: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>饱和度</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{filters.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => setFilters(f => ({ ...f, saturation: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>模糊</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{filters.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.blur}
                  onChange={(e) => setFilters(f => ({ ...f, blur: parseInt(e.target.value) }))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginBottom: 12, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
                变换
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>旋转</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>缩放</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
