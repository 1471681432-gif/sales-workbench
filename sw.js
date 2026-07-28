// Service Worker · 销售工作台 v2.1
const CACHE = 'sw-workbench-v21';

self.addEventListener('install', e => {
  // 立即激活，不等待
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 清除所有旧缓存
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 全部走网络，不缓存
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).catch(() => {
      return new Response('网络离线，请联网后刷新', { status: 503, headers: { 'Content-Type': 'text/html;charset=utf-8' } });
    })
  );
});
