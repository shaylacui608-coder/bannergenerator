/**
 * 大促首页模块 — 背景层放置规则 (background-arc 375×812px)
 *
 * 坐标系：左上角为原点，x/y 均为占画布宽/高的百分比（0-100）。
 * 元素实际渲染尺寸 = baseSize(px) × scale，baseSize 固定 400。
 * 所有 zone 均为中心点允许活动的矩形范围。
 *
 * ── 视觉层次（由后到前）────────────────────────────────────────────────────────
 *
 *  z=0  bgPattern        背景底纹（半透明重复纹理）
 *  z=1  ZONE_BG          大型背景装饰（梅花枝、松树），上角区域，大号远景
 *       ZONE_STAGE_L/R   腰封两侧小主体（角色预制件），中心对齐腰封顶边，
 *                        下半身被腰封（z=2）自然遮挡，形成"坐舞台上"的感觉
 *  z=2  ZONE_YAOFENG     腰封（装饰舞台托架），横跨画布
 *  z=3  ZONE_STAGE_PROP  腰封顶边的小道具（红包、灯笼等），摆放在腰封上方
 *  z=5  ZONE_HERO        画面核心：唯一的大主体，居中，下半身部分进入腰封区
 *
 * ── 聚合视觉规则 ───────────────────────────────────────────────────────────────
 *  - 左侧所有元素向左倾斜（rotation < 0）
 *  - 右侧所有元素向右倾斜（rotation > 0）
 *  - 两侧元素形成"向中心聚拢"的视觉张力
 *  - 画面中心区域（x 30-70%）完全留白，只有唯一大主体，不放任何其他元素
 */

// ─── 渐变规则 ────────────────────────────────────────────────────────────────

export const GRADIENT_SPEC = {
  direction: '170deg',
  stops: [
    { pos: '0%',   color: '#FF2C19' },  // 顶部：深红
    { pos: '40%',  color: '#FF4A18' },  // 中上：红橙过渡
    { pos: '72%',  color: '#FF6511' },  // 中下：亮橙
    { pos: '100%', color: '#FF8C3A' },  // 底部：暖橙
  ],
}

// ─── 区域定义 ────────────────────────────────────────────────────────────────

/**
 * ZONE_HERO — 中心大主体（画面锚点）
 *
 * 唯一的核心素材，占据视觉焦点。居中偏上放置，下半身进入腰封区域。
 * 周围完全留白，不与任何其他元素竞争视线。
 *
 * 规则：
 *  - 仅放 1 个
 *  - 水平居中（x ≈ 50%）
 *  - 不做旋转（±3° 内微调）
 *  - z-index = 5，覆盖腰封和所有辅助元素
 *  - 垂直方向：中心点约在 y=15-22%，使底部自然延伸至腰封顶边（y≈30%）
 */
export const ZONE_HERO = {
  id: 'hero',
  label: '中心大主体',
  category: 'hero' as const,
  x:        [38, 62],      // 水平居中
  y:        [12, 22],      // 中心偏上，底部恰好接触腰封顶边
  scale:    [0.55, 0.70],  // baseSize 400 → 渲染宽 220-280px ≈ 画布 58-75%
  rotation: [-3,   3],
  zIndex:   5,
  count:    1,
}

/**
 * ZONE_STAGE_L — 舞台左侧主体（腰封左边缘）
 *
 * 较小的主体素材，靠近腰封左侧边缘，向左倾斜，形成聚拢视觉。
 * 中心点对齐腰封顶边，下半身自然被腰封（z=2）遮挡。
 *
 * 典型素材：预制角色（探身入画的人物），当前无素材时跳过。
 *
 * 规则：
 *  - z-index = 1（低于腰封 z=2），下半身被腰封遮挡 ✓
 *  - 允许向左超出画布（探入效果）
 *  - rotation 固定负值（向左倾斜）
 *  - 比中心主体小 30-40%
 */
