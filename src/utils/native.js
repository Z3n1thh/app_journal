export function isNativePlatform() {
  try {
    return window.Capacitor?.isNativePlatform?.() === true
  } catch {
    return false
  }
}

export function getPlatform() {
  try {
    return window.Capacitor?.getPlatform?.() ?? 'web'
  } catch {
    return 'web'
  }
}

export async function initNativeApp() {
  if (!isNativePlatform()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.requestPermissions()
  } catch {
    /* web fallback */
  }
}
