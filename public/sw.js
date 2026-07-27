// Network-first HTML, stale-while-revalidate assets, offline fallback.
const CACHE_NAME = 'bujo-v4'

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  const isNavigate = event.request.mode === 'navigate'
    || (event.request.headers.get('accept') || '').includes('text/html')

  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {})
          return res
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)

      return cached || network
    }),
  )
})
