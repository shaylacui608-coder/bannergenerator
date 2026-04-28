import { useState, useEffect } from 'react'
import type { UnifiedAsset } from './unified-assets'
import { GLOBAL_ASSETS, SPRING_FESTIVAL_HERO_ASSETS, DAILY_PROMOTION_HERO_ASSETS, getAssetsForCampaign } from './unified-assets'

const STORAGE_KEY = 'banner-assets-config-v4' // 升级版本，支持用户上传素材
const USER_ASSETS_KEY = 'banner-user-assets-v1' // 用户上传的素材存储
const SELECTED_ASSETS_KEY = 'banner-selected-assets-v1' // 用户选中的素材存储

interface AssetStore {
  [assetId: string]: {
    category: 'hero' | 'decor' | 'background'
    campaignSpecific?: string
  }
}

interface UserUploadedAsset {
  id: string
  label: string
  path: string // base64 数据
  category: 'hero' | 'decor' | 'background'
  width?: number
  height?: number
  isUserUploaded: true
}

interface SelectedAssets {
  hero: string | null // 只允许选择 1 个主体素材
  decor: string[] // 可以选择多个辅助素材
  background: string[] // 可以选择多个背景素材
}

function getDefaultStore(): AssetStore {
  const store: AssetStore = {}
  
  const allAssets = [
    ...SPRING_FESTIVAL_HERO_ASSETS,
    ...DAILY_PROMOTION_HERO_ASSETS,
    ...GLOBAL_ASSETS,
  ]
  
  allAssets.forEach(asset => {
    store[asset.id] = {
      category: asset.category,
      campaignSpecific: asset.campaignSpecific,
    }
  })
  
  return store
}

function loadFromStorage(): AssetStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load asset config from storage', e)
  }
  localStorage.removeItem('banner-assets-config-v2')
  localStorage.removeItem('banner-assets-config-v3')
  return getDefaultStore()
}

function saveToStorage(store: AssetStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (e) {
    console.error('Failed to save asset config to storage', e)
  }
}

