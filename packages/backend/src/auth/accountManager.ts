/**
 * Account_Manager
 * アカウント登録・認証・デバイス管理
 */
import bcrypt from 'bcryptjs'
import { sql } from '../db/client.js'
import {
  generateFingerprintHash,
  encryptFingerprintData,
  type DeviceFingerprintSignals,
} from './fingerprint.js'

const BCRYPT_ROUNDS = 12

export interface RegisterRequest {
  email: string
  password: string
  fingerprintSignals: DeviceFingerprintSignals
  ipAddress?: string
}

export interface RegisterResult {
  success: boolean
  playerId?: string
  errorCode?: 'DUPLICATE_ACCOUNT' | 'DUPLICATE_FINGERPRINT' | 'FINGERPRINT_COLLECTION_FAILED'
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
  fingerprintSignals: DeviceFingerprintSignals
  ipAddress?: string
}

export interface LoginResult {
  success: boolean
  playerId?: string
  requiresVerification?: boolean
  errorCode?: 'INVALID_CREDENTIALS' | 'DEVICE_MISMATCH' | 'ACCOUNT_INACTIVE'
  message?: string
}

/**
 * 新規アカウント登録
 */
export async function register(req: RegisterRequest): Promise<RegisterResult> {
  const signals = { ...req.fingerprintSignals, ipAddress: req.ipAddress }

  // フィンガープリントハッシュ生成
  let fpHash: string
  try {
    fpHash = generateFingerprintHash(signals)
  } catch {
    return {
      success: false,
      errorCode: 'FINGERPRINT_COLLECTION_FAILED',
      message: 'デバイス情報の収集に失敗しました。ブラウザの設定を確認してください。',
    }
  }

  // 同一フィンガープリントの既存アカウントを確認
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM players
    WHERE device_fingerprint_hash = ${fpHash} AND is_active = true
    LIMIT 1
  `
  if (existing.length > 0) {
    return {
      success: false,
      errorCode: 'DUPLICATE_FINGERPRINT',
      message: 'このデバイスには既にアカウントが存在します。既存アカウントでログインしてください。',
    }
  }

  // メールアドレス重複確認
  const emailExists = await sql<{ id: string }[]>`
    SELECT id FROM players WHERE email = ${req.email} LIMIT 1
  `
  if (emailExists.length > 0) {
    return {
      success: false,
      errorCode: 'DUPLICATE_ACCOUNT',
      message: 'このメールアドレスは既に使用されています。',
    }
  }

  // パスワードハッシュ化・アカウント作成
  const passwordHash = await bcrypt.hash(req.password, BCRYPT_ROUNDS)
  const fpData = encryptFingerprintData(signals)

  const [player] = await sql<{ id: string }[]>`
    INSERT INTO players (email, password_hash, device_fingerprint_hash, device_fingerprint_data)
    VALUES (${req.email}, ${passwordHash}, ${fpHash}, ${fpData})
    RETURNING id
  `

  return { success: true, playerId: player!.id }
}

/**
 * ログイン認証
 */
export async function login(req: LoginRequest): Promise<LoginResult> {
  const [player] = await sql<{
    id: string
    passwordHash: string
    deviceFingerprintHash: string
    isActive: boolean
  }[]>`
    SELECT id, password_hash, device_fingerprint_hash, is_active
    FROM players WHERE email = ${req.email} LIMIT 1
  `

  if (!player) {
    return { success: false, errorCode: 'INVALID_CREDENTIALS', message: 'メールアドレスまたはパスワードが正しくありません。' }
  }

  if (!player.isActive) {
    return { success: false, errorCode: 'ACCOUNT_INACTIVE', message: 'このアカウントは無効化されています。' }
  }

  const passwordMatch = await bcrypt.compare(req.password, player.passwordHash)
  if (!passwordMatch) {
    return { success: false, errorCode: 'INVALID_CREDENTIALS', message: 'メールアドレスまたはパスワードが正しくありません。' }
  }

  // デバイスフィンガープリント検証
  const signals = { ...req.fingerprintSignals, ipAddress: req.ipAddress }
  let currentHash: string
  try {
    currentHash = generateFingerprintHash(signals)
  } catch {
    return { success: false, errorCode: 'DEVICE_MISMATCH', message: 'デバイス情報の収集に失敗しました。' }
  }

  if (currentHash !== player.deviceFingerprintHash) {
    // デバイスが異なる → メール確認コードが必要
    return {
      success: false,
      requiresVerification: true,
      playerId: player.id,
      errorCode: 'DEVICE_MISMATCH',
      message: '新しいデバイスからのログインを検出しました。メールで確認コードを送信します。',
    }
  }

  return { success: true, playerId: player.id }
}
