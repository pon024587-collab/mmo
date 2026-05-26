/**
 * デバイスフィンガープリント管理
 * ブラウザシグナルからSHA-256ハッシュを生成してサブ垢を防止する
 */
import { createHash } from 'crypto'

export interface DeviceFingerprintSignals {
  userAgent?: string
  screenResolution?: string
  timezone?: string
  installedFonts?: string[]
  webglRenderer?: string
  ipAddress?: string
}

export interface DeviceFingerprint {
  hash: string
  signals: DeviceFingerprintSignals
}

/**
 * シグナルからSHA-256ハッシュを生成する（決定論的）
 * 一部シグナルが取得不可能な場合は取得可能なシグナルのみで生成する
 */
export function generateFingerprintHash(signals: DeviceFingerprintSignals): string {
  const parts: string[] = []

  if (signals.userAgent) parts.push(`ua:${signals.userAgent}`)
  if (signals.screenResolution) parts.push(`res:${signals.screenResolution}`)
  if (signals.timezone) parts.push(`tz:${signals.timezone}`)
  if (signals.installedFonts?.length) {
    const sortedFonts = [...signals.installedFonts].sort().join(',')
    parts.push(`fonts:${sortedFonts}`)
  }
  if (signals.webglRenderer) parts.push(`webgl:${signals.webglRenderer}`)
  if (signals.ipAddress) parts.push(`ip:${signals.ipAddress}`)

  if (parts.length === 0) {
    throw new Error('フィンガープリントシグナルが1つも取得できませんでした')
  }

  const raw = parts.join('|')
  return createHash('sha256').update(raw).digest('hex')
}

/**
 * フィンガープリントデータをAES-256で暗号化する（保存用）
 * 実際の暗号化キーは環境変数から取得する
 */
export function encryptFingerprintData(data: DeviceFingerprintSignals): Buffer {
  // 本番環境ではAES-256-GCMで暗号化する
  // 現在はJSONシリアライズのみ（開発用）
  return Buffer.from(JSON.stringify(data), 'utf-8')
}

export function decryptFingerprintData(encrypted: Buffer): DeviceFingerprintSignals {
  return JSON.parse(encrypted.toString('utf-8')) as DeviceFingerprintSignals
}
