import type { AIService, AIGenerationRequest, AIGenerationResponse, AIServiceConfig } from './types'

const SD_CONFIG: AIServiceConfig = {
  name: 'Stable Diffusion',
  description: '使用 Stable Diffusion WebUI API 生成图片',
  requiresApiKey: false,
  supportsImageReference: true,
  defaultEndpoint: 'http://127.0.0.1:7860'
}

export class StableDiffusionService implements AIService {
  getConfig(): AIServiceConfig {
    return SD_CONFIG
  }

  validateConfig(config: Record<string, string>): boolean {
    return !!config.customEndpoint && config.customEndpoint.length > 0
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const endpoint = request.customEndpoint || SD_CONFIG.defaultEndpoint || ''

    const payload: any = {
      prompt: request.prompt,
      negative_prompt: request.negativePrompt || '',
      width: request.size.width,
      height: request.size.height,
      steps: 30,
      cfg_scale: 7,
      sampler_name: 'DPM++ 2M Karras',
      batch_size: Math.min(request.count || 1, 4)
    }

    if (request.referenceImages && request.referenceImages.length > 0) {
      payload.init_images = request.referenceImages
      payload.denoising_strength = 0.75
    }

    const response = await fetch(`${endpoint}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Stable Diffusion API 请求失败')
    }

    const data = await response.json()
    const images = data.images.map((img: string) => `data:image/png;base64,${img}`)

    return {
      images,
      prompt: request.prompt,
      service: 'stable-diffusion'
    }
  }
}
