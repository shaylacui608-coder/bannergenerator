export interface GlobalDecorEntry {
  id: string
  label: string
  path: string
  width: number
  height: number
}

export const GLOBAL_DECOR: GlobalDecorEntry[] = [
  { id: 'decor-group',   label: 'Group',   path: '/assets/辅助元素/Group.png',   width: 94,  height: 95  },
  { id: 'decor-layer1',  label: 'Layer 1', path: '/assets/辅助元素/Layer 1.png', width: 166, height: 204 },
  { id: 'decor-sticker', label: '贴纸',    path: '/assets/辅助元素/img_v3_0210d_62de4254-b083-4f2f-bef4-a19c4bca004g 1.png', width: 114, height: 104 },
  { id: 'decor-coupon',  label: '粉色券',  path: '/assets/辅助元素/粉色券.png',  width: 346, height: 196 },
]
