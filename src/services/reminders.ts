/**
 * Routine Reminder Service for CogniKids
 * Handles:
 * 1. Storing reminder time ("HH:MM") and enabled flag in PocketBase and LocalStorage
 * 2. In-app reminder toast/dialog when app is active
 * 3. Browser Notification API permission requesting & scheduling
 */

import pb from '@/lib/pocketbase/client'
import type { GuardianReminderConfig } from '@/types/cognikids'

const LOCAL_STORAGE_KEY = 'cognikids_reminder_config'
const LAST_NOTIFIED_KEY = 'cognikids_last_notified_date'

export async function getReminderConfig(): Promise<GuardianReminderConfig> {
  // 1. Try from authenticated user record
  if (pb.authStore.isValid && pb.authStore.record) {
    const rec = pb.authStore.record as any
    if (rec.reminder_time !== undefined || rec.reminder_enabled !== undefined) {
      return {
        reminder_enabled: Boolean(rec.reminder_enabled),
        reminder_time: rec.reminder_time || '18:00',
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
      await pb.collection('users').update(pb.authStore.record.id, {
        reminder_enabled: config.reminder_enabled,
        reminder_time: config.reminder_time,
      })
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
