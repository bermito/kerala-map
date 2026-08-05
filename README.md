# Kerala Specialty Coffee Map

A single-page 3D map of Kerala's specialty coffee scene — cafés, roasters,
farms and coffee education, district by district. Built with three.js
(r128), no build step, no backend. `index.html` is the site.

## Deploy on GitHub Pages — three steps

1. **Create a new repository** on GitHub (public).
2. **Upload all nine files** in this zip to the root of that repository.
   Easiest way: on the repo page, *Add file → Upload files*, drag
   everything in, commit to `main`.
3. **Turn on Pages.** *Settings → Pages.* Under *Build and deployment*,
   set **Source: Deploy from a branch**, **Branch: main**, folder
   **`/ (root)`**. Save.

Live in under a minute at:

```
https://<your-username>.github.io/<repo-name>/
```

**If you're pointing the real domain (specialtycoffeekerala.com) at this
repo** instead of using the github.io URL: add a `CNAME` file at the repo
root containing just the domain name, and set up the DNS records GitHub's
Pages settings page shows you once you type the domain in there. The SEO
tags in `index.html` are already written assuming
`https://specialtycoffeekerala.com/` is the final address — if it ends up
somewhere else, that string needs updating in `index.html`, `robots.txt`
and `sitemap.xml`.

## What's in this zip

| File | What it is |
|---|---|
| `index.html` | The site. This is the only file GitHub Pages strictly needs. |
| `favicon.ico` | Legacy browser-tab fallback — built from the supplied 32px tab icon. Some browsers and crawlers request `/favicon.ico` directly regardless of `<link>` tags, so this covers that case. |
| `apple-touch-icon.png` | 180×180, derived from the supplied 512px master. Used when the site is saved to an iOS home screen. |
| `icon-192.png` / `icon-512.png` | Android/PWA home-screen icons, referenced by `manifest.webmanifest`. Also derived from the 512px master. |
| `manifest.webmanifest` | Web app manifest — tells Android what icon and name to use if the site is added to a home screen. No service worker, so this doesn't make the site an installable offline app, just gives it a proper icon if someone adds it manually. |
| `robots.txt` | Tells search engines they're allowed to crawl the site and where to find the sitemap. |
| `sitemap.xml` | One-page sitemap, points at the homepage. |
| `README.md` | This file. |
| `THIRD_PARTY_LICENSES.md` | three.js's MIT license, plus font, favicon and data attribution. |

## SEO — what's already built into `index.html`

- **Title:** "Kerala Specialty Coffee Map"
- **Meta description:** "Find specialty coffee in Kerala — cafés,
  roasters, farms and coffee education, mapped district by district and
  updated as new places are confirmed."
- **Canonical URL, Open Graph and Twitter Card tags** — all set to
  `https://specialtycoffeekerala.com/`.
- **JSON-LD structured data** — a minimal `WebSite` schema block, so
  search engines have a machine-readable description of the page
  alongside the human-readable one.
- **Favicon** — the Kerala state outline in the site's brand green,
  transparent background. The 32px browser-tab icon is inlined directly
  in `index.html` (loads with the page, no separate request). The
  larger sizes — Apple touch icon, Android/PWA icons — are real files
  in the repo, since iOS and Android need an actual fetchable URL for
  those rather than an inlined data URI to work reliably.

**Not included yet:** an Open Graph preview image — the thumbnail that
shows up when the link is shared on WhatsApp, X, etc. Right now a shared
link shows the title and description text with no image. Adding one
means designing a 1200×630 graphic; a separate step for whenever there's
one ready.

**After the site is live at the real domain:** submit it to
[Google Search Console](https://search.google.com/search-console) and
submit `sitemap.xml` there. That's what gets the page into Google's index
in the first place — the on-page tags above only control how it looks
once Google has already found it; none of them make that happen by
themselves.

## Updating the content later

Everything editable lives at the top of the last `<script>` block in
`index.html`:

- **`DATA`** — the café/roaster/farm/education listings, grouped by
  district. Six districts (Kannur, Wayanad, Kozhikode, Palakkad,
  Ernakulam, Thiruvananthapuram) currently carry real, sourced entries;
  the other eight are intentionally empty, not placeholders — add to them
  the same way as more districts get confirmed.
- **`EVENTS`** — `{date, title, venue, blurb}`. Past dates drop off the
  arrival card automatically; no cleanup needed.
- **`OVERSTOPS` / `STOPS` / `GSTOPS`** — the three colour ramps (zoomed
  out, zoomed in, hover).

To make a change: edit `index.html` locally in any text editor, then
re-upload it to the repo (or `git add / git commit / git push` if you're
working from a clone). Pages redeploys automatically on every push to
`main`, usually live again within a minute.

## Email signup — not wired to anything yet

The email box on the page collects an address in the browser's memory
only — it's forgotten the moment the page reloads. It isn't connected to
Gmail or any inbox yet. GitHub Pages only serves static files, so getting
submissions into an inbox needs a small third-party form service
(Formspree, Web3Forms, or similar) sitting between the form and email —
sign up for a free account there, then the form's submit handler in
`index.html` points at that service's endpoint. Intentionally left
unwired for now; wire it in whenever that's ready to be set up.

## Known limitations, unchanged from earlier builds

- **Elevation is modelled, not measured** — interpolated from ~130
  published point elevations, not a real digital elevation model.
  Validated against seven held-out points at roughly 95 m mean error. To
  make it exact, source an SRTM / Bhuvan / Cartosat DEM tile covering
  Kerala (8.1–12.9° N, 74.8–77.5° E) and re-run the elevation model —
  this needs the source geojson and a Python environment with `scipy`,
  not something you can hand-edit in the HTML.
- **Two district boundaries are off** in the source polygon data —
  Idukki reads about 15% large, Ernakulam about 21% small, relative to
  official area figures. This is upstream in the census dataset used to
  build the map, not something introduced here.
- **Google Fonts is the one external network request** the page makes.
  Everything else — three.js, all map geometry, every listing, the
  favicon — is inlined in the HTML and needs no network access to run.
