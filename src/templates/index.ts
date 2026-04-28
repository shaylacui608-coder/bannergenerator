export { BannerSlim } from './BannerSlim'
export { BannerStandard } from './BannerStandard'
export { BannerWarm } from './BannerWarm'
export { BannerCard } from './BannerCard'
export { FrameModule } from './FrameModule'
export { FrameModulePc } from './FrameModulePc'
export { FrameSingle } from './FrameSingle'
export { FrameTitled } from './FrameTitled'
export { FrameGrid } from './FrameGrid'
export { BackgroundArc } from './BackgroundArc'
export { BackgroundSimple } from './BackgroundSimple'
export { BackgroundActivity } from './BackgroundActivity'
export { BackgroundActivityPc } from './BackgroundActivityPc'

import type { TemplateId, TemplateProps } from '../types'
import { BannerSlim } from './BannerSlim'
import { BannerStandard } from './BannerStandard'
import { BannerWarm } from './BannerWarm'
import { BannerCard } from './BannerCard'
import { FrameModule } from './FrameModule'
import { FrameModulePc } from './FrameModulePc'
import { FrameSingle } from './FrameSingle'
import { FrameTitled } from './FrameTitled'
import { FrameGrid } from './FrameGrid'
import { BackgroundArc } from './BackgroundArc'
import { BackgroundSimple } from './BackgroundSimple'
import { BackgroundActivity } from './BackgroundActivity'
import { BackgroundActivityPc } from './BackgroundActivityPc'
import type React from 'react'

export const TEMPLATE_REGISTRY: Record<TemplateId, React.FC<TemplateProps>> = {
  'banner-slim': BannerSlim,
  'banner-standard': BannerStandard,
  'banner-warm': BannerWarm,
  'banner-card': BannerCard,
  'frame-module': FrameModule,
  'frame-module-pc': FrameModulePc,
  'frame-single': FrameSingle,
  'frame-titled': FrameTitled,
  'frame-grid': FrameGrid,
  'background-arc': BackgroundArc,
  'background-simple': BackgroundSimple,
  'background-activity': BackgroundActivity,
  'background-activity-pc': BackgroundActivityPc,
}

export type Platform = 'app' | 'pc'
export type Section = 'banner' | 'home-banner' | 'frame' | 'product-page' | 'promo-page' | 'background'

export interface ContextPreview {
  /** Path to the app-screen background image (relative to /public). Omit when the template itself is the background. */
  image?: string
  /** Native CSS-pixel dimensions of the background / template area */
  bgWidth: number
  bgHeight: number
  /** Where to place the top-left corner of the template on the background */
  x: number
  y: number
  /** Scale applied to the whole context preview for display (default 1.0) */
  displayScale?: number
  /** Optional image overlaid on top of everything (UI chrome / page frame) */
  overlay?: string
  /** Overlay offset from the left edge in template px (default 0) */
  overlayX?: number
  /** Overlay offset from the top edge in template px (default 0) */
  overlayY?: number
  /** Overlay width in CSS px (default 351) */
  overlayWidth?: number
  /** Overlay height in CSS px (default 350) */
  overlayHeight?: number
}

export interface CompositeWith {
  /** Template to render as the full-page background behind this template */
  templateId: TemplateId
  /** Where to place the top-left corner of the foreground template on the background */
  x: number
  y: number
  /** Scale applied to the whole composite for display (default 1.0) */
  displayScale?: number
  /** Optional image to overlay on top of the entire composite (UI chrome / context frame) */
  overlay?: string
}

export interface TemplateInfo {
  label: string
  width: number
  height: number
  platform: Platform
  section: Section
  /** Preview scale: 1.0 for all */
  previewScale: number
  /** Optional: show template placed inside an app-screen background image */
  contextPreview?: ContextPreview
  /** Optional: render another template as the background layer (live composite) */
  compositeWith?: CompositeWith
}

