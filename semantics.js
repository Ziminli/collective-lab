/* Executable input/output contracts. A selected entry retains its identity throughout. */
function semanticFrames(topic,entry=0){
 const id=topic.id,reduce=['all-reduce','reduce','reduce-scatter'].includes(id),scan=id==='scan',gather=['all-gather','gather'].includes(id),rootCopy=['broadcast','scatter','send-recv'].includes(id),exchange=['all-to-all','all-to-all-v'].includes(id);
 entry=Math.max(0,Math.min(3,entry));let inputs=blank(),outputs=blank(),frames=[],sum=0;
 if(reduce)inputs=tensorInputs();else if(scan)inputs=[[1],[2],[3],[4]];else if(gather)for(let r=0;r<4;r++)inputs[r]=[String.fromCharCode(65+r)];else if(rootCopy)inputs[0]=['A','B','C','D'];else if(exchange)inputs=Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>id==='all-to-all-v'?({text:[[1,3,0,2],[2,1,1,0],[0,2,1,4],[1,0,2,1]][r][c]+'×',color:r}):({text:r+'→'+c,color:r})));
 else inputs=[[{text:'entered',color:0}],[{text:'working',color:2}],[{text:'entered',color:0}],[{text:'working',color:2}]];
 if(['reduce-scatter','scatter','scan'].includes(id))outputs=Array.from({length:4},()=>[null]);
 const add=(title,cn,text,zh,extra={})=>frames.push({kind:'calculation',id,stage:frames.length,entry,title:MT(title,cn),text:MT(text,zh),inputs:clone(inputs),outputs:clone(outputs),accumulator:sum,...extra});
 add(reduce?'Match the same tensor position':exchange?'Address one destination':scan?'Respect rank order':'Read the owned inputs',reduce?'对齐相同张量位置':exchange?'选定一个目标':scan?'保持 rank 顺序':'读取持有的输入',reduce?'Follow column '+entry+'. Values at different positions are never added together.':'Follow the colored entries from their source to their exact output positions.',reduce?'追踪第 '+entry+' 列；不同位置的值不会相加。':'追踪彩色元素，从源位置到其精确输出位置。',{equation:reduce?'y['+entry+'] = x₀['+entry+'] + x₁['+entry+'] + x₂['+entry+'] + x₃['+entry+']':topic.formula});
 if(reduce||scan){
  const stop=scan?entry:3;
  for(let r=0;r<=stop;r++){const previous=sum,value=inputs[r][scan?0:entry];sum+=value;
   add(previous+' + '+value+' = '+sum,previous+' + '+value+' = '+sum,'Take rank '+r+'’s '+(scan?'scalar':'entry '+entry)+'. Add '+value+' to the running sum '+previous+'. The new sum is '+sum+'.','取 rank '+r+' 的'+(scan?'标量':'第 '+entry+' 个元素')+'，将 '+value+' 加到累积和 '+previous+'，新和为 '+sum+'。',{equation:previous+' + '+value+' = '+sum,arithmetic:{previous,value,result:sum,rank:r,column:scan?0:entry},focus:[r,scan?0:entry]});
  }
  const owners=id==='all-reduce'?[0,1,2,3]:[id==='reduce'?0:entry];
  for(const r of owners){outputs[r][scan||id==='reduce-scatter'?0:entry]=sum;add('Write '+sum+' to rank '+r,'将 '+sum+' 写入 rank '+r,id==='all-reduce'?'Copy the finished '+sum+' into the same position of rank '+r+'’s output. This is a copy, not another addition.':'Write the selected reduced result to its defined owner. Other tensor positions follow the same rule.',id==='all-reduce'?'将已算好的 '+sum+' 复制到 rank '+r+' 输出的相同位置；此处是复制，不再相加。':'将所选归约结果写入规定的持有者；其他张量位置遵循相同规则。',{equation:'y'+r+'['+(scan||id==='reduce-scatter'?0:entry)+'] ← '+sum,transfer:{from:'sum',to:r,column:scan?0:entry,destColumn:scan||id==='reduce-scatter'?0:entry,value:sum,op:'copy'}});}
  if(scan){for(let r=0,total=0;r<4;r++){total+=r+1;outputs[r]=[total];}}else if(id==='all-reduce')outputs=Array.from({length:4},()=>[10,20,30,40]);else if(id==='reduce')outputs[0]=[10,20,30,40];else outputs=[[10],[20],[30],[40]];
  add('Check the result','检查结果',scan?'Rank '+entry+' includes only ranks 0 through '+entry+'. The complete inclusive scan is [1,3,6,10].':'We traced position '+entry+'. Repeating the same calculation for the other positions gives [10,20,30,40]; '+(id==='all-reduce'?'each rank owns the full result.':id==='reduce'?'only root owns the reduced output.':'each rank owns only its assigned slice.'),scan?'rank '+entry+' 只包含 rank 0 到 '+entry+'；完整包含自身前缀为 [1,3,6,10]。':'已追踪位置 '+entry+'；对其他位置重复计算，得到 [10,20,30,40]；'+(id==='all-reduce'?'每个 rank 持有完整结果。':id==='reduce'?'只有根持有归约输出。':'每个 rank 仅持有分配给它的片段。'),{equation:scan?'[1, 1+2, 1+2+3, 1+2+3+4] = [1,3,6,10]':topic.formula,complete:true});
 }else if(gather){
  const value=inputs[entry][0],owners=id==='gather'?[0]:[0,1,2,3];
  for(const r of owners){outputs[r][entry]=value;add('Copy '+value+' into output position '+entry,'将 '+value+' 复制到输出位置 '+entry,'Shard '+value+' comes from source rank '+entry+'. It occupies position '+entry+' in rank '+r+'’s output; it is not added to other shards.','分片 '+value+' 来自源 rank '+entry+'，放入 rank '+r+' 输出的位置 '+entry+'；不与其他分片相加。',{equation:'y'+r+'['+entry+'] ← x'+entry+' = '+value,transfer:{from:entry,to:r,column:0,destColumn:entry,value,op:'copy'},focus:[entry,0]});}
 }else if(rootCopy){
  const value=inputs[0][entry],owners=id==='broadcast'?[0,1,2,3]:[id==='scatter'?entry:2];
  for(const r of owners){outputs[r][id==='scatter'?0:entry]=value;add('Copy root position '+entry+' to rank '+r,'将根位置 '+entry+' 复制到 rank '+r,'The unchanged value '+value+' moves from root input position '+entry+' to its defined destination. No other rank contributes a value.','未改变的值 '+value+' 从根输入位置 '+entry+' 移动到规定目标；其他 rank 不贡献数值。',{equation:'y'+r+'['+(id==='scatter'?0:entry)+'] ← x₀['+entry+'] = '+value,transfer:{from:0,to:r,column:entry,destColumn:id==='scatter'?0:entry,value,op:'copy'},focus:[0,entry]});}
 }else if(exchange){
  for(let source=0;source<4;source++){const value=inputs[source][entry];outputs[entry][source]=value;add('Source '+source+' → destination '+entry,'源 '+source+' → 目标 '+entry,'Read bucket '+entry+' from source '+source+' and place it in source slot '+source+' at destination '+entry+'. '+(id==='all-to-all-v'?'The label is the item count; 0× carries no payload.':'The payload identity is preserved.'),'读取源 '+source+' 的第 '+entry+' 个桶，放入目标 '+entry+' 的源槽位 '+source+'。'+(id==='all-to-all-v'?'标签为元素计数，0× 不传输负载。':'负载身份保持不变。'),{equation:'recv['+entry+']['+source+'] ← send['+source+']['+entry+']',transfer:{from:source,to:entry,column:entry,destColumn:source,value:typeof value==='object'?value.text:value,op:'route'},focus:[source,entry]});}
 }else{
  inputs[1]=[{text:'entered',color:0}];add('Rank 1 enters: still wait','rank 1 进入：继续等待','Three of four participants have entered. Rank 3 is still working; no participant can complete.','四个参与者中三个已进入；rank 3 仍在工作，任何参与者均不可完成。',{equation:'3 / 4 entered → wait'});
  inputs[3]=[{text:'entered',color:0}];add('Rank 3 enters: all have arrived','rank 3 进入：全部已到达','Only now are all four participants in the barrier. Implementations must communicate arrival knowledge.','只有此刻四个参与者才都进入屏障；实现还需通信以传播到达信息。',{equation:'4 / 4 entered'});
  outputs=Array.from({length:4},()=>[{text:'may exit',color:0}]);add('Completion is now allowed','现在允许完成','A barrier produces participation knowledge, not a summed tensor. Ranks need not exit at the same instant.','屏障产生参与信息，而非归约张量；各 rank 无需在同一瞬间退出。',{equation:'all entered ⇒ any may complete',complete:true});
 }
 if(gather||rootCopy||exchange){
  if(gather)outputs=id==='gather'?[['A','B','C','D'],[null,null,null,null],[null,null,null,null],[null,null,null,null]]:Array.from({length:4},()=>['A','B','C','D']);
  if(rootCopy){outputs=id==='broadcast'?Array.from({length:4},()=>['A','B','C','D']):id==='scatter'?[['A'],['B'],['C'],['D']]:[[null,null,null,null],[null,null,null,null],['A','B','C','D'],[null,null,null,null]];}
  if(exchange)outputs=Array.from({length:4},(_,d)=>Array.from({length:4},(_,s)=>inputs[s][d]));
  add('Repeat the rule for the remaining entries','对其余元素重复相同规则','The full output is now shown. The selected entry follows exactly the same rule as every other entry. Original input data remains unchanged.','现在显示完整输出；所选元素与其余元素遵循完全相同的规则，原始输入数据保持不变。',{equation:topic.formula,complete:true});
 }
 return frames.map(f=>({...f,total:frames.length}));
}
function semanticSVG(f){
 const narrow=matchMedia('(max-width:700px)').matches,w=narrow?420:840,h=narrow?660:430,inputX=narrow?20:25,outputX=narrow?20:555,inputY=53,outputY=narrow?373:53,cardW=narrow?380:260,rowH=57,cw=f.id==='barrier'?100:narrow?58:40;let s='';
 const group=(side,x,y,rows)=>{let a='';for(let r=0;r<4;r++){a+=rectSVG(x,y+r*rowH,cardW,48,'white','class="node-shell"')+textSVG(x+12,y+r*rowH+28,'R'+r,'class="mono node-label" style="font-size:11px"');rows[r].forEach((raw,c)=>{const v=raw&&typeof raw==='object'?raw.text:raw,active=side==='input'?(f.focus?f.focus[0]===r&&f.focus[1]===c:c===f.entry):f.transfer?.to===r&&(f.transfer.destColumn??f.transfer.column)===c,px=x+(narrow?85:60)+c*(cw+5),py=y+r*rowH+9;a+=`<g data-logical-cell="${side}-${r}-${c}">`+rectSVG(px,py,cw,30,v==null?'#f5f7f1':PALETTE[(typeof raw==='object'&&raw!==null?raw.color:['all-gather','gather'].includes(f.id)&&side==='input'?r:c)%4],`class="logical-cell ${active?'logical-cell-active':''}" ${v==null?'stroke-dasharray="3 3"':''}`)+textSVG(px+cw/2,py+20,v==null?'·':v,'class="cell-text mono" text-anchor="middle"')+'</g>';});}return a;};
 s+=label(inputX+cardW/2,30,MT('INPUTS · unchanged source data','输入 · 保留源数据'))+group('input',inputX,inputY,f.inputs);
 s+=label(outputX+cardW/2,outputY-23,MT('OUTPUTS · values written so far','输出 · 截至本步已写入的值'))+group('output',outputX,outputY,f.outputs);
 if(f.arithmetic){const a=f.arithmetic,x=narrow?30:310,y=narrow?302:120;
  s+=textSVG(x+(narrow?180:110),y-19,MT('ONE ELEMENTWISE ADD','一次逐元素加法'),'class="diagram-label" text-anchor="middle" style="font-size:10px"');
  s+=textSVG(x+25,y+20,a.previous,'text-anchor="middle" class="calculus-number"')+textSVG(x+65,y+20,'+','text-anchor="middle" class="calculus-number"')+textSVG(x+105,y+20,a.value,'text-anchor="middle" class="calculus-number"')+textSVG(x+145,y+20,'=','text-anchor="middle" class="calculus-number"')+textSVG(x+185,y+20,a.result,'text-anchor="middle" class="calculus-number calculus-answer"');
  s+=textSVG(x+25,y+42,MT('old sum','旧和'),'text-anchor="middle" class="subtext" style="font-size:9px"')+textSVG(x+105,y+42,'R'+a.rank+'['+a.column+']','text-anchor="middle" class="subtext" style="font-size:9px"')+textSVG(x+185,y+42,MT('new sum','新和'),'text-anchor="middle" class="subtext" style="font-size:9px"');
 }else if(f.transfer){s+=textSVG(narrow?210:420,narrow?326:169,String(f.transfer.value),'text-anchor="middle" class="calculus-number calculus-answer"')+textSVG(narrow?210:420,narrow?347:197,MT('COPY · no addition','复制 · 不再相加'),'text-anchor="middle" class="diagram-label" style="font-size:10px"');}
 else s+=textSVG(narrow?210:420,narrow?324:174,f.id==='barrier'?'✓':'['+f.entry+']','text-anchor="middle" class="calculus-number"');
 if(!narrow){s+=textSVG(420,322,MT('Follow the arithmetic; then follow the copy.','先追踪计算，再追踪复制。'),'text-anchor="middle" class="subtext" style="font-size:12px"');}
 s+=textSVG(w/2,h-18,MT('Teaching decomposition · choose another position to trace the same rule','教学分解 · 选择其他位置可追踪相同规则'),'text-anchor="middle" class="subtext" style="font-size:9px"');
 return `<svg class="semantic-scene calculus-scene" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="semantic-title semantic-desc"><title id="semantic-title">${esc(f.title)}</title><desc id="semantic-desc">${esc(f.text+' '+f.equation)}</desc>${s}</svg>`;
}
function animateLogicalData(f){
 if(motionReduced())return;const svg=document.querySelector('#semantic-diagram svg');if(!svg)return;const narrow=matchMedia('(max-width:700px)').matches;
 const move=(source,target)=>{const cell=svg.querySelector(`[data-logical-cell="${source}"]`);if(!cell)return;const g=cell.cloneNode(true);g.removeAttribute('data-logical-cell');g.classList.add('logical-traveller');g.style.pointerEvents='none';svg.append(g);const b=cell.getBBox(),dx=target[0]-b.x-b.width/2,dy=target[1]-b.y-b.height/2;g.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${dx}px,${dy}px)`,opacity:1,offset:.8},{transform:`translate(${dx}px,${dy}px)`,opacity:0}],{duration:1600,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});};
 if(f.arithmetic){move('input-'+f.arithmetic.rank+'-'+f.arithmetic.column,[narrow?135:415,narrow?314:132]);const answer=svg.querySelector('.calculus-answer');answer?.animate([{opacity:0},{opacity:0,offset:.7},{opacity:1}],{duration:2200,fill:'backwards'});}
 if(f.transfer){const t=f.transfer,target=svg.querySelector(`[data-logical-cell="output-${t.to}-${t.destColumn??t.column}"]`),source=svg.querySelector(`[data-logical-cell="input-${t.from}-${t.column}"]`);if(target){const b=target.getBBox();if(source)move('input-'+t.from+'-'+t.column,[b.x+b.width/2,b.y+b.height/2]);else{const g=target.cloneNode(true);g.removeAttribute('data-logical-cell');svg.append(g);g.animate([{transform:`translate(${(narrow?210:420)-b.x-b.width/2}px,${(narrow?320:160)-b.y-b.height/2}px)`,opacity:1},{transform:'translate(0,0)',opacity:1}],{duration:1500,easing:'cubic-bezier(.2,.8,.2,1)'});}target.animate([{opacity:.12},{opacity:.12,offset:.8},{opacity:1}],{duration:1500,fill:'backwards'});}}
}
function semanticShapeText(t){
 const shapes={
 'all-reduce':['Each rank: input [4] → output [4]; matching positions sum.','每个 rank：输入 [4] → 输出 [4]；相同位置求和。'],
 'reduce':['Each rank: input [4]; root output [4]; other outputs are undefined.','每个 rank：输入 [4]；根输出 [4]，其他输出未定义。'],
 'reduce-scatter':['Each rank: input [4] → local output [1]; rank r owns global position r.','每个 rank：输入 [4] → 本地输出 [1]；rank r 持有全局位置 r。'],
 'all-gather':['Each rank: input [1] → output [4]; concatenate in source-rank order.','每个 rank：输入 [1] → 输出 [4]；按源 rank 顺序拼接。'],
 'gather':['Each rank: input [1]; root output [4], ordered by source rank.','每个 rank：输入 [1]；根输出 [4]，按源 rank 排列。'],
 'broadcast':['Root input [4] → every rank output [4].','根输入 [4] → 每个 rank 输出 [4]。'],
 'scatter':['Root input [4] → each rank output [1].','根输入 [4] → 每个 rank 输出 [1]。'],
 'all-to-all':['Each rank: 4 outgoing buckets → 4 incoming buckets; receive slots use source order.','每个 rank：4 个发出桶 → 4 个接收桶；接收槽按源排列。'],
 'all-to-all-v':['Each rank: variable-length buckets. Labels show counts; recvcount[d][s]=sendcount[s][d].','每个 rank：变长桶。标签表示计数；recvcount[d][s]=sendcount[s][d]。'],
 'send-recv':['Rank 0 input [4] → rank 2 output [4]; other ranks do not participate.','rank 0 输入 [4] → rank 2 输出 [4]；其他 rank 不参与。'],
 'scan':['Each rank: input [1] → output [1]; rank r sums only ranks 0…r.','每个 rank：输入 [1] → 输出 [1]；rank r 仅对 rank 0…r 求和。'],
 'barrier':['No tensor input/output. Each rank communicates participation.','没有张量输入 / 输出；各 rank 传递参与状态。']
 };return MT(...shapes[t.id]);
}
