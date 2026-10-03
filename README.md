# Kerala Coffee Map — manual upload package

Prepared on 3 October 2026 for the Specialty Coffee Kerala Map website.

## Manual upload

1. Extract the ZIP and open the `kerala-coffee-map` folder.
2. Upload its files and folders together to the intended Kerala Coffee Map website. Keep `index.html` at the website root and preserve the folder structure.
3. Check `/`, `/directory/`, `/events/` and `/ml/` after uploading.

The HTML is already generated. No install command or hosted build step is required. This package contains no Git connection, deployment workflow or hosting-account configuration. Its scripts, posters, fonts and additional pages must be uploaded along with `index.html`.

Canonical URLs and the sitemap use `https://www.specialtycoffeekerala.com`. For another domain, change `SITE` in `seo-generate.js`, update `robots.txt`, and regenerate before uploading.

## Included

- Original Kerala terrain and district map with the brighter white-and-green interface.
- All 17 café listings with addresses and Google Maps links, plus business-published contacts and hours where available.
- Nine event detail pages: four current events and five archived gatherings.
- Four original posters and Hario’s official Calicut artwork, with full-size image links and source attribution.
- Registration/booking links and QR codes for Kerala Origins Kochi, BAKE EXPO and Hario Calicut.
- Past-event labels, registration expiry, directory search and filters.
- 34 English and Malayalam HTML pages, including the directory, journal and FAQ.
- Locally served English and Malayalam fonts with their licenses.

## Information still needed

- Original posters for Kerala Coffee Festival, Kerala Masters Pour Over Championship, Beyond the Cup and Coffee Talk #001. Hario has official artwork rather than a text poster.
- A confirmed direct festival-ticket link and daily festival hours.
- Coffee Talk #001’s precise venue address and original announcement.
- Clarification of BRWLAB’s conflicting published addresses and Underblu’s current venue while Convent Road is marked coming soon.

Bean Curious’s original poster and article give different times; its archive explains this. Third Wave Noel Focus Mall has an official address and phone but no published hours, so its listing advises calling before visiting.

## Preview locally

Run this command from the extracted folder, then open `http://127.0.0.1:8765/`:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Use an HTTP server. Root-relative paths do not resolve correctly when opening `index.html` as a local file.

## Edit later

| File | Purpose |
| --- | --- |
| `content/data.json` | Bilingual listings, addresses, maps, contacts and location sources |
| `content/events.json` | Upcoming event details, booking links, posters and translations |
| `content/events-archive.json` | Past event details and posters |
| `content/posts.json` | Journal articles and sources |
| `content/faq.json`, `content/str.json` | FAQ and interface translations |
| `assets/map.js` | Map controls, district details and existing forms |
| `assets/refinements.css` | Interface styling |
| `seo-generate.js` | Generates all HTML, shared content and sitemap |

After editing, regenerate and verify:

```sh
node seo-generate.js
node scripts/verify.cjs
python3 scripts/verify-html.py
```

The generator uses Node’s built-in modules. Include regenerated pages and assets in your manual upload. Regenerate periodically after events finish; no recurring update service is included.

## Validation and existing services

Content and HTML checks passed for all 34 pages. Browser checks covered both languages, 320 px and 390 px phones, desktop event pages, directory search, map-drawer directions, image loading, registration closure and archive rollover.

Existing Supabase submission configuration is retained. No live submission was sent; backend delivery was not changed or claimed as newly verified. The optional email-notification endpoint remains the existing placeholder.

Terrain remains modelled elevation with inherited boundaries, not survey data. Private estates and regional networks retain broad location descriptions.

See `CONTENT-SOURCES.md` and `THIRD_PARTY_LICENSES.md` for evidence and attribution.
