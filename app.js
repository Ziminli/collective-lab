const icons = {
 play:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3 17 10 6 17Z"/></svg>',
 pause:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h4v14H5zM12 3h4v14h-4z"/></svg>',
 back:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5"/></svg>',
 next:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg>',
 reset:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8a6 6 0 1 1 0 5M4 3v5h5"/></svg>',
 link:'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 12 4-4M7 7l2-2a4 4 0 0 1 6 6l-2 2M13 13l-2 2a4 4 0 0 1-6-6l2-2"/></svg>',
 use:'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="4" width="12" height="12" rx="2"/><path d="M1 7h3M1 13h3M16 7h3M16 13h3M7 1v3M13 1v3M7 16v3M13 16v3"/></svg>',
 info:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 6v1"/></svg>'
};
const sections = {communication:{title:'Communication',subtitle:'01 / THE PRIMITIVES',intro:'Follow the data'},parallelism:{title:'Parallelism',subtitle:'02 / THE STRATEGIES',intro:'Split the work'},techniques:{title:'Techniques',subtitle:'03 / THE OPTIMIZATIONS',intro:'Make it practical'},architectures:{title:'Architectures',subtitle:'04 / THE BUILDING BLOCKS',intro:'Inside the computation'},models:{title:'Models',subtitle:'05 / THE MODEL FAMILIES',intro:'Read the blueprint'}};
const state = {topic:null,frame:0,frames:[],algorithm:'',mode:'Training',playing:!matchMedia('(prefers-reduced-motion: reduce)').matches,speed:1,timer:null};
const logicState={frame:0,frames:[],playing:false,timer:null};
const $ = selector => document.querySelector(selector);
const href = t => `#/${t.section}/${t.id}`;
function renderNav(query=''){
 let search=query.toLowerCase().trim(),currentSection=state.topic?.section||'communication';
 $('#topic-list').innerHTML=Object.entries(sections).map(([id,section])=>{
  let matches=topics.filter(t=>t.section===id&&(!search||[t.name,t.short,t.description,...t.tags].flatMap(s=>[s,typeof translateChinese==='function'?translateChinese(s):s]).join(' ').toLowerCase().includes(search)));
  if(!search&&id!==currentSection)return'';if(!matches.length)return'';
  return `<div class="nav-group"><div class="group-label"><span>${search?section.title.toUpperCase():section.subtitle}</span><span>${String(matches.length).padStart(2,'0')}</span></div>${matches.map((t,i)=>`${t.curriculum&&(i===0||matches[i-1].navGroup!==t.navGroup)?`<div class="model-nav-label">${esc(t.navGroup)}</div>`:''}<a class="topic-link ${t.id===state.topic?.id?'active':''}" href="${href(t)}" ${t.id===state.topic?.id?'aria-current="page"':''}><span class="nav-symbol" aria-hidden="true">${esc(t.symbol)}</span><span>${esc(t.name)}</span></a>`).join('')}</div>`;
 }).join('')||'<p class="no-results">No matching concepts.<br>Try “cache”, “gradients”, or “inference”.</p>';
}
function topicOptions(topic,mode){return topic.scheduleOptions?.[mode]||topic.algorithms||topic.variants||[];}
function navigate(){
 const segments=location.hash.replace(/^#\/?/,'').split('/');
 let topic=topics.find(t=>t.id===segments[1]&&t.section===segments[0])||topics.find(t=>t.id===segments[0]);
 if(!topic){topic=topics[0];history.replaceState(null,'',href(topic));}
 clearTimeout(logicState.timer);state.playing=topic.section!=='communication'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 state.topic=topic;state.frame=0;state.mode=topic.tags.includes('Training')?'Training':'Inference';
 state.algorithm=topicOptions(topic,state.mode)[0]||'';
 $('#search').value='';renderNav();closeMobile();renderPage();
 document.title=`${topic.name} — Collective Lab`;
 document.querySelectorAll('.section-nav a').forEach(a=>{let active=a.dataset.section===topic.section;a.classList.toggle('active',active);active?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current');});
 document.querySelector('.section-nav a.active')?.scrollIntoView({block:'nearest',inline:'nearest'});
 window.scrollTo({top:0,behavior:'instant'});
}
function shortConcept(t){
 const map={
  'all-reduce':'A shared result on every rank.','all-gather':'Copy shards. Rebuild the whole.','reduce-scatter':'Reduce globally. Store locally.','broadcast':'The root is the only source.','reduce':'One complete result at the root.','scatter':'Partition, without reduction.','gather':'Concatenate at the root.','all-to-all':'Transpose data ownership.','all-to-all-v':'Route a different amount to each peer.','send-recv':'Explicit endpoints. Explicit dependencies.','barrier':'Synchronize participation.','scan':'An ordered prefix at each rank.',
  'data-parallel':'Split examples; replicate weights.','tensor-parallel':'Split the math inside a layer.','pipeline-parallel':'Split depth; stream microbatches.','sequence-parallel':'Shard tokenwise activation storage.','context-parallel':'Local queries. Global context.','expert-parallel':'Move tokens to their experts.','hybrid-parallel':'Different axes. Different groups.','replica-serving':'Independent requests, independent progress.','prefill-decode':'Separate phases. Transfer state.','fsdp':'Gather just in time. Reshard after use.',
  'zero':'Optimizer → gradients → parameters.','gradient-accumulation':'Accumulate first. Update once.','activation-checkpointing':'Trade extra compute for memory.','overlap':'Launch early. Wait only when needed.','continuous-batching':'Refill the batch between iterations.','kv-cache':'Reuse history, one token at a time.','gradient-compression':'Fewer bytes. Approximate gradients.','quantization':'Smaller payloads. Compatible kernels.'};return t.mentalModel||map[t.id];
}
function renderPage(){
 const t=state.topic,section=sections[t.section],index=topics.filter(x=>x.section===t.section).findIndex(x=>x.id===t.id)+1,opts=topicOptions(t,state.mode);
 const next=topics[(topics.indexOf(t)+1)%topics.length];
 const select=opts.length?`<label class="algorithm-select"><span>${t.curriculum?'VIEW':t.scheduleOptions?'SCHEDULE':t.id==='tensor-parallel'?'LAYOUT':t.variants?'STAGE':'ALGORITHM'}</span><select id="algorithm" aria-label="${t.curriculum?'Model or operator view':t.scheduleOptions?'Pipeline schedule':t.id==='tensor-parallel'?'Tensor parallel layout':t.variants?'ZeRO stage':'Communication algorithm'}">${opts.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></label>`:'';
 const mode=t.section!=='communication'&&t.tags.length===2?`<div class="mode-toggle" role="group" aria-label="Execution mode">${t.tags.map(m=>`<button class="${m===state.mode?'selected':''}" data-mode="${m}" aria-pressed="${m===state.mode}">${m}</button>`).join('')}</div>`:'';
 $('#main').innerHTML=`
 <div class="breadcrumb"><span>The field guide</span><span class="slash">/</span><span>${section.title}</span><span class="slash">/</span><strong>${esc(t.name)}</strong><span class="breadcrumb-right"><span class="small-ring"></span> LEARN BY SEEING</span></div>
 <section class="hero" aria-labelledby="topic-title"><div class="hero-topline"><span class="hero-badge">${esc(t.badge)}</span><span class="topic-count">&nbsp; / &nbsp; ${String(index).padStart(2,'0')}</span></div><h1 id="topic-title">${esc(t.name)}<span style="color:#8ba86a">.</span></h1><p class="hero-lede">${esc(t.lede)}</p>${t.description!==t.lede?`<p class="hero-description">${esc(t.description)}</p>`:''}<div class="hero-bottom"><div class="scope-tags">${t.tags.map(tag=>`<span class="scope-tag">${tag}</span>`).join('')}</div><button class="share-button" id="share-link">${icons.link} Copy link</button></div></section>
 ${t.section==='communication'?semanticPanel(t):t.curriculum?renderModelIntro(t):''}
 <div class="lesson-heading" id="implementation-heading"><h2>${t.section==='communication'?'<span>02</span> How it is implemented':t.curriculum?'Explore the structure and operators':'Explore the layout and schedule'}</h2><p>${t.section==='communication'?'Same logical result. Different schedules, traffic, and startup costs.':t.curriculum?'Select a structure or operator. Step through its data flow, then inspect the equations.':'Change the available layout, stage, or execution mode. The explanation follows your selection.'}</p></div>
 <div class="study-grid"><section class="visual-card" aria-label="Interactive ${esc(t.name)} implementation"><div class="visual-header"><div class="visual-heading"><span class="live-indicator"></span>${t.section==='communication'?'Implementation trace':'See it in motion'}</div><div class="visual-selectors">${select}${mode}${!select&&!mode?`<span class="mini-eyebrow">${t.tags[0].toUpperCase()}</span>`:''}</div></div>
 <div class="scene-wrap ${t.section==='communication'?'':'concept-view'}"><div class="scene-topline"><span id="scene-metadata"></span><span>LOGICAL STEPS · NOT TO SCALE</span></div><div id="diagram"></div><div class="legend" id="legend">${legend()}</div></div>
 <div class="frame-caption"><span class="frame-number" id="frame-number"></span><div class="frame-copy"><h3 id="frame-title"></h3><p id="frame-description"></p></div></div>
 <div class="player-controls"><button class="icon-button" id="restart" aria-label="Restart animation" title="Restart">${icons.reset}</button><button class="icon-button" id="previous" aria-label="Previous step" title="Previous step">${icons.back}</button><button class="play-button" id="play" aria-label="Play animation"></button><button class="icon-button" id="next" aria-label="Next step" title="Next step">${icons.next}</button><input type="range" id="scrubber" min="0" max="1" value="0" step="1" aria-label="Implementation animation step"><span class="step-count" id="step-count"></span><select class="speed-select" id="speed" aria-label="Playback speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></div></section>
 <aside class="insight-panel" aria-label="Selected implementation explanation"><div class="concept-card"><div class="mini-eyebrow"><span>↗</span> THE MENTAL MODEL</div><h2>${esc(shortConcept(t))}</h2><div class="formula" id="selected-formula"></div><p class="cost-label" id="cost-label"></p><div class="cost" id="selected-cost"></div><p class="cost-note" id="selected-cost-note"></p><div id="local-notation"></div></div><div class="usage-card"><h3>${icons.use} Where you’ll see it</h3><p id="usage-text"></p></div></aside></div>
 <section class="how-section" aria-labelledby="how-heading"><div class="section-heading"><h2 id="how-heading"></h2><span id="explanation-mode"></span></div><div class="steps-grid" id="implementation-steps"></div></section>
 <section id="comparison-section"></section>
 <section class="deeper-section" aria-labelledby="deeper-heading"><div class="section-heading"><h2 id="deeper-heading">Details worth understanding</h2><span>LAYOUT · CORRECTNESS · TRADEOFFS</span></div><div id="deeper-details" class="deeper-grid"></div></section>
 <aside class="detail-note">${icons.info}<p><strong>The detail that matters.</strong> ${esc(t.caveat)}</p></aside>
 <div class="bottom-row"><nav class="related-links" aria-label="Related concepts"><span class="footer-label">CONNECT THE DOTS</span>${t.related.map(id=>{const rel=topics.find(x=>x.id===id);return `<a class="related-link" href="${href(rel)}">${esc(rel.name)} <span>↗</span></a>`;}).join('')}</nav><div class="source-links"><span class="footer-label">GO DEEPER</span>${t.sources.map(key=>`<a href="${SOURCES[key][1]}" target="_blank" rel="noopener noreferrer">${esc(SOURCES[key][0])} ↗</a>`).join('')}</div></div>
 <footer class="page-footer"><span>BUILT FOR CURIOSITY. GROUNDED IN THE DETAILS.</span><a class="next-link" href="${href(next)}">Up next: ${esc(next.name)} <span>→</span></a></footer>`;
 $('#algorithm')?.addEventListener('change',ev=>{state.algorithm=ev.target.value;rebuild();});
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;if(t.scheduleOptions){const options=topicOptions(t,state.mode);if(!options.includes(state.algorithm))state.algorithm=options[0];$('#algorithm').innerHTML=options.map(o=>`<option value="${esc(o)}">${esc(o)}</option>`).join('');$('#algorithm').value=state.algorithm;}document.querySelectorAll('[data-mode]').forEach(btn=>{const on=btn===b;btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));});rebuild();}));
 document.querySelectorAll('[data-model-view]').forEach(b=>b.addEventListener('click',()=>{state.algorithm=b.dataset.modelView;$('#algorithm').value=state.algorithm;rebuild();}));
 $('#play').addEventListener('click',togglePlay);
 $('#previous').addEventListener('click',()=>manualStep(-1));$('#next').addEventListener('click',()=>manualStep(1));
 $('#restart').addEventListener('click',()=>{state.frame=0;renderFrame();schedule();});
 $('#scrubber').addEventListener('input',ev=>{state.playing=false;state.frame=Number(ev.target.value);renderFrame();schedule();});
 $('#speed').value=state.speed;$('#speed').addEventListener('change',ev=>{state.speed=Number(ev.target.value);window.labSpeed=state.speed;renderFrame();schedule();});
 $('#share-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copied. Share the idea.');}catch{const tmp=document.createElement('textarea');tmp.value=location.href;tmp.style.position='fixed';tmp.style.opacity='0';document.body.append(tmp);tmp.select();const ok=document.execCommand('copy');tmp.remove();toast(ok?'Link copied. Share the idea.':'Copy the page URL from your address bar.');}});
 if(t.section==='communication')setupSemantic(t);
 rebuild();
}
function notationHTML(entries){
 const dl=rows=>`<dl class="symbol-list">${rows.map(([term,definition])=>`<dt>${esc(term)}</dt><dd>${esc(definition)}</dd>`).join('')}</dl>`;
 if(state.topic.section!=='communication')return `<div class="local-notation"><h3>Read the equations</h3>${dl(entries)}</div>`;
 const core=entries.filter(([term])=>['T','P','α','β','N'].includes(term)),rest=entries.filter(([term])=>!['T','P','α','β','N'].includes(term));
 return `<div class="local-notation"><h3>Symbols & units</h3>${dl(core)}<details><summary>Inputs, indices & assumptions</summary>${dl(rest)}<p>Models omit arithmetic, contention, protocol and overlap overhead. Time is not a measured benchmark. Power-of-two examples use L = log₂P.</p></details></div>`;
}
function comparisonRowSelected(name){if(state.topic.curriculum)return name===state.topic.name;if(state.topic.id==='zero')return name==='ZeRO-'+state.algorithm.slice(-1);if(state.topic.id==='tensor-parallel')return state.algorithm==='Column → row MLP'?name.includes('activation'):name.replaceAll(' ','-')===state.algorithm;return name===state.algorithm;}
function updateLesson(){
 const t=state.topic,l=selectedLesson(t,state.algorithm,state.mode);
 $('#selected-formula').textContent=l.formula;$('#selected-cost').textContent=l.cost;$('#selected-cost-note').textContent=l.costNote;
 $('#cost-label').textContent=(state.algorithm?state.algorithm+' · ':'')+(t.section==='communication'?'communication model':state.mode+' tradeoff');
 $('#local-notation').innerHTML=notationHTML(l.notation);
 $('#how-heading').textContent=t.section==='communication'?state.algorithm+' · step by step':(state.algorithm||state.mode)+' · under the hood';
 $('#explanation-mode').textContent=t.section==='communication'?'MATCHES THE SELECTED TRACE':state.mode.toUpperCase();
 $('#implementation-steps').innerHTML=l.steps.map((step,i)=>`<article class="explain-step"><span class="explain-number">${i+1}</span><h3>${esc(step[0])}</h3><p>${esc(step[1])}</p></article>`).join('');
 $('#deeper-details').innerHTML=l.details.map(([title,body])=>`<article class="deeper-card"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('');
 const use=state.mode==='Inference'?t.inference:t.training;$('#usage-text').textContent=use||t.usage;
 let comparison=t.curriculum?modelLessonComparisons(t):l.comparisons;
 if(t.section==='communication')comparison={headers:['Implementation','Cost / traffic model','What the model includes'],rows:t.algorithms.map(a=>{const d=t.algorithmDetails[a];return [a,d.cost,d.costNote];})};
 $('#comparison-section').innerHTML=comparison?`<div class="section-heading"><h2>${t.section==='communication'?'Compare implementations':'Compare the choices'}</h2><span>${t.section==='communication'?'SAME OPERATION · DIFFERENT TRAFFIC':'READ THE LAYOUTS CAREFULLY'}</span></div><div class="comparison-scroll" tabindex="0" role="region" aria-label="${esc(t.name)} comparison table"><table class="comparison-table"><thead><tr>${comparison.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${comparison.rows.map(row=>`<tr class="${comparisonRowSelected(row[0])?'selected-row':''}">${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}${comparisonRowSelected(row[0])?'<span class="selected-pill">SELECTED</span>':''}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
}
function semanticSymbols(t){
 if(t.id==='barrier')return 'r is a rank. Enter/exit mean participation in this barrier; there is no tensor output.';
 if(t.id==='send-recv')return 'The source is rank 0; the destination is rank 2. Only that pair participates.';
 if(t.id==='all-to-all'||t.id==='all-to-all-v')return 's and d mean source/destination rank. sendcount[s][d] must match recvcount[d][s]; counts are element counts.';
 if(t.id==='broadcast'||t.id==='scatter')return 'root = rank 0; xroot is its input; yᵣ is rank r’s output. P is the group size.';
 return 'P = group size; r = rank index; xᵣ = input; yᵣ = defined output; ⊕ = associative reduction (SUM here). Rooted examples use rank 0.';
}
function semanticPanel(t){
 return `<section class="semantic-section" aria-label="Logical meaning of ${esc(t.name)}"><div class="lesson-heading"><h2><span>01</span> What the operation does</h2><p>First understand the input and output. No ring, tree, or network schedule yet.</p></div><div class="visual-card semantic-card"><div class="visual-header"><div class="visual-heading"><span class="live-indicator"></span>Logical example</div><span class="mini-eyebrow">4 RANKS · INPUT → OUTPUT</span></div><div class="semantic-layout"><div id="semantic-diagram"></div><div class="semantic-contract"><span class="mini-eyebrow">THE CONTRACT</span><div class="formula">${esc(t.formula)}</div><p>${esc(t.semanticNote)}</p><p class="semantic-symbols">${esc(semanticSymbols(t))}</p><p>Dashed empty cells mean no owned shard. “No defined output” is an API result distinction; it does not mean the sender’s input buffer was erased.</p></div></div><div class="frame-caption"><span class="frame-number" id="semantic-number"></span><div class="frame-copy"><h3 id="semantic-frame-title"></h3><p id="semantic-frame-description"></p></div></div><div class="player-controls semantic-controls"><button class="icon-button" id="semantic-restart" aria-label="Restart logical animation">${icons.reset}</button><button class="icon-button" id="semantic-previous" aria-label="Previous logical step">${icons.back}</button><button class="play-button" id="semantic-play" aria-label="Play logical animation"></button><button class="icon-button" id="semantic-next" aria-label="Next logical step">${icons.next}</button><input type="range" id="semantic-scrubber" min="0" max="2" value="0" step="1" aria-label="Logical animation step"><span class="step-count" id="semantic-count"></span><button class="explore-button" id="explore-implementation">Explore implementation ↓</button></div></div></section>`;
}
function setupSemantic(t){
 logicState.frames=semanticFrames(t);logicState.frame=0;logicState.playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 $('#semantic-play').addEventListener('click',()=>{logicState.playing=!logicState.playing;if(logicState.playing&&logicState.frame===2)logicState.frame=0;renderSemantic();});
 $('#semantic-previous').addEventListener('click',()=>{logicState.playing=false;logicState.frame=Math.max(0,logicState.frame-1);renderSemantic();});
 $('#semantic-next').addEventListener('click',()=>{logicState.playing=false;logicState.frame=Math.min(2,logicState.frame+1);renderSemantic();});
 $('#semantic-restart').addEventListener('click',()=>{logicState.frame=0;renderSemantic();});
 $('#semantic-scrubber').addEventListener('input',ev=>{logicState.playing=false;logicState.frame=Number(ev.target.value);renderSemantic();});
 $('#explore-implementation').addEventListener('click',()=>{logicState.playing=false;renderSemantic();$('#implementation-heading').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});state.playing=true;renderFrame();schedule();});
 renderSemantic();
}
function renderSemantic(){
 clearTimeout(logicState.timer);if(!$('#semantic-diagram'))return;
 const f=logicState.frames[logicState.frame];window.labPlaying=logicState.playing&&!document.hidden;$('#semantic-diagram').innerHTML=semanticSVG(f);window.labPlaying=state.playing&&!document.hidden;
 $('#semantic-number').textContent=String(logicState.frame+1).padStart(2,'0');$('#semantic-frame-title').textContent=f.title;$('#semantic-frame-description').textContent=f.text;
 $('#semantic-count').textContent=`0${logicState.frame+1} / 03`;$('#semantic-scrubber').value=logicState.frame;$('#semantic-scrubber').style.setProperty('--progress',logicState.frame*50+'%');$('#semantic-scrubber').setAttribute('aria-valuetext',f.title);
 $('#semantic-previous').disabled=logicState.frame===0;$('#semantic-next').disabled=logicState.frame===2;$('#semantic-play').innerHTML=logicState.playing?icons.pause:icons.play;$('#semantic-play').setAttribute('aria-label',logicState.playing?'Pause logical animation':'Play logical animation');
 if(logicState.playing&&!document.hidden)logicState.timer=setTimeout(()=>{if(logicState.frame<2)logicState.frame++;if(logicState.frame===2)logicState.playing=false;renderSemantic();},3000);
}
function metadata(){const t=state.topic;if(t.curriculum)return modelMetadata();return t.section==='communication'?`4 RANKS · ${t.id==='scan'?'INCLUSIVE SUM':t.id==='all-reduce'||t.id==='reduce-scatter'||t.id==='reduce'?'ELEMENTWISE SUM':'ILLUSTRATIVE BUFFERS'}`:t.id==='tensor-parallel'?`2 RANKS · ${state.algorithm.toUpperCase()}`:t.id==='pipeline-parallel'?pipelineMetadata(state.frames[0]):t.id==='hybrid-parallel'?'8 RANKS · 3 PARALLEL AXES':`${state.mode.toUpperCase()} · ILLUSTRATIVE EXAMPLE`;}
function legend(){
 const t=state.topic;
 if(t.curriculum)return '<span>Illustrative dimensions · logical dependencies · not measured runtime</span>';
 if(t.id==='pipeline-parallel')return '<span>Microbatch color · C = chunk · R = rank</span>';
 let labels=t.id==='tensor-parallel'?['rank 0 feature shard','rank 1 feature shard']:t.id==='expert-parallel'?['source 0','source 1','source 2','source 3']:t.section==='communication'?(t.id==='all-to-all'||t.id==='all-to-all-v'?['source 0','source 1','source 2','source 3']:t.id==='barrier'?['arrived','waiting']:t.id==='scan'?['local prefix']:['shard 0','shard 1','shard 2','shard 3']):t.id==='pipeline-parallel'?['microbatch 1','microbatch 2','microbatch 3','microbatch 4']:t.id==='zero'||t.id==='fsdp'?['owner 0','owner 1','owner 2','owner 3']:['partition A','partition B','partition C','partition D'];
 return labels.map((label,i)=>`<span class="legend-item"><span class="legend-dot" style="--c:${PALETTE[t.id==='barrier'&&i===1?2:i]}"></span>${label}</span>`).join('');
}
function rebuild(){state.frame=0;state.frames=buildFrames(state.topic,state.algorithm,state.mode);$('#scrubber').max=state.frames.length-1;$('#scene-metadata').textContent=metadata();updateLesson();updateModelViewTabs();renderFrame();schedule();}
function renderFrame(){
 window.labPlaying=state.playing&&!document.hidden;const f=state.frames[state.frame];$('#diagram').innerHTML=sceneSVG(f);$('#frame-number').textContent=String(state.frame+1).padStart(2,'0');$('#frame-title').textContent=f.title;$('#frame-description').textContent=f.text;
 $('#scrubber').value=state.frame;$('#scrubber').style.setProperty('--progress',(state.frame/(state.frames.length-1))*100+'%');$('#scrubber').setAttribute('aria-valuetext',`Step ${state.frame+1} of ${state.frames.length}: ${f.title}`);$('#step-count').textContent=`${String(state.frame+1).padStart(2,'0')} / ${String(state.frames.length).padStart(2,'0')}`;$('#previous').disabled=state.frame===0;$('#next').disabled=state.frame===state.frames.length-1;
 $('#play').innerHTML=state.playing?icons.pause:icons.play;$('#play').setAttribute('aria-label',state.playing?'Pause animation':'Play animation');
 if(!state.playing||document.hidden)$('#diagram svg').pauseAnimations?.();
}
function schedule(){clearTimeout(state.timer);if(state.playing&&!document.hidden)state.timer=setTimeout(()=>{state.frame=(state.frame+1)%state.frames.length;renderFrame();schedule();},(state.frame===state.frames.length-1?3700:2700)/state.speed);}
function togglePlay(){state.playing=!state.playing;if(state.playing&&state.frame===state.frames.length-1)state.frame=0;renderFrame();schedule();}
function manualStep(delta){state.playing=false;state.frame=Math.max(0,Math.min(state.frames.length-1,state.frame+delta));renderFrame();schedule();}
let toastTimer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500);}
function closeMobile(){$('.sidebar').classList.remove('open');$('.mobile-backdrop').classList.remove('active');$('.menu-button').setAttribute('aria-expanded','false');$('.menu-button').setAttribute('aria-label','Open topic navigation');}
$('.menu-button').addEventListener('click',()=>{const open=$('.sidebar').classList.toggle('open');$('.mobile-backdrop').classList.toggle('active',open);$('.menu-button').setAttribute('aria-expanded',String(open));$('.menu-button').setAttribute('aria-label',open?'Close topic navigation':'Open topic navigation');});
$('.mobile-backdrop').addEventListener('click',closeMobile);$('#search').addEventListener('input',ev=>renderNav(ev.target.value));
const dialog=$('#guide-dialog');document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>{dialog.showModal();document.body.classList.add('modal-open');}));
$('#close-guide').addEventListener('click',()=>dialog.close());$('#start-exploring').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',ev=>{if(ev.target===dialog){const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)dialog.close();}});
window.addEventListener('hashchange',navigate);document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderFrame();schedule();renderSemantic();}else{clearTimeout(logicState.timer);clearTimeout(state.timer);$('#diagram svg')?.pauseAnimations?.();}});
window.addEventListener('keydown',ev=>{if(ev.target.matches('input,select,textarea,button')||dialog.open)return;if(ev.key==='/'){ev.preventDefault();if(matchMedia('(max-width:700px)').matches&&!$('.sidebar').classList.contains('open'))$('.menu-button').click();$('#search').focus();}if(ev.code==='Space'){ev.preventDefault();togglePlay();}if(ev.key==='ArrowRight'){ev.preventDefault();manualStep(1);}if(ev.key==='ArrowLeft'){ev.preventDefault();manualStep(-1);}if(ev.key==='Escape')closeMobile();});
navigate();

matchMedia('(max-width:700px)').addEventListener('change',()=>{if(state.frames.length)renderFrame();if(logicState.frames.length)renderSemantic();});
$('#topic-list').addEventListener('click',ev=>{if(ev.target.closest('.topic-link'))closeMobile();});
