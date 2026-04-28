import { useState, useCallback, useMemo, useEffect } from 'react'
import { CAMPAIGNS } from '../campaigns/registry'
import { CampaignSelector } from './CampaignSelector'
import { ContentForm } from './ContentForm'
import { TemplatePreviewCard } from './TemplatePreviewCard'
import { FontSizeSelector, resetAllDragState } from './DraggableCanvas'
import { sampleLayout, randomSeed } from '../engine/layout-sampler'
import { exportAllAsZip, exportTemplate } from '../engine/export'
import { ALL_TEMPLATE_IDS, TEMPLATE_INFO, DEFAULT_TEMPLATE_GROUPS, DEFAULT_SECTION_LABELS, DEFAULT_SECTIONS } from '../templates'
import type { Platform, Section } from '../templates'
import type { TemplateId, SampledDecorElement, UserContent, TemplateSlots } from '../types'
import { GLOBAL_DECOR } from '../lib/global-decor'
import { GLOBAL_BACKGROUNDS } from '../lib/global-backgrounds'
import { CozeWorkflowService } from '../ai'
import type { CozeWorkflowRequest, CozeWorkflowResponse } from '../ai'

const PLATFORM_LABELS: Record<Platform, string> = { app: 'APP', pc: 'PC' }
const PLATFORMS: Platform[] = ['app', 'pc']

interface AIStandalonePageProps {
  onBack: () => void
  onStartCreating: () => void
}