export const TEMPLATE_INFO: Record<TemplateId, TemplateInfo> = {
  'banner-slim': { label: '超细通栏', width: 1104, height: 72, platform: 'pc', section: 'banner', previewScale: 1.0 },
  'banner-card': {
    label: '商机中心PC横幅', width: 1056, height: 468, platform: 'pc', section: 'banner', previewScale: 1.0,
    contextPreview: {
      image: '/assets/context/daily_商机中心_PC背景.png',
      bgWidth: 1440, bgHeight: 900,
      x: 282, y: 296,
      displayScale: 0.5,
      overlay: '/assets/context/daily_商机中心_PC覆盖.png',
      overlayX: 294,
      overlayY: 370,
      overlayWidth: 1032,
      overlayHeight: 382,
    },
  },
  'banner-standard': {
    label: '首页banner', width: 359, height: 80, platform: 'app', section: 'home-banner', previewScale: 1.0,
    contextPreview: { image: '/assets/context/标准横幅背景.png', bgWidth: 375, bgHeight: 812, x: 8, y: 592, displayScale: 1.0 }
  },
  'banner-warm': {
    label: '暖色横幅', width: 351, height: 66, platform: 'app', section: 'banner', previewScale: 1.0,
    contextPreview: {
      image: '/assets/context/daily_商机中心APP背景.jpg',
      bgWidth: 375, bgHeight: 812,
      x: 12, y: 244,
      displayScale: 1.0
    }
  },
  'frame-module': {
    label: 'APP活动模块', width: 359, height: 395, platform: 'app', section: 'promo-page', previewScale: 1.0,
    contextPreview: {
      image: '/assets/context/daily_模块_APP背景.png',
      bgWidth: 375, bgHeight: 812,
      x: 8, y: 296,
      displayScale: 1.0,
      overlay: '/assets/context/daily_模块_APP覆盖.png',
      overlayX: 12,
      overlayY: 337,
      overlayWidth: 351,
      overlayHeight: 350,
    },
  },
  'frame-module-pc': {
    label: 'PC活动模块', width: 876, height: 409, platform: 'pc', section: 'promo-page', previewScale: 1.0,
    contextPreview: {
      image: '/assets/context/daily_模块_PC背景.png',
      bgWidth: 1440, bgHeight: 900,
      x: 532, y: 326,
      displayScale: 0.5,
      overlay: '/assets/context/daily_模块_PC覆盖.png',
      overlayX: 548,
      overlayY: 371,
      overlayWidth: 844,
      overlayHeight: 328,
    },
  },
  'frame-single': {
    label: '单列画框', width: 351, height: 329, platform: 'app', section: 'product-page', previewScale: 1.0,
    contextPreview: { image: '/assets/context/app-screen_1.png', bgWidth: 375, bgHeight: 812, x: 12, y: 296, displayScale: 1.0 }
  },
  'frame-titled': {
    label: '大促首页模块', width: 359, height: 329, platform: 'app', section: 'promo-page', previewScale: 1.0,
    compositeWith: { templateId: 'background-arc', x: 8, y: 374, displayScale: 0.75 }
  },
  'frame-grid': { label: '四宫格画框', width: 876, height: 389, platform: 'pc', section: 'frame', previewScale: 1.0 },
  'background-arc': { label: '弧形背景', width: 375, height: 812, platform: 'app', section: 'background', previewScale: 1.0 },
  'background-simple': { label: '简洁背景', width: 375, height: 812, platform: 'app', section: 'background', previewScale: 1.0 },
  'background-activity-pc': {
    label: 'PC活动页背景', width: 480, height: 900, platform: 'pc', section: 'background', previewScale: 1.0,
    contextPreview: {
      image: '/assets/context/daily_活动页_PC背景.png',
      bgWidth: 1440, bgHeight: 900,
      x: 960, y: 0,
      displayScale: 0.4,
      overlay: '/assets/context/daily_活动页_PC覆盖.png',
      overlayX: 960,
      overlayY: 27,
      overlayWidth: 480,
      overlayHeight: 880,
    },
  },
  'background-activity': {
    label: 'APP活动页背景', width: 375, height: 938, platform: 'app', section: 'background', previewScale: 1.0,
    contextPreview: {
      bgWidth: 375, bgHeight: 887,
      x: 0, y: 0,
      displayScale: 1.0,
      overlay: '/assets/context/daily_活动页_APP覆盖.png',
      overlayX: 0, overlayY: 43,
      overlayWidth: 375,
      overlayHeight: 887,
    },
  },
}

export const ALL_TEMPLATE_IDS: TemplateId[] = [
  'banner-slim',
  'banner-standard',
  'banner-warm',
  'frame-single',
  'frame-titled',
  'frame-grid',
  'background-arc',
  'background-simple',
]

/** Templates grouped by platform then section */
export const DEFAULT_TEMPLATE_GROUPS: Record<Platform, Partial<Record<Section, TemplateId[]>>> = {
  app: {
    'home-banner': ['banner-standard'],
    banner: ['banner-warm'],
    'product-page': ['frame-single'],
    'promo-page': ['frame-titled'],
  },
  pc: {
    banner: ['banner-slim'],
    frame: ['frame-grid'],
  },
}

export const DEFAULT_SECTION_LABELS: Record<Section, string> = {
  'home-banner': '首页banner',
  banner: '商机中心',
  frame: '画框',
  'product-page': '商品助手页',
  'promo-page': '大促首页模块',
  background: '背景',
}

export const DEFAULT_SECTIONS: Section[] = [
  'home-banner',
  'banner',
  'product-page',
  'promo-page',
  'frame',
]

// 为了向后兼容，保持原有的 TEMPLATE_GROUPS 和 SECTION_LABELS
export const TEMPLATE_GROUPS = DEFAULT_TEMPLATE_GROUPS
export const SECTION_LABELS = DEFAULT_SECTION_LABELS
