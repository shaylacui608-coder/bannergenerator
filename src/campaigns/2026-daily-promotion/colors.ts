import type { ColorPalette } from '../../types'

// 商品日常活动配色（待根据参考图更新）
export const colors: ColorPalette = {
  primary:    '#FF2C19',
  secondary:  '#FF6511',
  yellow:     '#FFE70D',
  warmBg:     'linear-gradient(90deg, #F24960 0%, #FF8FAB 100%)',
  pink:       '#F73C76',
  lightPink:  '#FFC6E6',
  lightBlue:  '#81ddf2',
  mint:       '#82ECB7',
  textOnDark:  '#FFFFFF',
  textOnLight: '#CC2200',
  gradients: [
    ['#FF2C19', '#FF6511'],  // 红→橙（主推）
    ['#FF2C19', '#F73C76'],  // 红→粉
    ['#F73C76', '#FFC6E6'],  // 粉→浅粉
  ],
}
