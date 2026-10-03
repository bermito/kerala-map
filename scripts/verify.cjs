const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {todayIST,upcoming,eventTime}=require('../assets/shared.js');
const read=n=>JSON.parse(fs.readFileSync(`content/${n}.json`,'utf8'));
const data=read('data'),str=read('str'),events=read('events');
const entries=Object.values(data).flatMap(d=>Object.values(d).filter(Array.isArray).flat());
assert.equal(entries.length,30);
assert(!entries.some(e=>/Lady Loafella|Coz Coffee/i.test(e.n)));
const branches=entries.filter(e=>/^Third Wave Coffee — (Panampilly|Noel)/.test(e.n));
assert.equal(branches.length,2);assert(branches.every(e=>!e.v&&e.w.startsWith('https://stores.thirdwavecoffeeroasters.com/')));
const cafes=Object.values(data).flatMap(d=>d.cafes||[]);
assert.equal(cafes.length,17);
for(const e of cafes){
 assert(e.address&&e.address_ml&&e.mapUrl,`Missing café address or directions: ${e.n}`);
 const u=new URL(e.mapUrl);
 assert(['www.google.com','maps.app.goo.gl'].includes(u.hostname),`Invalid maps host: ${e.n}`);
 if(u.hostname==='www.google.com')assert(u.searchParams.get('api')==='1'&&u.searchParams.get('query'),`Missing map search: ${e.n}`);
 for(const field of ['hours','visitNote'])if(e[field])assert(e[field+'_ml'],`Missing translation for ${field}: ${e.n}`);
 if(e.phone)assert(/^\+91\d{10}$/.test(e.phone),`Invalid phone: ${e.n}`);
}
assert.deepEqual(Object.keys(str.en).sort(),Object.keys(str.ml).sort());
for(const [district,d] of Object.entries(data)){
 assert(d.name_ml&&d.sub_ml,`District translation missing: ${district}`);
 for(const e of Object.values(d).filter(Array.isArray).flat())assert(e.n_ml&&e.m_ml,`Listing translation missing: ${e.n}`);
}
for(const e of events)assert(e.title_ml&&e.venue_ml&&e.blurb_ml&&e.url);
const archive=read('events-archive');
assert(archive.every(e=>e.archived&&e.slug&&!e.registrationUrl),'Archives must not have active registration');
assert.equal(new Set([...events,...archive].map(e=>e.slug)).size,events.length+archive.length);
for(const e of [...events,...archive]){
 if(e.details)assert.equal(e.details.length,e.details_ml.length);
 for(const field of ['organizerName','registrationLabel','timeNote','entry','sourceNote','sourceLabel'])if(e[field])assert(e[field+'_ml'],`Missing ${field} translation: ${e.slug}`);
 if(e.image)assert(fs.existsSync('.'+e.image)&&e.imageAlt&&e.imageAlt_ml&&e.posterSourceUrl);
 if(e.qr)assert(e.registrationUrl&&fs.existsSync('.'+e.qr));
}
for(const f of read('faq'))assert(f.q_ml&&f.a_ml);
for(const p of read('posts')){assert(p.title.ml&&p.description.ml);for(const s of p.sections)assert.equal(s.en.length,s.ml.length);}
assert.equal(todayIST(new Date('2026-11-08T18:29:59Z')),'2026-11-08');
assert.equal(todayIST(new Date('2026-11-08T18:30:00Z')),'2026-11-09');
const festival=events.find(e=>e.kind==='festival'),competition=events.find(e=>e.kind==='competition');
assert.equal(eventTime(competition),'9 AM–5 PM IST');
assert(!/[a-z]/i.test(eventTime(competition,'ml')));
assert(festival.ticketUrl&&!festival.registrationUrl,'Unconfirmed festival tickets must not be presented as registration');
assert(upcoming(events,new Date('2026-11-08T18:29:59Z')).includes(festival),'Festival must stay visible throughout day two');
assert(!upcoming(events,new Date('2026-11-08T18:30:00Z')).includes(festival),'Festival must expire at Kerala midnight');
assert(!upcoming(events,new Date('2026-11-08T00:00:00Z')).includes(competition),'Single-day event must expire');
assert.equal(upcoming(events,new Date('2027-01-01T00:00:00Z')).length,0);
for(const f of fs.readdirSync('assets').filter(n=>n.endsWith('.js')))new vm.Script(fs.readFileSync('assets/'+f,'utf8'),{filename:f});
const expected={'three-r128.js':'16330db1e46081a42a3ef4a921a33b3e3f801f0fa76c8f3e0d31d9d489f444f2','terrain-overview.js':'a35710c17a70d809c899a5c211b2448e7c905d69efe73ad4d594754d2008c2cc','terrain-detail.js':'35996e12ab51fbd0d26ff4d1a1f47528ff02308420d7bedbad3769ec1252bdc4'};
for(const [f,hash] of Object.entries(expected))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('assets/'+f)).digest('hex'),hash,'Production terrain must be preserved');
// The UI must initialize safely without WebGL, and keep its real routes usable.
const elements=new Map(),windowListeners={},documentListeners={};
let dynamicIndex=0;
function classList(){const values=new Set();return {add(...names){names.forEach(n=>values.add(n));},remove(...names){names.forEach(n=>values.delete(n));},contains(n){return values.has(n);},toggle(n,force){const next=force===undefined?!values.has(n):force;if(next)values.add(n);else values.delete(n);return next;}};}
function el(id){
 const existing=[...elements.values()].find(e=>e.id===id);if(existing)return existing;
 const node={id,style:{setProperty(){}},dataset:{},listeners:{},attributes:{},classList:classList(),children:[],isConnected:true,value:'',
  setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];},addEventListener(t,fn){this.listeners[t]=fn;},
  focus(){context.document.activeElement=this;},prepend(child){this.children.unshift(child);},appendChild(child){this.children.push(child);},
  remove(){this.isConnected=false;elements.delete(id);},contains(target){return this.children.includes(target);},
  getBoundingClientRect(){return {top:0,bottom:id==='top'?88:700,height:88};},getClientRects(){return [{}];},
  querySelectorAll(){return [];},querySelector(){return null;}
 };elements.set(id,node);return node;
}
const blocks=['map-footer','map-controls','map-event','fallback'].map(el);
const location={hash:'',pathname:'/ml/',search:''};
const history={state:null,replaceState(state,unused,url){this.state=state;location.hash=url.includes('#')?'#'+url.split('#')[1]:'';},pushState(state,unused,url){this.replaceState(state,unused,url);}};
const context={console,Intl,Date,URL,getComputedStyle(){return {visibility:'visible'};},window:{addEventListener(t,fn){windowListeners[t]=fn;}},
 document:{documentElement:{lang:'ml',style:{setProperty(){}}},getElementById:el,activeElement:el('navAbout'),
  addEventListener(t,fn){documentListeners[t]=fn;},body:el('body'),createElement(){return el('dynamic-'+(++dynamicIndex));},
  querySelector(){return el('top');},querySelectorAll(){return blocks;}}
 ,location,history};
