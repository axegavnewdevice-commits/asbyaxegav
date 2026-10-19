# Arabic Scrabble PWA — Axegav

An installable, offline-capable Arabic Scrabble game for two local players. The original Arabic interface and game rules are retained; this repository adds the PWA shell, offline caching, app icons, and deployment checks.

## Features

- Installable on supported Android/desktop browsers; on iOS, use Safari **Share → Add to Home Screen**.
- Service-worker app-shell caching so the game can reopen offline after its first successful load.
- Offline/online status and install guidance in the interface.
- PWA manifest, Arabic RTL metadata, responsive icons, and standalone display mode.
- No runtime build dependencies; production build uses only Node.js built-ins.
- Automated checks via `npm run check` and GitHub Actions.

> The original game loads Tailwind and the Amiri font from public CDNs. The service worker attempts to cache these dependencies when available. If a CDN is unavailable on first visit, game logic and fallback fonts remain available, though some utility styling may be reduced.

## Run locally

Requires Node.js 20 or newer.

```bash
npm ci
npm run check
npm run build
```

Build output goes to `dist/`. To preview, serve the `dist/` directory with a local static server, for example:

```bash
cd dist
python -m http.server 4173
```

Service workers require HTTPS or `localhost`. Opening `index.html` via `file://` will not enable offline caching or installation.

## Deploy to Vercel

1. Import this GitHub repository in Vercel.
2. Framework preset: **Other** (declared in `vercel.json`).
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy. Vercel serves the app over HTTPS, enabling service worker and install support.

`vercel.json` defines build/output settings, manifest MIME type, service-worker caching headers, and basic security headers.

## Offline behavior

The app shell, manifest, JavaScript bootstrap, and icons are precached when the service worker installs. The first visit needs a network connection for any uncached external resources. After the first successful online load, eligible CDN resources are retained for later offline sessions. Game progress remains in page memory; refreshing starts a fresh game, matching the original behavior.
