export const THEME_PACKS = {
  default: { accent: '#8b6914', paper: null, name: 'default' },
  forest: { accent: '#2d6a4f', paper: '#f0f7f4', name: 'forest' },
  lavender: { accent: '#7c6ba8', paper: '#f5f3fa', name: 'lavender' },
  midnight: { accent: '#d4a853', paper: '#0f0e0d', name: 'midnight' },
  spring: { accent: '#6b9e78', paper: '#f4faf5', name: 'spring' },
  summer: { accent: '#e8a838', paper: '#fffbf0', name: 'summer' },
  autumn: { accent: '#c45c26', paper: '#faf5ef', name: 'autumn' },
  winter: { accent: '#5b7fa5', paper: '#f0f4f8', name: 'winter' },
}

export const SEASON_BY_MONTH = {
  0: 'winter', 1: 'winter', 2: 'spring',
  3: 'spring', 4: 'spring', 5: 'summer',
  6: 'summer', 7: 'summer', 8: 'autumn',
  9: 'autumn', 10: 'autumn', 11: 'winter',
}

export function getSeasonPackId(date = new Date()) {
  return SEASON_BY_MONTH[date.getMonth()] || 'default'
}

export function applyThemePack(packId, theme) {
  const pack = THEME_PACKS[packId] || THEME_PACKS.default
  const root = document.documentElement
  root.style.setProperty('--accent', pack.accent)
  if (pack.paper && theme === 'light') {
    root.style.setProperty('--paper', pack.paper)
  } else {
    root.style.removeProperty('--paper')
  }
  return pack.accent
}

export function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
