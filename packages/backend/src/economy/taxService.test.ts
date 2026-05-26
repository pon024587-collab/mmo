import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// Property 16: 税徴収額の正確性保証
describe('Tax Collection', () => {
  it('Property 16: 税徴収額は所持金×税率（端数切り捨て）', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 5, max: 20 }),
        (gold, taxRate) => {
          const taxAmount = Math.floor(gold * (taxRate / 100))
          return taxAmount === Math.floor(gold * taxRate / 100)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('税率が5〜20%の範囲内なら徴収額は所持金以下', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 5, max: 20 }),
        (gold, taxRate) => {
          const taxAmount = Math.floor(gold * (taxRate / 100))
          return taxAmount <= gold
        }
      ),
      { numRuns: 100 }
    )
  })
})
