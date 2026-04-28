import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { TemplateId } from '../types'

const TEMPLATE_LABELS: Record<TemplateId, string> = {
  'banner-slim': 'banner_超细通栏',
  'banner-standard': 'banner_标准横幅',
  'banner-warm': 'banner_暖色横幅',
  'banner-card': 'banner_商机中心PC',
  'frame-single': '画框_单列',
  'frame-titled': '画框_带标题',
  'frame-module': '模块_APP活动',
  'frame-module-pc': '模块_PC活动',
  'frame-grid': '画框_四宫格',
  'background-arc': '背景_弧形角色',
  'background-simple': '背景_简洁渐变',
  'background-activity': '背景_APP活动页',
  'background-activity-pc': '背景_PC活动页',
}

async function waitForFonts() {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
}

export async function exportTemplate(el: HTMLElement): Promise<Blob> {
  await waitForFonts()
  const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true })
  const res = await fetch(dataUrl)
  return res.blob()
}

export async function exportAllAsZip(
  elements: Array<{ el: HTMLElement; templateId: TemplateId }>,
  campaignName: string
) {
  await waitForFonts()
  const zip = new JSZip()
  const folder = zip.folder(campaignName) ?? zip

  for (const { el, templateId } of elements) {
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true })
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const label = TEMPLATE_LABELS[templateId] ?? templateId
      folder.file(`${label}.png`, blob)
    } catch (e) {
      console.error(`Failed to export ${templateId}`, e)
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `${campaignName}_素材全套.zip`)
}
