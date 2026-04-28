import type { TemplateSlots } from '../../types'

const BASE = '/assets/2026-daily-prompotion'

const HEART = `${BASE}/heart.png`
const HEART_2 = `${BASE}/heart_2.png`

// ── Shared element blueprints ─────────────────────────────────────────────────
const heartTL = {
  id: 'heart-tl',
  asset: HEART,
  label: '心形-左上',
  zone: { x: [2, 12], y: [3, 12] },
  rotation: [-12, 12],
  scale: [0.10, 0.17],
  flipX: true,
  baseSize: 300,
  zIndex: 2,
}

const heartTR = {
  id: 'heart-tr',
  asset: HEART,
  label: '心形-右上',
  zone: { x: [78, 88], y: [3, 12] },
  rotation: [-12, 12],
  scale: [0.10, 0.17],
  flipX: false,
  baseSize: 300,
  zIndex: 2,
}

const heartBL = {
  id: 'heart-bl',
  asset: HEART_2,
  label: '心形2-左下',
  zone: { x: [3, 13], y: [78, 88] },
  rotation: [-15, 15],
  scale: [0.10, 0.17],
  flipX: true,
  baseSize: 300,
  zIndex: 1,
}

const heartBR = {
  id: 'heart-br',
  asset: HEART_2,
  label: '心形2-右下',
  zone: { x: [78, 88], y: [78, 88] },
  rotation: [-15, 15],
  scale: [0.10, 0.17],
  flipX: false,
  baseSize: 300,
  zIndex: 1,
}

export const templateSlots: Record<string, TemplateSlots> = {
  // ── 商机中心 ────────────────────────────────────────────────────────
  'banner-warm': {
    bannerHero: undefined,
    decorElements: [
      // Hero 左侧边缘 — 紧靠 Hero，画布上半区（Hero 在 x≈57%，不进文字区 x<57%）
      { ...heartTR, zone: { x: [64, 73], y: [60, 80] }, scale: [0.10, 0.17], rotation: [-12, 12] },
      // Hero 右侧区域 — 稍偏右，纵向伴随 Hero
      { ...heartBR, zone: { x: [88, 100], y: [48, 72] }, scale: [0.17, 0.27], rotation: [0, 12] },
    ],
  },
  'banner-card': {
    bannerHero: undefined,
    decorElements: [
      // 右上区域 — 靠近 Hero 顶部（Hero 在 x≈81%、y≈0-34%），不进文字区（x<63%）
      { ...heartTR, zone: { x: [75, 88], y: [2, 16] }, scale: [0.17, 0.22], rotation: [-12, 12] },
      // 右侧中部 — 稍低一些，纵向伴随 Hero
      { ...heartBR, zone: { x: [84, 96], y: [20, 36] }, scale: [0.17, 0.22], rotation: [-12, 12] },
    ],
  },

  // ── APP 模块 ──────────────────────────────────────────────────────
  'frame-module': {
    bannerHero: undefined,
    decorElements: [
      // 右上区域 — 靠近 Hero 顶部（Hero 在 x≈64%、y≈0-28%），不进文字区（x<60%）
      { ...heartTR, zone: { x: [64, 80], y: [2, 16] }, scale: [0.10, 0.17], rotation: [-12, 12] },
      // 右侧中部 — 稍低一些，纵向伴随 Hero
      { ...heartBR, zone: { x: [78, 93], y: [22, 38] }, scale: [0.10, 0.17], rotation: [-12, 12] },
    ],
  },

  // ── PC 模块 ───────────────────────────────────────────────────────
  'frame-module-pc': {
    bannerHero: undefined,
    decorElements: [
      // 右上区域 — 靠近 Hero 顶部（Hero 在 x≈82%、y≈0-35%），不进文字区（x<60%）
      { ...heartTR, zone: { x: [78, 90], y: [2, 18] }, scale: [0.10, 0.17], rotation: [-12, 12] },
      // 右侧中部 — 稍低一些，纵向伴随 Hero
      { ...heartBR, zone: { x: [85, 97], y: [24, 42] }, scale: [0.10, 0.17], rotation: [-12, 12] },
    ],
  },

  // ── APP 活动页背景 ────────────────────────────────────────────────
  // 仅顶部100px内，中心对称，透明度由模板层 mask-image 控制（15%→0%）
  'background-activity': {
    bannerHero: undefined,
    decorElements: [
      // 左侧，与右侧镜像对称
      { ...heartTL, zone: { x: [18, 38], y: [2, 9] }, scale: [0.10, 0.17], rotation: [-10, 10] },
      // 右侧，中心对称
      { ...heartTR, zone: { x: [62, 82], y: [2, 9] }, scale: [0.10, 0.17], rotation: [-10, 10] },
    ],
  },

  // ── PC 活动页背景 ────────────────────────────────────────────────
  // 仅顶部100px内，中心对称，透明度由模板层 mask-image 控制（15%→0%）
  'background-activity-pc': {
    bannerHero: undefined,
    decorElements: [
      // 左侧，与右侧镜像对称
      { ...heartTL, zone: { x: [18, 38], y: [2, 9] }, scale: [0.10, 0.17], rotation: [-10, 10] },
      // 右侧，中心对称
      { ...heartTR, zone: { x: [62, 82], y: [2, 9] }, scale: [0.10, 0.17], rotation: [-10, 10] },
    ],
  },

  // ── 大促首页模块（春节用，日常暂不使用）────────────────────────────
  'frame-titled': {
    decorElements: [],
  },
  'background-arc': {
    decorElements: [],
  },

  // ── 活动页 ────────────────────────────────────────────────────────
  'banner-standard': {
    bannerHero: undefined,
    decorElements: [
      { ...heartTL },
      { ...heartBR },
    ],
  },
  'banner-slim': {
    bannerHero: undefined,
    decorElements: [
      { ...heartTR },
      { ...heartBL },
    ],
  },

  // ── 通用 ─────────────────────────────────────────────────────────
  'background-simple': {
    decorElements: [],
  },
  'frame-single': {
    decorElements: [],
  },
  'frame-grid': {
    decorElements: [],
  },
}
