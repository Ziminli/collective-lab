/* Presentation preferences never rebuild the lesson or alter its simulation state. */
const localeSources=new WeakMap(),attributeSources=new WeakMap();
const lowerChinese=new Map(Object.entries(ZH).map(([en,zh])=>[en.toLowerCase(),zh]));
function translateChinese(value){
 const text=String(value),key=text.trim();if(!key)return text;
 let translated=ZH[key]||lowerChinese.get(key.toLowerCase());
 if(!translated){
  const patterns=[
   [/^(.+) — Collective Lab$/,m=>translateChinese(m[1])+' — Collective Lab'],
   [/^(.+) ↗$/,m=>translateChinese(m[1])+' ↗'],
   [/^Interactive (.+) implementation$/,m=>translateChinese(m[1])+'交互实现'],
   [/^Logical meaning of (.+)$/,m=>translateChinese(m[1])+'逻辑含义'],
   [/^(.+) comparison table$/,m=>translateChinese(m[1])+'比较表'],
   [/^Up next: (.+)$/,m=>'下一主题：'+translateChinese(m[1])],
   [/^Step (\d+) of (\d+): (.+)$/,m=>'第 '+m[1]+' / '+m[2]+' 步：'+translateChinese(m[3])],
   [/^rank (\d+) feature shard$/i,m=>'rank '+m[1]+' 特征分片'],
   [/^gradient g(\d+)$/,m=>'梯度 g'+m[1]],
   [/^local Q(\d+)$/,m=>'本地 Q'+m[1]],
   [/^(source|shard|owner|microbatch|partition|batch|request|response|stage|expert|instance|segment|iteration|bucket|reduce|slot|logical block|owned shard|local batch|local Q|gradient g|stream) ([\w✓]+)(.*)$/i,m=>({source:'来源',shard:'分片',owner:'所有者',microbatch:'微批次',partition:'分区',batch:'批次',request:'请求',response:'响应',stage:'阶段',expert:'专家',instance:'实例',segment:'段',iteration:'迭代',bucket:'桶',reduce:'归约',slot:'槽位','logical block':'逻辑块','owned shard':'持有分片','local batch':'本地批次','local q':'本地 Q','gradient g':'梯度 g',stream:'流式输出'}[m[1].toLowerCase()]+' '+m[2]+m[3])],
   [/^RANK (\d+)(.*)$/,m=>'RANK '+m[1]+m[2].replace('COLUMN','列').replace('ROW','行')],
   [/^DATA REPLICA (\d+)$/,m=>'数据副本 '+m[1]],
   [/^ZeRO (\d+) · PERSISTENT STATE PER RANK$/,m=>'ZeRO '+m[1]+' · 每 RANK 常驻状态'],
   [/^(\d+) RANKS$/,m=>m[1]+' 个 RANK']
  ];
  for(const [pattern,render] of patterns){const m=key.match(pattern);if(m){translated=render(m);break;}}
  if(!translated&&key.includes(' · '))translated=key.split(' · ').map(translateChinese).join(' · ');
 }
 return translated?text.replace(key,translated):text;
}
function tr(text){return document.documentElement.lang==='zh-CN'?translateChinese(text):text;}
let localizationObserver;
function localizePage(){
 localizationObserver?.disconnect();
 const chinese=document.documentElement.lang==='zh-CN';
 const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement?.closest('script,style,noscript,[data-no-i18n]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 let node;while(node=walker.nextNode()){
  const current=node.nodeValue;let record=localeSources.get(node);
  if(!record||current!==record.last)record={source:current,last:current};
  const next=chinese?translateChinese(record.source):record.source;
  if(next!==current)node.nodeValue=next;record.last=next;localeSources.set(node,record);
 }
 document.querySelectorAll('[aria-label],[aria-valuetext],[placeholder],[title]').forEach(el=>{
  if(el.closest('[data-no-i18n]'))return;let records=attributeSources.get(el)||{};
  for(const name of ['aria-label','aria-valuetext','placeholder','title']){
   if(!el.hasAttribute(name))continue;const current=el.getAttribute(name);let record=records[name];
   if(!record||current!==record.last)record={source:current,last:current};
   const next=chinese?translateChinese(record.source):record.source;
   if(next!==current)el.setAttribute(name,next);record.last=next;records[name]=record;
  }attributeSources.set(el,records);
 });
 markDiagramData();
 localizationObserver?.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-valuetext','placeholder','title']});
}
function markDiagramData(){
 // Keep dark ink on the pastel ownership colors in either theme.
 const colors=new Set([...PALETTE,'#bfd4a3','#dfe9d5','#edf3e5']);
 document.querySelectorAll('svg.scene:not([data-contrast]),svg.semantic-scene:not([data-contrast])').forEach(svg=>{
  svg.dataset.contrast='true';const rects=[...svg.querySelectorAll('rect')].filter(r=>colors.has(r.getAttribute('fill')));
  for(const text of svg.querySelectorAll('text')){
   const x=text.x.baseVal[0]?.value,y=text.y.baseVal[0]?.value;if(x===undefined||y===undefined)continue;
   const m=text.getCTM();if(!m)continue;const p=new DOMPoint(x,y-4).matrixTransform(m);
   if(rects.some(r=>{const rm=r.getCTM();if(!rm)return false;const q=p.matrixTransform(rm.inverse());return q.x>=r.x.baseVal.value&&q.x<=r.x.baseVal.value+r.width.baseVal.value&&q.y>=r.y.baseVal.value&&q.y<=r.y.baseVal.value+r.height.baseVal.value;}))text.classList.add('on-data');
  }
 });
}
function savePreference(name,value){try{localStorage.setItem(name,value);}catch{/* Direct-file and restricted storage remain usable. */}}
function updatePreferenceControls(){
 const lang=document.documentElement.lang==='zh-CN'?'zh':'en',dark=document.documentElement.dataset.theme==='dark';
 for(const l of ['en','zh'])document.getElementById('language-'+l).setAttribute('aria-pressed',String(l===lang));
 const toggle=document.getElementById('theme-toggle'),title=dark?'Switch to light mode':'Switch to dark mode';
 toggle.setAttribute('aria-pressed',String(dark));toggle.setAttribute('aria-label',title);toggle.title=title;
 toggle.innerHTML=dark?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/></svg>';
 document.querySelector('meta[name="theme-color"]').content=dark?'#111214':'#f6f8f5';
}
function setLanguage(lang){
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';savePreference('collective-language',lang);
 updatePreferenceControls();renderNav(document.getElementById('search').value);localizePage();
}
let themeExplicit=false;try{themeExplicit=!!localStorage.getItem('collective-theme');}catch{}
function setTheme(theme,persist=true){
 document.documentElement.dataset.theme=theme;if(persist){themeExplicit=true;savePreference('collective-theme',theme);}
 updatePreferenceControls();localizePage();
}
ZH['Switch to light mode']='切换浅色模式';ZH['Switch to dark mode']='切换深色模式';
for(const lang of ['en','zh'])document.getElementById('language-'+lang).addEventListener('click',()=>setLanguage(lang));
document.getElementById('theme-toggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{if(!themeExplicit)setTheme(e.matches?'dark':'light',false);});
localizationObserver=new MutationObserver(localizePage);updatePreferenceControls();localizePage();
