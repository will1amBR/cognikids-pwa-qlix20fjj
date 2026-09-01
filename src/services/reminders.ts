/**
 * Routine Reminder Service for CogniKids
 * Handles:
 * 1. Storing reminder time ("HH:MM") and enabled flag in PocketBase and LocalStorage
 * 2. In-app reminder toast/dialog when app is active
 * 3. Browser Notification API permission requesting & scheduling
 */

import pb from '@/lib/pocketbase/client'
import type { GuardianReminderConfig, AppLanguage } from '@/types/cognikids'

const LOCAL_STORAGE_KEY = 'cognikids_reminder_config'
const LAST_NOTIFIED_KEY = 'cognikids_last_notified_date'
const LAST_VOCAB_NOTIFIED_KEY = 'cognikids_last_vocab_notified_date'
const REVIEWED_WORDS_STORAGE_KEY = 'cognikids_reviewed_words'

export interface VocabPracticeTip {
  language: AppLanguage
  languageLabel: string
  flag: string
  category: string
  wordNative: string
  wordTranslation: string
  pronunciationHint: string
  practicalHomeTip: string
  samplePhrase: string
}

import type { GameSession } from '@/types/cognikids'

export interface WordReviewItem {
  word: string
  language: AppLanguage
  errorCount: number
  attemptsCount: number
  averageAccuracy: number
  lastPracticed?: string
  suggestedAction?: string
  isReviewed?: boolean
  reviewedAt?: string
}

export interface WeeklyWordRankItem {
  word: string
  language: AppLanguage
  practiceCount: number
  correctCount: number
  accuracy: number
  lastPracticed: string
}

export interface ReviewedWordRecord {
  childId: string
  word: string
  language: AppLanguage
  reviewedAt: string
}

export interface LanguageVocabQueue {
  language: AppLanguage
  languageLabel: string
  flag: string
  totalToReview: number
  words: WordReviewItem[]
}

