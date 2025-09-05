const CACHE_NAME = 'voice-calm-manager-v2';
const STATIC_CACHE = 'static-cache-v2';
const RUNTIME_CACHE = 'runtime-cache-v2';

const urlsToCache = [
  '/',
  '/calendar',
  '/patients',
  '/appointments',
  '/settings',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with optimized strategies
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  // Cache strategy for static assets (JS, CSS, images)
  if (
    request.destination === 'script' || 
    request.destination === 'style' ||
    request.destination === 'image' ||
    url.pathname.includes('/assets/') ||
    url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              // Cache static assets for 1 year
              const headers = new Headers(responseClone.headers);
              headers.set('Cache-Control', 'public, max-age=31536000, immutable');
              
              const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
              });
              
              cache.put(request, cachedResponse);
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Default caching strategy for other requests
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    }).catch(() => {
      if (request.destination === 'document') {
        return caches.match('/');
      }
    })
  );
});

// Background sync for offline appointment creation
self.addEventListener('sync', event => {
  if (event.tag === 'appointment-sync') {
    event.waitUntil(syncAppointments());
  }
});

async function syncAppointments() {
  try {
    // Get offline appointments from IndexedDB
    const appointments = await getOfflineAppointments();
    
    for (const appointment of appointments) {
      try {
        // Try to sync with server
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointment)
        });

        if (response.ok) {
          // Remove from offline storage
          await removeOfflineAppointment(appointment.id);
        }
      } catch (error) {
        console.error('Failed to sync appointment:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Sie haben eine neue Benachrichtigung',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Öffnen',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/favicon.ico'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Voice Calm Manager', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Utility functions for offline storage
async function getOfflineAppointments() {
  // Implementation would use IndexedDB
  return [];
}

async function removeOfflineAppointment(id) {
  // Implementation would remove from IndexedDB
}