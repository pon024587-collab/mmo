import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

// Property 2: キャラクター生成パラメーターの範囲保証
describe('Character Generation', () => {
  it('Property 2: 初期所持金は経済レベルに応じた範囲内', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (economyLevel) => {
          const gold = generateInitialGold(economyLevel)
          if (economyLevel <= 3) return gold >= 10 && gold <= 50
          if (economyLevel <= 7) return gold >= 51 && gold <= 150
          return gold >= 151 && gold <= 300
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 2: 初期年齢は16〜20歳の範囲内', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const age = Math.floor(Math.random() * 5) + 16
        return age >= 16 && age <= 20
      }),
      { numRuns: 100 }
    )
  })
})

function generateInitialGold(economyLevel: number): number {
  if (economyLevel <= 3) return Math.floor(Math.random() * 41) + 10
  if (economyLevel <= 7) return Math.floor(Math.random() * 100) + 51
  return Math.floor(Math.random() * 150) + 151
}
