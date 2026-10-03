# Kerala Specialty Coffee Map

Map-first website for https://www.specialtycoffeekerala.com, with complete English and Malayalam pages. Updated from the public `bermito/kerala-map` main branch on 3 October 2026. The supplied index, live HTML and GitHub HTML matched before editing.

## Preview

From this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/. Use an HTTP server: opening index.html directly as a file will not resolve the site's root-relative links correctly.

## Deploy

The generated site is ready for GitHub Pages or the existing Vercel static deployment. No install command or hosted build step is needed.

1. Edit the source files in this repository.
2. Run `node seo-generate.js` and the verification commands below. Preserve all generated folders and shared assets.
3. Commit the source and generated files to the branch used by the existing deployment.
4. Check the homepage, `/ml/`, `/blog/`, `/directory/`, `/events/`, and `/sitemap.xml` on the live domain.

Do not upload only `index.html`: scripts are now cached separately and articles have their own URLs. Retain any deployment settings or CNAME file configured outside this snapshot. No domain, DNS, hosting account, or Supabase setting was changed by this update.

## What changed

- Refined the original white-and-green interface with clearer type, consistent SVG arrows, stronger text contrast, larger controls and responsive event pages.
- Added Kerala Origins — Kochi on 10 October 2026, 2–6 PM IST at Cochin Club, Fort Kochi, with the organiser's poster, direct registration link, QR code and English/Malayalam detail pages.
- Added individual pages for all four current events, a past-events archive and registration expiry at the published closing time.
- Added directory search and category filters, verified three missing listing links and replaced the empty WebGL failure screen with district navigation.
- Added desktop district selection, browser-history navigation and focus restoration for map panels.
- Removed the animated opening sequence and automatic event popup. The map is the homepage.
- Moved the guide, directory, events and FAQ out of the old overlay into normal HTML pages. Old `#guide`, `#directory`, `#events-list`, `#guide-faq` and `#district-*` links still resolve to suitable pages.
- Added three original articles, each in English and Malayalam: specialty coffee explained; a Kochi café guide; and a Wayanad coffee guide.
- Added Malayalam district and listing names, descriptions, event details, FAQs, forms, errors and accessible labels. Proper names are transliterated. Noto Sans Malayalam, natural line heights and wrapping replace Latin-style letter spacing.
- Removed Lady Loafella and Coz Coffee from the shared dataset, HTML directory and structured data.
- Added Third Wave Coffee branches in Panampilly Nagar and Noel Mall, Kakkanad with **opening status unconfirmed**. The recruitment notice is linked; neither is represented as a confirmed open business in the directory schema.
- Updated the November coffee festival and V60 competition with organizer links. Added BAKE EXPO as a clearly described related industry trade fair.
- Multi-day events remain visible through their end date using Asia/Kolkata, independent of the visitor's timezone.
- Preserved the exact production terrain datasets and Three.js library. Detailed terrain downloads on first district selection; the overview remains usable if that download fails. Assets use content-based version strings, idle rendering is limited to 30 frames per second and rendering pauses in background tabs. District movement finishes in 280 ms with smooth animation frames; detail builds after the movement, and reduced-motion preferences skip it.
- District buttons appear only on mobile, in a horizontally scrollable row with 44 px touch targets. The mobile footer flows naturally in both languages without fixed text offsets.
- Made panel Close return to the map, with separate Back buttons for subviews. Collapsed categories and closed panels no longer leave hidden links in the keyboard path. The first populated category opens automatically.
- Added required-field/email/URL validation and past-date prevention for event submissions. Existing Supabase submission configuration remains in use.

## Editing

Edit the source files, then run `node seo-generate.js` before publishing:

| File | Purpose |
| --- | --- |
| `content/data.json` | Listings, descriptions, Malayalam names and descriptions |
| `content/events.json` | Public event dates, end dates, translations and source URLs |
| `content/events-archive.json` | Historic event records rendered in the past-events archive |
| `content/posts.json` | Article titles, descriptions, paragraphs, translations and sources |
| `content/faq.json` | English and Malayalam questions and answers |
| `content/str.json` | Interface translations |
| `assets/map.js` | Map behavior and forms |
| `assets/map.css` / `assets/site.css` / `assets/refinements.css` | Map and reading-page layouts |
| `assets/pages.js` | Directory filtering, registration expiry and event archive visibility |
| `seo-generate.js` | Generates 24 HTML pages, shared content, canonical/hreflang metadata, schema and sitemap |

The generator uses only Node's built-in modules. No npm dependencies are required. The output can be deployed unchanged.

Events are filtered during generation and on the client after the listed end date. Regenerate after changing content and periodically after events finish so the no-JavaScript HTML and initial JSON-LD also stay current. This task did not create a recurring update service.

## Verification

```sh
node scripts/verify.cjs
python3 scripts/verify-html.py
```

Checks cover removal parity, translation coverage, tentative branch status, event end dates and India-midnight boundaries, JavaScript parsing, unchanged terrain hashes, no-WebGL UI initialization, internal file links, duplicate IDs, one H1 per page, valid JSON-LD, canonical URLs and language alternatives.

Browser checks covered all 14 districts, district-preserving language links, Malayalam panels and form validation, the journal, mobile layouts at 320 × 568 and 390 × 844, and desktop at 1440 × 900. No JavaScript errors were reported during those flows.

No live submissions were sent during testing. Supabase delivery, row-level-security policies and owner email notifications need an authorized end-to-end check in the deployed environment. The existing optional email-notification endpoint remains a placeholder; this update does not claim to repair backend delivery. The current production snapshot had no visible newsletter signup form.

## Existing terrain limitations

Elevation is modelled, not survey or DEM data. The inherited district boundary discrepancies described in the historical handoff remain. Private estates and regional producer networks have not been assigned new precise addresses or map pins.

See `CONTENT-SOURCES.md` for verification notes and `THIRD_PARTY_LICENSES.md` for retained licenses.
