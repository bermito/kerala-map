# Kerala Specialty Coffee Map

A single-page interactive 3D map of Kerala's specialty coffee scene — cafés,
roasters, farms and coffee education, listed district by district. The whole
site is one self-contained HTML file. No build step, no backend, no npm, no
framework.

## Where it lives

- **Domain:** specialtycoffeekerala.com (canonical: `www.specialtycoffeekerala.com`)
- **Hosting:** GitHub Pages, deployed from the `main` branch, `/root` folder
- **Deploy method:** upload files to the repo root via **Add file → Upload
  files**, commit to `main`. Pages redeploys automatically, usually live
  within a minute. There is no build command.

## Files in this repo

| File | Role |
|---|---|
| `index.html` | The entire site. three.js and all map data are inlined. |
| `favicon.ico` | Browser-tab fallback icon |
| `apple-touch-icon.png` | 180×180, iOS home screen |
| `icon-192.png` / `icon-512.png` | Android/PWA home-screen icons |
| `manifest.webmanifest` | Web app manifest, references the two PWA icons |
| `robots.txt` | Allows crawling, points to sitemap |
| `sitemap.xml` | Single-page sitemap |
| `og-image.png` | 1200×630 social share preview image |
| `README.md` | This file |
| `THIRD_PARTY_LICENSES.md` | three.js MIT license, fonts, data attribution |

## Editable content

All in the last `<script>` block of `index.html`, near the top:

- **`DATA`** — the listings, keyed by district name. Each district has `sub`
  (a one-line description) plus four arrays: `cafes`, `roasters`, `farms`,
  `education`. Each entry is `{n: "Name", m: "Location · note", w: "https://..."}`,
  optionally with `v: "probable"` to show a small "probable" tag.
- **`EVENTS`** — `{date: "YYYY-MM-DD", title, venue, blurb}`. Past dates drop
  off the arrival card automatically.
- **`FORM_ENDPOINT`** — the Formspree URL the email signup posts to.
- **`SUPABASE_URL`** / **`SUPABASE_ANON_KEY`** — used by the Add-a-Place form
  to submit to the `submissions` table.
- **Colour ramps:** `OVERSTOPS` (zoomed-out terrain), `STOPS` (zoomed-in
  terrain), `GSTOPS` (hover tint).

## Known limitations

- Two district boundaries are off in the upstream census dataset — Idukki
  reads ~15% large, Ernakulam ~21% small versus official area figures.
- Elevation is modelled, not survey data.
- PWA icons are marked `purpose: "any"`, not `"maskable"` — some Android
  launchers may clip the tip of the Kerala shape when cropping into circles.