vm.createContext(context);vm.runInContext(fs.readFileSync('assets/content.js','utf8'),context);
vm.runInContext(fs.readFileSync('assets/shared.js','utf8').replace("typeof window==='undefined'?{}:window","this"),context);
vm.runInContext(fs.readFileSync('assets/map.js','utf8'),context);
assert.equal(el('fallback').style.display,'grid');assert(context.document.body.classList.contains('map-unavailable'));
assert.equal(el('districtChips').children.length,14,'All districts must be reachable without WebGL');
assert(el('districtSelect').innerHTML.includes(data.Ernakulam.name_ml),'Keyboard selector must include Ernakulam');
el('navAbout').listeners.click();assert(el('panelBody').innerHTML.includes(str.ml.aboutP1));
assert(blocks.every(e=>e.inert),'Hidden homepage controls must not remain tabbable');
el('panelClose').listeners.click();assert.equal(el('panel').inert,true);
assert(blocks.every(e=>!e.inert),'Closing must restore homepage controls');assert.equal(context.document.activeElement.id,'navAbout');
el('navEvents').listeners.click();assert(el('panelBody').innerHTML.includes(festival.title_ml));
assert(el('panelBody').innerHTML.includes('/ml/events/'),'Events drawer must link to the events page');
const featured=events.find(e=>e.featured);
assert(el('panelBody').innerHTML.includes('/ml/events/'+featured.slug+'/'),'Featured event must link to its own details');
el('panelClose').listeners.click();
const districtIndex=read('names').indexOf('Ernakulam');
el('districtSelect').value=String(districtIndex);el('districtSelect').listeners.change();
assert.equal(location.hash,'#map-ernakulam');assert(el('panelBody').innerHTML.includes(data.Ernakulam.name_ml));
for(const e of data.Ernakulam.cafes){assert(el('panelBody').innerHTML.includes(e.address_ml));assert(el('panelBody').innerHTML.includes(e.mapUrl.replace(/&/g,'&amp;')));}
assert(el('panelBody').innerHTML.includes(featured.title_ml),'District drawer must include its featured event without WebGL');
documentListeners.keydown({key:'Escape',preventDefault(){}});assert.equal(el('panel').inert,true);assert.equal(location.hash,'');
console.log('PASS: 17 café addresses and map links, official branch sources, bilingual event details, archived registration safety, IST event times/expiry, JavaScript syntax, terrain hashes and no-WebGL navigation.');
