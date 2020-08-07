// give your cache a name
const cacheName = 'v4';

// put the static assets and routes you want to cache here
const filesToCache = [
  '/',  
  '/index.html',  
  '/ressources/monster.png',  
  '/ressources/script.js',  
  '/ressources/styles.css',
  '/favicon.ico'
]; 

// the event handler for the activate event
self.addEventListener('activate', event => {
  console.log('worker : activate');
  // delete any caches that aren't in expectedCaches
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!expectedCaches.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('new worker activated');
    })
  );
});

// the event handler for the install event 
// typically used to cache assets
self.addEventListener('install', e => {
  console.log('worker : install');
  e.waitUntil(
    caches.open(cacheName)
    .then(cache => cache.addAll(filesToCache))
  );
});

// the fetch event handler, to intercept requests and serve all 
// static assets from the cache
self.addEventListener('fetch', e => {
  console.log('worker : fetch', e.request);
  e.respondWith(
    caches.match(e.request)
    .then(response => response ? response : fetch(e.request))
  )
});