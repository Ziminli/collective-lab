/* A mathematical stage: Three.js supplies tensor planes and moving operands;
   DOM labels stay sharp, selectable, localized and keyboard accessible. */
const ARCH_COPY={
 title:MT('A model, one calculation at a time','逐个计算，理解模型'),
 scope:MT('Executable miniature · B=1 · values rounded','可执行小示例 · B=1 · 数值已舍入'),
 hint:MT('Choose an output cell. Watch the source values produce it.','选择一个输出单元格，观察来源数值如何生成它。'),
 replay:MT('Replay calculation','重播计算'),step:MT('Next arithmetic step','下一算术步骤'),pause:MT('Pause calculation','暂停计算'),
 flat:MT('Flat view','平面视图'),space:MT('Tensor planes · 3D','张量平面 · 3D'),reset:MT('Reset camera','重置视角'),
 trace:MT('Selected calculation','所选计算'),topology:MT('The released structure · where this lesson fits','发布模型结构 · 本课程所处位置'),
 scopeNote:MT('The miniature executes one representative block or core. The published structure below includes additional layers and operators; select their tabs for the complete operator lessons.','小示例执行一个代表性块或核心。下方发布结构包含其他层及算子，可选相应标签查看完整算子课程。'),
 input:MT('SOURCE TENSORS','来源张量'),output:MT('RESULT','结果'),
 checkpoint:MT('Published dimensions','发布维度'),
 fallback:MT('WebGL is unavailable. The same calculations run in the flat view.','WebGL 不可用，同样的计算在平面视图运行。'),
 depth:MT('Drag gently to inspect the tensor planes. Numbers keep their tensor coordinates.','轻拖查看张量平面；数字保持各自张量坐标。'),
 history:MT('Arithmetic history','算术记录'),complete:MT('Calculation complete','计算完成')
};
class ArchitectureStage{
 constructor(){this.host=null;this.renderer=null;this.scene=null;this.root=null;this.labels=[];this.cells=new Map();this.raf=0;this.timer=0;this.view='space';this.angle=0;this.tilt=0;this.index=-1;this.selected=[0,0];this.progress=0;this.run=false;this.key='';this.motion=null;}
 detach(preserveRenderer=false){clearTimeout(this.timer);cancelAnimationFrame(this.raf);this.resize?.disconnect();this.observer?.disconnect();this.dispose(preserveRenderer);this.host=null;this.key='';if(!preserveRenderer)this.lastPositions=new Map();}
 dispose(preserveRenderer=false){if(this.root){this.root.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});this.root.clear();}if(!preserveRenderer){this.renderer?.dispose();this.renderer?.forceContextLoss();this.renderer?.domElement.remove();this.renderer=null;}this.labels=[];this.cells.clear();}
 render(f){
  const host=document.getElementById('architecture-studio');if(!host)return;const key=f.topicId+'|'+f.variant+'|'+f.mode+'|'+f.stage;
  if(this.host===host&&this.key===key){this.fit();return;}
  const previous=this.lastPositions||new Map();this.detach(true);this.host=host;this.key=key;this.frame=f;this.story=f.story;this.selected=[...(f.story.defaultCell||[0,0])];this.index=-1;this.progress=0;
  const s=f.story,d=f.model,flow=f.flow||[];
  const label=(v)=>esc(v);
  host.innerHTML=`<div class="math-anatomy"><span class="studio-eyebrow">${esc(MT('MODEL ANATOMY','模型骨架'))}</span><div class="math-anatomy-track">${flow.map((n,i)=>`<span><small>${i+1}</small><b>${esc(n.label)}</b><code>${esc(n.shape)}</code></span>`).join('')}</div>${['qwen3-next','qwen35','qwen38'].includes(f.topicId)?`<div class="math-pattern"><span>Δ → Δ → Δ → A</span><label>${esc(MT('Worked mixer','演示混合器'))} <select id="math-hybrid"><option value="delta">${esc(MT('DeltaNet · recurrent state','DeltaNet · 递归状态'))}</option><option value="attention">${esc(MT('GQA · attention','GQA · 注意力'))}</option></select></label></div>`:''}</div><section class="architecture-theater" aria-label="${label(ARCH_COPY.title)}"><div class="math-heading"><div><span class="math-eyebrow">${label(ARCH_COPY.scope)}</span><h2>${label(s.title)}</h2></div><span class="math-chapter">${String(f.stage+1).padStart(2,'0')}<small>/ ${f.total}</small></span></div><p class="math-narration">${label(s.text)}</p><div class="math-equation">${label(s.equation)}</div><div class="math-board-tools"><span>${label(ARCH_COPY.hint)}</span><div role="group" aria-label="${label(MT('Tensor presentation','张量展示方式'))}"><button data-math-view="flat" aria-pressed="${this.view==='flat'}">2D</button><button data-math-view="space" aria-pressed="${this.view==='space'}">3D</button><button id="math-camera-reset" aria-label="${label(ARCH_COPY.reset)}">↺</button></div></div><div class="math-board"><div class="math-webgl" aria-hidden="true"></div><div class="math-labels"></div><div class="math-flyers" aria-hidden="true"></div><div class="math-board-note">${label(ARCH_COPY.depth)}</div></div><div class="math-calculation"><div class="math-calc-toolbar"><div><span class="math-eyebrow">${label(ARCH_COPY.trace)}</span><select id="math-cell" aria-label="${label(MT('Output cell','输出单元格'))}">${s.panels.find(p=>p.id===s.output).values.flatMap((row,r)=>row.map((_,c)=>`<option value="${r},${c}">${label(s.panels.at(-1).name)} [${r}, ${c}]</option>`)).join('')}</select></div><div class="math-trace-buttons"><button id="math-replay" title="${label(ARCH_COPY.replay)}">↻ <span>${label(ARCH_COPY.replay)}</span></button><button id="math-pause" aria-label="${label(ARCH_COPY.pause)}">Ⅱ</button><button id="math-step" aria-label="${label(ARCH_COPY.step)}">→</button></div></div><div class="math-live-trace" role="status" aria-live="polite"></div><div class="math-trace-progress"></div><details class="math-history"><summary>${label(ARCH_COPY.history)}</summary><ol></ol></details></div><p class="math-scope-note">${label(ARCH_COPY.scopeNote)}</p><details class="math-topology"><summary>${label(ARCH_COPY.topology)}</summary><div class="math-topology-flow">${flow.map((n,i)=>`<div><small>${String(i+1).padStart(2,'0')}</small><b>${label(n.label)}</b><code>${label(n.shape)}</code><p>${label(n.text)}</p></div>`).join('')}</div></details></section>`;
  const hybrid=host.querySelector('#math-hybrid');if(hybrid){hybrid.value=architectureOptions.hybrid;hybrid.onchange=()=>{architectureOptions.hybrid=hybrid.value;state.playing=false;rebuild();};}
  this.board=host.querySelector('.math-board');this.overlay=host.querySelector('.math-labels');this.flyers=host.querySelector('.math-flyers');
  host.querySelectorAll('[data-math-view]').forEach(b=>b.onclick=()=>{this.view=b.dataset.mathView;this.build(previous);this.setCell(...this.selected);});
  host.querySelector('#math-camera-reset').onclick=()=>{this.angle=0;this.tilt=0;this.layoutLabels();};
  host.querySelector('#math-cell').onchange=e=>this.setCell(...e.target.value.split(',').map(Number));
  host.querySelector('#math-replay').onclick=()=>{this.index=-1;this.run=true;this.next();};
  host.querySelector('#math-step').onclick=()=>{this.stop();this.next(false);};
  host.querySelector('#math-pause').onclick=()=>{if(this.run)this.stop();else this.resume();};
  this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(this.board);
  this.observer=new MutationObserver(()=>this.layoutLabels());this.observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  this.build(previous);this.setCell(...this.selected);
 }
 build(previous=new Map()){
  this.stop();cancelAnimationFrame(this.raf);this.flat=this.view==='flat';this.dispose(!this.flat);this.overlay.innerHTML='';this.angle=this.flat?0:-.10;this.tilt=this.flat?0:.065;
  this.host.querySelectorAll('[data-math-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mathView===this.view)));
  if(!this.flat)try{
   if(!this.renderer)this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor(0x0d111b,0);
   this.board.querySelector('.math-webgl').append(this.renderer.domElement);this.scene=new THREE.Scene();this.root=new THREE.Group();this.scene.add(this.root);this.camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100);this.camera.position.set(0,0,20);
  }catch{this.renderer?.dispose();this.renderer=null;this.flat=true;this.view='flat';this.host.querySelectorAll('[data-math-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mathView==='flat')));this.host.querySelector('.math-board-note').textContent=ARCH_COPY.fallback;}
  this.board.classList.toggle('is-flat',this.flat);this.layout=JSON.stringify({mobile:this.board.clientWidth<560,panels:this.story.panels.length});
  this.makeMatrices(previous);this.fit();
  let drag=null;
  this.board.onpointerdown=e=>{if(this.flat||e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY};this.board.setPointerCapture(e.pointerId);};
  this.board.onpointermove=e=>{if(!drag)return;this.angle=Math.max(-.32,Math.min(.32,this.angle+(e.clientX-drag.x)*.003));this.tilt=Math.max(-.2,Math.min(.2,this.tilt-(e.clientY-drag.y)*.003));drag={x:e.clientX,y:e.clientY};this.layoutLabels();};
  this.board.onpointerup=this.board.onpointercancel=()=>drag=null;
 }
 makeMatrices(previous){
  const panels=this.story.panels,mobile=this.board.clientWidth<560,n=panels.length;
  // Three on desktop, a 2x2 arrangement for four, stacked on narrow screens.
  const cols=mobile?1:n===4?2:n,rows=Math.ceil(n/cols),cw=.64,ch=.60,gap=1.1;
  const widths=Array.from({length:cols},(_,c)=>Math.max(...panels.filter((_,i)=>i%cols===c).map(p=>p.values[0].length*cw))+.65),rowHeights=Array.from({length:rows},(_,r)=>Math.max(...panels.slice(r*cols,(r+1)*cols).map(p=>p.values.length*ch))+1.4);
  this.worldW=sumLocal(widths)+gap*(cols-1)+.8;this.worldH=sumLocal(rowHeights)+.5;
  panels.forEach((p,i)=>{
   const col=i%cols,row=Math.floor(i/cols),x=-this.worldW/2+.4+sumLocal(widths.slice(0,col))+gap*col+widths[col]/2,y=this.worldH/2-.4-sumLocal(rowHeights.slice(0,row))-rowHeights[row]/2;
   const w=p.values[0].length*cw,h=p.values.length*ch,z=this.flat?0:p.id===this.story.output?.15:0;
   const text=document.createElement('div');text.className='math-matrix-title';text.innerHTML=`<b>${esc(p.name)}</b><span>[${p.shape}]</span>`;text.style.color=p.color;this.overlay.append(text);this.labels.push({el:text,x,y:y+h/2+.53,z});
   const sub=document.createElement('span');sub.className='math-matrix-role';sub.textContent=p.role==='cache'?MT('PERSISTENT CACHE','持久缓存'):p.id===this.story.output?ARCH_COPY.output:ARCH_COPY.input;this.overlay.append(sub);this.labels.push({el:sub,x,y:y-h/2-.35,z});
   p.values.forEach((r,ri)=>r.forEach((val,ci)=>{
    const px=x+(ci-(r.length-1)/2)*cw,py=y+((p.values.length-1)/2-ri)*ch,k=p.id+':'+ri+':'+ci;
    const b=document.createElement(p.id===this.story.output?'button':'span');b.className='math-cell'+(p.id===this.story.output?' math-output':'');b.textContent=this.number(val);b.style.setProperty('--tensor',p.color);b.dataset.cell=k;b.dataset.value=String(val);b.dataset.noI18n='';
    if(b.tagName==='BUTTON'){b.setAttribute('aria-label',`${p.name} [${ri},${ci}] = ${MathLesson.fmt(val)}`);b.onclick=()=>this.setCell(ri,ci);}
    this.overlay.append(b);
    const item={el:b,x:px,y:py,z,value:val,color:p.color,key:k,from:previous.get(k)};this.labels.push(item);this.cells.set(k,item);
    if(this.root){
     const geo=new THREE.BoxGeometry(cw*.90,ch*.88,.07),mat=new THREE.MeshBasicMaterial({color:p.color,transparent:true,opacity:p.id===this.story.output?.13:.065});const mesh=new THREE.Mesh(geo,mat);mesh.position.set(px,py,z);this.root.add(mesh);
     const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:p.color,transparent:true,opacity:.36}));edges.position.copy(mesh.position);this.root.add(edges);item.mesh=mesh;item.edges=edges;
    }
   }));
  });
  this.lastPositions=new Map([...this.cells].map(([k,v])=>[k,{x:v.x,y:v.y,z:v.z}]));
  this.birth=performance.now();this.tick();
 }
 fit(){
  if(!this.host)return;const mobile=this.board.clientWidth<560,layout=JSON.stringify({mobile,panels:this.story.panels.length});
  if(this.layout!==layout){this.build();this.setCell(...this.selected);return;}
  const w=this.board.clientWidth,h=mobile?this.worldH*49+40:Math.max(275,Math.min(490,this.worldH*43+20));this.board.style.height=Math.ceil(h)+'px';
  if(this.renderer){this.renderer.setSize(w,h,false);const aspect=w/h,viewW=Math.max(this.worldW,this.worldH*aspect),viewH=viewW/aspect;this.camera.left=-viewW/2;this.camera.right=viewW/2;this.camera.top=viewH/2;this.camera.bottom=-viewH/2;this.camera.updateProjectionMatrix();}
  this.layoutLabels();
 }
 position(x,y,z){
  const w=this.board.clientWidth,h=this.board.clientHeight;
  if(this.renderer){const v=new THREE.Vector3(x,y,z).applyEuler(this.root.rotation).project(this.camera);return{x:(v.x+1)*w/2,y:(1-v.y)*h/2};}
  const sc=Math.min((w-12)/this.worldW,(h-14)/this.worldH);return{x:w/2+x*sc,y:h/2-y*sc};
 }
 layoutLabels(){
  if(!this.host)return;if(this.root)this.root.rotation.set(this.tilt,this.angle,0);
  const sc=Math.min((this.board.clientWidth-12)/this.worldW,(this.board.clientHeight-14)/this.worldH),font=Math.max(11,Math.min(16,sc*.20));
  for(const l of this.labels){const transition=matchMedia('(prefers-reduced-motion:reduce)').matches?1:Math.min(1,(performance.now()-this.birth)/750),e=1-Math.pow(1-transition,3),xx=l.from?l.from.x+(l.x-l.from.x)*e:l.x,yy=l.from?l.from.y+(l.y-l.from.y)*e:l.y;const p=this.position(xx,yy,l.z);if(l.mesh){l.mesh.position.set(xx,yy,l.z);l.edges.position.copy(l.mesh.position);}l.el.style.left=p.x+'px';l.el.style.top=p.y+'px';if(l.key){l.el.style.width=Math.max(27,sc*.59)+'px';l.el.style.height=Math.max(25,sc*.54)+'px';l.el.style.fontSize=font+'px';}}
  this.renderer?.render(this.scene,this.camera);
 }
 number(v){return Number.isFinite(v)?String(+v.toFixed(2)):'−∞';}
 resume(){if(this.motion?.pausedAt){this.motion.start+=performance.now()-this.motion.pausedAt;delete this.motion.pausedAt;this.run=true;this.host.querySelector('#math-pause').textContent='Ⅱ';if(this.index<this.trace.length-1)this.timer=setTimeout(()=>this.next(),1850/(state.speed||1));}else{this.run=true;if(this.index>=this.trace.length-1)this.index=-1;this.next();}}
 setCell(r,c){
  this.stop();this.selected=[r,c];this.index=-1;this.trace=this.story.trace(r,c);this.host.querySelector('#math-cell').value=r+','+c;
  this.cells.forEach(l=>{l.el.classList.remove('is-source','is-selected','is-arrived');if(l.key.startsWith(this.story.output+':'))l.el.textContent=this.number(l.value);});
  this.destination=this.cells.get(this.story.output+':'+r+':'+c);this.destination?.el.classList.add('is-selected');
  this.host.querySelector('.math-history ol').innerHTML=this.trace.map(t=>`<li><code>${esc(t.formula)}</code></li>`).join('');
  this.host.querySelector('.math-trace-progress').innerHTML=this.trace.map(()=>'<i></i>').join('');
  this.run=!matchMedia('(prefers-reduced-motion:reduce)').matches;this.next(this.run);
 }
 stop(){clearTimeout(this.timer);this.run=false;if(this.motion&&!this.motion.pausedAt)this.motion.pausedAt=performance.now();if(this.host)this.host.querySelector('#math-pause')?.setAttribute('aria-pressed','false');}
 next(animate=this.run){
  clearTimeout(this.timer);if(!this.host)return;
  this.index=Math.min(this.trace.length-1,this.index+1);const t=this.trace[this.index],last=this.index===this.trace.length-1;
  this.cells.forEach(l=>{l.el.classList.remove('is-source');if(l.mesh)l.mesh.material.opacity=l.key.startsWith(this.story.output+':')?.13:.065;});
  const refs=t.refs||[];for(const r of refs){const l=this.cells.get(r.p+':'+r.r+':'+r.c);if(l){l.el.classList.add('is-source');if(l.mesh)l.mesh.material.opacity=.28;}}
  const live=this.host.querySelector('.math-live-trace');live.textContent=t.formula;live.dataset.complete=String(last);
  const sourceCells=refs.map(r=>this.cells.get(r.p+':'+r.r+':'+r.c)).filter(Boolean).slice(0,2),values=t.operands?.length?t.operands:sourceCells.map(l=>l.value);
  if(this.destination){this.destination.el.textContent=last?(animate?'?':this.number(this.destination.value)):'?';this.destination.el.classList.toggle('is-arrived',last&&!animate);}
  this.flyers.innerHTML='';this.motion=null;
  if(animate&&values.length){
   const actors=values.slice(0,2).map((v,i)=>{const l=sourceCells[i]||sourceCells[0]||this.destination,el=document.createElement('span');el.className='math-operand';el.textContent=MathLesson.fmt(v);el.style.color=l?.color||'#fff';this.flyers.append(el);return{el,from:l||{x:0,y:0,z:0},i};});
   const acc=document.createElement('span');acc.className='math-accumulator';acc.textContent=(last||!['multiply','convolution','experts'].includes(this.story.operation)?'= ':'Σ ')+MathLesson.fmt(t.value);this.flyers.append(acc);
   this.motion={start:performance.now(),actors,last,value:t.value,acc};
  }else if(last)this.reveal();
  this.host.querySelectorAll('.math-trace-progress i').forEach((n,i)=>n.classList.toggle('past',i<=this.index));
  this.host.querySelector('#math-pause').textContent=this.run?'Ⅱ':'▶';this.host.querySelector('#math-pause').setAttribute('aria-pressed',String(this.run));
  this.host.querySelector('#math-step').disabled=last;
  if(this.run&&!last)this.timer=setTimeout(()=>this.next(),1850/(state?.speed||1));else if(last)this.run=animate&&!!this.motion;
  this.layoutLabels();
 }
 reveal(){if(!this.destination)return;this.destination.el.textContent=this.number(this.destination.value);this.destination.el.classList.add('is-arrived');}
 tick(){
  if(!this.host)return;
  if(performance.now()-this.birth<800)this.layoutLabels();
  if(this.motion&&!this.motion.pausedAt&&!document.hidden){
   const speed=window.labSpeed||1,p=Math.min(1,(performance.now()-this.motion.start)*speed/1550),travel=Math.min(1,p/.55),ease=travel<.5?2*travel*travel:1-Math.pow(-2*travel+2,2)/2;
   this.motion.actors.forEach(({el,from,i})=>{const a=this.position(from.x,from.y,from.z),b={x:this.board.clientWidth/2+(i?34:-34),y:this.board.clientHeight-24};el.style.left=(a.x+(b.x-a.x)*ease)+'px';el.style.top=(a.y+(b.y-a.y)*ease-Math.sin(p*Math.PI)*30)+'px';el.style.opacity=p>.5?String(Math.max(0,1-(p-.5)/.15)):'1';});
   const acc=this.motion.acc,from={x:this.board.clientWidth/2,y:this.board.clientHeight-24},dest=this.destination?this.position(this.destination.x,this.destination.y,this.destination.z):from,t=this.motion.last?Math.max(0,(p-.72)/.28):0;acc.style.left=(from.x+(dest.x-from.x)*t)+'px';acc.style.top=(from.y+(dest.y-from.y)*t)+'px';acc.style.opacity=String(Math.min(1,Math.max(0,(p-.52)/.13)));
   if(p===1){if(this.motion.last){this.run=false;this.reveal();this.host.querySelector('#math-pause').textContent='▶';}this.motion=null;this.flyers.innerHTML='';}
  }
  this.raf=requestAnimationFrame(()=>this.tick());
 }
}
function sumLocal(a){return a.reduce((s,v)=>s+v,0);}
const architectureStage=new ArchitectureStage();
function renderArchitectureStudio(f){
 const active=!!f?.story;document.body.classList.toggle('has-math-story',active);
 const host=document.querySelector('#architecture-studio');if(!host)return;
 host.hidden=!active;
 if(active&&!(typeof workflowIsOverview==='function'&&workflowIsOverview()))architectureStage.render(f);else{architectureStage.detach();host.innerHTML='';}
}

document.addEventListener('visibilitychange',()=>{if(!architectureStage.host)return;if(document.hidden){architectureStage.background=architectureStage.run||!!architectureStage.motion;architectureStage.stop();}else if(architectureStage.background){architectureStage.background=false;architectureStage.resume();}});
