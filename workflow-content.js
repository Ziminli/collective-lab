/* Workflow graphs describe real tensor dependencies. Small numerical examples
   remain separate from published checkpoint shapes and from cost-model units. */
const WorkflowContent=(()=>{
 const L=(en,zh)=>MT(en,zh);
 const copy={
  overview:L('The whole workflow','完整工作流'),hint:L('Hover or focus a step to inspect it. Click to open it.','悬停或聚焦步骤以查看信息，点击可独立展开。'),
  input:L('Input','输入'),output:L('Output','输出'),action:L('Action','执行动作'),equation:L('Calculation','计算'),attributes:L('Shapes & attributes','形状与属性'),
  open:L('Open this step','展开此步骤'),back:L('Back to the whole workflow','返回完整工作流'),close:L('Close focused view','关闭独立视图'),
  focus:L('Focused workflow','独立工作流'),example:L('Worked example','数值示例'),notes:L('Full explanations, comparisons & sources','完整说明、比较与来源'),
  symbols:L('Read the shapes','理解形状'),return:L('Return one level','返回上一级'),explore:L('Explore the steps','探索各个步骤'),
  boundary:L('Workflow boundaries','工作流边界'),more:L('Expand the highlighted step to see its internal workflow and numerical example.','展开高亮步骤，查看内部工作流和数值示例。'),
  parent:L('Where this fits','在整体中的位置'),data:L('Data dependency','数据依赖'),state:L('Retained state / reuse','保留状态 / 复用'),residual:L('Residual / bypass','残差 / 旁路'),
  overviewOnly:L('Documented interface; internal operators are undisclosed.','此处仅为公开接口；内部算子未公开。'),
  layer:L('Representative block','代表性模型块'),repeat:L('Repeat with separate layer weights','各层以独立权重重复'),
 };
 const tensor=(name,shape,attributes='')=>({name,shape,attributes});
 const node=(id,label,zh,input,output,description,zdesc,equation='',extra={})=>({id,label:L(label,zh),input,output,description:L(description,zdesc),equation,...extra});
 const E=(from,to,label='',type='data')=>({from,to,label,type});
 const list=(name,shape,attr='')=>[tensor(name,shape,attr)];
 const edgeLabel=n=>n.output.map(t=>t.shape).filter(Boolean).join(' + ');
 function chain(id,title,nodes,extra={}){return{id,title,nodes,edges:nodes.slice(1).map((n,i)=>E(nodes[i].id,n.id)),input:nodes[0].input,output:nodes.at(-1).output,...extra};}
 const SHAPES={
  'Ts':'[B,Ts]','Tt':'[B,Tt]','Ts × D':'[B,Ts,D]','Tt × D':'[B,Tt,D]','Tt × V':'[B,Tt,V]','Tt × Ts':'[B,Hq,Tt,Ts]','ε or xdata−z':'[B,C,H,W]',
  'T':'[B,T]','T × D':'[B,T,D]','T × V':'[B,T,V]','D → V':'[B,T,V]','V → 1':'[B,1]','D → F → D':'[B,T,D]',
  'Tq × Tk':'[B,Hq,Tq,Tk]','H × d':'[B,T,Hq,d]','K,V':'K [B,Hkv,S,dk], V [B,Hkv,S,dv]','xdata':'[B,C,H,W]',
  'xₜ':'[B,C,H,W]','image / latent':'[B,C,H,W]','εθ / vθ':'[B,C,H,W]','t, ε / z':'t scalar; ε,z [B,C,H,W]',
  'ℒ = ‖pred−target‖²':'scalar loss ℒ','features / logits':'[B,T,D] / [B,T,V]'
 };
 const shape=s=>SHAPES[s]||s||'—';
 function optionFor(t,key,layout){return Object.entries(t.modelViews||{}).find(([name,v])=>v.op===key&&(!layout||v.layout===layout))?.[0]||null;}
 function operatorKey(t,n){
  const q=n.label.toLowerCase(),ops=t.modelData.operators||[];
  if(/residual|add \+/.test(q))return null;
  const has=k=>ops.includes(k)?k:null;
  if(/engram|hash/.test(q))return has('engram');if(/speculat|draft|verify/.test(q))return has('speculative-decoding');
  if(/mhc|hyper|streams/.test(q))return has('hyper-connections');if(/shared.*kv|cross.*layer|encoder memory|shared memory/.test(q))return has('cross-layer-kv');
  if(/csa|hca|compress/.test(q))return has('compressed-attention')||has('mla');
  if(/dsa|indexer|sparse/.test(q))return has('sparse-attention');if(/mla/.test(q))return has('mla');
  if(/delta/.test(q))return has('gated-delta');if(/rwkv|time.mix|matrix state/.test(q))return has('rwkv-state');
  if(/mamba|ssm|state.space|ssd/.test(q))return has('state-space');
  if(/moe|router|expert/.test(q))return has('moe-routing');if(/swiglu|gelu|ffn|feed.forward|channel.mix/.test(q))return has('feed-forward');
  if(/norm/.test(q))return has('normalization');if(/rope|position/.test(q))return has('rope');
  if(/conv|u.net/.test(q))return has('convolution');if(/scheduler|denois|sampling|noise|velocity/.test(q))return has('diffusion-step');
  if(/attention|gqa|mqa|mha/.test(q))return has('attention');return null;
 }
 function model(t,option,mode){
  const view=t.modelViews[option],d=t.modelData;
  let flow=d.kind==='diffusion'&&mode==='Training'?diffusionTrainingFlow(d):view.flow||d.flow;
  flow=flow.map(n=>({...n}));
  const ffn=flow.findIndex(n=>/^(swiglu|gelu|moe|ffn|feed.forward|channel.mix)/i.test(n.label));
  if(ffn>0&&flow.slice(0,ffn).some(n=>/residual/i.test(n.label))&&!/residual/i.test(flow[ffn+1]?.label||''))flow.splice(ffn+1,0,{label:L('Add FFN residual','加上 FFN 残差'),shape:'T × D',title:'Complete one residual block',text:L('Add the FFN/MoE branch to its input residual. This closes one block before repeating the layer stack.','将 FFN / MoE 分支加回其输入残差，完成一个块后再重复层堆栈。'),secondResidual:true});
  const combined=flow.findIndex(n=>/norm.*(lm|head)/i.test(n.label));
  if(combined>=0){const n=flow[combined];flow.splice(combined,1,{...n,label:L('Final normalization','最终归一化'),shape:'T × D'},{...n,label:L('Vocabulary projection','词表投影'),shape:'T × V',title:'Predict the next token',text:L('Project D hidden features to V vocabulary logits at each position. This is a learned linear head.','在各位置将 D 维隐藏特征投影为 V 个词表 logit，这是学习到的线性输出头。')});}
  if(mode==='Training')flow=flow.map(n=>/next token|sample token/i.test(n.label)?{...n,label:L('Token probabilities','token 概率'),shape:'T × V',text:L('Teacher forcing computes predictions for each valid target position; the next step compares them with shifted labels.','Teacher forcing 为各有效目标位置计算预测，下一步与移位标签比较。')}:n);
  const frames=modelFrames(t,option,mode),nodes=flow.map((n,i)=>{
   const key=operatorKey(t,n),layout=/bidirectional/i.test(n.label)?'Bidirectional':/cross.attention/i.test(n.label)?'Cross-attention':undefined,v=key&&(optionFor(t,key,layout)||optionFor(t,key)),out=shape(n.shape),prev=i?shape(flow[i-1].shape):shape(n.shape);
   const semantic=/next token|sample token/.test(n.label.toLowerCase())&&mode==='Training'?L('Shifted-label predictions','移位标签预测'):n.label;
   return {id:'m'+i,label:semantic,input:list(i?flow[i-1].label:n.label,prev),output:list(n.label,out),description:n.text,equation:'',glyph:key||(/embed/.test(n.label.toLowerCase())?'embedding':'tensor'),
    container:/^bidirectional encoder$/i.test(n.label)?'encoder':null,operator:key,focus:{option:v||option,match:n.secondResidual?'Complete one residual block':n.label},sourceIndex:i};
  });
  for(const n of nodes){
   if(/repeat.*block/i.test(n.label)){n.output=list('hidden states','[B,T,D]',n.output[0].shape);const next=nodes[nodes.indexOf(n)+1];if(next)next.input[0]=n.output[0];n.equation='hₗ₊₁ = blockₗ(hₗ), l = 0…L−1';}
   if(/^(token ids|input tokens|source tokens|shifted target input)$/i.test(n.label)){n.equation='IDs = tokenizer(text)';}
   if(/embedding/i.test(n.label)){n.input.push(tensor('embedding table','[V,D]'));n.equation='X[b,t,:] = E[IDs[b,t],:]';}
   if(/norm/i.test(n.label)&&!/residual|add/i.test(n.label))n.input.push(tensor('γ, optional bias','[D]'));
  }
  // Source topology includes explicit add nodes: connect skip paths as real bypasses.
  let edges=nodes.slice(1).map((n,i)=>E(nodes[i].id,n.id));
  if(view.layout==='Encoder-decoder'){
   edges=edges.filter(e=>!(e.from==='m2'&&e.to==='m3'));edges.push(E('m2','m5','encoder KV','state'));
   nodes[2].output=[tensor('encoder K,V','[B,Hkv,Ts,dk/dv]')];
   nodes[3].input=list('shifted target IDs','[B,Tt]');
   nodes[4].input=list('target embeddings','[B,Tt,D]');
   nodes[5].input=[...nodes[4].output,...nodes[2].output];nodes[5].output=list('cross-attention output','[B,Tt,D]');nodes[6].input=nodes[5].output;
  }
  if(d.kind==='diffusion'&&mode==='Training'){
   edges=[E('m0','m1'),E('m1','m3'),E('m2','m3'),E('m3','m5'),E('m4','m5'),E('m1','m6'),E('m2','m6'),E('m5','m7'),E('m6','m7')];
   nodes[2].input=list('random generator','sampled independently');nodes[3].input=[...nodes[1].output,...nodes[2].output];nodes[4].input=list('text / condition','[B,Tc] or task-specific');nodes[4].output=list('condition embeddings','[B,Tc,Dc]');nodes[5].input=[...nodes[3].output,...nodes[2].output,...nodes[4].output];nodes[6].input=[...nodes[1].output,...nodes[2].output];nodes[7].input=[...nodes[5].output,...nodes[6].output];nodes[7].equation='ℒ = mean ‖prediction − target‖²';
  }
  let skip=nodes.find(n=>/embedding/i.test(n.label));
  nodes.forEach((n,i)=>{if(/residual|add \+/i.test(n.label)&&skip&&skip.id!==nodes[i-1]?.id){edges.push(E(skip.id,n.id,L('skip','跳连'),'residual'));n.input=[...n.input,tensor('residual '+skip.label,'[B,T,D]')];skip=n;}});
  if(['rwkv','ssm'].includes(d.kind)){const s=nodes.find(n=>/state|rwkv|ssm|ssd|time.mix/i.test(n.label));if(s)edges.push(E(s.id,s.id,L('Sₜ → Sₜ₊₁','Sₜ → Sₜ₊₁'),'state'));}
  if(d.kind==='diffusion'&&mode==='Inference'){
   const scheduler=nodes.find(n=>/scheduler|update|step/i.test(n.label)),denoiser=nodes.find(n=>/denois|u.net|transformer/i.test(n.label));
   if(scheduler&&denoiser&&scheduler!==denoiser)edges.push(E(scheduler.id,denoiser.id,L('next sampling time','下一个采样时间'),'state'));
  }
  if(mode==='Training'&&!['diffusion','public'].includes(d.kind)){
   const task=['cnn','vit'].includes(d.kind)||view.layout==='Encoder-only',last=nodes.at(-1),loss=node('loss','Compare with targets','与目标比较',[...last.output,tensor('targets',task?'task-dependent labels / masked positions':view.layout==='Encoder-decoder'?'[B,Tt]':'[B,T]')],[tensor('ℒ','scalar')],
    'Compare the forward predictions with the task targets. For an autoregressive LM, use shifted labels and a causal mask; the target is not a future input to that position.','将前向预测与任务目标比较。自回归语言模型使用移位标签与因果掩码，目标不是该位置可读取的未来输入。',task?'ℒ = task_loss(predictions, targets)':'ℒ = −mean log p(target)',{focus:{option,match:'Learn from a target'}});
   const grad=node('grad','Backpropagate and update','反向传播与更新',list('ℒ','scalar'),list('updated θ','same parameter shapes'),
    'Differentiate through the forward dependencies, accumulate parameter gradients, then apply the optimizer. The recurrent/KV state and the learned model parameters have different lifetimes.','沿前向依赖求导、累积参数梯度，再应用优化器。递归 / KV 状态与学习参数具有不同生命周期。','θ ← optimizer(θ, ∂ℒ/∂θ)',{focus:{option,match:'Learn from a target'}});
   nodes.push(loss,grad);edges.push(E(last.id,loss.id),E(loss.id,grad.id));
  }
  for(const n of nodes){if(n.operator)n.equation=t.variantDetails[n.focus.option]?.formula||'';else if(/residual/i.test(n.label))n.equation='Y = X + branch(X)';}
  for(const n of nodes)if(n.focus.option===option){const match=frames.findIndex(f=>f.title===n.label||f.title.toLowerCase().includes(String(n.focus.match).toLowerCase()));if(match>=0)n.focus.frame=match;const selected=frames[selectFrame(frames,n)];if(!n.equation&&selected?.story)n.equation=selected.story.equation;}
  let input=nodes[0].input,output=nodes.at(-1).output;
  if(view.layout==='Encoder-decoder')input=[tensor('source IDs','[B,Ts]'),tensor('shifted target IDs','[B,Tt]')];
  if(mode==='Training'&&d.kind!=='public'){
   input=[...input,...(d.kind==='diffusion'?[tensor('noise ε / z','[B,C,H,W]'),tensor('time t','scalar per example'),tensor('conditioning','task-dependent')]:[tensor('targets',['cnn','vit'].includes(d.kind)||view.layout==='Encoder-only'?'task-dependent labels':view.layout==='Encoder-decoder'?'[B,Tt]':'[B,T]',L('Labels supervise predictions; they are not future inputs.','标签监督预测，不作为未来输入。'))]),tensor('learned θ','layer-specific parameter shapes')];
   output=d.kind==='diffusion'?[...nodes[5].output,...nodes.at(-1).output,tensor('∇θ / updated θ','same parameter shapes')]:[...nodes.find(n=>n.id==='loss').input.filter(t=>t.name!=='targets'),tensor('ℒ','scalar'),...output];
  }
  const autoregressive=mode==='Inference'&&!['cnn','vit','diffusion','public'].includes(d.kind)&&view.layout!=='Encoder-only';
  if(autoregressive){
   let retained=[];
   if(d.kind==='rwkv')retained=[tensor('recurrent S','[L,B,H,dv,dk]')];
   else if(d.kind==='ssm')retained=[tensor('SSM S + convolution history','[L,B,H,P,N] + short rolling history')];
   else if(d.kind==='ced')retained=[tensor('shared encoder KV','[B,Hkv,S,dk/dv]',L('Reused by decoder layers; not replicated L times.','由解码器层复用，不复制 L 份。'))];
   else if(/MLA/i.test(d.attention||''))retained=[tensor('C_KV','[L,B,S,rKV]'),tensor('K_R','[L,B,S,dR]')];
   else if((d.operators||[]).includes('attention'))retained=[tensor('KV state','[L,B,Hkv,S,dk/dv]',L('Hybrid models retain KV only in attention layers; recurrent layers keep their own fixed state.','混合模型仅在注意力层保留 KV；递归层保留自身固定状态。'))];
   if(retained.length){input=[...input,...retained.map(v=>({...v,attributes:(v.attributes?v.attributes+' ':'')+L('Prior state; empty at the start of prefill.','先前状态；预填充开始时为空。')}))];output=[...output,...retained.map(v=>({...v,attributes:(v.attributes?v.attributes+' ':'')+L('Updated state; KV grows by the new positions, recurrent state stays fixed-size.','更新状态；KV 随新位置增长，递归状态大小固定。')}))];}
  }
  return {id:t.id+'|'+option+'|'+mode,title:t.name,nodes,edges,input,output,
   scope:d.kind==='public'?copy.overviewOnly:L('Published topology. Tensor axes are symbolic; open a step for a small executable example.','公开模型拓扑。张量维度使用符号；展开步骤可查看可执行小示例。'),
   notation:notation(),family:true};
 }
 function contract(t,option,stage=0,mode='Inference'){
  const frames=modelFrames(t,option,mode),f=frames[Math.min(stage,frames.length-1)];
  if(f.story)return {input:f.story.panels.filter(p=>p.id!==f.story.output).map(p=>tensor(p.name,'[1,'+p.values.length+','+p.values[0].length+']')),output:list(f.story.panels.at(-1).name,'[1,'+f.story.panels.at(-1).values.length+','+f.story.panels.at(-1).values[0].length+']'),equation:f.story.equation};
  const spec=operatorContract(f);return {input:list('X / operands',spec.input),output:list('Y / state',spec.output),equation:spec.equation,note:spec.state};
 }
 function operatorStages(view,mode,frames){
  const pair=(name,shape)=>tensor(name,shape),xs='[B,T,D]',state='[B,H,dv,dk]',rows=[];
  const add=(en,zh,input,output,equation,frame)=>rows.push({label:L(en,zh),input:input.map(([n,s])=>pair(n,s)),output:output.map(([n,s])=>pair(n,s)),equation,frame});
  const single=(en,zh,input,output,equation,frame)=>add(en,zh,[input],[output],equation,frame);
  switch(view.scene){
   case 'ffn':{
    const plain=['GELU','Squared ReLU'].includes(view.layout);
    add('Expand each token’s features','扩展各 token 特征',[['X',xs],['Wgate / Wup','[D,F]']],plain?[['U','[B,T,F]']]:[['G','[B,T,F]'],['U','[B,T,F]']],plain?'U = X W₁':'G = X Wgate; U = X Wup',1);
    single('Apply the nonlinearity','应用非线性',['G / U','[B,T,F]'],['A','[B,T,F]'],view.layout==='GELU'?'A = GELU(U)':view.layout==='Squared ReLU'?'A = ReLU(U)²':'A = SiLU(G)',2);
    if(!plain)add('Multiply gate and content','门与内容相乘',[['A','[B,T,F]'],['U','[B,T,F]']],[['H','[B,T,F]']],'H = A ⊙ U',3);
    add('Contract to residual width','收缩回残差宽度',[[plain?'A':'H','[B,T,F]'],['Wdown','[F,D]']],[['Y',xs]],plain?'Y = A W₂':'Y = H Wdown',3);break;
   }
   case 'norm':{
    const group=view.layout==='GroupNorm',layer=view.layout==='LayerNorm',sh=group?'[B,C,H,W]':xs,st=group?'[B,G,1]':'[B,T,1]';
    single('Choose the reduction axes','选择归约轴',['X',sh],['grouped / token features',sh],group?'reduce within channel group and spatial axes':'reduce over D independently at each token',0);
    add('Compute scale statistics','计算尺度统计量',[['X',sh]],layer||group?[['μ',st],['σ²',st]]:[['mean(X²)',st]],layer||group?'μ = mean(X); σ² = mean((X−μ)²)':'m₂ = mean(X²)',1);
    add('Center when required, then scale','按需中心化后缩放',[['X',sh],['statistics',st]],[['Xhat',sh]],layer||group?'Xhat = (X−μ)/√(σ²+ε)':'Xhat = X/√(m₂+ε)',2);
    add('Apply learned affine parameters','应用学习仿射参数',[['Xhat',sh],['γ, optional b',group?'[C]':'[D]']],[['Y',sh]],'Y = γ ⊙ Xhat + b',3);break;
   }
   case 'rope':
    single('Pair rotary features','配对旋转特征',['Q,K','[...,dR]'],['2D feature pairs','[...,dR/2,2]'],'(x₂ⱼ,x₂ⱼ₊₁), θⱼ = position·frequencyⱼ',0);
    add('Rotate each query pair','旋转各查询特征对',[['Q pairs','[...,dR/2,2]'],['positions / frequencies','broadcast over heads']],[['Qrot','[...,dR]']],'[a,b] → [a cosθ−b sinθ, a sinθ+b cosθ]',1);
    add('Rotate corresponding keys','旋转相应键特征对',[['K pairs','[...,dR/2,2]'],['key positions','broadcast over heads']],[['Krot','[...,dR]']],'Krot = R(position) K; V is unchanged',2);
    add('Compare relative positions','比较相对位置',[['Qrot','[...,Tq,dR]'],['Krot','[...,Tk,dR]']],[['positional dot products','[...,Tq,Tk]']],'(R(p)q)ᵀR(s)k = qᵀR(s−p)k',3);break;
   case 'routing':
    add('Compute router scores','计算路由评分',[['X','[Nt,D]'],['Wrouter','[D,E]']],[['scores','[Nt,E]']],'scores = router(X)',0);
    single('Select experts and normalize gates','选择专家并归一化门权重',['scores','[Nt,E]'],['expert IDs + gates','[Nt,k]'],'IDs = topk(scores); g = normalize(selected scores)',1);
    add('Dispatch and evaluate selected experts','分发并运行所选专家',[['X','[Nt,D]'],['expert IDs','[Nt,k]']],[['expert outputs','[Nt,k,D]']],'Y_te = Expert_e(X_t)',2);
    add('Combine in original token order','按原 token 顺序组合',[['expert outputs','[Nt,k,D]'],['gates','[Nt,k]']],[['Y','[Nt,D]']],'Y_t = Σe g_te Y_te (+ shared expert if present)',3);break;
   case 'flash':
    add('Load one query and KV tile','载入查询及 KV 块',[['Q','[B,H,Tq,dk]'],['K,V','[B,H,Tk,dk/dv]']],[['Qblock,Kblock,Vblock','[tile rows, features]']],'tile scores = Qblock Kblockᵀ / √dk + M',0);
    single('Compute tile softmax statistics','计算块 softmax 统计量',['tile scores / values','[qblock,kblock] / [kblock,dv]'],['m, ℓ, u','[qblock], [qblock], [qblock,dv]'],'m=max(scores); ℓ=Σexp(scores−m); u=Σexp(scores−m)V',1);
    add('Rescale and merge the next tile','重新缩放并合并下一块',[['old m,ℓ,u','running row statistics'],['new tile m,ℓ,u','tile row statistics']],[['merged m,ℓ,u','running row statistics']],'m′=max(m,mblock); rescale old/new ℓ,u by exp(m−m′)',2);
    single('Normalize after the final tile','最后一块后归一化',['merged ℓ,u','[qblock] / [qblock,dv]'],['O','[B,H,Tq,dv]'],'O = u / ℓ',3);break;
   case 'sparse':
    add('Score candidate history','为候选历史评分',[['queries','[B,T,D]'],['index keys','[B,S,Di]']],[['index scores','[B,T,S]']],'index scores = indexer(query, history)',0);
    single('Select a visible subset','选择可见子集',['index scores','[B,T,S]'],['selected indices','[B,T,k]'],'J = topk(index scores + visibility mask)',1);
    add('Gather selected keys and values','收集选中键值',[['full history K,V','[B,Hkv,S,dk/dv]'],['indices J','[B,T,k]']],[['selected K,V','[B,Hkv,T,k,dk/dv]']],'KJ,VJ = gather(K,V,J)',2);
    add('Attend only the selected history','仅关注选中历史',[['Q','[B,Hq,T,dk]'],['selected K,V','k positions per query']],[['O','[B,Hq,T,dv]']],'O = softmax(QKJᵀ/√dk + M) VJ',3);break;
   case 'compressed':
    single('Separate old and recent positions','分离历史与近期位置',['history','[B,S,D]'],['old history + local window','[B,Sold,D] + [B,W,D]'],'S = Sold + W',0);
    single('Compress old context','压缩旧上下文',['old history','[B,Sold,D]'],['compressed memory','[B,ceil(Sold/r),Dc]'],'C = learned_compressor(old history)',1);
    add('Choose memory entries','选择记忆条目',[['compressed memory','[B,Sc,Dc]'],['query/index state','release-specific']],[['selected compressed + recent KV','memory positions + local W']],view.layout==='HCA'?'use highly compressed memory + local window':'J = indexer(query,C); gather C[J] + local window',2);
    add('Attend the combined memory','关注组合记忆',[['query','[B,Hq,T,dk]'],['selected memory + recent KV','visible compressed and exact positions']],[['O','[B,Hq,T,dv]']],'O = attention(Q, compressed subset ∪ recent window)',3);break;
   case 'hyper':
    single('Carry multiple residual streams','携带多条残差流',['X','[B,T,n,D]'],['streams','[B,T,n,D]'],'n separate feature streams',0);
    add('Mix streams with a constrained map','以约束映射混合流',[['X','[B,T,n,D]'],['Hres','[n,n]']],[['mixed skip','[B,T,n,D]']],'skip = Hres X; mHC constrains residual mixing',1);
    add('Read the branch input','读取分支输入',[['X','[B,T,n,D]'],['Hpre','[1,n]']],[['branch input','[B,T,D]']],'Z = Hpre X; F = branch(Z)',2);
    add('Distribute and add the branch','分发并加上分支',[['mixed skip','[B,T,n,D]'],['F','[B,T,D]'],['Hpost','[n,1]']],[['Y','[B,T,n,D]']],'Y = Hres X + Hpost F(Hpre X)',3);break;
   case 'delta':
    add('Decay the key-by-value memory','衰减键维乘值维记忆',[['old S','[B,H,dk,dv]'],['decay λ','[B,H,1,1]']],[['Sbar','[B,H,dk,dv]']],'Sbar = λ Sprev',1);
    add('Predict the stored value for this key','预测此键对应的记忆值',[['k','[B,H,dk]'],['Sbar','[B,H,dk,dv]']],[['vhat','[B,H,dv]']],'vhat = kᵀ Sbar',2);
    add('Compute the correction','计算修正量',[['v','[B,H,dv]'],['vhat','[B,H,dv]'],['β','[B,H,1]']],[['error','[B,H,dv]']],'error = β(v−vhat)',2);
    add('Write a rank-one correction','写入秩一修正',[['Sbar','[B,H,dk,dv]'],['k','[B,H,dk]'],['error','[B,H,dv]']],[['new S','[B,H,dk,dv]']],'S = Sbar + k errorᵀ',3);
    add('Read with the current query','以当前查询读取',[['q','[B,H,dk]'],['S','[B,H,dk,dv]']],[['O','[B,H,dv]']],'O = qᵀ S',4);break;
   case 'rwkv':
    add('Decay the value-by-key state','衰减值维乘键维状态',[['old S',state],['w','[B,H,dk]']],[['decayed S',state]],'Sdecay = Sold diag(w)',1);
    if(view.layout!=='RWKV-6')add('Build the old-state modifier','构造旧状态修改项',[['old S',state],['a,b','[B,H,dk]']],[['modifier',state]],'modifier = (Sold a)bᵀ',2);
    add('Write the current association','写入当前联结',[['decayed S + optional modifier',state],['v,k','[B,H,dv] + [B,H,dk]']],[['new S',state]],'S = Sdecay + modifier + vkᵀ',3);
    add('Read and gate the output','读取并门控输出',[['read vector r','[B,H,dk]'],['new S',state]],[['O','[B,H,dv]']],'read = S r; apply version-specific readout gates/terms',3);break;
   case 'ssm':
    add('Select state-space parameters','选择状态空间参数',[['input U','[B,T,H,P]'],['learned projections','release-specific']],[['B,C,Δ','input-dependent parameters']],'(B,C,Δ) = input projections(U)',0);
    add('Discretize retention and write','离散化保留及写入',[['A, B, Δ','continuous/selective parameters']],[['Abar, Bbar','discrete step parameters']],'Abar = exp(Δ A); Bbar follows the discretization',1);
    add('Update fixed-size state','更新固定大小状态',[['old S','[B,H,P,N]'],['U, Bbar, Abar','current input / step parameters']],[['new S','[B,H,P,N]']],'S = Abar ⊙ Sprev + U Bbarᵀ',2);
    add('Read and project state','读取并投影状态',[['new S','[B,H,P,N]'],['C','[B,H,N]']],[['Y','[B,H,P]']],'Y = S C; apply block-specific skip, gate and output projection',3);break;
   case 'conv':{
    const depth=view.layout==='1D depthwise';
    add('Read input and the shared kernel','读取输入及共享卷积核',depth?[['X','[B,C,T]'],['W','[C,K]']]:[['X','[B,Cin,H,W]'],['kernel','[Cout,Cin,Kh,Kw]']],depth?[['padded channel history','[B,C,T+K−1]']]:[['padded image','[B,Cin,Hpad,Wpad]']],depth?'left-pad history; no future positions':'apply the declared padding and stride',0);
    single('Choose one receptive field','选择一个感受野',depth?['padded history','[B,C,T+K−1]']:['padded image','[B,Cin,Hpad,Wpad]'],depth?['window per channel','[B,C,K]']:['window','[B,Cin,Kh,Kw]'],'one output position reads one local window',1);
    add('Multiply and accumulate','逐项相乘并累加',depth?[['window','[B,C,K]'],['kernel','[C,K]']]:[['window','[B,Cin,Kh,Kw]'],['kernel','[Cout,Cin,Kh,Kw]']],depth?[['output position','[B,C]']]:[['output pixel','[B,Cout]']],depth?'Y[b,c,t] = Σu W[c,u] X[b,c,t−u]':'Y[b,o,h,w] = Σc,u,v kernel[o,c,u,v] Xwindow[b,c,u,v]',2);
    single('Write output and advance the window','写入输出并移动窗口',depth?['output positions','[B,C]']:['output pixels','[B,Cout]'],depth?['Y','[B,C,Tout]']:['Y','[B,Cout,Hout,Wout]'],depth?'Tout follows stride/padding':'Hout = floor((H+2p−d(Kh−1)−1)/stride)+1',Math.min(frames.length-2,3));break;
   }
   case 'crosskv':
    single('Encode the source sequence','编码源序列',['source features','[B,S,De]'],['encoder states E','[B,S,De]'],'E = causal_encoder(source)',0);
    add('Project a shared KV memory','投影共享 KV 记忆',[['E','[B,S,De]'],['Wk,Wv','learned shared projections']],[['shared K,V','[B,Hkv,S,dk/dv]']],'K = E Wk; V = E Wv',1);
    add('Select memory and local context','选择记忆与局部上下文',[['shared K,V','[B,Hkv,S,dk/dv]'],['index / local-window state','release-specific']],[['visible memory','selected shared + local positions']],'visible = reindex(shared memory) ∪ local window',2);
    add('Read it from each decoder layer','由各解码层读取',[['Q_layer','[B,Hq,T,dk]'],['visible shared K,V','layer-reused memory']],[['O_layer','[B,Hq,T,dv]']],'O_layer = attention(Q_layer, shared K,V)',3);break;
   case 'engram':
    single('Hash token n-grams','对 token n-gram 哈希',['token IDs','[B,T]'],['lookup indices','[B,T,M]'],'indices = hash(visible token n-grams)',0);
    add('Retrieve static embeddings','检索静态嵌入',[['indices','[B,T,M]'],['memory tables','[Vmem,Dm]']],[['retrieved memory','[B,T,Dm]']],'memory = embedding_lookup(tables, indices)',1);
    add('Project and gate with hidden state','由隐藏状态投影并门控',[['memory','[B,T,Dm]'],['X','[B,T,D]']],[['gated memory','[B,T,D]']],'Z = gate(X,memory) ⊙ project(memory)',2);
    add('Fuse with the hidden stream','与隐藏特征流融合',[['X','[B,T,D]'],['gated memory','[B,T,D]']],[['Y','[B,T,D]']],'Y = X + Z (plus release-specific local mixing)',3);break;
   case 'speculative':
    single('Draft several candidate tokens','起草多个候选 token',['prefix','[B,T]'],['candidate IDs + draft probabilities','[B,K] / [B,K,V]'],'draft model proposes K candidates',0);
    add('Verify candidates with the target','由目标模型验证候选',[['prefix + candidates','[B,T+K]'],['target model','fixed learned weights']],[['target distributions','[B,K,V]']],'evaluate candidates with causal target attention',1);
    add('Accept a valid prefix and correct','接受有效前缀并修正',[['draft q, target p','[B,K,V]'],['candidate IDs','[B,K]']],[['accepted IDs + correction/bonus','variable prefix length']],'greedy: accept matching argmax; sampling: use acceptance/correction rule',2);
    single('Commit only the valid cache prefix','仅提交有效缓存前缀',['tentative draft / target state','cache includes candidate positions'],['verified prefix + valid caches','discard positions after rejection'],'rollback rejected suffix; continue from verified tokens',3);break;
   case 'diffusion':{
    const flow=view.layout==='Flow matching';
    if(mode==='Training'){
     add('Sample time and corrupt data','采样时间并扰动数据',[['clean xdata','[B,C,H,W]'],['noise z/ε','[B,C,H,W]'],['time t','scalar or [B]']],[['x_t','[B,C,H,W]']],flow?'x_t = (1−t)z+t xdata':'x_t = √αbar_t xdata + √(1−αbar_t)ε',0);
     add('Predict from noisy input and condition','由含噪输入及条件预测',[['x_t','[B,C,H,W]'],['t,c','time and conditioning']],[['prediction','[B,C,H,W]']],'prediction = denoiserθ(x_t,t,c)',1);
     add('Construct the matching target','构造匹配的训练目标',[['xdata, z/ε','sampled training tensors']],[['target','[B,C,H,W]']],flow?'target = xdata − z':'target = ε (for ε parameterization)',2);
     add('Compute loss and backpropagate','计算损失并反向传播',[['prediction,target','[B,C,H,W]']],[['loss + parameter gradients','scalar + shapes of θ']],'ℒ = mean((prediction−target)²)',frames.length-1);
    }else{
     add('Read the current noisy state','读取当前含噪状态',[['x_t','[B,C,H,W]'],['t,c','time and conditioning']],[['denoiser inputs','same state + metadata']],'same θ is reused across sampling times',0);
     single('Predict the update direction','预测更新方向',['denoiser inputs','x_t,t,c'],[flow?'velocity vθ':'noise εθ','[B,C,H,W]'],'prediction = denoiserθ(x_t,t,c)',1);
     add('Apply the selected scheduler','应用所选调度器',[['x_t + prediction','[B,C,H,W]'],['scheduler coefficients','time-dependent scalars']],[['reverse mean / next state','[B,C,H,W]']],flow?'x_next = x_t + Δt vθ':'μθ = (x_t−β_t εθ/√(1−αbar_t))/√α_t',2);
     single('Advance time and reuse the denoiser','推进时间并复用去噪器',['updated state','[B,C,H,W]'],['x_next','[B,C,H,W]'],flow?'continue integration to data endpoint':'stochastic DDPM adds √βtilde_t z where required',3);
    }break;
   }
  }
  if(!rows.length)return null;
  return rows.map((r,i)=>({...r,description:frames[Math.min(r.frame,frames.length-1)].text,frame:Math.min(r.frame,frames.length-1)}));
 }

 function operator(t,option,mode){
  const view=t.modelViews[option],op=MODEL_OPERATORS[view.op],frames=modelFrames(t,option,mode),c=contract(t,option,0,mode);
  if(view.scene==='attention')return attention(t,option,mode);
  if(view.scene==='mla')return mla(t,option,mode);
  const schemas=operatorStages(view,mode,frames);
  const nodes=schemas?schemas.map((r,i)=>({id:'s'+i,label:r.label,input:r.input,output:r.output,description:r.description,equation:r.equation,glyph:op.id,focus:{option,frame:r.frame},numerical:true})):frames.filter(f=>!f.gradient).map((f,i)=>{const ct=contract(t,option,i,mode);return {id:'s'+i,label:f.title,input:ct.input,output:ct.output,description:f.text,equation:ct.equation,note:ct.note,glyph:op.id,focus:{option,frame:i},numerical:true};});
  if(mode==='Training'&&frames.at(-1).gradient){const f=frames.at(-1);nodes.push({id:'backward',label:f.title,input:c.output,output:list('∂ℒ/∂X, ∂ℒ/∂W','same shapes as X and W'),description:f.text,equation:'chain rule',focus:{option,frame:frames.length-1},numerical:true});}
  const g=chain(t.id+'|'+option+'|'+mode,op.name,nodes,{notation:notation(),scope:L('Operator workflow. Each step opens the corresponding numerical stage.','算子工作流。每个步骤均可展开对应的数值阶段。')});
  g.input=c.input;g.output=c.output;
  if(view.scene==='ffn'&&nodes.length>=4)g.edges.push(E('s0','s2','up branch','residual'));
  if(view.scene==='routing')g.edges.push(E('s1','s3','routing gates','residual'));
  if(view.scene==='hyper')g.edges.push(E('s1','s3','mixed residual','residual'));
  if(view.scene==='conv')g.edges.push(E('s3','s1',L('next output window','下一输出窗口'),'state'));
  if(['rwkv','ssm','delta'].includes(view.scene)){const update=nodes.find(n=>n.output.some(t=>t.name==='new S'))||nodes.at(-1);g.edges.push(E(update.id,nodes[0].id,L('state for next token','下个 token 的状态'),'state'));}
  if(view.scene==='flash')g.edges.push(E('s2','s0',L('next KV tile','下一 KV 块'),'state'));
  if(view.scene==='diffusion'&&mode==='Inference')g.edges.push(E('s3','s0',L('next time; same weights','下一时间，相同权重'),'state'));
  return g;
 }
 function attention(t,option,mode){
  const view=t.modelViews[option],cross=view.layout==='Cross-attention',causal=!['Bidirectional','Cross-attention'].includes(view.layout),gqa=['GQA','Gated GQA','MQA'].includes(view.layout),gated=view.layout==='Gated GQA';
  const x=list('Xquery','[B,Tq,D]'),ctx=list(cross?'Xcontext':'X',cross?'[B,Tk,Dctx]':'[B,Tq,D]');
  const nodes=[
   node('q','Project query heads','投影查询头',[...x,tensor('Wq','[D,Hq·dk]')],list('Q','[B,Hq,Tq,dk]'),'Each query head asks a different learned question. Split the projected feature axis into Hq heads.','各查询头提出不同的学习查询，将投影特征轴拆分为 Hq 个头。','Q = Xquery Wq',{glyph:'query',focus:{option,frame:0}}),
   node('k','Project key heads','投影键头',[...ctx,tensor('Wk',cross?'[Dctx,Hkv·dk]':'[D,Hkv·dk]')],list('K','[B,Hkv,Tk,dk]'),gqa?'Groups of query heads share KV heads. This saves cache storage; the Hq query outputs stay distinct.':'Keys describe the information at each context position; they supply the matching features, not the content being averaged.',gqa?'查询头分组共享 KV 头以节省缓存，各 Hq 查询输出仍保持独立。':'键描述各上下文位置的信息，用于匹配，而不是被加权平均的内容。','K = Xcontext Wk',{glyph:'key',focus:{option,frame:0}}),
   node('v','Project value heads','投影值头',[...ctx,tensor('Wv',cross?'[Dctx,Hkv·dv]':'[D,Hkv·dv]')],list('V','[B,Hkv,Tk,dv]'),'Values are the content read from each context position. They are a separate learned projection from K.','值是从各上下文位置读取的内容，与 K 使用不同学习投影。','V = Xcontext Wv',{glyph:'value',focus:{option,frame:0}}),
   node('scores','Compare query with each key','逐键比较查询',[tensor('Q','[B,Hq,Tq,dk]'),tensor('K','[B,Hkv,Tk,dk]')],list('S','[B,Hq,Tq,Tk]'),'A dot product contracts only the key feature dimension. It creates one score per query–key pair.','点积仅收缩键特征维，为每个查询与键的组合生成一个评分。','S = QKᵀ / √dk',{glyph:'multiply',focus:{option,frame:1}}),
   node('mask',causal?'Block future context':'Keep valid context',causal?'屏蔽未来上下文':'保留有效上下文',list('S','[B,Hq,Tq,Tk]'),list('S + M','[B,Hq,Tq,Tk]'),causal?'Set future-key scores to −∞ before softmax. Padding and position conventions must agree with the cache.':'No causal triangle in this layout. Mask padding if present; valid context remains visible.',causal?'softmax 前将未来键评分置为 −∞；填充及位置约定必须与缓存一致。':'此布局无因果三角；如有填充则屏蔽填充位置，其余有效上下文可见。','Mij = −∞ if invisible; else 0',{focus:{option,frame:2}}),
   node('prob','Normalize over visible keys','沿可见键归一化',list('S + M','[B,Hq,Tq,Tk]'),list('A','[B,Hq,Tq,Tk]'),'Softmax acts over Tk independently for each query/head. Each row sums to one; masked entries get zero.','softmax 对每个查询 / 头独立沿 Tk 计算，每行和为一，被屏蔽项为零。','Aij = exp(Sij − max Si) / Σk exp(Sik − max Si)',{focus:{option,frame:3}}),
   node('read','Read weighted values','读取加权值',[tensor('A','[B,Hq,Tq,Tk]'),tensor('V','[B,Hkv,Tk,dv]')],list('Oheads','[B,Hq,Tq,dv]'),'Multiply every value row by its attention weight, then sum over context positions. This mixes positions, not token IDs.','各值行乘对应注意力权重，再沿上下文位置求和；混合的是特征，不是 token ID。','Oheads = AV',{glyph:'multiply',focus:{option,frame:4}}),
   node('out',gated?'Gate, concatenate and project':'Concatenate and project',gated?'门控、拼接与投影':'拼接与投影',list('Oheads','[B,Hq,Tq,dv]'),list('Y','[B,Tq,D]'),gated?'Apply the input-dependent sigmoid output gate before merging/projecting heads. The output returns to the residual width D.':'Merge head features, then use Wo to mix them and restore the residual width D.',gated?'合并 / 投影各头前使用依赖输入的 sigmoid 输出门，输出恢复残差宽度 D。':'合并各头特征，再由 Wo 混合并恢复残差宽度 D。',gated?'Y = concat(Oheads ⊙ sigmoid(G)) Wo':'Y = concat(Oheads) Wo',{focus:{option,frame:5}})
  ];
  const edges=[E('q','scores','Q'),E('k','scores','K'),E('scores','mask','S'),E('mask','prob','S + M'),E('prob','read','A'),E('v','read','V'),E('read','out','Oheads')];
  if(mode==='Inference'&&causal){const cache=node('cache','Retain historical K and V','保留历史 K、V',[tensor('new K,V','[B,Hkv,Tq,dk/dv]'),tensor('previous K,V','[B,Hkv,Sprev,dk/dv]')],[tensor('K cache','[B,Hkv,S,dk]'),tensor('V cache','[B,Hkv,S,dv]')],'Append new KV rows at decode. The cache grows along history S; queries are temporary. Prefill writes multiple positions.','解码追加新 KV 行，缓存沿历史维 S 增长，查询为临时量；预填充写入多个位置。','cache ← concat(cache, new KV)',{glyph:'cache',focus:{option,frame:5}});nodes.find(n=>n.id==='k').output=list('new K','[B,Hkv,Tq,dk]');nodes.find(n=>n.id==='v').output=list('new V','[B,Hkv,Tq,dv]');for(let i=edges.length-1;i>=0;i--)if((edges[i].from==='k'&&edges[i].to==='scores')||(edges[i].from==='v'&&edges[i].to==='read'))edges.splice(i,1);nodes.push(cache);edges.push(E('k','cache','K','state'),E('v','cache','V','state'),E('cache','scores',L('past K','历史 K'),'state'),E('cache','read',L('past V','历史 V'),'state'));}
  nodes.forEach(n=>n.numerical=true);
  return{id:t.id+'|'+option+'|'+mode,title:MODEL_OPERATORS[view.op].name,nodes,edges,input:[...x,...(cross?ctx:[]),...(mode==='Inference'&&causal?[tensor('previous KV','[B,Hkv,Sprev,dk/dv]')]:[])],output:[...list('Y','[B,Tq,D]'),...(mode==='Inference'&&causal?[tensor('updated KV','[B,Hkv,S,dk/dv]','S = Sprev + Tq; Tk = S')]:[])],notation:notation(),scope:L('One attention operator. Positional transformations belong before scoring; residuals and the FFN belong to the surrounding block.','一个注意力算子。位置变换在评分前执行，残差与 FFN 属于外层模型块。')};
 }
 function mla(t,option,mode){
  const n=(id,en,zh,input,output,text,zt,eq,frame,extra={})=>node(id,en,zh,input,output,text,zt,eq,{focus:{option,frame},...extra});
  const X=list('Xnew','[B,Tq,D]'),nodes=[
   n('q','Compress and expand the query','压缩并展开查询',X,[tensor('qC','[B,H,Tq,dN]'),tensor('qR','[B,H,Tq,dR]')],'The query down-projection is separate from KV compression. Expanded query heads are temporary and never appended to the history cache.','查询下投影独立于 KV 压缩，展开的查询头是临时量，不追加到历史缓存。','cQ = Xnew W_DQ; (qC,qR) = cQ W_UQ',1,{glyph:'query'}),
   n('content','Compress shared KV content','压缩共享 KV 内容',[...X,tensor('W_DKV','[D,rKV]')],list('Cnew','[B,Tq,rKV]'),'One learned latent supplies both content keys and values. It stays unrotated so the key/value up-projections can be absorbed or delayed.','一个学习潜变量同时提供内容键和值，保持不旋转，以便吸收或延后键 / 值上投影。','Cnew = Xnew W_DKV',0,{glyph:'compressed'}),
   n('position','Make separate positional keys','生成独立位置键',[...X,tensor('W_KR','[D,dR]')],list('K_R,new','[B,Tq,dR]'),'A separate key slice receives RoPE. The content latent does not. Rotate the corresponding qR positional query too.','独立键切片使用 RoPE，内容潜变量不旋转；相应 qR 位置查询也需旋转。','K_R,new = RoPE(Xnew W_KR); qR = RoPE(qR)',2,{glyph:'key'}),
   n('cache',mode==='Inference'?'Cache these two tensors':'Share the two compact KV paths',mode==='Inference'?'缓存这两个张量':'共享两条紧凑 KV 路径',[tensor('Cnew','[B,Tq,rKV]'),tensor('K_R,new','[B,Tq,dR]'),...(mode==='Inference'?[tensor('previous compact cache','[B,Sprev,rKV+dR]')]:[])],[tensor('persistent C_KV','[B,S,rKV]'),tensor('persistent K_R','[B,S,dR]')],mode==='Inference'?'Compact decode appends rKV+dR scalars per new token/layer. It retains neither the query nor expanded per-head content K/V.':'Training shares the compact content and positional representations across query heads. They are forward activations; persistent history caching belongs to decode.',mode==='Inference'?'紧凑解码为每个新 token / 层追加 rKV+dR 个标量，不保留查询或展开的逐头内容 K/V。':'训练在查询头之间共享紧凑内容与位置表示；它们是前向激活，持久历史缓存用于解码。',mode==='Inference'?'S = Sprev + Tq; cache ← append(Cnew, K_R,new)':'S = Tq; KV representation/token = rKV + dR',3,{glyph:'cache'}),
   n('absorb','Move the key projection into Q','将键上投影移到 Q',[tensor('qC','[B,H,Tq,dN]'),tensor('W_UK','[H,rKV,dN]')],list('q_latent','[B,H,Tq,rKV]'),'Associativity lets the query score cached latents directly. This is exact algebra for the learned projections; learned compression itself is not generally lossless.','矩阵结合律让查询直接对缓存潜变量评分。对学习投影而言是精确代数，而学习压缩本身通常并非无损。','q_latent = qC W_UKᵀ',6,{glyph:'multiply'}),
   n('score','Combine content and position','组合内容与位置',[tensor('q_latent','[B,H,Tq,rKV]'),tensor('C_KV','[B,S,rKV]'),tensor('qR / K_R','dR positional features')],list('scores','[B,H,Tq,S]'),'Add content and positional dot products, scale by √(dN+dR), then apply the causal/visibility mask before one softmax.','内容与位置点积相加，除以 √(dN+dR)，再施加因果 / 可见性掩码，之后只做一次 softmax。','S = (q_latent C_KVᵀ + qR K_Rᵀ) / √(dN+dR) + M',5,{glyph:'multiply'}),
   n('latentread','Normalize and read the latent','归一化并读取潜变量',[tensor('scores','[B,H,Tq,S]'),tensor('C_KV','[B,S,rKV]')],list('z','[B,H,Tq,rKV]'),'Normalize over visible history. Read a weighted latent first; value expansion can happen after the history reduction.','沿可见历史归一化，先读取加权潜变量；值展开可延后到历史归约之后。','A = softmax(S); z = A C_KV',7),
   n('output','Expand values and merge heads','展开值并合并各头',list('z','[B,H,Tq,rKV]'),list('Y','[B,Tq,D]'),'Each head uses its own value up-projection, then outputs are concatenated and projected back to the residual width.','各头应用自身值上投影，再拼接输出并投影回残差宽度。','o_h = z_h W_UV,h; Y = concat(o_h) W_O',8,{glyph:'value'})
  ];
  nodes.forEach(n=>n.numerical=true);
  return{id:t.id+'|'+option+'|'+mode,title:'MLA',nodes,edges:[E('q','absorb','qC'),E('q','score','qR'),E('content','cache','C_KV','state'),E('position','cache','K_R','state'),E('cache','score','C_KV, K_R','state'),E('absorb','score','q_latent'),E('score','latentread','scores'),E('cache','latentread','C_KV','state'),E('latentread','output','z')],input:[...X,...(mode==='Inference'?[tensor('previous C_KV / K_R','[B,Sprev,rKV] / [B,Sprev,dR]')]:[])],output:[...list('Y','[B,Tq,D]'),...(mode==='Inference'?[tensor('updated C_KV / K_R','[B,S,rKV] / [B,S,dR]')]:[])],notation:notation(),scope:L('MLA dataflow: temporary query, persistent compressed content, separate positional path, and deferred value expansion.','MLA 数据流：临时查询、持久压缩内容、独立位置路径，以及延后的值展开。')};
 }
 function collective(t,option){
  const implementationLesson=selectedLesson(t,option,'Inference');
  const id=t.id,P='P',rooted=['reduce','broadcast','scatter','gather'].includes(id),part=['all-gather','gather','scatter','reduce-scatter'].includes(id);
  let ins='xᵣ [C]',outs='yᵣ [C]',inAttr=L('One input vector per rank; same count and dtype.','每 rank 一个输入向量，元素数与数据类型相同。'),outAttr=L('One output vector per rank.','每 rank 一个输出向量。'),action='',zh='',formula=t.formula,desc=t.lede;
  const names={
   'all-reduce':['Reduce each coordinate','逐坐标归约','Copy the full result to all ranks','复制完整结果到所有 rank'],
   'reduce':['Reduce each coordinate','逐坐标归约','Keep the result only at root','仅 root 保留结果'],
   'reduce-scatter':['Reduce matching coordinates','归约相同坐标','Partition the reduced vector','分割归约结果'],
   'all-gather':['Collect distinct shards','收集不同分片','Concatenate in rank order','按 rank 顺序拼接'],
   'broadcast':['Read only the root input','仅读取 root 输入','Copy unchanged to each rank','原样复制到各 rank'],
   'scatter':['Partition the root buffer','分割 root 缓冲区','Deliver one shard per rank','每 rank 接收一片'],
   'gather':['Collect distinct rank buffers','收集各 rank 缓冲区','Concatenate only at root','仅在 root 拼接'],
   'all-to-all':['Split by destination rank','按目标 rank 拆分','Transpose data ownership','转置数据所有权'],
   'all-to-all-v':['Build per-peer counts and offsets','构建逐 peer 数量与偏移','Route variable-size segments','路由可变长分段'],
   'send-recv':['Match source and destination','匹配发送与接收端','Transfer the selected payload','传输选定载荷'],
   'barrier':['Enter the rendezvous','进入同步点','Release after all ranks arrive','所有 rank 到齐后退出'],
   'scan':['Respect rank order','保持 rank 顺序','Compute each inclusive prefix','计算各包含自身的前缀']};
  if(['all-gather','gather'].includes(id)){ins='xᵣ [C/P]';outs=id==='gather'?'yroot [C]':'yᵣ [C]';}
  if(['scatter','reduce-scatter'].includes(id))outs='yᵣ [C/P]';
  if(['broadcast','scatter'].includes(id))ins='xroot [C]';if(id==='reduce')outs='yroot [C]';
  if(id==='all-to-all'){ins='sendᵣ [P,K]';outs='recvᵣ [P,K]';}
  if(id==='all-to-all-v'){ins='sendᵣ [Σd sendcountᵣd]';outs='recvᵣ [Σs recvcountᵣs]';inAttr=L('Counts and displacements are per peer; pairwise counts must match.','数量与偏移按 peer 定义，发送 / 接收的成对数量必须匹配。');}
  if(id==='send-recv'){ins='xsource [C]';outs='ydestination [C]';outAttr=L('Only the specified sender/receiver pair participates.','仅指定发送 / 接收对参与。');}
  if(id==='barrier'){ins='P rank arrival events';outs='P return events; no tensor';inAttr=L('This operation synchronizes participation, not tensor values.','此操作同步参与进度，不产生张量值。');outAttr=L('All ranks entered before any rank returns.','所有 rank 进入后，任一 rank 才可返回。');}
  const a=names[id],nodes=[
   node('inputs','Start with rank-owned inputs','从各 rank 输入开始',list('input',ins,inAttr),list('rank buffers',ins,inAttr),inAttr,ZH[inAttr]||inAttr,'',{glyph:'ranks',focus:{logical:true,frame:0}}),
   node('transform',a[0],a[1],list('rank buffers',ins),list('intermediate',id==='barrier'?'arrival state':part?'global logical vector / shards':'coordinate values'),desc,ZH[desc]||desc,formula,{glyph:['all-reduce','reduce','reduce-scatter','scan'].includes(id)?'sum':'route',focus:{logical:true,frame:1}}),
   node('ownership',a[2],a[3],list('intermediate',id==='barrier'?'all arrivals':'completed values / selected segments'),list('output',outs,outAttr),outAttr,ZH[outAttr]||outAttr,formula,{glyph:'ranks',focus:{logical:true,frame:-1}}),
   node('implementation','Choose the execution schedule','选择实际执行调度',list('same logical contract',ins),list('same result',outs),
    'A ring, tree or direct schedule changes message order and traffic while preserving the logical operation. Open this step to inspect the currently selected implementation.','环、树或直接调度改变消息顺序与通信量，但保留逻辑操作。展开此步查看当前所选实现。',implementationLesson.cost,{note:implementationLesson.costNote,focus:{option,frame:0},implementation:true})
  ];
  return{id:t.id+'|'+option,title:t.name,nodes,edges:[E('inputs','transform',ins),E('transform','ownership',outs),E('transform','implementation',L('implementation of the same operation','同一操作的实现'),'residual')],input:nodes[0].input,output:nodes[2].output,notation:[['P',L('ranks in this group','此组内 rank 数')],['C',L('logical vector element count; divisible by P when equally sharded','逻辑向量元素数，均分时应可被 P 整除')],['K',L('elements sent to each peer in fixed-size AllToAll','定长 AllToAll 发往各 peer 的元素数')],['r, root',L('rank index and designated root','rank 索引与指定 root')],...(implementationLesson.notation||[])],scope:rooted?L('Only the documented root inputs/outputs are defined. Non-root buffers do not become extra sources or results.','仅文档规定的 root 输入 / 输出有定义，非 root 缓冲区不会成为额外来源或结果。'):L('Logical ownership first; the implementation schedule is an expandable part of the same contract.','先理解逻辑所有权，再展开同一契约的实际实现调度。')};
 }
 function strategy(t,option,mode){
  const train=mode==='Training',l=selectedLesson(t,option,mode),P='P',hidden='[B,T,D]',param='[D,F]',grads='[D,F]';
  const recipes={
   'data-parallel':[['Global batch','全局批次','[B,T]','[B/P,T]','Split examples across replicas; each replica retains all model parameters.','沿样本拆分，各副本保留完整模型参数。','batchᵣ = batch shard'],['Run local model','运行本地模型','[B/P,T]','[B/P,T,V]','Compute independent examples with identical weights.','以相同权重独立计算各样本。','logitsᵣ = fθ(batchᵣ)'],...(train?[['Compute local gradients','计算本地梯度','local loss','∇θᵣ [|θ|]','Backpropagate on the local examples.','对本地样本反向传播。','gᵣ = ∂ℒᵣ/∂θ'],['Synchronize gradients','同步梯度','P × [|θ|]','[|θ|] per rank','Reduce and scale gradients consistently with the loss reduction and local batch sizes.','按损失归约方式及各本地批量，正确归约并缩放梯度。','g = reduce(gᵣ); θ ← optimizer(θ,g)']]:[['Return local predictions','返回本地预测','[B/P,T,V]','per-request tokens','Requests are independent; inference does not synchronize parameter gradients.','请求相互独立，推理不进行参数梯度同步。','tokens = decode(logitsᵣ)']])],
   'tensor-parallel':[['Place parameter shards','放置参数分片','W [D,F]','Wᵣ [D,F/P] or [D/P,F]','Column splits output features; row splits input features.','列切分输出特征，行切分输入特征。',option],['Compute local products','计算本地乘积',option==='Row-parallel'?'Xᵣ [...,D/P]':'X [...,D]',option==='Row-parallel'?'partial Yᵣ [...,F]':'Yᵣ [...,F/P]','Each rank performs the matrix product with its own weight shard.','各 rank 用自己的权重分片执行矩阵乘。',option==='Row-parallel'?'partial Yᵣ = Xᵣ Wᵣ':'Yᵣ = X Wᵣ'],['Restore the required layout','恢复所需布局','local outputs','Y [...,F] or sharded Y','Row partials are summed; column outputs can stay sharded or be gathered. A paired column→row MLP avoids an intermediate gather.','行部分和需相加；列输出可保持分片或拼接。成对列→行 MLP 可避免中间收集。','row: Y = Σᵣ partial Yᵣ; column: concat(Yᵣ)']],
   'pipeline-parallel':[['Partition model depth','沿模型深度划分','L layers','L/P layers per stage','Each stage owns different layer weights and optimizer state.','各阶段持有不同层权重及优化器状态。','model = stage₀ ∘ … ∘ stageP−1'],['Split into microbatches','拆分微批次','[B,T,D]','M × [B/M,T,D]','Microbatches allow different stages to work concurrently.','微批次允许不同阶段并行工作。','B = M × b'],['Execute the selected schedule','执行所选调度','microbatch activation','activation [b,T,D] per boundary','The selected schedule determines forward/backward order, bubbles, activation lifetimes and weight-version requirements.','所选调度决定前向 / 反向顺序、气泡、激活生命周期及权重版本要求。',option],[train?'Return gradients through stages':'Complete and retire requests',train?'跨阶段传回梯度':'完成并移出请求','activation / gradient','loss + gradients / response',train?'Send activation gradients in reverse stage order and update with the schedule’s optimizer semantics.':'Return completed responses while independent requests continue.',train?'沿反向阶段顺序传输激活梯度，并遵循该调度的优化器语义。':'返回已完成响应，其余独立请求继续。',train?'∂ℒ/∂activation → previous stage':'response → client']],
   'sequence-parallel':[['Shard tokenwise activations','切分逐 token 激活',hidden,'[B,T/P,D]','Sequence parallelism shards activation storage for tokenwise operators while tensor-parallel groups handle matrix products.','序列并行切分逐 token 算子的激活存储，矩阵乘由张量并行组承担。','split along T'],['Run tokenwise work locally','本地执行逐 token 运算','[B,T/P,D]','[B,T/P,D]','Normalization/dropout can process local token rows without gathering all positions.','归一化 / dropout 可处理本地 token 行，无需收集全部位置。','local norm / dropout'],['Change layout for matrix work','为矩阵运算变换布局','[B,T/P,D]','TP input/output layouts','Use all-gather or reduce-scatter at the appropriate tensor-parallel boundaries; this is not context-sharded attention.','在相应 TP 边界使用 all-gather 或 reduce-scatter；它不是上下文切分注意力。','all-gather ↔ reduce-scatter']],
   'context-parallel':[['Own local query positions','持有本地查询位置','Q,K,V [B,H,T,d]','local Q,K,V [B,H,T/P,d]','Split long context positions across ranks. Each rank computes outputs for its own queries.','沿长上下文位置拆分，各 rank 计算自身查询的输出。','T positions → P shards'],['Visit remote KV blocks','访问远端 KV 块','local Q + all visible KV blocks','score tile [B,H,T/P,T/P]','Exchange KV blocks and respect global causal positions; local queries still need remote visible history.','交换 KV 块并遵守全局因果位置，本地查询仍需远端可见历史。','scores = Qlocal Kblockᵀ / √d'],['Merge online attention state','合并在线注意力状态','score/value tiles','Olocal [B,H,T/P,dv]','Rescale running softmax statistics before merging each block; do not average independently normalized outputs.','合并每块前重新缩放在线 softmax 统计量，不能简单平均各块独立归一化输出。','(m,ℓ,u) → Olocal = u/ℓ']],
   'expert-parallel':[['Route tokens to experts','将 token 路由到专家','X [tokens,D]','top-k expert IDs and gates','The router chooses experts and weights for each token; different experts may reside on different ranks.','路由器为各 token 选择专家及权重，不同专家可分布在不同 rank。','top-k(router(X))'],['Dispatch by owner','按所有者分发','token/expert assignments','X_e [tokens_e,D]','AllToAll(v) moves selected token copies to the expert owners; counts can differ per peer.','AllToAll(v) 将所选 token 副本发到专家所有者，各 peer 数量可不同。','token → owner(expert)'],['Run local expert FFNs','运行本地专家 FFN','X_e [tokens_e,D]','Y_e [tokens_e,D]','Experts process only the tokens they receive. Load balance and capacity policies affect admitted work.','专家仅处理收到的 token，负载均衡与容量策略影响实际处理量。','Y_e = Expert_e(X_e)'],['Return and combine','返回并组合','expert outputs + gates','Y [tokens,D]','Restore original token ordering and sum expert outputs with the corresponding routing weights.','恢复原 token 顺序，并按相应路由权重求和。','Y_t = Σe g_te Y_te']],
   'hybrid-parallel':[['Form independent rank groups','构建不同 rank 组','P ranks','DP × TP × PP coordinates','Ranks have separate data, tensor and pipeline coordinates; each collective uses its own process group.','各 rank 具有独立数据、张量及流水线坐标，每种通信使用自身进程组。','P = DP × TP × PP'],['Split depth and tensor axes','拆分深度及张量轴','model weights','layers/stage and tensor shards','Pipeline stages own depth; tensor groups split matrix dimensions inside each stage.','流水线阶段持有不同深度，各阶段内部由张量组切分矩阵维。','W(layer, row, col) → stage / TP rank'],['Replicate across data groups','跨数据组复制','same model shard','independent local batches','Data replicas process independent examples and synchronize corresponding parameter gradients during training.','数据副本处理不同样本，训练时同步对应参数分片的梯度。','DP groups connect matching shards']],
   'replica-serving':[['Queue independent requests','排队独立请求','prompt token sequences','per-request state','A router selects an available replica using queue, latency and capacity information.','路由器根据队列、延迟及容量选择可用副本。','request → replica'],['Run a complete model replica','运行完整模型副本','prompt + local KV state','token logits','Each replica owns its model and request state; no gradient reduction is needed for serving.','各副本持有模型及请求状态，服务阶段无需梯度归约。','logits = fθ(prompt, cache)'],['Stream responses','流式返回响应','generated tokens','response stream','Return tokens and release the request’s cache when it finishes.','返回 token，并在请求结束时释放其缓存。','EOS / limit → retire request']],
   'prefill-decode':[['Prefill prompt tokens','预填充提示 token','IDs [B,T]','KV [B,Hkv,T,dk+dv]','Prefill computes prompt positions in parallel and creates the cache for the exact model and cache format.','预填充并行计算提示位置，并为确定模型及缓存格式创建 KV。','prompt → KV + first logits'],['Transfer cache ownership','转移缓存所有权','prefill KV','decode-compatible KV','Transfer all required layers, positions and metadata before decoding; layout and model versions must match.','解码前传输所需各层、位置及元数据，布局与模型版本必须匹配。','prefill worker → decode worker'],['Decode incrementally','逐 token 解码','new token + history KV','one token + appended KV','Decode reads historical KV and appends the current position. Moving the phase does not eliminate cache dependency.','解码读取历史 KV，并追加当前位置；迁移阶段并不会消除缓存依赖。','KV length S → S+1']],
   'fsdp':[['Persist parameter shards','持久保存参数分片','θ [|θ|]','θᵣ [|θ|/P]','Each rank keeps only its persistent parameter shard between computation windows.','各 rank 在计算窗口之间仅保留自身参数分片。','shard θ across P'],['Gather the active module','收集当前模块','θᵣ shards','full active-module θ','Gather the module parameters just before using them; other modules can remain sharded.','在使用前收集当前模块参数，其他模块可保持分片。','all-gather(active module)'],['Compute and reshard','计算并重新分片','active weights + local examples','local activations / parameter shard','Run the module, then release gathered weights according to the reshard policy.','执行模块，再按重新分片策略释放收集的权重。','module forward/backward'],['Reduce-scatter gradients','归约并分片梯度','full module gradient','gradient shard [|θmodule|/P]','Training reduces gradients to their owners and updates optimizer shards; inference omits backward and optimizer state.','训练将梯度归约到所有者并更新优化器分片；推理省略反向与优化器状态。','reduce-scatter → local optimizer']],
   'zero':[['Choose persistent ownership','选择持久所有权','parameters + gradients + optimizer','stage-dependent shards','Stage 1 shards optimizer state; stage 2 also shards gradients; stage 3 also shards parameters.','阶段 1 切分优化器状态，阶段 2 再切分梯度，阶段 3 再切分参数。',option],['Materialize required parameters','物化所需参数','replicated θ or θ shards','active complete parameter group','Only stage 3 requires gathering parameter shards before use. Other stages retain replicated parameters.','仅阶段 3 需在使用前收集参数分片，其他阶段保持参数复制。','stage 3: all-gather(θ shards)'],['Compute and reduce gradients','计算并归约梯度','local loss','replicated or partitioned gradients','Match the selected stage’s gradient ownership; partitioned gradients are reduced to their owners.','匹配所选阶段的梯度所有权，分片梯度归约到其所有者。','reduce / reduce-scatter(g)'],['Update owned optimizer state','更新所属优化器状态','gradient shard + optimizer shard','updated parameter shards / replicas','Optimizer owners update their parameters; propagate the new parameters as required by the selected stage.','优化器所有者更新相应参数，再按所选阶段要求传播新参数。','optimizer(shard) → parameter synchronization']],
   'gradient-accumulation':[['Reuse weights for K microsteps','复用权重执行 K 个微步','microbatch [b,T]','K local losses','Keep parameters fixed while multiple microbatches contribute to one effective update.','多个微批次为一次有效更新贡献梯度，期间保持参数不变。','effective batch = b × K × DP'],['Accumulate correctly scaled gradients','累积正确缩放的梯度','K × g_micro','g_accum [|θ|]','Scale consistently with the loss definition and sample counts. Avoid a full optimizer update per microbatch.','按损失定义与样本数一致缩放，不能每个微批次执行完整优化器更新。','g_accum = Σk scaled(g_k)'],['Synchronize and update once','同步并更新一次','g_accum','updated θ','Delay gradient synchronization where supported, then perform one optimizer step and clear accumulated gradients.','在支持时延后梯度同步，再执行一次优化器更新并清空累积梯度。','all-reduce → optimizer → zero_grad']],
   'activation-checkpointing':[['Save selected boundaries','保存选定边界','forward activations','checkpoint tensors','Save selected inputs/boundaries while discarding many internal activations.','保存选定输入 / 边界，丢弃多个内部激活。','store checkpoints, discard intermediates'],['Recompute during backward','反向时重新计算','checkpoint + same weights/RNG','recreated intermediates','Re-run the required forward region with consistent parameters and random-number semantics.','以一致参数及随机数语义重新执行所需前向区域。','recompute f(region)'],['Apply the chain rule','应用链式法则','recreated intermediates','input / weight gradients','Use the recreated tensors for backward, trading extra compute for lower saved-activation memory.','用重建张量执行反向，以额外计算换更低激活存储。','VJP(recomputed region)']],
   'overlap':[['Produce independent buckets','生成独立桶','ready tensor segments','buckets with readiness events','Group tensors so communication can start when each bucket is ready.','按桶分组，使各桶就绪后即可启动通信。','producer → ready event'],['Launch communication early','提前启动通信','ready bucket','in-flight collective','Independent compute proceeds while communication runs, subject to stream and dependency ordering.','通信期间继续独立计算，但需遵守流与依赖顺序。','compute ∥ communication'],['Wait before consumption','消费前等待完成','completion event','correct consumed data','A consumer must wait for the bucket’s collective to complete. Overlap never removes a true data dependency.','消费者必须等待该桶通信完成；重叠不能删除真实数据依赖。','wait(event) → consume']],
   'continuous-batching':[['Track live requests','跟踪活跃请求','queued / running requests','active token slots','Each request has its own prompt length, decode position and KV allocation.','各请求具有独立提示长度、解码位置与 KV 分配。','request table + KV blocks'],['Schedule the next iteration','调度下一迭代','active request state','packed token work','Pack ready decode tokens and admitted prefill chunks within token/memory budgets.','在 token / 内存预算内打包就绪解码 token 及可接纳预填充块。','scheduler(active, budget)'],['Retire and refill','完成并补入请求','new logits / EOS','updated batch and KV ownership','Remove completed requests, free their cache, and admit waiting work at iteration boundaries.','在迭代边界移除完成请求、释放缓存并接纳等待工作。','finish → free → admit']],
   'kv-cache':[['Project new token keys and values','投影新 token 的键和值','Xnew [B,1,D]','Knew,Vnew [B,Hkv,1,d]','Compute KV only for new positions with the model’s correct positional convention.','仅为新位置计算 KV，并遵守模型的位置约定。','Knew=XnewWk; Vnew=XnewWv'],['Append and retain history','追加并保留历史','historical KV + new KV','KV [B,Hkv,S+1,d]','KV stores historical key/value features per layer and request. Paged storage changes allocation, not the logical positions.','按层及请求保存历史键值特征；分页存储改变分配方式，不改变逻辑位置。','append along S'],['Read visible context','读取可见上下文','Qnew + cached KV','Onew [B,Hq,1,dv]','The query scores visible historical keys and reads matching values. Query states are temporary.','查询对可见历史键评分，再读取对应值；查询状态是临时量。','Onew = softmax(Qnew Kcacheᵀ/√dk+M)Vcache']],
   'gradient-compression':[['Encode the local gradient','编码本地梯度','g [|θ|]','compressed payload + metadata','Quantization, sparsification or low-rank encoding approximates the gradient and adds format metadata.','量化、稀疏化或低秩编码近似梯度，并添加格式元数据。','q = compress(g + residual)'],['Communicate in a compatible form','以兼容格式通信','compressed payload','reduced / exchanged payload','The collective and dtype must support the compression scheme; byte transport is not arithmetic reduction.','通信与数据类型必须支持该压缩方案，字节传输不等于算术归约。','scheme-specific communication'],['Decode and keep error feedback','解码并保留误差反馈','received payload','approximate gradient + residual','Decode for the optimizer and retain discarded error when using error feedback. Compression changes the numerical update.','解码后供优化器使用；采用误差反馈时保留丢弃误差，压缩会改变数值更新。','residual ← g − decompress(compress(g))']],
   'quantization':[['Choose scale and format','选择缩放及格式','float tensor X','scales / zero-points','Scale granularity, clipping and signed range define the quantizer.','缩放粒度、截断及有符号范围共同定义量化器。','q = clamp(round(X/s)+z)'],['Store or transfer low-bit values','存储或传输低比特值','q + scales','packed payload','Keep scale/format metadata with the values. Lower bit count alone does not guarantee a compatible fast kernel.','数值需附带缩放及格式元数据，更少比特本身不保证存在兼容快速内核。','float → packed q'],['Compute with the matching kernel','使用匹配内核计算','quantized weights / activations','accumulator → output tensor','Use a kernel that implements the intended scaling, accumulation precision and output conversion.','使用实现相应缩放、累加精度及输出转换的内核。','Y ≈ dequant(qX) dequant(qW)']]
  };
  let rows=recipes[t.id];if(!rows)throw Error('Missing workflow recipe: '+t.id);
  if(t.id==='fsdp'&&!train)rows=rows.slice(0,3);
  const frames=buildFrames(t,option,mode),nodes=rows.map(([en,zh,ish,osh,description,zdesc,equation],i)=>node('p'+i,en,zh,list('input',ish),list('output',osh),description,zdesc,equation,{focus:{option,frame:Math.min(frames.length-1,Math.floor(i*(frames.length-1)/Math.max(1,rows.length-1)))},glyph:i===0?'shard':/collect|gather|reduce|dispatch|synchron|transfer|exchange/i.test(en)?'ranks':'tensor'}));
  const g=chain(t.id+'|'+option+'|'+mode,t.name,nodes,{notation:notation(),scope:L('Logical workflow and ownership. Open a step for the selected layout, schedule or memory stage.','逻辑工作流与所有权。展开步骤可查看所选布局、调度或内存阶段。')});
  if(['continuous-batching','kv-cache','replica-serving','gradient-accumulation'].includes(t.id))g.edges.push(E(nodes.at(-1).id,nodes[0].id,L('next iteration','下一迭代'),'state'));
  return g;
 }
 function notation(){return [
  ['Ts, Tt, Tc',L('source, target and conditioning sequence lengths','源序列、目标序列及条件序列长度')],
  ['B, T, S',L('batch size, current sequence length, visible history/context length','批量大小、当前序列长度、可见历史 / 上下文长度')],
  ['Tq, Tk, Sprev',L('query positions, visible key positions, prior cache length; self-attention has Tk=Tq before adding history','查询位置数、可见键位置数、先前缓存长度；自注意力在加入历史前 Tk=Tq')],
  ['D, Dctx, F, V',L('model width, cross-attention context width, expanded FFN width, vocabulary size','模型宽度、交叉注意力上下文宽度、FFN 扩展宽度、词表大小')],
  ['Hq, Hkv, dk, dv',L('query heads, KV heads, key width, value width','查询头数、KV 头数、键宽、值宽')],
  ['M, b, θ',L('pipeline microbatch count, microbatch size, learned model parameters','流水线微批次数、微批次大小、学习模型参数')],
  ['P, L',L('P = ranks on strategy pages; P = features/head in SSM shapes. L = layers.','策略页 P 为 rank 数，SSM 形状中 P 为每头特征数；L 为层数。')],
  ['rKV, rQ, dN, dR',L('MLA KV/query latent widths, content-key width, positional-key width','MLA KV / 查询潜变量宽、内容键宽、位置键宽')],
  ['Nt, E, k, n, N',L('routed tokens, experts, selected experts/keys, residual streams, SSM state width (local to its operator)','路由 token 数、专家数、所选专家 / 键数、残差流数、SSM 状态宽（符号按算子局部定义）')],
  ['C, H, W',L('image channels, height, width when used as image axes; H in MLA means heads','图像维度中的通道数、高、宽；MLA 中 H 表示头数')],
  ['[ … ]',L('named tensor axes; parameter/activation dtypes follow the selected model or implementation','按顺序列出的张量轴；参数 / 激活类型按所选模型或实现定义')]
 ];}
 function build(t,option,mode){if(t.curriculum)return t.modelViews[option]?.scene==='overview'?model(t,option,mode):operator(t,option,mode);if(t.section==='communication')return collective(t,option);return strategy(t,option,mode);}
 function detail(t,n,option,mode){
  if(n.container==='encoder'){
   const hidden='[B,Ts,D]',attn=optionFor(t,'attention','Bidirectional'),ffn=optionFor(t,'feed-forward'),base=n.focus;
   const ns=[
    node('embed','Embed source tokens','嵌入源 token',n.input,list('X',hidden),'Look up source-token embeddings and add the encoder’s positional information.','查找源 token 嵌入并加入编码器位置信息。','X = E[IDs] + position',{focus:base,numerical:true}),
    node('attention','Read bidirectional context','读取双向上下文',list('X',hidden),list('A',hidden),'Every valid source position can attend every other source position. Padding is masked; there is no causal triangle.','各有效源位置可关注其他全部源位置；屏蔽填充，不使用因果三角。','A = Attention(X,X,X)',{operator:'attention',focus:{option:attn,frame:0}}),
    node('add1','Add residual and normalize','残差相加并归一化',[tensor('X',hidden),tensor('A',hidden)],list('H',hidden),'The original Transformer uses post-normalization. Other encoder families may place normalization before the branch.','原始 Transformer 使用后归一化；其他编码器家族可将归一化放在分支之前。','H = LayerNorm(X + A)',{focus:base,numerical:true}),
    node('ffn','Transform token features','变换 token 特征',list('H',hidden),list('F',hidden),'A tokenwise FFN expands D→F, applies an activation, then contracts F→D. It does not mix source positions.','逐 token FFN 扩展 D→F、应用激活再收缩 F→D，不混合源位置。','F = GELU(H W₁ + b₁) W₂ + b₂',{operator:'feed-forward',focus:{option:ffn,frame:1}}),
    node('add2','Complete the encoder block','完成编码器块',[tensor('H',hidden),tensor('F',hidden)],list('Y',hidden),'Add the second residual and normalize. Repeat the block with separate weights to produce encoder memory.','加上第二条残差并归一化；以独立权重重复模型块，形成编码器记忆。','Y = LayerNorm(H + F)',{focus:base,numerical:true})
   ];
   return {id:'encoder|'+t.id,title:n.label,nodes:ns,edges:[E('embed','attention'),E('attention','add1'),E('embed','add1','skip','residual'),E('add1','ffn'),E('ffn','add2'),E('add1','add2','skip','residual')],input:n.input,output:n.output,notation:notation(),scope:L('One representative encoder block, repeated with independent layer weights. Its output supplies cross-attention memory.','一个代表性编码器块，各层以独立权重重复；输出提供交叉注意力记忆。')};
  }

  if(t.curriculum&&/repeat.*block/i.test(n.label)){
   const g=model(t,option,mode),first=g.nodes.findIndex(x=>/norm/i.test(x.label)),last=g.nodes.findIndex(x=>/repeat.*block/i.test(x.label)),ns=g.nodes.slice(Math.max(0,first),last),ids=new Set(ns.map(x=>x.id));
   if(!ns.length)return calculation(t,{...n,focus:{option,frame:selectFrame(buildFrames(t,option,mode),n)}},mode);
   return {...g,id:g.id+'|block',title:n.label,nodes:ns,edges:g.edges.filter(e=>ids.has(e.from)&&ids.has(e.to)),input:list('X','[B,T,D]'),output:list('Y','[B,T,D]'),scope:L('One block. Each repeated layer has its own learned parameters; residual paths bypass the branches.','一个模型块。各重复层具有独立学习参数，残差路径绕过分支。')};
  }
  if(n.operator){const selected=n.focus.option;return operator(t,selected,mode);}
  if(n.focus.logical){
   const frames=semanticFrames(t,logicState.entry);
   if(n.numerical){const f=frames[Math.min(n.focus.frame,frames.length-1)],input=f.arithmetic?[tensor('accumulator = '+f.arithmetic.previous,'scalar'),tensor('x'+f.arithmetic.rank+'['+f.arithmetic.column+'] = '+f.arithmetic.value,'scalar')]:n.input,output=f.arithmetic?list('new accumulator = '+f.arithmetic.result,'scalar'):n.output;
    const operands=input.map((v,i)=>({id:'operand'+i,label:v.name,input:[v],output:[v],description:f.text,focus:n.focus,terminal:true})),action={...n,id:'action',input,output,terminal:true},result={id:'result',label:copy.output,input:output,output,description:f.text,focus:n.focus,terminal:true};
    return {id:'logical-calc|'+t.id+'|'+n.id,title:n.label,nodes:[...operands,action,result],edges:[...operands.map(v=>E(v.id,'action')),E('action','result')],input,output,notation:build(t,option,mode).notation};
   }
   const contract=build(t,option,mode),ns=frames.map((f,i)=>({id:'l'+i,label:f.title,input:f.arithmetic?[tensor('running sum + rank '+f.arithmetic.rank+' entry','two scalars')]:contract.input,output:f.arithmetic?list('running sum','scalar'):f.transfer?list('destination element','scalar / selected bucket'):contract.output,description:f.text,equation:f.equation,focus:{logical:true,frame:i},numerical:true}));
   return chain('logical|'+t.id,t.name,ns,{input:n.input,output:n.output,notation:build(t,option,mode).notation});
  }
  if(n.numerical)return calculation(t,n,mode);
  if(!t.curriculum&&!n.implementation)return calculation(t,n,mode);
  const opt=n.focus.option||option,frames=buildFrames(t,opt,mode);
  if(t.curriculum&&t.modelViews[opt]?.scene!=='overview')return operator(t,opt,mode);
  // A representative miniature remains available under each released model step.
  if(t.curriculum){
   const selected=selectFrame(frames,n),f=frames[selected];if(f?.story)return calculation(t,{...n,focus:{option:opt,frame:selected}},mode);
  }
  const l=selectedLesson(t,opt,mode),ns=l.steps.map(([title,text],i)=>({id:'a'+i,label:title,input:i===0?n.input:list('previous step',n.input.map(t=>t.shape).join(' + ')),output:i===l.steps.length-1?n.output:list('intermediate',n.output.map(t=>t.shape).join(' + ')),description:text,equation:l.formula,focus:{option:opt,frame:Math.min(frames.length-1,Math.round(i*(frames.length-1)/Math.max(1,l.steps.length-1)))},numerical:true}));
  return chain('detail|'+t.id+'|'+n.id,n.label,ns,{input:n.input,output:n.output,notation:l.notation,scope:[l.cost,l.costNote].filter(Boolean).join(' ')});
 }
 function calculation(t,n,mode){
  const option=n.focus.option,frames=buildFrames(t,option,mode),index=selectFrame(frames,n),f=frames[index];
  if(f.story){
   const s=f.story,nodes=s.panels.map((p,i)=>node('tensor'+i,p.name,p.name,list(p.name,'[1,'+p.values.length+','+p.values[0].length+']'),list(p.name,'[1,'+p.values.length+','+p.values[0].length+']'),p.id===s.output?'Computed result. Select a cell in the example to trace its operands.':'An operand tensor for this calculation. The values in the example are illustrative.',p.id===s.output?'计算结果。可在数值示例中选择单元格，追踪操作数。':'本次计算的操作数张量，数值为教学示例。',s.equation,{focus:{option,frame:index},terminal:true,glyph:p.id===s.output?'output':'tensor'}));
   const out=nodes.at(-1);return{id:'calc|'+t.id+'|'+index,title:s.title,nodes,edges:nodes.slice(0,-1).map(p=>E(p.id,out.id)),input:nodes.slice(0,-1).flatMap(n=>n.output),output:out.output,notation:notation(),scope:L('Illustrative numerical tensor shapes (B=1); the parent diagram uses symbolic model shapes.','此处为示意数值张量形状（B=1），父图使用模型符号形状。')};
  }
  const operands=n.input.map((v,i)=>({id:'operand'+i,label:v.name,input:[v],output:[v],description:L('Input to the selected action. Its axis order and retained/temporary role matter.','所选动作的输入，其轴顺序及持久 / 临时角色很重要。'),focus:n.focus,terminal:true,glyph:'tensor'}));
  const action={...n,id:'calculation',terminal:true};
  const results=n.output.map((v,i)=>({id:'result'+i,label:v.name,input:[v],output:[v],description:L('Output produced by the selected action.','所选动作产生的输出。'),focus:n.focus,terminal:true,glyph:'output'}));
  return {id:'calc|'+t.id+'|'+n.id,title:n.label,nodes:[...operands,action,...results],edges:[...operands.map(v=>E(v.id,action.id)),...results.map(v=>E(action.id,v.id))],input:n.input,output:n.output,notation:notation()};
 }
 function selectFrame(frames,n){
  if(n.focus.frame!==undefined)return n.focus.frame<0?frames.length-1:Math.min(n.focus.frame,frames.length-1);
  const q=String(n.focus.match||n.label).toLowerCase(),rules=[[/embed|token id/,/tokens become|patches become/],[/repeat|block/,/stabilize|normalize/],[/norm/,/stabilize|normalize/],[/mlp|swiglu|ffn|gelu|channel/,/expand the feature|choose experts|square positive/],[/head|logit|vocab/,/predict.*token|predict.*class/],[/loss|grad|target/,/learn from|measure.*error|loss|gradient/],[/state|rwkv|ssm|delta/,/state|memory/],[/residual/,/keep the original|complete one residual/],[/compress/,/compress|summary/],[/attention|gqa|mha|mla/,/query|question|content/]];
  let i=frames.findIndex(f=>f.title.toLowerCase()===q);if(i>=0)return i;
  for(const [src,dst]of rules)if(src.test(q)){i=frames.findIndex(f=>dst.test(f.title.toLowerCase()));if(i>=0)return i;}
  return 0;
 }
 return {copy,build,detail,calculation,selectFrame,notation,edgeLabel};
})();
