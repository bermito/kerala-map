/* Directory only: retain a browsable HTML listing without JavaScript. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const input = $('directorySearch'), category = $('directoryCategory'), district = $('directoryDistrict');
  const form = input.form, result = $('directoryResult'), empty = $('directoryEmpty');
  const jump = $('directoryJump'), index = jump.querySelector('nav'), group = $('coffee-roasters');
  const ml = document.documentElement.lang === 'ml';
  const languageLink = document.querySelector('.language-link');
  const otherLanguage = languageLink && new URL(languageLink.href);
  const rows = [...document.querySelectorAll('.directory-listing')];
  const sections = [...document.querySelectorAll('.district-section')].map(el => ({
    el, rows: [...el.querySelectorAll('.directory-listing')], link: index.querySelector('a[href="#'+el.id+'"]')
  }));
  const jumpLinks = [...index.querySelectorAll('a')];
  const roasterSections = sections.filter(s => group.contains(s.el));
  const fold = value => (value || '').normalize('NFKC').toLowerCase().replace(/café/g,'cafe')
    .replace(/[^\p{L}\p{M}\p{N}\s\u200c\u200d]+/gu,' ').replace(/\s+/g,' ').trim();
  const aliases = new Map();
  const localNames = {"Kasaragod":"കാസർഗോഡ്","Kannur":"കണ്ണൂർ","Wayanad":"വയനാട്","Kozhikode":"കോഴിക്കോട്","Malappuram":"മലപ്പുറം","Palakkad":"പാലക്കാട്","Thrissur":"തൃശ്ശൂർ","Ernakulam":"എറണാകുളം","Idukki":"ഇടുക്കി","Kottayam":"കോട്ടയം","Alappuzha":"ആലപ്പുഴ","Pathanamthitta":"പത്തനംതിട്ട","Kollam":"കൊല്ലം","Thiruvananthapuram":"തിരുവനന്തപുരം"};
  for (const [name,local] of Object.entries(localNames)){
    aliases.set(fold(name),name);
    aliases.set(fold(local),name);
  }
  for(const [alias,name] of [['calicut','Kozhikode'],['കാലിക്കറ്റ്','Kozhikode'],['trivandrum','Thiruvananthapuram'],['ട്രിവാൻഡ്രം','Thiruvananthapuram'],['cochin','Ernakulam'],['kochi','Ernakulam'],['കൊച്ചി','Ernakulam']])aliases.set(fold(alias),name);
  const keywords = new Map(rows.map(row => [row, fold(row.dataset.search)]));
  const setParams = (url,q,kind,region) => {
    for (const [key,value] of [['q',q],['category',kind],['district',region]]) {
      if (value) url.searchParams.set(key,value);
      else url.searchParams.delete(key);
    }
  };
  const restore = () => {
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    category.value = params.get('category') || '';
    if (category.selectedIndex < 0) category.selectedIndex = 0;
    district.value = aliases.get(fold(params.get('district'))) || '';
  };
  const apply = (persist = true) => {
    const q = input.value.trim(), kind = category.value, region = district.value;
    const active = Boolean(q || kind || region);
    const terms = fold(q).split(/\s+/u).filter(Boolean);
    const visible = new Set();
    for (const row of rows) {
      row.hidden = Boolean((kind && !row.dataset.category.split(' ').includes(kind)) ||
        (region && row.dataset.district !== region) ||
        !terms.every(term => keywords.get(row).includes(term) ||
          (row.dataset.district !== 'Ernakulam' && aliases.get(term) === row.dataset.district)));
      if (!row.hidden) visible.add(row.dataset.placeId);
    }
    let emptyDistrict = false;
    for (const s of sections) {
      const showEmpty = !s.rows.length && region === s.el.dataset.district && !kind && !q;
      if (showEmpty) emptyDistrict = true;
      s.el.hidden = active && !showEmpty && !s.rows.some(row => !row.hidden);
      if (s.link) s.link.hidden = s.el.hidden;
    }
    group.hidden = !roasterSections.some(s => !s.el.hidden);
    index.querySelector('a[href="#coffee-roasters"]').hidden = group.hidden;
    jump.hidden = !jumpLinks.some(a => !a.hidden);
    const count = visible.size;
    const filterLabels = [
      kind && category.selectedOptions[0].text,
      region && district.selectedOptions[0].text,
      q && '“' + q + '”'
    ].filter(Boolean);
    const countText = ml ? count + (count === 1 ? ' ഇടം' : ' ഇടങ്ങൾ') :
      count + (count === 1 ? ' place' : ' places');
    result.textContent = filterLabels.length ? countText + ' · ' + filterLabels.join(' · ') :
      (ml ? 'ആകെ ' + countText : countText + ' in the directory');
    empty.hidden = count !== 0 || emptyDistrict;
    const anchor = location.hash && document.getElementById(location.hash.slice(1));
    const visibleHash = anchor && !anchor.closest('[hidden]') ? location.hash : '';
    if (otherLanguage) {
      const url = new URL(otherLanguage);
      setParams(url,q,kind,region);
      languageLink.href = url.pathname + url.search + visibleHash;
    }
    if (persist) {
      const url = new URL(location.href);
      setParams(url,q,kind,region);
      url.hash = visibleHash;
      history.replaceState(history.state,'',url);
    }
  };
  form.addEventListener('submit',event => {event.preventDefault(); apply();});
  form.addEventListener('reset',event => {
    event.preventDefault();
    input.value = ''; category.selectedIndex = 0; district.selectedIndex = 0;
    apply(); input.focus();
  });
  empty.querySelector('a').addEventListener('click',event => {
    if (event.button || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault(); form.reset();
  });
  input.addEventListener('input',() => apply());
  category.addEventListener('change',() => apply());
  district.addEventListener('change',() => apply());
  window.addEventListener('popstate',() => {restore(); apply(false);});
  window.addEventListener('hashchange',() => apply(false));
  jump.open = window.matchMedia('(min-width: 760px)').matches;
  restore(); apply(false); form.hidden = false;
})();
