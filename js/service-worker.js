self.addEventListener('install', (event) => {
  console.log('Service worker instalado');
});

self.addEventListener('fetch', (event) => {
  console.log('Interceptando fetch:', event);
});