export function AIStandalonePage({ onBack, onStartCreating }: AIStandalonePageProps) {
  const [campaignId, setCampaignId] = useState(CAMPAIGNS[0].id)
  const [seeds, setSeeds] = useState<Record<TemplateId, number>>(() =>
    Object.fromEntries(ALL_TEMPLATE_IDS.map(id => [id, randomSeed()])) as Record<TemplateId, number>
  )
  const [exporting, setExporting] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('生成一套春节主题的Banner素材，风格喜庆热闹，红色主色调')
  const [aiResults, setAiResults] = useState<CozeWorkflowResponse | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiGeneratedImages, setAiGeneratedImages] = useState<Record<TemplateId, string>>({})
  const [templateModes, setTemplateModes] = useState<Record<TemplateId, 'ai' | 'manual'>>(() =>
    Object.fromEntries(ALL_TEMPLATE_IDS.map(id => [id, 'manual'])) as Record<TemplateId, 'ai' | 'manual'>
  )
  const [activePlatform, setActivePlatform] = useState<Platform>('app')
  const [activeSection, setActiveSection] = useState<Record<Platform, string>>({
    app: 'banner',
    pc: 'banner',
  })
  const [animationEnabled, setAnimationEnabled] = useState(false)
  const exportRefs = useMemo(() => ({} as Partial<Record<TemplateId, HTMLElement | null>>), [])

  const campaign = CAMPAIGNS.find(c => c.id === campaignId)!
  const [content, setContent] = useState<UserContent>(campaign.defaultContent)

  const templateGroups = campaign.sectionConfig?.templateGroups ?? DEFAULT_TEMPLATE_GROUPS
  const allSections = campaign.sectionConfig?.sections ?? DEFAULT_SECTIONS
  const sectionLabels = campaign.sectionConfig?.sectionLabels ?? DEFAULT_SECTION_LABELS
  
  const currentSection = activeSection[activePlatform]
  
  const sectionPlatforms = PLATFORMS.filter(p => templateGroups[p] && templateGroups[p][currentSection])
  
  const visibleIds = (templateGroups[activePlatform]?.[currentSection] as TemplateId[]) ?? []

  const clearDecorStates = (templateId: string) => {
    try {
      const stored = localStorage.getItem('banner-decor-states-v2')
      if (stored) {
        const all = JSON.parse(stored)
        delete all[templateId]
        localStorage.setItem('banner-decor-states-v2', JSON.stringify(all))
      }
    } catch {}
  }

  const clearAllDecorStates = () => {
    try {
      localStorage.removeItem('banner-decor-states-v2')
    } catch {}
  }

  const reseed = (id: TemplateId) => {
    clearDecorStates(id)
    setSeeds(prev => {
      const newSeeds = { ...prev }
      newSeeds[id] = randomSeed()
      return newSeeds
    })
  }

  const reseedAll = () => {
    clearAllDecorStates()
    const newSeeds: Record<TemplateId, number> = {} as any
    ALL_TEMPLATE_IDS.forEach(id => {
      newSeeds[id] = randomSeed()
    })
    setSeeds(newSeeds)
  }

  const getSampledDecor = useCallback((templateId: TemplateId, seed: number) => {
    const originalSlots = campaign.templateSlots[templateId]
    if (!originalSlots?.decorElements) return []
    return sampleLayout(originalSlots.decorElements, seed)
  }, [campaign.templateSlots])

  const handleCampaignChange = (id: string) => {
    const c = CAMPAIGNS.find(x => x.id)!
    setCampaignId(id)
    setContent(c.defaultContent)
    
    const newTemplateGroups = c.sectionConfig?.templateGroups ?? DEFAULT_TEMPLATE_GROUPS
    const firstAppSection = Object.keys(newTemplateGroups.app)[0]
    const firstPcSection = Object.keys(newTemplateGroups.pc)[0]
    
    setActiveSection({
      app: firstAppSection ?? 'banner',
      pc: firstPcSection ?? 'banner',
    })
  }

  const handleExportAll = useCallback(async () => {
    setExporting(true)
    try {
      const entries = ALL_TEMPLATE_IDS
        .map(id => ({ el: exportRefs[id] as HTMLElement, templateId: id }))
        .filter(e => e.el != null)
      await exportAllAsZip(entries, campaign.name)
    } finally {
      setExporting(false)
    }
  }, [campaign.name, exportRefs])

  const handleExportSingle = useCallback(async (id: TemplateId, format: 'png' | 'gif' = 'png') => {
    const el = exportRefs[id]
    if (!el) return
    setExporting(true)
    try {
      if (format === 'gif') {
        alert('GIF 导出功能需要额外的 GIF 库支持！\n\n当前可以使用以下方案：\n1. 使用录屏软件录制动效\n2. 安装 gif.js 库后实现完整 GIF 导出\n\n动效预览功能已正常工作！')
        return
      }
      
      const blob = await exportTemplate(el)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaign.name}_${TEMPLATE_INFO[id].label}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }, [campaign.name, exportRefs])

  const handleAIGenerate = useCallback(async () => {
    setAiGenerating(true)
    setAiError(null)

    try {
      const heroElements = campaign.assets.hero.map(hero => ({
        id: hero.id,
        label: hero.label,
        path: hero.path,
        type: 'hero' as const
      }))

      const decorElements = GLOBAL_DECOR.map(d => ({
        id: d.id,
        label: d.label,
        path: d.path,
        type: 'decor' as const
      }))

      const patternElement = GLOBAL_BACKGROUNDS[0]
      const patternToSend = patternElement ? {
        id: patternElement.id,
        label: patternElement.label,
        path: patternElement.path,
        type: 'pattern' as const
      } : undefined

      const targets = visibleIds.map(id => ({
        templateId: id,
        width: TEMPLATE_INFO[id].width,
        height: TEMPLATE_INFO[id].height
      }))

      const request: CozeWorkflowRequest = {
        service: 'coze-workflow',
        eventName: campaign.name,
        title: content.title,
        subtitle: content.subtitle,
        cta: content.cta,
        tags: content.tags,
        heroElements,
        decorElements,
        patternElement: patternToSend,
        prompt: aiPrompt,
        targets,
        colors: {
          primary: campaign.colors.primary,
          gradients: campaign.colors.gradients
        }
      }

      const service = new CozeWorkflowService()
      const response = await service.generateWorkflow(request)
      console.log('Coze API Response:', response)
      setAiResults(response)

      const newAiImages: Record<TemplateId, string> = {}
      const newTemplateModes: Record<TemplateId, 'ai' | 'manual'> = { ...templateModes }
      
      if (response.results && response.results.length > 0) {
        response.results.forEach(item => {
          const templateId = item.templateId as TemplateId
          if (item.imageData) {
            newAiImages[templateId] = item.imageData
            newTemplateModes[templateId] = 'ai'
          }
        })
      }
      
      console.log('Saving AI images:', newAiImages)
      setAiGeneratedImages(prev => ({ ...prev, ...newAiImages }))
      setTemplateModes(newTemplateModes)

    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI 生成失败')
    } finally {
      setAiGenerating(false)
    }
  }, [campaign, content, aiPrompt, visibleIds, templateModes])

  const handleTemplateModeSwitch = useCallback((templateId: TemplateId, mode: 'ai' | 'manual') => {
    setTemplateModes(prev => ({ ...prev, [templateId]: mode }))
  }, [])

  const handlePlatformSwitch = (p: Platform) => {
    const targetHasCurrent = templateGroups[p] && !!templateGroups[p][currentSection]
    
    if (targetHasCurrent) {
      if (activeSection[p] !== currentSection) {
        setActiveSection(prev => ({ ...prev, [p]: currentSection }))
      }
    } else {
      const pSections = Object.keys(templateGroups[p])
      setActiveSection(prev => ({ ...prev, [p]: pSections[0] ?? 'banner' }))
    }
    
    setActivePlatform(p)
  }

  const handleSectionSwitch = (s: string) => {
    const pWithS = PLATFORMS.find(p => templateGroups[p] && templateGroups[p][s])
    if (pWithS) {
      if (!templateGroups[activePlatform]?.[s]) {
        setActivePlatform(pWithS)
      }
      setActiveSection(prev => ({ ...prev, [activePlatform]: s }))
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
      color: '#fff', 
      fontFamily: 'ChillRoundF, DouyinSans, sans-serif',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0'
    }}>

      {/* Top navigation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 28px',
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 9999,
            background: 'transparent',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          ← 返回
        </button>
        
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🚀 AI 一键生成套图</h2>
        
        <button
          onClick={onStartCreating}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #52c41a, #73d13d)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          去手动编辑 →
        </button>
      </div>

      <div style={{ display: 'flex', height: '100vh', paddingTop: 80 }}>
        {/* Left sidebar */}
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', flexShrink: 0, height: 'calc(100vh - 80px)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', borderRadius: '0 24px 24px 0' }}>
          <div style={{ padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                活动场景
              </div>
              <CampaignSelector campaigns={CAMPAIGNS} selected={campaignId} onSelect={handleCampaignChange} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                AI 创作要求
              </div>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="描述你要生成的Banner风格、主题、色调等..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'ChillRoundF, DouyinSans, sans-serif',
                  minHeight: 100,
                  resize: 'vertical'
                }}
              />
              {aiError && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'rgba(255,77,79,0.2)', border: '1px solid rgba(255,77,79,0.4)', color: '#ffccc7', fontSize: 13 }}>
                  {aiError}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                内容填写
              </div>
              <ContentForm content={content} colors={campaign.colors} onChange={setContent} formConfig={campaign.formConfig} />
            </div>

            {/* 动效开关 */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                动效设置
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: 12 }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontFamily: 'ChillRoundF, DouyinSans, sans-serif' }}>
                  上下浮动动效
                </div>
                <button
                  onClick={() => setAnimationEnabled(!animationEnabled)}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: animationEnabled ? 'linear-gradient(135deg, #52c41a, #73d13d)' : 'rgba(255,255,255,0.2)',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 3,
                    left: animationEnabled ? 25 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom buttons */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 10, flexShrink: 0, flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={reseedAll}
                style={{ flex: 1, border: 'none', borderRadius: 9999, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'rgba(255,255,255,0.9)', transition: 'all 0.2s', background: 'rgba(255,255,255,0.1)' }}
              >
                🎲 换一版
              </button>
              <button
                onClick={handleExportAll}
                disabled={exporting}
                style={{ flex: 1, border: 'none', borderRadius: 9999, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', color: exporting ? 'rgba(255,255,255,0.4)' : '#fff', transition: 'all 0.2s', background: 'rgba(255,255,255,0.15)' }}
              >
                {exporting ? '导出中…' : '⬇ 下载全套'}
              </button>
            </div>
            <button
              onClick={() => { resetAllDragState(); window.location.reload() }}
              style={{ width: '100%', border: 'none', borderRadius: 9999, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s', background: 'rgba(255,255,255,0.06)' }}
            >
              ↺ 重置位置
            </button>
            <button
              onClick={handleAIGenerate}
              disabled={aiGenerating}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 9999,
                border: 'none',
                background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: aiGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: aiGenerating ? 0.6 : 1
              }}
            >
              {aiGenerating ? '⏳ AI 生成中…' : '🚀 AI 一键生成'}
            </button>
          </div>
        </div>

        {/* Main preview area */}
        <div style={{ 
          flex: 1, 
          height: 'calc(100vh - 80px)', 
          display: 'flex', 
          overflow: 'hidden',
          background: 'transparent'
        }}>
          {/* Content area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'transparent' }}>
            {aiGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
                <div style={{ fontSize: 64, marginBottom: 20, animation: 'pulse 1.5s ease-in-out infinite' }}>🖌️</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>AI 正在创作中…</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>后台正在整理素材、生成各尺寸Banner</div>
              </div>
            ) : (
              <>
                {aiResults && aiResults.results.length > 0 && (
                  <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, background: 'rgba(82,196,26,0.1)', border: '1px solid rgba(82,196,26,0.3)', color: '#d4ffbd' }}>
                    ✅ AI 生成完成！共生成 {aiResults.results.length} 个Banner，已自动应用到下方。您可以点击模板下方的按钮在「AI生成」和「手动编辑」之间切换。
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
                  {visibleIds.map(id => {
                    const slots = campaign.templateSlots[id] ?? { decorElements: [] }
                    const sampledDecor: SampledDecorElement[] = getSampledDecor(id, seeds[id])
                    const comp = TEMPLATE_INFO[id].compositeWith
                    const bgSlots: TemplateSlots | undefined = comp ? (campaign.templateSlots[comp.templateId] ?? { decorElements: [] }) : undefined
                    const bgSampledDecor: SampledDecorElement[] | undefined = comp ? getSampledDecor(comp.templateId, seeds[comp.templateId]) : undefined
                    
                    return (
                      <div key={`${id}-${seeds[id]}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <TemplatePreviewCard
                          key={`${id}-${seeds[id]}`}
                          templateId={id}
                          campaignId={campaignId}
                          colors={campaign.colors}
                          content={content}
                          slots={slots}
                          sampledDecor={sampledDecor}
                          bgSlots={bgSlots}
                          bgSampledDecor={bgSampledDecor}
                          onExportRef={el => { exportRefs[id] = el }}
                          animationEnabled={animationEnabled}
                          mode={templateModes[id]}
                          aiImage={aiGeneratedImages[id]}
                          onModeSwitch={handleTemplateModeSwitch}
                        />
                        
                        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button
                              onClick={() => reseed(id)}
                              style={{ flex: 1, border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'rgba(255,255,255,0.8)', transition: 'all 0.2s', background: 'rgba(255,255,255,0.1)' }}
                            >
                              🎲 换这张
                            </button>
                            <button
                              onClick={() => handleExportSingle(id, 'png')}
                              disabled={exporting}
                              style={{ flex: 1, border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer', color: exporting ? 'rgba(255,255,255,0.4)' : '#fff', transition: 'all 0.2s', background: 'rgba(255,255,255,0.15)' }}
                            >
                              🖼 导出PNG
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ width: 140, display: 'flex', flexDirection: 'column', flexShrink: 0, height: 'calc(100vh - 80px)', padding: '32px 16px', gap: 24, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', borderRadius: '24px 0 0 24px' }}>
            {/* Section segment control */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                类型
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, padding: 6, gap: 4, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.6)' }}>
                {allSections.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSectionSwitch(s)}
                    style={{
                      padding: '12px 16px',
                      background: currentSection === s ? 'rgba(255,255,255,0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'ChillRoundF, DouyinSans, sans-serif',
                      color: currentSection === s ? '#fff' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    {sectionLabels[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform segment control */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                平台
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, padding: 6, gap: 4, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.6)' }}>
                {sectionPlatforms.map(p => (
                  <button
                    key={p}
                    onClick={() => handlePlatformSwitch(p)}
                    style={{
                      padding: '12px 16px',
                      background: activePlatform === p ? 'rgba(255,255,255,0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'ChillRoundF, DouyinSans, sans-serif',
                      color: activePlatform === p ? '#fff' : 'rgba(255,255,255,0.6)',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
