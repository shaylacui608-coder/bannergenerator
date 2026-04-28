import type { AIService, AIGenerationRequest, AIGenerationResponse, AIServiceConfig, AIServiceType } from './types'

const PROXY_CONFIG: AIServiceConfig = {
  name: '🎯 AI 代理服务 (推荐)',
  description: '通过后端代理调用 AI 服务，无需配置 API Key，一键生成！',
  requiresApiKey: false,
  supportsImageReference: true
}

const DEFAULT_PROXY_URL = 'http://localhost:3001'

export class ProxyService implements AIService {
  private proxyUrl: string

  constructor(proxyUrl?: string) {
    this.proxyUrl = proxyUrl || DEFAULT_PROXY_URL
  }

  getConfig(): AIServiceConfig {
    return PROXY_CONFIG
  }

  validateConfig(_config: Record<string, string>): boolean {
    return true // 代理服务不需要额外配置
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    // 使用 proxy 服务时，默认调用后端的 coze 服务（因为已经配置好了）
    const targetService = request.service === 'proxy' ? 'coze' : request.service
    
    const payload = {
      service: targetService,
      prompt: request.prompt,
      negative_prompt: request.negativePrompt,
      size: request.size,
      count: request.count || 1
    }

    if (request.referenceImages && request.referenceImages.length > 0) {
      ;(payload as any).reference_images = request.referenceImages
    }

    const response = await fetch(`${this.proxyUrl}/api/generate/${targetService}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `代理服务请求失败: ${response.status}`)
    }

    const data = await response.json()

    return {
      images: data.images || [],
      prompt: request.prompt,
      service: data.service || request.service
    }
  }

  async getAvailableServices(): Promise<Array<{ id: AIServiceType; name: string; enabled: boolean }>> {
    try {
      const response = await fetch(`${this.proxyUrl}/api/services`)
      if (response.ok) {
        const data = await response.json()
        return (data.services || []).map((s: any) => ({ ...s, id: s.id as AIServiceType }))
      }
    } catch (error) {
      console.error('Failed to fetch available services:', error)
    }
    return []
  }
}
