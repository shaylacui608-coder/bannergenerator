export interface UnifiedAsset {
  id: string
  label: string
  path: string
  category: 'hero' | 'decor' | 'background'
  campaignSpecific?: string // 可选，只有主体素材可能属于特定活动
  width?: number
  height?: number
}

// 全局共享的素材（默认辅助元素 + 默认背景）
export const GLOBAL_ASSETS: UnifiedAsset[] = [
  // ── 默认辅助元素 ────────────────────────────────────────────────────────────────
  { id: 'decor-1', label: '辅助1', path: '/assets/默认辅助元素/辅助——1.png', category: 'decor' },
  { id: 'decor-2', label: '辅助2', path: '/assets/默认辅助元素/辅助_2.png', category: 'decor' },
  { id: 'decor-3', label: '辅助3', path: '/assets/默认辅助元素/辅助_3.png', category: 'decor' },
  { id: 'decor-4', label: '辅助4', path: '/assets/默认辅助元素/辅助_4.svg', category: 'decor' },
  { id: 'decor-5', label: '辅助5', path: '/assets/默认辅助元素/辅助_5.png', category: 'decor' },

  // ── 默认背景 ────────────────────────────────────────────────────────────────
  { id: 'bg1', label: '背景1', path: '/assets/默认背景/背景1.svg', category: 'background' },
  { id: 'rectangle', label: 'Rectangle', path: '/assets/默认背景/Rectangle.png', category: 'background' },
  { id: 'bg5', label: 'bg 5', path: '/assets/默认背景/bg 5.png', category: 'background' },
  { id: 'bg2-1', label: '背景2 元素1', path: '/assets/默认背景/背景2元素—1.svg', category: 'background' },
  { id: 'bg2-2', label: '背景2 元素2', path: '/assets/默认背景/背景2元素—2.svg', category: 'background' },
  { id: 'bg2-3', label: '背景2 元素3', path: '/assets/默认背景/背景2元素—3.svg', category: 'background' },
]

// 2026 春节活动专属主体素材
export const SPRING_FESTIVAL_HERO_ASSETS: UnifiedAsset[] = [
  { id: 'plum-blossom', label: '梅花枝', path: '/assets/2026春节主体元素/plum-blossom.png', category: 'hero', campaignSpecific: '2026-spring-festival' },
  { id: 'pine-tree', label: '松树盆栽', path: '/assets/2026春节主体元素/pine-tree.png', category: 'hero', campaignSpecific: '2026-spring-festival' },
  { id: 'projector', label: '放映机', path: '/assets/2026春节主体元素/projector.png', category: 'hero', campaignSpecific: '2026-spring-festival' },
  { id: 'lantern', label: '灯笼', path: '/assets/2026春节主体元素/lantern.png', category: 'hero', campaignSpecific: '2026-spring-festival' },
  { id: 'clip-path-group', label: 'Clip Path Group', path: '/assets/2026春节主体元素/Clip path group.png', category: 'hero', campaignSpecific: '2026-spring-festival' },
  { id: 'microphone', label: '话筒', path: '/assets/2026春节主体元素/microphone.png', category: 'hero', campaignSpecific: '2026-spring-festival' },
]

// 日常活动专属主体素材
export const DAILY_PROMOTION_HERO_ASSETS: UnifiedAsset[] = [
  { id: 'heart', label: '心形', path: '/assets/日常主体元素/heart.png', category: 'hero', campaignSpecific: '2026-daily-promotion' },
  { id: 'heart-2', label: '心形 2', path: '/assets/日常主体元素/heart_2.png', category: 'hero', campaignSpecific: '2026-daily-promotion' },
]

export const CATEGORY_CONFIG = {
  hero: { label: '主体素材', color: '#FF2C19', desc: '画面锚点，固定居中，视觉权重最高' },
  decor: { label: '辅助元素', color: '#FF6511', desc: '弹性布局，点缀四周，换一版可随机' },
  background: { label: '背景素材', color: '#81DDF2', desc: '大尺寸背景图，覆盖整个画布' },
}

// 获取特定活动的所有素材
export function getAssetsForCampaign(campaignId: string): UnifiedAsset[] {
  let campaignHeroAssets: UnifiedAsset[] = []
  if (campaignId === '2026-spring-festival') {
    campaignHeroAssets = SPRING_FESTIVAL_HERO_ASSETS
  } else if (campaignId === '2026-daily-promotion') {
    campaignHeroAssets = DAILY_PROMOTION_HERO_ASSETS
  }
  return [...campaignHeroAssets, ...GLOBAL_ASSETS]
}