function loadUserAssets(): UserUploadedAsset[] {
  try {
    const stored = localStorage.getItem(USER_ASSETS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load user assets from storage', e)
  }
  return []
}

function saveUserAssets(assets: UserUploadedAsset[]) {
  try {
    localStorage.setItem(USER_ASSETS_KEY, JSON.stringify(assets))
  } catch (e) {
    console.error('Failed to save user assets to storage', e)
  }
}

function loadSelectedAssets(): SelectedAssets {
  try {
    const stored = localStorage.getItem(SELECTED_ASSETS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load selected assets from storage', e)
  }
  return {
    hero: null,
    decor: [],
    background: [],
  }
}

function saveSelectedAssets(selected: SelectedAssets) {
  try {
    localStorage.setItem(SELECTED_ASSETS_KEY, JSON.stringify(selected))
  } catch (e) {
    console.error('Failed to save selected assets to storage', e)
  }
}

// 获取带用户配置的素材列表（包括用户上传的素材）
export function getAssetsWithUserConfig(campaignId: string): (UnifiedAsset | UserUploadedAsset)[] {
  const store = loadFromStorage()
  const defaultAssets = getAssetsForCampaign(campaignId)
  const userAssets = loadUserAssets()
  
  const seen = new Set<string>()
  const allAssets: (UnifiedAsset | UserUploadedAsset)[] = []
  
  defaultAssets.forEach(asset => {
    if (!seen.has(asset.id)) {
      seen.add(asset.id)
      const userConfig = store[asset.id]
      if (userConfig) {
        allAssets.push({
          ...asset,
          category: userConfig.category,
          campaignSpecific: userConfig.campaignSpecific,
        })
      } else {
        allAssets.push(asset)
      }
    }
  })
  
  userAssets.forEach(asset => {
    if (!seen.has(asset.id)) {
      seen.add(asset.id)
      allAssets.push(asset)
    }
  })
  
  return allAssets
}

// 上传新素材
export function uploadUserAsset(file: File, category: 'hero' | 'decor' | 'background'): Promise<UserUploadedAsset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const id = `user-asset-${Date.now()}`
      const label = file.name.replace(/\.[^/.]+$/, '')
      const path = e.target?.result as string
      
      const newAsset: UserUploadedAsset = {
        id,
        label,
        path,
        category,
        isUserUploaded: true,
      }
      
      const userAssets = loadUserAssets()
      userAssets.push(newAsset)
      saveUserAssets(userAssets)
      
      resolve(newAsset)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 删除用户上传的素材
export function deleteUserAsset(assetId: string) {
  const userAssets = loadUserAssets()
  const filtered = userAssets.filter(asset => asset.id !== assetId)
  saveUserAssets(filtered)

  // 删除的时候同时从选中素材里移除
  const selected = loadSelectedAssets()
  if (selected.hero === assetId) {
    selected.hero = null
  }
  selected.decor = selected.decor.filter(id => id !== assetId)
  selected.background = selected.background.filter(id => id !== assetId)
  saveSelectedAssets(selected)
}

// 更新单个素材的分类
export function updateAssetCategory(assetId: string, newCategory: 'hero' | 'decor' | 'background') {
  const store = loadFromStorage()
  
  const userAssets = loadUserAssets()
  const userAsset = userAssets.find(a => a.id === assetId)
  if (userAsset) {
    userAsset.category = newCategory
    saveUserAssets(userAssets)
    return
  }
  
  if (store[assetId]) {
    store[assetId].category = newCategory
  } else {
    const allAssets = [
      ...SPRING_FESTIVAL_HERO_ASSETS,
      ...DAILY_PROMOTION_HERO_ASSETS,
      ...GLOBAL_ASSETS,
    ]
    const asset = allAssets.find(a => a.id === assetId)
    if (asset) {
      store[assetId] = {
        category: newCategory,
        campaignSpecific: asset.campaignSpecific,
      }
    }
  }
  saveToStorage(store)
}

// 切换选中主体素材（单选）
export function toggleSelectedHero(assetId: string) {
  const selected = loadSelectedAssets()
  selected.hero = selected.hero === assetId ? null : assetId
  saveSelectedAssets(selected)
}

// 切换选中辅助素材（多选）
export function toggleSelectedDecor(assetId: string) {
  const selected = loadSelectedAssets()
  const idx = selected.decor.indexOf(assetId)
  if (idx >= 0) {
    selected.decor.splice(idx, 1)
  } else {
    selected.decor.push(assetId)
  }
  saveSelectedAssets(selected)
}

// 切换选中背景素材（多选）
export function toggleSelectedBackground(assetId: string) {
  const selected = loadSelectedAssets()
  const idx = selected.background.indexOf(assetId)
  if (idx >= 0) {
    selected.background.splice(idx, 1)
  } else {
    selected.background.push(assetId)
  }
  saveSelectedAssets(selected)
}

// 获取选中的素材
export function getSelectedAssets(): SelectedAssets {
  return loadSelectedAssets()
}

// 模块级监听器集合：所有 useAssetManager 实例共享同一份 selectedAssets
// 任何一个实例更新后会广播给其他所有实例，保证 App.tsx 和 AssetLibrary.tsx 实时同步
const selectionListeners = new Set<(s: SelectedAssets) => void>()

function broadcastSelection(next: SelectedAssets) {
  selectionListeners.forEach(fn => fn(next))
}

// React Hook - 管理素材状态
export function useAssetManager(campaignId: string) {
  const [assets, setAssets] = useState<(UnifiedAsset | UserUploadedAsset)[]>(() => {
    return getAssetsWithUserConfig(campaignId)
  })

  const [selectedAssets, setSelectedAssets] = useState<SelectedAssets>(() => {
    return loadSelectedAssets()
  })

  useEffect(() => {
    setAssets(getAssetsWithUserConfig(campaignId))
  }, [campaignId])

  // 注册本实例的 setter，当其他实例更新时同步过来
  useEffect(() => {
    const sync = (s: SelectedAssets) => setSelectedAssets(s)
    selectionListeners.add(sync)
    return () => { selectionListeners.delete(sync) }
  }, [])

  const moveAsset = (assetId: string, newCategory: 'hero' | 'decor' | 'background') => {
    updateAssetCategory(assetId, newCategory)
    setAssets(getAssetsWithUserConfig(campaignId))
  }

  const uploadAsset = async (file: File, category: 'hero' | 'decor' | 'background') => {
    await uploadUserAsset(file, category)
    setAssets(getAssetsWithUserConfig(campaignId))
  }

  const deleteAsset = (assetId: string) => {
    deleteUserAsset(assetId)
    setAssets(getAssetsWithUserConfig(campaignId))
    const loaded = loadSelectedAssets()
    const next = { hero: loaded.hero, decor: [...loaded.decor], background: [...loaded.background] }
    setSelectedAssets(next)
    broadcastSelection(next)
  }

  const toggleHero = (assetId: string) => {
    toggleSelectedHero(assetId)
    const loaded = loadSelectedAssets()
    const next = { hero: loaded.hero, decor: [...loaded.decor], background: [...loaded.background] }
    setSelectedAssets(next)
    broadcastSelection(next)
  }

  const toggleDecor = (assetId: string) => {
    toggleSelectedDecor(assetId)
    const loaded = loadSelectedAssets()
    const next = { hero: loaded.hero, decor: [...loaded.decor], background: [...loaded.background] }
    setSelectedAssets(next)
    broadcastSelection(next)
  }

  const toggleBackground = (assetId: string) => {
    toggleSelectedBackground(assetId)
    const loaded = loadSelectedAssets()
    const next = { hero: loaded.hero, decor: [...loaded.decor], background: [...loaded.background] }
    setSelectedAssets(next)
    broadcastSelection(next)
  }

  return {
    assets,
    selectedAssets,
    moveAsset,
    uploadAsset,
    deleteAsset,
    toggleHero,
    toggleDecor,
    toggleBackground,
  }
}
