#!/usr/bin/env node
/**
 * Extracts B2/B4 assets from a campaign branding PDF.
 * Usage: node scripts/extract-pdf-assets.mjs <pdf-path> [campaign-id]
 *
 * Each 3D asset in the PDF is stored as a color image + a separate alpha mask.
 * pdfimages extracts them as paired consecutive PNGs (even = color, odd = alpha).
 * This script combines each pair into a proper transparent-background PNG.
 */

import { execSync } from 'child_process'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')

const pdfPath = process.argv[2]
const campaignId = process.argv[3] || '2026-spring-festival'

if (!pdfPath) {
  console.error('Usage: node scripts/extract-pdf-assets.mjs <pdf-path> [campaign-id]')
  process.exit(1)
}

const OUTPUT_BASE = path.join(PROJECT_ROOT, 'public', 'assets', campaignId)
const TEMP_DIR = `/tmp/pdf_extract_${Date.now()}`

// ── Known asset layout for 2026-spring-festival PDF ──────────────────────────
// Discovered by running pdfimages -all and inspecting output.
// Each entry: colorIdx (even) + alphaIdx (odd) are consecutive pairs.
const ASSET_MAP = [
  { colorIdx: 8,  alphaIdx: 9,  name: 'plum-blossom', category: 'B2', label: '梅花枝' },
  { colorIdx: 10, alphaIdx: 11, name: 'pine-tree',     category: 'B2', label: '松树'   },
  { colorIdx: 12, alphaIdx: 13, name: 'projector',     category: 'B2', label: '放映机' },
  { colorIdx: 16, alphaIdx: 17, name: 'red-envelope',  category: 'B2', label: '红包'   },
  { colorIdx: 18, alphaIdx: 19, name: 'microphone',    category: 'B2', label: '话筒'   },
  { colorIdx: 20, alphaIdx: 21, name: 'lantern',       category: 'B2', label: '灯笼'   },
  { colorIdx: 22, alphaIdx: 23, name: 'horse-lantern', category: 'B4', label: '马+心形灯笼' },
]

// B3 texture tile (yellow TikTok pattern) — full-color tile, no alpha pairing
const B3_TILES = [
  { colorIdx: 0, name: 'pattern-tiktok-yellow', label: 'TikTok纹理-黄' },
]

function pad(n) {
  return String(n).padStart(3, '0')
}

function imgPath(idx) {
  return path.join(TEMP_DIR, `img-${pad(idx)}.png`)
}

async function combineColorAndAlpha(colorFile, alphaFile, outputFile) {
  const { width, height } = await sharp(colorFile).metadata()

  // Resize alpha to match color image (should already match, but safety)
  const alphaBuf = await sharp(alphaFile)
    .resize(width, height)
    .grayscale()
    .raw()
    .toBuffer()

  await sharp(colorFile)
    .ensureAlpha()
    .joinChannel(alphaBuf, { raw: { width, height, channels: 1 } })
    .png()
    .toFile(outputFile)
}

async function main() {
  console.log(`\n📄 PDF: ${pdfPath}`)
  console.log(`📁 Output: ${OUTPUT_BASE}\n`)

  // 1. Extract all images from PDF
  fs.mkdirSync(TEMP_DIR, { recursive: true })
  console.log('⏳ Extracting images from PDF...')
  execSync(`pdfimages -all "${pdfPath}" ${TEMP_DIR}/img`, { stdio: 'inherit' })

  const extracted = fs.readdirSync(TEMP_DIR).filter(f => f.endsWith('.png'))
  console.log(`   Found ${extracted.length} raw images\n`)

  // 2. Create output dirs
  for (const cat of ['B2', 'B3', 'B4']) {
    fs.mkdirSync(path.join(OUTPUT_BASE, cat), { recursive: true })
  }

  // 3. Process B2/B4 assets (combine color + alpha)
  console.log('🎨 Processing B2/B4 assets (color + alpha → transparent PNG)...')
  for (const asset of ASSET_MAP) {
    const colorFile = imgPath(asset.colorIdx)
    const alphaFile = imgPath(asset.alphaIdx)
    const outputFile = path.join(OUTPUT_BASE, asset.category, `${asset.name}.png`)

    if (!fs.existsSync(colorFile) || !fs.existsSync(alphaFile)) {
      console.warn(`   ⚠️  Skipping ${asset.label} (source images not found at idx ${asset.colorIdx}/${asset.alphaIdx})`)
      continue
    }

    await combineColorAndAlpha(colorFile, alphaFile, outputFile)
    console.log(`   ✅ ${asset.category}/${asset.name}.png  (${asset.label})`)
  }

  // 4. Copy B3 tiles (full-color; transparent versions must come from .ai export)
  console.log('\n🔲 Copying B3 texture tiles (note: transparent versions need .ai export)...')
  for (const tile of B3_TILES) {
    const src = imgPath(tile.colorIdx)
    const dst = path.join(OUTPUT_BASE, 'B3', `${tile.name}.png`)
    if (!fs.existsSync(src)) {
      console.warn(`   ⚠️  Skipping ${tile.label} (not found at idx ${tile.colorIdx})`)
      continue
    }
    fs.copyFileSync(src, dst)
    console.log(`   ✅ B3/${tile.name}.png  (${tile.label}) — colored tile saved`)
  }

  // 5. Cleanup
  fs.rmSync(TEMP_DIR, { recursive: true, force: true })

  console.log('\n✅ Done! Assets written to:')
  console.log(`   public/assets/${campaignId}/B2/`)
  console.log(`   public/assets/${campaignId}/B3/`)
  console.log(`   public/assets/${campaignId}/B4/\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
