import type { ColorPalette } from '../../types'

// Source: 2026春节branding.pdf A8/A9 色彩规范
export const colors: ColorPalette = {
  primary:    '#FF2C19',
  secondary:  '#FF6511',
  yellow:     '#FFE70D',
  warmBg:     '#FFEDCA',
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
