from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
root=Path('.').resolve()
files=[root/'index.html']+list((root/'ml').rglob('*.html'))+list((root/'blog').rglob('*.html'))+list((root/'directory').rglob('*.html'))+list((root/'events').rglob('*.html'))+list((root/'faq').rglob('*.html'))
class Page(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.ids=set();self.links=[];self.h1=0;self.lang='';self.scripts=[];self.script=None;self.skip=False;self.text=[];self.canonical=[];self.alternates=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:assert a['id'] not in self.ids,('Duplicate ID',a['id']);self.ids.add(a['id'])
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if tag in ['a','link','script','img']:
   u=a.get('href',a.get('src',''))
   if u:self.links.append(u)
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
  if tag=='link' and a.get('rel')=='alternate':self.alternates.append(a['href'])
  if tag=='script':self.skip=True;self.script='' if a.get('type')=='application/ld+json' else None
 def handle_data(self,data):
  if self.script is not None:self.script+=data
  if not self.skip:self.text.append(data)
 def handle_endtag(self,tag):
  if tag=='script':
   if self.script is not None:self.scripts.append(json.loads(self.script))
   self.script=None;self.skip=False
parsed={}
for file in files:
 p=Page();p.feed(file.read_text());parsed[file]=p
 assert p.h1==1,(file,'H1 count',p.h1)
 assert len(p.canonical)==1 and p.canonical[0].startswith('https://www.specialtycoffeekerala.com/'),file
 assert len(p.alternates)==3,file
 text=' '.join(p.text)
 assert not re.search(r'Lady Loafella|Coz Coffee',text),file
 if p.lang=='ml':
  leftovers=re.findall(r'[A-Za-z]{3,}',text)
  assert set(leftovers)<=set(['English']), (file,leftovers)
for file,p in parsed.items():
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  dest=(root/unquote(u.path).lstrip('/')) if u.path.startswith('/') else (file.parent/unquote(u.path)) if u.path else file
  if dest.is_dir():dest=dest/'index.html'
  assert dest.exists(),(file,href,'Missing target')
  if u.fragment and dest in parsed and not u.fragment.startswith('map-') and u.fragment not in ('submit-event','add-place'):
   assert u.fragment in parsed[dest].ids,(file,href,'Missing anchor')
events=json.loads((root/'content/events.json').read_text())
assert len(files)==16+2*len(events),len(files)
for prefix in ('','ml/'):
 index=parsed[root/(prefix+'events/index.html')]
 assert not any(s.get('@type')=='Event' for s in index.scripts),'Event markup belongs on detail pages'
 for event in events:
  file=root/(prefix+'events/'+event['slug']+'/index.html')
  detail=parsed[file]
  schemas=[s for s in detail.scripts if s.get('@type')=='Event']
  assert len(schemas)==1,(file,'One event per detail page')
  schema=schemas[0]
  assert schema['url']==detail.canonical[0],file
  assert schema['startDate'].startswith(event['date']),file
  if event.get('registrationUrl'):
   assert event['registrationUrl'] in detail.links,(file,'Missing registration link')
   assert event['qr'] in detail.links,(file,'Missing registration QR')
   assert schema['startDate']=='2026-10-10T14:00:00+05:30',file
   assert schema['endDate']=='2026-10-10T18:00:00+05:30',file
   assert schema['location']['address']['addressLocality']=='Fort Kochi',file
print('PASS:',len(files),'HTML pages, unique IDs, one H1 per page, valid JSON-LD, canonicals, language alternatives, internal links and Malayalam visible text.')
