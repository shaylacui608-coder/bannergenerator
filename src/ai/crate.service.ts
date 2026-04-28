import type { AIService, AIGenerationRequest, AIGenerationResponse, AIServiceConfig } from './types'

const CRATE_CONFIG: AIServiceConfig = {
  name: 'Crate 工作流',
  description: '连接你在 Crate 中搭建的自定义工作流',
  requiresApiKey: true,
  supportsImageReference: true
}

export class CrateService implements AIService {
  getConfig(): AIServiceConfig {
    return CRATE_CONFIG
  }

  validateConfig(config: Record<string, string>): boolean {
    return !!config.customEndpoint && config.customEndpoint.length > 0
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const endpoint = request.customEndpoint || ''
    const apiKey = request.apiKey || ''

    const payload: any = {
      prompt: request.prompt,
      negative_prompt: request.negativePrompt,
      width: request.size.width,
      height: request.size.height,
      count: request.count || 1,
      size: request.size
    }

    if (request.referenceImages && request.referenceImages.length > 0) {
      payload.reference_images = request.referenceImages
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}`, 'X-API-Key': apiKey } : {})
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Crate 工作流请求失败: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    let images: string[] = []
    
    if (Array.isArray(data.images)) {
      images = data.images
    } else if (Array.isArray(data.outputs)) {
      images = data.outputs
    } else if (Array.isArray(data.results)) {
      images = data.results
    } else if (data.image) {
      images = [data.image]
    } else if (data.url) {
      images = [data.url]
    } else if (typeof data === 'string') {
      images = [data]
    }

    return {
      images,
      prompt: request.prompt,
      service: 'crate'
    }
  }
}
