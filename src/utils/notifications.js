import { isNativePlatform } from './native'

const timers = new Map()
let localNotifications = null

async function getLocalNotifications() {
  if (!isNativePlatform()) return null
  if (!localNotifications) {
    try {
      const mod = await import('@capacitor/local-notifications')
      localNotifications = mod.LocalNotifications
    } catch {
      return null
    }
  }
  return localNotifications
}

function parseTime(time) {
  const [h, m] = time.split(':').map(Number)
  return { hour: h, minute: m }
}

export function scheduleReminder(settings, onFire) {
  if (!settings?.enabled || !settings.time) return null

  if (isNativePlatform()) {
    scheduleNativeReminder(settings, onFire)
    return -1
  }

  const [h, m] = settings.time.split(':').map(Number)
  const now = new Date()
  const next = new Date()
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)

  const ms = next.getTime() - now.getTime()
  return setTimeout(() => {
    onFire()
    scheduleReminder(settings, onFire)
  }, ms)
}

async function scheduleNativeReminder(settings, onFire) {
  const LN = await getLocalNotifications()
  if (!LN) return

  const { hour, minute } = parseTime(settings.time)
  await LN.cancel({ notifications: [{ id: 1 }] })
  await LN.schedule({
    notifications: [{
      id: 1,
      title: 'Bujo Mood',
      body: settings.body || 'Time to log today',
      schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
    }],
  })
}

export function scheduleHabitReminders(habits, t) {
  clearHabitReminders()

  if (isNativePlatform()) {
    scheduleNativeHabitReminders(habits, t)
    return
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return

  for (const habit of habits) {
    if (!habit.reminder?.enabled || !habit.reminder.time) continue
    const label = habit.label || t(`habits.${habit.labelKey}`) || habit.id
    const timer = scheduleReminder(
      { enabled: true, time: habit.reminder.time },
      () => showNotification(t('appName'), `${habit.emoji} ${label}`),
    )
    if (timer) timers.set(habit.id, timer)
  }
}

async function scheduleNativeHabitReminders(habits, t) {
  const LN = await getLocalNotifications()
  if (!LN) return

  const notifications = habits
    .filter((h) => h.reminder?.enabled && h.reminder.time)
    .map((habit, i) => {
      const label = habit.label || t(`habits.${habit.labelKey}`) || habit.id
      const { hour, minute } = parseTime(habit.reminder.time)
      return {
        id: 100 + i,
        title: t('appName'),
        body: `${habit.emoji} ${label}`,
        schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
      }
    })

  if (notifications.length) await LN.schedule({ notifications })
}

export function clearHabitReminders() {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
}

export async function requestNotificationPermission() {
  const LN = await getLocalNotifications()
  if (LN) {
    const { display } = await LN.requestPermissions()
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'default'
  }
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export async function showNotification(title, body) {
  const LN = await getLocalNotifications()
  if (LN) {
    await LN.schedule({
      notifications: [{
        id: Date.now() % 100000,
        title,
        body,
        schedule: { at: new Date(Date.now() + 500) },
      }],
    })
    return
  }
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: './icon-192.svg' })
  }
}
