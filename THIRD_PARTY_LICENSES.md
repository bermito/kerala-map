# Third-party licenses

## three.js (r128)

Bundled inline in `index.html` because the environment this was built in
blocks CDN script tags. If you're deploying somewhere that allows external
scripts, you can pull it off a CDN instead and drop about 600 KB from the
file.

```
Copyright © 2010-2021 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
```

## Fonts

Inter Tight and IBM Plex Mono, loaded from Google Fonts under the SIL Open
Font License. This is the one external network request the page makes. If
it's blocked, the page falls back to system fonts automatically — nothing
breaks.

## Favicon

Two assets were supplied directly for this project — a 32×32 browser-tab
icon and a 512×512 master used for the larger sizes — both the Kerala
state outline in the site's brand green on a transparent background,
already production-ready. Used as-is; `apple-touch-icon.png`,
`icon-192.png` and `icon-512.png` are plain resizes of the 512px master,
`favicon.ico` is built from the 32px tab icon. Not sourced from a third
party.

## District boundaries

Rasterised from a public Kerala district polygon dataset (census district
boundaries, `DISTRICT` / `censuscode` properties). Not redistributed here
as a separate file — baked into `index.html` as the `IDX` / `DST` arrays.

## Directory listings

Café, roaster, farm and education entries for Kannur, Wayanad, Kozhikode,
Palakkad, Ernakulam and Thiruvananthapuram are sourced from a
owner-curated research workbook (revised 5 August 2026) with per-entry
verification status and source links. Not redistributed here as a
separate file — baked into `index.html` as the `DATA` object.

## Elevation

Modelled, not measured — thin-plate RBF interpolation in log space from
published point elevations (peaks, hill stations, towns) plus a sea-level
coastline sample. See README.md for the caveat and how to replace it with
a real DEM.
