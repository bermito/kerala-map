/* Date-only event records use Kerala's calendar day, regardless of visitor timezone. */
(function(root){
  const todayIST=(now=new Date())=>{
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const get=t=>p.find(x=>x.type===t).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  };
  const upcoming=(events,now=new Date())=>events.filter(e=>e.status!=='completed'&&(e.endDate||e.date)>=todayIST(now)).sort((a,b)=>a.date.localeCompare(b.date));
  const eventTime=(event,lang='en')=>{
    if(!event.startTime)return '';
    const format=value=>{
      const [hour,minute]=value.split(':').map(Number);
      const clock=String(hour%12||12)+(minute?':'+String(minute).padStart(2,'0'):'');
      if(lang==='ml')return (hour===0?'അർധരാത്രി':hour<12?'രാവിലെ':hour<15?'ഉച്ചയ്ക്ക്':hour<19?'വൈകിട്ട്':'രാത്രി')+' '+clock;
      return clock+' '+(hour<12?'AM':'PM');
    };
    return format(event.startTime)+(event.endTime?(lang==='ml'?' മുതൽ ':'–')+format(event.endTime):'')+(lang==='ml'?(event.endTime?' വരെ':''):' IST');
  };
  const categoryKeys=['cafes','roasters','buyroasted','farms','education','baristas','equipment'];
  const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase().replace(/café/g,'cafe').replace(/\s+/g,' ').trim();
  const matches=(haystack,query)=>normalize(query).split(' ').filter(Boolean).every(term=>normalize(haystack).includes(term));
  const uniquePlaces=record=>[...new Map(categoryKeys.flatMap(k=>record[k]||[]).map(p=>[p.id||p.n,p])).values()];
  const api={todayIST,upcoming,eventTime,normalize,matches,uniquePlaces};
  if(typeof module!=='undefined')module.exports=api;
  else root.KERALA_UTIL=api;
})(typeof window==='undefined'?{}:window);
