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
