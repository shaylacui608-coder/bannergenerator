export type AIServiceType = 'openai' | 'stable-diffusion' | 'midjourney' | 'custom' | 'crate' | 'coze' | 'coze-workflow' | 'proxy'

export interface BannerSize {
  id: string
  label: string
  width: number
  height: number
  platform: 'app' | 'pc'
}

export interface AIGenerationRequest {
  service: AIServiceType
  prompt: string
  negativePrompt?: string
  size: BannerSize
  style?: string
  count?: number
  referenceImages?: string[]
  apiKey?: string
  customEndpoint?: string
}

export interface AIGenerationResponse {
  images: string[]
  prompt: string
  service: AIServiceType
}

export interface AIServiceConfig {
  name: string
  description: string
  requiresApiKey: boolean
  supportsImageReference: boolean
  defaultEndpoint?: string
}

export interface AIService {
  generate(request: AIGenerationRequest): Promise<AIGenerationResponse>
  getConfig(): AIServiceConfig
  validateConfig(config: Record<string, string>): boolean
}

// ─────────────────────────────────────────────────────────────────
// Coze 完整套图生成
// ─────────────────────────────────────────────────────────────────

export interface CozeWorkflowElement {
  id: string
  label: string
  path: string       // 素材路径
  type: 'hero' | 'decor' | 'pattern'
}

export interface CozeWorkflowTarget {
  templateId: string   // 目标模板ID
  width: number
  height: number
}

export interface CozeWorkflowRequest {
  service: 'coze-workflow'
  // 活动信息
  eventName: string
  title: string
  subtitle: string
  cta: string
  tags: string[]
  // 素材
  heroElements: CozeWorkflowElement[]
  decorElements: CozeWorkflowElement[]
  patternElement?: CozeWorkflowElement
  // 生成规范
  prompt: string
  style?: string
  // 目标模板列表
  targets: CozeWorkflowTarget[]
  // 颜色
  colors: {
    primary: string
    gradients: Array<string[]>
  }
}

export interface CozeWorkflowResult {
  templateId: string
  imageData: string    // base64 图片
}

export interface CozeWorkflowResponse {
  success: boolean
  results: CozeWorkflowResult[]
  prompt: string
  error?: string
}
