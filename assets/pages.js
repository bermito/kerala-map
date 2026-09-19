(function(){
  const today=KERALA_UTIL.todayIST();
  document.querySelectorAll('[data-event-end]').forEach(el=>{el.hidden=el.dataset.eventEnd<today;});
  const empty=document.getElementById('eventsEmpty');
  if(empty)empty.hidden=!!document.querySelector('[data-event-end]:not([hidden])');
  const schema=document.getElementById('eventsSchema');
  if(schema){
    const events=JSON.parse(schema.textContent);
    schema.textContent=JSON.stringify(events.filter(e=>(e.endDate||e.startDate)>=today));
  }
})();
