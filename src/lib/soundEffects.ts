/**
 * Procedural web audio sound effects: animal sounds, dinosaur roars, nature,
 * category sounds, rewards, celebratory fanfares and UI cues.
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

  // Celebratory victory fanfare (elaborate multi-voice fanfare with sparkling arpeggios)
  public playVictory() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    // Grand celebratory fanfare: C5, E5, G5, C6, G5, C6, E6
    const fanfareNotes = [
      { f: 523.25, t: 0.0, d: 0.16 }, // C5
      { f: 659.25, t: 0.14, d: 0.16 }, // E5
      { f: 783.99, t: 0.28, d: 0.18 }, // G5
      { f: 1046.5, t: 0.44, d: 0.32 }, // C6
      { f: 880.0, t: 0.72, d: 0.14 }, // A5
      { f: 1046.5, t: 0.86, d: 0.16 }, // C6
      { f: 1318.5, t: 1.02, d: 0.8 }, // E6 grand finale
    ]

    fanfareNotes.forEach(({ f, t, d }) => {
      const start = now + t
      // Lead melodic tone
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, start)

      gain.gain.setValueAtTime(0.001, start)
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, start + d)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + d + 0.05)

      // Soft harmonic shine
      const shine = ctx.createOscillator()
      const shineGain = ctx.createGain()
      shine.type = 'sine'
      shine.frequency.setValueAtTime(f * 2, start)

      shineGain.gain.setValueAtTime(0.001, start)
      shineGain.gain.linearRampToValueAtTime(0.08, start + 0.03)
      shineGain.gain.exponentialRampToValueAtTime(0.001, start + d * 0.7)

      shine.connect(shineGain)
      shineGain.connect(ctx.destination)
      shine.start(start)
      shine.stop(start + d * 0.7 + 0.05)
    })
  }

  // Sparkling star reveal chime with sequential pitch
  public playStarPop(index: number = 0) {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    const pitches = [587.33, 739.99, 987.77, 1174.66] // D5, F#5, B5, D6
    const freq = pitches[Math.min(index, pitches.length - 1)]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + 0.18)

    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)
  }

  // Cheerful party horn / confetti whoosh
  public playConfettiWhoosh() {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.linearRampToValueAtTime(640, now + 0.15)
    osc.frequency.linearRampToValueAtTime(480, now + 0.35)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.4)
  }

  // Procedural animal, dinosaur, category sounds
  public playAnimalSound(type: string) {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const key = (type || '').toLowerCase().trim()

    switch (key) {
      // --- ANIMALS ---
      case 'leao':
      case 'leão': {
        // Roar
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
        // Meow
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
        // Woof woof
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
        // Moo
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
        // Quack
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
        // Baa
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
      case 'porco': {
        // Oink oink
        ;[0, 0.2].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(180, now + offset)
          osc.frequency.linearRampToValueAtTime(240, now + offset + 0.08)
          osc.frequency.linearRampToValueAtTime(160, now + offset + 0.15)
          gain.gain.setValueAtTime(0.25, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.16)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.17)
        })
        break
      }
      case 'cavalo': {
        // Neigh / whinny
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(500, now)
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.2)
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.6)
        gain.gain.setValueAtTime(0.22, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.7)
        break
      }
      case 'galinha': {
        // Cluck cluck
        ;[0, 0.12, 0.28].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(400, now + offset)
          osc.frequency.exponentialRampToValueAtTime(280, now + offset + 0.08)
          gain.gain.setValueAtTime(0.2, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.09)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.1)
        })
        break
      }
      case 'sapo': {
        // Ribbit / croak
        ;[0, 0.18].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(110, now + offset)
          osc.frequency.linearRampToValueAtTime(160, now + offset + 0.07)
          osc.frequency.linearRampToValueAtTime(90, now + offset + 0.14)
          gain.gain.setValueAtTime(0.25, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.15)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.16)
        })
        break
      }

      // --- DINOSAURS ---
      case 'trex': {
        // Huge deep terrifying roar
        const osc = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc2.type = 'square'

        osc.frequency.setValueAtTime(180, now)
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.9)

        osc2.frequency.setValueAtTime(90, now)
        osc2.frequency.exponentialRampToValueAtTime(30, now + 0.9)

        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95)

        osc.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc2.start(now)
        osc.stop(now + 1.0)
        osc2.stop(now + 1.0)
        break
      }
      case 'triceratops': {
        // Heavy stomp + low grunt
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(130, now)
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.6)
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.7)
        break
      }
      case 'braquiossauro': {
        // High harmonic singing bellow
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.linearRampToValueAtTime(380, now + 0.4)
        osc.frequency.linearRampToValueAtTime(180, now + 0.9)
        gain.gain.setValueAtTime(0.28, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.95)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 1.0)
        break
      }
      case 'estegossauro': {
        // Plate rattle + low thud
        ;[0, 0.15, 0.3].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(160, now + offset)
          osc.frequency.exponentialRampToValueAtTime(70, now + offset + 0.1)
          gain.gain.setValueAtTime(0.25, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.13)
        })
        break
      }
      case 'velociraptor': {
        // High pitched chirp-shriek
        ;[0, 0.14].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(700, now + offset)
          osc.frequency.exponentialRampToValueAtTime(1400, now + offset + 0.08)
          osc.frequency.exponentialRampToValueAtTime(600, now + offset + 0.16)
          gain.gain.setValueAtTime(0.25, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.18)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.2)
        })
        break
      }
      case 'pterodatilo': {
        // Screech in the sky
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(800, now)
        osc.frequency.linearRampToValueAtTime(1300, now + 0.2)
        osc.frequency.linearRampToValueAtTime(600, now + 0.5)
        gain.gain.setValueAtTime(0.24, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.6)
        break
      }
      case 'anquilossauro': {
        // Heavy armor metallic thud
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(150, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.5)
        break
      }
      case 'espinossauro': {
        // Water rumble roar
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(140, now)
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3)
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.9)
        break
      }

      // --- FRUITS / NATURE ---
      case 'crunch': {
        ;[0, 0.05, 0.1].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(600 + Math.random() * 200, now + offset)
          osc.frequency.exponentialRampToValueAtTime(200, now + offset + 0.04)
          gain.gain.setValueAtTime(0.18, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.05)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.06)
        })
        break
      }
      case 'splash': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(300, now)
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.4)
        break
      }
      case 'pop_soft': {
        this.playPop()
        break
      }

      // --- COLORS / CHIMES ---
      case 'chime_c':
      case 'num_1':
      case 'num_5':
      case 'num_9': {
        this.playChimeNote(523.25)
        break
      }
      case 'chime_e':
      case 'num_2':
      case 'num_6':
      case 'num_10': {
        this.playChimeNote(659.25)
        break
      }
      case 'chime_g':
      case 'num_3':
      case 'num_7': {
        this.playChimeNote(783.99)
        break
      }
      case 'chime_c_high':
      case 'num_4':
      case 'num_8': {
        this.playChimeNote(1046.5)
        break
      }

      // --- BODY SOUNDS ---
      case 'blink': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, now)
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08)
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.1)
        break
      }
      case 'sniff': {
        ;[0, 0.12].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(300, now + offset)
          osc.frequency.linearRampToValueAtTime(500, now + offset + 0.08)
          gain.gain.setValueAtTime(0.15, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.09)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.1)
        })
        break
      }
      case 'kiss': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(900, now)
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.13)
        break
      }
      case 'bell': {
        this.playChimeNote(880)
        break
      }
      case 'clap': {
        ;[0, 0.15].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'square'
          osc.frequency.setValueAtTime(200, now + offset)
          osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.06)
          gain.gain.setValueAtTime(0.2, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.07)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.08)
        })
        break
      }
      case 'step': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(120, now)
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.11)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.12)
        break
      }
      case 'tap':
      case 'tickle': {
        this.playPop()
        break
      }

      default:
        this.playPop()
    }
  }

  private playChimeNote(freq: number) {
    if (this.isMuted) return
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.45)
  }
}

export const soundEffects = new SoundEffectsService()
