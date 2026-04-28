import type { 
  AIService, 
  AIServiceConfig,
  CozeWorkflowRequest,
  CozeWorkflowResponse
} from './types'

const COZE_WORKFLOW_CONFIG: AIServiceConfig = {
  name: '🎯 Coze 完整套图生成',
  description: '一键生成全套 Banner 物料，自动分发到对应点位！',
  requiresApiKey: false,
  supportsImageReference: true
}

const DEFAULT_PROXY_URL = 'http://localhost:3001'

export class CozeWorkflowService implements AIService {
  private proxyUrl: string
  private apiKey?: string

  constructor(config?: { proxyUrl?: string; apiKey?: string }) {
    this.proxyUrl = config?.proxyUrl || DEFAULT_PROXY_URL
    this.apiKey = config?.apiKey
  }

  getConfig(): AIServiceConfig {
    return COZE_WORKFLOW_CONFIG
  }

  validateConfig(_config: Record<string, string>): boolean {
    return true // 代理服务不需要额外配置
  }

  // 单图生成（兼容旧接口）
  async generate(): Promise<never> {
    throw new Error('请使用 generateWorkflow 方法调用完整套图生成')
  }

  // 完整套图生成
  async generateWorkflow(request: CozeWorkflowRequest): Promise<CozeWorkflowResponse> {
    console.log('Calling Coze Workflow via proxy...', {
      proxyUrl: this.proxyUrl,
      request
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // 如果有apiKey，添加到请求头
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(`${this.proxyUrl}/api/coze-workflow`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Coze Workflow 请求失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('Proxy response:', data)
    return data
  }
}