export const VOCAB_DAILY_PRACTICE_TIPS: Record<AppLanguage, VocabPracticeTip[]> = {
  en: [
    {
      language: 'en',
      languageLabel: 'Inglês',
      flag: '🇺🇸',
      category: 'Animais (Animals)',
      wordNative: 'Dog / Cat',
      wordTranslation: 'Cachorro / Gato',
      pronunciationHint: 'Dóg / Két',
      practicalHomeTip:
        'Aponte para o bichinho de pelúcia ou animal na rua e pergunte: "Look, is it a dog or a cat?"',
      samplePhrase: '"Good job! The dog goes woof-woof!"',
    },
    {
      language: 'en',
      languageLabel: 'Inglês',
      flag: '🇺🇸',
      category: 'Frutas (Fruits)',
      wordNative: 'Apple / Banana',
      wordTranslation: 'Maçã / Banana',
      pronunciationHint: 'Épol / Bənæna',
      practicalHomeTip:
        'Durante o lanche da tarde, ofereça a fruta dizendo: "Do you want an apple or a banana?"',
      samplePhrase: '"Yummy! Sweet red apple!"',
    },
    {
      language: 'en',
      languageLabel: 'Inglês',
      flag: '🇺🇸',
      category: 'Cores (Colors)',
      wordNative: 'Blue / Red / Yellow',
      wordTranslation: 'Azul / Vermelho / Amarelo',
      pronunciationHint: 'Blu / Réd / Iélou',
      practicalHomeTip:
        'Brinque de caçar objetos coloridos pela sala: "Find something blue for Tico!"',
      samplePhrase: '"Look at the blue sky!"',
    },
    {
      language: 'en',
      languageLabel: 'Inglês',
      flag: '🇺🇸',
      category: 'Corpo (Body Parts)',
      wordNative: 'Eyes / Nose / Mouth',
      wordTranslation: 'Olhos / Nariz / Boca',
      pronunciationHint: 'Aiz / Nôuz / Máuth',
      practicalHomeTip:
        'Na hora do banho ou no espelho, aponte e brinque: "Where are your eyes? Where is your nose?"',
      samplePhrase: '"Touch your nose! Great job!"',
    },
    {
      language: 'en',
      languageLabel: 'Inglês',
      flag: '🇺🇸',
      category: 'Números (Numbers)',
      wordNative: 'One, Two, Three',
      wordTranslation: 'Um, Dois, Três',
      pronunciationHint: 'Uan, Tu, Trí',
      practicalHomeTip:
        'Conte os degraus da escada ou os brinquedos ao guardar: "One, two, three!"',
      samplePhrase: '"Let\'s count together: One, two, three!"',
    },
  ],
  es: [
    {
      language: 'es',
      languageLabel: 'Espanhol',
      flag: '🇪🇸',
      category: 'Animales (Animais)',
      wordNative: 'Perro / Gato / Vaca',
      wordTranslation: 'Cachorro / Gato / Vaca',
      pronunciationHint: 'Pêrro / Gato / Baka',
      practicalHomeTip: 'Imite os sons em família: "¿Cómo hace el perro? ¡Guau guau!"',
      samplePhrase: '"¡Mira el perrito bonito!"',
    },
    {
      language: 'es',
      languageLabel: 'Espanhol',
      flag: '🇪🇸',
      category: 'Frutas (Frutas)',
      wordNative: 'Manzana / Plátano',
      wordTranslation: 'Maçã / Banana',
      pronunciationHint: 'Mantsana / Plátano',
      practicalHomeTip:
        'Na cozinha ou feira, mostre as frutas: "¿Quieres una manzana roja o un plátano dulce?"',
      samplePhrase: '"¡Qué rica está la manzana!"',
    },
    {
      language: 'es',
      languageLabel: 'Espanhol',
      flag: '🇪🇸',
      category: 'Colores (Cores)',
      wordNative: 'Rojo / Azul / Amarillo',
      wordTranslation: 'Vermelho / Azul / Amarelo',
      pronunciationHint: 'Rróho / Asul / Amarílio',
      practicalHomeTip:
        'Pergunte a cor da roupinha ao vestir: "¿Qué color es tu camiseta? ¡Es azul!"',
      samplePhrase: '"¡El sol brillante es amarillo!"',
    },
    {
      language: 'es',
      languageLabel: 'Espanhol',
      flag: '🇪🇸',
      category: 'Cuerpo (Corpo)',
      wordNative: 'Ojos / Manos / Pies',
      wordTranslation: 'Olhos / Mãos / Pés',
      pronunciationHint: 'Óhos / Manos / Piês',
      practicalHomeTip: 'Cante fazendo gestos: "Manos arriba, aplaudiendo con Tico!"',
      samplePhrase: '"¡Aplaude con las dos manos!"',
    },
  ],
  de: [
    {
      language: 'de',
      languageLabel: 'Alemão',
      flag: '🇩🇪',
      category: 'Tiere (Animais)',
      wordNative: 'Hund / Katze / Ente',
      wordTranslation: 'Cachorro / Gato / Pato',
      pronunciationHint: 'Rrund / Kátse / Ênte',
      practicalHomeTip: 'Aponte livrinhos ilustrados e brinque: "Wo ist der Hund? Wuff wuff!"',
      samplePhrase: '"Schau mal, die Katze schläft!"',
    },
    {
      language: 'de',
      languageLabel: 'Alemão',
      flag: '🇩🇪',
      category: 'Früchte (Frutas)',
      wordNative: 'Apfel / Banane',
      wordTranslation: 'Maçã / Banana',
      pronunciationHint: 'Ápfel / Banâne',
      practicalHomeTip: 'Ao preparar o pratinho de frutas: "Hier ist ein süßer roter Apfel!"',
      samplePhrase: '"Mmm, leckerer Apfel!"',
    },
    {
      language: 'de',
      languageLabel: 'Alemão',
      flag: '🇩🇪',
      category: 'Farben (Cores)',
      wordNative: 'Rot / Blau / Gelb',
      wordTranslation: 'Vermelho / Azul / Amarelo',
      pronunciationHint: 'Rôt / Bláu / Gêlb',
      practicalHomeTip:
        'Escolha brinquedos ou bloquinhos coloridos: "Gib mir den blauen Baustein!"',
      samplePhrase: '"Die Sonne ist warm und gelb!"',
    },
    {
      language: 'de',
      languageLabel: 'Alemão',
      flag: '🇩🇪',
      category: 'Zahlen (Números)',
      wordNative: 'Eins, Zwei, Drei',
      wordTranslation: 'Um, Dois, Três',
      pronunciationHint: 'Ains, Tsvai, Drai',
      practicalHomeTip: 'Conte passos durante uma caminhada: "Eins, zwei, drei, los geht\'s!"',
      samplePhrase: '"Zähle mit mir: Eins, zwei, drei!"',
    },
  ],
  fr: [
    {
      language: 'fr',
      languageLabel: 'Francês',
      flag: '🇫🇷',
      category: 'Animaux (Animais)',
      wordNative: 'Chien / Chat / Canard',
      wordTranslation: 'Cachorro / Gato / Pato',
      pronunciationHint: 'Xiãn / Xá / Canár',
      practicalHomeTip: 'Brinque de imitar bichinhos com carinho: "Le petit chat fait miaou !" ',
      samplePhrase: '"Regarde le gentil chien qui remue la queue !" ',
    },
    {
      language: 'fr',
      languageLabel: 'Francês',
      flag: '🇫🇷',
      category: 'Fruits (Frutas)',
      wordNative: 'Pomme / Banane / Fraise',
      wordTranslation: 'Maçã / Banana / Morango',
      pronunciationHint: 'Pôm / Banán / Frêz',
      practicalHomeTip:
        'Ofereça um lanchinho saboroso dizendo: "Une délicieuse pomme rouge pour toi !" ',
      samplePhrase: '"C\'est très bon, la fraise sucrée !" ',
    },
    {
      language: 'fr',
      languageLabel: 'Francês',
      flag: '🇫🇷',
      category: 'Couleurs (Cores)',
      wordNative: 'Rouge / Bleu / Jaune',
      wordTranslation: 'Vermelho / Azul / Amarelo',
      pronunciationHint: 'Rruj / Blö / Jôn',
      practicalHomeTip:
        'Mostre as cores ao desenhar ou pintar: "Quel beau dessin bleu comme le ciel !" ',
      samplePhrase: '"Le grand soleil est tout jaune !" ',
    },
    {
      language: 'fr',
      languageLabel: 'Francês',
      flag: '🇫🇷',
      category: 'Corps (Corpo)',
      wordNative: 'Yeux / Nez / Bouche',
      wordTranslation: 'Olhos / Nariz / Boca',
      pronunciationHint: 'Iê / Nê / Bux',
      practicalHomeTip: 'Brinque de cócegas e toques gentis: "Touche ton petit nez rigolo !" ',
      samplePhrase: '"Deux jolis yeux pour regarder Tico !" ',
    },
  ],
  'pt-BR': [
    {
      language: 'pt-BR',
      languageLabel: 'Português',
      flag: '🇧🇷',
      category: 'Bichinhos da Fazenda',
      wordNative: 'Cachorro / Gatinho / Vaca',
      wordTranslation: 'Fala e Articulação',
      pronunciationHint: 'Au au / Miau / Muuu',
      practicalHomeTip:
        'Brinque de imitar sons sonoros durante a rotina para reforçar a fonética inicial.',
      samplePhrase: '"Muito bem! O gatinho faz miau miau!"',
    },
    {
      language: 'pt-BR',
      languageLabel: 'Português',
      flag: '🇧🇷',
      category: 'Cores e Formas',
      wordNative: 'Azul / Vermelho / Amarelo',
      wordTranslation: 'Identificação Visual',
      pronunciationHint: 'Clara e pausada',
      practicalHomeTip:
        'Aponte objetos pela casa com cores vibrantes para estimular a associação rápida.',
      samplePhrase: '"Onde está a almofada vermelha? Parabéns!"',
    },
  ],
}

