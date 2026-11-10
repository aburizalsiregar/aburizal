# Aburizal Siregar portfolio

A local, editable static remake of aburizalsiregar.com, prepared for Vercel. Preserves the original OnePress appearance, portfolio content, and all 21 published page routes discovered on November 10, 2026. No WordPress server or database is needed.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. After editing source files, restart the dev command to rebuild. To build and preview separately:

```sh
npm run build
npm test
npm run preview
```

## Edit

- `content/pages/*.html`: editable page bodies, including project galleries and resume.
- `content/pages.json`: page titles, slugs, and URL paths.
- `scripts/build.mjs`: shared header, navigation, footer, metadata, and 404 page.
- `public/site.css` and `public/site.js`: responsive behavior and local overrides.
- `public/assets/`: original images, local fonts, and theme CSS.

Builds use only local files. `dist/` is generated and ignored by Git. Existing public placeholder routes (`/blog/`, `/contact/`, and `/sample-page/`) are retained for URL coverage; their original content is not a functional blog or contact form. The legacy WordPress dashboard link is rendered as text because this site has no WordPress admin.

External game/store links, the Google Drive resume, and the YouTube trailer retain their original destinations and require internet access. Their availability is controlled by those services. Content and project status reflect the source site snapshot, not independently updated biographical information.

## Deploy to Vercel

Push this repository to your Git provider and import it in Vercel, or run `npx vercel` from this directory to create a preview deployment. Use `npx vercel --prod` when you want to publish to production.

`vercel.json` configures:

- Framework preset: Other
- Build command: `npm run build`
- Output directory: `dist`
- Trailing-slash routes

No environment variables or backend services are required. Do not set a catch-all SPA rewrite: each route has its own generated HTML, and missing pages should return 404. Connect the custom domain in Vercel only when ready to switch DNS. This repository has not been deployed or connected to a remote Git host automatically.

## Verification

`npm test` checks internal links and assets after a build. Browser verification is available with the preview server running:

```sh
npx playwright install chromium
node scripts/browser-check.mjs
```

Optionally set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable. The browser check covers every route at desktop (1440px) and mobile (390px), images, horizontal overflow, JavaScript errors, and mobile navigation. Screenshots and the report are saved under `verification/`. YouTube is blocked during local UI testing; external video playback is not verified. Screenshots are visual review artifacts, not a pixel-exact fidelity guarantee.

## Source attribution

Original portfolio text and images are retained from the user's requested source website. OnePress theme CSS is GPL v2 or later; original headers and footer attribution are retained. Bootstrap, Font Awesome, Open Sans, and Raleway retain their respective licenses. See `THIRD_PARTY_NOTICES.md` and `licenses/`.
