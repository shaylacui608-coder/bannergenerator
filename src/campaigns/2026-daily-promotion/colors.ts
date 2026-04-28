import type { ColorPalette } from '../../types'

// 商品日常活动配色（待根据参考图更新）
export const colors: ColorPalette = {
  primary:    '#FF2644',
  secondary:  '#FF9F4C',
  yellow:     '#FFE70D',
  warmBg:     'linear-gradient(to top right, #FF7053, #FF9F4C, #FF2543, #FF3251, #FF255E, #FF377C, #FF4D9D, #FF97F9)',
  pink:       '#FF4D9D',
  lightPink:  '#FF97F9',
  lightBlue:  '#81ddf2',
  mint:       '#82ECB7',
  textOnDark:  '#FFFFFF',
  textOnLight: '#FF2644',
  gradients: [
    ['#FF7053', '#FF9F4C', '#FF2543', '#FF3251', '#FF255E', '#FF377C', '#FF4D9D', '#FF97F9'],  // 左下→右上（主推）
    ['#FF2644', '#FF4D9D'],  // 红→粉
    ['#FF7053', '#FF9F4C'],  // 橙红→橙
  ],
}
