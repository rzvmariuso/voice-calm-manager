// Version-based cache names for automatic updates
const VERSION = '20250908-' + Date.now();
const CACHE_NAME = `voice-calm-manager-${VERSION}`;
const STATIC_CACHE = `static-cache-${VERSION}`;
const RUNTIME_CACHE = `runtime-cache-${VERSION}`;

const urlsToCache = [
  '/',
  '/calendar',
  '/patients',
  '/appointments',
  '/settings',
  '/manifest.json'
];

// Install event - cache resources and force update
self.addEventListener('install', event => {
  console.log('Service Worker installing with version:', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
      })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches and notify clients
self.addEventListener('activate', event => {
  console.log('Service Worker activating with version:', VERSION);
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim().then(() => {
        // Notify all clients about the update
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: VERSION
            });
          });
        });
      })
    ])
  );
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
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
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