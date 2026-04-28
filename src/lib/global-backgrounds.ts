export interface BackgroundEntry {
  id: string
  label: string
  path: string
  group: string
  width: number
  height: number
}

export const GLOBAL_BACKGROUNDS: BackgroundEntry[] = [
  { id: 'bg1',   label: '背景1',      path: '/assets/背景/背景1.svg',      group: '背景1', width: 451, height: 135 },
  { id: 'bg2-1', label: '背景2 元素1', path: '/assets/背景/背景2元素—1.svg', group: '背景2', width: 88,  height: 88  },
  { id: 'bg2-2', label: '背景2 元素2', path: '/assets/背景/背景2元素—2.svg', group: '背景2', width: 59,  height: 121 },
  { id: 'bg2-3', label: '背景2 元素3', path: '/assets/背景/背景2元素—3.svg', group: '背景2', width: 71,  height: 71  },
]