export function getRandomVocabTip(lang: AppLanguage = 'en'): VocabPracticeTip {
  const list = VOCAB_DAILY_PRACTICE_TIPS[lang] || VOCAB_DAILY_PRACTICE_TIPS.en
  const idx = Math.floor(Math.random() * list.length)
  return list[idx]
}

export async function getReminderConfig(): Promise<GuardianReminderConfig> {
  // 1. Try from authenticated user record
  if (pb.authStore.isValid && pb.authStore.record) {
    const rec = pb.authStore.record as any
    if (
      rec.reminder_time !== undefined ||
      rec.reminder_enabled !== undefined ||
      rec.vocab_reminder_enabled !== undefined
    ) {
      return {
        reminder_enabled: Boolean(rec.reminder_enabled),
        reminder_time: rec.reminder_time || '18:00',
        vocab_reminder_enabled: Boolean(rec.vocab_reminder_enabled),
        vocab_reminder_time: rec.vocab_reminder_time || '10:00',
        vocab_reminder_language: rec.vocab_reminder_language || 'en',
      }
    }
  }

  // 2. Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    /* intentionally ignored */
  }

  return {
    reminder_enabled: false,
    reminder_time: '18:00',
    vocab_reminder_enabled: false,
    vocab_reminder_time: '10:00',
    vocab_reminder_language: 'en',
  }
}

