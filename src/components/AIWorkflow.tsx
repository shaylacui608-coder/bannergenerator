import { useState, useCallback } from 'react'
import { AIGenerator } from './AIGenerator'
import { AIGallery } from './AIGallery'
import { AIServiceFactory, type AIGenerationRequest, type AIGenerationResponse } from '../ai'

export function AIWorkflow() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [lastRequest, setLastRequest] = useState<AIGenerationRequest | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async (_: string[], request: AIGenerationRequest) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const service = AIServiceFactory.createService(request.service)
      const response: AIGenerationResponse = await service.generate(request)
      
      setGeneratedImages(response.images)
      setLastRequest(request)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请检查配置')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleRegenerate = useCallback(() => {
    if (lastRequest) {
      handleGenerate([], lastRequest)
    }
  }, [lastRequest, handleGenerate])

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <style>{`
        .liquid-glass {
          background: rgba(255,255,255,0.05);
          background-blend-mode: luminosity;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
        }
      `}</style>
      
      <div className="liquid-glass" style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', gap: 24, backdropFilter: 'blur(20px)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'ChillRoundF, sans-serif' }}>
            🤖 AI Banner 生成器
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'ChillRoundF, sans-serif' }}>
            上传素材、填写规范，AI 帮你生成精美 Banner
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        <div className="liquid-glass" style={{ 
          width: 380, 
          padding: 24, 
          overflowY: 'auto',
          flexShrink: 0,
          backdropFilter: 'blur(20px)'
        }}>
          <AIGenerator 
            onGenerate={handleGenerate} 
            isGenerating={isGenerating}
          />
          
          {error && (
            <div className="liquid-glass" style={{ 
              marginTop: 20, 
              padding: 16, 
              borderRadius: 12,
              color: '#ff6b6b',
              fontSize: 14,
              fontFamily: 'ChillRoundF, sans-serif'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        <div style={{ 
          flex: 1, 
          padding: 32, 
          overflowY: 'auto'
        }}>
          {generatedImages.length > 0 ? (
            <AIGallery 
              images={generatedImages} 
              onRegenerate={handleRegenerate}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: 'rgba(255,255,255,0.6)'
            }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🎨</div>
              <p style={{ fontSize: 18, fontFamily: 'ChillRoundF, sans-serif', fontWeight: 600, color: '#fff' }}>
                开始你的 AI 创作之旅
              </p>
              <p style={{ fontSize: 14, fontFamily: 'ChillRoundF, sans-serif', marginTop: 8, color: 'rgba(255,255,255,0.6)' }}>
                在左侧填写信息，点击「开始生成」按钮
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
