const CACHE_NAME = 'uncling-cache-v11';
const SUPABASE_URL = 'https://eroshburtzpogygnsfox.supabase.co';
const urlsToCache = [
  '/',
  '/index.html',
  'https://i.ibb.co/wZh3tzCj/uncling.png',
  // Libraries & Frameworks from importmap
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client',
  'https://aistudiocdn.com/react-router-dom@^7.9.1',
  'https://aistudiocdn.com/@google/genai@^1.20.0',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache during install:', err);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Return true if you want to remove this cache,
          // in this case, caches that are not our current one
          return cacheName.startsWith('uncling-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event: serve from cache first for offline functionality
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // If the request is for our Supabase backend, bypass the cache and go directly to the network.
  // This is critical for API calls (like POST, streaming) which should never be cached.
  if (requestUrl.origin === SUPABASE_URL) {
    return; // Let the browser handle it.
  }

  // Ensure we only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, use a network-first strategy to get the latest HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if we received a valid response.
          // If the server returns 404 (NOT_FOUND), it means we are likely on a client-side route
          // that the server doesn't know about. We should return the cached index.html.
          if (response.status === 404) {
            return caches.match('/index.html');
          }
          return response;
        })
        .catch(() => {
          // If network fails completely (offline), fall back to cache
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache, fetch from network and cache it for next time
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      }
      )
  );
});

// Push event: handle incoming push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'Uncling';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: 'https://i.ibb.co/wZh3tzCj/uncling.png',
    badge: 'https://i.ibb.co/wZh3tzCj/uncling.png',
    data: {
      url: data.url || '/reflection'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event: open the app and focus on the relevant page
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then(c => c.navigate(urlToOpen));
      }
      return clients.openWindow(urlToOpen);
    })
  );
});