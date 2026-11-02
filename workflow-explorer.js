/* Overview -> focused sub-workflow -> numerical calculation. Native dialog
   supplies focus trapping and Escape; the live lesson card keeps its handlers. */
const workflowState={root:null,open:false,stack:[],origin:null,moved:null,returnFocus:null,notes:false};
function workflowIsOverview(){return !workflowState.open&&!workflowState.notes;}
function wfEscape(text){return esc(String(text??''));}
function wfTensorHTML(t){return `<div class="wf-tensor"><span>${wfEscape(t.name)}</span><code>${wfEscape(t.shape)}</code>${t.attributes?`<small>${wfEscape(t.attributes)}</small>`:''}</div>`;}
function wfContractHTML(node,compact=false){const c=WorkflowContent.copy;return `<div class="wf-contract ${compact?'is-compact':''}"><div><h4>${wfEscape(c.input)}</h4>${(node.input||[]).map(wfTensorHTML).join('')}</div><span class="wf-contract-arrow" aria-hidden="true">→</span><div><h4>${wfEscape(c.output)}</h4>${(node.output||[]).map(wfTensorHTML).join('')}</div></div>`;}
function wfGlyph(n,x,y){
 const g=n.glyph||'',color=/query/.test(g)?'#63c7b0':/key|cache|compress|mla/.test(g)?'#a18bd9':/value/.test(g)?'#66a9df':'#7e9cc4';let s='';
 if(g==='sum'||g==='multiply')s=`<text x="${x+15}" y="${y+22}" text-anchor="middle" fill="${color}" class="wf-math-icon">${g==='sum'?'Σ':'×'}</text>`;
 else if(g==='cache')s=`<ellipse cx="${x+15}" cy="${y+5}" rx="13" ry="4" fill="none" stroke="${color}"/><path d="M${x+2} ${y+5}v19c0 6 26 6 26 0V${y+5}M${x+2} ${y+14}c0 6 26 6 26 0" stroke="${color}" fill="none"/>`;
 else if(g==='ranks')s=[0,1,2,3].map(i=>`<rect x="${x+(i%2)*17}" y="${y+Math.floor(i/2)*14}" width="12" height="9" rx="2" fill="${color}" fill-opacity=".5"/>`).join('');
 else s=Array.from({length:3},(_,r)=>Array.from({length:4},(_,c)=>`<rect x="${x+c*7}" y="${y+r*8}" width="5" height="6" rx="1" fill="${color}" fill-opacity="${.25+.17*((r+c)%4)}"/>`).join('')).join('');
 return `<g aria-hidden="true">${s}</g>`;
}
function wfWrap(value,max=22,lines=3){
 const original=typeof tr==='function'?tr(String(value)):String(value),isZh=/[\u3400-\u9fff]/.test(original),limit=isZh?Math.max(8,Math.floor(max*.60)):max;
 let words=isZh?Array.from(original):original.split(/\s+/),result=[],line='';
 for(let word of words){if(word.length>limit&&!isZh){const pieces=word.match(new RegExp('.{1,'+limit+'}','g'));for(const piece of pieces){if(line){result.push(line);line='';}result.push(piece);}continue;}const next=line+(line&&!isZh?' ':'')+word;if(next.length>limit&&line){result.push(line);line=word;}else line=next;}
 if(line)result.push(line);if(result.length>lines)result=[...result.slice(0,lines-1),result[lines-1].slice(0,Math.max(3,limit-1))+'…'];return result;
}
function wfTextLines(text,x,y,max,cls,lines=2){return `<text x="${x}" y="${y}" class="${cls}" data-no-i18n>${wfWrap(text,max,lines).map((v,i)=>`<tspan x="${x}" dy="${i?15:0}">${wfEscape(v)}</tspan>`).join('')}</text>`;}
function wfPositions(g,width){
 const pad=24,gap=28,cols=width>900?4:width>530?3:2,w=(width-pad*2-gap*(cols-1))/cols,h=106,step=148;
 const positions=new Map();g.nodes.forEach((n,i)=>{const row=Math.floor(i/cols),col=row%2?cols-1-i%cols:i%cols;positions.set(n.id,{x:pad+col*(w+gap),y:28+row*step,w,h});});
 return {positions,height:Math.ceil(g.nodes.length/cols)*step+14,width};
}
function wfEdgePath(a,b,e,index,width,height){
 const center=p=>({x:p.x+p.w/2,y:p.y+p.h/2});const ac=center(a),bc=center(b);
 if(e.from===e.to)return `M${a.x+a.w-12},${a.y+20} C${a.x+a.w+25},${a.y-24} ${a.x-25},${a.y-24} ${a.x+12},${a.y+20}`;
 if(e.type==='state'||e.type==='residual'){
  const down=bc.y>ac.y,yy=down?Math.min(height-8,Math.max(a.y+a.h,b.y+b.h)+17):Math.max(8,Math.min(a.y,b.y)-17);
  return `M${ac.x},${down?a.y+a.h:a.y} C${ac.x},${yy} ${bc.x},${yy} ${bc.x},${down?b.y+b.h:b.y}`;
 }
 if(Math.abs(ac.y-bc.y)<10){const right=bc.x>ac.x,sx=right?a.x+a.w:a.x,tx=right?b.x:b.x+b.w;return `M${sx},${ac.y} C${(sx+tx)/2},${ac.y} ${(sx+tx)/2},${bc.y} ${tx},${bc.y}`;}
 const down=bc.y>ac.y,sy=down?a.y+a.h:a.y,ty=down?b.y:b.y+b.h,mid=(sy+ty)/2;return `M${ac.x},${sy} C${ac.x},${mid} ${bc.x},${mid} ${bc.x},${ty}`;
}
function wfSVG(g,width){
 const {positions,height}=wfPositions(g,width),marker='wf-arrow-'+g.id.replace(/[^a-z0-9]/gi,'');let edges='',nodes='';
 g.edges.forEach((e,i)=>{const a=positions.get(e.from),b=positions.get(e.to);if(!a||!b)return;const path=wfEdgePath(a,b,e,i,width,height);
  edges+=`<g class="wf-edge wf-edge-${e.type||'data'}" data-wf-from="${wfEscape(e.from)}" data-wf-to="${wfEscape(e.to)}"><path d="${path}" marker-end="url(#${marker})"/><title>${wfEscape(e.label||WorkflowContent.copy.data)}</title>${e.label&&e.type!=='data'?wfTextLines(e.label,Math.min(width-120,Math.max(26,(a.x+b.x+a.w)/2)),Math.max(17,Math.min(a.y,b.y)-6),20,'wf-edge-label',1):''}</g>`;
 });
 g.nodes.forEach((n,i)=>{const p=positions.get(n.id),out=n.output.map(t=>t.shape).join(' + '),symbol=n.output.map(t=>t.name).join(', '),max=Math.max(10,Math.floor((p.w-26)/6.6));
  nodes+=`<g class="wf-node ${n.terminal?'wf-terminal':''}" data-wf-node="${wfEscape(n.id)}" transform="translate(${p.x},${p.y})" tabindex="0" role="button" aria-label="${wfEscape(n.label)}" aria-haspopup="dialog"><rect class="wf-node-shell" width="${p.w}" height="${p.h}" rx="9"/><rect class="wf-node-cap" x="0" y="0" width="3" height="${p.h}" rx="2"/><text x="13" y="17" class="wf-node-number">${String(i+1).padStart(2,'0')}</text>${wfGlyph(n,p.w-43,12)}${wfTextLines(n.label,13,43,max,'wf-node-label',2)}<path class="wf-node-divider" d="M12,72 H${p.w-12}"/>${wfTextLines(out,13,90,max+2,'wf-node-shape',1)}<circle class="wf-port" cx="${p.w/2}" cy="0" r="3"/><circle class="wf-port" cx="${p.w/2}" cy="${p.h}" r="3"/><title>${wfEscape(n.description)}\n${wfEscape(WorkflowContent.copy.output)}: ${wfEscape(out)}</title></g>`;
 });
 return `<svg class="wf-graph" viewBox="0 0 ${width} ${height}" role="group" aria-label="${wfEscape(g.title)}"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z"/></marker></defs>${edges}${nodes}</svg>`;
}
function wfMountGraph(host,g,onOpen,onHover){
 host._wfResize?.disconnect();host._wfLang?.disconnect();let selected=null,previousWidth=0,lang='';
 const draw=()=>{if(!host.isConnected)return;const width=Math.max(260,Math.floor(host.clientWidth||700)),nextLang=document.documentElement.lang;if(Math.abs(width-previousWidth)<3&&lang===nextLang)return;previousWidth=width;lang=nextLang;host.innerHTML=wfSVG(g,width);if(selected)highlight(selected);};
 const highlight=id=>{selected=id;const neighbors=new Set([id]);for(const e of g.edges)if(e.from===id||e.to===id){neighbors.add(e.from);neighbors.add(e.to);}
  host.querySelectorAll('[data-wf-node]').forEach(el=>{const on=el.dataset.wfNode===id;el.classList.toggle('is-selected',on);el.classList.toggle('is-related',neighbors.has(el.dataset.wfNode));el.classList.toggle('is-muted',!neighbors.has(el.dataset.wfNode));el.setAttribute('aria-pressed',String(on));});
  host.querySelectorAll('.wf-edge').forEach(el=>el.classList.toggle('is-active',el.dataset.wfFrom===id||el.dataset.wfTo===id));
 };
 const hover=id=>{highlight(id);const n=g.nodes.find(n=>n.id===id);if(n)onHover(n);};
 host.onpointerover=ev=>{const el=ev.target.closest('[data-wf-node]');if(el&&el.dataset.wfNode!==selected)hover(el.dataset.wfNode);};
 host.onfocusin=ev=>{const el=ev.target.closest('[data-wf-node]');if(el)hover(el.dataset.wfNode);};
 host.onclick=ev=>{const el=ev.target.closest('[data-wf-node]');if(el){hover(el.dataset.wfNode);onOpen(g.nodes.find(n=>n.id===el.dataset.wfNode),el);}};
 host.onkeydown=ev=>{const el=ev.target.closest('[data-wf-node]');if(el&&['Enter',' '].includes(ev.key)){ev.preventDefault();hover(el.dataset.wfNode);onOpen(g.nodes.find(n=>n.id===el.dataset.wfNode),el);}};
 host._wfResize=new ResizeObserver(draw);host._wfResize.observe(host);host._wfLang=new MutationObserver(draw);host._wfLang.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});draw();
 return {select:highlight,dispose:()=>{host._wfResize.disconnect();host._wfLang.disconnect();}};
}
function wfInspector(host,n,onOpen){
 const c=WorkflowContent.copy;host.innerHTML=`<span class="wf-eyebrow">${wfEscape(c.action)}</span><h3>${wfEscape(n.label)}</h3><p>${wfEscape(n.description)}</p>${wfContractHTML(n,true)}${n.equation?`<div class="wf-equation"><small>${wfEscape(c.equation)}</small><code>${wfEscape(n.equation)}</code></div>`:''}${n.note?`<p class="wf-attribute-note">${wfEscape(n.note)}</p>`:''}<button class="wf-open-step">${wfEscape(c.open)} <span>↗</span></button>`;host.querySelector('button').onclick=onOpen;
 if(typeof localizePage==='function')localizePage();
}
function workflowReset(){
 const dialog=document.getElementById('workflow-focus');if(dialog?.open)workflowClose(false);
 workflowState.rootUI?.dispose();workflowState.focusUI?.dispose();workflowState.rootUI=null;workflowState.focusUI=null;workflowState.root=null;workflowState.stack=[];workflowState.open=false;workflowState.origin=null;workflowState.notes=false;
 document.body.classList.remove('workflow-focused','workflow-notes-open');
}
function renderWorkflowExplorer(){
 if(workflowState.open)return;const host=document.getElementById('workflow-explorer');if(!host)return;
 const t=state.topic,c=WorkflowContent.copy,g=WorkflowContent.build(t,state.algorithm,state.mode);workflowState.root=g;
 workflowState.rootUI?.dispose();const opts=topicOptions(t,state.mode);
 host.innerHTML=`<section class="workflow-overview" aria-label="${wfEscape(c.overview)}"><div class="wf-overview-heading"><div><span class="wf-eyebrow">${wfEscape(MT('01 / THE BIG PICTURE','01 / 全局视图'))}</span><h2>${wfEscape(c.overview)}</h2><p>${wfEscape(c.hint)}</p></div><div class="wf-options">${t.tags.length===2?`<div class="wf-modes" role="group" aria-label="${wfEscape(MT('Execution mode','执行模式'))}">${t.tags.map(m=>`<button data-workflow-mode="${m}" aria-pressed="${m===state.mode}">${wfEscape(m)}</button>`).join('')}</div>`:''}${opts.length?`<label><span>${wfEscape(t.curriculum?MT('Workflow','工作流'):t.scheduleOptions?MT('Schedule','调度'):MT('Layout / implementation','布局 / 实现'))}</span><select id="workflow-option">${opts.map(o=>`<option value="${wfEscape(o)}" ${o===state.algorithm?'selected':''}>${wfEscape(o)}</option>`).join('')}</select></label>`:''}</div></div><div class="wf-boundaries">${wfContractHTML(g)}</div>${t.modelData?.facts?`<div class="wf-facts">${t.modelData.facts.slice(0,4).map(([k,v])=>`<span><small>${wfEscape(k)}</small><b>${wfEscape(v)}</b></span>`).join('')}</div>`:''}<div class="wf-overview-grid"><div class="wf-map-column"><div class="wf-map" id="workflow-map"></div><div class="wf-legend"><span><i></i>${wfEscape(c.data)}</span><span><i class="wf-dashed"></i>${wfEscape(c.state)}</span><span><i class="wf-skip"></i>${wfEscape(c.residual)}</span></div>${g.scope?`<p class="wf-scope">${wfEscape(g.scope)}</p>`:''}</div><aside id="workflow-inspector" class="wf-inspector" aria-label="${wfEscape(c.attributes)}" aria-live="polite"></aside></div><details class="wf-notation"><summary>${wfEscape(c.symbols)}</summary><dl>${g.notation.map(([s,d])=>`<dt>${wfEscape(s)}</dt><dd>${wfEscape(d)}</dd>`).join('')}</dl></details></section><button id="workflow-notes-toggle" class="wf-reference-toggle" aria-expanded="${workflowState.notes}">${wfEscape(c.notes)} <span>↓</span></button>`;
 const detail=document.getElementById('workflow-detail');detail.hidden=!workflowState.notes;
 const inspect=n=>{workflowState.hover=n;wfInspector(host.querySelector('#workflow-inspector'),n,()=>workflowOpen(n));};
 workflowState.rootUI=wfMountGraph(host.querySelector('#workflow-map'),g,(n,el)=>workflowOpen(n,el),inspect);inspect(g.nodes[0]);
 host.querySelector('#workflow-option')?.addEventListener('change',ev=>{document.getElementById('algorithm').value=ev.target.value;document.getElementById('algorithm').dispatchEvent(new Event('change'));});
 host.querySelectorAll('[data-workflow-mode]').forEach(b=>b.onclick=()=>document.querySelector(`[data-mode="${b.dataset.workflowMode}"]`)?.click());
 host.querySelector('#workflow-notes-toggle').onclick=()=>{workflowState.notes=!workflowState.notes;detail.hidden=!workflowState.notes;document.body.classList.toggle('workflow-notes-open',workflowState.notes);host.querySelector('#workflow-notes-toggle').setAttribute('aria-expanded',String(workflowState.notes));if(workflowState.notes)renderFrame();else architectureStage.detach();};
 if(typeof localizePage==='function')localizePage();
}
function workflowChooseFrame(n){
 state.playing=false;clearTimeout(state.timer);logicState.playing=false;clearTimeout(logicState.timer);
 if(n.focus.logical){logicState.frame=n.focus.frame<0?logicState.frames.length-1:Math.min(logicState.frames.length-1,n.focus.frame||0);renderSemantic();return;}
 const option=n.focus.option||state.algorithm;
 if(state.algorithm!==option){state.algorithm=option;const sel=document.getElementById('algorithm');if(sel)sel.value=option;rebuild();}
 state.frame=WorkflowContent.selectFrame(state.frames,n);renderFrame();schedule();
}
function wfMoveDemonstration(logical){
 const desired=logical?document.querySelector('.semantic-section'):document.querySelector('.study-grid>.visual-card')||workflowState.moved?.node;
 const parent=document.querySelector('#workflow-demonstration');
 if(workflowState.moved?.node===desired)return;
 if(workflowState.moved){workflowState.moved.placeholder.replaceWith(workflowState.moved.node);workflowState.moved=null;}
 if(!desired){parent.innerHTML='';return;}
 const marker=document.createComment('workflow demonstration origin');desired.before(marker);parent.innerHTML='';parent.append(desired);workflowState.moved={node:desired,placeholder:marker};
 parent.classList.toggle('is-logical',logical);
}
function workflowOpen(n,trigger=null){
 if(!workflowState.open){
  workflowState.origin={algorithm:state.algorithm,frame:state.frame,mode:state.mode};workflowState.returnFocus=trigger;workflowState.returnNode=n.id;workflowState.open=true;workflowState.stack=[];
  let dialog=document.getElementById('workflow-focus');if(!dialog){dialog=document.createElement('dialog');dialog.id='workflow-focus';dialog.className='workflow-focus';dialog.setAttribute('aria-labelledby','workflow-focus-title');document.body.append(dialog);dialog.addEventListener('cancel',ev=>{ev.preventDefault();workflowClose();});}
  const c=WorkflowContent.copy;
  dialog.innerHTML=`<header class="wf-focus-header"><button id="workflow-back">← <span>${wfEscape(c.back)}</span></button><div id="workflow-breadcrumbs"></div><div class="wf-focus-preferences"><button data-wf-lang="en" aria-label="Use English">EN</button><button data-wf-lang="zh" aria-label="使用中文">中文</button><button id="wf-theme" aria-label="${wfEscape(MT('Switch theme','切换主题'))}">◐</button><button id="workflow-close" aria-label="${wfEscape(c.close)}">×</button></div></header><div class="wf-focus-scroll"><div class="wf-focus-title"><span class="wf-eyebrow">${wfEscape(c.focus)}</span><h2 id="workflow-focus-title"></h2><p id="workflow-focus-description"></p><button id="workflow-jump-example" class="wf-jump-example">${wfEscape(MT('Jump to the worked example','跳转到数值示例'))} ↓</button></div><div class="wf-focus-grid"><section class="wf-focus-plan"><div id="workflow-focus-contract"></div><div class="wf-map" id="workflow-focus-map"></div><p id="workflow-focus-scope" class="wf-scope"></p><div id="workflow-focus-notation"></div><div id="workflow-focus-inspector" class="wf-inspector"></div></section><section class="wf-focus-example"><div class="wf-example-heading"><span class="wf-eyebrow">${wfEscape(c.example)}</span><span>${wfEscape(state.mode)}</span></div><div id="workflow-demonstration"></div></section></div></div>`;
  dialog.querySelector('#workflow-jump-example').onclick=()=>dialog.querySelector('.wf-focus-example').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  dialog.querySelector('#workflow-back').onclick=()=>workflowClose();dialog.querySelector('#workflow-close').onclick=()=>workflowClose();
  dialog.querySelectorAll('[data-wf-lang]').forEach(b=>b.onclick=()=>setLanguage(b.dataset.wfLang));dialog.querySelector('#wf-theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  document.body.classList.add('workflow-focused');dialog.showModal();if(trigger&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const a=trigger.getBoundingClientRect(),b=dialog.getBoundingClientRect();dialog.animate([{opacity:.15,transform:`translate(${(a.x+a.width/2-b.x-b.width/2)*.12}px,${(a.y+a.height/2-b.y-b.height/2)*.12}px) scale(.88)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});}
 }
 workflowDive(n);
}
function workflowDive(n){
 const current=workflowState.stack.at(-1);
 if(n.terminal){workflowChooseFrame(n);workflowState.focusUI?.select(n.id);return;}
 if(workflowState.stack.length>=4){workflowChooseFrame(n);return;}
 const t=state.topic,option=workflowState.origin.algorithm,g=WorkflowContent.detail(t,n,option,state.mode);
 workflowState.stack.push({node:n,graph:g});workflowShowLevel();
}
function workflowShowLevel(){
 const level=workflowState.stack.at(-1),dialog=document.getElementById('workflow-focus'),{node:n,graph:g}=level;
 workflowState.focusUI?.dispose();document.getElementById('workflow-focus-title').textContent=n.label;document.getElementById('workflow-focus-description').textContent=n.description;
 document.getElementById('workflow-focus-contract').innerHTML=wfContractHTML(n,true);document.getElementById('workflow-focus-scope').textContent=g.scope||'';document.getElementById('workflow-focus-notation').innerHTML=(g.notation?.length?`<details class="wf-notation"><summary>${wfEscape(WorkflowContent.copy.symbols)}</summary><dl>${g.notation.map(([s,d])=>`<dt>${wfEscape(s)}</dt><dd>${wfEscape(d)}</dd>`).join('')}</dl></details>`:'');
 const crumbs=dialog.querySelector('#workflow-breadcrumbs');crumbs.innerHTML=`<span>${wfEscape(state.topic.name)}</span>${workflowState.stack.map((l,i)=>`<span aria-hidden="true">/</span><button data-wf-level="${i}" aria-current="${i===workflowState.stack.length-1?'step':'false'}">${wfEscape(l.node.label)}</button>`).join('')}`;
 crumbs.querySelectorAll('[data-wf-level]').forEach(b=>b.onclick=()=>{workflowState.stack=workflowState.stack.slice(0,Number(b.dataset.wfLevel)+1);workflowShowLevel();});
 const inspect=child=>wfInspector(document.getElementById('workflow-focus-inspector'),child,()=>workflowDive(child));
 workflowState.focusUI=wfMountGraph(document.getElementById('workflow-focus-map'),g,child=>workflowDive(child),inspect);inspect(g.nodes[0]);
 wfMoveDemonstration(!!n.focus.logical);workflowChooseFrame(n);architectureStage.fit();semanticSpace.fit();
 dialog.querySelector('.wf-focus-scroll').scrollTo({top:0,behavior:'instant'});
 if(typeof localizePage==='function')localizePage();
}
function workflowClose(restore=true){
 if(!workflowState.open)return;const origin=workflowState.origin;workflowState.focusUI?.dispose();workflowState.focusUI=null;
 architectureStage.stop();semanticSpace.detach();tensorSpace.detach();clearTimeout(state.timer);clearTimeout(logicState.timer);state.playing=false;logicState.playing=false;
 if(workflowState.moved){workflowState.moved.placeholder.replaceWith(workflowState.moved.node);workflowState.moved=null;}
 document.getElementById('workflow-focus')?.close();document.body.classList.remove('workflow-focused');workflowState.open=false;workflowState.stack=[];
 if(restore&&origin&&state.topic){state.algorithm=origin.algorithm;state.mode=origin.mode;const select=document.getElementById('algorithm');if(select)select.value=origin.algorithm;rebuild();state.frame=Math.min(state.frames.length-1,origin.frame);renderFrame();document.querySelector('#workflow-map [data-wf-node=\"'+workflowState.returnNode+'\"]')?.focus({preventScroll:true});}
 workflowState.origin=null;
}
function updateWorkflowFrame(){
 if(!workflowState.open)return;const graph=workflowState.stack.at(-1)?.graph;if(!graph)return;
 const logical=!!workflowState.stack.at(-1).node.focus.logical,index=logical?logicState.frame:state.frame;
 const node=graph.nodes.find(n=>n.focus.frame===index&&(logical?!!n.focus.logical:n.focus.option===state.algorithm));
 if(node){workflowState.focusUI?.select(node.id);wfInspector(document.getElementById('workflow-focus-inspector'),node,()=>workflowDive(node));}
}