export const ZONE_STAGE_L = {
  id: 'stage-left',
  label: '舞台左侧主体',
  category: 'hero' as const,
  x:        [-5, 22],      // 左边缘，可超出画布
  y:        [24, 32],      // 中心在腰封顶边（y≈30%）附近
  scale:    [0.28, 0.38],  // 比中心主体小
  rotation: [-20, -5],     // 固定向左倾斜
  flipX:    false,
  zIndex:   1,
  count:    1,
  requires: 'presets/',    // 需要预制角色素材
}

/**
 * ZONE_STAGE_R — 舞台右侧主体（腰封右边缘）
 *
 * 与 ZONE_STAGE_L 对称，向右倾斜，强化聚拢视觉。
 * 同样部分被腰封遮挡，形成"坐在舞台上"的感觉。
 */
export const ZONE_STAGE_R = {
  id: 'stage-right',
  label: '舞台右侧主体',
  category: 'hero' as const,
  x:        [78, 105],     // 右边缘，可超出画布
  y:        [24, 32],      // 中心在腰封顶边附近
  scale:    [0.28, 0.38],
  rotation: [5, 20],       // 固定向右倾斜
  flipX:    false,
  zIndex:   1,
  count:    1,
  requires: 'presets/',
}

/**
 * ZONE_STAGE_PROP_L — 腰封左侧小道具（腰封顶部上方）
 *
 * 尺寸极小的辅助元素，摆放在腰封顶边左侧区域，位于腰封之上（z=3）。
 * 随机旋转，营造随性散落感。左侧元素保持轻微向左的倾向。
 *
 * 典型素材：红包、话筒、放映机等小件道具。
 */
export const ZONE_STAGE_PROP_L = {
  id: 'stage-prop-l',
  label: '腰封左侧道具',
  category: 'decor' as const,
  x:        [8,  38],      // 腰封左侧中部（避开最边缘的舞台角色区）
  y:        [26, 34],      // 紧贴腰封顶边
  scale:    [0.09, 0.14],
  rotation: [-25, 5],      // 略偏向左倾
  flipX:    true,
  zIndex:   3,
}

/**
 * ZONE_STAGE_PROP_R — 腰封右侧小道具（腰封顶部上方）
 *
 * 与 ZONE_STAGE_PROP_L 对称，略偏向右倾。
 */
export const ZONE_STAGE_PROP_R = {
  id: 'stage-prop-r',
  label: '腰封右侧道具',
  category: 'decor' as const,
  x:        [62, 92],      // 腰封右侧中部
  y:        [26, 34],
  scale:    [0.09, 0.14],
  rotation: [-5, 25],      // 略偏向右倾
  flipX:    false,
  zIndex:   3,
}

/**
 * ZONE_BG_L — 背景大装饰·左上角
 *
 * 大型远景装饰元素，占据左上角，营造深度层次感。
 * 尺寸比前景元素大，但 z-index 低，视觉上退到背景。
 * 左边缘可超出画布，增强延伸感。
 *
 * 典型素材：梅花枝（flipX 后枝干向右延伸）。
 */
export const ZONE_BG_L = {
  id: 'bg-left',
  label: '背景装饰·左',
  category: 'decor' as const,
  x:        [-8, 10],
  y:        [0,  14],
  scale:    [0.34, 0.46],  // 大号，远景感
  rotation: [-15, 5],
  flipX:    true,
  zIndex:   1,
}

/**
 * ZONE_BG_R — 背景大装饰·右上角
 *
 * 与 ZONE_BG_L 对称，右侧背景装饰。
 */
export const ZONE_BG_R = {
  id: 'bg-right',
  label: '背景装饰·右',
  category: 'decor' as const,
  x:        [72, 96],
  y:        [0,  14],
  scale:    [0.28, 0.40],
  rotation: [-5, 15],
  flipX:    false,
  zIndex:   1,
}

