// lib/pricing.ts — Pricing rule engine for Fabb.booking

export interface PricingRule {
  id: string
  name: string
  type: 'duration_discount' | 'minimum_days' | 'seasonal' | 'flat_rate'
  item_id?: string
  category?: string
  min_days?: number
  max_days?: number
  discount_pct?: number
  flat_daily_rate?: number
  start_date?: string
  end_date?: string
  active: boolean
}

export interface PricingResult {
  adjustedRate: number
  discountPct: number
  discountAmount: number
  appliedRule: string | null
  originalRate: number
}

export function applyPricingRules(
  itemId: string,
  category: string,
  days: number,
  baseRate: number,
  rules: PricingRule[],
  rentalStartDate?: string
): PricingResult {
  const activeRules = rules.filter(r => r.active)

  let bestDiscount = 0
  let appliedRule: string | null = null
  let flatRate: number | null = null

  for (const rule of activeRules) {
    // Check if rule applies to this item or category
    const appliesToItem = !rule.item_id || rule.item_id === itemId
    const appliesToCategory = !rule.category || rule.category === category
    if (!appliesToItem && !appliesToCategory) continue

    // Check seasonal date range
    if (rule.start_date && rule.end_date && rentalStartDate) {
      const start = new Date(rule.start_date)
      const end = new Date(rule.end_date)
      const rental = new Date(rentalStartDate)
      if (rental < start || rental > end) continue
    }

    if (rule.type === 'duration_discount') {
      const meetsMin = !rule.min_days || days >= rule.min_days
      const meetsMax = !rule.max_days || days <= rule.max_days
      if (meetsMin && meetsMax && rule.discount_pct && rule.discount_pct > bestDiscount) {
        bestDiscount = rule.discount_pct
        appliedRule = rule.name
      }
    }

    if (rule.type === 'flat_rate') {
      const meetsMin = !rule.min_days || days >= rule.min_days
      if (meetsMin && rule.flat_daily_rate !== undefined) {
        flatRate = rule.flat_daily_rate
        appliedRule = rule.name
      }
    }

    if (rule.type === 'seasonal' && rule.discount_pct && rule.discount_pct > bestDiscount) {
      bestDiscount = rule.discount_pct
      appliedRule = rule.name
    }
  }

  if (flatRate !== null) {
    const discountAmount = (baseRate - flatRate) * days
    return {
      adjustedRate: flatRate,
      discountPct: Math.round(((baseRate - flatRate) / baseRate) * 100),
      discountAmount: Math.max(0, discountAmount),
      appliedRule,
      originalRate: baseRate,
    }
  }

  if (bestDiscount > 0) {
    const adjustedRate = baseRate * (1 - bestDiscount / 100)
    const discountAmount = (baseRate - adjustedRate) * days
    return {
      adjustedRate,
      discountPct: bestDiscount,
      discountAmount,
      appliedRule,
      originalRate: baseRate,
    }
  }

  return {
    adjustedRate: baseRate,
    discountPct: 0,
    discountAmount: 0,
    appliedRule: null,
    originalRate: baseRate,
  }
}

export function getMinRentalDays(
  itemId: string,
  category: string,
  rules: PricingRule[]
): number {
  const minRule = rules
    .filter(r => r.active && r.type === 'minimum_days')
    .filter(r => !r.item_id || r.item_id === itemId)
    .filter(r => !r.category || r.category === category)
    .sort((a, b) => (b.min_days || 1) - (a.min_days || 1))[0]

  return minRule?.min_days || 1
}
