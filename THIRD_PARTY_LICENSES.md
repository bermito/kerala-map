# Third-Party Licenses and Attribution

This site inlines third-party code and builds on published data. Attribution and license terms are below.

---

## three.js (r128)

Bundled inline in `index.html` (~600 KB). Inlined rather than loaded from a CDN because the original build environment blocked external scripts.

Source: https://github.com/mrdoob/three.js

```
The MIT License

Copyright © 2010-2021 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

## Fonts

Loaded from Google Fonts — the only external network request the page makes. If Google Fonts is unreachable, the page falls back to system fonts and nothing breaks.

### Inter Tight

Copyright © The Inter Project Authors. Licensed under the SIL Open Font License, Version 1.1.

### IBM Plex Mono

Copyright © 2017 IBM Corp. Licensed under the SIL Open Font License, Version 1.1.

Both licenses are available at https://openfontlicense.org/ and permit use, study, modification and redistribution, including embedding, provided the fonts are not sold on their own and any derivative does not use the reserved font names.

---

## Map data

### District boundaries

Rasterised from a public census district polygon dataset for Kerala. Two boundaries are known to be off in the upstream source — Idukki reads approximately 15% large and Ernakulam approximately 21% small against official area figures. These discrepancies come from the source data, not from this build.

### Elevation

**Modelled, not measured.** Elevation is derived by thin-plate radial basis function interpolation in log space from approximately 130 published point elevations — peaks, hill stations and towns — plus a sea-level coastline sample. The model was validated against seven held-out points at roughly 95 m mean error, then clamped per district to published highest points.

It is a plausible surface, not survey data, and should not be relied on for any purpose requiring accurate terrain heights. The site states this in the district panel.

---

## Directory listings

Entries in the directory are compiled from public sources — business websites, published listings and public social accounts — and verified before publication.

Three farm entries (Kelachandra, Black Baza and WSSS) are listed by region rather than street address at the operators' preference. This is deliberate and is not a data gap.
