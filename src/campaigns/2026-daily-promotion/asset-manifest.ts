import rawAssets from './asset-manifest.json'

export type AssetCategory = 'hero' | 'decor' | 'pattern'

export interface AssetEntry {
  id: string
  label: string
  path: string
  category: AssetCategory
  source: 'B1' | 'B2' | 'B3' | 'B4' | 'preset'
  note?: string
}

export const ASSETS: AssetEntry[] = rawAssets as AssetEntry[]

export const CATEGORY_META: Record<AssetCategory, { label: string; color: string; desc: string }> = {
  hero:    { label: '主体素材', color: '#FF2C19', desc: '画面锚点，固定居中，视觉权重最高' },
  decor:   { label: '辅助元素', color: '#FF6511', desc: '弹性布局，点缀四周，换一版可随机' },
  pattern: { label: '背景底纹', color: '#82ECB7', desc: '全面平铺，极低透明度，需透明底' },
}

/** Save updated assets back to the JSON file via the Vite dev API */
export async function saveManifest(campaignId: string, assets: AssetEntry[]): Promise<void> {
  const res = await fetch(`/api/manifest/${campaignId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assets),
  })
  if (!res.ok) throw new Error(await res.text())
}
