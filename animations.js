const PALETTE = ['#cce4d9','#d6e1f3','#f0ddc4','#e4d8ee'];
const DARK = ['#48775f','#5c79aa','#a98051','#9476aa'];
const clone = x => JSON.parse(JSON.stringify(x));
const blank = () => Array.from({length:4},()=>[null,null,null,null]);
const tensorInputs = () => Array.from({length:4},(_,r)=>[r+1,2*(r+1),3*(r+1),4*(r+1)]);
const e = (from,to,label) => ({from,to,label});
function communicationFrames(id,algorithm) {
 let values=blank(), frames=[];
 const add=(title,text,edges=[],center='')=>frames.push({kind:'ranks',title,text,values:clone(values),edges,center});
 if(id==='all-reduce'||id==='reduce-scatter') {
  values=tensorInputs();add('Start with local contributions','Four ranks, four shards each. Colors identify tensor positions; SUM combines matching positions.',[],'LOCAL INPUTS');
  if(algorithm==='Tree') {
   values[0]=values[0].map((v,i)=>v+values[1][i]);values[2]=values[2].map((v,i)=>v+values[3][i]);values[1]=[null,null,null,null];values[3]=[null,null,null,null];add('Reduce · pair neighbors','Ranks 1 and 3 send their tensors to ranks 0 and 2, which add corresponding values.',[e(1,0),e(3,2)],'REDUCE');
   values[0]=[10,20,30,40];values[2]=[null,null,null,null];add('Reduce · meet at the root','Rank 2 sends its partial sum to rank 0. The root now owns the complete reduction.',[e(2,0)],'SUM AT ROOT');
   values[2]=[10,20,30,40];add('Broadcast · first branch','The root forwards the reduced tensor to rank 2.',[e(0,2)],'BROADCAST');
   values[1]=[10,20,30,40];values[3]=[10,20,30,40];add('Broadcast · fan out','Ranks 0 and 2 forward to ranks 1 and 3. Every rank holds [10, 20, 30, 40].',[e(0,1),e(2,3)],'IDENTICAL OUTPUTS');return frames;
  }
  for(let s=0;s<3;s++){
   const old=clone(values),edges=[];
   for(let r=0;r<4;r++){let c=(r-s-1+8)%4,d=(r+1)%4;values[r][c]=null;values[d][c]=(old[d][c]||0)+old[r][c];edges.push(e(r,d,'shard '+c));}
   add('Reduce-scatter · round '+(s+1),'Each rank forwards one partial shard clockwise. The receiver adds its local contribution; forwarded ownership is released.',edges,'REDUCE · SUM');
  }
  if(id==='reduce-scatter') return frames;
  for(let s=0;s<3;s++){
   const old=clone(values),edges=[];
   for(let r=0;r<4;r++){let c=(r-s+4)%4,d=(r+1)%4;values[d][c]=old[r][c];edges.push(e(r,d,'shard '+c));}
   add('All-gather · round '+(s+1),s===2?'Every rank now owns all four reduced shards: [10, 20, 30, 40].':'Forward the finished shard from the previous round. No more addition is needed.',edges,s===2?'IDENTICAL OUTPUTS':'GATHER · COPY');
  }return frames;
 }
 if(id==='all-gather'){
  values=blank();for(let r=0;r<4;r++)values[r][r]=String.fromCharCode(65+r);add('Start with one shard per rank','Rank 0 owns A, rank 1 owns B, rank 2 owns C, and rank 3 owns D.',[],'SHARDED INPUT');
  if(algorithm==='Recursive doubling'){
   for(let k=0;k<2;k++){const old=clone(values),edges=[];for(let r=0;r<4;r++){let p=r^(1<<k);for(let c=0;c<4;c++)if(old[p][c]!=null)values[r][c]=old[p][c];edges.push(e(r,p));}add('Doubling · distance '+(1<<k),'Exchange all known shards with the XOR partner. Each round doubles the number of known shards.',edges,k===1?'FULL TENSOR':'EXCHANGE SHARDS');}
  }else for(let s=0;s<3;s++){const old=clone(values),edges=[];for(let r=0;r<4;r++){let c=(r-s+4)%4,d=(r+1)%4;values[d][c]=old[r][c];edges.push(e(r,d,'shard '+c));}add('Ring exchange · round '+(s+1),s===2?'All ranks now own [A, B, C, D], ordered by source rank.':'Each rank forwards the shard it most recently acquired to its next neighbor.',edges,s===2?'FULL TENSOR':'COPY, NOT SUM');}return frames;
 }
 if(id==='broadcast'){
  values[0]=['A','B','C','D'];add('Choose rank 0 as root','Only the root starts with the source tensor. All receivers have matching output buffers.',[],'ROOT = RANK 0');
  if(algorithm==='Pipelined tree'){
   for(let tick=0;tick<5;tick++){
    const edges=[];
    if(tick<4){values[1][tick]=values[2][tick]=String.fromCharCode(65+tick);edges.push(e(0,1),e(0,2));}
    if(tick>0){values[3][tick-1]=String.fromCharCode(64+tick);edges.push(e(1,3));}
    add('Pipeline · tick '+(tick+1),tick===0?'The root sends chunk A to ranks 1 and 2. Rank 3 cannot receive A until a later tick.':tick===4?'Drain: rank 1 forwards the last chunk D to rank 3. All ranks now have the root tensor.':'The root sends a new chunk while rank 1 forwards the previous chunk. Different chunks occupy different tree levels.',edges,'FILL → PIPELINE → DRAIN');
   }
  }else{values[1]=clone(values[0]);add('Tree · first branch','Rank 0 copies the full tensor to rank 1.',[e(0,1)],'2 RANKS INFORMED');values[2]=clone(values[0]);values[3]=clone(values[0]);add('Tree · double the informed group','Ranks 0 and 1 forward to ranks 2 and 3. All four ranks now hold the root tensor.',[e(0,2),e(1,3)],'IDENTICAL COPIES');}return frames;
 }
 if(id==='reduce'){
  values=tensorInputs();add('Local input tensors','Four contributions will be summed elementwise. Only root rank 0 will own the final answer.',[],'ROOT = RANK 0');
  if(algorithm==='Linear'){for(let r=1;r<4;r++){values[0]=values[0].map((v,c)=>v+values[r][c]);values[r]=[null,null,null,null];add('Root receives rank '+r,'The root adds one full input tensor at a time. This simple schedule serializes the root’s receives.',[e(r,0)],r===3?'RESULT AT ROOT':'SUM AT ROOT');}}
  else{values[0]=values[0].map((v,c)=>v+values[1][c]);values[2]=values[2].map((v,c)=>v+values[3][c]);values[1]=values[3]=[null,null,null,null];add('Tree · pairwise reduction','Rank 1 reduces into rank 0; rank 3 reduces into rank 2.',[e(1,0),e(3,2)],'PARTIAL SUMS');values[0]=[10,20,30,40];values[2]=[null,null,null,null];add('Tree · combine at root','Rank 2’s partial sum completes rank 0’s result. Non-root output cells are not defined by Reduce.',[e(2,0)],'RESULT AT ROOT');}return frames;
 }
 if(id==='scatter'){
  values[0]=['A','B','C','D'];add('Root owns the full input','Rank 0 has four destination shards. Each output will contain only its designated shard.',[],'ROOT = RANK 0');
  if(algorithm==='Tree'){values[2]=[null,null,'C','D'];values[0][2]=values[0][3]=null;add('Tree · split into bundles','Root forwards the bundle [C, D] to rank 2 and retains [A, B].',[e(0,2)],'FORWARD BUNDLES');values[1][1]='B';values[0][1]=null;values[3][3]='D';values[2][3]=null;add('Tree · split the bundles','Rank 0 forwards B to rank 1. Rank 2 forwards D to rank 3.',[e(0,1),e(2,3)],'DISTINCT SHARDS');}
  else for(let r=1;r<4;r++){values[r][r]=values[0][r];values[0][r]=null;add('Send destination shard '+r,'Root sends only the slice intended for rank '+r+'. Other shards are not copied there.',[e(0,r)],r===3?'DISTINCT SHARDS':'DISTRIBUTE');}return frames;
 }
 if(id==='gather'){
  for(let r=0;r<4;r++)values[r][r]=String.fromCharCode(65+r);add('Start with one local shard','Root rank 0 will concatenate all four shards in rank order. Inputs can remain on their senders.',[],'ROOT = RANK 0');
  if(algorithm==='Tree'){values[0][1]='B';values[2][3]='D';add('Tree · collect bundles','Rank 1 sends to rank 0; rank 3 sends to rank 2.',[e(1,0),e(3,2)],'PACK SUBTREES');values[0]=['A','B','C','D'];add('Tree · collect at the root','Rank 2 forwards [C, D]. Root now holds the complete output in source-rank order.',[e(2,0)],'FULL ROOT OUTPUT');}
  else for(let r=1;r<4;r++){values[0][r]=String.fromCharCode(65+r);add('Receive source shard '+r,'Rank '+r+' sends its shard to root. The received value is copied, not added.',[e(r,0)],r===3?'FULL ROOT OUTPUT':'CONCATENATE');}return frames;
 }
 if(id==='all-to-all'||id==='all-to-all-v'){
  values=Array.from({length:4},(_,s)=>Array.from({length:4},(_,d)=>({text:`${s}→${d}`,color:s})));
  const counts=[[1,3,0,2],[2,1,1,0],[0,2,1,4],[1,0,2,1]];
  if(id==='all-to-all-v')values=counts.map((row,s)=>row.map(count=>count?{text:count+'×',color:s}:null));
  add('Pack by destination',id==='all-to-all-v'?'Each row contains outgoing buckets in destination order. Numbers show item counts; colors identify source ranks. Empty buckets carry no payload.':'Each row contains outgoing chunks. A cell s→d means “source s, destination d.” The local s→s cell stays put.',[],'DESTINATION BUCKETS');
  if(id==='all-to-all-v'){add('Exchange counts','Rank 0’s send counts: [1, 3, 0, 2]. Each peer learns exactly how much it will receive before allocating and transferring.',Array.from({length:4},(_,s)=>Array.from({length:4},(_,d)=>s!==d?e(s,d):null)).flat().filter(Boolean),'COUNTS FIRST');values=Array.from({length:4},(_,d)=>Array.from({length:4},(_,s)=>counts[s][d]?({text:counts[s][d]+'×',color:s}):null));add('Exchange variable payloads','Bucket widths in this diagram are symbolic. Real transfers have different byte counts; empty buckets send no payload.',Array.from({length:4},(_,s)=>Array.from({length:4},(_,d)=>s!==d&&counts[s][d]?e(s,d):null)).flat().filter(Boolean),'VARIABLE PAYLOADS');add('Restore local token order','Each destination has its own incoming items. For MoE, expert outputs later take a return exchange.',[],'UNPACK + RESTORE');return frames;}
  let out=blank();for(let r=0;r<4;r++)out[r][r]={text:`${r}→${r}`,color:r};
  if(algorithm==='Direct'){values=Array.from({length:4},(_,d)=>Array.from({length:4},(_,s)=>({text:`${s}→${d}`,color:s})));add('Post all peer exchanges','Every source sends its destination bucket to each peer. All directed off-rank transfers are shown.',Array.from({length:4},(_,s)=>Array.from({length:4},(_,d)=>s!==d?e(s,d):null)).flat().filter(Boolean),'ALL PEERS ACTIVE');}
  else for(let k=1;k<4;k++){const edges=[];for(let s=0;s<4;s++){let d=(s+k)%4;out[d][s]={text:`${s}→${d}`,color:s};edges.push(e(s,d));}values=clone(out);add('Pairwise exchange · round '+k,'Rank s sends to (s + '+k+') mod 4 and receives from (s − '+k+') mod 4. Output cells are ordered by source.',edges,k===3?'TRANSPOSE COMPLETE':'EXCHANGE BUCKETS');}return frames;
 }
 if(id==='send-recv'){
  values[0]=['A','B','C','D'];add('Prepare matching endpoints','Rank 0 is the sender; rank 2 is the receiver. Ranks 1 and 3 do not participate in this transfer.',[],'0 → 2');add('Post send and receive','A matching receive is posted for the destination buffer. Stream or request dependencies protect both buffers.',[e(0,2)],'TRANSFER');values[2]=['A','B','C','D'];add('Receive completes','Rank 2 can now consume [A, B, C, D]. The sender’s original input is unchanged.',[],'BUFFER READY');return frames;
 }
 if(id==='barrier'){
  values=[[{text:'here',color:0}],[{text:'work',color:2}],[{text:'here',color:0}],[{text:'work',color:2}]];add('Some ranks arrive earlier','Ranks 0 and 2 wait while ranks 1 and 3 finish earlier work. No participant can yet complete the barrier.',[],'WAIT FOR ALL');values=Array.from({length:4},()=>[{text:'here',color:0}]);add('All ranks have entered','Every rank is now participating, but arrival knowledge must still spread.',[],'ALL ENTERED');
  for(let k=0;k<2;k++){let edges=[];for(let r=0;r<4;r++)edges.push(e(r,(r+(1<<k))%4));values=Array.from({length:4},()=>[{text:k===1?'ready':'2 / 4',color:0}]);add('Dissemination · distance '+(1<<k),k===1?'After the second round, each rank has evidence that all four ranks have entered.':'Each rank exchanges an arrival signal with its next neighbor.',edges,k===1?'BARRIER COMPLETE':'SHARE ARRIVAL');}return frames;
 }
 if(id==='scan'){
  values=[[1],[2],[3],[4]];add('Start with the local values','Inclusive SUM scan on [1, 2, 3, 4]. The result at rank r includes all inputs up through r.',[],'INCLUSIVE SUM');
  for(let k=0;k<2;k++){let old=clone(values),edges=[];for(let r=0;r<4;r++)if(r-(1<<k)>=0){values[r]=[old[r][0]+old[r-(1<<k)][0]];edges.push(e(r-(1<<k),r));}add('Prefix exchange · distance '+(1<<k),k===1?'The final prefixes are [1, 3, 6, 10]. Each rank’s result covers a different ordered prefix.':'Higher ranks add the prefix received from the preceding rank.',edges,k===1?'ORDERED PREFIXES':'GROW THE PREFIX');}return frames;
 }
 return frames;
}
function conceptFrames(topic,mode,variant){
 const t=topic,inf=mode==='Inference';let f=[];
 const add=(title,text,stage,extra={})=>f.push({kind:t.diagram,title,text,stage,mode,variant,...extra});
 switch(t.diagram){
 case'dp':add('Replicate the model',inf?'Each serving replica has matching weights, but its requests and KV cache are independent.':'Each rank starts with the same full model and optimizer state.',0);add(inf?'Route different requests':'Partition the batch',inf?'A frontend sends requests A, B, C, and D to four independent replicas.':'Four replicas process four different local batches. Each computes its own gradients.',1);add(inf?'Generate independently':'Synchronize gradients',inf?'Each replica decodes locally. There is no gradient AllReduce at inference time.':'An AllReduce combines gradient contributions. Each replica sees the same averaged gradient.',2);add(inf?'Return to the caller':'Take the same update',inf?'Results stream to their callers; faster requests can finish independently.':'Each optimizer applies the same update, keeping all four replicas aligned.',3);break;
 case'tp':{
  if(variant==='Column-parallel'){
   add('Replicate X; split W by output columns','Both ranks see X = [1,2]. Rank 0 owns column [1;2], rank 1 owns column [3;4] of the same W.',0);
   add('Compute distinct output features','Rank 0 computes 1×1 + 2×2 = 5. Rank 1 computes 1×3 + 2×4 = 11.',1);
   add('Keep the feature shards','The correct global result is Y = [5,11]. Each rank already owns its assigned output feature; no forward collective is needed for a sharded consumer.',2);
   add('Optional: AllGather to replicate Y','Only if the next operation requires the full output, concatenate the two feature shards on both ranks. Do not sum different features.',3);
   if(!inf)add('Backward: sum input-gradient contributions','For dY = [1,1], the two columns contribute dX partials [1,2] and [3,4]. AllReduce gives replicated dX = [4,6].',4);
  }else if(variant==='Column → row MLP'){
   add('A compatible pair of projections','Use the same column-sharded W₁ and a row-sharded W₂ = [1;1]. Hidden features stay on their owners.',0);
   add('Column-parallel expansion','Compute hidden feature shards [5] and [11] from replicated X = [1,2].',1);
   add('Local elementwise activation','Apply ReLU locally: both positive values remain [5] and [11]. No intermediate AllGather is needed.',2);
   add('Row-parallel contraction','Rank 0 computes 5×1 = 5; rank 1 computes 11×1 = 11. They are partial sums for the same scalar output.',3);
   add('Sum only the final partial outputs','AllReduce produces Y = 5 + 11 = 16 on both ranks. The expanded intermediate was never replicated.',4);
   if(!inf)add('Backward follows the complementary layouts','Propagate dY through W₂ locally, then sum input-gradient contributions at the W₁ boundary. Sequence-parallel boundaries use different collectives.',5);
  }else{
   add('Split input features and weight rows','X = [1,2], W = [[1,3],[2,4]]. Rank 0 holds X₀ = [1], W₀ = [1,3]; rank 1 holds X₁ = [2], W₁ = [2,4].',0);
   add('Compute partial outputs','Rank 0 produces [1,3], rank 1 [4,8]. Both cover the same output feature positions.',1);
   add('AllReduce the partial sums','Elementwise SUM gives [1+4, 3+8] = [5,11] on each rank. Concatenating partials would be incorrect.',2);
   add('Forward output is replicated','Both ranks can use the full Y. A compatible sequence-parallel consumer may instead want a ReduceScatter output.',3);
   if(!inf)add('Backward: keep local input-feature gradients','For replicated dY = [1,1], rank 0 computes dX₀ = 4 and rank 1 dX₁ = 6. These are different input features, not partial sums requiring an AllReduce here.',4);
  }break;
 }
 case'pp':return pipelineFrames(variant,mode);
 case'sp':add('Tokenwise sequence shards','Each rank holds a different range of token activations for local normalization and residual work.',0);add('AllGather the token shards','Reconstruct the sequence activation layout needed by the tensor-parallel region.',1);add('Tensor-parallel computation','Each rank performs its tensor shard of attention or MLP work. Row-parallel outputs are partial sums.',2);add('ReduceScatter back to token shards','Sum row-parallel outputs and partition them along the sequence dimension.',3);break;
 case'cp':add('Local queries and local K/V','Each rank owns a query block and an initial key/value block. Global token positions determine the attention mask.',0);for(let i=1;i<=4;i++)add('Attend to K/V block · visit '+i,'Queries stay local. Circulating K/V blocks contribute to a running, numerically stable global softmax.',i);add('Finish local query outputs','Each rank has attended to all valid global keys for its local queries. Merge softmax statistics, not a simple output average.',5);break;
 case'ep':add('Tokens begin on source ranks','A router chooses experts. Token colors identify source ranks; expert placement is independent.',0);add('Dispatch to selected experts','Group token copies by expert destination and exchange them with AllToAll(v).',1);add('Compute expert outputs','Each expert processes its incoming tokens. The uneven counts illustrate load imbalance.',2);add('Return and combine','Expert outputs return to source ranks, restore token order, and combine with router weights.',3);break;
 case'hybrid':add('Two model replicas','Eight ranks form two data replicas. Each replica has two pipeline stages and two TP shards per stage.',0);add('Tensor-parallel groups','Within each stage, two TP ranks cooperate on the same layer. These groups favor fast links.',1);add('Pipeline-parallel paths','Each shard position passes activations forward across its corresponding pipeline stages.',2);add(inf?'Independent request routing':'Data-parallel groups',inf?'Each complete TP×PP instance serves its own requests. Data replicas need no gradient synchronization.':'Equivalent shards in the two replicas synchronize gradients. Four separate DP groups connect matching positions.',3);break;
 case'replicas':add('Queue independent requests','A frontend sees requests of different lengths and considers load and cache locality.',0);add('Route to model instances','Assign work to three independent serving instances. An instance may itself be a TP/PP group.',1);add('Decode locally','Each instance owns its own active batch and KV cache. No cross-replica per-token collective is needed.',2);add('Stream independent responses','Completed requests return immediately; they do not wait for other replicas.',3);break;
 case'pd':add('A new prompt arrives','The request enters the prefill queue. Compute-heavy prompt processing happens in the prefill pool.',0);add('Build the prompt KV cache','Prefill computes per-layer keys and values for all prompt tokens.',1);add('Hand off the KV cache','Transfer the cache and request state to a decode worker, resharding if layouts differ.',2);add('Generate in the decode pool','The decode worker reuses the transferred cache and appends new token state each iteration.',3);add('Keep the pools busy','Other prompts can prefill while ongoing requests decode. Handoff cost must fit the latency budget.',4);break;
 case'fsdp':
  add('Persist only local state shards','Parameters, gradients, and optimizer state are partitioned across four data-parallel ranks.',0);
  add('AllGather weights for forward','Temporarily materialize this module’s parameters on every rank.',1);
  add('Run local forward','Each rank processes a different local batch with the gathered weights.',2);
  add('Reshard after forward','Release full module weights under the illustrated reshard-after-forward policy. Keep required local activation boundaries.',3);
  add('AllGather weights again for backward','Re-materialize module parameters so backward can compute local gradients.',4);
  add('Compute local gradients','Each rank computes this module’s gradient contributions from its own batch.',5);
  add('ReduceScatter gradients and update owners','Combine gradients into owner shards, release full weights, and update only owned parameters.',6);break;
 case'zero':add(variant+' · persistent state','P = parameters, G = gradients, O = optimizer state. Colored segments show the four ownership shards.',0);add('Compute local-batch gradients','Each data-parallel rank processes different examples. Stage 3 materializes module weights as needed.',1);add(variant==='Stage 1'?'Reduce and update owned partitions':'ReduceScatter gradients','Gradient contributions are combined and routed to the ranks that own the corresponding optimizer partitions.',2);add(variant==='Stage 3'?'Keep updated parameters sharded':'Share updated parameters',variant==='Stage 3'?'Full module parameters will be gathered again when needed. Persistent state remains sharded.':'Updated weight partitions are shared so the next forward starts from matching full parameters.',3);break;
 case'accumulation':add('Clear gradient buffers once','A new accumulation window begins. There is no optimizer step yet.',0);for(let i=1;i<=3;i++)add('Accumulate microbatch '+i,'Run a local forward/backward and add its scaled gradient. DDP can suppress intermediate synchronization.',i);add('Synchronize the accumulated gradient','Run the required gradient collective only after the local window is complete.',4);add('One optimizer step','Apply one update for the whole effective batch, then start the next accumulation window.',5);break;
 case'checkpoint':add('Forward · save boundaries','Run four layer segments. Keep only selected checkpoint boundaries instead of all intermediates.',0);add('Release intermediate activations','Only boundary activations persist. This saves activation memory, not parameter or optimizer memory.',1);add('Replay from the preceding boundary','For the illustrated middle segment, replay segments 1 then 2 from saved boundary 0. Reconstruct dependencies before using them in backward.',2);add('Backpropagate and release','Use the reconstructed activations for gradients, then free temporary replay buffers.',3);break;
 case'overlap':add('The serial schedule','Running all compute before all communication leaves the network idle early and the GPU waiting later.',0);add('First bucket becomes ready','Launch communication as soon as a bucket is ready, while independent work continues.',1);add('Pipeline compute and communication','Separate streams and explicit dependencies can overlap adjacent chunks. Hardware contention can limit this.',2);add('Only the tail remains exposed','Wait for the last communication dependency before consuming its output. Overlap does not remove this tail.',3);break;
 case'batching':add('Iteration 1 · A and B active','Two requests occupy the decoding batch; request C is waiting.',0);add('Iteration 2 · A completes','Both active requests generate a token. A reaches its stopping condition.',1);add('Iteration 3 · admit C','Remove A and use the freed slot for C at the next iteration boundary. B keeps decoding.',2);add('Iteration 4 · B and C continue','The batch changes without waiting for the longest original request. Prefill admission still needs a token budget.',3);break;
 case'kv':add('A prompt’s logical token blocks','The sequence has logical blocks 0 and 1, mapped through a block table to physical cache slots.',0);add('Prefill stores K and V','Physical blocks need not be adjacent. Each holds cached key/value tensors for token ranges at every layer.',1);add('Decode appends a token','The new token reads valid history and appends its own K/V. Allocate a new block when the current one fills.',2);add('Reclaim or reuse blocks','When a request completes, release its blocks or retain eligible prefixes. Shared prefixes need safe reference counting.',3);break;
 case'compression':add('Dense local gradients','Each rank has a dense gradient tensor. Sending the full representation may be bandwidth expensive.',0);add('Encode a smaller representation','Quantization, sparsity, or low-rank factors reduce payload. The diagram uses symbolic compact blocks.',1);add('Communicate compatible encodings','Aggregate with an encoding-aware protocol. Sparse indices or quantization scales may require metadata.',2);add('Reconstruct an approximate result','Recover gradients for the optimizer and retain compression residuals when using error feedback.',3);break;
 case'quantization':add('The original weight payload','Start with eight illustrative FP16 weights. Scales and metadata will accompany quantized formats.',0);add('Choose a quantized representation','INT8 nominal weight payload is half of FP16; INT4 is one quarter, before scale and format overhead.',1);add('Run a compatible kernel','A suitable matrix kernel consumes packed values and scales. Some formats dequantize weights during compute.',2);add('Check quality and performance','Compare accuracy, latency, and total memory. Lower bit width alone does not guarantee faster serving.',3);break;
 }
 return f;
}
function buildFrames(topic,algorithm,mode){
 if(topic.id==='reduce-scatter'&&algorithm==='Recursive halving'){
  let v=tensorInputs(),f=[];const add=(title,text,edges)=>f.push({kind:'ranks',values:clone(v),title,text,edges,center:'HALVE + REDUCE'});
  add('Begin with four matching shards','Every rank contributes to the same four tensor positions.',[]);
  let old=clone(v);for(let r=0;r<4;r++)for(let c=0;c<4;c++)v[r][c]=(r<2)===(c<2)?old[r][c]+old[r^2][c]:null;
  add('Distance 2 · retain half','Partners r XOR 2 exchange complementary halves and reduce the retained half.',[e(0,2),e(2,0),e(1,3),e(3,1)]);
  old=clone(v);for(let r=0;r<4;r++)for(let c=0;c<4;c++)v[r][c]=c===r?old[r][c]+old[r^1][c]:null;
  add('Distance 1 · retain one shard','Adjacent partners reduce complementary quarters. Rank r now owns reduced shard r.',[e(0,1),e(1,0),e(2,3),e(3,2)]);return f;
 }
 return topic.section==='communication'?communicationFrames(topic.id,algorithm):conceptFrames(topic,mode,algorithm);
}
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function textSVG(x,y,str,attrs=''){return `<text x="${x}" y="${y}" ${attrs}>${esc(str)}</text>`;}
function rectSVG(x,y,w,h,fill,attrs=''){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" ${attrs}/>`;}
function pathSVG(path,active=true,delay=0){return `<path d="${path}" class="${active?'flow-line':'idle-line'}" ${active?'marker-end="url(#arrowhead)"':''}/>${active&&window.labPlaying?`<circle r="4" class="packet"><animateMotion dur="${1.15/(window.labSpeed||1)}s" begin="${delay}s" repeatCount="1" fill="freeze" path="${path}"/></circle>`:''}`;}
function rankEdge(from,to,active=true){
 const compact=matchMedia('(max-width:700px)').matches;
 const positions=compact?[[107.5,80],[312.5,80],[312.5,315],[107.5,315]]:[[152.5,90],[567.5,90],[567.5,275],[152.5,275]];let [x1,y1]=positions[from],[x2,y2]=positions[to];let dx=x2-x1,dy=y2-y1;const scale=Math.min(dx?(compact?96:103)/Math.abs(dx):Infinity,dy?55/Math.abs(dy):Infinity);const sx=x1+dx*scale,sy=y1+dy*scale,ex=x2-dx*scale,ey=y2-dy*scale;
 let path=`M ${sx} ${sy} L ${ex} ${ey}`;
 if(dx&&dy){const flip=from<to?1:-1;path=`M ${sx} ${sy} Q ${(sx+ex)/2+45*flip} ${(sy+ey)/2-55*flip} ${ex} ${ey}`;}
 if(from>to&&(dx===0||dy===0)){let bend=dx===0?15:0,by=dy===0?-15:0;path=`M ${sx} ${sy} Q ${(sx+ex)/2+bend} ${(sy+ey)/2+by} ${ex} ${ey}`;}
 return pathSVG(path,active);
}
function cellRow(x,y,cells,width=155){
 const n=Math.max(cells.length,1),gap=5,cw=(width-gap*(n-1))/n;
 return cells.map((raw,c)=>{let item=raw&&typeof raw==='object'?raw:{text:raw,color:c},empty=item.text==null,fill=empty?'#f5f7f1':PALETTE[item.color%4];return rectSVG(x+c*(cw+gap),y,cw,29,fill,empty?'stroke="#e6ebdf" stroke-dasharray="3 3"':'')+textSVG(x+c*(cw+gap)+cw/2,y+19,empty?'·':item.text,`text-anchor="middle" class="cell-text" ${String(item.text).length>4?'style="font-size:10px"':''}`);}).join('');
}
function renderRanks(frame){
 const compact=matchMedia('(max-width:700px)').matches;
 const pos=compact?[[15,35],[220,35],[220,270],[15,270]]:[[60,45],[475,45],[475,230],[60,230]];let s='';
 if(!frame.edges.length){s+=[rankEdge(0,1,false),rankEdge(1,2,false),rankEdge(2,3,false),rankEdge(3,0,false)].join('');}
 else s+=frame.edges.map(edge=>rankEdge(edge.from,edge.to)).join('');
 s+=`<g transform="${compact?'translate(-150 15)':''}"><circle cx="360" cy="182" r="34" fill="#f0f4e7" stroke="#e0e7d4"/>`+textSVG(360,192,frame.center.includes('SUM')?'Σ':frame.center.includes('COPY')?'⊞':frame.center.includes('BARRIER')?'✓':'⇄','text-anchor="middle" style="font-size:28px;fill:#63834c"')+textSVG(360,235,frame.center,'text-anchor="middle" class="diagram-label" style="font-size:8px"')+'</g>';
 for(let r=0;r<4;r++){let[x,y]=pos[r];s+=rectSVG(x,y,185,90,'white','class="node-shell"')+rectSVG(x+14,y+14,14,12,'#eef2e6','stroke="#b7c6a6" rx="2"')+`<path d="M ${x+18} ${y+12} v3 M ${x+24} ${y+12} v3 M ${x+18} ${y+25} v3 M ${x+24} ${y+25} v3" stroke="#b7c6a6"/>`+textSVG(x+37,y+25,'RANK '+r,'class="node-label"')+textSVG(x+169,y+25,'GPU','text-anchor="end" style="font-size:8px;fill:#a2ad96"')+cellRow(x+15,y+43,frame.values[r]);}
 return s;
}
function box(x,y,w,h,label,sub,active=false,color=0){return rectSVG(x,y,w,h,active?'#f2f7e8':'white',`class="node-shell ${active?'highlight-shell':''}"`)+rectSVG(x+12,y+12,21,20,PALETTE[color])+textSVG(x+22.5,y+26,String(color),'text-anchor="middle" class="mono" style="font-size:10px"')+textSVG(x+42,y+26,label,'style="font-size:11px;font-weight:600"')+(sub?textSVG(x+w/2,y+h-17,sub,'text-anchor="middle" class="mono" style="font-size:10px;fill:#89967b"'):'');}
function label(x,y,str){return textSVG(x,y,str,'class="diagram-label" text-anchor="middle"');}
function arrow(x1,y1,x2,y2,active){return pathSVG(`M ${x1} ${y1} L ${x2} ${y2}`,active);}
function renderConcept(f){
 const st=f.stage,inf=f.mode==='Inference';let s='';
 switch(f.kind){
 case'dp':{
  s+=label(360,35,inf?'INDEPENDENT REQUESTS':'PARTITIONED GLOBAL BATCH');
  for(let r=0;r<4;r++){let x=37+r*174;s+=rectSVG(x,56,124,28,PALETTE[r])+textSVG(x+62,75,(inf?'request ':'batch ')+String.fromCharCode(65+r),'text-anchor="middle" class="mono" style="font-size:11px"')+arrow(x+62,94,x+62,127,st===1)+box(x-8,137,140,95,'MODEL COPY',st===0?'matching weights':st===1?'local compute':st===2?(inf?'decode locally':'gradient g'+r):(inf?'output ready':'updated weights'),st===1,r);
   if(st>=2&&!inf){s+=arrow(x+62,240,x+62,275,st===2);}
   if(inf&&st>=2)s+=textSVG(x+62,286,st===2?'tok → tok → tok':'response '+String.fromCharCode(65+r),'text-anchor="middle" class="mono" style="font-size:11px;fill:#6c8c55"');
  }
  if(!inf){s+=rectSVG(68,280,585,39,st>=2?'#e6efd7':'#f1f4eb','stroke="#dce6cf"')+textSVG(360,305,st===3?'SAME UPDATE ON EVERY REPLICA':'GRADIENT ALLREDUCE → MEAN','text-anchor="middle" class="mono" style="font-size:11px;fill:#6b8552"');}else s+=label(360,332,'NO GRADIENT COLLECTIVE BETWEEN REPLICAS');break;
 }
 case'tp':{
  const col=f.variant==='Column-parallel',pair=f.variant==='Column → row MLP',back=st===(pair?5:4);
  s+=label(360,27,pair?'COLUMN → LOCAL ACTIVATION → ROW':col?'COLUMN PARALLEL · OUTPUT FEATURES':'ROW PARALLEL · INPUT FEATURES');
  if(pair){
   for(let r=0;r<2;r++){
    let x=75+r*350;
    s+=box(x,53,220,63,'COLUMN W₁,'+r,st===0?'X = [1,2]':r===0?'H₀ = 5':'H₁ = 11',st===1,r);
    s+=arrow(x+110,123,x+110,145,st===2)+rectSVG(x+35,151,150,31,PALETTE[r])+textSVG(x+110,171,'ReLU('+(r===0?'5':'11')+')','text-anchor="middle" class="mono" style="font-size:11px"');
    s+=arrow(x+110,190,x+110,210,st===3)+box(x,217,220,63,'ROW W₂,'+r,r===0?'5 × 1 = 5':'11 × 1 = 11',st===3,r);
    if(st>=4)s+=arrow(x+110,287,x+110,306,st===4);
   }
   s+=rectSVG(100,313,520,34,'#e6efd7')+textSVG(360,335,back?'BACKWARD: LOCAL H GRADS → REDUCE dX':st>=4?'ALLREDUCE: 5 + 11 = 16':'KEEP HIDDEN FEATURES SHARDED','text-anchor="middle" class="mono" style="font-size:11px;fill:#607e47"');
  }else{
   for(let r=0;r<2;r++){
    let x=65+r*360;
    s+=rectSVG(x,57,230,33,PALETTE[r])+textSVG(x+115,79,back?(col?'local dY feature = 1':'replicated dY = [1,1]'):(col?'replicated X = [1,2]':r===0?'X₀ = [1]':'X₁ = [2]'),'text-anchor="middle" class="mono" style="font-size:12px"');
    s+=arrow(x+115,99,x+115,122,st===1||back)+box(x,132,230,87,'RANK '+r,col?(r===0?'W₀ = [1;2]':'W₁ = [3;4]'):(r===0?'W₀ = [1,3]':'W₁ = [2,4]'),st===1,r);
    let out=back?(col?(r===0?'partial dX = [1,2]':'partial dX = [3,4]'):(r===0?'dX₀ = [4]':'dX₁ = [6]')):col?(r===0?'Y₀ = [5]':'Y₁ = [11]'):(r===0?'Z₀ = [1,3]':'Z₁ = [4,8]');
    s+=rectSVG(x,237,230,35,st>0?PALETTE[r]:'#eff3e8')+textSVG(x+115,260,st===0?'compute locally':out,'text-anchor="middle" class="mono" style="font-size:12px"');
    if(!col&&st>=2&&!back||col&&(st===3||back))s+=arrow(x+115,279,x+115,302,true);
   }
   let result=back?(col?'ALLREDUCE dX: [1,2] + [3,4] = [4,6]':'dX FEATURES STAY SHARDED: [4] | [6]'):col?(st===3?'OPTIONAL ALLGATHER: Y = [5,11]':'FEATURE SHARDS: [5] | [11] · NO SUM'):(st>=2?'ALLREDUCE SUM: Y = [5,11]':'SAME OUTPUT POSITIONS → SUM PARTIALS');
   s+=rectSVG(45,309,630,37,'#e6efd7')+textSVG(360,333,result,'text-anchor="middle" class="mono" style="font-size:12px;fill:#607e47"');
  }break;
 }

 case'sp':{
  s+=label(360,32,st===0?'TOKENWISE LOCAL WORK':st===1?'ALLGATHER':st===2?'TENSOR-PARALLEL REGION':'REDUCESCATTER');
  for(let r=0;r<4;r++){let x=42+r*173;s+=box(x,92,120,147,'RANK '+r,'tokens '+(r*2)+'–'+(r*2+1),st===2,r);let cells=st===1||st===2?[0,1,2,3].map(c=>({text:String(c),color:c})):[{text:'T'+r,color:r}];s+=cellRow(x+10,145,cells,100);if(st===1||st===3)s+=arrow(x+60,247,x+60,282,true);}
  s+=rectSVG(110,291,500,33,'#edf3e2')+textSVG(360,312,st===3?'SUM PARTIALS + RESTORE TOKEN SHARDS':'NORMALIZE → GATHER → TP → REDUCE-SCATTER','text-anchor="middle" class="mono" style="font-size:10px;fill:#738a5b"');break;
 }
 case'cp':{
  s+=label(360,32,'QUERIES STAY LOCAL · K/V BLOCKS CIRCULATE');
  for(let r=0;r<4;r++){let x=42+r*173,kv=(r-Math.max(0,Math.min(st,4)-1)+4)%4;s+=box(x,103,120,131,'RANK '+r,'local query Q'+r,st>0&&st<5,r)+rectSVG(x+13,146,94,27,PALETTE[kv])+textSVG(x+60,164,'K/V '+kv,'text-anchor="middle" class="mono" style="font-size:12px"');if(r<3)s+=arrow(x+128,172,x+165,172,st>1&&st<5);}
  s+=pathSVG('M 621 245 V 270 H 101 V 245',st>1&&st<5)+textSVG(360,310,st===5?'LOCAL OUTPUTS WITH GLOBAL SOFTMAX':'RUNNING MAX + NORMALIZATION SUM + OUTPUT','text-anchor="middle" class="mono" style="font-size:10px;fill:#7c9064"');break;
 }
 case'ep':{
  const routes=[[0,1,1],[0,1,3],[1,2,3],[0,1,3]];
  s+=label(360,29,st===0?'TOP-1 EXAMPLE · 3 TOKENS PER SOURCE':st===1?'DISPATCH BY EXPERT':st===2?'LOCAL EXPERT COMPUTE':'RETURN TO SOURCES');
  for(let r=0;r<4;r++){let x=42+r*173;s+=box(x,123,120,104,'EXPERT '+r,st===2?'compute':'rank '+r,st===2,r);s+=textSVG(x+60,65,'SOURCE '+r,'class="mono" text-anchor="middle" style="font-size:10px"');for(let j=0;j<3;j++)s+=rectSVG(x+17+j*29,77,22,15,PALETTE[r]);}
  if(st===1||st===3)for(let r=0;r<4;r++)for(const d of new Set(routes[r])){let x=102+r*173,dx=102+d*173;s+=pathSVG(st===1?`M ${x} 99 Q ${x} 110 ${dx} 115`:`M ${dx} 233 Q ${dx} 273 ${x} 281`,true);}
  if(st===1||st===2)for(let r=0;r<4;r++){
   let x=42+r*173,sources=[];routes.forEach((destinations,source)=>destinations.forEach(d=>{if(d===r)sources.push(source)}));
   sources.forEach((source,j)=>{s+=rectSVG(x+15+j%3*29,163+Math.floor(j/3)*21,22,15,PALETTE[source]);});
  }
  if(st===3)for(let r=0;r<4;r++){let x=42+r*173;s+=cellRow(x,289,[{text:'3 outputs',color:r}],120);}
  s+=label(360,345,'EXPERT LOADS = [3, 5, 1, 3] · COLORS IDENTIFY SOURCE RANKS');break;
 }
 case'hybrid':{
  s+=label(360,29,'DP 2 × PP 2 × TP 2 = 8 RANKS');
  for(let d=0;d<2;d++){
   let ox=46+d*343;s+=rectSVG(ox,55,286,248,'#f5f8ef','stroke="#e0e7d5"')+textSVG(ox+16,77,'DATA REPLICA '+d,'class="mono" style="font-size:10px;fill:#8b9b77"');
   for(let p=0;p<2;p++)for(let t=0;t<2;t++){let x=ox+23+t*128,y=99+p*110,r=d*4+p*2+t;s+=rectSVG(x,y,111,62,PALETTE[p*2+t],'stroke="#cbd7bc"')+textSVG(x+56,y+25,'RANK '+r,'text-anchor="middle" class="mono" style="font-size:11px"')+textSVG(x+56,y+43,'stage '+p+' · TP '+t,'text-anchor="middle" style="font-size:9px"');}
   if(st===1){s+=arrow(ox+140,130,ox+148,130,true)+arrow(ox+140,240,ox+148,240,true);}if(st===2)for(let t=0;t<2;t++)s+=arrow(ox+79+t*128,169,ox+79+t*128,199,true);
  }
  if(st===3&&!inf)for(let p=0;p<2;p++)for(let t=0;t<2;t++){let sx=125+t*128,dx=sx+343,y=p===0?92:279,cy=p===0?36-t*9:326+t*9;s+=pathSVG(`M ${sx} ${y} C ${sx} ${cy} ${dx} ${cy} ${dx} ${y}`,true);}
  s+=label(360,340,st===1?'TP: COOPERATE WITHIN A STAGE':st===2?'PP: PASS ACTIVATIONS BETWEEN STAGES':st===3?(inf?'DP: ROUTE REQUESTS TO INDEPENDENT INSTANCES':'DP: FOUR GROUPS CONNECT MATCHING SHARDS'):'EVERY RANK BELONGS TO ONE GROUP ON EACH AXIS');break;
 }
 case'replicas':{
  s+=box(270,40,180,65,'REQUEST ROUTER','load + cache affinity',st===0,0);
  for(let r=0;r<3;r++){let x=65+r*213;s+=pathSVG(`M 360 117 Q 360 153 ${x+83} 173`,st===1)+box(x,183,166,105,'INSTANCE '+r,st>=2?'own batch + KV cache':'ready for requests',st===2,r);if(st===3)s+=textSVG(x+83,322,'stream '+String.fromCharCode(65+r)+' →','text-anchor="middle" class="mono" style="font-size:11px;fill:#6b8e54"');}break;
 }
 case'pd':{
  s+=label(360,30,'DISAGGREGATED INFERENCE');s+=box(57,112,215,122,'PREFILL POOL',st===0?'new prompt':st===1?'build K/V for prompt':'next prompt',st===1||st===4,0)+box(449,112,215,122,'DECODE POOL',st>=3?'generate token by token':'ready for KV handoff',st>=3,1);
  s+=pathSVG('M 285 173 H 436',st===2);s+=rectSVG(310,140,100,28,st>=2?PALETTE[2]:'#f0f3e9')+textSVG(360,159,'KV CACHE','class="mono" text-anchor="middle" style="font-size:11px"');if(st>=3)for(let i=0;i<5;i++)s+=rectSVG(467+i*37,258,28,24,i<st?PALETTE[1]:'#ecf1e5')+textSVG(481+i*37,274,'t'+i,'class="mono" text-anchor="middle" style="font-size:9px"');s+=label(360,325,'PREFILL: COMPUTE-HEAVY · DECODE: ITERATIVE, CACHE-HEAVY');break;
 }
 case'fsdp':{
  s+=label(360,31,st===1||st===4?'GATHER MODULE PARAMETERS':st===2?'LOCAL FORWARD':st===5?'LOCAL BACKWARD':st===6?'REDUCE GRADIENTS TO OWNERS':'SHARDED PERSISTENT MODEL STATE');
  for(let r=0;r<4;r++){let x=40+r*174;s+=box(x,76,120,213,'RANK '+r,st===2||st===5?'local batch '+r:'owned shard '+r,st===2||st===5,r);for(let row=0;row<3;row++){let full=row===0&&[1,2,4,5].includes(st)||row===1&&st===5;s+=textSVG(x+12,133+row*45,['P','G','O'][row],'class="mono" style="font-size:11px"')+cellRow(x+30,115+row*45,full?[0,1,2,3].map(c=>({text:String(c),color:c})):[{text:String(r),color:r}],78);}if(st===1||st===4||st===6)if(r<3)s+=arrow(x+127,176,x+165,176,true);}
  s+=label(360,329,'P: PARAMETERS · G: GRADIENTS · O: OPTIMIZER STATE');break;
 }
 case'zero':{
  let stage=Number(f.variant.slice(-1));s+=label(360,31,'ZeRO '+stage+' · PERSISTENT STATE PER RANK');
  for(let r=0;r<4;r++){let x=40+r*174;s+=box(x,68,120,229,'RANK '+r,st===1?'local batch '+r:st===2?'owner updates':'persistent layout',st===1,r);for(let row=0;row<3;row++){let sharded=row===2||row===1&&stage>=2||row===0&&stage>=3;s+=textSVG(x+12,135+row*47,['P','G','O'][row],'class="mono" style="font-size:11px"')+cellRow(x+30,116+row*47,sharded?[{text:String(r),color:r}]:[0,1,2,3].map(c=>({text:String(c),color:c})),78);}}
  s+=label(360,334,'FULL ROW = REPLICATED · SINGLE SHARD = PARTITIONED');break;
 }
 case'accumulation':{
  s+=label(360,33,'THREE MICROBATCHES → ONE OPTIMIZER STEP');
  for(let i=0;i<3;i++){let x=71+i*208;s+=box(x,83,164,70,'MICROBATCH '+(i+1),'scaled loss',st===i+1,i)+arrow(x+82,161,x+82,203,st===i+1);}
  s+=rectSVG(118,212,485,60,'#eef4e4','stroke="#dbe6cc"')+textSVG(360,238,'GRADIENT ACCUMULATOR','text-anchor="middle" class="mono" style="font-size:11px"')+textSVG(360,256,st===0?'0':st<=3?Array.from({length:st},(_,i)=>'g'+(i+1)).join(' + '):st===4?'synchronize → global gradient':'optimizer.step() → clear','text-anchor="middle" class="mono" style="font-size:11px;fill:#78915d"');s+=label(360,321,st===5?'ONE UPDATE FOR THE WHOLE ACCUMULATION WINDOW':'NO OPTIMIZER STEP BETWEEN MICROBATCHES');break;
 }
 case'checkpoint':{
  s+=label(360,34,'ACTIVATION LIFETIME, SIMPLIFIED');
  for(let i=0;i<4;i++){let x=45+i*174;s+=box(x,93,111,82,'SEGMENT '+i,st===2&&(i===1||i===2)?'replay forward':'forward work',st===2&&(i===1||i===2),i);if(i<3)s+=arrow(x+119,134,x+165,134,st===0);let saved=i===0||i===3;s+=rectSVG(x,220,111,44,saved?PALETTE[i]:st===2&&(i===1||i===2)?PALETTE[2]:'#f1f3ec',!saved?'stroke="#d8e0cf" stroke-dasharray="4 4"':'')+textSVG(x+55,246,saved?'boundary':st===2&&(i===1||i===2)?'recomputed':'discarded','text-anchor="middle" class="mono" style="font-size:9px;fill:#81936d"');if(st===3&&i>0)s+=arrow(x,294,x-55,294,true);}
  s+=label(360,332,'CHECKPOINT BOUNDARIES PERSIST · INTERMEDIATES ARE REPLAYED');break;
 }
 case'overlap':{
  const x0=145,y0=82,w=70;
  s+=label(360,31,st===0?'SERIAL EXECUTION':'OVERLAPPED EXECUTION');
  s+=textSVG(127,y0+26,'COMPUTE','class="mono" text-anchor="end" style="font-size:10px"')+textSVG(127,y0+125,'NETWORK','class="mono" text-anchor="end" style="font-size:10px"');
  for(let i=0;i<3;i++){let x=x0+i*80;s+=rectSVG(x,y0,w,48,PALETTE[i],`opacity="${st>=i||st===0?1:.35}"`)+textSVG(x+w/2,y0+29,'bucket '+(i+1),'class="mono" text-anchor="middle" style="font-size:11px"');let nx=st===0?x0+3*80+i*80:x0+(i+1)*80;let nw=w;s+=rectSVG(nx,y0+99,nw,48,'#bfd4a3',`opacity="${st>=i+1||st===0?1:.35}"`);s+=textSVG(nx+nw/2,y0+128,'reduce '+(i+1),'class="mono" text-anchor="middle" style="font-size:11px"');}
  s+=`<path d="M 145 278 H 640" stroke="#d2dcc5" marker-end="url(#arrowhead)"/>`+textSVG(640,298,'time →','text-anchor="end" class="mono" style="font-size:10px;fill:#91a37d"');if(st===3)s+=label(360,336,'LAST COMMUNICATION TAIL REMAINS EXPOSED');break;
 }
 case'batching':{
  s+=label(360,32,'ITERATION-LEVEL SCHEDULING');
  const rows=[['A','B'],['A ✓','B'],['C','B'],['C','B']];
  for(let i=0;i<4;i++){let y=66+i*65;s+=textSVG(142,y+25,'ITERATION '+(i+1),'text-anchor="end" class="mono" style="font-size:10px;fill:#94a080"');for(let j=0;j<2;j++){let req=rows[i][j],color=req.startsWith('A')?0:req==='B'?1:2;s+=rectSVG(165+j*210,y,190,42,PALETTE[color],`opacity="${i===st?1:.35}" ${i===st?'stroke="#8da76f"':''}`)+textSVG(260+j*210,y+26,'request '+req,'text-anchor="middle" class="mono" style="font-size:12px"');}}
  s+=label(360,348,'C JOINS AT ITERATION 3 WHILE B CONTINUES');break;
 }
 case'kv':{
  s+=label(360,30,'LOGICAL BLOCKS → BLOCK TABLE → PHYSICAL KV CACHE');
  for(let i=0;i<3;i++){let x=80+i*200;s+=rectSVG(x,67,160,43,st===3?'#edf2e5':PALETTE[i],`opacity="${i===2&&st<2?.3:1}"`)+textSVG(x+80,93,'logical block '+i,'text-anchor="middle" class="mono" style="font-size:10px"');}
  const slots=[3,0,5];for(let i=0;i<(st>=2?3:2);i++){let sx=160+i*200,dx=75+slots[i]*110;if(st!==3)s+=pathSVG(`M ${sx} 118 Q ${sx} 167 ${dx} 202`,st===1||st===2);}
  for(let i=0;i<6;i++){let used=st!==3&&(i===3||i===0||i===5&&st>=2),col=i===3?0:i===0?1:2;s+=rectSVG(32+i*110,212,86,70,used?PALETTE[col]:'#f0f3eb','stroke="#dce5cf"')+textSVG(75+i*110,239,'slot '+i,'text-anchor="middle" class="mono" style="font-size:10px"')+textSVG(75+i*110,263,used?'K + V':'free','text-anchor="middle" style="font-size:11px;fill:#839474"');}
  s+=label(360,333,st===3?'BLOCKS AVAILABLE FOR REUSE':'CACHE TOKENS ONCE · READ HISTORY AT EACH DECODE STEP');break;
 }
 case'compression':{
  s+=label(360,32,'LESS NETWORK PAYLOAD · APPROXIMATE RECONSTRUCTION');
  for(let i=0;i<8;i++){s+=rectSVG(58+i*76,72,60,34,PALETTE[i%4],`opacity="${st===0?1:.4}"`)+textSVG(88+i*76,94,'g'+i,'text-anchor="middle" class="mono" style="font-size:11px"');}
  s+=arrow(360,118,360,150,st===1)+rectSVG(205,161,310,47,st>=1?PALETTE[1]:'#f0f4e8')+textSVG(360,190,st>=1?'compact values + metadata':'ENCODE','text-anchor="middle" class="mono" style="font-size:12px"')+arrow(360,222,360,251,st===2)+rectSVG(138,262,444,45,st>=3?PALETTE[0]:'#f0f4e8')+textSVG(360,290,st>=3?'reconstructed g̃ + tracked residual':'AGGREGATE → RECONSTRUCT','text-anchor="middle" class="mono" style="font-size:11px"');break;
 }
 case'quantization':{
  s+=label(360,32,'ILLUSTRATIVE WEIGHT PAYLOAD · SAME PARAMETER COUNT');
  const rows=[['FP16',510,'#cce4d9'],['INT8',255,'#d6e1f3'],['INT4',127.5,'#f0ddc4']];
  rows.forEach(([name,w,color],i)=>{let y=75+i*78;s+=textSVG(116,y+26,name,'text-anchor="end" class="mono" style="font-size:12px"')+rectSVG(140,y,w,44,color,`opacity="${st===0&&i>0?.3:1}"`)+textSVG(140+w-10,y+27,i===0?'2 bytes / weight':i===1?'1 byte':'½ byte','class="mono" text-anchor="end" style="font-size:10px;fill:#6c8059"');});s+=label(360,337,'SCALES + FORMAT OVERHEAD ARE ADDITIONAL');break;
 }
 }
 return s;
}
function sceneSVG(frame){if(frame.kind==='pipeline-schedule')return pipelineSVG(frame);const compact=frame.kind==='ranks'&&matchMedia('(max-width:700px)').matches;return `<svg class="scene ${frame.kind==='ranks'?'ranks-scene':'concept-scene'}" viewBox="${compact?'0 0 420 395':'0 0 720 365'}" role="img" aria-labelledby="scene-title scene-desc" xmlns="http://www.w3.org/2000/svg"><title id="scene-title">${esc(frame.title)}</title><desc id="scene-desc">${esc(frame.text)}</desc><defs><marker id="arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M 0 0 L 7 3.5 L 0 7" fill="none" stroke="#8aa376" stroke-width="1.1"/></marker></defs>${frame.kind==='ranks'?renderRanks(frame):renderConcept(frame)}</svg>`;}
