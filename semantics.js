/* Abstract contracts: input → operation → output, independent of network topology. */
function semanticFrames(topic){
 const id=topic.id;let inputs=blank(),outputs=blank();let operator='',action='';
 if(['all-reduce','reduce','reduce-scatter'].includes(id)){
  inputs=tensorInputs();operator='Σ';action=id==='reduce'?'SUM TO ROOT':id==='reduce-scatter'?'SUM + PARTITION':'SUM + REPLICATE';
  if(id==='all-reduce')outputs=Array.from({length:4},()=>[10,20,30,40]);
  if(id==='reduce')outputs[0]=[10,20,30,40];
  if(id==='reduce-scatter')for(let r=0;r<4;r++)outputs[r][r]=10*(r+1);
 }else if(['all-gather','gather'].includes(id)){
  for(let r=0;r<4;r++)inputs[r][r]=String.fromCharCode(65+r);operator='⊞';action=id==='gather'?'CONCAT TO ROOT':'CONCAT + REPLICATE';
  if(id==='gather')outputs[0]=['A','B','C','D'];else outputs=Array.from({length:4},()=>['A','B','C','D']);
 }else if(['broadcast','scatter'].includes(id)){
  inputs[0]=['A','B','C','D'];operator=id==='broadcast'?'⧉':'⋔';action=id==='broadcast'?'COPY ROOT INPUT':'PARTITION ROOT INPUT';
  if(id==='broadcast')outputs=Array.from({length:4},()=>['A','B','C','D']);else for(let r=0;r<4;r++)outputs[r][r]=String.fromCharCode(65+r);
 }else if(['all-to-all','all-to-all-v'].includes(id)){
  const counts=[[1,3,0,2],[2,1,1,0],[0,2,1,4],[1,0,2,1]],variable=id==='all-to-all-v';
  inputs=Array.from({length:4},(_,s)=>Array.from({length:4},(_,d)=>variable?(counts[s][d]?{text:counts[s][d]+'×',color:s}:null):{text:s+'→'+d,color:s}));
  outputs=Array.from({length:4},(_,d)=>Array.from({length:4},(_,s)=>variable?(counts[s][d]?{text:counts[s][d]+'×',color:s}:null):{text:s+'→'+d,color:s}));operator='⇄';action='TRANSPOSE OWNERSHIP';
 }else if(id==='send-recv'){
  inputs[0]=['A','B','C','D'];outputs[2]=['A','B','C','D'];operator='→';action='COPY 0 TO 2';
 }else if(id==='barrier'){
  inputs=[[{text:'here',color:0}],[{text:'work',color:2}],[{text:'here',color:0}],[{text:'work',color:2}]];outputs=Array.from({length:4},()=>[{text:'pass',color:0}]);operator='⊣';action='ALL MUST ENTER';
 }else if(id==='scan'){
  inputs=[[1],[2],[3],[4]];outputs=[[1],[3],[6],[10]];operator='∫';action='ORDERED PREFIX SUM';
 }
 const labels=id==='barrier'?['Observe arrival','Wait for all participants','Allow completion']:['Inspect the inputs','Apply the logical operation','Inspect the defined outputs'];
 const descriptions=[
  id==='barrier'?'Ranks 0 and 2 have arrived; 1 and 3 are still working. Early arrivals cannot pass yet.':`Read each rank’s input. ${topic.semanticNote}`,
  id==='barrier'?'All participants must enter before any participant can complete. This is synchronization, not a tensor transfer.':`${action.toLowerCase()}. This abstract step defines the result without choosing ring, tree, or any network schedule.`,
  id==='all-reduce'?'Every rank receives the identical elementwise sum [10, 20, 30, 40].':id==='reduce'?'Only root rank 0 receives [10, 20, 30, 40]; the other ranks have no defined reduced output.':id==='reduce-scatter'?'Ranks 0–3 receive different reduced slices [10], [20], [30], [40]. Together they partition the global sum.':id==='gather'?'Only root receives [A, B, C, D] in source-rank order. Sender input buffers can still exist; they are not gathered outputs.':id==='all-gather'?'Every rank receives [A, B, C, D]. These are copied and concatenated shards, not a sum.':id==='broadcast'?'All ranks receive the root’s unchanged [A, B, C, D]. Other ranks contribute no input values.':id==='scatter'?'Ranks 0–3 receive A, B, C, and D respectively. Values are partitioned, never added.':id==='all-to-all'?'Destination d gets [0→d, 1→d, 2→d, 3→d]. Each source’s destination bucket has changed owner.':id==='all-to-all-v'?'Destination rows contain variable-size source buckets. “3×” means three items; a blank bucket has zero items.':id==='send-recv'?'Only rank 2 receives the copy. Rank 0’s send buffer remains its input; ranks 1 and 3 do not participate.':id==='barrier'?'Every rank may complete after all have entered; they need not exit at the same physical instant.':'The inclusive prefixes are [1, 3, 6, 10]. Each rank includes its own input and all preceding ranks.'
 ];
 return labels.map((title,stage)=>({kind:'semantic',id,stage,title,text:descriptions[stage],inputs:clone(inputs),outputs:clone(outputs),operator,action}));
}
function semanticSVG(frame){
 const compact=matchMedia('(max-width:700px)').matches,st=frame.stage;let s='';
 const node=(x,y,values,r,defined)=>{
  let out=rectSVG(x,y,265,52,'#fff','class="node-shell"')+textSVG(x+13,y+20,'R'+r,'class="node-label" style="font-size:11px"');
  if(!defined)out+=textSVG(x+154,y+31,'no defined output','text-anchor="middle" style="font-size:11px;fill:#7e8974"');
  else out+=cellRow(x+53,y+11,values,199);
  return out;
 };
 const rootOnly=['reduce','gather'].includes(frame.id),receiveOnly=frame.id==='send-recv';
 const defined=r=>!rootOnly&&!receiveOnly||rootOnly&&r===0||receiveOnly&&r===2;
 if(compact){
  s+=label(210,30,st===2?'DEFINED OUTPUTS':'INPUTS ON FOUR RANKS');
  for(let r=0;r<4;r++)s+=node(77,54+r*65,st===2?frame.outputs[r]:frame.inputs[r],r,st===2?defined(r):true);
  s+=rectSVG(77,330,265,60,st===1?'#e4efd6':'#f0f4e7','stroke="#d8e4c9"')+textSVG(105,368,frame.operator,'style="font-size:28px;fill:#527b3d"')+textSVG(235,365,frame.action,'text-anchor="middle" class="mono" style="font-size:9px;fill:#5c7646"');
 }else{
  s+=label(157,29,'INPUTS')+label(683,29,st===2?'DEFINED OUTPUTS':'OUTPUTS AFTER THE OPERATION');
  for(let r=0;r<4;r++){
   s+=node(25,51+r*65,frame.inputs[r],r,true);
   s+=`<g opacity="${st===2?1:.3}">`+node(550,51+r*65,st===2?frame.outputs[r]:[null,null,null,null],r,st===2?defined(r):true)+'</g>';
   if(st===1)s+=pathSVG(`M 302 ${77+r*65} Q 326 ${77+r*65} 341 177`,true);
   if(st===2&&defined(r))s+=pathSVG(`M 499 177 Q 525 ${77+r*65} 538 ${77+r*65}`,true);
  }
  s+=rectSVG(345,135,150,85,st===1?'#e4efd6':'#f0f4e7','stroke="#d8e4c9"')+textSVG(420,181,frame.operator,'text-anchor="middle" style="font-size:34px;fill:#527b3d"')+textSVG(420,205,frame.action,'text-anchor="middle" class="mono" style="font-size:8px;fill:#647a50"');
  s+=label(420,337,'ABSTRACT TRANSFORMATION · NO NETWORK TOPOLOGY IMPLIED');
 }
 return `<svg class="semantic-scene" viewBox="${compact?'0 0 420 415':'0 0 840 360'}" role="img" aria-labelledby="semantic-title semantic-desc" xmlns="http://www.w3.org/2000/svg"><title id="semantic-title">${esc(frame.title)}</title><desc id="semantic-desc">${esc(frame.text)}</desc><defs><marker id="semantic-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="none" stroke="#8aa376"/></marker></defs>${s.replaceAll('url(#arrowhead)','url(#semantic-arrow)')}</svg>`;
}
