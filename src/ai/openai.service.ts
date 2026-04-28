import type { AIService, AIGenerationRequest, AIGenerationResponse, AIServiceConfig } from './types'

const OPENAI_CONFIG: AIServiceConfig = {
  name: 'OpenAI DALL-E',
  description: '使用 OpenAI DALL-E 3 生成高质量图片',
  requiresApiKey: true,
  supportsImageReference: false,
  defaultEndpoint: 'https://api.openai.com/v1/images/generations'
}

export class OpenAIService implements AIService {
  getConfig(): AIServiceConfig {
    return OPENAI_CONFIG
  }

  validateConfig(config: Record<string, string>): boolean {
    return !!config.apiKey && config.apiKey.length > 0
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const apiKey = request.apiKey || ''
    const endpoint = request.customEndpoint || OPENAI_CONFIG.defaultEndpoint || ''

    const sizeMap: Record<string, string> = {
      '1024x1024': '1024x1024',
      '1792x1024': '1792x1024',
      '1024x1792': '1024x1792'
    }

    let openAISize = '1024x1024'
    const requestedSize = `${request.size.width}x${request.size.height}`
    if (sizeMap[requestedSize]) {
      openAISize = sizeMap[requestedSize]
    } else if (request.size.width > request.size.height) {
      openAISize = '1792x1024'
    } else if (request.size.height > request.size.width) {
      openAISize = '1024x1792'
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: request.prompt,
        size: openAISize as any,
        n: Math.min(request.count || 1, 4),
        quality: 'standard',
        style: request.style === 'vivid' ? 'vivid' : 'natural'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API 请求失败')
    }

    const data = await response.json()
    const images = data.data.map((item: any) => item.url)

    return {
      images,
      prompt: request.prompt,
      service: 'openai'
    }
  }
}
