/* Web Speech API & MediaRecorder speech recognition wrapper */

export interface SpeechRecognitionResultData {
  transcript: string
  confidence: number
  isFinal: boolean
}

type RecognitionCallback = (result: SpeechRecognitionResultData) => void
type ErrorCallback = (error: string) => void

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export class SpeechRecognitionService {
  private recognition: any = null
  private isListening = false
  private onResultCb: RecognitionCallback | null = null
  private onErrorCb: ErrorCallback | null = null
  private onEndCb: (() => void) | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as IWindowWithSpeech
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass()
        this.recognition.lang = 'pt-BR'
        this.recognition.continuous = false
        this.recognition.interimResults = true
        this.recognition.maxAlternatives = 3

        this.recognition.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          let confidence = 0.8

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i]
            if (res.isFinal) {
              finalTranscript += res[0].transcript
              confidence = res[0].confidence || 0.85
            } else {
              interimTranscript += res[0].transcript
            }
          }

          const transcript = (finalTranscript || interimTranscript).trim()
          if (transcript && this.onResultCb) {
            this.onResultCb({
              transcript,
              confidence,
              isFinal: !!finalTranscript || !interimTranscript,
            })
          }
        }

        this.recognition.onerror = (event: any) => {
          const err = event.error || 'speech_error'
          if (err !== 'no-speech' && this.onErrorCb) {
            this.onErrorCb(err)
          }
        }

        this.recognition.onend = () => {
          this.isListening = false
          if (this.onEndCb) {
            this.onEndCb()
          }
        }
      }
    }
  }

  public isSupported(): boolean {
    return (
      !!this.recognition ||
      (typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia)
    )
  }

  public setLanguage(lang: string): void {
    if (this.recognition) {
      let code = lang
      if (lang === 'en') code = 'en-US'
      else if (lang === 'es') code = 'es-ES'
      else if (lang === 'de') code = 'de-DE'
      else if (lang === 'fr') code = 'fr-FR'
      else if (lang === 'pt') code = 'pt-BR'
      this.recognition.lang = code
    }
  }

  public async startListening(callbacks: {
    lang?: string
    onResult: RecognitionCallback
    onError?: ErrorCallback
    onEnd?: () => void
    onAudioLevel?: (level: number) => void
  }): Promise<void> {
    this.onResultCb = callbacks.onResult
    this.onErrorCb = callbacks.onError || null
    this.onEndCb = callbacks.onEnd || null

    if (this.isListening) {
      this.stopListening()
    }

    if (callbacks.lang) {
      this.setLanguage(callbacks.lang)
    }

    // Try SpeechRecognition if available
    if (this.recognition) {
      try {
        this.isListening = true
        this.recognition.start()
        return
      } catch (err) {
        console.warn('SpeechRecognition start failed, fallback to audio simulation/mic', err)
      }
    }

    // Fallback: Use MediaRecorder + simulated mic capture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.isListening = true
      this.audioChunks = []
      this.mediaRecorder = new MediaRecorder(stream)
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data)
      }
      this.mediaRecorder.start()

      // Audio level analyser
      if (callbacks.onAudioLevel) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const source = audioCtx.createMediaStreamSource(stream)
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)
          const dataArray = new Uint8Array(analyser.frequencyBinCount)

          const checkLevel = () => {
            if (!this.isListening) {
              audioCtx.close()
              return
            }
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
            const avg = sum / dataArray.length
            callbacks.onAudioLevel?.(Math.min(100, Math.round((avg / 128) * 100)))
            requestAnimationFrame(checkLevel)
          }
          checkLevel()
        } catch {
          /* intentionally ignored */
        }
      }
    } catch (err) {
      this.isListening = false
      callbacks.onError?.('Microfone não autorizado ou indisponível')
    }
  }

  public stopListening(): void {
    this.isListening = false
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch {
        /* intentionally ignored */
      }
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop()
        this.mediaRecorder.stream.getTracks().forEach((t) => t.stop())
      } catch {
        /* intentionally ignored */
      }
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService()
