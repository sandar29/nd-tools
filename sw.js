const CACHE_NAME = 'sn-tools-v2';

// Aset inti (satu origin) — wajib berhasil di-cache agar app shell tetap jalan offline
const CORE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json'
];

// Library CDN — dicoba di-cache satu-satu, kegagalan salah satu tidak boleh
// menggagalkan proses instalasi Service Worker secara keseluruhan
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://unpkg.com/html5-qrcode',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap'
];

// Phase 1: Install & Simpan ke Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(CORE_ASSETS);
        console.log('[SN Tools SW] App shell berhasil di-cache');
      } catch (err) {
        console.error('[SN Tools SW] Gagal cache app shell:', err);
      }

      // Cache CDN satu-satu, jangan biarkan satu kegagalan menghentikan yang lain
      await Promise.allSettled(
        CDN_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SN Tools SW] Gagal cache CDN asset:', url, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Phase 2: Aktifkan Service Worker baru & bersihkan cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SN Tools SW] Menghapus cache lama:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Phase 3: Ambil dari Cache jika Offline (cache-first, fallback ke network)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          // Simpan salinan baru ke cache secara diam-diam (best effort)
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html') || caches.match('./');
          }
        });
    })
  );
});
