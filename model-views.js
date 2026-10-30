/* Model curriculum, worked examples, and SVG views. No external model or API is executed. */
function modelText(en,zh){if(en!==zh||!ZH[en])ZH[en]=zh;return en;}
const MT=modelText;
for(const [key,source]of Object.entries(MODEL_SOURCES))SOURCES['model_'+key]=source;
const MODEL_COMMON_SCOPE=MT('Diagrams preserve logical dependencies. Small matrices are worked examples, not checkpoint weights or performance measurements. Facts name a specific source snapshot.','图示保留逻辑依赖。小矩阵是计算示例，并非检查点权重或性能测量；事实对应明确来源快照。');
MT('Gated GQA','门控 GQA');MT('Bidirectional','双向注意力');MT('Cross-attention','交叉注意力');MT('Squared ReLU','ReLU 平方');MT('2D spatial','二维空间卷积');MT('1D depthwise','一维深度卷积');
const MODEL_TRAINING=MT('Training evaluates the forward graph, computes a task loss, then propagates gradients and updates learned weights. Sequence models commonly use shifted-label teacher forcing; recurrence can use parallel/chunked kernels.','训练执行前向图、计算任务损失，再传播梯度并更新学习权重。序列模型常用移位标签 teacher forcing；递推可使用并行 / 分块内核。');
const MODEL_INFERENCE=MT('Inference reuses trained weights. Autoregressive models preserve causal dependencies and retain the model’s KV or recurrent state; image generators reuse a denoiser across sampling steps.','推理复用训练权重。自回归模型保留因果依赖及其 KV / 递归状态；图像生成器跨采样步复用去噪器。');
const MODEL_IMAGE_TRAINING=MT('A training step samples a time/noise level and learns the release’s noise or velocity target. It usually does not run the full inference sampling chain before each loss.','训练步采样时间 / 噪声水平，学习该发布的噪声或速度目标；通常不必先执行完整推理采样链再求每次损失。');
const MODEL_IMAGE_INFERENCE=MT('Start from noise, repeatedly run the denoiser with conditioning and the matching scheduler, then decode the final image latent. Sampling steps reuse weights.','从噪声开始，反复运行带条件的去噪器及匹配的调度器，最后解码图像潜变量；采样步复用权重。');
MODEL_EXTRA_NOTATION.diffusion=['x₀, xₜ, ε, αₜ, βₜ, ᾱₜ, z, t, c, vθ',MT('clean/noisy data, noise, αₜ=1−βₜ, noise variance, cumulative product of α, initial noise, time, conditioning and predicted velocity','干净 / 含噪数据、噪声、αₜ=1−βₜ、噪声方差、α 累积乘积、初始噪声、时间、条件、预测速度')];
MODEL_EXTRA_NOTATION.rwkv=['S, w, a, b, r, k, v',MT('matrix state, decay, rank-one modifier vectors, read vector, key and value','矩阵状态、衰减、秩一修改向量、读取向量、键和值')];
MODEL_EXTRA_NOTATION.attention=['Wq, Wk, Wv, Wₒ, G',MT('learned query, key, value and output projections; G is the input-dependent pre-sigmoid output gate','学习得到的查询、键、值与输出投影；G 为依赖输入的 sigmoid 前输出门')];
MODEL_EXTRA_NOTATION.ffn=['Wg, Wu, Wd, W₁, W₂',MT('gate, expansion and contraction projections; W₁/W₂ are the single-branch equivalents','门、扩展、收缩投影；W₁/W₂ 为单分支的对应投影')];
MODEL_NOTATION.push(['L, γ',MT('layer count and learned normalization scale; symbols are local to the selected equation','层数与学习到的归一化缩放；符号按所选方程的上下文解释')]);
const modelBlueprintTitles={transformer:'Transformer',moe:'Mixture of Experts',rwkv:'RWKV',ssm:'State-space models · Mamba',diffusion:'Diffusion & flow models',cnn:'Convolutional networks',vit:'Vision Transformer · ViT',ced:'Causal encoder-decoder',public:'Public interface'};
MT('Causal encoder-decoder','因果编码器-解码器');MT('Public interface','公开接口');MT('Structure','模型结构');MT('MHA','MHA');MT('GQA','GQA');MT('MQA','MQA');MT('GroupNorm','组归一化');
const modelOperatorTopicIds=Object.fromEntries(Object.keys(MODEL_OPERATORS).map(key=>[key,'op-'+key]));
function modelViewLesson(op,layout){
 const common=['attention','flash'].includes(op.scene)?MODEL_NOTATION.slice(0,4):[['x, X; y, o',MT('input features and output features; vectors/tensors use the convention shown locally','输入特征与输出特征；向量 / 张量按局部所示约定')],...(['ffn','norm','mla'].includes(op.scene)?[MODEL_NOTATION[0]]:[]),...(['mla','sparse','compressed','crosskv','rope'].includes(op.scene)?[MODEL_NOTATION[1]]:[]),MODEL_NOTATION[3]],extra=MODEL_EXTRA_NOTATION[op.scene];
 let formula=op.formula,steps=op.steps.map(row=>[...row]),cost=op.lede,details=op.details;
 if(op.scene==='norm'&&layout==='RMSNorm')formula='RMSNorm(x)=γ⊙x/√(mean(x²)+ε)';
 if(op.scene==='norm'&&layout==='LayerNorm')formula='LN(x)=γ⊙(x−μ)/√(σ²+ε)+b';
 if(op.scene==='norm'&&layout==='GroupNorm'){
  formula='GN(x)=γ⊙(x−μgroup)/√(σ²group+ε)+b';
  steps=[[MT('Group channels within each sample','在每个样本内对通道分组'),MT('GroupNorm reduces over channels within a group and their spatial positions, separately for each sample. The toy uses four channels, one spatial position, and two groups.','GroupNorm 在每个样本内沿组内通道及其空间位置归约。示例为四通道、一个空间位置、两组。')],[MT('Normalize the two groups','分别归一化两组'),MT('For [1,2] and [3,4], group means are 1.5 and 3.5; each population variance is 0.25. With unit scale and zero bias, the result is [−1,1,−1,1].','[1,2] 与 [3,4] 两组均值为 1.5、3.5，总体方差均为 0.25。单位缩放、零偏置时得到 [−1,1,−1,1]。')],op.steps[2],op.steps[3]];
  steps[2]=[MT('Apply channelwise affine parameters','应用逐通道仿射参数'),MT('Learned γ and b act on channels after group statistics are applied. GroupNorm does not estimate statistics across independent batch samples.','应用组统计量后，再使用逐通道学习参数 γ、b。GroupNorm 不跨独立批次样本估计统计量。')];
  cost=MT('Normalize channel groups and spatial features per sample.','逐样本归一化通道组与空间特征。');
 }
 if(op.scene==='ffn'&&['GELU','Squared ReLU'].includes(layout)){
  const squared=layout==='Squared ReLU';formula=squared?'ChannelMix(x)=ReLU(mix(x,xprev)W₁)²W₂':'FFN(x)=GELU(xW₁+b₁)W₂+b₂';
  cost=squared?MT('Time-mix the input, expand, square a ReLU, then contract.','对输入做时间混合、扩展、ReLU 平方，再收缩。'):MT('Expand once, apply GELU, then contract to the residual width.','单分支扩展，应用 GELU，再收缩回残差宽度。');
  steps=[[MT('Project an expanded branch','投影扩展分支'),squared?MT('RWKV-7 channel mixing first interpolates current and shifted token inputs, then projects features. The toy projected vector is [1,2].','RWKV-7 通道混合先插值当前与移位 token 输入，再投影特征；示例投影向量为 [1,2]。'):MT('One learned D→F projection creates an expanded feature vector [1,2] in the toy. Biases depend on the release.','一个学习到的 D→F 投影生成示例扩展特征 [1,2]；是否使用偏置取决于发布。')],
   [MT('Apply the selected activation','应用选定激活'),squared?MT('Square the nonnegative ReLU result: [1,2] becomes [1,4]. This is not a SwiGLU gate.','将 ReLU 非负结果平方：[1,2] 变为 [1,4]；这不是 SwiGLU 门控。'):MT('GELU weights a feature smoothly by its magnitude. The toy produces approximately [0.841,1.955].','GELU 按特征幅值平滑加权；示例结果约为 [0.841,1.955]。')],
   [MT('Keep one activation branch','保持单激活分支'),MT('No second up branch or elementwise branch product is used in this selected layout. Each token keeps its own features.','本布局不使用第二上投影分支或分支逐元素乘法；各 token 保持自身特征。')],op.steps[3]];
 }

 if(op.scene==='rwkv'&&layout==='RWKV-6'){
  formula='RWKV-6 core: Sₜ=Sₜ₋₁diag(wₜ)+vₜkₜᵀ; readout adds current-token terms';
  cost=MT('Decay and write a matrix state; compare with RWKV-7’s additional modifier.','衰减并写入矩阵状态，对比 RWKV-7 的附加修改项。');
  steps[2]=[MT('Skip the RWKV-7 modifier','省略 RWKV-7 修改项'),MT('The RWKV-6 core does not add (Sa)bᵀ. In this toy, decay plus write gives [[1,1],[2.5,2]], while RWKV-7 gives [[1,1.2],[2.5,2.6]].','RWKV-6 核心不加 (Sa)bᵀ；示例衰减加写入得到 [[1,1],[2.5,2]]，RWKV-7 则得到 [[1,1.2],[2.5,2.6]]。')];
 }
 if(op.scene==='compressed'){
  formula=layout==='HCA'?'o = Attention(q, local window ∪ highly compressed history)':'J = indexer(q, compressed history); o = Attention(q, local window ∪ history[J])';
  cost=layout==='HCA'?MT('Attend a smaller, more heavily compressed history plus recent tokens.','关注更小、压缩程度更高的历史及近期 token。'):MT('Select compressed entries with an indexer, then attend with the recent window.','索引器选择压缩项，再与近期窗口共同计算注意力。');
 }
 if(op.scene==='conv'&&layout==='1D depthwise'){
  formula='Y[c,t] = Σu W[c,u] X[c,t−u]; X[c,t<0]=0';cost=MT('A causal short filter per channel; no mixing between channels.','每通道一个因果短滤波器，通道之间不混合。');
  steps=[[MT('Keep a short causal history','保留短因果历史'),MT('For each channel, a length-3 toy kernel reads the current and two preceding positions. Left padding supplies zeros, not future tokens.','对每个通道，长度为 3 的示意卷积核读取当前及前两个位置；左侧填零，不读未来 token。')],[MT('Apply a depthwise kernel','应用深度卷积核'),MT('Using weights [1,0,1] on [1,2,3,4,5,6] produces [1,2,4,6,8,10]. A second channel is processed separately.','以权重 [1,0,1] 处理 [1,2,3,4,5,6]，得到 [1,2,4,6,8,10]；第二通道独立计算。')],[MT('Retain the rolling state at decode','解码保留滚动状态'),MT('Decode retains only the past kernel-width-minus-one inputs needed for the next update. The convolution state is separate from the SSM matrix state.','解码仅保留下一步所需的前“核宽减一”个输入；卷积状态与 SSM 矩阵状态不同。')],[MT('Match the released block','匹配具体发布的模型块'),MT('Mamba uses causal depthwise 1D mixing around its state-space core. Toy kernel width and weights are not checkpoint values; later input/output projections can mix channels.','Mamba 在状态空间核心周围使用因果一维深度混合；示例核宽和权重不是检查点值，前后输入 / 输出投影仍可混合通道。')]];
 }
 if(op.scene==='diffusion')formula=layout==='Flow matching'?'xₜ=(1−t)z+t·xdata; v*=xdata−z; xnext=xₜ+Δt·vθ(xₜ,t,c)':'xₜ=√ᾱₜx₀+√(1−ᾱₜ)ε; μθ=(xₜ−βₜεθ/√(1−ᾱₜ))/√αₜ';

 if(op.scene==='attention'&&['Bidirectional','Cross-attention'].includes(layout)){
  formula=layout==='Cross-attention'?'Q=Xquery Wq; K=Xcontext Wk; V=Xcontext Wv; O=softmax(QKᵀ/√dₖ)V':'O=softmax(QKᵀ/√dₖ + Mpadding)V; no future mask';
  cost=layout==='Cross-attention'?MT('Queries and context come from different sequences; their lengths can differ.','查询与上下文来自不同序列，二者长度可以不同。'):MT('Every valid position can read past and future context.','每个有效位置均可读取过去与未来上下文。');
  steps[0]=[MT('Choose the query and memory sources','选择查询与记忆来源'),layout==='Cross-attention'?MT('Project Q from decoder/image states and K,V from encoder/text states. The toy shows three queries and four context keys; its last query is [1,1].','从解码器 / 图像状态投影 Q，从编码器 / 文本状态投影 K,V；示例为三个查询、四个上下文键，最后查询为 [1,1]。'):MT('Project Q,K,V from the same valid sequence. Unlike causal generation, the encoder can use information on both sides.','从同一有效序列投影 Q,K,V；与因果生成不同，编码器可使用两侧信息。')];
  steps[1]=[MT('Apply the appropriate visibility mask','使用正确的可见性掩码'),MT('This example has no padding, so all context entries are visible. A lower-triangular causal mask would change the selected operator.','示例没有填充，因此全部上下文项可见；下三角因果掩码会改变所选算子。')];
  steps[2]=[MT('Normalize across visible context keys','沿可见上下文键归一化'),MT('Normalize each query row independently. The worked last query uses the same numeric scores and values as the causal example.','每个查询行独立归一化；最后查询使用与因果示例相同的评分和值。')];
 }
 if(op.scene==='attention'&&layout==='Gated GQA'){
  formula='A=softmax(QKᵀ/√dₖ+M); O=[(AV)⊙sigmoid(G)]Wₒ';cost=MT('Grouped KV heads, then an input-dependent output gate before Wₒ.','分组共享 KV 头，再在 Wₒ 前使用依赖输入的输出门。');
  steps[3]=[MT('Gate, merge and project head outputs','门控、合并并投影各头输出'),MT('A learned sigmoid gate modulates attention output features before the final projection. The toy uses gate 0.5 for every feature; it halves [1.676,1] to approximately [0.838,0.5]. Real gates depend on the current token.','学习到的 sigmoid 门在最终投影前调节注意力输出特征；示例各特征门值均为 0.5，把 [1.676,1] 减半至约 [0.838,0.5]。真实门值依赖当前 token。')];
 }
 if(op.scene==='attention'&&layout==='MQA')cost=MT('One KV head is shared by all query heads.','全部查询头共享一个 KV 头。');
 if(op.scene==='attention'&&layout==='GQA')cost=MT('Groups of query heads share each KV head.','查询头分组共享 KV 头。');
 return {formula,cost,costNote:MODEL_COMMON_SCOPE,steps,notation:[...common,...(extra?[extra]:[])],details:[...details,[MT('Training and inference','训练与推理'),op.scene==='diffusion'?MT(MODEL_IMAGE_TRAINING+' '+MODEL_IMAGE_INFERENCE,ZH[MODEL_IMAGE_TRAINING]+' '+ZH[MODEL_IMAGE_INFERENCE]):MT('The forward operator is shared. Training additionally computes gradients with respect to inputs and learned parameters; inference retains only the state required for subsequent work.','前向算子共用；训练还需对输入与学习参数求梯度，推理只保留后续工作所需的状态。')]]};
}
function registerCurriculum(data,section,operator=null){
 const isOperator=!!operator,name=data.name,base=MT('Structure','模型结构'),viewSpecs={},variantDetails={};
 if(isOperator){
  for(const layout of operator.variants){viewSpecs[layout]={scene:operator.scene,op:operator.id,layout};variantDetails[layout]=modelViewLesson(operator,layout);}
  if(operator.scene==='norm'){viewSpecs.GroupNorm={scene:'norm',op:operator.id,layout:'GroupNorm'};variantDetails.GroupNorm=modelViewLesson(operator,'GroupNorm');}
 }else{
  viewSpecs[base]={scene:'overview',layout:'Structure'};
  const flow=data.flow;
  const eq=data.kind==='public'?MT('Public inputs → hosted model → documented outputs','公开输入 → 托管模型 → 公开输出'):data.kind==='diffusion'?'xnext = scheduler(denoiser(x,t,condition), x, t)':data.kind==='rwkv'||data.kind==='ssm'?'(hₜ, Sₜ) = block(xₜ, Sₜ₋₁)':data.kind==='ced'?'encoder(x) → shared KV → causal decoder → logits':data.kind==='cnn'?'image → convolution blocks → spatial / task head':data.kind==='vit'?'image → patches → embedding → encoder blocks → task head':'x → embedding → L blocks → norm → vocabulary logits';
  variantDetails[base]={formula:eq,cost:data.lede,costNote:MODEL_COMMON_SCOPE,steps:flow.map(n=>[n.title,n.text]),notation:[MODEL_NOTATION[0],MODEL_NOTATION[4]],details:data.details};
  for(const key of data.operators){
   const op=MODEL_OPERATORS[key];let layout=op.variants[0];
   if(op.scene==='attention')layout=data.attention?.includes('MLA')?'MLA':data.attention?.includes('GQA')?'GQA':data.attention?.includes('MQA')?'MQA':'MHA';
   if(op.scene==='attention'&&['qwen3-next','qwen35','qwen38'].includes(data.id))layout='Gated GQA';
   if(op.scene==='attention'&&['vision-transformer','flux1'].includes(data.id))layout='Bidirectional';
   if(op.scene==='attention'&&data.id==='stable-diffusion')layout='Cross-attention';
   if(op.scene==='norm'&&['gpt2','gpt3','rwkv7','rwkv','flux1','transformer','vision-transformer'].includes(data.id))layout='LayerNorm';
   if(op.scene==='norm'&&['stable-diffusion','convolutional-networks'].includes(data.id))layout='GroupNorm';
   if(op.scene==='ffn'&&['gpt2','gpt3','flux1','transformer'].includes(data.id))layout='GELU';
   if(op.scene==='conv'&&['mamba2','state-space-models'].includes(data.id))layout='1D depthwise';
   if(op.scene==='ffn'&&['rwkv','rwkv7'].includes(data.id))layout='Squared ReLU';
   if(op.scene==='diffusion'&&data.id==='flux1')layout='Flow matching';
   if(op.scene==='rwkv')layout='RWKV-7';
   viewSpecs[op.name]={scene:op.scene,op:key,layout};variantDetails[op.name]=modelViewLesson(op,layout);
  }
 }
 if(data.id==='transformer'){
  const node=(label,cn,shape,text,ctext)=>({label:MT(label,cn),shape,title:MT(label,cn),text:MT(text,ctext)});
  const encoder=[node('Input tokens','输入 token','T','Embed input tokens with positional information.','嵌入输入 token 及位置信息。'),node('Bidirectional attention','双向注意力','T × D','Every valid position can read the whole input sequence.','每个有效位置均可读取整个输入序列。'),node('Add + norm + FFN','相加 + 归一化 + FFN','T × D','Residual, normalization and feed-forward sublayers transform token features. Norm placement is family-specific.','残差、归一化、前馈子层变换 token 特征；归一化位置因家族而异。'),node('Repeat L blocks','重复 L 个块','T × D','Each repeated block has its own learned parameters.','每个重复块具有自身学习参数。'),node('Task head','任务输出头','features / logits','Use representations for classification, retrieval or masked-token objectives.','使用表示完成分类、检索或掩码 token 目标。')];
  const ed=[node('Source tokens','源 token','Ts','Tokenize and embed the source sequence.','分词并嵌入源序列。'),node('Bidirectional encoder','双向编码器','Ts × D','Encode the complete valid source sequence.','编码完整有效源序列。'),node('Encoder memory','编码器记忆','K,V','Project encoder features into cross-attention keys and values.','将编码器特征投影为交叉注意力键和值。'),node('Shifted target input','移位目标输入','Tt','Training uses shifted target tokens; inference grows the target prefix.','训练使用移位目标 token；推理逐步增长目标前缀。'),node('Causal self-attention','因果自注意力','Tt × D','Target positions only read earlier target positions and themselves.','目标位置只能读取自身及更早目标位置。'),node('Cross-attention','交叉注意力','Tt × Ts','Target queries attend source encoder memory; source and target lengths may differ.','目标查询关注源编码器记忆；源与目标长度可以不同。'),node('FFN + residuals','FFN + 残差','Tt × D','Complete each decoder block with tokenwise feature mixing and residual/norm paths.','用逐 token 特征混合及残差 / 归一化路径完成解码器块。'),node('Vocabulary head','词表输出头','Tt × V','Predict the next target token, then continue autoregressively.','预测下一目标 token，并继续自回归生成。')];
  for(const [name,cn,flow,formula]of [['Encoder-only','仅编码器',encoder,'tokens → bidirectional encoder → task head'],['Encoder-decoder','编码器-解码器',ed,'source → encoder KV; target → causal self-attention → cross-attention → FFN → logits']]){
   MT(name,cn);viewSpecs[name]={scene:'overview',layout:name,flow};variantDetails[name]={formula,cost:MT(name,cn),costNote:MODEL_COMMON_SCOPE,steps:flow.map(n=>[n.title,n.text]),notation:[MODEL_NOTATION[0],['Ts, Tt',MT('source and target token counts','源序列与目标序列 token 数')]],details:[data.details[0],[MT('Layout diagram scope','布局图示范围'),MT('These are abstract encoder/decoder layouts. Normalization placement, task losses, position encoding and output heads depend on the specific model family.','此处为抽象编码器 / 解码器布局；归一化位置、任务损失、位置编码及输出头取决于具体模型家族。')]]};
  }
 }
 const variants=Object.keys(viewSpecs),first=variantDetails[variants[0]],kind=data.kind||operator?.scene;
 const image=kind==='diffusion';
 const t={id:data.id,section,name,short:data.lede,symbol:isOperator?'ƒ':section==='models'?data.family.slice(0,2):'◇',badge:isOperator?'Operator walkthrough':section==='models'?'Named checkpoint':'Architecture blueprint',lede:data.lede,description:data.description||data.lede,tags:['Training','Inference'],curriculum:true,navGroup:isOperator?'Operators':data.family||'Blueprints',modelData:data,modelViews:viewSpecs,variants,variantDetails,mentalModel:data.lede,formula:first.formula,cost:first.cost,costNote:first.costNote,steps:first.steps,notation:first.notation,details:first.details,training:image?MODEL_IMAGE_TRAINING:MODEL_TRAINING,inference:image?MODEL_IMAGE_INFERENCE:MODEL_INFERENCE,caveat:MODEL_COMMON_SCOPE,related:[],sources:(data.refs||operator.refs).map(key=>'model_'+key)};
 if(kind==='public'){t.training=t.inference=MT('The cited public API documentation does not disclose the internal operator graph. Concrete published architectures are available on the GPT-2, GPT-3 and gpt-oss pages.','所引公开 API 文档未披露内部算子图；GPT-2、GPT-3、gpt-oss 页面提供具体公开架构。');}
 if(isOperator)t.related=['transformer','tensor-parallel'];
 else t.related=[...data.operators.slice(0,3).map(k=>modelOperatorTopicIds[k]),...(section==='models'?['transformer']:['tensor-parallel'])];
 if(kind==='diffusion')t.related=[modelOperatorTopicIds['diffusion-step'],'vision-transformer','activation-checkpointing'];
 if(kind==='rwkv'||kind==='ssm')t.related=[modelOperatorTopicIds[kind==='rwkv'?'rwkv-state':'state-space'],'gradient-accumulation','activation-checkpointing'];
 topics.push(t);return t;
}
for(const a of MODEL_ARCHITECTURES)registerCurriculum(a,'architectures');
for(const [id,op]of Object.entries(MODEL_OPERATORS))registerCurriculum({id:modelOperatorTopicIds[id],name:op.name,lede:op.lede,refs:op.refs},'architectures',op);
for(const m of NAMED_MODELS)registerCurriculum(m,'models');
MT(topics.length+' concepts. One connected system.',topics.length+' 个概念，连接为一个系统。');
function renderModelIntro(t){
 const d=t.modelData,group=topics.filter(x=>x.section==='models'&&x.navGroup===t.navGroup);
 const facts=(d.facts||[[MT('Scope','范围'),t.badge],[MT('Operator views','算子视图'),String(Object.keys(t.modelViews).length)],[MT('Execution','执行'),MT('Training + inference','训练 + 推理')]]).slice(0,4);
 const family=t.section==='models'?`<nav class="model-family-links" aria-label="${esc(MT('Model family','模型家族'))}">${group.map(x=>`<a class="${x.id===t.id?'current':''}" href="${href(x)}" ${x.id===t.id?'aria-current="page"':''}>${esc(x.name)}</a>`).join('')}</nav>`:'';
 return `${family}<div class="model-fact-strip">${facts.map(([k,v])=>`<div><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div><div class="model-source-status"><span class="status-dot"></span><span>${esc(MT('Verified source snapshot · 30 Oct 2026','来源核验快照 · 2026 年 10 月 30 日'))}</span><a href="model-sources.json" target="_blank" rel="noopener">${esc(MT('Scope & evidence','范围与依据'))} ↗</a></div><div class="model-view-tabs" role="group" aria-label="${esc(MT('Explore operators','探索算子'))}">${Object.keys(t.modelViews).map((name,i)=>`<button data-model-view="${esc(name)}" aria-pressed="${i===0}" class="${i===0?'selected':''}">${esc(name)}</button>`).join('')}</div>`;
}
function updateModelViewTabs(){if(!state.topic.curriculum)return;document.querySelectorAll('[data-model-view]').forEach(b=>{const on=b.dataset.modelView===state.algorithm;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});}
function modelMetadata(){const s=state.topic.modelViews[state.algorithm];return MT('WORKED EXAMPLE · '+(s.scene==='overview'?'MODEL STRUCTURE':state.algorithm),'计算示例 · '+(s.scene==='overview'?'模型结构':(ZH[state.algorithm]||state.algorithm)));}
function modelLessonComparisons(t){
 if(t.section!=='models')return null;
 const family=topics.filter(x=>x.section==='models'&&x.navGroup===t.navGroup);
 if(family.length<2)return null;
 return {headers:[MT('Model / checkpoint','模型 / 检查点'),MT('Published layout','公开布局'),MT('Parameters / scope','参数 / 范围')],rows:family.map(x=>[x.name,x.modelData.attention||modelBlueprintTitles[x.modelData.kind]||x.modelData.kind,x.modelData.facts?.[0]?.[1]||'—'])};
}
const MODEL_FRAME_COPY={};
function setModelFrames(scene,rows){MODEL_FRAME_COPY[scene]=rows.map(([en,zh,text,cn])=>({title:MT(en,zh),text:MT(text,cn)}));}
setModelFrames('attention',[
 ['Project query, keys and values','投影查询、键和值','Inspect Q, K and V before mixing. Four toy query heads share KV according to the selected head layout.','混合前先查看 Q、K、V；四个示意查询头按所选布局共享 KV。'],
 ['Compute scaled dot products','计算缩放点积','The final query [1,1] compares with four keys; divide each dot product by √2.','最终查询 [1,1] 与四个键比较，每个点积都除以 √2。'],
 ['Apply the causal mask','应用因果掩码','The lower triangle is visible. The final query can see all four positions; earlier rows cannot read the future.','下三角位置可见。最后查询能看到四个位置，较早行不能读取未来。'],
 ['Normalize the score row','归一化评分行','Stable softmax subtracts the maximum. The four weights are about 0.221,0.221,0.449,0.109.','稳定 softmax 先减去最大值；四个权重约为 0.221、0.221、0.449、0.109。'],
 ['Weight and sum V','对 V 加权求和','V rows are [1,0], [0,2], [3,1] and [1,1]. Multiply each by its attention weight and add.','V 的各行为 [1,0]、[0,2]、[3,1]、[1,1]；分别乘注意力权重后相加。'],
 ['Merge head outputs','合并各头输出','Distinct query heads produce distinct output features. Concatenate and project; sharing a KV head does not merge the query outputs.','不同查询头产生不同输出特征，随后拼接并投影；共享 KV 头不会合并查询头输出。']]);
setModelFrames('flash',[
 ['Initialize online statistics','初始化在线统计量','For one query row, start with m=−∞, ℓ=0 and u=0. Visit the same four keys as the attention example.','单个查询行从 m=−∞、ℓ=0、u=0 开始，访问与注意力示例相同的四个键。'],
 ['Consume the first KV tile','读取首个 KV 块','The first two scores both equal 0.707. Their tile has ℓ=2 after max subtraction and u=[1,2].','前两个评分均为 0.707；减最大值后，该块 ℓ=2、u=[1,2]。'],
 ['Rescale when the maximum grows','最大值增大时重新缩放','The next tile includes score 1.414. Multiply previous accumulators by exp(0.707−1.414), then add the new tile.','下一块包含评分 1.414；先将旧累积量乘 exp(0.707−1.414)，再加入新块。'],
 ['Normalize once at the end','最后仅归一化一次','O=u/ℓ matches the dense-attention example within floating-point rounding, without storing its full score matrix.','O=u/ℓ 在浮点舍入范围内与稠密注意力示例相同，且无需存完整评分矩阵。']]);
setModelFrames('norm',[
 ['Inspect the feature vector','查看特征向量','The vector [1,2,3,4] belongs to one token, or four channels in the GroupNorm example.','向量 [1,2,3,4] 属于一个 token，或组归一化示例中的四个通道。'],
 ['Reduce the right features','沿正确特征归约','The selected normalization determines which mean, mean square or group statistics are computed.','所选归一化决定计算均值、均方或哪些组统计量。'],
 ['Divide by the stabilized scale','除以稳定化尺度','Use the square root of the selected statistic plus ε. LayerNorm and GroupNorm also center by the appropriate mean.','使用选定统计量加 ε 后的平方根；LayerNorm、GroupNorm 还需减去相应均值。'],
 ['Apply learned affine parameters','应用学习仿射参数','The toy uses unit scale and zero bias. Actual learned scales and optional biases change the result.','示例使用单位缩放及零偏置；实际学习缩放与可选偏置会改变结果。']]);
setModelFrames('rope',[
 ['Choose two rotary pairs','选择两个旋转特征对','Use q=[1,0] and k=[1,1] as one illustrative feature pair.','用 q=[1,0]、k=[1,1] 表示一对示意特征。'],
 ['Rotate the query by 90°','将查询旋转 90°','A quarter-turn changes q=[1,0] to q′=[0,1]. The vector length is preserved.','四分之一圈把 q=[1,0] 变为 q′=[0,1]，向量长度保持不变。'],
 ['Rotate the key by the same angle','对键施加相同旋转','k=[1,1] becomes k′=[−1,1]. The original and jointly rotated dot products both equal one.','k=[1,1] 变为 k′=[−1,1]；原始点积与同时旋转后的点积均为一。'],
 ['Change the relative position','改变相对位置','Rotating only one position changes the dot product. Every feature pair uses its configured frequency.','只改变一个位置的旋转会改变点积；每个特征对使用其配置频率。']]);
setModelFrames('ffn',[
 ['Read x=[1,2]','读取 x=[1,2]','The worked projections are small stand-ins for learned dense matrices.','小型示例投影代替真实学习稠密矩阵。'],
 ['Expand features','扩展特征','The gate projection produces [1,2]; the second SwiGLU branch produces [3,−1]. GELU uses one branch.','门投影生成 [1,2]，SwiGLU 第二分支生成 [3,−1]；GELU 仅用单分支。'],
 ['Apply the activation','施加激活','Use SiLU for the selected SwiGLU gate, or GELU for the single-branch FFN.','SwiGLU 门使用 SiLU；单分支 FFN 使用 GELU。'],
 ['Gate and contract','门控并收缩','SwiGLU multiplies branches elementwise, then projects the intermediate features back to the residual width.','SwiGLU 逐元素相乘两分支，再将中间特征投影回残差宽度。']]);
setModelFrames('ssm',[
 ['Initialize the scalar state','初始化标量状态','Use h=0, inputs [2,1,3] and selected transition factors [0.5,0.8,0.2].','取 h=0、输入 [2,1,3]、选择的转移系数 [0.5,0.8,0.2]。'],
 ['Token 1 writes h=2','Token 1 写入 h=2','0.5×0+2=2. The input writes information into the state.','0.5×0+2=2，输入将信息写入状态。'],
 ['Token 2 retains and updates','Token 2 保留并更新','0.8×2+1=2.6. The selected transition keeps part of the old state.','0.8×2+1=2.6，选定转移保留部分旧状态。'],
 ['Token 3 forgets more history','Token 3 遗忘更多历史','0.2×2.6+3=3.52. A smaller transition retains less previous information.','0.2×2.6+3=3.52，更小转移系数保留更少历史。'],
 ['Read the state or scan the sequence','读取状态或扫描序列','The scalar toy uses y=h. A real Mamba block has learned readout, gates and head/state dimensions.','标量示例使用 y=h；真实 Mamba 另有学习读出、门控及头 / 状态维度。']]);
setModelFrames('delta',[
 ['Start from a zero matrix','从零矩阵开始','S is a key-by-value memory matrix. Each write depends on the prediction made from the decayed old state.','S 是键维 × 值维记忆矩阵；每次写入都依赖衰减旧状态给出的预测。'],
 ['Write key [1,0], value [2,1]','写入键 [1,0]、值 [2,1]','With β=0.5, the first memory row becomes [1,0.5].','取 β=0.5，首个记忆行变为 [1,0.5]。'],
 ['Correct the same key','修正同一个键','With λ=0.9 and next value [4,1], prediction is [0.9,0.45]; writing half the error makes the row [2.45,0.725].','取 λ=0.9、下一值 [4,1]，预测为 [0.9,0.45]；写入一半误差后，该行变为 [2.45,0.725]。'],
 ['Write another key','写入另一个键','For k=[0,1] and v=[1,3], the second row becomes [0.5,1.5] while the first decays to [2.205,0.6525].','取 k=[0,1]、v=[1,3]，第二行变为 [0.5,1.5]，第一行衰减为 [2.205,0.6525]。'],
 ['Read qᵀS','读取 qᵀS','The query [1,0] reads the first row. This is a recurrent matrix-memory read, not softmax over historical token rows.','查询 [1,0] 读取首行；这是递归矩阵记忆读取，并非对历史 token 行执行 softmax。']]);
setModelFrames('rwkv',[
 ['Inspect the previous matrix state','查看旧矩阵状态','Use S=[[1,2],[3,4]], w=[0.5,0.5], a=[1,0], b=[0,0.2], v=[1,2] and k=[0.5,0]. These are toy values.','取示意值 S=[[1,2],[3,4]]、w=[0.5,0.5]、a=[1,0]、b=[0,0.2]、v=[1,2]、k=[0.5,0]。'],
 ['Decay the old state','衰减旧状态','Right multiplication by diag(w) scales state columns.','右乘 diag(w) 缩放状态各列。'],
 ['Apply the version-specific modifier','施加版本特定修改项','RWKV-7 adds (Sa)bᵀ computed from the old state; RWKV-6 does not include that term in this core comparison.','RWKV-7 加上由旧状态计算的 (Sa)bᵀ；此核心对比中，RWKV-6 不含该项。'],
 ['Write the new KV association','写入新的 KV 联结','Add vkᵀ and read the resulting state. The actual readout includes version-specific gates and current-token terms.','加上 vkᵀ 并读取结果；真实读出还包括版本特定门控及当前 token 项。']]);
function diffusionTrainingFlow(data){
 const node=(label,cn,shape,text,ctext)=>({label:MT(label,cn),shape,title:MT(label,cn),text:MT(text,ctext)});
 return [node('Clean data','干净数据','image / latent','Sample a clean training example; its representation is the target endpoint.','采样干净训练样本，其表示作为目标端点。'),node('Encode if latent','潜空间模型先编码','xdata','A latent model first encodes an image with its autoencoder. Pixel-space models use the image directly.','潜空间模型先用自编码器编码图像；像素空间模型直接使用图像。'),node('Sample t and noise','采样 t 与噪声','t, ε / z','Sample a time level and independent noise. Training normally uses one sampled corruption per loss.','采样时间水平与独立噪声；训练通常每次损失只使用一个采样扰动。'),node('Corrupt / interpolate','扰动 / 插值','xₜ','Construct noisy data for DDPM or a noise-to-data interpolation for flow matching.','为 DDPM 构造含噪数据，或为流匹配构造噪声到数据的插值。'),node('Encode condition','编码条件','c','Encode text or other conditioning separately; it does not create the sampled Gaussian noise.','独立编码文本或其他条件；条件并不生成所采样的高斯噪声。'),node('Denoiser prediction','去噪器预测','εθ / vθ','Run the denoiser once on xₜ, time and conditioning. The target parameterization must match the model.','以 xₜ、时间及条件运行一次去噪器；目标参数化必须匹配模型。'),node('Build target','构造目标','ε or xdata−z','The toy DDPM target is sampled noise; the linear flow target is data minus initial noise. Release-specific targets may differ.','示例 DDPM 目标是采样噪声；线性流目标是数据减初始噪声，具体发布可使用不同目标。'),node('Loss → gradients','损失 → 梯度','ℒ = ‖pred−target‖²','Compare prediction and target, then update the trained components. No complete inference sampling chain is required.','比较预测与目标，再更新参与训练的组件；无需运行完整推理采样链。')];
}
function modelSelectedLesson(t,option,mode){
 const lesson=t.variantDetails[option]||t.variantDetails[t.variants[0]],view=t.modelViews[option];
 if(view.scene==='overview'&&t.modelData.kind==='diffusion'&&mode==='Training'){
  const flow=diffusionTrainingFlow(t.modelData);return {...lesson,formula:'ℒ = E₍x,t,noise₎ ‖denoiser(xₜ,t,c) − target(x,noise,t)‖²',cost:MODEL_IMAGE_TRAINING,steps:flow.map(n=>[n.title,n.text]),notation:[['x, xₜ, t, c, ℒ',MT('clean data, corrupted data, sampled time, conditioning and task loss','干净数据、扰动数据、采样时间、条件、任务损失')]]};
 }
 return lesson;
}
function modelFrames(topic,option,mode){
 const view=topic.modelViews[option]||Object.values(topic.modelViews)[0],isOverview=view.scene==='overview';let frames=[];
 const trainingDiffusion=isOverview&&topic.modelData.kind==='diffusion'&&mode==='Training',activeFlow=trainingDiffusion?diffusionTrainingFlow(topic.modelData):view.flow||topic.modelData.flow;
 if(isOverview)frames=activeFlow.map((n,i)=>({kind:'model',scene:'overview',stage:i,title:n.title,text:n.text,flow:activeFlow}));
 else{
  const op=MODEL_OPERATORS[view.op],copy=MODEL_FRAME_COPY[view.scene]||op.steps.map(([title,text])=>({title,text}));
  frames=copy.map((n,i)=>({kind:'model',scene:view.scene,stage:i,title:n.title,text:n.text}));
  if(view.scene==='attention'&&['Bidirectional','Cross-attention'].includes(view.layout)){
   frames[0]={...frames[0],title:MT('Project queries and context','投影查询与上下文'),text:view.layout==='Cross-attention'?MT('Q uses query states; K,V use another sequence. The mask has three query rows and four context columns.','Q 来自查询状态，K,V 来自另一序列；掩码为三个查询行、四个上下文列。'):MT('Q,K,V share one sequence. Each position can use both earlier and later valid tokens.','Q,K,V 来自同一序列；每个位置可使用之前及之后的有效 token。')};
   frames[2]={...frames[2],title:MT('Allow all valid context positions','允许全部有效上下文位置'),text:MT('There is no causal triangle in this view. A real padded batch still masks invalid context positions before softmax.','本视图没有因果三角；真实填充批次仍需在 softmax 前屏蔽无效上下文位置。')};
  }
  if(view.scene==='attention'&&view.layout==='Gated GQA')frames[5]={...frames[5],title:MT('Gate the head outputs before projection','投影前门控各头输出'),text:MT('The worked gate is 0.5. Multiply attention features by this gate, then concatenate/project. Gate values are learned and input-dependent in the actual model.','示例门值为 0.5；注意力特征乘门后再拼接 / 投影。实际模型的门值由学习得到，并依赖当前输入。')};
  if(view.scene==='ffn'&&['GELU','Squared ReLU'].includes(view.layout)){
   frames[1]={...frames[1],text:MT('The selected operator uses one expanded activation branch. The toy projected vector is [1,2].','所选算子使用单个扩展激活分支，示例投影向量为 [1,2]。')};
   frames[2]={...frames[2],text:view.layout==='Squared ReLU'?MT('ReLU squared maps [1,2] to [1,4]. RWKV also time-mixes inputs before this projection.','ReLU 平方将 [1,2] 映为 [1,4]；RWKV 还在此投影前进行输入时间混合。'):MT('GELU maps [1,2] to approximately [0.841,1.955]. No SiLU gate or second branch is used.','GELU 将 [1,2] 映为约 [0.841,1.955]；不使用 SiLU 门或第二分支。')};
   frames[3]={...frames[3],title:MT('Contract the activated features','收缩激活特征'),text:MT('A learned down projection maps the single activation branch back to the residual width.','学习到的下投影把单个激活分支映回残差宽度。')};
  }

  if(view.scene==='conv'&&view.layout!=='1D depthwise')frames=Array.from({length:10},(_,i)=>({kind:'model',scene:'conv',stage:i,title:i?MT('Convolution window '+i,'卷积窗口 '+i):op.steps[0][0],text:i?MT('Multiply the highlighted 2×2 window by [[1,0],[0,1]] and write its sum into output position '+i+'.','将高亮 2×2 窗口与 [[1,0],[0,1]] 相乘，并将和写入第 '+i+' 个输出位置。'):op.steps[0][1]}));
 }
 if(view.scene==='conv'&&view.layout==='1D depthwise')frames=Array.from({length:7},(_,i)=>({kind:'model',scene:'conv',stage:i,title:i?MT('Causal convolution position '+i,'因果卷积位置 '+i):MT('Initialize two independent channels','初始化两个独立通道'),text:MT('Each channel uses [1,0,1] on current and two previous inputs. Out-of-range history is zero; no future input is used.','各通道以 [1,0,1] 处理当前及前两个输入；超出范围的历史填零，不读取未来输入。')}));
 if(mode==='Training'&&topic.modelData.kind!=='public'){
  frames.push({kind:'model',scene:isOverview?'overview':view.scene,stage:frames.length,title:MT('Training: loss and gradient flow','训练：损失与梯度流'),text:topic.modelData.kind==='diffusion'?MODEL_IMAGE_TRAINING:MT('Backpropagate through the selected computation, preserving its mask, routing or recurrence. Learned parameter gradients accumulate over the examples that used them. Inference omits this backward pass.','沿所选计算反向传播，保留其掩码、路由或递推依赖。学习参数的梯度累积自使用它们的样本；推理不执行此反向过程。'),gradient:true,flow:activeFlow});
 }
 return frames.map(f=>({...f,mode,layout:view.layout,variant:option,topicId:topic.id,op:view.op,model:topic.modelData,trainingDiffusion,total:frames.length}));
}
function modelNum(x){return Number.isFinite(x)?String(Math.round(x*1000)/1000):x===-Infinity?'−∞':String(x);}
function modelMat(x,y,data,name,options={}){
 const rows=data.length,cols=data[0]?.length||0,cw=options.cw||38,ch=options.ch||31,w=cols*cw,h=rows*ch;let s='';
 s+=`<g class="model-matrix" data-model-matrix="${esc(name)}" data-rows="${rows}" data-cols="${cols}" data-values="${esc(JSON.stringify(data))}">`;
 s+=textSVG(x+w/2,y-12,name,'class="matrix-label" text-anchor="middle" style="font-size:10px"');
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const masked=options.mask?.(r,c),hot=options.hot?.(r,c),fill=masked?'#eff2eb':hot?PALETTE[1]:options.color||PALETTE[0];
  s+=rectSVG(x+c*cw,y+r*ch,cw-3,ch-3,fill,`class="model-cell ${masked?'masked-cell':''} ${hot?'model-cell-hot':''}"`);
  if(!options.hide?.(r,c))s+=textSVG(x+c*cw+(cw-3)/2,y+r*ch+(ch-3)/2+4,typeof data[r][c]==='number'?modelNum(data[r][c]):data[r][c],'text-anchor="middle" class="mono on-data" style="font-size:10px"');
 }
 s+=`<path d="M ${x-5} ${y-2} h-4 v${h+1} h4 M ${x+w+2} ${y-2} h4 v${h+1} h-4" class="matrix-bracket" fill="none" stroke="#8795a5"/>`;
 return s+'</g>';
}
function modelLine(x1,y1,x2,y2,active=false,backward=false){return `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" class="model-edge ${active?'model-edge-active':''}" stroke="${active?'#6d86a4':'#a9b2bf'}" stroke-width="${active?2:1}" ${backward?'stroke-dasharray="4 3"':''} marker-end="url(#model-arrow)"/>`;}
function modelBox(x,y,w,h,title,sub='',active=false){const max=Math.max(String(title).length,(ZH[title]||'').length*1.5),font=Math.max(8,Math.min(11,(w-12)/(max*.58)));return rectSVG(x,y,w,h,'#fff',`class="node-shell ${active?'model-active':''}"`)+textSVG(x+w/2,y+h/2-(sub?3:-4),title,`text-anchor="middle" class="node-label" style="font-size:${font}px"`)+(sub?textSVG(x+w/2,y+h/2+14,sub,'text-anchor="middle" class="subtext mono" style="font-size:9px"'):'');}
function modelNote(text,y=425){return textSVG(360,y,text,'text-anchor="middle" class="subtext" style="font-size:10px"');}
function attentionExample(){
 const q=[1,1],k=[[1,0],[0,1],[1,1],[-1,1]],v=[[1,0],[0,2],[3,1],[1,1]],scores=k.map(row=>(row[0]+row[1])/Math.sqrt(2)),m=Math.max(...scores),e=scores.map(x=>Math.exp(x-m)),l=e.reduce((a,b)=>a+b,0),a=e.map(x=>x/l),o=[0,1].map(c=>a.reduce((sum,w,i)=>sum+w*v[i][c],0));
 return {q,k,v,scores,a,o,m,l};
}
function renderModelOverview(f){
 if(f.model.kind==='diffusion')return renderDiffusionOverview(f);
 const flow=f.flow||f.model.flow,n=flow.length,cols=n>6?5:3,rows=Math.ceil(n/cols),w=112,h=62,gx=25,gy=40,x0=(720-(cols*w+(cols-1)*gx))/2,y0=72;let s='';
 s+=textSVG(360,30,f.model.name,'text-anchor="middle" class="diagram-label" style="font-size:13px"');
 const coords=flow.map((_,i)=>{const r=Math.floor(i/cols),c=r%2?cols-1-i%cols:i%cols;return {x:x0+c*(w+gx),y:y0+r*(h+gy)}});
 for(let i=1;i<n;i++){
  if(f.layout==='Encoder-decoder'&&i===3)continue;
  const a=coords[i-1],b=coords[i],same=a.y===b.y,x1=same?(a.x<b.x?a.x+w:a.x):a.x+w/2,y1=same?a.y+h/2:a.y+h,x2=same?(a.x<b.x?b.x:b.x+w):b.x+w/2,y2=same?b.y+h/2:b.y;
  s+=f.gradient?modelLine(x2,y2,x1,y1,true,true):modelLine(x1,y1,x2,y2,i===f.stage);
  if(i===f.stage&&!f.gradient)s+=`<circle r="3" fill="#7899bf"><animateMotion dur="1.2s" repeatCount="indefinite" path="M${x1} ${y1} L${x2} ${y2}"/></circle>`;
 }
 if(f.layout==='Encoder-decoder'){const a=coords[2],b=coords[5];s+=f.gradient?modelLine(b.x+w/2,b.y,a.x+w/2,a.y+h,true,true):modelLine(a.x+w/2,a.y+h,b.x+w/2,b.y,f.stage>=5);}
 for(let i=0;i<n;i++){const p=coords[i],node=flow[i];s+=`<g opacity="${i<=f.stage||f.gradient?1:.45}">`+modelBox(p.x,p.y,w,h,node.label,node.shape,i===Math.min(f.stage,n-1)||f.gradient)+'</g>';}
 const baseY=Math.min(345,y0+rows*(h+gy)+12),progress=Math.min(f.stage,n-1);
 if(f.model.pattern?.length){
  s+=textSVG(125,baseY,MT('Layer pattern','层模式'),'class="diagram-label" text-anchor="middle" style="font-size:10px"');
  f.model.pattern.forEach((p,i)=>{s+=modelBox(200+i*90,baseY-24,75,39,p,'',i===progress%f.model.pattern.length)});
  s+=modelNote(MT('Δ: Gated DeltaNet · A: full attention · SWA: sliding-window attention','Δ：门控 DeltaNet · A：完整注意力 · SWA：滑动窗口注意力'),baseY+35);
 }else{
  const sub='₀₁₂₃₄₅';const vals=Array.from({length:3},(_,r)=>Array.from({length:6},(_,c)=>'h'+sub[r]+sub[c]));
  s+=modelMat(246,baseY-3,vals,MT('Hidden tensor: token rows × feature columns','隐藏张量：token 行 × 特征列'),{cw:38,ch:22,hot:(r,c)=>c===progress%6});
 }
 if(f.gradient)s+=modelNote(MT('Loss → gradients → learned parameters · dashed arrows show backward dependencies','损失 → 梯度 → 学习参数 · 虚线表示反向依赖'),435);
 else s+=modelNote(MT('Boxes summarize subgraphs; repeated blocks have their own weights.','方框概括子图；重复模型块拥有各自的权重。'),435);
 return s;
}
function renderModelAttention(f){
 const d=attentionExample(),st=f.stage,causal=!['Bidirectional','Cross-attention'].includes(f.layout),cross=f.layout==='Cross-attention';let s='';
 const heads=f.layout==='MQA'?1:f.layout.includes('GQA')?2:4,gated=f.layout==='Gated GQA';
 s+=textSVG(360,26,MT('Query heads and shared KV heads','查询头与共享 KV 头'),'text-anchor="middle" class="diagram-label" style="font-size:11px"');
 for(let i=0;i<4;i++){const x=132+i*123;s+=modelBox(x,42,75,33,'Q'+i,'',st===0);const kv=Math.floor(i*heads/4);s+=modelLine(x+37,76,170+kv*(430/heads),103,true);}
 for(let j=0;j<heads;j++)s+=modelBox(138+j*(430/heads),105,65,29,'KV'+j,'',st===0);
 s+=modelMat(45,183,[d.q],'q',{cw:39,ch:34,color:PALETTE[2]});s+=modelMat(158,160,d.k,'K',{cw:34,ch:31,hot:()=>st===1});
 s+=modelMat(278,160,Array.from({length:cross?3:4},(_,r)=>Array.from({length:4},(_,c)=>!causal||c<=r?'✓':'−∞')),causal?MT('Causal mask','因果掩码'):cross?MT('Query × context mask','查询 × 上下文掩码'):MT('Bidirectional mask','双向掩码'),{cw:31,ch:31,mask:(r,c)=>causal&&c>r,hot:(r,c)=>st===2&&r===(cross?2:3)});
 s+=modelMat(460,160,d.v,'V',{cw:34,ch:31,hot:()=>st===4});
 s+=modelMat(575,183,[st>=4?d.o.map(x=>gated&&st===5?x*.5:x):['?','?']],gated&&st===5?'gated O':'O',{cw:44,ch:34,color:PALETTE[1]});
 s+=modelLine(119,201,148,201,st===1)+modelLine(229,201,264,201,st>=2)+modelLine(408,201,447,201,st>=3)+modelLine(531,201,565,201,st>=4);
 s+=modelMat(70,326,[st>=1?d.scores:['?','?','?','?']],MT('Last query scores','最后查询评分'),{cw:70,ch:33,hot:()=>st===1});
 s+=modelMat(386,326,[st>=3?d.a:['?','?','?','?']],MT('Softmax weights','Softmax 权重'),{cw:65,ch:33,color:PALETTE[1]});
 s+=modelNote(gated&&st===5?MT('Toy sigmoid gate = 0.5 → halve attention output before Wₒ','示例 sigmoid 门值 = 0.5 → Wₒ 前将注意力输出减半'):st>=4?MT('O = ['+d.o.map(modelNum).join(', ')+'] · all four final-query keys participate','O = ['+d.o.map(modelNum).join(', ')+'] · 最后查询的四个键均参与'):MT('Four tokens, head dimension 2; the head-sharing strip is schematic.','四个 token，头维度 2；头共享条为示意。'),401);
 return s;
}
function renderModelFlash(f){
 const d=attentionExample(),st=f.stage;let s='';
 s+=modelMat(48,81,[d.q],'q',{cw:42,ch:35});s+=modelMat(217,67,d.k,'K',{cw:39,ch:30,hot:r=>st===1?r<2:st>=2?r>=2:false});s+=modelMat(397,67,d.v,'V',{cw:39,ch:30,hot:r=>st===1?r<2:st>=2?r>=2:false});
 s+=modelBox(550,81,130,75,MT('Fast-memory tile','高速存储块'),MT('not full T × T','非完整 T × T'),st===1||st===2);
 const m=st===0?'−∞':st===1?d.scores[0]:d.m,l=st===0?0:st===1?2:d.l,u=st===0?[0,0]:st===1?[1,2]:d.o.map(x=>x*d.l);
 s+=modelBox(70,242,155,70,'m',modelNum(m),st>=1)+modelBox(281,242,155,70,'ℓ',modelNum(l),st>=1)+modelMat(507,258,[u],'u',{cw:68,ch:42,color:PALETTE[1]});
 s+=modelLine(292,188,292,227,st>=1)+modelLine(474,188,543,227,st>=1);
 s+=modelMat(292,366,[st>=3?d.o:['?','?']],'O = u / ℓ',{cw:64,ch:36,color:PALETTE[2]});
 s+=modelNote(MT('All tiles share one row normalization. No independent per-tile softmax averaging.','所有块共用同一个行归一化，不能对独立块 softmax 简单平均。'),435);return s;
}
function renderModelNorm(f){
 const x=[1,2,3,4],layer=f.layout==='LayerNorm',group=f.layout==='GroupNorm',mu=layer?2.5:0,stat=layer?1.25:7.5,result=group?[-1,1,-1,1]:x.map(v=>(v-mu)/Math.sqrt(stat));let s='';
 s+=modelMat(160,75,[x],'x',{cw:100,ch:46,hot:(_,c)=>group&&c<2});
 s+=modelLine(360,124,360,169,f.stage>=1);
 s+=modelBox(73,183,170,78,group?MT('Group means','组均值'):layer?'μ':'mean(x²)',group?'1.5 / 3.5':layer?'2.5':'7.5',f.stage===1);
 s+=modelBox(275,183,170,78,group?MT('Group variances','组方差'):layer?'σ²':'RMS',group?'0.25 / 0.25':layer?'1.25':'√7.5',f.stage===2);
 s+=modelBox(477,183,170,78,'γ / b','1 / 0',f.stage===3);
 s+=modelLine(360,264,360,315,f.stage>=2);
 s+=modelMat(160,335,[f.stage>=2?result:['?','?','?','?']],f.layout,{cw:100,ch:46,color:PALETTE[1]});
 s+=modelNote(group?MT('Two channel groups; each sample uses its own statistics.','两个通道组，每个样本使用自己的统计量。'):MT('Feature reduction per token; this is not batch normalization.','逐 token 沿特征归约，不是批归一化。'),421);return s;
}
function renderModelRoPE(f){
 const angles=f.stage===0?[0,0]:f.stage===1?[Math.PI/2,0]:f.stage===2?[Math.PI/2,Math.PI/2]:[Math.PI,0],orig=[[1,0],[1,1]],pts=orig.map(([a,b],i)=>[a*Math.cos(angles[i])-b*Math.sin(angles[i]),a*Math.sin(angles[i])+b*Math.cos(angles[i])]);let s='';
 for(let i=0;i<2;i++){const cx=197+i*321,cy=215;s+=`<circle cx="${cx}" cy="${cy}" r="100" class="model-axis-circle" fill="none" stroke="#cad2df" stroke-dasharray="3 4"/>`;s+=modelLine(cx-115,cy,cx+115,cy)+modelLine(cx,cy+115,cx,cy-115);s+=`<path d="M ${cx} ${cy} l ${orig[i][0]*60} ${-orig[i][1]*60}" stroke="#aab4c3" stroke-width="2" stroke-dasharray="4 3"/>`;s+=modelLine(cx,cy,cx+pts[i][0]*60,cy-pts[i][1]*60,true);s+=textSVG(cx,72,i?'k':'q','text-anchor="middle" class="diagram-label"');s+=modelMat(cx-75,350,[pts[i]],i?'k′':'q′',{cw:75,ch:34,color:PALETTE[i]});}
 const dot=pts[0][0]*pts[1][0]+pts[0][1]*pts[1][1];s+=modelNote(MT('Rotated dot product = ','旋转后点积 = ')+modelNum(dot),424);return s;
}
function renderModelFFN(f){
 const squared=f.layout==='Squared ReLU',gelu=f.layout==='GELU'||squared,g=[1,2],u=[3,-1],act=g.map(x=>squared?Math.max(0,x)**2:gelu?.5*x*(1+Math.tanh(Math.sqrt(2/Math.PI)*(x+.044715*x**3))):x/(1+Math.exp(-x))),hidden=gelu?act:act.map((x,i)=>x*u[i]);let s='';
 s+=modelMat(43,215,[[1,2]],'x',{cw:38,ch:38,color:PALETTE[2]});
 s+=modelMat(213,90,[g],gelu?'xW₁':'xWg',{cw:53,ch:36});
 s+=modelBox(382,82,133,48,squared?'ReLU²':gelu?'GELU':'SiLU','',f.stage===2);
 s+=modelMat(568,90,[f.stage>=2?act:['?','?']],squared?'ReLU²(xW₁)':gelu?'GELU(xW₁)':'SiLU(g)',{cw:56,ch:36,color:PALETTE[1]});
 s+=modelLine(125,234,203,111,f.stage>=1)+modelLine(322,108,372,108,f.stage>=2)+modelLine(516,108,557,108,f.stage>=2);
 if(!gelu){s+=modelMat(213,228,[u],'xWu',{cw:53,ch:36});s+=modelLine(125,234,203,246,f.stage>=1)+modelLine(326,246,383,246,f.stage>=3);s+=modelBox(393,222,82,43,'⊙','',f.stage===3);s+=modelLine(618,130,475,240,f.stage>=3);}
 s+=modelMat(454,333,[f.stage>=3?hidden:['?','?']],gelu?MT('Hidden activation','隐藏激活'):MT('Gated features','门控特征'),{cw:90,ch:38,color:PALETTE[1]});
 s+=modelBox(99,326,164,62,'Wd : F → D','',f.stage===3)+modelLine(444,353,273,353,f.stage>=3);
 s+=modelNote(MT('The expansion is tokenwise; communication appears only when the weight layout requires it.','扩展按 token 独立计算；只有权重布局需要时才产生通信。'),424);return s;
}
function renderModelRouting(f){
 const probs=[.1,.5,.3,.1],selected=[1,2];let s=modelMat(68,75,[probs],MT('Router probabilities','路由概率'),{cw:65,ch:37,hot:(_,c)=>f.stage>=1&&selected.includes(c)});
 s+=modelBox(420,64,220,62,'Top-2 → 0.625 / 0.375','',f.stage===1);
 for(let i=0;i<4;i++){const x=50+i*169,on=selected.includes(i)&&f.stage>=1;s+=modelBox(x,202,118,62,'Expert '+i,on?(i===1?'[4,0]':'[0,8]'):'',on);s+=modelLine(195,116,x+59,190,on);}
 s+=modelMat(122,341,[[f.stage>=3?2.5:'?',f.stage>=3?3:'?']],MT('Weighted routed output','路由加权输出'),{cw:75,ch:37,color:PALETTE[1]});
 s+=modelBox(360,324,130,62,MT('Shared expert','共享专家'),'[1,1]',f.stage>=2);s+=modelMat(548,341,[[f.stage>=3?3.5:'?',f.stage>=3?4:'?']],'y',{cw:54,ch:37,color:PALETTE[2]});
 s+=modelLine(280,359,350,359,f.stage>=3)+modelLine(495,359,537,359,f.stage>=3);
 s+=modelNote(MT('Toy softmax router; real releases may select and normalize scores differently.','示意 softmax 路由器；真实模型可能采用不同的评分选择和归一化。'),431);return s;
}
function renderModelMLA(f){
 let s=modelMat(40,98,[[1,2,3,4,5,6,7,8]],'x : D=8',{cw:28,ch:36});
 s+=modelLine(276,116,362,116,f.stage>=1)+modelMat(383,98,[[.4,.8]],'cKV : 2',{cw:54,ch:36,color:PALETTE[1]});
 s+=modelMat(540,98,[[.2,.6]],'kRoPE : 2',{cw:54,ch:36,color:PALETTE[2]});
 s+=modelBox(350,194,330,65,MT('Cache latent + rotary key','缓存潜变量 + 旋转键'),'DeepSeek V3: 512 + 64 = 576',f.stage>=1);
 s+=modelLine(435,138,435,184,f.stage>=1)+modelLine(590,138,590,184,f.stage>=1);
 s+=modelBox(53,306,235,60,MT('Query / matrix absorption','查询 / 矩阵吸收'),'q × cached latent',f.stage>=2);
 s+=modelBox(395,306,255,60,MT('Attention → output projection','注意力 → 输出投影'),'low-rank value path',f.stage>=3);
 s+=modelLine(350,228,171,295,f.stage>=2)+modelLine(288,337,385,337,f.stage>=3);
 s+=modelNote(MT('Toy dimensions above; 576 is V3 scalars per token per layer, excluding metadata.','上方维度为示意；576 是 V3 每 token 每层标量数，不含元数据。'),428);return s;
}
function renderModelSparse(f){
 const scores=[.1,.8,.2,.7,.4,.9],sel=[1,5];let s=modelMat(61,73,[scores],MT('Learned index scores','学习索引评分'),{cw:95,ch:39,hot:(_,c)=>f.stage>=1&&sel.includes(c)});
 s+=modelBox(223,173,274,58,MT('Select candidate positions 1 and 5','选择候选位置 1 和 5'),'top-2 (toy)',f.stage===1);
 for(let i=0;i<6;i++)s+=modelBox(40+i*113,290,83,58,'KV '+i,sel.includes(i)&&f.stage>=2?'✓':'',f.stage>=2&&sel.includes(i));
 s+=modelLine(360,116,360,163,f.stage>=1)+modelLine(300,236,194,280,f.stage>=2)+modelLine(420,236,646,280,f.stage>=2);
 s+=modelNote(MT('Main attention visits selected KV rows. Pruning changes attention; FlashAttention does not.','主注意力访问所选 KV 行；剪枝改变注意力，FlashAttention 则保持稠密结果。'),417);return s;
}
function renderModelCompressed(f){
 const hca=f.layout==='HCA',groups=hca?1:2;let s='';
 for(let i=0;i<12;i++)s+=modelBox(24+i*57,65,46,40,String(i),'',i>=8);
 for(let j=0;j<groups;j++){const x=100+j*170;s+=modelBox(x,195,145,70,MT('Learned summary','学习压缩表示')+' '+j,hca?'8 → 1':'4 → 1',f.stage>=1);for(let i=j*(8/groups);i<(j+1)*8/groups;i++)s+=modelLine(47+i*57,109,x+72,184,f.stage>=1);}
 s+=modelBox(469,195,210,70,MT('Recent window','近期窗口'),'tokens 8,9,10,11',f.stage>=1);
 s+=modelBox(219,329,282,58,hca?MT('Highly compressed attention','高压缩注意力'):MT('Select → compressed attention','选择 → 压缩注意力'),'',f.stage>=2);
 s+=modelLine(172,270,280,318,f.stage>=2)+modelLine(574,270,448,318,f.stage>=2);
 s+=modelNote(MT('Toy groups / window. V4 uses ratios 4 or 128 and a 128-token local window.','分组与窗口为示意；V4 使用压缩比 4 或 128，局部窗口为 128 token。'),420);return s;
}
function renderModelHyper(f){
 const mixed=[[1.4,2.4],[2.6,3.6]],out=[[1.6,2.8],[2.9,4.2]];let s=modelMat(52,87,[[1,2],[3,4]],'X : 2 streams',{cw:48,ch:35});
 s+=modelMat(242,78,[[.8,.2],[.2,.8]],'Hres',{cw:51,ch:35,color:PALETTE[1]});
 s+=modelMat(470,87,f.stage>=1?mixed:[['?','?'],['?','?']],'Hres X',{cw:61,ch:35});
 s+=modelLine(154,118,230,118,f.stage>=1)+modelLine(352,118,459,118,f.stage>=1);
 s+=modelBox(43,252,185,66,'Hpre X = [2,3]','Hpre = [0.5,0.5]',f.stage>=1);
 s+=modelBox(269,252,168,66,'F = [0.5,1]','Hpost = [0.4,0.6]',f.stage>=2);
 s+=modelLine(232,284,258,284,f.stage>=2)+modelLine(441,284,505,284,f.stage>=3);
 s+=modelMat(526,257,f.stage>=3?out:[['?','?'],['?','?']],'Xnext',{cw:62,ch:35,color:PALETTE[2]});
 s+=modelNote(MT('Hres rows and columns sum to 1. Toy 2 streams; V4 uses 4. No network collective.','Hres 每行每列和均为 1；示例为 2 路，V4 为 4 路；不是网络集合通信。'),422);return s;
}
function renderModelSSM(f){
 const h=[0,2,2.6,3.52],active=Math.min(3,f.stage);let s='';
 for(let i=0;i<4;i++){const x=40+i*178;s+=modelBox(x,159,118,78,'h'+i,String(i<=active?h[i]:'?'),i===active);if(i){s+=modelLine(x-52,198,x-11,198,i<=active);s+=modelBox(x,61,118,50,'x='+[2,1,3][i-1],'a='+[.5,.8,.2][i-1],i===active);s+=modelLine(x+59,116,x+59,148,i<=active);}}
 s+=modelBox(100,309,520,65,'hₜ = aₜhₜ₋₁ + xₜ','(a₂,b₂) ∘ (a₁,b₁) = (a₂a₁, a₂b₁+b₂)',f.stage===4);
 s+=modelNote(MT('Sequential state at decode; associative affine composition enables a training scan.','解码按序更新状态；仿射映射的结合律支持训练扫描。'),431);return s;
}
function renderModelDelta(f){
 const states=[[[0,0],[0,0]],[[1,.5],[0,0]],[[2.45,.725],[0,0]],[[2.205,.6525],[.5,1.5]]],idx=Math.min(3,f.stage),tokens=[['—','—'],['[1,0]','[2,1]'],['[1,0]','[4,1]'],['[0,1]','[1,3]']];let s=modelBox(42,69,215,74,'k = '+tokens[idx][0],'v = '+tokens[idx][1],true);
 s+=modelBox(328,64,330,74,'λ = 0.9   β = 0.5','decay → predict → correct',f.stage>=1);
 s+=modelMat(65,233,idx===0?states[0]:states[idx-1].map(r=>r.map(x=>x*.9)),MT('Decayed old state','衰减旧状态'),{cw:67,ch:39});
 s+=modelMat(296,233,states[idx],'Snew',{cw:65,ch:39,color:PALETTE[1]});
 s+=modelLine(209,274,285,274,f.stage>=1);
 s+=modelMat(526,233,[states[idx][0]],'qᵀS, q=[1,0]',{cw:66,ch:39,color:PALETTE[2]});s+=modelLine(434,253,515,253,f.stage===4);
 s+=modelNote('S ← λS;   p = kᵀS;   S ← S + βk(v−p)ᵀ;   y = qᵀS',380);
 s+=modelNote(MT('Key-by-value matrix memory; toy unit queries omit the implementation’s query scaling.','键维 × 值维矩阵记忆；示例单位查询省略实现中的查询缩放。'),424);return s;
}
function renderModelRWKV(f){
 const seven=f.layout!=='RWKV-6',decay=[[.5,1],[1.5,2]],mod=seven?[[0,.2],[0,.6]]:[[0,0],[0,0]],out=seven?[[1,1.2],[2.5,2.6]]:[[1,1],[2.5,2]];let s=modelMat(63,94,f.stage>=1?decay:[[1,2],[3,4]],f.stage?'S diag(w)':'Sold',{cw:67,ch:40});
 s+=modelMat(299,94,f.stage>=2?mod:[['?','?'],['?','?']],seven?'(Sold a)bᵀ':'modifier = 0',{cw:60,ch:40,color:PALETTE[1]});
 s+=modelMat(533,94,[[.5,0],[1,0]],'vkᵀ',{cw:58,ch:40,color:PALETTE[2]});
 s+=textSVG(250,143,'+','class="diagram-label" text-anchor="middle"')+textSVG(486,143,'+','class="diagram-label" text-anchor="middle"');
 s+=modelMat(285,302,f.stage>=3?out:[['?','?'],['?','?']],'Snew : '+f.layout,{cw:75,ch:41,color:PALETTE[3]});
 s+=modelLine(360,184,360,276,f.stage>=3)+modelNote(MT('The modifier uses the OLD state. Version-specific readout gates are omitted.','修改项使用旧状态；此处省略各版本特定读出门。'),432);return s;
}
function renderModelConv(f){
 if(f.layout==='1D depthwise'){
  const input=[[1,2,3,4,5,6],[2,4,6,8,10,12]],pos=Math.max(0,f.stage-1),output=input.map(row=>row.map((v,i)=>v+(row[i-2]||0)));let s=modelMat(88,99,input,MT('Input: channels × time','输入：通道 × 时间'),{cw:91,ch:43,hot:(_,c)=>f.stage>0&&c<=pos&&c>=pos-2});
  s+=modelBox(232,238,256,55,'W[c] = [1,0,1]','left history only',f.stage>0)+modelLine(360,190,360,226,f.stage>0);
  s+=modelMat(88,343,output.map(row=>row.map((v,c)=>c<f.stage?v:'?')),MT('Output: channels stay separate','输出：通道保持独立'),{cw:91,ch:35,hot:(_,c)=>f.stage>0&&c===pos});
  s+=modelLine(360,299,360,320,f.stage>0)+modelNote(MT('Toy length 3; depthwise means each channel has its own filter, not a channel reduction.','示例核长为 3；深度卷积指每通道独立滤波，并非沿通道归约。'),442);return s;
 }
 const input=Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>r*4+c+1)),i=Math.max(0,f.stage-1),r=Math.floor(i/3),c=i%3,output=Array.from({length:3},(_,a)=>Array.from({length:3},(_,b)=>a*8+b*2+7));
 let s=modelMat(54,111,input,'Input 4 × 4',{cw:47,ch:44,hot:(a,b)=>f.stage>0&&a>=r&&a<r+2&&b>=c&&b<c+2});
 s+=modelMat(324,151,[[1,0],[0,1]],'Kernel 2 × 2',{cw:40,ch:42,color:PALETTE[2]});
 s+=modelMat(502,133,output.map((row,a)=>row.map((v,b)=>a*3+b<f.stage?v:'?')),'Output 3 × 3',{cw:47,ch:44,hot:(a,b)=>f.stage>0&&a===r&&b===c});
 s+=modelLine(253,195,311,195,f.stage>0)+modelLine(409,195,490,195,f.stage>0);
 s+=modelNote(f.stage>0?`${input[r][c]} × 1 + ${input[r][c+1]} × 0 + ${input[r+1][c]} × 0 + ${input[r+1][c+1]} × 1 = ${output[r][c]}`:'stride = 1, padding = 0',359);
 s+=modelNote(MT('One input/output channel; deep CNNs sum over input channels and learn many filters.','示例为单输入 / 输出通道；深层 CNN 沿输入通道求和并学习多个滤波器。'),424);return s;
}
function renderModelDiffusion(f){
 const flow=f.layout==='Flow matching',noise=[[.8,-.6,.2],[-.4,.9,-.8],[.7,-.3,.4]],target=[[0,1,0],[1,1,1],[0,1,0]],stage=Math.min(3,f.stage),ab=.4,alpha=.4/.7,beta=1-alpha,xt=target.map((row,r)=>row.map((x,c)=>Math.sqrt(ab)*x+Math.sqrt(1-ab)*noise[r][c]));let current;
 if(flow){const t=stage/3;current=noise.map((row,r)=>row.map((x,c)=>(1-t)*x+t*target[r][c]));}
 else current=stage===0?xt:stage===1?noise:stage===2?target:xt.map((row,r)=>row.map((x,c)=>(x-beta/Math.sqrt(1-ab)*noise[r][c])/Math.sqrt(alpha)));
 let s=modelMat(48,124,flow?noise:xt,flow?MT('Initial noise','初始噪声'):'xₜ',{cw:48,ch:43});
 s+=modelBox(278,129,165,92,flow?'v = x₁ − x₀':'εθ(xₜ,t,c)',flow?'Δt = 1/3':MT('Oracle noise toy','理想噪声示例'),stage>=1);
 s+=modelMat(512,124,current,flow?'x(t='+modelNum(stage/3)+')':['xₜ','ε predicted','x₀ estimate','μ reverse mean'][stage],{cw:48,ch:43,color:PALETTE[1]});
 s+=modelLine(200,185,265,185,stage>=1)+modelLine(450,185,498,185,stage>=2);
 s+=modelBox(160,328,400,53,flow?'xnext = x + Δt · v':'μ = (xₜ − βₜ ε / √(1−ᾱₜ)) / √αₜ','',stage===3);
 s+=modelNote(flow?MT('Constant-velocity toy; actual learned velocity depends on state, time and conditioning.','恒定速度示例；真实学习速度取决于状态、时间及条件。'):MT('One reverse step’s mean, with ᾱₜ=0.4. Stochastic noise is omitted explicitly.','单个反向步的均值，ᾱₜ=0.4；明确省略随机噪声项。'),429);return s;
}
function renderModelCrossKV(f){
 let s=modelBox(37,66,180,73,MT('Causal encoder','因果编码器'),'20 layers',f.stage===0)+modelLine(220,103,290,103,f.stage>=1)+modelBox(300,66,376,73,MT('Final encoder states → shared global KV','最终编码器状态 → 共享全局 KV'),'decoder layers: 20 … 39 (zero-based)',f.stage>=1);
 const roles=[['L20','Full'],['L21','Reuse'],['L24','Reindex'],['L25','Reuse'],['L28','Reindex']];
 roles.forEach(([l,role],i)=>{const x=27+i*141;s+=modelBox(x,260,115,73,l,role,i===Math.min(4,f.stage+1));s+=modelLine(480,143,x+57,249,f.stage>=1,role==='Reuse');});
 s+=modelNote(MT('Full builds KV + index state; Reindex refreshes selection; Reuse shares both.','Full 构建 KV 与索引状态；Reindex 更新选择；Reuse 复用两者。'),390);
 s+=modelNote(MT('V4.1 CSA2 role schematic; local sliding-window state is retained separately.','V4.1 CSA2 角色示意；局部滑动窗口状态另行保留。'),427);return s;
}
function renderModelEngram(f){
 let s=modelBox(40,64,225,67,MT('Recent token n-gram','近期 token n-gram'),'[t−2, t−1, t]',f.stage===0)+modelLine(269,98,377,98,f.stage>=1)+modelBox(390,64,267,67,MT('Hash / lookup → row 1','哈希 / 查表 → 第 1 行'),MT('toy row IDs','示意行编号'),f.stage===1);
 s+=modelMat(64,206,[[0,0],[2,1],[1,3],[4,2]],MT('Conditional-memory table','条件记忆表'),{cw:63,ch:35,hot:r=>f.stage>=1&&r===1});
 s+=modelBox(277,230,172,68,MT('Gate = 0.5','门值 = 0.5'),'[2,1] → [1,0.5]',f.stage>=2)+modelLine(205,257,265,257,f.stage>=2);
 s+=modelMat(521,242,[[f.stage>=3?2:'?',f.stage>=3?2.5:'?']],'hidden + memory',{cw:66,ch:39,color:PALETTE[1]});s+=modelLine(454,261,510,261,f.stage>=3);
 s+=modelNote(MT('V4.1: 196B conditional-memory parameters separate from the 552B backbone.','V4.1：196B 条件记忆参数，与 552B 主干分别计量。'),412);return s;
}
function renderModelSpeculative(f){
 const draft=['A','B','C','D'],target=['A','B','X','—'];let s='';
 s+=textSVG(80,101,MT('Draft','草稿'),'text-anchor="middle" class="diagram-label"')+textSVG(80,223,MT('Verify','校验'),'text-anchor="middle" class="diagram-label"');
 for(let i=0;i<4;i++){const x=163+i*128;s+=modelBox(x,69,92,59,draft[i],f.stage>=2&&i>=2?'×':'',f.stage>=1&&i<2);s+=modelLine(x+46,133,x+46,181,f.stage>=1);s+=modelBox(x,191,92,59,f.stage>=1?target[i]:'?',f.stage>=2&&i<2?'✓':'',f.stage>=2&&i<2);}
 s+=modelBox(162,324,476,61,f.stage>=3?'A  B  X':MT('Accept matching prefix; correct at mismatch','接受匹配前缀；在不匹配处修正'),f.stage>=3?MT('Discard tentative C,D cache entries','丢弃 C、D 的暂存缓存'):'',f.stage>=3);
 s+=modelNote(MT('Greedy verification toy. Exact sampling also needs rejection and correction distributions.','贪心校验示例；精确采样还需拒绝与修正分布。'),431);return s;
}
function renderModelGradient(f){
 if(f.scene==='attention'||f.scene==='flash'){
  const d=attentionExample(),da=d.v.map(r=>r[0]+r[1]),mean=da.reduce((s,x,i)=>s+x*d.a[i],0),ds=d.a.map((a,i)=>a*(da[i]-mean)),dq=[0,1].map(c=>ds.reduce((s,x,i)=>s+x*d.k[i][c]/Math.sqrt(2),0));
  let s=modelMat(47,95,d.a.map(a=>[a,a]),'∂ℒ/∂V',{cw:51,ch:39,color:PALETTE[2]})+modelMat(276,95,ds.map(x=>[x]),'∂ℒ/∂score',{cw:92,ch:39,color:PALETTE[1]})+modelMat(491,137,[dq],'∂ℒ/∂q',{cw:75,ch:42});
  s+=modelBox(152,327,414,58,'ℒ = sum(O); ∂ℒ/∂O = [1,1]','dscoreᵢ = aᵢ (daᵢ − Σⱼ aⱼdaⱼ)',true)+modelNote(MT('A worked backward pass for the final query; masked positions receive zero score gradient.','最终查询的反向计算示例；被屏蔽位置的评分梯度为零。'),428);return s;
 }
 const op=MODEL_OPERATORS[f.op];let s=modelBox(40,155,148,83,MT('Input / state','输入 / 状态'),'x, Sprev',true)+modelBox(269,155,180,83,op?.name||MT('Selected graph','所选计算图'),'θ',true)+modelBox(529,155,148,83,MT('Task loss','任务损失'),'L',true);
 s+=modelLine(192,179,258,179,true)+modelLine(453,179,518,179,true)+modelLine(527,222,459,222,true,true)+modelLine(268,222,198,222,true,true);
 s+=modelBox(240,328,240,62,MT('Learned parameter gradients','学习参数梯度'),'∂ℒ/∂θ → optimizer',true)+modelLine(360,243,360,317,true,true);
 s+=modelNote(MT('Routing indices / hashes are discrete; gradients flow through selected differentiable paths.','路由索引 / 哈希为离散选择；梯度沿所选可微路径传播。'),431);return s;
}
function modelSVG(f){
 const renderers={overview:renderModelOverview,attention:renderModelAttention,flash:renderModelFlash,norm:renderModelNorm,rope:renderModelRoPE,ffn:renderModelFFN,routing:renderModelRouting,mla:renderModelMLA,sparse:renderModelSparse,compressed:renderModelCompressed,hyper:renderModelHyper,ssm:renderModelSSM,delta:renderModelDelta,rwkv:renderModelRWKV,conv:renderModelConv,diffusion:renderModelDiffusion,crosskv:renderModelCrossKV,engram:renderModelEngram,speculative:renderModelSpeculative};
 const draw=f.gradient&&f.scene!=='overview'?renderModelGradient:renderers[f.scene];
 return `<svg class="scene model-scene" data-playing="${!!window.labPlaying}" viewBox="0 0 720 460" role="img" aria-labelledby="model-title model-desc" xmlns="http://www.w3.org/2000/svg"><title id="model-title">${esc(f.title)}</title><desc id="model-desc">${esc(f.text)}</desc><defs><marker id="model-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="#7e91aa"/></marker></defs>${draw(f)}</svg>`;
}

