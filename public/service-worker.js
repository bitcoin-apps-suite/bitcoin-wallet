// Bitcoin Wallet PWA Service Worker
const CACHE_NAME = 'bitcoin-wallet-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/pwa-manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache addAll error:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Don't cache API calls or external resources
              if (!event.request.url.includes('/api/') && 
                  !event.request.url.includes('chrome-extension://')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Handle protocol launch events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PROTOCOL_LAUNCH') {
    // Handle protocol-based launches (web+bitcoin-wallet://, bitcoin://)
    console.log('Protocol launch:', event.data.url);
    
    // Parse the protocol URL and handle accordingly
    if (event.data.url) {
      const url = new URL(event.data.url);
      
      // Handle bitcoin:// addresses
      if (url.protocol === 'bitcoin:') {
        const address = url.pathname;
        // Navigate to send page with address
        clients.openWindow(`/?action=send&address=${address}`);
      }
      // Handle web+bitcoin-wallet:// actions
      else if (url.protocol === 'web+bitcoin-wallet:') {
        const action = url.pathname;
        clients.openWindow(`/?action=${action}`);
      }
    }
  }
});

// Background sync for pending transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  // Implement transaction sync logic here
  console.log('Syncing pending transactions...');
}