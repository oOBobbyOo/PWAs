var CACHE_NAME = 'v1';
var filesToCache = [
    '/',
    '/index.html',
    '/js/app.js',
    '/css/style.css'
];

// install
self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

// activate
self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// fetch
self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            if (response) {
                return response;
            }
            var fetchRequest = e.request.clone();
            return fetch(fetchRequest).then(
                function(response) {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    var responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(e.request, responseToCache);
                        });
                    return response;
                }
            );
        })
    );
});