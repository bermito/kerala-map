/* Old links remain useful; a normal visit always lands on the map. */
(function(){
  const h=location.hash.slice(1),root=document.documentElement.lang==='ml'?'/ml/':'/';
  const routes={guide:'blog/what-is-specialty-coffee/','guide-kerala':'blog/what-is-specialty-coffee/',directory:'directory/','events-list':'events/','guide-faq':'faq/'};
  if(routes[h])location.replace(root+routes[h]);
  else if(h.startsWith('district-'))location.replace(root+'directory/#'+h);
})();
