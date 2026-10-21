(function(){
  'use strict';
  const ml=document.documentElement.lang==='ml';
  const today=KERALA_UTIL.todayIST();
  const now=Date.now();
  document.querySelectorAll('[data-event-end]').forEach(el=>{el.hidden=el.dataset.eventEnd<today;});
  document.querySelectorAll('[data-past-event-end]').forEach(el=>{el.hidden=el.dataset.pastEventEnd>=today;});
  document.querySelectorAll('[data-registration-end]').forEach(el=>{el.hidden=Date.parse(el.dataset.registrationEnd)<now;});
  document.querySelectorAll('[data-registration-ended]').forEach(el=>{el.hidden=Date.parse(el.dataset.registrationEnded)>=now;});
  const empty=document.getElementById('eventsEmpty');
  if(empty)empty.hidden=!!document.querySelector('[data-event-end]:not([hidden])');
  const input=document.getElementById('directorySearch');
  const category=document.getElementById('directoryCategory');
  const district=document.getElementById('directoryDistrict');
  if(!input||!category||!district)return;
  const rows=[...document.querySelectorAll('.directory-listing')];
  const sections=[...document.querySelectorAll('.district-section')];
  const form=input.closest('form');
  const restore=()=>{
    const params=new URLSearchParams(location.search);
    input.value=params.get('q')||'';
    category.value=params.get('category')||'';
    district.value=params.get('district')||'';
  };
  const search=(persist=true)=>{
    const query=input.value.trim(),kind=category.value,region=district.value;
    const filtering=!!(query||kind||region);
    const visible=new Set();
    rows.forEach(row=>{
      row.hidden=!!((kind&&!row.dataset.category.split(' ').includes(kind))||(region&&row.dataset.district!==region)||!KERALA_UTIL.matches(row.dataset.search,query));
      if(!row.hidden)visible.add(row.dataset.placeId);
    });
    sections.forEach(section=>{
      const hasRows=!!section.querySelector('.directory-listing');
      const hasVisible=[...section.querySelectorAll('.directory-listing')].some(row=>!row.hidden);
      const emptyDistrictSelected=region===section.dataset.district&&!query&&!kind;
      section.hidden=filtering&&!hasVisible&&!(emptyDistrictSelected&&!hasRows);
      const chip=document.querySelector('.district-index a[href="#'+section.id+'"]');
      if(chip)chip.hidden=section.hidden;
    });
    const roasterGroup=document.getElementById('coffee-roasters');
    if(roasterGroup)roasterGroup.hidden=!rows.some(row=>!row.hidden&&row.dataset.category.split(' ').includes('roasters'));
    const roasterLink=document.querySelector('.district-index a[href="#coffee-roasters"]');
    if(roasterLink)roasterLink.hidden=!!roasterGroup?.hidden;
    const message=document.getElementById('directoryResult');
    const count=visible.size;
    if(message)message.textContent=ml?count+' വ്യത്യസ്ത ഇടങ്ങൾ':count+' unique '+(count===1?'place':'places')+(filtering?' found':' in the directory');
    const selectedEmpty=region&&sections.some(s=>s.dataset.district===region&&!s.querySelector('.directory-listing'))&&!query&&!kind;
    document.getElementById('directoryEmpty').hidden=count!==0||selectedEmpty;
    if(persist){
      const url=new URL(location.href);
      for(const [key,value] of [['q',query],['category',kind],['district',region]]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}
      history.replaceState(null,'',url);
    }
  };
  form.addEventListener('submit',e=>{e.preventDefault();search();});
  input.addEventListener('input',()=>search());category.addEventListener('change',()=>search());district.addEventListener('change',()=>search());
  form.addEventListener('reset',()=>{input.value='';category.value='';district.value='';search();});
  window.addEventListener('popstate',()=>{restore();search(false);});
  restore();search(false);
})();
