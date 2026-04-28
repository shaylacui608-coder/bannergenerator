import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { CAMPAIGNS } from './campaigns/registry'
import { CampaignSelector } from './components/CampaignSelector'
import { ContentForm } from './components/ContentForm'
import { AssetLibrary } from './components/AssetLibrary'
import { TemplatePreviewCard } from './components/TemplatePreviewCard'
import { Homepage } from './components/Homepage'
import { AIStandalonePage } from './components/AIStandalonePage'
import { FontSizeSelector, resetAllDragState } from './components/DraggableCanvas'
import { sampleLayout, randomSeed } from './engine/layout-sampler'
import { exportAllAsZip, exportTemplate } from './engine/export'
import { ALL_TEMPLATE_IDS, TEMPLATE_INFO, DEFAULT_TEMPLATE_GROUPS, DEFAULT_SECTION_LABELS, DEFAULT_SECTIONS } from './templates'
import type { Platform, Section } from './templates'
import type { TemplateId, SampledDecorElement, UserContent, TemplateSlots } from './types'
import { useAssetManager } from './lib/asset-manager'

const PLATFORM_LABELS: Record<Platform, string> = { app: 'APP', pc: 'PC' }
const PLATFORMS: Platform[] = ['app', 'pc']

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home')
  const initialCampaignId = CAMPAIGNS.find(c => !c.disabled)?.id ?? CAMPAIGNS[0].id
  const [campaignId, setCampaignId] = useState(initialCampaignId)
  const [seeds, setSeeds] = useState<Record<TemplateId, number>>(() =>
    Object.fromEntries(ALL_TEMPLATE_IDS.map(id => [id, randomSeed()])) as Record<TemplateId, number>
  )
  const [exporting, setExporting] = useState(false)
  const [activePlatform, setActivePlatform] = useState<Platform>('app')
  const [activeSection, setActiveSection] = useState<Record<Platform, string>>({
    app: 'banner',
    pc: 'banner',
  })
  const [animationEnabled, setAnimationEnabled] = useState(false)
  const exportRefs = useRef<Partial<Record<TemplateId, HTMLElement | null>>>({})

  const { assets, selectedAssets } = useAssetManager(campaignId)
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

  const selectedHeroPath = useMemo(() => {
    if (!selectedAssets.hero) return undefined
    const asset = assets.find(a => a.id === selectedAssets.hero)
    return asset?.path
  }, [selectedAssets.hero, assets])

  const selectedDecorPaths = useMemo(() => {
    const paths = selectedAssets.decor.map(id => {
      const asset = assets.find(a => a.id === id)
      return asset?.path
    }).filter((p): p is string => !!p)
    return paths
  }, [selectedAssets.decor, assets])

  const selectedBgPaths = useMemo(() => {
    const paths = selectedAssets.background.map(id => {
      const asset = assets.find(a => a.id === id)
      return asset?.path
    }).filter((p): p is string => !!p)
    return paths
  }, [selectedAssets.background, assets])

  useEffect(() => {
    reseedAll()
  }, [selectedHeroPath, selectedDecorPaths.join(','), selectedBgPaths.join(',')])

  const modifiedTemplateSlots = useMemo(() => {
    const newSlots: Record<string, any> = {}
    Object.keys(campaign.templateSlots).forEach(templateId => {
      const original = campaign.templateSlots[templateId as any]
      const modified = { ...original }
      
      if (selectedHeroPath) {
        if ('bannerHero' in modified) modified.bannerHero = selectedHeroPath
        if ('mascot' in modified) modified.mascot = selectedHeroPath
        if ('arcGroup' in modified) modified.arcGroup = selectedHeroPath
      }
      
      if (selectedBgPaths.length > 0 && 'bgPattern' in modified) modified.bgPattern = selectedBgPaths[0]
      
      if (selectedDecorPaths.length > 0 && modified.decorElements) {
        modified.decorElements = modified.decorElements.map((el, idx) => ({
          ...el,
          asset: selectedDecorPaths[idx % selectedDecorPaths.length],
        }))
      }
      
      newSlots[templateId] = modified
    })
    
    return newSlots
  }, [campaign.templateSlots, selectedHeroPath, selectedDecorPaths, selectedBgPaths])

  const getSampledDecor = useCallback((templateId: TemplateId, seed: number) => {
    const originalSlots = modifiedTemplateSlots[templateId]
    if (!originalSlots?.decorElements) return []
    
    let elements = originalSlots.decorElements
    
    if (selectedDecorPaths.length > 0) {
      const seededRand = (s: number) => {
        let r = s
        return () => {
          r = (r * 1664525 + 1013904223) & 0xffffffff
          return (r >>> 0) / 0xffffffff
        }
      }
      const rand = seededRand(seed)
      
      elements = originalSlots.decorElements.map((el, idx) => {
        const randomPath = selectedDecorPaths[Math.floor(rand() * selectedDecorPaths.length)]
        return { ...el, asset: randomPath }
      })
    }
    
    return sampleLayout(elements, seed)
  }, [modifiedTemplateSlots, selectedDecorPaths])

  const handleCampaignChange = (id: string) => {
    const c = CAMPAIGNS.find(x => x.id)
    if (!c || c.disabled) {
      const availableCampaign = CAMPAIGNS.find(c2 => !c2.disabled)
      if (availableCampaign) {
        alert('该场景暂未开放，已为您切换到可用场景')
        setCampaignId(availableCampaign.id)
        setContent(availableCampaign.defaultContent)
        
        const newTemplateGroups = availableCampaign.sectionConfig?.templateGroups ?? DEFAULT_TEMPLATE_GROUPS
        const firstAppSection = Object.keys(newTemplateGroups.app)[0]
        const firstPcSection = Object.keys(newTemplateGroups.pc)[0]
        
        setActiveSection({
          app: firstAppSection ?? 'banner',
          pc: firstPcSection ?? 'banner',
        })
      }
      return
    }
    
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
        .map(id => ({ el: exportRefs.current[id] as HTMLElement, templateId: id }))
        .filter(e => e.el != null)
      await exportAllAsZip(entries, campaign.name)
    } finally {
      setExporting(false)
    }
  }, [campaign.name])

  const handleExportSingle = useCallback(async (id: TemplateId, format: 'png' | 'gif' = 'png') => {
    const el = exportRefs.current[id]
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
  }, [campaign.name])

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
      if (!templateGroups[activePlatform]?.[s]) setActivePlatform(pWithS)
      setActiveSection(prev => ({ ...prev, [activePlatform]: s }))
    }
  }

  if (currentPage === 'home') {
    return <Homepage onStartCreating={() => setCurrentPage('app')} onStartAIGenerate={() => setCurrentPage('ai')} />
  }

  if (currentPage === 'ai') {
    return <AIStandalonePage onBack={() => setCurrentPage('home')} onStartCreating={() => setCurrentPage('app')} />
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

      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: 340, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', borderRadius: '0 24px 24px 0' }}>
          <div style={{ padding: 28, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                padding: '10px 16px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 9999,
                background: 'transparent',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: 'fit-content'
              }}
            >
              ← 返回
            </button>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                活动场景
              </div>
              <CampaignSelector campaigns={CAMPAIGNS} selected={campaignId} onSelect={handleCampaignChange} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
                内容填写
              </div>
              <ContentForm content={content} colors={campaign.colors} onChange={setContent} formConfig={campaign.formConfig} />
            </div>

            <AssetLibrarySection campaignId={campaignId} />

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
                    position: 'relative'
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
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          height: '100vh', 
          display: 'flex', 
          overflow: 'hidden',
          background: 'transparent'
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'transparent' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
              {visibleIds.map(id => {
                const slots = modifiedTemplateSlots[id] ?? { decorElements: [] }
                const sampledDecor: SampledDecorElement[] = getSampledDecor(id, seeds[id])
                const comp = TEMPLATE_INFO[id].compositeWith
                const bgSlots: TemplateSlots | undefined = comp ? (modifiedTemplateSlots[comp.templateId] ?? { decorElements: [] }) : undefined
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
                      onExportRef={el => { exportRefs.current[id] = el }}
                      animationEnabled={animationEnabled}
                    />
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                      <FontSizeSelector
                        templateId={id}
                        elementKey="title"
                        initialFontSize={24}
                        label="标题大小"
                      />
                      <FontSizeSelector
                        templateId={id}
                        elementKey="subtitle"
                        initialFontSize={16}
                        label="副标题大小"
                      />
                    </div>

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
                      {animationEnabled && (
                        <button
                          onClick={() => handleExportSingle(id, 'gif')}
                          disabled={exporting}
                          style={{ width: '100%', border: 'none', borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer', color: exporting ? 'rgba(255,255,255,0.4)' : '#fff', transition: 'all 0.2s', background: 'linear-gradient(135deg, #52c41a, #73d13d)' }}
                        >
                          🎬 导出GIF
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ width: 140, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', padding: '32px 16px', gap: 24, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', borderRadius: '24px 0 0 24px' }}>
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
                      fontSize: 13, fontWeight: 600,
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

function AssetLibrarySection({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 14 : 0 }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'ChillRoundF, DouyinSans, sans-serif', letterSpacing: 2, textTransform: 'uppercase' }}>
          素材库
        </div>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && <AssetLibrary campaignId={campaignId} />}
    </div>
  )
}
