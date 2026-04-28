import { useState, useRef } from 'react'
import { AIServiceFactory, type AIServiceType, type BannerSize, type AIGenerationRequest } from '../ai'

const BANNER_SIZES: BannerSize[] = [
  { id: 'app-banner', label: 'APP 首页 Banner', width: 343, height: 72, platform: 'app' },
  { id: 'app-warm', label: 'APP 商机中心', width: 351, height: 66, platform: 'app' },
  { id: 'app-frame', label: 'APP 商品助手画框', width: 359, height: 329, platform: 'app' },
  { id: 'app-full', label: 'APP 全屏背景', width: 375, height: 812, platform: 'app' },
  { id: 'pc-slim', label: 'PC 超细通栏', width: 1104, height: 72, platform: 'pc' },
  { id: 'pc-grid', label: 'PC 四宫格画框', width: 876, height: 389, platform: 'pc' },
  { id: 'custom', label: '自定义尺寸', width: 1024, height: 1024, platform: 'pc' }
]

interface AIGeneratorProps {
  onGenerate: (images: string[], config: AIGenerationRequest) => void
  isGenerating: boolean
}

export function AIGenerator({ onGenerate, isGenerating }: AIGeneratorProps) {
  const [selectedService, setSelectedService] = useState<AIServiceType>('proxy')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedSize, setSelectedSize] = useState<BannerSize>(BANNER_SIZES[0])
  const [customWidth, setCustomWidth] = useState(1024)
  const [customHeight, setCustomHeight] = useState(1024)
  const [apiKey, setApiKey] = useState('')
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [imageCount, setImageCount] = useState(1)
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const serviceConfig = AIServiceFactory.getServiceConfig(selectedService)
  const availableServices = AIServiceFactory.getAvailableServices()

  const currentSize = selectedSize.id === 'custom' 
    ? { ...selectedSize, width: customWidth, height: customHeight }
    : selectedSize

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setReferenceImages(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    const request: AIGenerationRequest = {
      service: selectedService,
      prompt,
      negativePrompt,
      size: currentSize,
      count: imageCount,
      referenceImages,
      apiKey,
      customEndpoint
    }
    onGenerate([], request)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
          AI 服务
        </div>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value as AIServiceType)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'ChillRoundF, sans-serif',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff'
          }}
        >
          <option value="proxy">🎯 AI 代理服务 (推荐) - 无需 API Key</option>
          <optgroup label="其他服务">
            {availableServices.filter(s => s !== 'proxy').map(service => {
              const config = AIServiceFactory.getServiceConfig(service)
              return (
                <option key={service} value={service}>
                  {config.name}
                </option>
              )
            })}
          </optgroup>
        </select>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: 'ChillRoundF, sans-serif' }}>
          {serviceConfig.description}
        </p>
      </div>

      {serviceConfig.requiresApiKey && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
            API Key
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入 API Key"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'ChillRoundF, sans-serif',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff'
            }}
          />
        </div>
      )}

      {selectedService !== 'openai' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
            自定义端点 (可选)
          </div>
          <input
            type="text"
            value={customEndpoint}
            onChange={(e) => setCustomEndpoint(e.target.value)}
            placeholder={serviceConfig.defaultEndpoint || 'https://your-api-endpoint.com'}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'ChillRoundF, sans-serif',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff'
            }}
          />
        </div>
      )}

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
          描述 (Prompt)
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的 Banner 图片，例如：'节日促销 Banner，红色主题，喜庆，购物，电商风格..."
          rows={4}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'ChillRoundF, sans-serif',
            resize: 'vertical',
            minHeight: 100,
            background: 'rgba(255,255,255,0.05)',
            color: '#fff'
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
          负面描述 (可选)
        </div>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="描述你不想要在图片中出现的内容"
          rows={2}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'ChillRoundF, sans-serif',
            resize: 'vertical',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff'
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
          Banner 尺寸
        </div>
        <select
          value={selectedSize.id}
          onChange={(e) => setSelectedSize(BANNER_SIZES.find(s => s.id === e.target.value)!)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'ChillRoundF, sans-serif',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff'
          }}
        >
          {BANNER_SIZES.map(size => (
            <option key={size.id} value={size.id}>
              {size.label} ({size.width}x{size.height})
            </option>
          ))}
        </select>
        {selectedSize.id === 'custom' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>宽度</label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1024)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'ChillRoundF, sans-serif',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>高度</label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1024)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'ChillRoundF, sans-serif',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff'
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
          生成数量
        </div>
        <select
          value={imageCount}
          onChange={(e) => setImageCount(parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'ChillRoundF, sans-serif',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff'
          }}
        >
          {[1, 2, 3, 4].map(n => (
            <option key={n} value={n}>{n} 张</option>
          ))}
        </select>
      </div>

      {serviceConfig.supportsImageReference && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontFamily: 'ChillRoundF, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>
            参考素材 (可选)
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'ChillRoundF, sans-serif',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)'
            }}
          >
            📤 上传参考图片
          </button>
          {referenceImages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {referenceImages.map((img, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={img}
                  alt={`参考 ${index + 1}`}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                />
                <button
                  onClick={() => removeReferenceImage(index)}
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#FF2C19',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: isGenerating || !prompt ? 'rgba(255,255,255,0.2)' : '#FF2C19',
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'ChillRoundF, sans-serif',
          cursor: isGenerating || !prompt ? 'not-allowed' : 'pointer',
          color: '#fff'
        }}
      >
        {isGenerating ? '🎨 生成中...' : '🎨 开始生成'}
      </button>
    </div>
  )
}
