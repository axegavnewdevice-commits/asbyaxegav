"use strict";
const CACHE_PREFIX = "arabic-scrabble";
const CACHE_NAME = CACHE_PREFIX + "-v1";
const CORE_ASSETS = ["./", "./index.html", "./pwa.js", "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png"];
const OPTIONAL_EXTERNAL_ASSETS = ["https://cdn.tailwindcss.com", "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"];
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await Promise.all(OPTIONAL_EXTERNAL_ASSETS.map(async (url) => {
      try {
        const request = new Request(url, { mode: "no-cors", cache: "reload" });
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") await cache.put(request, response);
      } catch (_) { /* Optional CDN: continue install and use local fallbacks. */ }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX + "-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isLocal = url.origin === self.location.origin;
  const isExternalDependency = !isLocal && ["script", "style", "font"].includes(request.destination);
  if (isExternalDependency) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        fetch(request).then((response) => { if (response.ok || response.type === "opaque") cache.put(request, response.clone()); }).catch(() => {});
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
        return response;
      } catch (_) {
        return new Response("Offline resource unavailable", { status: 503, statusText: "Offline", headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }
  if (!isLocal) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) { const cache = await caches.open(CACHE_NAME); await cache.put("./index.html", response.clone()); }
        return response;
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) || (await cache.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try { const response = await fetch(request); if (response.ok) await cache.put(request, response.clone()); return response; }
    catch (_) { return Response.error(); }
  })());
});
