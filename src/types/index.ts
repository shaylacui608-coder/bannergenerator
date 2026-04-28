export interface ColorPalette {
  primary: string
  secondary: string
  yellow: string
  warmBg: string
  pink?: string
  lightPink?: string
  lightBlue?: string
  mint?: string
  textOnDark: string
  textOnLight: string
  gradients: string[][]
}

export interface DecorElementRule {
  id: string
  asset: string        // path under /assets/{campaignId}/
  label: string
  zone: { x: number[]; y: number[] }
  rotation: number[]
  scale: number[]
  flipX?: boolean
  zIndex?: number
  /** Base width in px before scale is applied, default 80 */
  baseSize?: number
  /** 是否用 translate(-50%, -50%) 居中对齐，默认 true */
  centered?: boolean
}

export interface SampledDecorElement {
  id: string
  asset: string
  x: number
  y: number
  rotation: number
  scale: number
  flipX: boolean
  zIndex: number
  baseSize: number
  centered?: boolean
}

export interface TemplateSlots {
  arcGroup?: string      // presets/arc-group.png — placed as-is
  bannerHero?: string    // presets/banner-hero.png
  bgPattern?: string     // B3 pattern
  mascot?: string        // small corner badge
  /**
   * 腰封 — 横跨画布的装饰性托架/舞台元素。
   * 每年样式不同，但放置规则固定（ZONE_YAOFENG）。
   * 提供 PNG 路径时渲染真实素材，留空时渲染内置 SVG 占位符。
   */
  yaofeng?: string
  decorElements: DecorElementRule[]
}

// 自定义 section 配置
export interface SectionConfig {
  sections: string[]
  sectionLabels: Record<string, string>
  templateGroups: Record<Platform, Partial<Record<string, TemplateId[]>>>
}

export interface FormConfig {
  showEventName?: boolean
  showTags?: boolean
  showSubtitle?: boolean
  showCta?: boolean
}

export interface CampaignConfig {
  id: string
  name: string
  colors: ColorPalette
  templateSlots: Record<TemplateId, TemplateSlots>
  defaultContent: UserContent
  sectionConfig?: SectionConfig
  formConfig?: FormConfig
  assets: {
    hero: Array<{ id: string; label: string; path: string }>
    decor: Array<{ id: string; label: string; path: string }>
    pattern: Array<{ id: string; label: string; path: string }>
  }
  assetManifest: any[]
  saveManifest: (campaignId: string, assets: any[]) => Promise<void>
  disabled?: boolean
}

export type TemplateId =
  | 'banner-slim'
  | 'banner-standard'
  | 'banner-warm'
  | 'banner-card'
  | 'frame-module'
  | 'frame-module-pc'
  | 'frame-single'
  | 'frame-titled'
  | 'frame-grid'
  | 'background-arc'
  | 'background-simple'
  | 'background-activity'
  | 'background-activity-pc'

export interface UserContent {
  eventName: string
  title: string
  subtitle: string
  cta: string
  tags: string[]
  gradientIndex: number
  /** Title font size adjust: -10 to +10, relative to each template's base size */
  titleSizeAdjust: number
  /** Custom color overrides */
  customColors?: Partial<ColorPalette>
  /** Font family choices */
  fonts?: {
    title?: string
    brand?: string
    subtitle?: string
    ui?: string
  }
}

export interface TemplateProps {
  campaignId: string
  colors: ColorPalette
  content: UserContent
  slots: TemplateSlots
  sampledDecor: SampledDecorElement[]
  /** Set to true when rendering for export (no scale transform) */
  forExport?: boolean
}
