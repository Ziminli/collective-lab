/* Small executable models for mathematical storytelling. B=1; all weights below
   are teaching fixtures. Published topology and checkpoint sizes stay separate. */
const architectureOptions={hybrid:'delta'};
const MathLesson = (()=>{
 const sum=a=>a.reduce((s,x)=>s+x,0),dot=(a,b)=>sum(a.map((x,i)=>x*b[i]));
 const trans=a=>a[0].map((_,c)=>a.map(r=>r[c])),mm=(a,b)=>a.map(r=>trans(b).map(c=>dot(r,c)));
 const add=(a,b)=>a.map((r,i)=>r.map((x,j)=>x+b[i][j]));
 const map=(a,fn)=>a.map((r,i)=>r.map((v,j)=>fn(v,i,j))),scale=(a,s)=>map(a,x=>x*s);
 const soft=a=>{const e=a.map(x=>Math.exp(x-Math.max(...a))),z=sum(e);return e.map(x=>x/z);};
 const eye=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
 const fmt=x=>!Number.isFinite(x)?'−∞':Math.abs(x)<.00005?'0':String(+x.toFixed(3));
 const C={x:'#6bbcf4',w:'#e8bb62',q:'#6bddc5',k:'#b7a0f3',v:'#6bbcf4',a:'#e8bb62',o:'#f0f3f9',s:'#ee9bba'};
 const P=(id,name,values,color='x',role='')=>({id,name,values,color:C[color]||color,role,shape:values.length+' × '+values[0].length});
 const ref=(p,r,c)=>({p,r,c});
 const term=(formula,value,refs=[],operands=[])=>{let zh=formula;for(const [en,cn]of [['sum of row exponentials','该行指数项之和'],['future position','未来位置'],['row max','行最大值'],['denominator','分母'],['selected gate','所选门权重'],['predicted value','预测值'],['new state','新状态'],['noise correction','噪声修正'],['content scores','内容评分'],['rotary scores','位置评分'],['recent row stays exact','近期行保持精确'],['patch feature → token feature','图像块特征 → token 特征'],['expert ','专家 '],['masked','已屏蔽'],['error','误差'],['decay','衰减'],['loss','损失'],['sum /','和 /']])zh=zh.replaceAll(en,cn);if(typeof MT==='function')MT(formula,zh);return{formula,value,refs,operands};};
 const L=(en,zh)=>MT(en,zh);
 const chapter=(title,zh,text,zt,equation,panels,trace,extra={})=>({title:L(title,zh),text:L(text,zt),equation,panels,trace,output:panels.at(-1).id,defaultCell:[0,0],...extra});
 function multiply(title,zh,text,zt,A,B,name,id='Y',opts={}){
  const Y=mm(A.values,B.values),out=P(id,name,Y,opts.color||'o');
  return chapter(title,zh,text,zt,`${name} = ${A.name.replace(/ · .*/, '')} ${B.name.replace(/ · .*/, '')}`, [A,B,out],(r,c)=>{
   let s=0;const steps=A.values[r].map((a,i)=>{const b=B.values[i][c];s+=a*b;return term(`${fmt(a)} × ${fmt(b)} → ${fmt(s)}`,s,[ref(A.id,r,i),ref(B.id,i,c)],[a,b]);});
   return [...steps,term(`${name}[${r},${c}] = ${fmt(Y[r][c])}`,Y[r][c],[ref(id,r,c)])];
  },{operation:'multiply',defaultCell:[Math.max(0,Y.length-1),0],...opts});
 }
 function element(title,zh,text,zt,eq,A,B,Y,name,id='Y',fn=(a,b)=>a+b,opts={}){
  const panels=[A,...(B?[B]:[]),P(id,name,Y,opts.color||'o')];
  return chapter(title,zh,text,zt,eq,panels,(r,c)=>{const a=A.values[r][c],b=B?.values[r]?.[c];return [term(B?`${fmt(a)} ${opts.symbol||'+'} ${fmt(b)} = ${fmt(Y[r][c])}`:`${opts.functionLabel||name}(${fmt(a)}) = ${fmt(Y[r][c])}`,Y[r][c],[ref(A.id,r,c),...(B?[ref(B.id,r,c)]:[])],B?[a,b]:[a])];},{operation:'element',...opts});
 }
 function copy(title,zh,text,zt,A,Y,name,id='Y',source,opts={}){
  return chapter(title,zh,text,zt,`${name} ← ${A.name}`,[A,P(id,name,Y,opts.color||'o')],(r,c)=>{const [sr,sc]=source(r,c);return [term(`${name}[${r},${c}] ← ${A.name}[${sr},${sc}] = ${fmt(Y[r][c])}`,Y[r][c],[ref(A.id,sr,sc)],[Y[r][c]])];},{operation:'copy',...opts});
 }
 function normalize(A,layer=false){
  const stats=A.values.map(r=>{const mean=layer?sum(r)/r.length:0;return {mean,den:Math.sqrt(sum(r.map(x=>(x-mean)**2))/r.length+1e-5)};});
  const Y=A.values.map((r,i)=>r.map(x=>(x-stats[i].mean)/stats[i].den)),name=layer?'LayerNorm':'RMSNorm';
  return chapter('Stabilize feature scale','稳定特征尺度',
   'Normalize each token row independently. The miniature uses γ=1, bias=0, ε=0.00001; normalization never mixes tokens.',
   '逐 token 行独立归一化。小示例取 γ=1、偏置=0、ε=0.00001；归一化不混合 token。',
   layer?'Nᵢⱼ = (Xᵢⱼ − μᵢ) / √(mean((Xᵢ−μᵢ)²)+ε)':'Nᵢⱼ = Xᵢⱼ / √(mean(Xᵢ²)+ε)',[A,P('N','N',Y,'x')],(r,c)=>[
    term('μ = '+fmt(stats[r].mean),stats[r].mean,A.values[r].map((_,j)=>ref(A.id,r,j))),
    term('denominator = '+fmt(stats[r].den),stats[r].den,A.values[r].map((_,j)=>ref(A.id,r,j))),
    term(`(${fmt(A.values[r][c])} − ${fmt(stats[r].mean)}) / ${fmt(stats[r].den)} = ${fmt(Y[r][c])}`,Y[r][c],[ref(A.id,r,c)],[A.values[r][c],stats[r].den])],{operation:'normalize',tag:name});
 }
 function probabilities(A,id='A',name='A'){
  const Y=A.values.map(soft);
  return chapter('Turn scores into a distribution','将评分变为概率分布',
   'Softmax runs across the visible keys in each query row. Subtract the row maximum for stability. A masked −∞ has probability zero; every row sums to one.',
   'softmax 沿每个查询行的可见键计算。减去行最大值以保证稳定；被屏蔽的 −∞ 概率为零，每行概率之和为一。',
   `${name}ᵢⱼ = exp(Sᵢⱼ − max Sᵢ) / Σₖ exp(Sᵢₖ − max Sᵢ)`,[A,P(id,name,Y,'a')],(r,c)=>{
    const m=Math.max(...A.values[r]),e=A.values[r].map(x=>Math.exp(x-m)),z=sum(e);
    return [term('row max = '+fmt(m),m,A.values[r].map((_,j)=>ref(A.id,r,j))),term(`exp(${fmt(A.values[r][c])} − ${fmt(m)}) = ${fmt(e[c])}`,e[c],[ref(A.id,r,c)]),term('sum of row exponentials = '+fmt(z),z,A.values[r].map((_,j)=>ref(A.id,r,j))),term(`${fmt(e[c])} / ${fmt(z)} = ${fmt(Y[r][c])}`,Y[r][c],[ref(A.id,r,c)],[e[c],z])];
   },{operation:'softmax',defaultCell:[Y.length-1,0]});
 }
 function scores(Q,K,head,causal=true,extra={}){
  const Y=Q.values.map((q,r)=>K.values.map((k,c)=>causal&&c>r?-Infinity:dot(q,k)/Math.sqrt(q.length)));
  return chapter('Compare queries with keys · head '+head,'查询与键比较 · 头 '+head,
   causal?'Each cell compares one query row with one key row. The triangular mask prevents a token reading the future. Select another output cell to follow a different comparison.':'Each query may read every context row. This is bidirectional or cross-attention: no future mask is applied.',
   causal?'每个单元格比较一个查询行与一个键行。三角掩码阻止 token 读取未来。选择其他输出单元格可追踪不同的比较。':'每个查询可读取全部上下文行。这是双向或交叉注意力，不使用未来掩码。',
   'Sᵢⱼ = qᵢ·kⱼ / √d + Mᵢⱼ; d = '+Q.values[0].length,[Q,K,P('S'+head,'S'+head,Y,'a')],(r,c)=>{
    if(causal&&c>r)return [term('j > i: masked → −∞',-Infinity,[ref(Q.id,r,0),ref(K.id,c,0)])];
    let acc=0;return [...Q.values[r].map((x,i)=>{const y=K.values[c][i];acc+=x*y;return term(`${fmt(x)} × ${fmt(y)} → ${fmt(acc)}`,acc,[ref(Q.id,r,i),ref(K.id,c,i)],[x,y]);}),term(`${fmt(acc)} / √${Q.values[0].length} = ${fmt(Y[r][c])}`,Y[r][c],[],[acc,Math.sqrt(Q.values[0].length)])];
   },{defaultCell:[Y.length-1,0],operation:'score',head,...extra});
 }
 function attention(N,gqa,causal=true,mla=false){
  const chapters=[],X=N.values,Wq=[[1,.5,0,0],[0,1,.5,0],[0,0,1,.5],[.5,0,0,1]],Wk=gqa?[[1,0],[0,1],[.5,0],[0,.5]]:scale(eye(4),.5),Wv=gqa?[[.5,0],[0,.5],[0,.5],[.5,0]]:[[1,0,0,0],[0,1,0,0],[0,0,.5,.5],[.5,0,0,.5]];
  let qs=multiply('Ask a question at each position','各位置生成查询','Q is a learned projection of token features. Two 2-feature query heads are slices of this 4-feature result.','Q 是 token 特征的学习投影。两个二维查询头是此四维结果的特征切片。',N,P('WQ','WQ',Wq,'w'),'Q','Q');
  if(mla){const cq=multiply('Compress the temporary query','压缩临时查询','The query has its own learned 4→2 down-projection. Unlike C_KV, cQ is temporary: it is not appended to the history cache.','查询有独立的学习 4→2 下投影。与 C_KV 不同，cQ 是临时量，不追加到历史缓存。',N,P('WDQ','W_DQ',[[1,0],[0,1],[0,1],[1,0]],'w'),'cQ','cQ');chapters.push(cq);qs=multiply('Expand distinct query heads','展开不同查询头','Expand cQ into two content query heads. The positional query path is separately rotated below. Query and history compression use different learned weights.','将 cQ 展开为两个内容查询头；位置查询分支在后面单独旋转。查询与历史压缩使用不同学习权重。',cq.panels.at(-1),P('WUQ','W_UQ',[[1,0,0,1],[0,1,1,0]],'w'),'Q_C','Q');}
  chapters.push(qs);
  let K,V;
  if(mla){
   const c=multiply('Compress the history once','历史只压缩一次','A learned 4→2 down-projection makes C_KV. Both content keys and values come from this shared latent; it is the persistent content cache.','学习到的 4→2 下投影生成 C_KV。内容键和值来自此共享潜变量，它是持久内容缓存。',N,P('WD','W_DKV',[[1,0],[0,1],[1,0],[0,1]],'w'),'C_KV','C');c.panels.at(-1).role='cache';chapters.push(c);
   const rot=multiply('Keep the positional path separate','单独保留位置分支','RoPE acts on a separate key slice. Cache this positional slice alongside C_KV. Current-token Q is temporary. The next step rotates each pair.','RoPE 作用于独立键切片。位置切片与 C_KV 一起缓存；当前 token 的 Q 是临时量。下一步旋转每对特征。',N,P('WKR','W_KR',[[1,0],[0,0],[0,0],[0,1]],'w'),'K_R raw','KRraw');chapters.push(rot);
   const raw=rot.panels.at(-1),rotated=raw.values.map(([a,b],r)=>{const angle=r*Math.PI/2;return [a*Math.cos(angle)-b*Math.sin(angle),a*Math.sin(angle)+b*Math.cos(angle)];});
   chapters.push(chapter('Rotate only the positional slice','仅旋转位置切片','Positions use angles 0°, 90°, 180° in this miniature. The content latent remains unrotated. Both cached tensors grow by one row at decode.','小示例三个位置的角度为 0°、90°、180°；内容潜变量不旋转。解码时两个缓存张量各增长一行。','[a,b] → [a cosθ−b sinθ, a sinθ+b cosθ]',[raw,c.panels.at(-1),P('KR','K_R · cache',rotated,'k')],(r,j)=>[term(`θ = ${r*90}°; result = ${fmt(rotated[r][j])}`,rotated[r][j],[ref(raw.id,r,0),ref(raw.id,r,1)],[raw.values[r][0],raw.values[r][1]])],{operation:'rotation',tag:L('PERSISTENT: C_KV + K_R','持久缓存：C_KV + K_R')}));
   const k=multiply('Understand the content keys','理解内容键','Expand C_KV conceptually with W_UK. This explains the keys; optimized decode scores cached latents by absorbing W_UK into the query instead.','以 W_UK 概念展开 C_KV 来解释内容键；优化解码将 W_UK 吸收到查询中，直接对缓存潜变量评分。',c.panels.at(-1),P('WUK','W_UK',[[1,.5,1,1],[.25,1,1,-1]],'w'),'K_C','K');chapters.push(k);K=k.panels.at(-1);
   const v=multiply('Recover values from the same latent','由同一潜变量恢复值','A different up-projection produces V from C_KV. Expanded K_C and V are explanatory intermediates, not additional compact-cache tensors.','不同上投影从 C_KV 产生 V。展开的 K_C、V 是解释用中间量，不是额外的紧凑缓存。',c.panels.at(-1),P('WUV','W_UV',[[1,0,2,0],[0,1,0,1]],'w'),'V','V',{color:'v'});chapters.push(v);V=v.panels.at(-1);
   // Separate rotary query, using a 2-feature miniature query projection.
   const qr=qs.panels.at(-1).values.map((r,i)=>{const a=r[0],b=r[1],th=i*Math.PI/2;return[a*Math.cos(th)-b*Math.sin(th),a*Math.sin(th)+b*Math.cos(th)];});
   const cachedKR=chapters.find(ch=>ch.operation==='rotation').panels.at(-1);cachedKR.role='cache';
   extraMLA={C:c.panels.at(-1),KR:cachedKR,QR:qr};
   const CQ=P('Qcontent','Q_C · head 0',qs.panels.at(-1).values.map(row=>row.slice(0,2)),'q');
   chapters.push(multiply('Score the latent without expanding keys','不展开键也能评分','For head 0, absorb the key up-projection into Q_C. (Q_C W_UKᵀ) C_KVᵀ equals Q_C (C_KV W_UK)ᵀ exactly. The separate positional score is still added.','对头 0，将键上投影吸收到 Q_C。(Q_C W_UKᵀ) C_KVᵀ 与 Q_C (C_KV W_UK)ᵀ 完全相等；位置评分仍需单独相加。',CQ,P('UKtranspose','W_UK,0ᵀ',trans(k.panels[1].values.map(row=>row.slice(0,2))),'w'),'Q_latent','QL'));
  }else{
   const k=multiply(gqa?'Share fewer key heads':'Project keys',gqa?'共享较少的键头':'投影键',gqa?'Two query heads share one 2-feature KV head here. Grouping saves KV-cache space; it does not force their attention distributions to match.':'K describes what each position offers. It is used for matching, while V supplies the content to read.',gqa?'示例两个查询头共享一个二维 KV 头。分组节省 KV 缓存，但不同查询头的注意力分布仍可不同。':'K 描述各位置提供什么，用于匹配；V 提供实际读取的内容。',N,P('WK','WK',Wk,'w'),'K','K',{color:'k'});chapters.push(k);K=k.panels.at(-1);
   const v=multiply('Project the values to read','投影实际读取的值','The value projection changes features independently at each position. Attention will combine these rows using learned relevance weights.','值投影独立变换各位置特征；注意力将根据相关性权重组合这些行。',N,P('WV','WV',Wv,'w'),'V','V',{color:'v'});chapters.push(v);V=v.panels.at(-1);
  }
  const outputs=[];
  for(let h=0;h<2;h++){
   const Q=P('Qh'+h,'Q · head '+h,qs.panels.at(-1).values.map(r=>r.slice(h*2,h*2+2)),'q'),Kh=P('Kh'+h,gqa?'K · shared':'K · head '+h,K.values.map(r=>gqa?r:r.slice(h*2,h*2+2)),'k'),Vh=P('Vh'+h,gqa?'V · shared':'V · head '+h,V.values.map(r=>gqa?r:r.slice(h*2,h*2+2)),'v');
   let s=scores(Q,Kh,h,causal);
   if(mla){
    const d=extraMLA;
    const cont=multiply('Score the content branch · head '+h,'计算内容分支评分 · 头 '+h,'Each query content vector dots with each expanded content key. There is no positional contribution in this matrix yet.','每个内容查询向量与各展开内容键点积；此矩阵尚不含位置贡献。',Q,P('KCT'+h,'K_Cᵀ',trans(Kh.values),'k'),'content scores','Content'+h);chapters.push(cont);
    const rot=multiply('Score the positional branch · head '+h,'计算位置分支评分 · 头 '+h,'The rotated query dots with the separately cached rotary keys. This produces a second score matrix, not a second softmax.','旋转查询与单独缓存的旋转键点积；这生成第二个评分矩阵，而不是第二次 softmax。',P('QR'+h,'Q_R',d.QR,'q'),P('KRT','K_Rᵀ · cached',trans(d.KR.values),'k'),'rotary scores','Rotary'+h);chapters.push(rot);
    const A=cont.panels.at(-1),B=rot.panels.at(-1),Y=map(A.values,(v,r,j)=>causal&&j>r?-Infinity:(v+B.values[r][j])/2);
    s=chapter('Combine, scale and mask · head '+h,'组合、缩放与掩码 · 头 '+h,'Add the two score matrices, divide by √(dN+dR)=√4=2, and mask future positions. Only then apply one softmax across visible history.','两评分矩阵相加，除以 √(dN+dR)=√4=2，并屏蔽未来位置；然后才沿可见历史做一次 softmax。','S = (content + rotary) / 2 + causal mask',[A,B,P('S'+h,'S'+h,Y,'a')],(r,j)=>causal&&j>r?[term('future position → −∞',-Infinity)]:[term(`(${fmt(A.values[r][j])} + ${fmt(B.values[r][j])}) / 2 = ${fmt(Y[r][j])}`,Y[r][j],[ref(A.id,r,j),ref(B.id,r,j)],[A.values[r][j],B.values[r][j]])],{defaultCell:[2,0],operation:'mla-score',head:h});
   }
   chapters.push(s);const a=probabilities(s.panels.at(-1),'A'+h,'A'+h);chapters.push(a);
   const o=multiply('Read weighted content · head '+h,'读取加权内容 · 头 '+h,'A row of attention weights multiplies the matching V rows. The sum is a new feature vector for that query, not a copied token ID.','一行注意力权重乘对应 V 行并求和，为该查询产生新特征向量；它不是复制的 token ID。',a.panels.at(-1),Vh,'O'+h,'O'+h,{defaultCell:[2,0],head:h});chapters.push(o);outputs.push(o.panels.at(-1));
  }
  const merged=outputs[0].values.map((r,i)=>[...r,...outputs[1].values[i]]);
  chapters.push(chapter('Reunite the heads','合并各个头','Concatenate along the feature axis. Each head has a different query slice; GQA shares KV, not output. W_O=I₄ in this miniature. Real W_O learns to mix heads.','沿特征轴拼接。各头查询切片不同；GQA 共享 KV，不共享输出。小示例 W_O=I₄；真实 W_O 学习混合不同头。','O = concat(O₀,O₁) W_O; W_O = I₄',[...outputs,P('O','O',merged)],(r,c)=>{const h=c<2?0:1,k=c%2;return [term(`O[${r},${c}] ← O${h}[${r},${k}] = ${fmt(merged[r][c])}`,merged[r][c],[ref(outputs[h].id,r,k)],[merged[r][c]])];},{operation:'concat'}));
  return chapters;
 }
 let extraMLA;
 function recurrence(N,kind){
  const chapters=[],X=N.values,read=[];let S=[[0,0],[0,0]];
  for(let t=0;t<X.length;t++){
   const k=X[t].slice(0,2),v=X[t].slice(2),old=S,dec=scale(S,.8),write=v.map(x=>k.map(y=>x*y));let updated,formula;
   if(kind==='delta'){
    // Delta convention is key × value.
    const pred=k.map((_,j)=>sum(k.map((x,i)=>x*dec[i][j]))),error=v.map((x,i)=>x-pred[i]);
    updated=dec.map((row,i)=>row.map((x,j)=>x+.5*k[i]*error[j]));formula='Sₜ = 0.8 Sₜ₋₁ + 0.5 kₜ (vₜ − kₜᵀ·0.8Sₜ₋₁)ᵀ';
    const A=P('Sprev'+t,'old S',old,'s'),K=P('kv'+t,'[key; value]',[k,v],'q');
    chapters.push(chapter('Correct the memory · token '+t,'修正记忆 · token '+t,'Decay the old key×value state, predict the value for this key, then write half the prediction error. Fixed 2×2 state replaces a growing KV history. This is a single-head gated DeltaNet core.','衰减旧的键维×值维状态，预测此键对应的值，再写入一半预测误差。固定 2×2 状态代替增长的 KV 历史；这是单头门控 DeltaNet 核心。',formula,[A,K,P('S'+t,'new S',updated,'s')],(r,c)=>[term('decay = '+fmt(dec[r][c]),dec[r][c],[ref(A.id,r,c)],[old[r][c],.8]),term('predicted value = '+fmt(pred[c]),pred[c],dec.map((_,i)=>ref(A.id,i,c))),term(`error = ${fmt(v[c])} − ${fmt(pred[c])} = ${fmt(error[c])}`,error[c],[ref(K.id,1,c)]),term(`${fmt(dec[r][c])} + 0.5 × ${fmt(k[r])} × ${fmt(error[c])} = ${fmt(updated[r][c])}`,updated[r][c],[ref(K.id,0,r),ref(K.id,1,c)],[k[r],error[c]])],{operation:'recurrence'}));
   }else{
    const modifier=kind==='rwkv'?old.map(row=>{const a=.2*row[0];return[0,.3*a];}):[[0,0],[0,0]];
    updated=add(add(dec,modifier),write);formula=kind==='rwkv'?'Sₜ = Sₜ₋₁ diag(0.8) + (Sₜ₋₁ a)bᵀ + vₜkₜᵀ':'Sₜ = 0.8 Sₜ₋₁ + vₜkₜᵀ';
    const A=P('Sprev'+t,'old S',old,'s'),K=P('kv'+t,'[key; value]',[k,v],'q');
    chapters.push(chapter('Update recurrent state · token '+t,'更新递归状态 · token '+t,kind==='rwkv'?'The RWKV-7 core decays the value×key state, adds an old-state modifier with a=[0.2,0], b=[0,0.3], then writes vkᵀ. Gates and channel mixing are separate operators.':'This miniature illustrates the Mamba state-space recurrence using constant retention 0.8 and explicit write vectors. Real Mamba derives selective B,C,Δ from input and also uses short convolution, normalization and readout gates. This fixture isolates the state update/read; it does not add a Transformer FFN.',kind==='rwkv'?'RWKV-7 核心衰减值维×键维状态，加上旧状态修改项（a=[0.2,0]、b=[0,0.3]），再写入 vkᵀ。门控与通道混合是独立算子。':'此小示例以固定保留率 0.8、显式写入向量说明 Mamba 状态空间递推。真实 Mamba 从输入生成选择性 B、C、Δ，还使用短卷积、归一化与读出门控。示例单独说明状态更新 / 读取，不添加 Transformer FFN。',formula,[A,K,P('S'+t,'new S',updated,'s')],(r,c)=>[term(`0.8 × ${fmt(old[r][c])} = ${fmt(dec[r][c])}`,dec[r][c],[ref(A.id,r,c)],[.8,old[r][c]]),...(kind==='rwkv'?[term('(old S · a)bᵀ = '+fmt(modifier[r][c]),modifier[r][c],[ref(A.id,r,0)])]:[]),term(`${fmt(v[r])} × ${fmt(k[c])} = ${fmt(write[r][c])}`,write[r][c],[ref(K.id,1,r),ref(K.id,0,c)],[v[r],k[c]]),term('new state = '+fmt(updated[r][c]),updated[r][c])],{operation:'recurrence'}));
   }
   S=updated;const q=k,Y=kind==='delta'?mm([q],S):mm([q],trans(S)),A=P('readq'+t,'read q',[q],'q'),B=P('readstate'+t,kind==='delta'?'S':'Sᵀ',kind==='delta'?S:trans(S),'s');
   const o=multiply('Read the compressed history · token '+t,'读取压缩历史 · token '+t,'The current query reads a 2-feature summary from the updated state. The state shape stays fixed when the next token arrives.','当前查询从更新状态读取二维摘要；下一 token 到来时，状态形状保持不变。',A,B,'read','read'+t);chapters.push(o);read.push(Y[0]);
  }
  const a=P('Reads','reads',read,'s'),w=P('WR','W_read',[[1,0,.5,0],[0,1,0,.5]],'w');chapters.push(multiply('Return to the residual width','返回残差特征宽度','A learned projection returns each state read to four features. The result can now join the residual path; additional gates and channel mixing depend on the model.','学习投影把各状态读取结果变回四维；随后可加入残差路径；其他门控与通道混合取决于模型。',a,w,'O','O'));return chapters;
 }
 function feedForward(R,moe=false,squared=false,gelu=false){
  const chapters=[],Wup=[[.5,0,0,0,1,0],[0,.5,0,0,0,1],[0,0,.5,0,.5,0],[0,0,0,.5,0,.5]],Wd=[[.3,0,0,0],[0,.3,0,0],[0,0,.3,0],[0,0,0,.3],[.1,0,.1,0],[0,.1,0,.1]];
  if(moe){
   const router=multiply('Choose experts for each token','为各 token 选择专家','The router projects each token to four expert logits. The toy selects two; inactive experts do no work for that token. Expert identities and active parameter counts are different concepts.','路由器把各 token 投影为四个专家 logit。示例选择两个；未激活专家不处理该 token。专家总数与激活参数量是不同概念。',R,P('Wrouter','W_router',[[1,0,-1,0],[0,1,0,-1],[.5,0,0,.5],[0,.5,.5,0]],'w'),'router logits','router');chapters.push(router);
   const logits=router.panels.at(-1),gate=logits.values.map(row=>{const ids=row.map((_,i)=>i).sort((a,b)=>row[b]-row[a]).slice(0,2),p=soft(ids.map(i=>row[i]));return row.map((_,i)=>ids.includes(i)?p[ids.indexOf(i)]:0);});
   chapters.push(chapter('Keep top 2, normalize their weights','保留前二并归一化权重','Only the selected logits enter this toy softmax. Each row has two zero weights. Released routers may use sigmoid scores, bias correction or different normalization; consult the model operator notes.','仅所选 logit 进入示例 softmax；每行两个权重为零。具体发布可能使用 sigmoid、偏置校正或不同归一化，详见该模型算子说明。','g = normalize(top₂(router logits))',[logits,P('G','gates',gate,'a')],(r,c)=>[term('selected gate = '+fmt(gate[r][c]),gate[r][c],logits.values[r].map((_,i)=>ref(logits.id,r,i)))],{operation:'routing'}));
   const expert=R.values.map(row=>row.map(x=>Math.max(0,x))),out=R.values.map((row,r)=>row.map((_,c)=>sum(gate[r].map((g,e)=>g*expert[r][c]*(e+1)/4))));
   chapters.push(chapter('Evaluate and combine selected experts','运行并组合所选专家','For a readable example, expert e computes ReLU(x)·(e+1)/4. Multiply each selected expert output by its gate and sum. Real experts are learned FFNs; a shared-expert branch is additional where the release uses one.','为便于阅读，示例专家 e 计算 ReLU(x)·(e+1)/4。所选专家输出乘门权重后求和。真实专家为学习得到的 FFN；若具体发布使用共享专家，则另有共享分支。','F(x) = Σₑ gₑ Expertₑ(x)',[R,P('G','gates',gate,'a'),P('F','F',out)],(r,c)=>{let a=0;return gate[r].map((g,e)=>{const v=expert[r][c]*(e+1)/4;a+=g*v;return term(`expert ${e}: ${fmt(g)} × ${fmt(v)} → ${fmt(a)}`,a,[ref('G',r,e),ref(R.id,r,c)],[g,v]);});},{operation:'experts'}));return chapters;
  }
  const up=multiply('Expand the feature space','扩展特征空间','Each token is processed independently: four features become six. Attention mixes positions; the FFN mixes features at the same position.','独立处理各 token：四维变六维。注意力混合位置；FFN 在同一位置混合特征。',R,P('Wu','W_up',Wup,'w'),'U','U');chapters.push(up);
  const U=up.panels.at(-1),activation=x=>squared?Math.max(0,x)**2:gelu?.5*x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+.044715*x**3))):x/(1+Math.exp(-x)),A=map(U.values,activation);
  chapters.push(element(squared?'Square positive features':gelu?'Apply GELU':'Apply a smooth gate',squared?'将正特征平方':gelu?'应用 GELU':'应用平滑门控',squared?'Squared ReLU clips negatives, then squares. RWKV channel mixing also blends current and shifted inputs before projection.':gelu?'GELU smoothly weights features by magnitude. This fixture uses the standard tanh approximation.':'SiLU(x)=x·sigmoid(x). A full SwiGLU also multiplies this gate by a second learned up-projection; the next step shows that branch.',squared?'ReLU 平方先截断负值再平方；RWKV 通道混合还在投影前混合当前与移位输入。':gelu?'GELU 按幅值平滑加权特征；示例采用标准 tanh 近似。':'SiLU(x)=x·sigmoid(x)。完整 SwiGLU 还乘第二个学习上投影，下一步展示该分支。',squared?'A = ReLU(U)²':gelu?'A = GELU(U)':'A = SiLU(U)',U,null,A,'A','Act',null,{operation:'activation',functionLabel:squared?'ReLU²':gelu?'GELU':'SiLU'}));
  let activated=chapters.at(-1).panels.at(-1);
  if(!gelu&&!squared){const branch=mm(R.values,scale(Wup,.7)),B=P('Up2','X W₂',branch,'x'),Y=map(A,(x,r,c)=>x*branch[r][c]);chapters.push(element('Multiply gate and content','门与内容相乘','The second branch uses W₂=0.7 W_up in this fixture. Real SwiGLU learns the two matrices independently. The elementwise product keeps six features.','示例第二分支 W₂=0.7 W_up；真实 SwiGLU 两矩阵独立学习。逐元素乘积保持六维。','H = SiLU(X W_gate) ⊙ (X W_up)',activated,B,Y,'H','H',null,{symbol:'×',operation:'gate'}));activated=chapters.at(-1).panels.at(-1);}
  chapters.push(multiply('Contract back to four features','收缩回四维','The down projection restores the residual width. Six intermediate features are temporary; the skip path requires the same final shape as its input.','下投影恢复残差宽度。六维中间特征是临时量；跳连要求最终形状与输入相同。',activated,P('Wd','W_down',Wd,'w'),'F','F'));return chapters;
 }
 function decoder(topic,view,mode){
  const d=topic.modelData,id=topic.id,chapters=[],vit=d.kind==='vit',encoder=view.layout==='Encoder-only'||vit,ced=d.kind==='ced'||view.layout==='Encoder-decoder';
  const E=[[1,0,0,1],[0,1,1,0],[1,2,0,1],[2,0,1,1],[0,0,1,2],[1,1,1,1]],ids=[0,2,3],X=ids.map(i=>E[i]);
  const entry=vit?chapter('Patches become a token sequence','图像块变为 token 序列','Flatten three 2×2 grayscale patches, then project to width 4. This miniature uses identity patch projection and zero position embeddings. Real ViT adds learned positions and often a class token.','展平三个 2×2 灰度 patch，再投影为四维。示例取单位 patch 投影、零位置嵌入；真实 ViT 添加学习位置，常含分类 token。','X = flatten(patches) Wpatch + Epos',[P('patches','flattened patches',X,'x'),P('X','X',X,'x')],(r,c)=>[term('patch feature → token feature = '+fmt(X[r][c]),X[r][c],[ref('patches',r,c)],[X[r][c]])],{operation:'patch'}):copy('Tokens become feature vectors','token 变为特征向量','IDs [0,2,3] select embedding rows. Batch B=1, sequence T=3, width D=4. These small numbers are teaching weights, not a released checkpoint. Positional effects are isolated in the attention lessons.','ID [0,2,3] 选择嵌入行。批次 B=1、序列 T=3、宽度 D=4。这些小数值是教学权重，并非发布检查点；位置机制在注意力课程中单独说明。',P('E','E · embedding table',E,'w'),X,'X','X',(r,c)=>[ids[r],c]);chapters.push(entry);
  const layer=['gpt2','gpt3','transformer','vision-transformer','rwkv','rwkv7'].includes(id),norm=normalize(P('X','X',X),layer);chapters.push(norm);const N=norm.panels.at(-1);
  const isMLA=(d.attention||'').includes('MLA'),hybrid=['qwen3-next','qwen35','qwen38'].includes(id),recurrent=d.kind==='rwkv'?'rwkv':d.kind==='ssm'?'ssm':hybrid&&architectureOptions.hybrid==='delta'?'delta':null;
  let core;
  if(recurrent)core=recurrence(N,recurrent);
  else if(ced){
   const memory=multiply('Encode a shared memory','编码为共享记忆','This miniature starts from causal encoder features N and projects them into one shared 2-feature memory. Decoder layers reuse these K/V rows. The released CED also includes compression and other operators listed above.','示例从因果编码器特征 N 出发，投影为共享二维记忆；各解码层复用这些 K/V 行。发布的 CED 还含压缩及上方列出的其他算子。',N,P('Wmem','W_memory',[[1,0],[0,1],[.5,0],[0,.5]],'w'),'memory','Memory',{color:'k'});
   const Q=P('DQ','decoder Q',[[1,.5],[.5,1]],'q'),K=memory.panels.at(-1),s=scores(Q,K,0,false),a=probabilities(s.panels.at(-1)),o=multiply('Read encoder memory from the decoder','解码器读取编码器记忆','Two decoder queries read three shared memory rows. Query length and memory length can differ. K=V only in this teaching fixture; the real model has distinct projections.','两个解码器查询读取三行共享记忆；查询长度与记忆长度可不同。仅教学示例令 K=V；真实模型使用独立投影。',a.panels.at(-1),P('MV','shared V',K.values,'v'),'decoder read','DR');
   const proj=multiply('Project the decoder read','投影解码器读取结果','Restore decoder width 4. This chapter explains memory reuse; it does not execute the full encoder, local causal window, Engram or all decoder layers.','恢复解码器四维。此章节解释记忆复用，未执行完整编码器、局部因果窗口、Engram 或所有解码层。',o.panels.at(-1),P('WO','W_O',[[1,0,.5,0],[0,1,0,.5]],'w'),'O','O');
   if(d.kind!=='ced'){memory.text=L('The source encoder produces memory for cross-attention. Target decoder queries read it after causal self-attention. This miniature isolates cross-attention; it does not execute every encoder or decoder sublayer.','源编码器生成交叉注意力记忆；目标解码器在因果自注意力后以查询读取它。此小示例单独演示交叉注意力，未执行编码器 / 解码器的每个子层。');}
   return [...chapters,memory,s,a,o,proj,...head(proj.panels.at(-1),mode,false)];
  }else if(['deepseek-v4'].includes(id)){
   const history=P('history','old history',N.values,'x'),compressed=[N.values[0].map((v,j)=>(v+N.values[1][j])/2),N.values[2]];
   core=[chapter('Separate compressed history from recent tokens','区分压缩历史与近期 token','Two old rows are averaged into one summary; the latest row stays exact. This fixed pooling is a teaching surrogate, not the learned CSA/HCA compressor. The actual model also uses sparse indexing and mHC.','两个历史行平均为一行摘要，最近一行保持精确。这种固定池化仅为教学替代，并非学习的 CSA/HCA 压缩器；真实模型还使用稀疏索引和 mHC。','memory = [pool(old history); recent window]',[history,P('compressed','summary + recent',compressed,'k')],(r,c)=>r===0?[term(`(${fmt(N.values[0][c])} + ${fmt(N.values[1][c])}) / 2 = ${fmt(compressed[0][c])}`,compressed[0][c],[ref('history',0,c),ref('history',1,c)],[N.values[0][c],N.values[1][c]])]:[term('recent row stays exact',compressed[1][c],[ref('history',2,c)],[compressed[1][c]])],{operation:'compression'})];
   const Q=P('CQ','current query',[N.values[2]],'q'),K=core[0].panels.at(-1),s=scores(Q,K,0,false),a=probabilities(s.panels.at(-1)),o=multiply('Read summaries and recent context','读取摘要与近期上下文','The query weighs both compressed history and recent exact rows. A summary is not a recoverable copy of every old token.','查询同时加权压缩历史与近期精确行；摘要无法恢复每个历史 token。',a.panels.at(-1),P('CV','memory values',compressed,'v'),'O','O');return [...chapters,...core,s,a,o,...head(o.panels.at(-1),mode,false)];
  }else core=attention(N,(d.attention||'').includes('GQA')||(d.attention||'').includes('MQA'),!encoder,isMLA);
  if(hybrid){core[0].text=L(core[0].text+' This model interleaves three DeltaNet mixers with one GQA mixer; switch the worked mixer above to compare them.',ZH[core[0].text]+' 此模型每三个 DeltaNet 混合器搭配一个 GQA 混合器；可在上方切换以比较。');}
  if(id==='deepseek-v32'){core[0].text=L(core[0].text+' V3.2 additionally uses a sparse indexer to select history before the MLA read; this block lesson isolates MLA. Select Sparse attention for the indexing example.',ZH[core[0].text]+' V3.2 另以稀疏索引器在 MLA 读取前选择历史；此块课程单独演示 MLA，可选稀疏注意力查看索引示例。');}
  chapters.push(...core);let O=core.at(-1).panels.at(-1);
  const R=add(X,O.values);chapters.push(element('Keep the original signal','保留原始信号','The residual adds the attention/state branch to the original embedding features. Both operands have exactly the same shape; the old representation remains a direct path.','残差将注意力 / 状态分支加到原始嵌入特征上。两操作数形状完全一致，旧表示保留直接路径。','R = X + O',P('X','X',X),O,R,'R','R'));
  if(d.kind==='ssm'){chapters.push(...head(P('R','R',R),mode,false));return chapters;}
  const norm2=normalize(P('R','R',R),layer);norm2.title=L('Normalize before feature mixing','特征混合前归一化');chapters.push(norm2);
  const moe=d.kind==='moe'||d.operators.includes('moe-routing'),ff=feedForward(norm2.panels.at(-1),moe,d.kind==='rwkv',layer);chapters.push(...ff);
  const F=ff.at(-1).panels.at(-1),Y=add(R,F.values);chapters.push(element('Complete one residual block','完成一个残差块','Add the feature-mixing branch. This miniature executes one block. A real model repeats blocks with independent weights and release-specific normalization, positional and gating details.','加上特征混合分支。示例执行一个块；真实模型以独立权重重复多个块，并采用具体发布的归一化、位置及门控细节。','Y = R + F(R)',P('R','R',R),F,Y,'Y','Y'));
  chapters.push(...head(P('Y','Y',Y),mode,encoder));return chapters;
 }
 function head(A,mode,encoder=false){
  const w=[[.5,0,-.5,0,1,0],[0,.5,0,-.5,0,1],[.5,0,0,.5,0,0],[0,.5,.5,0,0,0]],last=encoder?[A.values[0].map((_,j)=>sum(A.values.map(r=>r[j]))/A.values.length)]:[A.values.at(-1)];
  const Pooled=P('last',encoder?'mean pooled features':'last token features',last,'x'),log=multiply(encoder?'Predict a class':'Predict the next token',encoder?'预测类别':'预测下一 token',encoder?'Mean-pool the position axis in this fixture, then project to six class logits. This is a classification head, not autoregressive next-token prediction.':'The final token features project to six vocabulary logits. The real checkpoint vocabulary and number of blocks are separate facts; this fixture keeps only six choices.',encoder?'示例沿位置轴平均池化，再投影为六个类别 logit。这是分类头，不是自回归预测。':'最后 token 特征投影为六个词表 logit。真实检查点词表及块数是独立事实；示例仅保留六个候选。',Pooled,P('Whead','W_head',w,'w'),'logits','Logits');
  const prob=probabilities(log.panels.at(-1),'Prob','p'),out=[log,prob];
  if(mode==='Training'){
   const p=prob.panels.at(-1),target=2,grad=p.values[0].map((v,i)=>v-+(i===target)),loss=-Math.log(p.values[0][target]);
   out.push(chapter('Learn from a target','从目标学习','Toy target ID=2. Cross-entropy penalizes low target probability. Its gradient with respect to the logits is p−one_hot(target); backprop continues through projections and every earlier block.','示例目标 ID=2；交叉熵惩罚低目标概率。对 logit 的梯度为 p−one_hot(target)，再通过投影及之前各块反向传播。','ℒ = −log p₂; ∂ℒ/∂logits = p − one_hot(2)',[p,P('Gradient','∂ℒ/∂logits',[grad],'s')],(r,c)=>[term('loss = −log '+fmt(p.values[0][target])+' = '+fmt(loss),loss,[ref('Prob',0,target)]),term(`${fmt(p.values[0][c])} − ${+(c===target)} = ${fmt(grad[c])}`,grad[c],[ref('Prob',0,c)],[p.values[0][c],+(c===target)])],{operation:'loss'}));
  }
  return out;
 }
 function cnn(mode){
  const X=[[1,0,-1,2],[2,-2,1,0],[0,1,3,-1],[1,-1,0,2]],W=[[1,0],[0,1]],Y=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>X[r][c]+X[r+1][c+1])),A=map(Y,x=>Math.max(0,x)),pool=[[Math.max(...A[0].slice(0,2),...A[1].slice(0,2))]];
  return [chapter('Slide one shared kernel','滑动一个共享卷积核','A 2×2 kernel slides over a 4×4 single-channel image with stride 1 and no padding. Each output is the sum of four products. Select an output to move the receptive field.','2×2 核以步幅 1、无填充滑过 4×4 单通道图像。每个输出为四个乘积之和；选择输出可移动感受野。','Yᵣ꜀ = Σᵢⱼ Xᵣ₊ᵢ,꜀₊ⱼ Wᵢⱼ; [1,1,4,4] → [1,1,3,3]',[P('image','image',X),P('kernel','shared kernel',W,'w'),P('conv','convolution',Y)],(r,c)=>{let acc=0;return W.flatMap((row,i)=>row.map((w,j)=>{acc+=w*X[r+i][c+j];return term(`${fmt(X[r+i][c+j])} × ${w} → ${fmt(acc)}`,acc,[ref('image',r+i,c+j),ref('kernel',i,j)],[X[r+i][c+j],w]);}));},{operation:'convolution'}),element('Remove negative activations','移除负激活','ReLU acts independently on each pixel. It preserves the spatial shape while adding a nonlinear transformation.','ReLU 独立作用于每个像素；保持空间形状，同时引入非线性。','A = max(0,Y)',P('conv','convolution',Y),null,A,'ReLU','ReLU',null,{functionLabel:'ReLU'}),chapter('Pool a local neighborhood','池化局部邻域','A 2×2 max pool with stride 2 takes the maximum of the first window. The odd final row/column is dropped with floor sizing. Multiple learned convolution channels form multiple feature planes.','2×2 最大池化以步幅 2 取第一个窗口的最大值。向下取整会丢弃最后的奇数行 / 列；多个学习卷积通道对应多个特征平面。','P = max(A[0:2,0:2]); [1,1,3,3] → [1,1,1,1]',[P('ReLU','ReLU',A),P('pool','pooled feature',pool,'a')],()=>[term('max('+[A[0][0],A[0][1],A[1][0],A[1][1]].join(',')+') = '+pool[0][0],pool[0][0],[ref('ReLU',0,0),ref('ReLU',0,1),ref('ReLU',1,0),ref('ReLU',1,1)])],{operation:'pool'})];
 }
 function diffusion(topic,mode){
  const flow=topic.id==='flux1',clean=[[0,1,0],[1,1,1],[0,1,0]],noise=[[.8,-.5,.6],[-.3,.2,-.8],[.4,-.6,.7]],out=[];
  if(flow){
   const vel=map(clean,(v,r,c)=>v-noise[r][c]);let X=noise;
   if(mode==='Training'){
    const xt=add(scale(noise,.5),scale(clean,.5));out.push(element('Sample a noisy interpolation','采样含噪插值','Training samples a time t=0.5, noise z and clean data. The linear interpolation is the denoiser input; the velocity target is data−noise. A training loss does not need the full sampling trajectory.','训练采样时间 t=0.5、噪声 z 与干净数据；线性插值作为去噪器输入，速度目标为数据减噪声。训练损失无需完整采样轨迹。','xₜ=(1−t)z+t·xdata; t=0.5',P('noisehalf','0.5 z',scale(noise,.5)),P('cleanhalf','0.5 data',scale(clean,.5)),xt,'x_t','xt'));out.push(element('Build the velocity target','构造速度目标','The target is a direction field. A neural denoiser learns to predict it from noisy input, time and conditioning; this example exposes the exact target, not a trained network.','目标是方向场；神经去噪器从含噪输入、时间及条件学习预测它。此示例展示精确目标，并非训练后的网络。','v* = xdata − z',P('clean','data',clean),P('noise','z',noise),vel,'v target','velocity',null,{symbol:'−'}));
   }else for(let i=0;i<3;i++){const next=add(X,scale(vel,1/3));out.push(element('Follow the velocity · step '+(i+1),'沿速度前进 · 步骤 '+(i+1),'Euler adds Δt times the predicted velocity. Here an oracle supplies the exact data−noise velocity so three equal steps reach the target. Real FLUX predicts a varying field using a transformer denoiser.','欧拉更新加上 Δt 乘预测速度。此处 oracle 提供精确的数据减噪声速度，三次等步长到达目标；真实 FLUX 用 Transformer 去噪器预测变化的场。','xnext = x + ⅓ vθ(x,t,c)',P('flow'+i,'x · t='+fmt(i/3),X),P('delta'+i,'⅓ velocity',scale(vel,1/3),'s'),next,'x next','flow'+(i+1)));X=next;}
  }else{
   const ab=.4,prev=.7,alpha=ab/prev,beta=1-alpha,xt=add(scale(clean,Math.sqrt(ab)),scale(noise,Math.sqrt(1-ab)));
   out.push(element('Mix clean data with Gaussian noise','混合干净数据与高斯噪声','At cumulative signal ᾱₜ=0.4, scale the clean image and a fixed sampled noise tensor, then add. The 3×3 image is a miniature; latent diffusion runs this process in VAE latent space.','累积信号 ᾱₜ=0.4 时，分别缩放干净图像及固定采样噪声后相加。3×3 图像是小示例；潜空间扩散在 VAE 潜空间执行此过程。','xₜ = √0.4 x₀ + √0.6 ε',P('signal','√0.4 x₀',scale(clean,Math.sqrt(ab))),P('noise','√0.6 ε',scale(noise,Math.sqrt(1-ab)),'s'),xt,'x_t','xt'));
   if(mode==='Training')out.push(copy('Train the noise predictor','训练噪声预测器','The sampled ε is the target. The denoiser sees xₜ, t and conditioning, then minimizes mean squared error against ε. This chapter shows the target; it does not execute a learned U-Net.','采样 ε 是目标；去噪器读取 xₜ、t 和条件，以预测与 ε 的均方误差训练。此章节展示目标，未执行学习的 U-Net。',P('epsilon','sampled ε',noise,'s'),noise,'target ε','target',(r,c)=>[r,c]));
   else{
    const correction=scale(noise,beta/Math.sqrt(1-ab)),mean=map(xt,(v,r,c)=>(v-correction[r][c])/Math.sqrt(alpha));
    out.push(chapter('Take one DDPM reverse step','执行一次 DDPM 反向步骤','An oracle predicts ε exactly to expose the scheduler algebra. αₜ=0.4/0.7, βₜ=1−αₜ. This output is a reverse mean, not the fully clean image. A stochastic sample also adds √β̃ₜ z, where β̃ₜ=βₜ(1−0.7)/(1−0.4).','oracle 精确预测 ε 以展示调度器代数。αₜ=0.4/0.7，βₜ=1−αₜ。输出是反向均值，并非完全干净图像；随机采样还加 √β̃ₜ z，其中 β̃ₜ=βₜ(1−0.7)/(1−0.4)。','μθ = (xₜ − βₜ εθ / √(1−ᾱₜ)) / √αₜ',[P('xt','x_t',xt),P('eps','oracle εθ',noise,'s'),P('mean','reverse mean',mean)],(r,c)=>[term('noise correction = '+fmt(correction[r][c]),correction[r][c],[ref('eps',r,c)],[noise[r][c],beta/Math.sqrt(1-ab)]),term(`(${fmt(xt[r][c])} − ${fmt(correction[r][c])}) / ${fmt(Math.sqrt(alpha))} = ${fmt(mean[r][c])}`,mean[r][c],[ref('xt',r,c)],[xt[r][c],correction[r][c]])],{operation:'denoise'}));
   }
  }
  if(mode==='Training'){
   const target=flow?map(clean,(v,r,c)=>v-noise[r][c]):noise,pred=map(target,x=>x+.1),loss=sum(pred.flatMap((row,r)=>row.map((v,c)=>(v-target[r][c])**2)))/9;
   out.push(chapter('Measure the denoiser error','衡量去噪器误差','The fixture prediction is deliberately target+0.1, so the mean squared error is 0.01. Training differentiates this loss through the denoiser; inference instead feeds predictions to the scheduler.','示例预测故意设为目标加 0.1，因此均方误差为 0.01。训练通过去噪器对损失求导；推理则把预测送入调度器。','ℒ = (1/9) Σᵣ꜀ (predictionᵣ꜀ − targetᵣ꜀)²',[P('prediction','fixture prediction',pred),P('target','training target',target,'s'),P('loss','MSE',[[loss]],'a')],()=>{let acc=0;return [...pred.flatMap((row,r)=>row.map((v,c)=>{acc+=(v-target[r][c])**2;return term(`(${fmt(v)} − ${fmt(target[r][c])})² → ${fmt(acc)}`,acc,[ref('prediction',r,c),ref('target',r,c)],[v,target[r][c]]);})),term('sum / 9 = '+fmt(loss),loss)];},{operation:'mse'}));
  }
  return out;
 }
 function build(topic,view,mode){
  if(!topic?.modelData||view?.scene!=='overview'||topic.modelData.kind==='public')return null;
  if(topic.modelData.kind==='cnn')return cnn(mode);
  if(topic.modelData.kind==='diffusion')return diffusion(topic,mode);
  return decoder(topic,view,mode);
 }
 return {build,mm,dot,soft,fmt,chapter,P,term,ref};
})();
function architectureFrames(topic,view,option,mode){
 const stories=MathLesson.build(topic,view,mode);if(!stories)return null;
 return stories.map((story,i)=>({kind:'model',scene:'overview',stage:i,title:story.title,text:story.text,story,mode,layout:view.layout,variant:option,topicId:topic.id,model:topic.modelData,flow:view.flow||topic.modelData.flow,total:stories.length}));
}
