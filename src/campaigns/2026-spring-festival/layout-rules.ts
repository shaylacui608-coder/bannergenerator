import type { TemplateSlots } from '../../types'

const BASE = '/assets/2026-spring-festival'
const B2   = `${BASE}/B2`
const B3   = `${BASE}/B3`
const B4   = `${BASE}/B4`

const PATTERN = `${B3}/pattern-tiktok-yellow.png`  // B3 底纹（待替换透明版）

// ── B2 3D assets (extracted from PDF, transparent background) ─────────────────
const PLUM_BLOSSOM = `${B2}/plum-blossom.png`   // 梅花枝
const PINE_TREE    = `${B2}/pine-tree.png`        // 松树盆栽
const PROJECTOR    = `${B2}/projector.png`        // 放映机
const RED_ENVELOPE = `${B2}/red-envelope.png`     // 红包
const MICROPHONE   = `${B2}/microphone.png`       // 话筒
const LANTERN      = `${B2}/lantern.png`          // 灯笼

// ── B4 combo stickers ─────────────────────────────────────────────────────────
const HORSE_LANTERN = `${B4}/horse-lantern.png`   // 马+心形灯笼

// ── Shared element blueprints ─────────────────────────────────────────────────

const plumTL = {
  id: 'plum-tl',
  asset: PLUM_BLOSSOM,
  label: '梅花枝-左',
  zone: { x: [-5, 5], y: [0, 12] },
  rotation: [-10, 10],
  scale: [0.28, 0.36],
  flipX: true,
  baseSize: 400,
  zIndex: 2,
}

const plumTR = {
  id: 'plum-tr',
  asset: PLUM_BLOSSOM,
  label: '梅花枝-右',
  zone: { x: [70, 88], y: [-2, 10] },
  rotation: [-15, 5],
  scale: [0.22, 0.30],
  flipX: false,
  baseSize: 400,
  zIndex: 2,
}

const pineTR = {
  id: 'pine-tr',
  asset: PINE_TREE,
  label: '松树-右',
  zone: { x: [72, 88], y: [2, 16] },
  rotation: [-8, 8],
  scale: [0.18, 0.26],
  flipX: false,
  baseSize: 400,
  zIndex: 2,
}

const lanternBR = {
  id: 'lantern-br',
  asset: LANTERN,
  label: '灯笼-右下',
  zone: { x: [80, 92], y: [68, 82] },
  rotation: [-12, 12],
  scale: [0.12, 0.18],
  flipX: false,
  baseSize: 400,
  zIndex: 1,
}

const envelopeBL = {
  id: 'envelope-bl',
  asset: RED_ENVELOPE,
  label: '红包-左下',
  zone: { x: [2, 14], y: [72, 86] },
  rotation: [-15, 15],
  scale: [0.14, 0.20],
  flipX: true,
  baseSize: 400,
  zIndex: 1,
}

const projectorTR = {
  id: 'projector-tr',
  asset: PROJECTOR,
  label: '放映机-右',
  zone: { x: [74, 88], y: [4, 18] },
  rotation: [-10, 10],
  scale: [0.16, 0.22],
  flipX: false,
  baseSize: 400,
  zIndex: 2,
}

const micBL = {
  id: 'mic-bl',
  asset: MICROPHONE,
  label: '话筒-左下',
  zone: { x: [2, 12], y: [74, 88] },
  rotation: [-20, 20],
  scale: [0.12, 0.16],
  flipX: true,
  baseSize: 400,
  zIndex: 1,
}

// ── Per-template slot definitions ─────────────────────────────────────────────

