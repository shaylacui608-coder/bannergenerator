import type { AIService, AIServiceType } from './types'
import { OpenAIService } from './openai.service'
import { StableDiffusionService } from './stable-diffusion.service'
import { CustomAIService } from './custom.service'
import { CrateService } from './crate.service'
import { ProxyService } from './proxy.service'
import { CozeWorkflowService } from './coze-workflow.service'

const serviceRegistry: Record<AIServiceType, new () => AIService> = {
  'proxy': ProxyService,
  'coze': ProxyService,
  'coze-workflow': CozeWorkflowService,
  'openai': OpenAIService,
  'stable-diffusion': StableDiffusionService,
  'midjourney': OpenAIService,
  'custom': CustomAIService,
  'crate': CrateService
}

export class AIServiceFactory {
  static createService(type: AIServiceType): AIService {
    const ServiceClass = serviceRegistry[type]
    if (!ServiceClass) {
      throw new Error(`不支持的 AI 服务类型: ${type}`)
    }
    return new ServiceClass()
  }

  static getAvailableServices(): AIServiceType[] {
    return Object.keys(serviceRegistry) as AIServiceType[]
  }

  static getServiceConfig(type: AIServiceType) {
    const service = this.createService(type)
    return service.getConfig()
  }
}