export async function saveReminderConfig(config: GuardianReminderConfig): Promise<boolean> {
  // Save to local storage for instant offline / PWA access
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* intentionally ignored */
  }

  // If logged in, update PocketBase user record
  if (pb.authStore.isValid && pb.authStore.record?.id) {
    try {
      const payload: Record<string, any> = {
        reminder_enabled: config.reminder_enabled,
        reminder_time: config.reminder_time,
      }
      if (config.vocab_reminder_enabled !== undefined) {
        payload.vocab_reminder_enabled = config.vocab_reminder_enabled
      }
      if (config.vocab_reminder_time !== undefined) {
        payload.vocab_reminder_time = config.vocab_reminder_time
      }
      if (config.vocab_reminder_language !== undefined) {
        payload.vocab_reminder_language = config.vocab_reminder_language
      }
      await pb.collection('users').update(pb.authStore.record.id, payload)
    } catch (err) {
      console.warn('Failed to persist reminder to user record', err)
    }
  }
  return true
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied'
  }
  if (Notification.permission === 'granted') {
    return 'granted'
  }
  try {
    const perm = await Notification.requestPermission()
    return perm
  } catch (_) {
    return 'denied'
  }
}

export function sendLocalNotification(title: string, body: string, icon = '/pwa-192x192.png') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  try {
    // If service worker is ready, use showNotification for better mobile PWA support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon,
            badge: icon,
            tag: 'cognikids-daily-session',
          } as any)
        })
        .catch(() => {
          // Fallback to standard Notification object
          new Notification(title, { body, icon })
        })
    } else {
      new Notification(title, { body, icon })
    }
  } catch (e) {
    console.warn('Notification trigger failed', e)
  }
}

/**
 * Checks whether it is time to trigger the daily reminder today
 */
export function checkShouldTriggerReminder(config: GuardianReminderConfig): boolean {
  if (!config.reminder_enabled || !config.reminder_time) return false

  const todayStr = new Date().toISOString().split('T')[0]
  const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY)

  // Already notified today?
  if (lastNotified === todayStr) return false

  const [targetH, targetM] = config.reminder_time.split(':').map(Number)
  if (isNaN(targetH) || isNaN(targetM)) return false

  const now = new Date()
  const currentH = now.getHours()
  const currentM = now.getMinutes()

  // Trigger if current time has reached or passed the target hour:minute
  if (currentH > targetH || (currentH === targetH && currentM >= targetM)) {
    return true
  }

  return false
}

export function markReminderTriggeredToday() {
  const todayStr = new Date().toISOString().split('T')[0]
  localStorage.setItem(LAST_NOTIFIED_KEY, todayStr)
}

/**
 * Checks whether it is time to trigger the daily vocabulary revision reminder
 */
