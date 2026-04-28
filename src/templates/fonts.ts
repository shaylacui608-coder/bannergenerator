import type { ColorPalette, UserContent } from '../types'

export const FONTS = {
  /** 主标题 — 上传的自定义字体（站酷庆科黄油体等） */
  title: "'ZhanKuButter', 'ChillRoundF', sans-serif",
  /** 活动名称 / 品牌文字 — 上传的自定义字体 */
  brand: "'DouyinSans', 'ChillRoundF', sans-serif",
  /** 副标题 — 系统 PingFang，固定 */
  subtitle: "'PingFang SC', 'Helvetica Neue', 'Noto Sans SC', sans-serif",
  /** 标签 Pills、CTA 按钮、UI 文字 */
  ui: "'ChillRoundF', sans-serif",
}

/** 合并默认颜色和用户自定义颜色 */
export function mergeColors(defaultColors: ColorPalette, customColors?: Partial<ColorPalette>): ColorPalette {
  return { ...defaultColors, ...customColors }
}

/** 获取当前使用的字体 */
export function getFonts(userContent?: UserContent) {
  return {
    title: userContent?.fonts?.title || FONTS.title,
    brand: userContent?.fonts?.brand || FONTS.brand,
    subtitle: userContent?.fonts?.subtitle || FONTS.subtitle,
    ui: userContent?.fonts?.ui || FONTS.ui,
  }
}

/** 标题基础字号（各模板独立定义），titleSizeAdjust 叠加在上面 */
export function titleSize(base: number, adjust: number): number {
  return Math.max(base - 10, Math.min(base + 10, base + adjust))
}
