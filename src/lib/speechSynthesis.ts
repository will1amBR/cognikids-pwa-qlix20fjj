export interface SpeechSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: unknown) => void
}

class SpeechService {
  private ptVoice: SpeechSynthesisVoice | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices()
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const voices = window.speechSynthesis.getVoices()
    // Prioritize Brazilian Portuguese natural/neural voices
    const ptVoices = voices.filter((v) => v.lang === 'pt-BR' || v.lang.startsWith('pt'))
    const preferred =
      ptVoices.find(
        (v) =>
          v.lang === 'pt-BR' &&
          (v.name.includes('Google') ||
            v.name.includes('Luciana') ||
            v.name.includes('Francisca') ||
            v.name.includes('Maria') ||
            v.name.includes('Natural') ||
            v.name.includes('Premium')),
      ) || ptVoices[0]
    this.ptVoice = preferred || null
    this.isInitialized = true
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel()
    }
  }

  public speak(text: string, options: SpeechSynthesisOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        options.onEnd?.()
        resolve()
        return
      }

      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      if (this.ptVoice) {
        utterance.voice = this.ptVoice
      } else {
        this.initVoices()
        if (this.ptVoice) utterance.voice = this.ptVoice
      }

      utterance.rate = options.rate ?? 0.92 // slightly slower for young kids
      utterance.pitch = options.pitch ?? 1.15 // slightly cheerful / warm pitch
      utterance.volume = options.volume ?? 1

      utterance.onstart = () => {
        options.onStart?.()
      }

      utterance.onend = () => {
        options.onEnd?.()
        resolve()
      }

      utterance.onerror = (err) => {
        // Canceled or interrupted utterances shouldn't block the game flow
        options.onError?.(err)
        options.onEnd?.()
        resolve()
      }

      // In some mobile browsers synthesis gets stuck if too long, short timeout safeguard
      window.speechSynthesis.speak(utterance)
    })
  }
}

export const speechService = new SpeechService()
