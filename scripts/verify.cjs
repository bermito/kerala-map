const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {todayIST,upcoming}=require('../assets/shared.js');
const read=n=>JSON.parse(fs.readFileSync(`content/${n}.json`,'utf8'));
const data=read('data'),str=read('str'),events=read('events');
const entries=Object.values(data).flatMap(d=>Object.values(d).filter(Array.isArray).flat());
assert.equal(entries.length,30);
assert(!entries.some(e=>/Lady Loafella|Coz Coffee/i.test(e.n)));
const branches=entries.filter(e=>/^Third Wave Coffee — (Panampilly|Noel)/.test(e.n));
assert.equal(branches.length,2);assert(branches.every(e=>e.v==='unconfirmed'&&e.w.startsWith('https://')));
assert.deepEqual(Object.keys(str.en).sort(),Object.keys(str.ml).sort());
for(const [district,d] of Object.entries(data)){
 assert(d.name_ml&&d.sub_ml,`District translation missing: ${district}`);
 for(const e of Object.values(d).filter(Array.isArray).flat())assert(e.n_ml&&e.m_ml,`Listing translation missing: ${e.n}`);
}
for(const e of events)assert(e.title_ml&&e.venue_ml&&e.blurb_ml&&e.url);
for(const f of read('faq'))assert(f.q_ml&&f.a_ml);
for(const p of read('posts')){assert(p.title.ml&&p.description.ml);for(const s of p.sections)assert.equal(s.en.length,s.ml.length);}
assert.equal(todayIST(new Date('2026-11-08T18:29:59Z')),'2026-11-08');
assert.equal(todayIST(new Date('2026-11-08T18:30:00Z')),'2026-11-09');
const festival=events.find(e=>e.kind==='festival'),competition=events.find(e=>e.kind==='competition');
assert(upcoming(events,new Date('2026-11-08T18:29:59Z')).includes(festival),'Festival must stay visible throughout day two');
assert(!upcoming(events,new Date('2026-11-08T18:30:00Z')).includes(festival),'Festival must expire at Kerala midnight');
assert(!upcoming(events,new Date('2026-11-08T00:00:00Z')).includes(competition),'Single-day event must expire');
assert.equal(upcoming(events,new Date('2027-01-01T00:00:00Z')).length,0);
for(const f of fs.readdirSync('assets').filter(n=>n.endsWith('.js')))new vm.Script(fs.readFileSync('assets/'+f,'utf8'),{filename:f});
const expected={'three-r128.js':'16330db1e46081a42a3ef4a921a33b3e3f801f0fa76c8f3e0d31d9d489f444f2','terrain-overview.js':'a35710c17a70d809c899a5c211b2448e7c905d69efe73ad4d594754d2008c2cc','terrain-detail.js':'35996e12ab51fbd0d26ff4d1a1f47528ff02308420d7bedbad3769ec1252bdc4'};
for(const [f,hash] of Object.entries(expected))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('assets/'+f)).digest('hex'),hash,'Production terrain must be preserved');
// The UI must initialize safely without WebGL, and keep About/Events usable.
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{id,style:{},listeners:{},setAttribute(){},addEventListener(t,fn){this.listeners[t]=fn},focus(){},prepend(){},remove(){},isConnected:true});return elements.get(id);}
const context={console,Intl,Date,document:{documentElement:{lang:'ml'},getElementById:el,activeElement:el('navAbout'),addEventListener(){},body:{classList:{add(){},remove(){}}},createElement(){return el('dynamic')}},location:{hash:'',pathname:'/ml/',search:''},history:{replaceState(){}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('assets/content.js','utf8'),context);vm.runInContext(fs.readFileSync('assets/shared.js','utf8').replace("typeof window==='undefined'?{}:window","this"),context);vm.runInContext(fs.readFileSync('assets/map.js','utf8'),context);
assert.equal(el('fallback').style.display,'grid');
el('navAbout').listeners.click();assert(el('panelBody').innerHTML.includes(str.ml.aboutP1));
el('panelClose').listeners.click();assert.equal(el('panel').inert,true);
el('navEvents').listeners.click();assert(el('panelBody').innerHTML.includes(festival.title_ml));
console.log('PASS: content removals, cautious opening status, full translation coverage, IST event expiry, JavaScript syntax, original terrain hashes, no-WebGL navigation.');