export function checkShouldTriggerVocabReminder(config: GuardianReminderConfig): boolean {
  if (!config.vocab_reminder_enabled || !config.vocab_reminder_time) return false

  const todayStr = new Date().toISOString().split('T')[0]
  const lastNotified = localStorage.getItem(LAST_VOCAB_NOTIFIED_KEY)

  // Already notified today?
  if (lastNotified === todayStr) return false

  const [targetH, targetM] = config.vocab_reminder_time.split(':').map(Number)
  if (isNaN(targetH) || isNaN(targetM)) return false

  const now = new Date()
  const currentH = now.getHours()
  const currentM = now.getMinutes()

  // Trigger if current time has reached or passed the target hour:minute
  if (currentH > targetH || (currentH === targetH && currentM >= targetM)) {
    return true
  }

  return false
}

export function markVocabReminderTriggeredToday() {
  const todayStr = new Date().toISOString().split('T')[0]
  localStorage.setItem(LAST_VOCAB_NOTIFIED_KEY, todayStr)
}

/**
 * Computes vocabulary review items per language based on actual game sessions (both synced and offline pending).
 * Words with lowest accuracy (< 85%) or highest error count are prioritized.
 */
/**
 * Retrieves the set of locally/persisted reviewed words for a child
 */
export function getReviewedWords(childId?: string): ReviewedWordRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(REVIEWED_WORDS_STORAGE_KEY)
    const list: ReviewedWordRecord[] = raw ? JSON.parse(raw) : []
    if (childId) {
      return list.filter((item) => item.childId === childId)
    }
    return list
  } catch {
    return []
  }
}

/**
 * Marks a word as reviewed by guardian, persisting locally and syncing
 */
export function markWordAsReviewed(
  childId: string,
  word: string,
  language: AppLanguage,
): ReviewedWordRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(REVIEWED_WORDS_STORAGE_KEY)
    const list: ReviewedWordRecord[] = raw ? JSON.parse(raw) : []
    const cleanWord = word.trim().toLowerCase()

    // Remove if already exists to update date
    const filtered = list.filter(
      (item) =>
        !(
          item.childId === childId &&
          item.language === language &&
          item.word.trim().toLowerCase() === cleanWord
        ),
    )

    const newRecord: ReviewedWordRecord = {
      childId,
      word: word.trim(),
      language,
      reviewedAt: new Date().toISOString(),
    }
    filtered.push(newRecord)
    localStorage.setItem(REVIEWED_WORDS_STORAGE_KEY, JSON.stringify(filtered))
    return filtered
  } catch (e) {
    console.warn('Failed to save reviewed word', e)
    return []
  }
}

/**
 * Computes weekly vocabulary words ranking (last 7 days) from game sessions and offline pending
 */