/**
 * ZONE_BG_R2 — 背景大装饰·右中（可选，第二背景层）
 *
 * 右侧第二层背景，比 ZONE_BG_R 位置略低，增加背景丰富度。
 * 当有两种右侧背景素材时使用（如梅花枝 + 松树盆栽）。
 */
export const ZONE_BG_R2 = {
  id: 'bg-right-2',
  label: '背景装饰·右中',
  category: 'decor' as const,
  x:        [68, 88],
  y:        [12, 24],
  scale:    [0.22, 0.32],
  rotation: [-8, 10],
  flipX:    false,
  zIndex:   1,
}

/**
 * ZONE_SPARKLE — 星光点缀（程序生成，不依赖素材）
 *
 * 散落在主体周围的 ✦ 4 射线星光，白色半透明。
 * 在 BackgroundArc.tsx 里硬编码生成，不走 DecorLayer。
 * 左右各一簇，中心区域不放，突出主体留白。
 */
export const ZONE_SPARKLE = {
  id: 'sparkle',
  label: '星光点缀',
  category: 'sparkle' as const,
  leftCluster:  { x: [3, 20],  y: [6, 28], count: 4 },
  rightCluster: { x: [74, 92], y: [6, 28], count: 3 },
  sizePx:       [5, 12],
  opacity:      [0.28, 0.60],
}

/**
 * ZONE_YAOFENG — 腰封（装饰性舞台托架）
 *
 * 横向贯通画布的装饰带，将渐变背景区与下方内容卡片分隔。
 * 每年活动样式不同（本次为金色云朵描边），放置规则固定。
 *
 * 参考图分析（375×812px 画布）：
 *   - 顶边 y ≈ 30%（244px），底部云朵凸起 y ≈ 46%（374px）
 *   - 横向居中，宽度约占画布 90-95%
 *   - z-index = 2：覆盖 ZONE_STAGE_L/R（z=1）的下半身，
 *     被 ZONE_STAGE_PROP（z=3）和 ZONE_HERO（z=5）覆盖
 *
 * 素材交付规范：
 *   - 透明底 PNG，建议 1000×460px（宽高比约 2.2:1）
 *   - 放置路径：public/assets/{campaign-id}/presets/yaofeng.png
 *   - 无素材时渲染内置 SVG fallback（金色描边 + 云朵轮廓）
 */
export const ZONE_YAOFENG = {
  id: 'yaofeng',
  label: '腰封',
  category: 'frame' as const,
  yTop:      [29, 31],     // 顶边 y%（244-252px）
  yBottom:   [44, 47],     // 底部云朵最低点 y%（357-382px）
  widthPct:  [88, 96],
  rotation:  0,
  zIndex:    2,
  fixed:     true,
  cloudBumps: 5,
}

// ─── 禁区（元素中心点不得进入） ───────────────────────────────────────────────

/**
 * 卡片内容区：frame-titled 叠加在 y≈46%（374px）处开始。
 * 以下区域不放装饰元素，保持留白让卡片内容清晰。
 */
export const EXCLUSION_ZONES = [
  { label: '卡片内容区', x: [8, 92], y: [46, 100] },
  // 中心留白区：只有唯一大主体，辅助元素不得进入
  { label: '中心留白区', x: [28, 72], y: [0, 44] },
]

// ─── 素材分配建议 ─────────────────────────────────────────────────────────────

export const ASSET_TO_ZONE: Record<string, string[]> = {
  'horse-lantern':   ['ZONE_HERO'],
  'plum-blossom':    ['ZONE_BG_L', 'ZONE_BG_R'],
  'pine-tree':       ['ZONE_BG_R', 'ZONE_BG_R2'],
  'red-envelope':    ['ZONE_STAGE_PROP_L', 'ZONE_STAGE_PROP_R'],
  'lantern':         ['ZONE_STAGE_PROP_R', 'ZONE_STAGE_PROP_L'],
  'microphone':      ['ZONE_STAGE_PROP_L'],
  'projector':       ['ZONE_STAGE_PROP_R'],
}
