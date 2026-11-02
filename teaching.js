/* A concrete contract before notation, a selected-step navigator, and a self-check after it. */
const studioState={view:'diagram',sceneKey:'',quiz:new Map(),selection:null};
function studioText(en,zh){return MT(en,zh);}
const STUDIO_COPY={
 start:MT('Start with the idea','先理解核心想法'),input:MT('What you start with','初始条件'),action:MT('What changes','发生的变换'),output:MT('What you get','得到的结果'),
 diagram:MT('Diagram','二维图解'),space:MT('GPU & tensor space','GPU 与张量空间'),steps:MT('Follow the steps','逐步追踪'),inspect:MT('Inspect the data','查看数据'),check:MT('Check your understanding','检查理解'),
 select:MT('Select a matrix/buffer cell or a highlighted block to inspect it.','选择矩阵 / 缓冲单元格或高亮模块，查看其含义。'),rotate:MT('Drag to orbit · select a tile to inspect','拖动旋转 · 选择色块查看'),
 zoomIn:MT('Zoom in','放大'),zoomOut:MT('Zoom out','缩小'),reset:MT('Reset camera','重置视角'),fullscreen:MT('Expand the visual','展开可视化'),close:MT('Exit expanded view','退出展开视图')
};
function teachingGuide(t,view=null){
 if(view?.op){const op=MODEL_OPERATORS[view.op];if(TEACHING_GUIDES[op.scene]){const guide={...TEACHING_GUIDES[op.scene]};if(op.scene==='rwkv'&&view.layout==='RWKV-6')guide.action=MT('Decay the matrix state, then add the current value–key outer product.','衰减矩阵状态，再加入当前值与键的外积。');if(op.scene==='diffusion'&&state.mode==='Training'){guide.before=MT('Clean training data, a sampled time and noise.','干净训练数据、采样时间及噪声。');guide.action=MT('Corrupt/interpolate the data and learn the selected noise or velocity target.','扰动或插值数据，学习所选噪声或速度目标。');guide.after=MT('A prediction loss and gradients for the denoiser weights.','预测损失及去噪器权重的梯度。');}return guide;}}
 if(TEACHING_GUIDES[t.id])return TEACHING_GUIDES[t.id];
 if(t.curriculum){
  const d=t.modelData,flow=view?.flow||d.flow,first=flow?.[0],last=flow?.at(-1),isModel=t.section==='models',kind=d.kind;
  const output=view?.layout==='Encoder-only'?MT('A contextual representation at every input position, followed by the chosen task head.','每个输入位置的上下文表示，再进入所选任务输出头。'):kind==='diffusion'?state.mode==='Training'?MT('A noise/velocity prediction loss for one sampled time.','某个采样时间的噪声或速度预测损失。'):MT('A generated image; the denoiser is reused across sampler steps.','生成图像；去噪器跨采样步复用。'):kind==='public'?MT('Documented outputs; the internal layer graph is not public.','公开文档说明的输出；内部层图未公开。'):kind==='cnn'||kind==='vit'?MT('Task predictions or visual representations, depending on the head.','按输出头配置得到任务预测或视觉表示。'):MT('Vocabulary scores and the state needed for the next token.','词表评分及下一个 token 所需的状态。');
  const correct=kind==='diffusion'?MT('The same denoiser weights are reused.','复用同一去噪器权重。'):kind==='public'?MT('Only published facts support a specific architecture claim.','具体架构断言只能以公开事实支持。'):MT('The page’s named reference checkpoint.','本页明确命名的参考检查点。');
  const wrong=kind==='diffusion'?MT('Every sampling step learns a new model.','每个采样步学习一个新模型。'):kind==='public'?MT('An API model name reveals its exact expert topology.','API 模型名揭示其精确专家拓扑。'):MT('Every model with the same family name has identical dimensions.','同一家族名下所有模型维度均完全相同。');
  const question=kind==='diffusion'?MT('What happens to weights between image sampling steps?','图像采样步骤之间，权重如何变化？'):kind==='public'?MT('Which architecture statements are justified?','哪些架构陈述有依据？'):MT('What do the published dimensions on this page describe?','本页公开维度描述什么？');
  const architectureChecks={
   transformer:[MT('Can an earlier causal-decoder position read future target tokens?','因果解码器的较早位置能读取未来目标 token 吗？'),MT('No: the causal mask blocks future target positions.','不能：因果掩码屏蔽未来目标位置。'),MT('Yes: training makes every target token visible.','能：训练让每个目标 token 都可见。'),MT('Teacher forcing supplies target inputs in parallel, but causal visibility still prevents future-token leakage. Encoder-only attention follows a different mask.','Teacher forcing 可并行提供目标输入，但因果可见性仍防止未来 token 泄漏；仅编码器注意力采用另一种掩码。')],
   moe:[TEACHING_GUIDES.routing.question,...TEACHING_GUIDES.routing.answers,TEACHING_GUIDES.routing.why],
   rwkv:[TEACHING_GUIDES.rwkv.question,...TEACHING_GUIDES.rwkv.answers,TEACHING_GUIDES.rwkv.why],
   ssm:[MT('Does processing the next token require every earlier hidden vector to stay in the recurrent state?','处理下一 token 是否需要在递归状态中保留每个历史隐藏向量？'),MT('No: the recurrent state summarizes the history.','不需要：递归状态概括历史。'),MT('Yes: the state is a growing list of past vectors.','需要：状态是不断增长的历史向量列表。'),MT('A fixed-shape state updates from the previous state and current input. This differs from keeping every historical attention key and value.','固定形状状态由旧状态及当前输入更新，这与保存每个历史注意力键和值不同。')],
   diffusion:[question,correct,wrong,MODEL_IMAGE_INFERENCE],
   cnn:[MT('Does the kernel learn a separate weight for every image location?','卷积核是否为每个图像位置学习独立权重？'),MT('No: one kernel is shared across locations.','不会：同一卷积核在不同位置共享。'),MT('Yes: sliding creates new parameters at each position.','会：滑动会在每个位置创建新参数。'),TEACHING_GUIDES.conv.why],
   vit:[MT('Can one patch representation read a distant patch in global self-attention?','全局自注意力中，一个 patch 表示能读取远处 patch 吗？'),MT('Yes: attention connects visible patch positions.','可以：注意力连接可见 patch 位置。'),MT('No: it is restricted to a fixed local convolution window.','不可以：它被限制在固定局部卷积窗口。'),MT('Patch embedding creates a token sequence; global attention then mixes positions, while the FFN mixes features separately at each position.','patch 嵌入生成 token 序列；全局注意力混合位置，FFN 则分别混合每个位置的特征。')]
  };
  if(!isModel&&architectureChecks[kind]){const [q,a,b,reason]=architectureChecks[kind];return{problem:d.description||t.description,before:first?.text||t.lede,action:view?.flow?flow.slice(1,-1).map(n=>n.label).join(' → '):d.lede||t.lede,after:output,question:q,answers:[a,b],why:reason};}
  return {problem:d.description||t.description,before:first?.text||t.lede,action:view?.flow?flow.slice(1,-1).map(n=>n.label).join(' → '):d.lede||t.lede,after:output,question,answers:[correct,wrong],why:kind==='diffusion'?MODEL_IMAGE_INFERENCE:MODEL_COMMON_SCOPE};
 }
 return null;
}
function teachingIntro(t){const g=teachingGuide(t,t.curriculum?t.modelViews[t.variants[0]]:null);if(!g)return'';
 return `<section class="idea-brief" aria-label="${esc(STUDIO_COPY.start)}"><div class="idea-top"><span class="studio-eyebrow">${esc(STUDIO_COPY.start)}</span><p>${esc(g.problem)}</p></div><div class="idea-flow">${[['01',STUDIO_COPY.input,g.before],['02',STUDIO_COPY.action,g.action],['03',STUDIO_COPY.output,g.after]].map(([n,label,text])=>`<article><span class="idea-index">${n}</span><h2>${esc(label)}</h2><p>${esc(text)}</p></article>`).join('')}</div></section>`;
}
function studioToolbar(t){return `<div class="studio-toolbar"><div class="studio-view-switch" role="group" aria-label="${esc(MT('Visualization view','可视化视图'))}"><button data-studio-view="diagram" aria-pressed="true">${icons.use}<span>${esc(STUDIO_COPY.diagram)}</span></button>${spatialSupported(t)?`<button data-studio-view="space" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7zm0 0v10m9-5-9 5-9-5m9 5v10"/></svg><span>${esc(STUDIO_COPY.space)}</span><span class="new-view">3D</span></button>`:''}</div><button class="studio-expand" id="studio-expand" aria-pressed="false" aria-label="${esc(STUDIO_COPY.fullscreen)}">⤢</button></div><div id="step-rail" class="step-rail" role="group" aria-label="${esc(STUDIO_COPY.steps)}"></div>`;}
function spatialPanel(){return `<div id="tensor-space" class="tensor-space" hidden><div class="spatial-top"><span>${esc(STUDIO_COPY.rotate)}</span><div class="spatial-camera"><button data-camera="in" aria-label="${esc(STUDIO_COPY.zoomIn)}">+</button><button data-camera="out" aria-label="${esc(STUDIO_COPY.zoomOut)}">−</button><button data-camera="reset" aria-label="${esc(STUDIO_COPY.reset)}">↺</button></div></div><div class="spatial-bottom"><p id="spatial-note"></p><p id="spatial-inspector" aria-live="polite"></p></div><details class="spatial-data"><summary>${esc(MT('Read tensor data','读取张量数据'))}</summary><ul id="spatial-data"></ul></details></div>`;}
function teachingCheck(t){return `<section class="knowledge-check" aria-labelledby="check-title"><div class="check-intro"><span class="studio-eyebrow">${esc(MT('Make it click','真正理解'))}</span><h2 id="check-title">${esc(STUDIO_COPY.check)}</h2><p>${esc(MT('Predict the answer before revealing the reasoning.','先预测答案，再查看原因。'))}</p></div><div id="check-question"></div></section>`;}
function bindStudio(){
 document.querySelectorAll('[data-studio-view]').forEach(b=>b.addEventListener('click',()=>setStudioView(b.dataset.studioView)));
 $('#step-rail')?.addEventListener('click',ev=>{const b=ev.target.closest('[data-step]');if(!b)return;state.playing=false;state.frame=Number(b.dataset.step);renderFrame();schedule();});
 $('#studio-expand')?.addEventListener('click',()=>{const card=document.querySelector('.study-grid>.visual-card'),on=card.classList.toggle('studio-expanded');document.body.classList.toggle('studio-expanded-body',on);$('#studio-expand').setAttribute('aria-pressed',String(on));$('#studio-expand').setAttribute('aria-label',on?STUDIO_COPY.close:STUDIO_COPY.fullscreen);tensorSpace.fit();});
 document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>{b.dataset.camera==='reset'?tensorSpace.reset():tensorSpace.zoom(b.dataset.camera==='in'?-1.3:1.3);}));
 $('#diagram')?.addEventListener('click',ev=>inspectDiagram(ev.target));
 $('#diagram')?.addEventListener('keydown',ev=>{if(['Enter',' '].includes(ev.key)&&ev.target.matches('[data-inspect]')){ev.preventDefault();inspectDiagram(ev.target);}});
 $('#check-question')?.addEventListener('click',ev=>{const b=ev.target.closest('[data-answer]');if(!b)return;const key=state.topic.id+'|'+state.algorithm;studioState.quiz.set(key,Number(b.dataset.answer));renderCheck();if(typeof localizePage==='function')localizePage();});
}
function setStudioView(view){
 const supported=spatialSupported(state.topic),spatial=view==='space'&&supported;studioState.view=spatial?'space':'diagram';$('#legend').innerHTML=legend();
 const host=$('#tensor-space');$('#diagram').hidden=spatial;host.hidden=!spatial;$('#data-inspector').hidden=spatial;
 document.querySelectorAll('[data-studio-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.studioView===studioState.view)));
 if(spatial){if(!tensorSpace.mount(host)){studioState.view='diagram';host.hidden=true;$('#diagram').hidden=false;$('#data-inspector').hidden=false;document.querySelector('[data-studio-view="diagram"]').setAttribute('aria-pressed','true');document.querySelector('[data-studio-view="space"]').setAttribute('aria-pressed','false');toast(MT('3D is unavailable here. The full diagram remains interactive.','此环境无法显示 3D；完整二维图解仍可交互。'));return;}tensorSpace.reset();tensorSpace.update(state.frames[state.frame],state.topic,true);}else tensorSpace.detach();
 if(typeof localizePage==='function')localizePage();
}
function updateStudioLesson(){
 const rail=$('#step-rail');if(!rail)return;
 rail.innerHTML=state.frames.map((f,i)=>`<button class="step-stop" data-step="${i}" aria-pressed="${i===state.frame}" title="${esc(f.title)}"><span>${String(i+1).padStart(2,'0')}</span><span>${esc(f.title)}</span></button>`).join('');
 // Intuition and the self-check follow the selected operator, just like the formula.
 const t=state.topic,g=teachingGuide(t,t.curriculum?t.modelViews[state.algorithm]:null);if(g){const flow=document.querySelector('.idea-flow');if(flow){flow.querySelectorAll('article p').forEach((p,i)=>p.textContent=[g.before,g.action,g.after][i]);document.querySelector('.idea-top p').textContent=g.problem;}}
 renderCheck();
}
function renderCheck(){const host=$('#check-question');if(!host)return;const t=state.topic,g=teachingGuide(t,t.curriculum?t.modelViews[state.algorithm]:null);if(!g){host.innerHTML='';return;}
 const answer=studioState.quiz.get(t.id+'|'+state.algorithm),answered=answer!==undefined,swap=t.id.length%2,choices=swap?[1,0]:[0,1];
 host.innerHTML=`<h3>${esc(g.question)}</h3><div class="answer-options">${choices.map(i=>`<button data-answer="${i}" class="${answered&&i===0?'is-correct':''} ${answered&&i===answer&&i!==0?'is-incorrect':''}" aria-pressed="${answer===i}"><span>${answered&&i===0?'✓':answered&&i===answer?'↺':String.fromCharCode(65+choices.indexOf(i))}</span>${esc(g.answers[i])}</button>`).join('')}</div>${answered?`<div class="answer-reason" role="status"><strong>${esc(answer===0?MT('Exactly. Here is why.','正确，原因如下。'):MT('Follow the distinction.','注意这个区别。'))}</strong><p>${esc(g.why)}</p></div>`:''}`;
}
function updateStudioFrame(){
 const f=state.frames[state.frame];if(!f)return;
 document.querySelectorAll('.step-stop').forEach((b,i)=>{const active=i===state.frame;b.classList.toggle('is-past',i<state.frame);b.setAttribute('aria-pressed',String(active));if(active&&state.playing){const rail=b.parentElement,left=b.offsetLeft-rail.offsetLeft;if(left<rail.scrollLeft||left+b.offsetWidth>rail.scrollLeft+rail.clientWidth)rail.scrollTo({left:Math.max(0,left-12),behavior:motionReduced()?'instant':'smooth'});}});
 const current=document.querySelectorAll('.explain-step');current.forEach(el=>el.classList.toggle('current-explanation',el.querySelector('h3')?.textContent.trim()===f.title));
 if(studioState.view==='space'&&spatialSupported(state.topic)&&tensorSpace.host)tensorSpace.update(f,state.topic);
 prepareDiagramInspection();
}
function prepareDiagramInspection(){
 const svg=$('#diagram svg');if(!svg)return;
 for(const matrix of svg.querySelectorAll('[data-model-matrix],[data-matrix]')){
  const name=matrix.dataset.modelMatrix||matrix.dataset.matrix;
  matrix.querySelectorAll('rect').forEach((cell,i)=>{cell.dataset.inspect='matrix';cell.dataset.matrixName=name;cell.dataset.cellIndex=i;cell.setAttribute('tabindex','0');cell.setAttribute('role','button');cell.setAttribute('aria-label',MT('Inspect '+name+' cell '+i,'查看 '+name+' 第 '+i+' 个单元格'));});
 }
 for(const group of svg.querySelectorAll('[data-rank-buffer]'))group.querySelectorAll('rect').forEach((cell,i)=>{cell.dataset.inspect='buffer';cell.dataset.rank=group.dataset.rankBuffer;cell.dataset.cellIndex=i;cell.setAttribute('tabindex','0');cell.setAttribute('role','button');cell.setAttribute('aria-label',MT('Inspect rank '+group.dataset.rankBuffer+' buffer position '+i,'查看 rank '+group.dataset.rankBuffer+' 缓冲位置 '+i));});
 for(const box of svg.querySelectorAll('.node-shell.highlight-shell,.model-active'))if(box.tagName==='rect'){box.dataset.inspect='block';box.setAttribute('tabindex','0');box.setAttribute('role','button');box.setAttribute('aria-label',MT('Explain the highlighted computation','解释高亮计算'));}
 const inspector=$('#inspection-copy');if(inspector&&!studioState.selection)inspector.textContent=STUDIO_COPY.select;
}
function inspectDiagram(target){
 const cell=target.closest('[data-inspect]');const box=target.matches('.node-shell')?target:null;if(!cell&&!box)return;const host=$('#inspection-copy');if(!host)return;
 $('#diagram').querySelectorAll('.inspected-cell').forEach(n=>n.classList.remove('inspected-cell'));(cell||box).classList.add('inspected-cell');
 if(cell?.dataset.inspect==='buffer'){const rank=Number(cell.dataset.rank),index=Number(cell.dataset.cellIndex),raw=state.frames[state.frame].values[rank][index],value=raw&&typeof raw==='object'?raw.text:raw;host.textContent=MT('Rank '+rank+', buffer position '+index+': '+(value??'∅')+'. '+state.frames[state.frame].text,'rank '+rank+'，缓冲位置 '+index+'：'+(value??'∅')+'。'+translateChinese(state.frames[state.frame].text));}
 else if(cell?.dataset.inspect==='block')host.textContent=state.frames[state.frame].text;
 else if(cell){const parent=cell.closest('[data-model-matrix],[data-matrix]'),name=parent.dataset.modelMatrix||parent.dataset.matrix,index=Number(cell.dataset.cellIndex),cols=Number(parent.dataset.cols),row=Math.floor(index/cols),col=index%cols;let value;
  if(parent.dataset.values)value=JSON.parse(parent.dataset.values)[row]?.[col];else{const texts=[...parent.querySelectorAll('.matrix-value')];value=texts[index]?.textContent??'—';}
  let text=MT('Tensor '+name+': row '+row+', column '+col+'. Value = '+value+'.','张量 '+name+'：第 '+row+' 行、第 '+col+' 列，值 = '+value+'。');
  const scene=state.frames[state.frame].scene;
  if(scene==='attention'||scene==='flash'){
   if(name==='K')text+=MT(' This key feature helps score relevance; it is not the value being averaged.',' 此键特征用于计算相关度，不是被加权平均的值。');
   else if(name==='V')text+=MT(' Multiply this value feature by its position’s attention weight, then sum over positions.',' 将该值特征乘以其位置的注意力权重，再沿位置求和。');
   else if(name==='Softmax weights')text+=MT(' All weights in this query row sum to one; each multiplies the corresponding V row.',' 本查询行全部权重和为一，各自乘对应的 V 行。');
  }
  host.textContent=text;
 }else host.textContent=state.frames[state.frame].text;
 studioState.selection=true;if(typeof localizePage==='function')localizePage();
}
window.addEventListener('keydown',ev=>{if(ev.key==='Escape'){document.querySelector('.studio-expanded')?.classList.remove('studio-expanded');document.body.classList.remove('studio-expanded-body');$('#studio-expand')?.setAttribute('aria-pressed','false');$('#studio-expand')?.setAttribute('aria-label',STUDIO_COPY.fullscreen);tensorSpace.fit();}});
