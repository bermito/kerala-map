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
  if(!input||!category)return;
  const rows=[...document.querySelectorAll('.directory-listing')];
  const sections=[...document.querySelectorAll('.district-section')];
  const normal=s=>String(s).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
  const search=()=>{
    const query=normal(input.value),kind=category.value;
    const filtering=!!(query||kind);
    let count=0;
    rows.forEach(row=>{
      row.hidden=!!((kind&&row.dataset.category!==kind)||(query&&!normal(row.dataset.search).includes(query)));
      if(!row.hidden)count++;
    });
    document.querySelectorAll('.directory-category').forEach(group=>{group.hidden=![...group.querySelectorAll('.directory-listing')].some(row=>!row.hidden);});
    sections.forEach(section=>{
      section.hidden=filtering&&![...section.querySelectorAll('.directory-listing')].some(row=>!row.hidden);
      const link=document.querySelector('.district-index a[href="#'+section.id+'"]');
      if(link)link.hidden=section.hidden;
    });
    const message=document.getElementById('directoryResult');
    if(message)message.textContent=ml?count+' ഇടങ്ങൾ':count+' '+(count===1?'place':'places')+(filtering?' found':' in the directory');
    document.getElementById('directoryEmpty').hidden=count!==0;
  };
  input.closest('form').addEventListener('submit',e=>e.preventDefault());
  input.addEventListener('input',search);
  category.addEventListener('change',search);
  search();
})();
