# Kerala Specialty Coffee Map

A single-page interactive 3D map of Kerala's specialty coffee scene — cafés, roasters, farms and coffee education, listed district by district.

Live at **https://specialtycoffeekerala.com/**

---

## Deploying

Hosted on GitHub Pages from the `main` branch, `/root` folder. There is no build step and no build command.

1. In the repo, **Add file → Upload files**
2. Drop the changed file(s) into the repo root
3. Commit to `main`

Pages redeploys automatically, usually live within a minute. If a change doesn't appear, hard-refresh — the HTML is large and browsers cache it aggressively.

---

## Files

| File | Role |
| --- | --- |
| `index.html` | The entire site. three.js and all map data are inlined. ~1.1 MB. |
| `favicon.ico` | Browser-tab fallback, 2 frames (16px, 32px). |
| `apple-touch-icon.png` | 180×180, iOS home screen. |
| `icon-192.png` / `icon-512.png` | Android/PWA home-screen icons. |
| `manifest.webmanifest` | Web app manifest, references the two PWA icons. |
| `robots.txt` | Allows crawling, points to the sitemap. |
| `sitemap.xml` | Single-page sitemap. |
| `seo-generate.js` | Optional. Regenerates the static directory / events / FAQ HTML and the JSON-LD from the data in `index.html` (`node seo-generate.js`). Not needed to deploy. |
| `README.md` | This file. |
| `THIRD_PARTY_LICENSES.md` | three.js MIT license, fonts, data attribution. |

---

## The guide & directory layer

`index.html` also carries a plain-HTML twin of the map — a written guide to specialty coffee in Kerala, the full directory district by district, the upcoming events and the FAQ — inside `<main id="guide">`. It opens from the **Guide** nav button, the link under the headline, or deep links like `/#directory` and `/#district-kozhikode`. It exists so search engines and AI crawlers, which cannot read the 3D canvas, still see every listing as real text.

The directory, events and FAQ sections in it are generated from `DATA`, `EVENTS` and `FAQ`. After editing those arrays, run `node seo-generate.js` to rewrite the static copies and the `ItemList` / `Event` JSON-LD between the `<!-- SEO:* -->` markers. The prose in the guide is hand-written and edited directly.

---

## Editing content

Everything editable lives in the **last `<script>` block** of `index.html`, near the top of that block.

### `DATA` — the listings

Keyed by district name. Each district has `sub` (a one-line description) plus four arrays: `cafes`, `roasters`, `farms`, `education`.

```js
"Kozhikode":{sub:"Malabar coast · the state's café capital",
  cafes:[{n:"Place Name", m:"Location · short note", w:"https://example.com/"}],
  roasters:[], farms:[], education:[]}
```

- `n` — name
- `m` — location and a short note, separated by `·`
- `w` — optional website
- `v:"probable"` — optional, renders a small "probable" tag

Eight districts are **intentionally empty** and show "None listed yet" by design. Don't invent entries to fill them.

Three farm entries are **private / region-only** — Kelachandra, Black Baza (smallholder network) and WSSS. They show a region rather than a street address on purpose. Never add exact addresses or map pins for these.

### `EVENTS` — the arrival card

```js
{date:'2026-11-07', title:'Kerala Coffee Festival', venue:'Venue · dates', blurb:"One or two lines."}
```

Past dates drop off automatically. No cleanup needed. Add only genuine, confirmed events.

### `STR` — bilingual UI strings

English/Malayalam dictionary with `en` and `ml` keys, read through the `L()` helper. Only interface chrome is translated — place names, brand names and district names stay as-is. Defaults to English; the visitor switches manually via the **ML / EN** toggle. No auto-detection.

### Colour ramps

`OVERSTOPS` (zoomed-out terrain), `STOPS` (zoomed-in terrain), `GSTOPS` (hover tint).

---

## Forms

Both forms write to Supabase (`https://uxmkcnavtzejyiptpenj.supabase.co`). The publishable key in the file is safe to expose client-side; row-level security allows inserts only, so visitors cannot read back what others submitted.

| Form | Table | Notes |
| --- | --- | --- |
| Email signup | `subscribers` | Duplicate addresses allowed by design — de-dupe on export. |
| Add a Place | `submissions` | Full payload including submitter email and phone. |

To read either list, open the Supabase dashboard → Table Editor.

**Optional email ping.** `SUBMISSION_NOTIFY_ENDPOINT` will email you whenever someone submits a place. It is currently set to a placeholder (`YOUR_FORM_ID_HERE`) and the code skips the send while that placeholder is present — fire-and-forget, never blocks the Supabase insert, never shows an error to the visitor. To enable it, create a form at formspree.io and swap in the real endpoint.

---

## Don't undo these

Several rounds of changes have stacked up in this file. These decisions were made deliberately and reverting them has caused regressions before.

- **Background is pure white** (`#ffffff`). An earlier off-white had a green cast and was rejected.
- **Brand green is `#00a83f`** — grid checks, the word "Kerala" in the tagline, link hovers.
- **Overview terrain ramp** runs light green at the coast → tan → brown at the Ghats (`#dff2d4` → `#a0d788` → `#b06a35`). An earlier pastel version was rejected as too dull.
- **Hover tint** is a soft light green (`#b7e3c4` → `#6ac48a`). An earlier near-neon version was rejected as too bright.
- **Total lighting must stay near 1.0** — ambient 0.34 + key 0.62 + fill 0.25 + `envMapIntensity` 0.42. Push it much higher and the pale overview colours clip to white, rendering the whole state as blank paper. This bug happened once and took a while to diagnose.
- **No eyebrow label** above the headline. It collided with other elements on phone screens.
- **No brand name in metadata.** "Bermito" appears exactly once, as the legitimate name of a listed roaster in the Kozhikode data. It must not appear in the title, H1, meta description, Open Graph tags or JSON-LD.
- **Background grid** is `uScale` 92 × 62 at line strength 0.55, which renders as roughly 20 rows on screen.

---

## Known limitations

- Two district boundaries are off in the upstream census dataset — Idukki reads ~15% large, Ernakulam ~21% small versus official area figures. Not introduced by this build; needs a better source dataset.
- Elevation is **modelled, not measured** — thin-plate RBF interpolation in log space from ~130 published point elevations plus a sea-level coastline sample, validated against seven held-out points at ~95 m mean error, then clamped per district to published highest points. Replacing it with a real DEM (SRTM / Bhuvan / Cartosat, covering 8.1–12.9° N, 74.8–77.5° E) means re-running the Python elevation model — not hand-editable in the HTML.
- No Open Graph preview image yet (needs a 1200×630 graphic), so shared links show text only, no thumbnail.
- Google Fonts is the only external network request. Everything else is inlined. If Fonts is blocked the page falls back to system fonts and nothing breaks.
- PWA icons are `purpose: "any"`, not `maskable` — some Android launchers that crop to circles may clip the tip of the Kerala shape. Fixing it needs a padded maskable variant, which conflicts with the no-background requirement.

---

## Before shipping any change

Verify the file still parses and that earlier work is intact. Silent regressions are the main risk in a file this size.

```bash
node -e '
const fs=require("fs");
const s=fs.readFileSync("index.html","utf8");
const blocks=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
blocks.forEach((b,i)=>{ try{ new Function(b); console.log("block",i,"OK"); }
  catch(e){ console.log("block",i,"FAIL:",e.message); process.exitCode=1; } });
'
```

The `</script>` count will exceed the `<script>` count — expected, since JSON-LD blocks carry a `type` attribute and don't match the plain pattern.
