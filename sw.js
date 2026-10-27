/* おんがくスタンプ / NACHA — service worker: shows push notifications and opens the right page when tapped */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  const url = d.url || "lesson.html";
  const icon = url.indexOf("sensei") >= 0 ? "sensei-192.png" : "icon-192.png";
  e.waitUntil((async () => {
    await self.registration.showNotification(d.title || "おんがくスタンプ", { body: d.body || "", icon, badge: icon, tag: d.tag || undefined, renotify: !!d.tag, data: { url } });
    try { if (self.navigator && self.navigator.setAppBadge) await self.navigator.setAppBadge(); } catch (_) {}
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "lesson.html", self.registration.scope).href;
  e.waitUntil((async () => {
    const ws = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of ws) {
      if (w.url.split("#")[0].split("?")[0] === url && "focus" in w) { try { w.postMessage({ t: "refresh" }); } catch (_) {} return w.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
