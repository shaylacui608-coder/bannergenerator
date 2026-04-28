/**
 * 暖色横幅 (banner-warm) — 351×66px
 * 使用场景：商机中心顶部活动横幅
 *
 * ── 画布 ──────────────────────────────────────────────────────────────────────
 *   宽 351px × 高 66px，圆角 10px
 *
 * ── 背景层 ────────────────────────────────────────────────────────────────────
 *   纯色：colors.warmBg（暖米色 #FFEDCA），非渐变
 *   底纹：bgPattern 平铺，opacity 0.10，z=0
 *
 * ── 文字区（左侧，绝对定位锚点 x=12, y=12） ──────────────────────────────────
 *
 *   标题行（top row）
 *     字体：FONTS.title（花体字 / 站酷庆科黄油体）
 *     字号：20px（可微调 titleSizeAdjust）
 *     字重：900
 *     颜色：colors.primary（深红 #FF2C19）— 与暖米背景形成强对比
 *     行高：1.1，单行不换行
 *
 *   CTA 按钮（紧跟标题右侧，间距 4px，与标题垂直居中对齐）
 *     样式：白色胶囊，边框 colors.primary 低透明度描边
 *     字色：colors.primary
 *     字号：11px，fontWeight 700
 *     内边距：4px 12px，borderRadius 14px
 *
 *   副标题行（标题下方，间距 2px）
 *     字体：FONTS.subtitle（普通正文字体）
 *     字号：12px
 *     颜色：colors.primary（与标题同色）
 *
 * ── 右侧元素区（x > 65%） ────────────────────────────────────────────────────
 *
 *   HERO（1 个）
 *     锚点：right: 4, bottom: 0
 *     高度：H × 1.2（允许上下超出 banner 边缘，形成溢出感）
 *     倾斜：5–15° 右倾（rotation > 0）
 *     z=2，覆盖文字区但不遮挡按钮
 *
 *   辅助元素（1–2 个）
 *     分布在 hero 周围（x 55–85%，y 0–100%）
 *     尺寸极小（scale 0.08–0.14，baseSize 400 → 渲染 32–56px）
 *     随机旋转，z=1
 */

export const CANVAS = { W: 351, H: 66, borderRadius: 10 }

export const BACKGROUND = {
  color: 'warmBg',          // colors.warmBg，纯色非渐变
  patternOpacity: 0.10,
  patternSize: '50px auto',
}

export const TITLE = {
  x: 12, y: 12,
  font: 'title',
  size: 20,
  weight: 900,
  color: 'primary',
  lineHeight: 1.1,
}

export const SUBTITLE = {
  marginTop: 2,
  size: 12,
  font: 'subtitle',
  color: 'primary',
}

export const BUTTON = {
  marginLeft: 4,            // 距标题右边缘
  background: '#fff',
  color: 'primary',
  fontSize: 11,
  fontWeight: 700,
  paddingX: 12,
  paddingY: 4,
  borderRadius: 14,
  border: 'primary 22% opacity',
}

export const ZONE_HERO = {
  anchor: 'right: 4, bottom: 0',
  heightRatio: 1.2,         // 相对 banner 高度，允许溢出
  rotation: [5, 15],        // 右倾
  zIndex: 2,
  count: 1,
}

export const ZONE_DECOR = {
  x: [55, 85],              // % of W
  y: [0, 100],              // % of H
  scale: [0.08, 0.14],      // baseSize 400 → 32–56px
  rotation: [-20, 20],
  zIndex: 1,
  count: [1, 2],
}
