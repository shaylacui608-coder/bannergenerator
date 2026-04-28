import type { CampaignConfig } from '../types'
import { springFestival2026 } from './2026-spring-festival'
import { dailyPromotion2026 } from './2026-daily-promotion'

export const CAMPAIGNS: CampaignConfig[] = [springFestival2026, dailyPromotion2026]

export function getCampaign(id: string): CampaignConfig | undefined {
  return CAMPAIGNS.find(c => c.id === id)
}
