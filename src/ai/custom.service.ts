import type { AIService, AIGenerationRequest, AIGenerationResponse, AIServiceConfig } from './types'

const CUSTOM_CONFIG: AIServiceConfig = {
  name: '自定义服务',
  description: '连接到任何兼容的图像生成 API',
  requiresApiKey: true,
  supportsImageReference: false
}

export class CustomAIService implements AIService {
  getConfig(): AIServiceConfig {
    return CUSTOM_CONFIG
  }

  validateConfig(config: Record<string, string>): boolean {
    return !!config.customEndpoint && config.customEndpoint.length > 0
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const endpoint = request.customEndpoint || ''
    const apiKey = request.apiKey || ''

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        width: request.size.width,
        height: request.size.height,
        count: request.count || 1
      })
    })

    if (!response.ok) {
      throw new Error('自定义 AI 服务请求失败')
    }

    const data = await response.json()
    const images = data.images || data.urls || [data.image || data.url]

    return {
      images,
      prompt: request.prompt,
      service: 'custom'
    }
  }
}
