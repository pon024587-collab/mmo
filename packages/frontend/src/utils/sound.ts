export const SoundManager = {
  // BGM用のAudio要素
  bgmAudio: null as HTMLAudioElement | null,

  playClick: () => {
    playTone(600, 'sine', 0.1)
  },

  playSuccess: () => {
    playTone(800, 'sine', 0.1)
    setTimeout(() => playTone(1200, 'sine', 0.15), 100)
  },

  playError: () => {
    playTone(150, 'sawtooth', 0.2)
    setTimeout(() => playTone(100, 'sawtooth', 0.3), 200)
  },

  playAttack: () => {
    playTone(200, 'square', 0.1)
  },

  // 音を鳴らす（Web Audio API）
  _ctx: null as AudioContext | null,
}

function getAudioContext() {
  if (!SoundManager._ctx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      SoundManager._ctx = new AudioContextClass()
    }
  }
  return SoundManager._ctx
}

function playTone(freq: number, type: OscillatorType, duration: number) {
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  
  // 減衰
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + duration)
}
