
(function(){
  "use strict";

  /* ==========================================================================
     EDIT HERE — Kannur, Wayanad, Kozhikode, Palakkad, Ernakulam and
     Thiruvananthapuram hold real, sourced listings. The other eight districts
     are genuinely empty under this curated scope, not missing data — add
     entries here as they're confirmed.
     ========================================================================== */
  const DATA = KERALA.DATA;

  /* Events — the next one whose date hasn't passed is shown automatically.
     Add only genuine, confirmed events here — date, title, venue, blurb. */
  const EVENTS = KERALA.EVENTS;

  const NAMES = KERALA.NAMES;

  /* ---------- sign-up: sends to Formspree, lands in Gmail ---------- */
  /* Add-a-Place -> Supabase submissions table. Publishable key is safe to
     expose client-side; row-level security only allows inserts here. */
  const SUPABASE_URL = 'https://uxmkcnavtzejyiptpenj.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_jvr6FL01n6KIPU5OFF0bsw_uNt2_qj2';
  /* Email ping to the site owner whenever someone submits a place — separate
     Formspree form from the newsletter signup so quotas don't compete.
     Swap in your real endpoint ID once the form is created at formspree.io. */
  const SUBMISSION_NOTIFY_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID_HERE';

  /* ---------- bilingual UI strings (English/Malayalam toggle) ----------
     Only interface chrome is translated — place names, brand names and
     district names stay as-is per the site's editorial rules. Defaults to
     English always; the person switches manually, no auto-detection. */
  const STR = KERALA.STR;
  const LANG=document.documentElement.lang==='ml'?'ml':'en';
  let mapReady=false;
  const tr=(item,key)=>LANG==='ml' ? item[key+'_ml'] : item[key];
  const districtName=name=>LANG==='ml'?DATA[name].name_ml:name;
  const root=LANG==='ml'?'/ml/':'/';
  function L(k){ return STR[LANG][k]; }

  /* ---------- panel ---------- */
  const panel=document.getElementById('panel'), panelBody=document.getElementById('panelBody');
  function getCats(){
    return [{k:'cafes',t:L('catCafes')},{k:'roasters',t:L('catRoasters')},
            {k:'buyroasted',t:L('catBuyRoasted')},
            {k:'farms',t:L('catFarms')},{k:'education',t:L('catEducation')},
            {k:'baristas',t:L('catBaristas')},
            {k:'equipment',t:L('catEquipment')}];
  }
  const esc=function(s){return String(s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  function chev(){return '<svg class="chev" width="7" height="10" viewBox="0 0 7 10" fill="none" aria-hidden="true">'+
    '<path d="M1.5 1 5.5 5l-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
  const nf=function(n){return n.toLocaleString('en-IN');};

  /* escape the label, then turn the |marked| span into the green keyword */
  function catHTML(t){
    const parts=esc(String(t)).split('|');
    let out='';
    for(let i=0;i<parts.length;i++) out+= (i%2) ? '<em>'+parts[i]+'</em>' : parts[i];
    return out;
  }
  function renderDistrict(i){
    const name=NAMES[i], rec=DATA[name]||{sub:'',buyroasted:[], cafes:[],roasters:[],farms:[],education:[],baristas:[], equipment:[]};
    const er=(typeof ERANGE!=='undefined'&&ERANGE[name])?ERANGE[name]:null;
    let html='<div class="p-kicker mono">'+L('districtKicker')+'</div><h2 class="p-title">'+esc(districtName(name))+'</h2>'+
      '<div class="p-sub mono">'+esc(tr(rec,'sub')||'')+(er?'<br>'+L('elevation')+' '+nf(er[0])+'–'+nf(er[1])+' '+L('unit'):'')+'</div>';
    const firstNonEmpty=getCats().findIndex(cat=>(rec[cat.k]||[]).length);
    getCats().forEach(function(cat,idx){
      const list=rec[cat.k]||[];
      html+='<div class="row'+(idx===firstNonEmpty&&list.length?' open':'')+'">'+
        '<button class="row-head" type="button" aria-expanded="'+(idx===firstNonEmpty&&list.length?'true':'false')+'">'+
        '<span class="t">'+catHTML(cat.t)+'</span><span class="c mono">'+String(list.length).padStart(2,'0')+'</span>'+chev()+
        '</button><div class="row-body"'+(idx===firstNonEmpty&&list.length?'':' hidden')+'><div>';
      if(list.length){ list.forEach(function(it){
        html+='<div class="item"><div class="n">'+esc(tr(it,'n'))+
          (it.v?' <span class="tag mono">'+L('probable')+'</span>':'')+
          '</div><div class="m mono">'+esc(tr(it,'m')||'')+'</div>'+
          (it.w?'<div class="m mono"><a class="lnk" href="'+esc(it.w)+'" target="_blank" rel="noopener noreferrer">'+(it.v?L('source'):L('visit'))+'</a></div>':'')+
          '</div>'; });
      }else{ html+='<div class="empty mono">'+L('emptyCat')+'</div>'; }
      html+='</div></div></div>';
    });
    html+='<div class="p-foot mono">'+L('elevationNote')+'</div>';
    panelBody.innerHTML=html; wireRows(); panel.scrollTop=0;
  }
  function fmtDate(iso){
    const d=new Date(iso+'T12:00:00+05:30');
    return {day:String(d.getUTCDate()).padStart(2,'0'),
      mon:d.toLocaleDateString(LANG==='ml'?'ml-IN':'en-IN',{month:'short',timeZone:'Asia/Kolkata'}),
      full:d.toLocaleDateString(LANG==='ml'?'ml-IN':'en-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'})};
  }
  function upcoming(){return KERALA_UTIL.upcoming(EVENTS);}
  function renderEvents(){
    const list=upcoming();
    let html='<div class="p-kicker mono">'+L('eventsKicker')+'</div>'+
             '<div class="p-titlerow"><h2 class="p-title">'+L('eventsTitle')+'</h2>'+
               '<button class="ev-add" id="evAddBtn" type="button">'+L('evAddBtn')+'</button></div>'+
             '<div class="p-sub mono">'+L('eventsSub')+'</div>';
    if(!list.length){ html+='<div class="empty mono" style="padding-top:8px">'+L('eventsEmpty')+'</div>'; }
    else list.forEach(function(e){
      html+='<div class="ev"><div class="d mono">'+fmtDate(e.date).full+(e.endDate?' – '+fmtDate(e.endDate).full:'')+'</div><div class="t">'+esc(tr(e,'title'))+
            '</div><div class="v mono">'+esc(tr(e,'venue'))+'</div><div class="b">'+esc(tr(e,'blurb'))+'</div><a class="lnk event-source" href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+L('source')+'</a></div>';
    });
    panelBody.innerHTML=html; panel.scrollTop=0;
    const evBtn=document.getElementById('evAddBtn');
    if(evBtn) evBtn.addEventListener('click',function(){ renderAddEvent(); openPanel('addevent'); });
  }

  /* Submit an event — same Formspree/Supabase path as Add a Place, tagged
     category:'event' so submissions land separately. Name, date and venue
     are required; everything else can follow later. */
  function renderAddEvent(){
    panelBody.innerHTML='<div class="p-kicker mono">'+L('contributeKicker')+'</div>'+
      '<h2 class="p-title">'+L('addEventTitle')+'</h2>'+
      '<div class="p-sub mono">'+L('addEventSub')+'</div>'+
      '<form id="addEventForm" class="add-form" novalidate>'+
        '<label class="af-label mono" for="ae-name">'+L('lblEvName')+'</label>'+
        '<input class="af-input" id="ae-name" name="event_name" type="text" required />'+
        '<label class="af-label mono" for="ae-date">'+L('lblEvDate')+'</label>'+
        '<input class="af-input" id="ae-date" name="event_date" type="date" required />'+
        '<label class="af-label mono" for="ae-venue">'+L('lblEvVenue')+'</label>'+
        '<input class="af-input" id="ae-venue" name="venue" type="text" required />'+
        '<label class="af-label mono" for="ae-host">'+L('lblEvHost')+'</label>'+
        '<input class="af-input" id="ae-host" name="host" type="text" />'+
        '<label class="af-label mono" for="ae-link">'+L('lblEvLink')+'</label>'+
        '<input class="af-input" id="ae-link" name="link" type="url" />'+
        '<label class="af-label mono" for="ae-desc">'+L('lblEvDesc')+'</label>'+
        '<textarea class="af-input af-textarea" id="ae-desc" name="description" rows="3"></textarea>'+
        '<label class="af-label mono" for="ae-email">'+L('lblEmail')+'</label>'+
        '<input class="af-input" id="ae-email" name="submitter_email" type="email" required />'+
        '<button class="af-submit" type="submit">'+L('submitBtn')+'</button>'+
        '<div class="msg mono" id="aeMsg" role="status"></div>'+
      '</form>'+
      '<div class="p-foot mono">'+L('addEventFoot')+'</div>';
    panel.scrollTop=0;
    wireAddEventForm();
  }

  function wireAddEventForm(){
    const form=document.getElementById('addEventForm');
    if(!form) return;
    const msg=document.getElementById('aeMsg');
    form.event_date.min=KERALA_UTIL.todayIST();
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.checkValidity()){msg.className='msg mono err';msg.textContent=L('invalid');form.querySelector(':invalid').focus();return;}
      const btn=form.querySelector('.af-submit');
      if(form.event_date.value<KERALA_UTIL.todayIST()){msg.textContent=L('eventPast');return;}
      const payload={
        place_name:form.event_name.value.trim(),   /* reuses the submissions table */
        category:'event',
        city:form.venue.value.trim()||null,
        district:null,
        address_or_maps_link:form.event_date.value||null,
        website:form.link.value.trim()||null,
        instagram:form.host.value.trim()||null,
        description:form.description.value.trim()||null,
        submitter_email:form.submitter_email.value.trim(),
        phone:null
      };
      if(!payload.place_name||!payload.address_or_maps_link||!payload.city||!payload.submitter_email){
        msg.className='msg mono err'; msg.textContent=L('evRequiredMsg'); return;
      }
      btn.disabled=true; btn.style.opacity='.5';
      msg.className='msg mono'; msg.textContent=L('sending');
      if(SUBMISSION_NOTIFY_ENDPOINT.indexOf('YOUR_FORM_ID_HERE')===-1){
        const notifyBody=new FormData();
        notifyBody.append('_subject','New event submitted — '+payload.place_name);
        Object.keys(payload).forEach(function(k){ notifyBody.append(k, payload[k]==null?'':payload[k]); });
        fetch(SUBMISSION_NOTIFY_ENDPOINT,{method:'POST',headers:{'Accept':'application/json'},body:notifyBody}).catch(function(){});
      }
      fetch(SUPABASE_URL+'/rest/v1/submissions',{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,
                 'Authorization':'Bearer '+SUPABASE_ANON_KEY,'Prefer':'return=minimal'},
        body:JSON.stringify(payload)
      }).then(function(res){
        if(res.ok){ msg.className='msg mono ok'; msg.textContent=L('evOkMsg'); form.reset(); }
        else{ msg.className='msg mono err'; msg.textContent=L('sendErr'); }
      }).catch(function(){
        msg.className='msg mono err'; msg.textContent=L('connErr');
      }).finally(function(){ btn.disabled=false; btn.style.opacity=''; });
    });
  }
  const FAQ = KERALA.FAQ;

  function renderFaq(){
    panelBody.innerHTML='<div class="p-kicker mono">'+L('faqKicker')+'</div><h2 class="p-title">'+L('faqTitle')+'</h2>'+
      '<div class="p-sub mono">'+L('faqSub')+'</div>'+FAQ.map(f=>'<details class="panel-faq"><summary>'+esc(tr(f,'q'))+'</summary><p>'+esc(tr(f,'a'))+'</p></details>').join('')+
      '<div class="p-contact mono">'+L('aboutContact')+' <a href="mailto:contact@specialtycoffeekerala.com">contact@specialtycoffeekerala.com</a></div>';
    panel.scrollTop=0;
  }
  function renderAbout(){
    panelBody.innerHTML='<div class="p-kicker mono">'+L('aboutKicker')+'</div><h2 class="p-title">'+esc(L('brand'))+'</h2>'+
      '<div class="p-sub mono">'+L('aboutSub')+'</div>'+
      '<p style="font-size:14px;line-height:1.6;opacity:.85">'+L('aboutP1')+'</p>'+
      '<p style="font-size:14px;line-height:1.6;opacity:.85;margin-top:14px">'+L('aboutP2')+'</p>'+
      '<button class="cta-green" id="aboutAddPlaceBtn" type="button">'+L('aboutAddBtn')+'</button>'+
      '<button class="cta-outline" id="aboutRemoveBtn" type="button">'+L('aboutRemoveBtn')+'</button>'+
      '<div class="p-contact mono">'+L('aboutContact')+' <a href="mailto:contact@specialtycoffeekerala.com">contact@specialtycoffeekerala.com</a></div>'+
      '<button class="faq-cta" id="aboutFaqBtn" type="button">'+L('faqBtn')+'<span class="arw">→</span></button>'+
      '<div class="p-foot mono">'+L('aboutFoot')+'</div>';
    panel.scrollTop=0;
    const faqBtn=document.getElementById('aboutFaqBtn');
    if(faqBtn) faqBtn.addEventListener('click',function(){ renderFaq(); openPanel('faq'); });
    const addBtn=document.getElementById('aboutAddPlaceBtn');
    if(addBtn) addBtn.addEventListener('click',function(){ renderAddPlace(); openPanel('add'); });
    const remBtn=document.getElementById('aboutRemoveBtn');
    if(remBtn) remBtn.addEventListener('click',function(){ renderRemove(); openPanel('remove'); });
  }
  function renderAddPlace(){
    panelBody.innerHTML='<div class="p-kicker mono">'+L('contributeKicker')+'</div><h2 class="p-title">'+L('addPlaceTitle')+'</h2>'+
      '<div class="p-sub mono" id="apSub">'+L('addPlaceSub')+'</div>'+
      '<form id="addPlaceForm" class="add-form" novalidate>'+
        '<label class="af-label mono" for="ap-name">'+L('lblName')+'</label>'+
        '<input class="af-input" id="ap-name" name="place_name" type="text" required />'+
        '<label class="af-label mono" for="ap-category">'+L('lblCategory')+'</label>'+
        '<select class="af-input" id="ap-category" name="category" required>'+
          '<option value="buyroasted">'+L('optBuyRoasted')+'</option>'+
          '<option value="cafe">'+L('optCafe')+'</option><option value="roaster">'+L('optRoaster')+'</option>'+
          '<option value="farm">'+L('optFarm')+'</option><option value="education">'+L('optEducation')+'</option>'+
          '<option value="equipment">'+L('optEquipment')+'</option>'+
          '<option value="barista">'+L('optBarista')+'</option></select>'+
        '<label class="af-label mono" for="ap-city">'+L('lblCity')+'</label>'+
        '<input class="af-input" id="ap-city" name="city" type="text" required />'+
        '<label class="af-label mono" for="ap-district">'+L('lblDistrict')+'</label>'+
        '<input class="af-input" id="ap-district" name="district" type="text" required />'+
        '<label class="af-label mono" id="lab-addr" for="ap-addr">'+L('lblAddr')+'</label>'+
        '<input class="af-input" id="ap-addr" name="address_or_maps_link" type="text" required />'+
        '<label class="af-label mono" id="lab-web" for="ap-web">'+L('lblWeb')+'</label>'+
        '<input class="af-input" id="ap-web" name="website" type="url" />'+
        '<label class="af-label mono" for="ap-ig">'+L('lblIg')+'</label>'+
        '<input class="af-input" id="ap-ig" name="instagram" type="text" />'+
        '<label class="af-label mono" id="lab-desc" for="ap-desc">'+L('lblDesc')+'</label>'+
        '<textarea class="af-input af-textarea" id="ap-desc" name="description" rows="3"></textarea>'+
        '<label class="af-label mono" id="lab-email" for="ap-email">'+L('lblEmail')+'</label>'+
        '<input class="af-input" id="ap-email" name="submitter_email" type="email" required />'+
        '<label class="af-label mono" for="ap-phone">'+L('lblPhone')+'</label>'+
        '<input class="af-input" id="ap-phone" name="phone" type="tel" />'+
        '<button class="af-submit" type="submit">'+L('submitBtn')+'</button>'+
        '<div class="msg mono" id="apMsg" role="status"></div>'+
      '</form>'+
      '<div class="p-foot mono">'+L('addPlaceFoot')+'</div>';
    panel.scrollTop=0;
    wireAddPlaceForm();
    applyCategoryMode();
  }
  /* Swap the form's wording when the category is a person rather than a
     venue. Address stops being required here on purpose: demanding a street
     address for an individual is a privacy problem, so it softens to a
     neighbourhood and the email note makes clear it is not published. */
  function isBaristaCat(){
    const sel=document.getElementById('ap-category');
    return !!sel && sel.value==='barista';
  }
  function applyCategoryMode(){
    const bar=isBaristaCat();
    const sub=document.getElementById('apSub');
    const lAddr=document.getElementById('lab-addr'), lWeb=document.getElementById('lab-web');
    const lDesc=document.getElementById('lab-desc'), lEmail=document.getElementById('lab-email');
    const iAddr=document.getElementById('ap-addr');
    if(sub) sub.textContent = bar ? L('barSub') : L('addPlaceSub');
    if(lAddr) lAddr.textContent = bar ? L('barLblAddr') : L('lblAddr');
    if(lWeb) lWeb.textContent = bar ? L('barLblWeb') : L('lblWeb');
    if(lDesc) lDesc.textContent = bar ? L('barLblDesc') : L('lblDesc');
    if(lEmail) lEmail.textContent = bar ? L('barLblEmail') : L('lblEmail');
    if(iAddr){ if(bar) iAddr.removeAttribute('required'); else iAddr.setAttribute('required',''); }
  }
  /* ---------- removal request ----------
     A listed person or business asks to be taken off the map. This is a
     request, not an instant self-service delete: without verifying who is
     asking, anyone could remove anyone else's listing. Vajid confirms the
     email matches the original submission, then deletes by hand. */
  function renderRemove(){
    panelBody.innerHTML='<div class="p-kicker mono">'+L('contributeKicker')+'</div><h2 class="p-title">'+L('removeTitle')+'</h2>'+
      '<div class="p-sub mono">'+L('removeSub')+'</div>'+
      '<form id="removeForm" class="add-form" novalidate>'+
        '<label class="af-label mono" for="rm-name">'+L('lblRmName')+'</label>'+
        '<input class="af-input" id="rm-name" name="listing_name" type="text" required />'+
        '<label class="af-label mono" for="rm-district">'+L('lblDistrict')+'</label>'+
        '<input class="af-input" id="rm-district" name="district" type="text" required />'+
        '<label class="af-label mono" for="rm-email">'+L('lblRmEmail')+'</label>'+
        '<input class="af-input" id="rm-email" name="submitter_email" type="email" required />'+
        '<label class="af-label mono" for="rm-note">'+L('lblRmNote')+'</label>'+
        '<textarea class="af-input af-textarea" id="rm-note" name="note" rows="3"></textarea>'+
        '<button class="af-submit" type="submit">'+L('removeBtn')+'</button>'+
        '<div class="msg mono" id="rmMsg" role="status"></div>'+
      '</form>'+
      '<div class="p-foot mono">'+L('removeFoot')+'</div>';
    panel.scrollTop=0;
    wireRemoveForm();
  }
  function wireRemoveForm(){
    const form=document.getElementById('removeForm');
    if(!form) return;
    const msg=document.getElementById('rmMsg');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.checkValidity()){msg.className='msg mono err';msg.textContent=L('invalid');form.querySelector(':invalid').focus();return;}
      const btn=form.querySelector('.af-submit');
      const payload={
        place_name:form.listing_name.value.trim(),
        category:'removal_request',
        district:form.district.value.trim(),
        description:form.note.value.trim()||null,
        submitter_email:form.submitter_email.value.trim()
      };
      if(!payload.place_name||!payload.district||!payload.submitter_email){
        msg.className='msg mono err'; msg.textContent=L('rmRequiredMsg'); return;
      }
      btn.disabled=true; btn.style.opacity='.5';
      msg.className='msg mono'; msg.textContent=L('sending');
      fetch(SUPABASE_URL+'/rest/v1/submissions',{
        method:'POST',
        headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY,
                 'Content-Type':'application/json','Prefer':'return=minimal'},
        body:JSON.stringify(payload)
      }).then(function(res){
        if(res.ok){
          msg.className='msg mono ok'; msg.textContent=L('rmOkMsg'); form.reset(); applyCategoryMode();
        }else{
          msg.className='msg mono err'; msg.textContent=L('sendErr');
        }
      }).catch(function(){
        msg.className='msg mono err'; msg.textContent=L('connErr');
      }).finally(function(){ btn.disabled=false; btn.style.opacity=''; });
    });
  }
  function wireAddPlaceForm(){
    const form=document.getElementById('addPlaceForm');
    if(!form) return;
    const msg=document.getElementById('apMsg');
    const catSel=document.getElementById('ap-category');
    if(catSel) catSel.addEventListener('change',applyCategoryMode);
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.checkValidity()){msg.className='msg mono err';msg.textContent=L('invalid');form.querySelector(':invalid').focus();return;}
      const btn=form.querySelector('.af-submit');
      const payload={
        place_name:form.place_name.value.trim(),
        category:form.category.value,
        city:form.city.value.trim()||null,
        district:form.district.value.trim()||null,
        address_or_maps_link:form.address_or_maps_link.value.trim()||null,
        website:form.website.value.trim()||null,
        instagram:form.instagram.value.trim()||null,
        description:form.description.value.trim()||null,
        submitter_email:form.submitter_email.value.trim(),
        phone:form.phone.value.trim()||null
      };
      const bar=payload.category==='barista';
      if(!payload.place_name||!payload.city||!payload.district||!payload.submitter_email||
         (!bar&&!payload.address_or_maps_link)){
        msg.className='msg mono err';
        msg.textContent=bar?L('barRequiredMsg'):L('requiredMsg'); return;
      }
      btn.disabled=true; btn.style.opacity='.5';
      msg.className='msg mono'; msg.textContent=L('sending');
      /* Notify the site owner by email — fire-and-forget, never blocks the
         Supabase save and never surfaces an error to the visitor even if
         the Formspree endpoint is misconfigured or unreachable. */
      if(SUBMISSION_NOTIFY_ENDPOINT.indexOf('YOUR_FORM_ID_HERE')===-1){
        const notifyBody=new FormData();
        notifyBody.append('_subject','New place submitted — '+payload.place_name);
        Object.keys(payload).forEach(function(k){ notifyBody.append(k, payload[k]==null?'':payload[k]); });
        fetch(SUBMISSION_NOTIFY_ENDPOINT,{method:'POST',headers:{'Accept':'application/json'},body:notifyBody}).catch(function(){});
      }
      fetch(SUPABASE_URL+'/rest/v1/submissions',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'apikey':SUPABASE_ANON_KEY,
          'Authorization':'Bearer '+SUPABASE_ANON_KEY,
          'Prefer':'return=minimal'
        },
        body:JSON.stringify(payload)
      }).then(function(res){
        if(res.ok){
          msg.className='msg mono ok'; msg.textContent=L('addOkMsg');
          form.reset(); applyCategoryMode();
        }else{
          msg.className='msg mono err'; msg.textContent=L('sendErr');
        }
      }).catch(function(){
        msg.className='msg mono err'; msg.textContent=L('connErr');
      }).finally(function(){ btn.disabled=false; btn.style.opacity=''; });
    });
  }
  function wireRows(){
    panelBody.querySelectorAll('.row-head').forEach(function(btn){
      btn.addEventListener('click',function(){
        const row=btn.parentElement, open=row.classList.toggle('open');
        btn.setAttribute('aria-expanded',open?'true':'false');
        row.querySelector('.row-body').hidden=!open;
      });
    });
  }
  let panelMode=null;
  /* Views reached from About (FAQ, Add a Place, Remove a Listing) are one step
     deeper, so closing them should walk back to About rather than dumping the
     visitor onto the map. Everything else still closes straight out. */
  const PANEL_PARENT={faq:'about', add:'about', remove:'about', addevent:'events'};
  let returnFocus=null;
  function openPanel(m){
    if(!panelMode) returnFocus=document.activeElement;
    panelMode=m;
    if(m!=='district'){
      const hash=m==='add'?'#add-place':m==='addevent'?'#submit-event':'';
      document.getElementById('navLang').href=(LANG==='ml'?'/':'/ml/')+hash;
      history.replaceState(null,'',location.pathname+location.search+hash);
    }
    document.body.classList.add('panel-open'); panel.inert=false;
    panel.setAttribute('aria-hidden','false');
    const old=document.getElementById('panelBack'); if(old) old.remove();
    if(PANEL_PARENT[m]){
      const back=document.createElement('button');back.id='panelBack';back.className='panel-back';
      back.textContent='← '+L('back');
      back.addEventListener('click',function(){
        if(PANEL_PARENT[m]==='events'){renderEvents();openPanel('events');}
        else{renderAbout();openPanel('about');}
      });panelBody.prepend(back);
    }
    document.getElementById('panelClose').focus({preventScroll:true});
  }
  function closeAllPanels(){
    document.getElementById('navLang').href=LANG==='ml'?'/':'/ml/';
    if(location.hash==='#submit-event'||location.hash==='#add-place')history.replaceState(null,'',location.pathname+location.search);
    panelMode=null;document.body.classList.remove('panel-open');panel.inert=true;
    panel.setAttribute('aria-hidden','true');
    if(mapReady) selectDistrict(-1,true);
    if(returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});
    returnFocus=null;
  }
  function closePanel(){closeAllPanels();}
  document.getElementById('panelClose').addEventListener('click',closePanel);
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape') return;
    closePanel(); hideCard();
  });
  document.getElementById('navEvents').addEventListener('click',function(){ if(mapReady) selectDistrict(-1,true); renderEvents(); openPanel('events'); });
  document.getElementById('navAbout').addEventListener('click',function(){ if(mapReady) selectDistrict(-1,true); renderAbout(); openPanel('about'); });

  function applyLang(){
    document.getElementById('panel').setAttribute('aria-label',L('details'));
    document.getElementById('panelClose').setAttribute('aria-label',L('close'));
  }
  function hideCard(){}
  applyLang();
  if(location.hash==='#submit-event'){renderAddEvent();openPanel('addevent');}
  else if(location.hash==='#add-place'){renderAddPlace();openPanel('add');}

  /* ==========================================================================
     3D map — fourteen separate district objects
     ========================================================================== */
  if(typeof THREE==='undefined'||typeof IDX==='undefined'){ document.getElementById('fallback').style.display='grid'; return; }
  let renderer;
  try{ renderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); }
  catch(err){ document.getElementById('fallback').style.display='grid'; return; }

  const PAPER=0xffffff;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<860?1.5:2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(PAPER,1);
  if(THREE.sRGBEncoding) renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.NoToneMapping;
  document.body.appendChild(renderer.domElement);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,window.innerWidth/window.innerHeight,0.1,200);
  camera.position.set(0,0,14);

  function envTexture(){
    const c=document.createElement('canvas'); c.width=256; c.height=128;
    const g=c.getContext('2d');
    const grad=g.createLinearGradient(0,0,0,128);
    grad.addColorStop(0.00,'#ffffff'); grad.addColorStop(0.45,'#e9f2e8');
    grad.addColorStop(0.55,'#c8dcc9'); grad.addColorStop(0.80,'#5c7a60');
    grad.addColorStop(1.00,'#243a28');
    g.fillStyle=grad; g.fillRect(0,0,256,128);
    const t=new THREE.CanvasTexture(c); t.mapping=THREE.EquirectangularReflectionMapping; return t;
  }
  const pmrem=new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment=pmrem.fromEquirectangular(envTexture()).texture;

  /* Lighting sums to about 1.0 on an upward-facing top face. Above that the pale
     overview palette clips to white and the whole state renders as blank paper. */
  scene.add(new THREE.AmbientLight(0xffffff,0.34));
  const key=new THREE.DirectionalLight(0xffffff,0.62); key.position.set(-5,7,9); scene.add(key);
  const fill=new THREE.DirectionalLight(0xd8ffe6,0.25); fill.position.set(7,-5,4); scene.add(fill);

  /* grid backdrop */
  const gridGeo=new THREE.PlaneGeometry(60,40,90,60);
  (function(){const p=gridGeo.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i); p.setZ(i,0.012*(x*x+y*y));}
    p.needsUpdate=true;})();
  const gridMat=new THREE.ShaderMaterial({
    uniforms:{uScale:{value:new THREE.Vector2(92,62)},uLine:{value:new THREE.Color(0x00a83f)},
              uBg:{value:new THREE.Color(PAPER)},uDim:{value:1.0},uFreq:{value:1.0}},
    extensions:{derivatives:true},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:['varying vec2 vUv;uniform vec2 uScale;uniform vec3 uLine;uniform vec3 uBg;uniform float uDim;uniform float uFreq;',
      'float ghash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
      'float vnoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);',
      'float a=ghash(i),b=ghash(i+vec2(1.0,0.0)),c=ghash(i+vec2(0.0,1.0)),d=ghash(i+vec2(1.0,1.0));',
      'vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);',
      'return (a+(b-a)*u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}',
      'float fbm(vec2 p){float v=0.0;float amp=0.62;',
      'for(int i=0;i<3;i++){v+=amp*vnoise(p);p*=2.0;amp*=0.42;}return v;}',
      'void main(){vec2 p=vUv*uScale*0.045*uFreq;',
      'float h=fbm(p);',
      'float v=h*18.0;float f=fract(v);float dd=min(f,1.0-f);float w=fwidth(v);',
      'float l=1.0-smoothstep(0.0,w*1.4,dd);float r=length((vUv-0.5)*vec2(1.6,1.0));',
      'float fade=smoothstep(0.06,0.30,r)*(1.0-smoothstep(0.60,0.92,r)*0.55);',
      'gl_FragColor=vec4(mix(uBg,uLine,l*0.55*fade*uDim),1.0);}'].join('\n')
  });
  const grid=new THREE.Mesh(gridGeo,gridMat); grid.position.z=-9; scene.add(grid);

  /* ---------- build fourteen district objects ---------- */
  const N=IDX.length;
  const latSpan=G.rows*G.cell, S=6.6/latSpan;
  const cx=G.minLng+G.cols*G.cell/2, cy=G.minLat+latSpan/2;
  const size=G.cell*S, MAXE=2695;

  // terrain ramp: coastal green -> gold -> brown -> pale summit
  const STOPS=[[0.00,0x7cc98c],[0.13,0x59bb70],[0.30,0xb6c765],[0.48,0xd8a74c],
               [0.66,0xb06a35],[0.83,0x7d472a],[1.00,0xefe4cf]];
  // hover ramp: a light tint of the brand green, elevation as lightness
  const GSTOPS=[[0.00,0xb7e3c4],[0.45,0x8ed4a6],[1.00,0x6ac48a]];
  // zoomed-out tone: light white coast -> light green midland -> brown Ghats
  const OVERSTOPS=[[0.00,0xdff2d4],[0.15,0xcfeabf],[0.32,0xb7e0a3],[0.50,0xa0d788],
                   [0.62,0xb9cc7a],[0.80,0xc99a5b],[1.00,0xb06a35]];
  const tA=new THREE.Color(), tB=new THREE.Color(), col=new THREE.Color();
  function ramp(stops,t,out){
    t=Math.max(0,Math.min(1,t));
    for(let i=1;i<stops.length;i++){
      if(t<=stops[i][0]){
        const a=stops[i-1],b=stops[i],k=(t-a[0])/(b[0]-a[0]);
        tA.setHex(a[1]).convertSRGBToLinear(); tB.setHex(b[1]).convertSRGBToLinear();
        return out.copy(tA).lerp(tB,k);
      }
    }
    return out.setHex(stops[stops.length-1][1]).convertSRGBToLinear();
  }

  const geo=new THREE.BoxGeometry(size*0.985,size*0.985,1);
  const baseMat=new THREE.MeshStandardMaterial({metalness:0.22,roughness:0.52,color:0xffffff,
                                                envMapIntensity:0.42,transparent:true,opacity:1});
  const dummy=new THREE.Object3D();

  const perD=[]; for(let d=0;d<14;d++) perD.push([]);
  for(let i=0;i<N;i++) perD[DST[i]].push(i);

  const mapGroup=new THREE.Group(); scene.add(mapGroup);
  const D=[];              // per-district record
  const meshes=[];

  for(let d=0;d<14;d++){
    const ids=perD[d], n=ids.length;
    let sx=0,sy=0,minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9,maxDepth=0;
    const px=new Float32Array(n),py=new Float32Array(n),dep=new Float32Array(n),tt=new Float32Array(n);
    for(let j=0;j<n;j++){
      const i=ids[j], id=IDX[i], c=id%G.cols, r=(id-c)/G.cols;
      const lng=G.minLng+(c+0.5)*G.cell, lat=G.minLat+(r+0.5)*G.cell;
      const t=ELV[i]/MAXE;
      px[j]=(lng-cx)*S; py[j]=(lat-cy)*S; tt[j]=t;
      dep[j]=0.16+0.62*Math.pow(t,0.62);
      if(dep[j]>maxDepth) maxDepth=dep[j];
      sx+=px[j]; sy+=py[j];
      if(px[j]<minx)minx=px[j]; if(px[j]>maxx)maxx=px[j];
      if(py[j]<miny)miny=py[j]; if(py[j]>maxy)maxy=py[j];
    }
    const cX=sx/n, cY=sy/n;
    const mesh=new THREE.InstancedMesh(geo,baseMat.clone(),n);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const base=new Float32Array(n*3);
    for(let j=0;j<n;j++){
      dummy.position.set(px[j]-cX,py[j]-cY,dep[j]/2);
      dummy.scale.set(1,1,dep[j]); dummy.updateMatrix();
      mesh.setMatrixAt(j,dummy.matrix);
      ramp(OVERSTOPS,Math.pow(tt[j],0.78),col);
      base[j*3]=col.r; base[j*3+1]=col.g; base[j*3+2]=col.b;
      mesh.setColorAt(j,col);
    }
    mesh.instanceColor.needsUpdate=true;
    mesh.userData.d=d;
    const g=new THREE.Group();
    g.position.set(cX,cY,0); g.add(mesh); mapGroup.add(g);
    meshes.push(mesh);
    D.push({g:g,mesh:mesh,base:base,t:tt,home:new THREE.Vector3(cX,cY,0),
            w:(maxx-minx)+size,h:(maxy-miny)+size,
            pos:new THREE.Vector3(cX,cY,0),scale:1,op:1,
            tPos:new THREE.Vector3(cX,cY,0),tScale:1,tOp:1});
  }

  /* ---------- fine detail: 1.1 km cells, built the first time a district opens ---------- */
  function buildFine(d){
    const rec=D[d];
    if(rec.fine!==undefined) return rec.fine;
    if(typeof FINE==='undefined'||!FINE[NAMES[d]]){ rec.fine=null; return null; }
    const F=FINE[NAMES[d]], bin=atob(F.d), len=bin.length;
    let cnt=0;
    for(let i=0;i<len;i++) if(bin.charCodeAt(i)) cnt++;
    const fs=FINE_CELL*S;
    const fgeo=new THREE.BoxGeometry(fs*0.985,fs*0.985,1);
    const m=new THREE.InstancedMesh(fgeo,baseMat.clone(),cnt);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Fine terrain opens at its final colour; no per-cell colour animation.
    let j=0;
    for(let r=0;r<F.h;r++){
      for(let c=0;c<F.w;c++){
        const v=bin.charCodeAt(r*F.w+c);
        if(!v) continue;
        const t=((v-1)*11)/MAXE;
        const lng=F.x0+(c+0.5)*FINE_CELL, lat=F.y0+(r+0.5)*FINE_CELL;
        const dep=0.16+0.62*Math.pow(t,0.62);
        dummy.position.set((lng-cx)*S-rec.home.x,(lat-cy)*S-rec.home.y,dep/2);
        dummy.scale.set(1,1,dep); dummy.updateMatrix();
        m.setMatrixAt(j,dummy.matrix);
        ramp(STOPS,Math.pow(t,0.78),col);
        m.setColorAt(j,col);
        j++;
      }
    }
    m.instanceColor.needsUpdate=true;
    m.userData.d=d; m.visible=false;
    rec.g.add(m); rec.fine=m;
    return m;
  }
  function setDetail(d,on){
    const rec=D[d];
    if(on){
      const f=buildFine(d);
      if(f){ f.visible=true; rec.mesh.visible=false; rec.act=f; return; }
    }
    if(rec.fine) rec.fine.visible=false;
    rec.mesh.visible=true; rec.act=rec.mesh;
  }

  /* ---------- colour states ---------- */
  function paint(d,mode){
    const rec=D[d], m=rec.mesh, n=rec.t.length;
    for(let j=0;j<n;j++){
      if(mode==='green') ramp(GSTOPS,Math.pow(rec.t[j],0.62),col);
      else col.setRGB(rec.base[j*3],rec.base[j*3+1],rec.base[j*3+2]);
      m.setColorAt(j,col);
    }
    m.instanceColor.needsUpdate=true;
  }

  /* ---------- selection & hover ---------- */
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const districtDuration=reduce?0:280;
  let transitionStarted=0, detailRequest=0, detailTimer;
  let selected=-1, hovered=-1, spinY=0, userY=0, userX=0;
  const hoverEl=document.getElementById('hoverName');

  function setHover(d){
    if(d===hovered) return;
    if(hovered>=0 && hovered!==selected) paint(hovered,'base');
    hovered=d;
    if(d>=0 && selected<0){
      paint(d,'green');
      const er=(typeof ERANGE!=='undefined'&&ERANGE[NAMES[d]])?ERANGE[NAMES[d]]:null;
      hoverEl.innerHTML=esc(districtName(NAMES[d]))+(er?'<small>'+nf(er[0])+'-'+nf(er[1])+' '+L('unit')+'</small>':'');
      hoverEl.classList.add('on');
    }else hoverEl.classList.remove('on');
  }

  function mobileMapSpace(){
    const top=document.querySelector('.top').getBoundingClientRect().bottom;
    const bottom=document.getElementById('panel').getBoundingClientRect().top;
    return {height:Math.max(48,bottom-top-24),center:(top+bottom)/2};
  }
  function fitScaleFor(d){
    const vs=viewSize(), rec=D[d];
    const availH=isNarrow?vs.h*mobileMapSpace().height/H:vs.h*0.62, availW=isNarrow?vs.w*0.80:vs.w*0.42;
    const k=Math.min(availH/rec.h, availW/rec.w)*0.92;
    // Account for the terrain depth and its forward position in perspective.
    // Otherwise highland districts overshoot the available space when enlarged.
    return k*(camera.position.z-1.4)/(camera.position.z+k*0.9)/mapFit();
  }

  let detailPromise;
  function loadDetail(){
    if(typeof FINE!=='undefined')return Promise.resolve();
    if(!detailPromise)detailPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='/assets/terrain-detail.js?v=35996e12ab51';
      script.onload=resolve;
      script.onerror=()=>{detailPromise=null;script.remove();reject(new Error('Detail terrain unavailable'));};
      document.head.appendChild(script);
    });
    return detailPromise;
  }
  function selectDistrict(i,silent){
    if(i===selected&&!silent) return;
    if(selected>=0) paint(selected,'base');
    selected=i;
    const request=++detailRequest;
    clearTimeout(detailTimer);
    userY=0; userX=0; spinY=0;
    for(let d=0;d<14;d++) if(d!==i) setDetail(d,false);
    if(i>=0){
      hoverEl.classList.remove('on');
      if(hovered>=0) paint(hovered,'base');
      hovered=-1;
      paint(i,'base');
      renderDistrict(i); openPanel('district'); hideCard();
    }
    document.getElementById('navLang').href=(LANG==='ml'?'/':'/ml/')+(i>=0?'#map-'+NAMES[i].toLowerCase():'');
    if(i>=0)history.replaceState(null,'','#map-'+NAMES[i].toLowerCase());
    else if(location.hash.startsWith('#map-'))history.replaceState(null,'',location.pathname);
    updateChips();
    updateTargets();
    if(i>=0){
      if(D[i].fine) setDetail(i,true);
      else loadDetail().then(()=>{
        if(request!==detailRequest) return;
        // Show the panel and finish moving before building the detailed mesh.
        detailTimer=setTimeout(()=>{
          if(request===detailRequest&&selected===i) setDetail(i,true);
        },Math.max(0,transitionStarted+districtDuration-performance.now()));
      }).catch(()=>{/* Overview terrain remains fully usable. */});
    }
  }

  /* ---------- district chips (mobile) ---------- */
  const chipsEl=document.getElementById('districtChips');
  function entryCount(name){
    const r=DATA[name]; if(!r) return 0;
    return (r.buyroasted||[]).length+(r.cafes||[]).length+(r.roasters||[]).length+(r.farms||[]).length+(r.education||[]).length+(r.baristas||[]).length+(r.equipment||[]).length;
  }
  function buildChips(){
    const order=NAMES.map(function(n,i){ return {n:n,i:i,c:entryCount(n)}; });
    order.sort(function(a,b){ return (b.c-a.c)||a.n.localeCompare(b.n); });
    chipsEl.innerHTML='';
    order.forEach(function(o){
      const b=document.createElement('button');
      b.type='button';
      b.innerHTML=o.c>0?(districtName(o.n)+'<small>'+o.c+'</small>'):districtName(o.n);
      b.setAttribute('data-d',o.i);
      b.setAttribute('aria-label',districtName(o.n));
      b.addEventListener('click',function(){ selectDistrict(o.i); });
      chipsEl.appendChild(b);
    });
  }
  function updateChips(){
    const btns=chipsEl.children;
    for(let k=0;k<btns.length;k++){
      const active=+btns[k].getAttribute('data-d')===selected;
      btns[k].classList.toggle('on',active);btns[k].setAttribute('aria-pressed',String(active));
    }
  }
  buildChips();

  function updateTargets(){
    transitionStarted=performance.now();
    const vs=viewSize();
    for(let d=0;d<14;d++){
      const rec=D[d];
      rec.fromPos=rec.pos.clone(); rec.fromScale=rec.scale; rec.fromOp=rec.op;
      if(selected<0){
        rec.tPos.copy(rec.home); rec.tScale=1; rec.tOp=1;
      }else if(d===selected){
        const k=fitScaleFor(d), f=mapFit();
        const wx=isNarrow?0:-vs.w*0.17, wy=isNarrow?vs.h*(0.5-mobileMapSpace().center/H):0, wz=1.4;
        rec.tPos.set(wx/f,wy/f,wz/f); rec.tScale=k; rec.tOp=1;
      }else{
        rec.tPos.set(rec.home.x*1.15,rec.home.y*1.15,-4.5);
        rec.tScale=1; rec.tOp=0;
      }
    }
  }

  /* ---------- pointer ---------- */
  const ray=new THREE.Raycaster(), ptr=new THREE.Vector2(), mouse={x:0,y:0};
  function hitDistrict(x,y){
    ptr.x=(x/window.innerWidth)*2-1; ptr.y=-(y/window.innerHeight)*2+1;
    ray.setFromCamera(ptr,camera);
    const list=selected>=0?[D[selected].act||D[selected].mesh]:meshes;
    const h=ray.intersectObjects(list,false)[0];
    return (h&&h.object)?h.object.userData.d:-1;
  }
  let dragging=false,moved=0,px0=0,py0=0,velX=0,velY=0,rotX=0,rotY=0,idle=0;
  let autoGlow=-1, glowTimer=0;
  const el=renderer.domElement;
  el.addEventListener('pointerdown',function(e){ dragging=true;moved=0;px0=e.clientX;py0=e.clientY;idle=0;
    el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove',function(e){
    if(dragging){
      const dx=e.clientX-px0,dy=e.clientY-py0;
      moved+=Math.abs(dx)+Math.abs(dy);
      if(selected>=0){ userY+=dx*0.005; userX+=dy*0.004; }
      else { velY+=dx*0.0026; velX+=dy*0.0022; }
      px0=e.clientX; py0=e.clientY; idle=0;
    }else if(e.pointerType==='mouse'&&selected<0){ setHover(hitDistrict(e.clientX,e.clientY)); }
    mouse.x=(e.clientX/window.innerWidth-0.5); mouse.y=(e.clientY/window.innerHeight-0.5);
  });
  el.addEventListener('pointerup',function(e){
    if(dragging&&moved<7){
      const d=hitDistrict(e.clientX,e.clientY);
      if(d>=0&&selected<0) selectDistrict(d);
      else if(selected>=0||panelMode) closeAllPanels();
    }
    dragging=false;
    if(e.pointerId!=null&&el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  });
  el.addEventListener('pointercancel',function(){ dragging=false; });
  el.addEventListener('pointerleave',function(){ if(selected<0) setHover(-1); });

  /* ---------- resize / loop ---------- */
  let W=0,H=0,isNarrow=false;
  function resize(){
    W=window.innerWidth;H=window.innerHeight;isNarrow=W<=860;
    camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H);
    gridMat.uniforms.uFreq.value=isNarrow?2.2:1.0;
    updateTargets();
  }
  function viewSize(){ const h=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z; return {h:h,w:h*camera.aspect}; }
  function mapFit(){ const fit=Math.min(1,(W/H)/0.78);return isNarrow?Math.min(fit,Math.max(.25,(H-360)/H)*1.05):fit; }
  window.addEventListener('resize',resize); resize();

  let t=0;
  let lastFrame=0, frameId;
  function frame(now=performance.now()){
    if(document.hidden){frameId=null;return;}
    frameId=requestAnimationFrame(frame);
    const progress=districtDuration?Math.min(1,Math.max(0,(now-transitionStarted)/districtDuration)):1;
    if(progress===1&&now-lastFrame<1000/30)return;
    const dt=Math.min(50,now-lastFrame||1000/30), step=dt/(1000/30);
    lastFrame=now;
    const ease=1-Math.pow(1-progress,3);
    t+=0.006*step; idle+=step;
    const open=selected>=0;

    /* whole-map rotation: idle drift when nothing is picked, levelled when one is */
    if(open){ const level=reduce?0:Math.exp(-dt/60); rotY*=level; rotX*=level; velX=velY=0; }
    else{
      rotY+=velY; rotX+=velX; velY*=0.90; velX*=0.90;
      rotX=Math.max(-0.6,Math.min(0.6,rotX));
      if(!dragging&&idle>90&&!reduce){
        rotY+=(Math.sin(t)*0.22-rotY)*0.012;
        rotX+=(Math.sin(t*0.7)*0.08-rotX)*0.012;
      }
    }
    mapGroup.rotation.y=rotY; mapGroup.rotation.x=rotX;

    /* idle glow loop: when nothing is touched, hovered, or open, sweep the
       hover glow through the districts north to south, same paint as hover */
    if(!open && !panelMode && !dragging && hovered<0 && idle>200 && !reduce){
      glowTimer++;
      if(autoGlow<0){ autoGlow=0; glowTimer=0; paint(autoGlow,'green'); }
      else if(glowTimer>80){
        paint(autoGlow,'base');
        autoGlow=(autoGlow+1)%14;
        paint(autoGlow,'green');
        glowTimer=0;
      }
    }else if(autoGlow>=0){
      if(autoGlow!==hovered && autoGlow!==selected) paint(autoGlow,'base');
      autoGlow=-1; glowTimer=0;
    }

    const par=(open||reduce)?0:1;
    mapGroup.position.x=mouse.x*0.3*par;
    mapGroup.position.y=(isNarrow&&!open?viewSize().h*70/H:0)-mouse.y*0.22*par;
    mapGroup.scale.setScalar(mapFit());
    grid.position.x=-mouse.x*0.9*par; grid.position.y=mouse.y*0.6*par;
    gridMat.uniforms.uDim.value+=((open?0.45:1.0)-gridMat.uniforms.uDim.value)*(reduce?1:1-Math.exp(-dt/65));

    /* per-district transitions */
    for(let d=0;d<14;d++){
      const rec=D[d];
      rec.pos.lerpVectors(rec.fromPos,rec.tPos,ease);
      rec.scale=rec.fromScale+(rec.tScale-rec.fromScale)*ease;
      rec.op=rec.fromOp+(rec.tOp-rec.fromOp)*ease;
      rec.g.position.copy(rec.pos);
      rec.g.scale.setScalar(rec.scale);
      rec.mesh.material.opacity=rec.op;
      rec.mesh.material.depthWrite=rec.op>0.9;
      if(rec.fine){
        rec.fine.material.opacity=rec.op; rec.fine.material.depthWrite=rec.op>0.9;
      }
      rec.g.visible=rec.op>0.02;
      if(d===selected){
        spinY+=(reduce?0:0.0035*step);
        rec.g.rotation.y=Math.sin(spinY)*0.62+userY;
        rec.g.rotation.x=0.22+(reduce?0:Math.sin(spinY*0.7)*0.06)+userX;
      }else if(rec.g.rotation.y!==0||rec.g.rotation.x!==0){
        const settle=reduce?0:Math.exp(-dt/60);
        rec.g.rotation.y*=settle; rec.g.rotation.x*=settle;
        if(Math.abs(rec.g.rotation.y)<0.001) rec.g.rotation.y=0;
        if(Math.abs(rec.g.rotation.x)<0.001) rec.g.rotation.x=0;
      }
    }
    userY*=0.985; userX*=0.985;
    renderer.render(scene,camera);
  }
  document.addEventListener('visibilitychange',function(){
    if(!document.hidden&&!frameId){lastFrame=0;frameId=requestAnimationFrame(frame);}
  });
  mapReady=true;
  applyLang();
  const initialHash=location.hash.slice(1);
  if(initialHash.startsWith('map-')){
    const index=NAMES.findIndex(n=>n.toLowerCase()===initialHash.slice(4));
    if(index>=0)selectDistrict(index);
  }
  frame();
})();