export const templateSlots: Record<string, TemplateSlots> = {
  'banner-slim': {
    bannerHero: PROJECTOR,
    decorElements: [
      { ...plumTR, zone: { x: [62, 74], y: [5, 85] }, scale: [0.08, 0.12], baseSize: 400 },
    ],
  },

  'banner-standard': {
    bannerHero: undefined,
    bgPattern: PATTERN,
    decorElements: [
      // 主题元素 - 严格在文本和按钮中间的安全区域
      {
        id: 'lantern-main',
        asset: LANTERN,
        label: '灯笼-主题',
        zone: { x: [55, 70], y: [15, 70] },
        rotation: [-8, 8],
        scale: [0.18, 0.24],
        flipX: false,
        baseSize: 400,
        zIndex: 1,
      },
      // 辅助元素1 - 严格在主题元素左边的安全区域
      {
        id: 'envelope-left',
        asset: RED_ENVELOPE,
        label: '红包-左',
        zone: { x: [48, 56], y: [25, 45] },
        rotation: [25, 35],
        scale: [0.06, 0.10],
        flipX: true,
        baseSize: 400,
        zIndex: 0,
      },
      // 辅助元素2 - 严格在主题元素右边的安全区域
      {
        id: 'envelope-right',
        asset: RED_ENVELOPE,
        label: '红包-右',
        zone: { x: [69, 77], y: [25, 45] },
        rotation: [-35, -25],
        scale: [0.06, 0.10],
        flipX: false,
        baseSize: 400,
        zIndex: 0,
      },
    ],
  },

  'banner-warm': {
    bannerHero: HORSE_LANTERN,
    bgPattern: PATTERN,
    decorElements: [
      {
        id: 'lantern-r', asset: LANTERN, label: '灯笼',
        zone: { x: [58, 72], y: [10, 80] },
        rotation: [-15, 15], scale: [0.05, 0.08],
        flipX: false, baseSize: 400, zIndex: 1,
      },
      {
        id: 'envelope-r', asset: RED_ENVELOPE, label: '红包',
        zone: { x: [62, 76], y: [10, 85] },
        rotation: [-20, 20], scale: [0.05, 0.07],
        flipX: false, baseSize: 400, zIndex: 1,
      },
    ],
  },

  'frame-single': {
    bgPattern: PATTERN,
    decorElements: [],
  },

  'frame-titled': {
    decorElements: [
      { ...plumTL, zone: { x: [-4, 8],  y: [0, 10] }, scale: [0.20, 0.27] },
      { ...pineTR, zone: { x: [76, 90], y: [0, 12] }, scale: [0.18, 0.24] },
    ],
  },

  'frame-grid': {
    mascot: HORSE_LANTERN,
    decorElements: [
      { ...plumTL, zone: { x: [-2, 8],  y: [0, 10] }, scale: [0.16, 0.22] },
      { ...projectorTR, zone: { x: [58, 72], y: [0, 12] }, scale: [0.12, 0.17] },
    ],
  },

  'background-arc': {
    arcGroup: HORSE_LANTERN,
    yaofeng: '/assets/辅助元素/腰带.svg', // 腰封用腰带.svg
    // placement-spec.ts zones:
    //   plumTL  → ZONE_DECOR_TL  (upper-left corner, flipX so branch sweeps right)
    //   plumTR  → ZONE_DECOR_TR  (upper-right corner)
    //   pineTR  → ZONE_DECOR_TR  (alternate right-corner asset)
    //   envelope → ZONE_DECOR_ARC_L  (tiny, near arc left)
    //   lantern  → ZONE_DECOR_ARC_R  (tiny, near arc right)
    decorElements: [
      { ...plumTL,    zone: { x: [-6,  12], y: [3,  14] }, scale: [0.28, 0.38] },
      { ...plumTR,    zone: { x: [74,  92], y: [3,  14] }, scale: [0.22, 0.32] },
      { ...pineTR,    zone: { x: [68,  84], y: [14, 24] }, scale: [0.18, 0.26] },
      { ...envelopeBL, zone: { x: [4,  20], y: [27, 35] }, scale: [0.09, 0.13] },
      { ...lanternBR,  zone: { x: [76, 92], y: [27, 35] }, scale: [0.08, 0.12] },
    ],
  },

  // 暖色横幅背景（banner-warm 的背景层）：纯渐变，无前景素材
  'background-simple': {
    decorElements: [],
  },
}
