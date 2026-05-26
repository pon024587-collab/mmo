import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { generateFingerprintHash } from './fingerprint.js'

describe('DeviceFingerprint', () => {
  // Property 1: ハッシュの決定論性
  it('Property 1a: 同一シグナルは常に同一ハッシュを生成する', () => {
    fc.assert(
      fc.property(
        fc.record({
          userAgent: fc.string({ minLength: 1 }),
          screenResolution: fc.string({ minLength: 1 }),
          timezone: fc.string({ minLength: 1 }),
        }),
        (signals) => {
          const hash1 = generateFingerprintHash(signals)
          const hash2 = generateFingerprintHash(signals)
          return hash1 === hash2
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 1: 異なるシグナルは異なるハッシュを生成する（衝突耐性）
  it('Property 1b: 異なるUserAgentは異なるハッシュを生成する', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (ua1, ua2) => {
          fc.pre(ua1 !== ua2)
          const hash1 = generateFingerprintHash({ userAgent: ua1 })
          const hash2 = generateFingerprintHash({ userAgent: ua2 })
          return hash1 !== hash2
        }
      ),
      { numRuns: 100 }
    )
  })

  it('シグナルが1つもない場合はエラーを投げる', () => {
    expect(() => generateFingerprintHash({})).toThrow()
  })

  it('ハッシュは64文字の16進数文字列', () => {
    const hash = generateFingerprintHash({ userAgent: 'Mozilla/5.0' })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('フォントリストの順序が違っても同じハッシュ', () => {
    const h1 = generateFingerprintHash({ installedFonts: ['Arial', 'Times', 'Helvetica'] })
    const h2 = generateFingerprintHash({ installedFonts: ['Helvetica', 'Arial', 'Times'] })
    expect(h1).toBe(h2)
  })
})
