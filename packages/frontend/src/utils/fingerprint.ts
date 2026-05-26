/**
 * デバイスフィンガープリント収集（フロントエンド）
 */
export interface FingerprintSignals {
  userAgent?: string
  screenResolution?: string
  timezone?: string
  installedFonts?: string[]
  webglRenderer?: string
}

export async function collectFingerprint(): Promise<FingerprintSignals> {
  const signals: FingerprintSignals = {}

  try { signals.userAgent = navigator.userAgent } catch {}
  try { signals.screenResolution = `${screen.width}x${screen.height}` } catch {}
  try { signals.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } catch {}

  // WebGLレンダラー情報
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      if (ext) signals.webglRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string
    }
  } catch {}

  return signals
}
