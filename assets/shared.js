/* Date-only event records use Kerala's calendar day, regardless of visitor timezone. */
(function(root){
  const todayIST=(now=new Date())=>{
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const get=t=>p.find(x=>x.type===t).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  };
  const upcoming=(events,now=new Date())=>events.filter(e=>(e.endDate||e.date)>=todayIST(now)).sort((a,b)=>a.date.localeCompare(b.date));
  const api={todayIST,upcoming};
  if(typeof module!=='undefined')module.exports=api;
  else root.KERALA_UTIL=api;
})(typeof window==='undefined'?{}:window);
