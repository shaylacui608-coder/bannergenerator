import type { CampaignConfig, UserContent } from '../../types'
import { colors } from './colors'
import { templateSlots } from './layout-rules'
import { ASSETS, saveManifest } from './asset-manifest'

const defaultContent: UserContent = {
  eventName: '抖音新春吃喝玩乐节',
  title: '春节卖爆品赢奖励',
  subtitle: '新春平台营销活动火热招商中',
  cta: '立即参与',
  tags: ['流量大曝光', '300元补贴金', '平台货补扶持'],
  gradientIndex: 0,
  titleSizeAdjust: 0,
}

export const springFestival2026: CampaignConfig = {
  id: '2026-spring-festival',
  name: '2026新春',
  colors,
  templateSlots: templateSlots as CampaignConfig['templateSlots'],
  defaultContent,
  disabled: true,
  assets: {
    hero: ASSETS.filter(a => a.category === 'hero').map(a => ({
      id: a.id,
      label: a.label,
      path: a.path,
    })),
    decor: ASSETS.filter(a => a.category === 'decor').map(a => ({
      id: a.id,
      label: a.label,
      path: a.path,
    })),
    pattern: ASSETS.filter(a => a.category === 'pattern').map(a => ({
      id: a.id,
      label: a.label,
      path: a.path,
    })),
  },
  assetManifest: ASSETS,
  saveManifest: saveManifest,
}
