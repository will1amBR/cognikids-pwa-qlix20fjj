/**
 * Procedural web audio sound effects: animal sounds, rewards, clicks, celebratory fanfares.
 * 100% offline and standalone with Web Audio API.
 */

class SoundEffectsService {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('cognikids_mute')
      this.isMuted = storedMute === 'true'
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognikids_mute', muted ? 'true' : 'false')
    }
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  // Soft cheerful pop on UI clicks
  public playPop() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const now = ctx.currentTime

    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)
  }

  // Reward chime (star obtained)
  public playStarReward(starNumber: number = 1) {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    const baseFreq = 523.25 // C5
    const freqs = [baseFreq, 659.25, 783.99, 1046.5] // C, E, G, C6
    const targetFreq = freqs[Math.min(starNumber, freqs.length - 1)]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    const now = ctx.currentTime

    osc.frequency.setValueAtTime(targetFreq, now)
    osc.frequency.exponentialRampToValueAtTime(targetFreq * 1.5, now + 0.25)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.36)
  }

  // Celebratory victory fanfare
  public playVictory() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const start = now + idx * 0.12
      const dur = idx === notes.length - 1 ? 0.6 : 0.2

      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + dur + 0.05)
    })
  }

  // Procedural animal sounds
  public playAnimalSound(type: string) {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    switch (type.toLowerCase()) {
      case 'leao':
      case 'leão': {
        // Roar: low noise modulation
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(120, now)
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.7)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.75)
        break
      }
      case 'gato': {
        // Meow: pitch goes up then down
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(450, now)
        osc.frequency.linearRampToValueAtTime(750, now + 0.25)
        osc.frequency.linearRampToValueAtTime(500, now + 0.6)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.7)
        break
      }
      case 'cachorro':
      case 'cao':
      case 'cão': {
        // Bark: 2 quick woofs
        ;[0, 0.22].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(260, now + offset)
          osc.frequency.exponentialRampToValueAtTime(140, now + offset + 0.12)
          gain.gain.setValueAtTime(0.28, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.14)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.15)
        })
        break
      }
      case 'vaca': {
        // Moo: low vibrating hum
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(140, now)
        osc.frequency.linearRampToValueAtTime(120, now + 0.8)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.9)
        break
      }
      case 'pato': {
        // Quack: quick nasal buzz
        ;[0, 0.18].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(320, now + offset)
          osc.frequency.linearRampToValueAtTime(240, now + offset + 0.12)
          gain.gain.setValueAtTime(0.18, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.13)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.14)
        })
        break
      }
      case 'ovelha': {
        // Baa: oscillating vibrato
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.linearRampToValueAtTime(200, now + 0.6)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.7)
        break
      }
      case 'elefante': {
        // Trumpet
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(350, now)
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3)
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.7)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.8)
        break
      }
      case 'macaco': {
        // Ooh-ooh-aah-aah
        ;[0, 0.15, 0.32, 0.5].forEach((offset, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          const freq = idx < 2 ? 450 : 650
          osc.frequency.setValueAtTime(freq, now + offset)
          gain.gain.setValueAtTime(0.2, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.1)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.12)
        })
        break
      }
      case 'passaro':
      case 'pássaro': {
        // Chirp chirp
        ;[0, 0.15, 0.3].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(1200, now + offset)
          osc.frequency.exponentialRampToValueAtTime(1800, now + offset + 0.08)
          gain.gain.setValueAtTime(0.18, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.09)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.1)
        })
        break
      }
      default:
        this.playPop()
    }
  }
}

export const soundEffects = new SoundEffectsService()
