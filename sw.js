// Service Worker · 销售工作台 离线缓存 v2
const CACHE = 'sd-workbench-v20';
const ASSETS = [
  './',
  './index.html',
  './app.html',
  './desktop.html',
  './shared.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(err => console.warn('SW缓存部分失败:', err)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // HTML 文件：网络优先，失败回退缓存
  if (req.destination === 'document' || req.url.match(/\.html(\?|$)/)) {
    e.respondWith(
      fetch(req, { cache: 'no-cache' }).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // JS/CSS/图片：缓存优先
  if (req.destination === 'script' || req.destination === 'style' || req.destination === 'image' || req.destination === 'manifest') {
    e.respondWith(
      caches.match(req).then(cached => {
        return cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        });
      })
    );
    return;
  }

  // 其他：网络优先
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});

// 收到推送通知（预留）
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || '销售工作台提醒';
  const options = {
    body: data.body || '您有待处理的任务',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'sd-workbench',
    vibrate: [200, 100, 200],
    data: { url: data.url || './app.html' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// 点击通知
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clients => {
      const url = e.notification.data?.url || './app.html';
      const client = clients.find(c => c.url.includes(self.registration.scope));
      if (client) { client.focus(); client.navigate(url); }
      else clients.openWindow(url);
    })
  );
});
