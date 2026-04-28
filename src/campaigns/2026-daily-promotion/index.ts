import type { CampaignConfig, UserContent, SectionConfig, FormConfig } from '../../types'
import { colors } from './colors'
import { templateSlots } from './layout-rules'
import { ASSETS, saveManifest } from './asset-manifest'

const defaultContent: UserContent = {
  eventName: '商品日常活动',
  title: '日常好物推荐',
  subtitle: '每日精选好物，精彩不停歇',
  cta: '立即查看',
  tags: ['限时优惠', '好物推荐', '平台扶持'],
  gradientIndex: 0,
  titleSizeAdjust: 0,
  fonts: {
    title: "'YuanHei', sans-serif",
    brand: "'YuanHei', sans-serif",
  },
}

const dailyPromotionFormConfig: FormConfig = {
  showEventName: false,
  showTags: false,
}

const dailyPromotionSectionConfig: SectionConfig = {
  sections: ['module', 'business-center', 'all'],
  sectionLabels: {
    'module': '模块',
    'business-center': '商机中心',
    'all': '活动页',
  },
  templateGroups: {
    app: {
      'module': ['frame-module'],
      'business-center': ['banner-warm'],
      'all': ['background-activity'],
    },
    pc: {
      'module': ['frame-module-pc'],
      'business-center': ['banner-card'],
      'all': ['background-activity-pc'],
    },
  },
}

export const dailyPromotion2026: CampaignConfig = {
  id: '2026-daily-promotion',
  name: '2026商品日常活动',
  colors,
  templateSlots: templateSlots as CampaignConfig['templateSlots'],
  defaultContent,
  sectionConfig: dailyPromotionSectionConfig,
  formConfig: dailyPromotionFormConfig,
  assets: {
    hero: [], // 暂时空，等用户上传素材
    decor: [
      { id: 'heart', label: '心形', path: '/assets/2026-daily-prompotion/heart.png' },
      { id: 'heart_2', label: '心形2', path: '/assets/2026-daily-prompotion/heart_2.png' },
    ],
    pattern: [], // 暂时空
  },
  assetManifest: ASSETS,
  saveManifest: saveManifest,
}
