const CACHE_NAME = 'fishing-v45';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // API запросы — всегда из сети
    if (url.pathname === '/weather' || url.pathname.startsWith('/weather/')) {
        e.respondWith(fetch(e.request));
        return;
    }

    // Внешние API — из сети с fallback
    if (url.hostname !== location.hostname) {
        e.respondWith(fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
        return;
    }

    // Основные файлы — network-first, fallback на кэш
    e.respondWith(
        fetch(e.request).then(res => {
            if (res.status === 200 && e.request.method === 'GET') {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            }
            return res;
        }).catch(() => caches.match(e.request))
    );
});