export function computeWeeklyWordsRanking(
  sessions: GameSession[],
  limit: number = 8,
): WeeklyWordRankItem[] {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const wordMap: Record<
    string,
    {
      word: string
      language: AppLanguage
      practiceCount: number
      correctCount: number
      totalAccuracy: number
      lastPracticed: string
    }
  > = {}

  sessions.forEach((s) => {
    const sessionDate = new Date(s.created || now)
    if (sessionDate < sevenDaysAgo) return

    const lang = (s.language || 'pt-BR') as AppLanguage
    const details = (s.details as any) || {}

    if (details.wordResults && Array.isArray(details.wordResults)) {
      details.wordResults.forEach((wr: any) => {
        if (!wr || !wr.word) return
        const wordText = String(wr.word).trim()
        const wordKey = `${lang}:::${wordText.toLowerCase()}`
        const score = typeof wr.score === 'number' ? wr.score : s.accuracy || 80
        const isCorrect = wr.isRecognized !== false && score >= 70

        if (!wordMap[wordKey]) {
          wordMap[wordKey] = {
            word: wordText,
            language: lang,
            practiceCount: 1,
            correctCount: isCorrect ? 1 : 0,
            totalAccuracy: score,
            lastPracticed: sessionDate.toISOString(),
          }
        } else {
          wordMap[wordKey].practiceCount += 1
          if (isCorrect) wordMap[wordKey].correctCount += 1
          wordMap[wordKey].totalAccuracy += score
          if (sessionDate > new Date(wordMap[wordKey].lastPracticed)) {
            wordMap[wordKey].lastPracticed = sessionDate.toISOString()
          }
        }
      })
    } else if (details.items && Array.isArray(details.items)) {
      const score = s.accuracy || s.score || 80
      const isCorrect = score >= 70
      details.items.forEach((item: any) => {
        if (!item || typeof item !== 'string') return
        const wordText = item.trim()
        const wordKey = `${lang}:::${wordText.toLowerCase()}`

        if (!wordMap[wordKey]) {
          wordMap[wordKey] = {
            word: wordText,
            language: lang,
            practiceCount: 1,
            correctCount: isCorrect ? 1 : 0,
            totalAccuracy: score,
            lastPracticed: sessionDate.toISOString(),
          }
        } else {
          wordMap[wordKey].practiceCount += 1
          if (isCorrect) wordMap[wordKey].correctCount += 1
          wordMap[wordKey].totalAccuracy += score
          if (sessionDate > new Date(wordMap[wordKey].lastPracticed)) {
            wordMap[wordKey].lastPracticed = sessionDate.toISOString()
          }
        }
      })
    }
  })

  const list: WeeklyWordRankItem[] = Object.values(wordMap).map((item) => ({
    word: item.word,
    language: item.language,
    practiceCount: item.practiceCount,
    correctCount: item.correctCount,
    accuracy: Math.round(item.totalAccuracy / item.practiceCount),
    lastPracticed: item.lastPracticed,
  }))

  // Sort by practice count descending, then correct count, then accuracy
  list.sort((a, b) => {
    if (b.practiceCount !== a.practiceCount) {
      return b.practiceCount - a.practiceCount
    }
    if (b.correctCount !== a.correctCount) {
      return b.correctCount - a.correctCount
    }
    return b.accuracy - a.accuracy
  })

  return list.slice(0, limit)
}

/**
 * Computes vocabulary review items per language based on actual game sessions.
 * Respects reviewed status: reviewed words are filtered or placed at bottom.
 */
