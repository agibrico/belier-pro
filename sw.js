const CACHE_NAME = 'belier-pro-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css', // Ajustez le nom de votre fichier CSS
  '/script.js', // Ajustez le nom de votre fichier JS
  // Ajoutez ici les chemins de vos images ou icônes (ex: le logo cochon si c'est une image)
];

// Installation : Mise en cache des fichiers essentiels
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Interception des requêtes : priorité au cache si hors ligne
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