Object.assign(ZH,{
 'Architectures':'架构','Models':'模型','04 / THE BUILDING BLOCKS':'04 / 结构与算子','05 / THE MODEL FAMILIES':'05 / 模型家族','Blueprints':'架构蓝图','Operators':'关键算子','Recurrent models':'递归模型','Image models':'图像模型','Operator walkthrough':'算子详解','Named checkpoint':'具体检查点','Architecture blueprint':'架构蓝图','VIEW':'视图','Model or operator view':'模型或算子视图','Explore the structure and operators':'探索结构与算子','Select a structure or operator. Step through its data flow, then inspect the equations.':'选择结构或算子，逐步查看数据流，再理解方程。','Illustrative dimensions · logical dependencies · not measured runtime':'示意维度 · 逻辑依赖 · 非性能实测','04 / Architectures':'04 / 架构','05 / Models':'05 / 模型','Explore model structures and numerical operator walkthroughs.':'探索模型结构与算子数值推演。','Compare published checkpoints, their operators, and training/inference paths.':'比较公开检查点、算子以及训练 / 推理路径。'
});

MT('left history only','仅使用左侧历史');MT('Expert 0','专家 0');MT('Expert 1','专家 1');MT('Expert 2','专家 2');MT('Expert 3','专家 3');

function renderDiffusionOverview(f){
 const flow=f.flow||f.model.flow,w=116,h=57;let s=textSVG(360,27,f.model.name,'text-anchor="middle" class="diagram-label" style="font-size:12px"');
 const positions=f.trainingDiffusion?[[28,67],[197,67],[28,190],[197,190],[28,313],[386,190],[386,67],[564,190]]:[[28,68],[28,172],[28,276],[279,172],[535,172],[535,276],[279,276],[279,367]];
 const edges=f.trainingDiffusion?[[0,1],[1,3],[2,3],[3,5],[4,5],[1,6],[2,6],[5,7],[6,7]]:[[0,3],[1,3],[2,3],[3,4],[4,5],[5,3],[5,6],[6,7]];
 for(const [a,b]of edges){const [ax,ay]=positions[a],[bx,by]=positions[b],same=ay===by,x1=same?(bx>ax?ax+w:ax):ax+w/2,y1=same?ay+h/2:by>ay?ay+h:ay,x2=same?(bx>ax?bx:bx+w):bx+w/2,y2=same?by+h/2:by>ay?by:by+h;
  const on=!f.gradient&&f.stage>=b&&f.stage>=a;s+=modelLine(x1,y1,x2,y2,on,a===5&&b===3);
 }
 if(f.gradient&&f.trainingDiffusion)s+=modelLine(564,218,512,218,true,true);
 flow.forEach((node,i)=>{const [x,y]=positions[i];s+=`<g opacity="${i<=f.stage||f.gradient?1:.45}">`+modelBox(x,y,w,h,node.label,node.shape,f.gradient?(i===5||i===7):i===f.stage)+'</g>';});
 s+=modelNote(f.trainingDiffusion?MT('Training: one sampled corruption → prediction → loss. Backpropagation trains selected components.','训练：一次采样扰动 → 预测 → 损失；反向传播训练选定组件。'):MT('Generation: conditioning + noisy state + time → denoiser; repeat the scheduler, then decode.','生成：条件 + 含噪状态 + 时间 → 去噪器；反复调度更新，最后解码。'),447);return s;
}
MT('gated O','门控 O');
