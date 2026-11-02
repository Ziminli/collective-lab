/* Small causal experiments: one changed input, recomputed outputs, a visible explanation. */
const EXPERIMENT_VALUES=new Map();
function experimentSpec(){
 const t=state.topic,v=t.curriculum?t.modelViews[state.algorithm]:null,s=v?.scene;
 if(t.section==='communication')return {id:'collective',label:t.id==='barrier'?MT('Ranks that have arrived','已到达 rank 数'):MT('Rank 0 input','rank 0 输入'),min:0,max:t.id==='barrier'?4:8,step:1,value:t.id==='barrier'?2:1};
 if(t.id==='tensor-parallel')return{id:'tp',label:MT('First input feature x₀','第一个输入特征 x₀'),min:-3,max:6,step:1,value:1};
 const specs={
  attention:['query',MT('Query first feature q₀','查询首特征 q₀'),-2,3,.25,1],flash:['query',MT('Query first feature q₀','查询首特征 q₀'),-2,3,.25,1],
  norm:['norm',MT('Add the same offset to every feature','给全部特征加相同偏移'),-4,4,.5,0],rope:['rope',MT('Relative rotation angle','相对旋转角度'),0,180,15,0],
  ffn:['ffn',MT('First expanded feature','第一个扩展特征'),-3,3,.25,1],routing:['routing',MT('Expert 1 selection score','专家 1 的选择评分'),0,1,.05,.5],
  delta:['delta',MT('Write strength β','写入强度 β'),0,1,.1,.5],rwkv:['rwkv',MT('Memory retention w','记忆保留系数 w'),0,1,.1,.5],
  ssm:['ssm',MT('Retention at token 2','token 2 的保留系数'),0,1,.1,.8],conv:['conv',MT('Kernel’s first weight','卷积核首个权重'),-2,3,1,1],
  diffusion:['diffusion',MT('Time t from noise toward data','从噪声走向数据的时间 t'),0,1,.05,0],
  hyper:['hyper',MT('Residual stream mixing a','残差流混合系数 a'),0,1,.1,.8],engram:['engram',MT('Retrieved-memory gate','检索记忆门'),0,1,.1,.5],
  sparse:['sparse',MT('Selected historical positions k','选中的历史位置数 k'),1,6,1,2],compressed:['compressed',MT('Tokens represented by one old-memory entry','一个历史记忆项代表的 token 数'),1,8,1,4],
  crosskv:['crosskv',MT('Decoder queries sharing the memory','共享记忆的解码层查询次数'),1,8,1,4],speculative:['speculative',MT('Greedy matching prefix length','贪心匹配前缀长度'),0,4,1,2]
 };
 if(s==='diffusion'&&v.layout!=='Flow matching')specs.diffusion[1]=MT('Corruption noise level t (ᾱ=1−t)','扰动噪声水平 t（ᾱ=1−t）');
 const spec=specs[s];return spec?{id:spec[0],label:spec[1],min:spec[2],max:spec[3],step:spec[4],value:spec[5]}:null;
}
function renderExperiment(){const host=$('#experiment');if(!host)return;const spec=experimentSpec();host.hidden=!spec;if(!spec){host.innerHTML='';return;}
 const key=state.topic.id+'|'+state.algorithm,value=EXPERIMENT_VALUES.get(key)??spec.value;
 host.innerHTML=`<div class="experiment-heading"><div><span class="studio-eyebrow">${esc(MT('Change one thing','改变一个条件'))}</span><h2>${esc(MT('Try it. See why.','动手试，理解原因。'))}</h2></div><span class="experiment-badge">${esc(MT('Live calculation','实时计算'))}</span></div><div class="experiment-grid"><div class="experiment-controls"><label for="experiment-input">${esc(spec.label)}<output id="experiment-value">${value}</output></label><input id="experiment-input" type="range" min="${spec.min}" max="${spec.max}" step="${spec.step}" value="${value}"><p id="experiment-explanation"></p><span class="toy-note">${esc(MT('A small worked example. These are teaching values, not checkpoint weights.','小型计算示例；数值用于教学，并非检查点权重。'))}</span></div><div id="experiment-result" aria-live="polite" aria-atomic="true"></div></div>`;
 $('#experiment-input').addEventListener('input',ev=>{const value=Number(ev.target.value);EXPERIMENT_VALUES.set(key,value);$('#experiment-value').value=String(value);updateExperiment(spec,value);});updateExperiment(spec,value);
}
function experimentNumbers(title,values,active=[]){return `<div class="experiment-tensor"><span>${esc(title)}</span><div>${values.map((v,i)=>`<strong class="${active.includes(i)?'active':''}">${esc(Array.isArray(v)?'['+v.map(modelNum).join(', ')+']':typeof v==='number'?modelNum(v):v)}</strong>`).join('')}</div></div>`;}
function updateExperiment(spec,x){
 const t=state.topic,layout=t.curriculum?t.modelViews[state.algorithm].layout:'',box=$('#experiment-result');let html='',why='';const row=(name,v,on=[])=>experimentNumbers(name,v,on);
 if(spec.id==='collective'){
  const input=[x,2,3,4],sum=x+9;let out;
  if(t.id==='barrier'){html=row(MT('Ranks arrived','已到达 rank'),Array.from({length:4},(_,i)=>i<x?'✓':'…'))+row(MT('May the barrier complete?','屏障是否可完成？'),[x===4?MT('Yes','可以'):MT('Wait','等待')]);why=MT('Only when all four have entered can any participant complete.','只有全部四个参与者进入后，才允许任何参与者完成。');}
  else{
   if(['all-reduce','reduce','reduce-scatter'].includes(t.id)){
    html=row(MT('One scalar contribution per rank','各 rank 的一个标量贡献'),input,[0]);out=t.id==='reduce'?[sum,'—','—','—']:t.id==='reduce-scatter'?[sum,sum*2,sum*3,sum*4]:[sum,sum,sum,sum];
    if(t.id==='reduce-scatter'){html=row(MT('Each rank contributes [a,2a,3a,4a]','各 rank 贡献 [a,2a,3a,4a]'),input.map(a=>[a,2*a,3*a,4*a]),[0]);}
    why=MT('Change rank 0 and follow the sum. Each output has the same mathematical reduction but ownership depends on the operation.','改变 rank 0 并追踪和；每个输出采用相同数学归约，但所有权由操作决定。');
   }else if(['all-gather','gather'].includes(t.id)){html=row(MT('One owned shard per rank','每个 rank 的一个分片'),input,[0]);out=t.id==='gather'?[input,'—','—','—']:Array.from({length:4},()=>input);why=MT('Values are copied in source order. They remain separate positions; no addition occurs.','按源顺序复制数值；保留为不同位置，不发生加法。');}
   else if(t.id==='broadcast'){html=row(MT('Root input','根输入'),[[x,2,3,4]],[0]);out=Array.from({length:4},()=>[x,2,3,4]);why=MT('Only the root supplies data. Every recipient sees the same changed root position.','只有根提供数据；所有接收者都看到根输入中相同位置的变化。');}
   else if(t.id==='scatter'){html=row(MT('Root input','根输入'),input,[0]);out=input;why=MT('Each rank receives one different position. Changing root position 0 only changes rank 0’s output.','每个 rank 收到一个不同位置；修改根位置 0 只改变 rank 0 的输出。');}
   else if(t.id==='scan'){html=row(MT('Rank-ordered inputs','按 rank 排列的输入'),input,[0]);let total=0;out=input.map(v=>total+=v);why=MT('Changing rank 0 affects every inclusive prefix because every prefix includes rank 0.','修改 rank 0 影响所有包含自身的前缀，因为它们都包含 rank 0。');}
   else if(t.id==='send-recv'){html=row(MT('Rank 0 send buffer','rank 0 发送缓冲'),[x],[0]);out=['—','—',x,'—'];why=MT('Only rank 2 has a defined receive output. The source retains its input; a dash is not an erased buffer.','只有 rank 2 有定义的接收输出；源保留输入，破折号并非缓冲被清除。');}
   else{const counts=[[x,3,0,2],[2,1,1,0],[0,2,1,4],[1,0,2,1]],variable=t.id==='all-to-all-v';html=row(variable?MT('Source 0 counts to destinations 0…3','源 0 发往目标 0…3 的计数'):MT('Source 0 buckets to destinations 0…3','源 0 发往目标 0…3 的桶'),variable?counts[0]:[x,2,3,4],[0]);out=Array.from({length:4},(_,d)=>Array.from({length:4},(_,s)=>variable?counts[s][d]:s===0?[x,2,3,4][d]:10*s+d));why=MT('Destination d receives bucket d from every source. The changed bucket addressed to destination 0 stays local.','目标 d 接收每个源的第 d 个桶；发给目标 0 的被修改桶保持在本地。');}
   html+=row(MT('Outputs on ranks 0, 1, 2, 3','rank 0、1、2、3 的输出'),out);
  }
 }else if(spec.id==='tp'){
  const col=state.algorithm==='Column-parallel',pair=state.algorithm==='Column → row MLP',y=[x+4,3*x+8];html=row('X',[x,2],[0])+row(col?MT('Column-shard outputs (different features)','列分片输出（不同特征）'):pair?MT('Hidden feature shards before ReLU','ReLU 前隐藏特征分片'):MT('Row-shard partials (same output positions)','行分片部分结果（相同输出位置）'),col||pair?y:[[x,3*x],[4,8]])+row(pair?'Y after ReLU and W₂':'Y = XW',pair?[Math.max(0,y[0])+Math.max(0,y[1])]:[y]);why=col?MT('Different output features concatenate. No forward SUM is needed for this column projection.','不同输出特征应拼接；该列投影前向无需 SUM。'):pair?MT('ReLU stays local. The row contraction sums the two surviving hidden features.','ReLU 保持本地，行收缩对两个激活后的隐藏特征求和。'):MT('[x,3x] + [4,8] gives the full result. Concatenation would have the wrong shape and values.','[x,3x] + [4,8] 得到完整结果；拼接的形状与数值均不正确。');
 }else if(spec.id==='query'){
  const keys=[[1,0],[0,1],[1,1],[-1,1]],values=[[1,0],[0,2],[3,1],[1,1]],scores=keys.map(k=>(x*k[0]+k[1])/Math.sqrt(2)),max=Math.max(...scores),ex=scores.map(s=>Math.exp(s-max)),total=ex.reduce((a,b)=>a+b),a=ex.map(e=>e/total),o=[0,1].map(c=>a.reduce((s,w,i)=>s+w*values[i][c],0)),gate=layout==='Gated GQA';
  html=row('q',[x,1],[0])+`<div class="attention-bars">${a.map((w,i)=>`<div><span>K${i}</span><div><i style="width:${w*100}%"></i></div><strong>${modelNum(w)}</strong></div>`).join('')}</div>`+row(gate?MT('O before output gate','输出门前的 O'):'O = Σ aᵢVᵢ',[o]);why=MT('The final query sees all four keys. Increase q₀: keys with a positive first feature get more relative weight; the output changes continuously.','最后查询可见全部四个键；增大 q₀，首特征为正的键获得更大相对权重，输出连续变化。');
 }else if(spec.id==='norm'){
  const input=[1,2,3,4].map(v=>v+x),ln=layout==='LayerNorm',gn=layout==='GroupNorm',mean=input.reduce((a,b)=>a+b)/4,den=Math.sqrt(input.reduce((s,v)=>s+v*v,0)/4),out=gn?[-1,1,-1,1]:ln?input.map(v=>(v-mean)/Math.sqrt(1.25)):input.map(v=>v/den);
  html=row('x',[input])+row(layout,[out]);why=ln||gn?MT('Adding the same offset disappears when the group/feature mean is subtracted. The displayed toy uses γ=1, b=0 and tiny ε ignored.','统一偏移在减去组 / 特征均值时消失；示例 γ=1、b=0，并忽略极小 ε。'):MT('RMSNorm does not subtract the mean. A common offset therefore changes the direction after RMS scaling.','RMSNorm 不减均值，因此统一偏移会改变 RMS 缩放后的方向。');
 }else if(spec.id==='rope'){
  const a=x*Math.PI/180,q=[Math.cos(a),Math.sin(a)],k=[1,1];html=row(MT('Rotated query','旋转后的查询'),[q])+row(MT('Unrotated key','未旋转的键'),[k])+row(MT('Dot product / query length','点积 / 查询长度'),[q[0]+q[1],Math.hypot(...q)]);why=MT('The query length remains one, while the relative-position dot product changes. Rotating both vectors equally would preserve their dot product.','查询长度始终为一，但相对位置点积改变；等角旋转两个向量则保持点积。');
 }else if(spec.id==='delta'){
  const old=[.9,.45],v=[4,1],error=v.map((a,i)=>a-old[i]),next=old.map((a,i)=>a+x*error[i]);html=row(MT('Prediction after decay','衰减后的预测'),[old])+row(MT('Target / prediction error','目标 / 预测误差'),[v,error])+row(MT('Corrected memory row','修正后的记忆行'),[next]);why=MT('β=0 keeps the decayed prediction; β=1 writes the full correction for this unit key. λ was already applied before prediction.','β=0 保留衰减预测，β=1 对此单位键写入完整修正；λ 已在预测前应用。');
 }else if(spec.id==='routing'){
  const scores=[.1,x,.3,.1],ids=[0,1,2,3].sort((a,b)=>scores[b]-scores[a]||a-b).slice(0,2),sum=ids.reduce((s,i)=>s+scores[i],0),weights=ids.map(i=>scores[i]/sum),outputs=[[1,1],[4,0],[0,8],[2,2]],combined=[0,1].map(c=>ids.reduce((s,id,i)=>s+weights[i]*outputs[id][c],0));html=row(MT('Selection scores','选择评分'),scores,[1])+row(MT('Selected expert IDs / combine weights','选中专家编号 / 组合权重'),[ids,weights])+row(MT('Routed result, before any shared expert','加入共享专家前的路由结果'),[combined]);why=MT('Selection can change discretely at a score crossing. This toy renormalizes selected scores; production routing rules are model-specific.','评分交叉时选择可发生离散变化；示例归一化选中评分，实际路由规则随模型而异。');
 }else if(spec.id==='rwkv'){
  const seven=layout!=='RWKV-6',out=[[x+.5,2*x+(seven?.2:0)],[3*x+1,4*x+(seven?.6:0)]];html=row(MT('Old state rows','旧状态各行'),[[1,2],[3,4]])+row(MT('Decayed state rows','衰减状态各行'),[[x,2*x],[3*x,4*x]])+row(layout+' Snext',out);why=MT('The write vkᵀ is fixed. Changing w controls retention; RWKV-7’s modifier still uses the old state rather than the decayed one.','固定写入项 vkᵀ，改变 w 控制保留程度；RWKV-7 修改项仍使用旧状态，而非衰减后的状态。');
 }else if(spec.id==='ssm'){
  const h1=2,h2=x*h1+1,h3=.2*h2+3;html=row(MT('States h₁, h₂, h₃','状态 h₁、h₂、h₃'),[h1,h2,h3],[1])+row(MT('Token 2 update','token 2 更新'),[x+' × 2 + 1 = '+modelNum(h2)]);why=MT('The retention gate changes the second state and every dependent later state. It does not change the earlier state h₁.','保留门改变第二状态及所有依赖它的后续状态，不改变更早状态 h₁。');
 }else if(spec.id==='ffn'){
  const gelu=layout==='GELU',square=layout==='Squared ReLU',act=square?Math.max(0,x)**2:gelu?.5*x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+.044715*x**3))):x/(1+Math.exp(-x));html=row(MT('Expanded first feature','扩展后的首特征'),[x])+row(square?'ReLU²':gelu?'GELU':'SiLU',[act])+row(MT('Activated feature before down projection','下投影前的激活特征'),[gelu||square?act:act*3]);why=MT('This changes a feature at one token. The nonlinear block does not average other token positions.','此处改变单 token 的一个特征；非线性模块不平均其他 token 位置。');
 }else if(spec.id==='conv'){
  const depth=layout==='1D depthwise';html=depth?row('x',[1,2,3,4,5,6])+row('W',[x,0,1],[0])+row('y',[x,2*x,3*x+1,4*x+2,5*x+3,6*x+4]):row(MT('First 2×2 window, row by row','首个 2×2 窗口，逐行'),[[1,2],[5,6]])+row(MT('Kernel rows','卷积核各行'),[[x,0],[0,1]])+row(MT('First output value','首个输出值'),[x+6]);why=MT('The same changed weight is reused at every valid window. Weight sharing is what makes this a convolution.','相同的修改后权重复用于每个有效窗口；权重共享正是卷积的关键。');
 }else if(spec.id==='diffusion'){
  const flow=layout==='Flow matching',noise=.8,clean=1;html=flow?row(MT('Noise / data endpoint','噪声 / 数据端点'),[noise,clean])+row('x(t) = (1−t)z + t·data',[(1-x)*noise+x*clean])+row('v* = data − z',[.2]):row('ᾱ = 1−t; xₜ = √ᾱ·x₀ + √(1−ᾱ)·ε',[Math.sqrt(1-x)*clean+Math.sqrt(x)*noise])+row(MT('Clean data / fixed sampled noise','干净数据 / 固定采样噪声'),[clean,noise]);why=flow?MT('In this noise→data convention, t=0 is noise and t=1 is data. A constant velocity of 0.2 traces the straight toy path.','此“噪声→数据”约定下，t=0 为噪声，t=1 为数据；恒速度 0.2 沿示意直线路径前进。'):MT('Here the slider sets noise level t with ᾱ=1−t. DDPM corruption uses square-root coefficients, not the straight flow interpolation.','此处滑块设置噪声水平 t，ᾱ=1−t；DDPM 扰动使用平方根系数，不是流的直线插值。');
 }else if(spec.id==='hyper'){
  const h=[[x,1-x],[1-x,x]],out=[[x+3*(1-x),2*x+4*(1-x)],[1-x+3*x,2*(1-x)+4*x]];html=row('Hres',h)+row('Hres × [[1,2],[3,4]]',out)+row(MT('Each row sum / each column sum','每行和 / 每列和'),[1,1]);why=MT('a=1 keeps the two streams separate; a=0 swaps them; a=0.5 averages them. The residual matrix stays doubly stochastic.','a=1 保持两流分离，a=0 交换，a=0.5 平均；残差矩阵始终为双随机矩阵。');
 }else if(spec.id==='engram'){
  html=row(MT('Hidden input / retrieved row','隐藏输入 / 检索行'),[[1,2],[2,1]])+row(MT('Gated memory','门控记忆'),[[2*x,x]])+row(MT('Fused hidden features','融合隐藏特征'),[[1+2*x,2+x]]);why=MT('The learned lookup row stays fixed. The gate controls its contribution to this token’s hidden state.','学习查表行保持不变；门控制其对当前 token 隐藏状态的贡献。');
 }else if(spec.id==='sparse'){
  const scores=[.1,.8,.2,.7,.4,.9],ids=[0,1,2,3,4,5].sort((a,b)=>scores[b]-scores[a]).slice(0,x).sort((a,b)=>a-b);html=row(MT('Indexer scores','索引器评分'),scores,ids)+row(MT('Selected positions','选中位置'),ids);why=MT('Increasing k visits more candidate keys. The indexer must still score/select, and main attention normalizes only over the selected set.','增大 k 将访问更多候选键；索引器仍需评分 / 选择，主注意力仅在所选集合归一化。');
 }else if(spec.id==='compressed'){
  const entries=Math.ceil(8/x);html=row(MT('Old tokens / local recent tokens','历史 token / 近期局部 token'),[8,4])+row(MT('Compressed entries / total attended entries before selection','压缩项 / 选择前可关注项总数'),[entries,entries+4]);why=MT('Toy allocation: eight old tokens are grouped at the chosen ratio, with four recent tokens kept separately. The real compressor is learned; ratios and boundaries are layer-specific.','分配示例：八个历史 token 按所选比率分组，另保留四个近期 token；实际压缩器通过学习得到，比率与边界因层而异。');
 }else if(spec.id==='crosskv'){
  html=row(MT('Global memory producers / decoder queries','全局记忆生产者 / 解码层查询'),[1,x])+row(MT('Conceptual global KV copies with sharing','共享时概念全局 KV 副本数'),[1]);why=MT('More layers may query one shared global memory. Their query work still exists; Reindex/Reuse determine whether index selections are recomputed. This count excludes local SWA states.','更多层可查询同一共享全局记忆；查询工作仍存在，Reindex/Reuse 决定是否重算索引选择；此计数不包含局部 SWA 状态。');
 }else if(spec.id==='speculative'){
  const draft=['A','B','C','D'],target=[...draft.slice(0,x),...(x<4?['X']:[])];html=row(MT('Draft candidates','草稿候选'),draft)+row(MT('Committed greedy prefix and correction','提交的贪心前缀及修正'),target)+row(MT('Accepted draft / discarded draft','接受草稿 / 丢弃草稿'),[x,4-x]);why=MT('Greedy toy: keep the matching prefix, append the correction at the first mismatch, and discard later tentative entries. A fully accepted draft may allow an additional target token, omitted here.','贪心示例：保留匹配前缀，在首个不匹配处追加修正，并丢弃之后暂存项；草稿全部接受时还可能追加一个目标 token，此处省略。');
 }
 box.innerHTML=html;$('#experiment-explanation').textContent=why;if(typeof localizePage==='function')localizePage();
}
