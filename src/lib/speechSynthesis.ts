export interface SpeechSynthesisOptions {
  lang?: string // e.g. 'pt-BR', 'en-US', 'es-ES', 'de-DE', 'fr-FR'
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: unknown) => void
}

class SpeechService {
  private voicesByLang: Record<string, SpeechSynthesisVoice | null> = {}
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
    if (!voices || voices.length === 0) return

    const getBestVoice = (langPrefix: string, exactCode?: string) => {
      const matching = voices.filter(
        (v) =>
          (exactCode && v.lang === exactCode) ||
          v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()),
      )
      return (
        matching.find(
          (v) =>
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Premium') ||
            v.name.includes('Neural'),
        ) ||
        matching[0] ||
        null
      )
    }

    this.voicesByLang['pt-BR'] = getBestVoice('pt', 'pt-BR')
    this.voicesByLang['en'] = getBestVoice('en', 'en-US')
    this.voicesByLang['en-US'] = getBestVoice('en', 'en-US')
    this.voicesByLang['es'] = getBestVoice('es', 'es-ES')
    this.voicesByLang['es-ES'] = getBestVoice('es', 'es-ES')
    this.voicesByLang['de'] = getBestVoice('de', 'de-DE')
    this.voicesByLang['de-DE'] = getBestVoice('de', 'de-DE')
    this.voicesByLang['fr'] = getBestVoice('fr', 'fr-FR')
    this.voicesByLang['fr-FR'] = getBestVoice('fr', 'fr-FR')
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
      const targetLang = options.lang || 'pt-BR'
      utterance.lang = targetLang.includes('-')
        ? targetLang
        : `${targetLang}-${targetLang.toUpperCase()}`

      this.initVoices()
      const chosenVoice =
        this.voicesByLang[targetLang] ||
        this.voicesByLang[targetLang.split('-')[0]] ||
        this.voicesByLang['pt-BR']

      if (chosenVoice) {
        utterance.voice = chosenVoice
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
