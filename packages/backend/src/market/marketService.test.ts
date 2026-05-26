import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { calculateMarketPrice } from './marketService.js'

describe('Market Price Calculation', () => {
  // Property 7: 市場価格は基準価格の50%〜200%の範囲内
  it('Property 7: 市場価格は基準価格の50%〜200%の範囲内に収まる', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 500 }),
        (basePrice, stockQuantity, recentSales) => {
          const price = calculateMarketPrice(basePrice, stockQuantity, recentSales)
          return price >= Math.ceil(basePrice * 0.5) && price <= Math.floor(basePrice * 2.0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('在庫0のとき価格は基準価格より高い', () => {
    const price = calculateMarketPrice(100, 0, 0)
    expect(price).toBeGreaterThanOrEqual(100)
  })

  it('在庫が多いとき価格は基準価格より低い', () => {
    const price = calculateMarketPrice(100, 200, 0)
    expect(price).toBeLessThanOrEqual(100)
  })
})