export function computeVocabReviewQueue(
  sessions: GameSession[],
  childLanguages: AppLanguage[] = ['pt-BR'],
  childId?: string,
): {
  queue: Record<AppLanguage, WordReviewItem[]>
  reviewedCountThisWeek: number
  totalReviewedCount: number
} {
  const reviewedList = getReviewedWords(childId)
  const reviewedMap = new Map<string, ReviewedWordRecord>()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  let reviewedCountThisWeek = 0

  reviewedList.forEach((r) => {
    const key = `${r.language}:::${r.word.trim().toLowerCase()}`
    reviewedMap.set(key, r)
    if (new Date(r.reviewedAt) >= oneWeekAgo) {
      reviewedCountThisWeek++
    }
  })
  const result: Record<AppLanguage, WordReviewItem[]> = {
    'pt-BR': [],
    en: [],
    es: [],
    fr: [],
    de: [],
  }

  const wordStats: Record<
    string,
    {
      word: string
      language: AppLanguage
      totalScore: number
      attempts: number
      errors: number
      lastDate: string
    }
  > = {}

  // Process all sessions (speech sessions and words games)
  sessions.forEach((session) => {
    const lang = (session.language || 'pt-BR') as AppLanguage
    const details = (session.details as any) || {}
    const sessionDate = session.created || new Date().toISOString()

    // 1. Check detailed word results
    if (details.wordResults && Array.isArray(details.wordResults)) {
      details.wordResults.forEach((wr: any) => {
        if (!wr || !wr.word) return
        const wordKey = `${lang}:::${String(wr.word).trim().toLowerCase()}`
        const wordDisplay = String(wr.word).trim()
        const score = typeof wr.score === 'number' ? wr.score : 80
        const isError = wr.isRecognized === false || score < 75

        if (!wordStats[wordKey]) {
          wordStats[wordKey] = {
            word: wordDisplay,
            language: lang,
            totalScore: score,
            attempts: 1,
            errors: isError ? 1 : 0,
            lastDate: sessionDate,
          }
        } else {
          wordStats[wordKey].totalScore += score
          wordStats[wordKey].attempts += 1
          if (isError) wordStats[wordKey].errors += 1
          if (new Date(sessionDate) > new Date(wordStats[wordKey].lastDate)) {
            wordStats[wordKey].lastDate = sessionDate
          }
        }
      })
    } else if (details.items && Array.isArray(details.items)) {
      // General items listed
      const sessionScore = session.score || 80
      const isError = sessionScore < 75

      details.items.forEach((item: any) => {
        if (!item || typeof item !== 'string') return
        const wordKey = `${lang}:::${item.trim().toLowerCase()}`
        const wordDisplay = item.trim()

        if (!wordStats[wordKey]) {
          wordStats[wordKey] = {
            word: wordDisplay,
            language: lang,
            totalScore: sessionScore,
            attempts: 1,
            errors: isError ? 1 : 0,
            lastDate: sessionDate,
          }
        } else {
          wordStats[wordKey].totalScore += sessionScore
          wordStats[wordKey].attempts += 1
          if (isError) wordStats[wordKey].errors += 1
          if (new Date(sessionDate) > new Date(wordStats[wordKey].lastDate)) {
            wordStats[wordKey].lastDate = sessionDate
          }
        }
      })
    }
  })

  // Group and rank words
  Object.values(wordStats).forEach((stat) => {
    const avgScore = Math.round(stat.totalScore / stat.attempts)
    const item: WordReviewItem = {
      word: stat.word,
      language: stat.language,
      errorCount: stat.errors,
      attemptsCount: stat.attempts,
      averageAccuracy: avgScore,
      lastPracticed: stat.lastDate,
      suggestedAction:
        avgScore < 60
          ? 'Revisão urgente'
          : avgScore < 80
            ? 'Reforçar fonética'
            : 'Revisão de fixação',
    }

    if (!result[stat.language]) {
      result[stat.language] = []
    }
    result[stat.language].push(item)
  })

  // Apply reviewed flag & sort: unreviewed items first (by errors then accuracy), reviewed items at the end
  Object.keys(result).forEach((k) => {
    const lang = k as AppLanguage
    if (result[lang]) {
      result[lang].forEach((item) => {
        const key = `${lang}:::${item.word.trim().toLowerCase()}`
        const rev = reviewedMap.get(key)
        if (rev) {
          item.isReviewed = true
          item.reviewedAt = rev.reviewedAt
        }
      })

      result[lang].sort((a, b) => {
        // Unreviewed first
        if (Boolean(a.isReviewed) !== Boolean(b.isReviewed)) {
          return a.isReviewed ? 1 : -1
        }
        if (b.errorCount !== a.errorCount) {
          return b.errorCount - a.errorCount
        }
        return a.averageAccuracy - b.averageAccuracy
      })
    }
  })

  // Ensure every active child language has helpful default practice words if none exist in history
  const defaultWordsByLang: Partial<Record<AppLanguage, string[]>> = {
    'pt-BR': ['Cachorro', 'Borboleta', 'Bicicleta', 'Abelha', 'Sorvete'],
    en: ['Elephant', 'Butterfly', 'Bicycle', 'Strawberry', 'Giraffe'],
    es: ['Mariposa', 'Caballo', 'Bicicleta', 'Manzana', 'Estrella'],
    fr: ['Papillon', 'Chapeau', 'Bicyclette', 'Éléphant', 'Grenouille'],
    de: ['Schmetterling', 'Fahrrad', 'Apfel', 'Elefant', 'Katze'],
  }

  childLanguages.forEach((lang) => {
    if (!result[lang] || result[lang].length === 0) {
      result[lang] = (defaultWordsByLang[lang] || defaultWordsByLang['pt-BR']).map((w) => {
        const key = `${lang}:::${w.toLowerCase()}`
        const rev = reviewedMap.get(key)
        return {
          word: w,
          language: lang,
          errorCount: 1,
          attemptsCount: 1,
          averageAccuracy: 65,
          lastPracticed: new Date().toISOString(),
          suggestedAction: 'Sugestão para iniciar prática',
          isReviewed: Boolean(rev),
          reviewedAt: rev?.reviewedAt,
        }
      })
    }
  })

  return {
    queue: result,
    reviewedCountThisWeek,
    totalReviewedCount: reviewedList.length,
  }
}
