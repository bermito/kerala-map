#!/usr/bin/env node
/* seo-generate.js
   Reads NAMES / DATA / EVENTS / FAQ out of index.html and rewrites the static
   directory, events and FAQ HTML plus the Event and ItemList JSON-LD between
   the SEO:* markers. Run after editing listings or events so the crawlable
   copy never drifts from what the map shows:   node seo-generate.js
*/
const fs = require('fs');
const vm = require('vm');
const path = process.argv[2] || 'index.html';
let src = fs.readFileSync(path, 'utf8');

function grab(re){ const m = src.match(re); if(!m) throw new Error('not found: '+re); return m[0]; }
const ctx = {}; vm.createContext(ctx);
vm.runInContext(
  grab(/const NAMES\s*=\s*\[[^\]]*\];/).replace('const ','var ') +
  grab(/const DATA\s*=\s*\{[\s\S]*?\n  \};/).replace('const ','var ') +
  grab(/const EVENTS\s*=\s*\[[\s\S]*?\n  \];/).replace('const ','var ') +
  grab(/const FAQ\s*=\s*\[[\s\S]*?\n  \];/).replace('const ','var '), ctx);
const { NAMES, DATA, EVENTS, FAQ } = ctx;

const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const SITE = 'https://www.specialtycoffeekerala.com/';
const CATS = [
  ['buyroasted','Buy roasted coffee','Store'],
  ['cafes','Specialty cafés','CafeOrCoffeeShop'],
  ['roasters','Specialty roasters','LocalBusiness'],
  ['farms','Specialty farms','LocalBusiness'],
  ['education','Coffee education','LocalBusiness'],
  ['baristas','Baristas & home brewers',null],       // people: kept out of schema
  ['equipment','Coffee equipment shops','Store'],
];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const today = new Date().toISOString().slice(0,10);

/* ---------- directory HTML ---------- */
let dir = '', listItems = [], pos = 1;
NAMES.forEach((name, i) => {
  const rec = DATA[name] || {};
  const total = CATS.reduce((n,[k]) => n + (rec[k]||[]).length, 0);
  dir += `\n      <section class="dir-district" id="district-${slug(name)}">\n`;
  dir += `        <h3>${esc(name)} <span class="dir-count mono">${total===0?'none listed yet':total+(total===1?' place':' places')}</span></h3>\n`;
  if (rec.sub) dir += `        <p class="dir-sub mono">${esc(rec.sub)}</p>\n`;
  if (total) dir += `        <button class="dir-map" type="button" data-district="${i}">View ${esc(name)} on the map →</button>\n`;
  CATS.forEach(([k,label,type]) => {
    const list = rec[k] || [];
    if (!list.length) return;
    dir += `        <h4>${esc(label)}</h4>\n        <ul class="dir-list">\n`;
    list.forEach(e => {
      const nameHtml = e.w ? `<a href="${esc(e.w)}" target="_blank" rel="noopener">${esc(e.n)}</a>` : `<span>${esc(e.n)}</span>`;
      const tag = e.v ? ` <em class="dir-tag mono">${esc(e.v)}</em>` : '';
      dir += `          <li>${nameHtml}${tag}<small class="mono">${esc(e.m||'')}</small></li>\n`;
      if (type) {
        const item = { '@type': type, name: e.n,
          address: { '@type':'PostalAddress', addressLocality: name, addressRegion:'Kerala', addressCountry:'IN' } };
        if (e.m) item.description = e.m;
        if (e.w) item.url = e.w;
        listItems.push({ '@type':'ListItem', position: pos++, item });
      }
    });
    dir += `        </ul>\n`;
  });
  dir += `      </section>\n`;
});

/* ---------- events HTML + schema ---------- */
const upcoming = EVENTS.filter(e => e.date >= today).sort((a,b) => a.date.localeCompare(b.date));
const fmt = d => new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
let ev = upcoming.length ? '\n      <ul class="ev-list">\n' : '\n      <p class="mono">No upcoming events listed right now.</p>\n';
upcoming.forEach(e => {
  ev += `        <li><time class="mono" datetime="${esc(e.date)}">${esc(fmt(e.date))}</time><b>${esc(e.title)}</b><small class="mono">${esc(e.venue)}</small><p>${esc(e.blurb)}</p></li>\n`;
});
if (upcoming.length) ev += '      </ul>\n';

const cityOf = v => {
  const s = String(v||'');
  for (const c of ['Kozhikode','Calicut','Kochi','Cochin','Wayanad','Kalpetta','Kannur','Thrissur','Thiruvananthapuram','Manjeri','Kumily','Idukki']) {
    if (s.indexOf(c) >= 0) return c;
  }
  return 'Kerala';
};
const eventLD = upcoming.map(e => ({
  '@context':'https://schema.org', '@type':'Event',
  name: e.title, startDate: e.date, description: e.blurb,
  eventStatus:'https://schema.org/EventScheduled',
  eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',
  location: { '@type':'Place', name: e.venue,
    address: { '@type':'PostalAddress', addressLocality: cityOf(e.venue), addressRegion:'Kerala', addressCountry:'IN' } },
  url: SITE + '#events-list'
}));

/* ---------- FAQ HTML (static twin of the panel accordion) ---------- */
let faq = '\n      <dl class="faq-static">\n';
FAQ.forEach(f => { faq += `        <dt>${esc(f.q)}</dt>\n        <dd>${esc(f.a)}</dd>\n`; });
faq += '      </dl>\n';

/* ---------- ItemList schema ---------- */
const listLD = { '@context':'https://schema.org', '@type':'ItemList',
  name:'Specialty coffee in Kerala — directory', url: SITE + '#directory',
  numberOfItems: listItems.length, itemListOrder:'https://schema.org/ItemListUnordered', itemListElement: listItems };

const ld = '\n<script type="application/ld+json">\n' + JSON.stringify(listLD) + '\n</script>' +
  eventLD.map(e => '\n<script type="application/ld+json">\n' + JSON.stringify(e) + '\n</script>').join('') + '\n';

/* ---------- splice ---------- */
function splice(tag, body){
  const re = new RegExp(`(<!-- SEO:${tag}:START -->)[\\s\\S]*?(<!-- SEO:${tag}:END -->)`);
  if (!re.test(src)) throw new Error('markers missing: '+tag);
  src = src.replace(re, (m,a,b) => a + body + '      ' + b);
}
splice('DIRECTORY', dir);
splice('EVENTS', ev);
splice('FAQ', faq);
src = src.replace(/(<!-- SEO:LD:START -->)[\s\S]*?(<!-- SEO:LD:END -->)/, (m,a,b) => a + ld + b);

fs.writeFileSync(path, src);
console.log(`seo-generate: ${listItems.length} listings, ${upcoming.length} upcoming events, ${FAQ.length} FAQs written to ${path}`);
