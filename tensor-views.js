/* Matrix-first views: colors identify physical ownership, not numeric values. */
function matrixSVG(x,y,values,options={}){
 const rows=values.length,cols=values[0].length,cw=options.cw||30,ch=options.ch||27,gap=3,w=cols*(cw+gap)-gap,h=rows*(ch+gap)-gap;
 let s=`<g class="matrix" data-matrix="${esc(options.name||'tensor')}" data-rows="${rows}" data-cols="${cols}">`;
 if(options.label)s+=textSVG(x+w/2,y-12,options.label,'text-anchor="middle" class="mono matrix-label" style="font-size:11px"');
 values.forEach((row,r)=>row.forEach((value,c)=>{
  let owner=options.owner?options.owner(r,c):null,fill=owner===null?'#edf3e5':PALETTE[owner%4],inactive=options.mask?.(r,c);
  s+=`<rect x="${x+c*(cw+gap)}" y="${y+r*(ch+gap)}" width="${cw}" height="${ch}" rx="3" fill="${inactive?'#eff2eb':fill}" class="matrix-cell ${inactive?'masked-cell':''}" data-row="${r}" data-col="${c}"/>`;
  if(!inactive&&value!=='')s+=textSVG(x+c*(cw+gap)+cw/2,y+r*(ch+gap)+ch/2+4,value,'text-anchor="middle" class="mono matrix-value" style="font-size:12px"');
 }));
 s+=`<path d="M ${x-4} ${y-2} h-4 v${h+4} h4 M ${x+w+4} ${y-2} h4 v${h+4} h-4" class="matrix-bracket" fill="none" stroke="#879b73" stroke-width="1.2"/>`;
 if(options.partition==='row')s+=`<path d="M ${x-9} ${y+(ch+gap)*rows/2-1.5} H ${x+w+9}" stroke="#668c62" stroke-dasharray="3 3"/>`;
 if(options.partition==='col')s+=`<path d="M ${x+(cw+gap)*cols/2-1.5} ${y-7} V ${y+h+7}" stroke="#668c62" stroke-dasharray="3 3"/>`;
 return s+'</g>';
}
function renderTensorParallel(f){
 const st=f.stage,col=f.variant==='Column-parallel',pair=f.variant==='Column → row MLP',back=st===(pair?5:4);let s='';
 const owner=(r,c)=>(col||pair)?c:r;
 if(pair&&back){
  s+=label(360,27,'BACKWARD · COLUMN → ROW MLP');
  s+=matrixSVG(40,75,[[1]],{name:'dY',label:'dY · 1×1',cw:27,ch:25})+textSVG(110,94,'×','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(152,75,[[1,1]],{name:'W2 transpose',label:'W₂ᵀ · 1×2',cw:24,ch:25,owner:(r,c)=>c,partition:'col'})+textSVG(247,94,'→','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(282,75,[[1,1]],{name:'dH',label:'dH · 1×2',cw:24,ch:25,owner:(r,c)=>c})+textSVG(370,94,'×','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(410,62,[[1,2],[3,4]],{name:'W1 transpose',label:'W₁ᵀ · 2×2',cw:24,ch:25,owner:(r,c)=>r,partition:'row'})+textSVG(506,94,'=','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(550,75,[[4,6]],{name:'dX',label:'dX · 1×2',cw:24,ch:25});
  s+=textSVG(310,136,'ReLU′ = 1 for both hidden features','text-anchor="middle" class="subtext" style="font-size:10px"');
  for(let r=0;r<2;r++){
   const x=48+r*352;s+=rectSVG(x,178,273,124,'#fff','class="node-shell"')+textSVG(x+15,201,'RANK '+r+' · dH'+r,'class="node-label"');
   s+=matrixSVG(x+25,235,[[1]],{name:'local hidden gradient '+r,cw:24,ch:25,owner:()=>r})+textSVG(x+75,254,'×','text-anchor="middle" style="font-size:18px"');
   s+=matrixSVG(x+99,235,[r===0?[1,2]:[3,4]],{name:'local weight transpose '+r,cw:24,ch:25,owner:()=>r})+textSVG(x+174,254,'=','text-anchor="middle" style="font-size:18px"');
   s+=matrixSVG(x+194,235,[r===0?[1,2]:[3,4]],{name:'local input gradient '+r,cw:24,ch:25,owner:()=>r});
  }
  return s+rectSVG(48,319,625,32,'#e6efd7')+textSVG(360,340,'ALLREDUCE dX: [1,2] + [3,4] = [4,6]','text-anchor="middle" class="mono" style="font-size:11px"');
 }
 if(pair){
  s+=label(360,27,'COLUMN → LOCAL ACTIVATION → ROW');
  s+=matrixSVG(35,75,[[1,2]],{name:'X',label:'X · 1×2',cw:25,ch:25})+textSVG(112,94,'×','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(155,62,[[1,3],[2,4]],{name:'W1',label:'W₁ · 2×2',cw:25,ch:25,owner,partition:'col'})+textSVG(242,94,'→','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(280,75,[[st>=1?5:'?',st>=1?11:'?']],{name:'H',label:'H · 1×2',cw:25,ch:25,owner:(r,c)=>c})+textSVG(370,94,'×','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(418,62,[[1],[1]],{name:'W2',label:'W₂ · 2×1',cw:25,ch:25,owner:(r,c)=>r,partition:'row'})+textSVG(495,94,'=','text-anchor="middle" style="font-size:20px"');
  s+=matrixSVG(550,75,[[st>=4?16:'?']],{name:'Y',label:'Y · 1×1',cw:34,ch:25});
  s+=textSVG(308,136,'ReLU stays local','text-anchor="middle" class="subtext"');
  for(let r=0;r<2;r++){let x=48+r*352;s+=rectSVG(x,178,273,124,'#fff','class="node-shell"')+textSVG(x+15,201,'RANK '+r+' · H'+r,'class="node-label"');s+=matrixSVG(x+25,235,[[st>=1?(r===0?5:11):'?']],{name:'H'+r,cw:32,ch:27,owner:()=>r})+textSVG(x+91,255,'×','text-anchor="middle" style="font-size:18px"')+matrixSVG(x+122,235,[[1]],{name:'W2 shard '+r,cw:32,ch:27,owner:()=>r})+textSVG(x+179,255,'=','text-anchor="middle" style="font-size:18px"')+matrixSVG(x+210,235,[[st>=3?(r===0?5:11):'?']],{name:'partial '+r,cw:32,ch:27,owner:()=>r});}
  s+=rectSVG(48,319,625,32,'#e6efd7')+textSVG(360,340,back?'BACKWARD: LOCAL H GRADS → REDUCE dX':st>=4?'ALLREDUCE: 5 + 11 = 16':'NO INTERMEDIATE ALLGATHER','text-anchor="middle" class="mono" style="font-size:11px"');return s;
 }
 s+=label(360,26,back?'BACKWARD · SAME WEIGHT OWNERSHIP':col?'COLUMN SHARDS: DIFFERENT OUTPUT FEATURES':'ROW SHARDS: PARTIAL SUMS FOR THE SAME OUTPUT');
 const X=back?[[1,1]]:[[1,2]],W=back?[[1,2],[3,4]]:[[1,3],[2,4]];
 s+=matrixSVG(100,70,X,{name:back?'dY':'X',label:back?'dY · 1×2':'X · 1×2',owner:(r,c)=>(back?col:!col)?c:null})+textSVG(239,92,'×','text-anchor="middle" style="font-size:22px"');
 s+=matrixSVG(300,56,W,{name:back?'W transpose':'W',label:back?'Wᵀ · 2×2':'W · 2×2',owner:back?(r,c)=>col?r:c:owner,partition:back?(col?'row':'col'):(col?'col':'row')})+textSVG(465,92,'=','text-anchor="middle" style="font-size:22px"');
 s+=matrixSVG(535,70,[back?[4,6]:st>=2?[5,11]:['?','?']],{name:back?'dX':'Y',label:back?'dX · 1×2':'Y · 1×2',owner:(r,c)=>(back?!col:col)?c:null});
 s+=textSVG(360,145,'The top row is the mathematical tensor; the cards show local ownership.','text-anchor="middle" class="subtext" style="font-size:10px"');
 for(let r=0;r<2;r++){
  let x=44+r*357;s+=rectSVG(x,174,275,129,'#fff','class="node-shell"')+textSVG(x+14,197,'RANK '+r+' · '+(col?'COLUMN '+r:'ROW '+r),'class="node-label"');
  const left=back?(col?[[1]]:[[1,1]]):col?[[1,2]]:[[r+1]];
  const weight=back?(col?(r===0?[[1,2]]:[[3,4]]):(r===0?[[1],[3]]:[[2],[4]])):col?(r===0?[[1],[2]]:[[3],[4]]):(r===0?[[1,3]]:[[2,4]]);
  const result=back?(col?(r===0?[[1,2]]:[[3,4]]):[[r===0?4:6]]):col?[[st>0?(r===0?5:11):'?']]:[st>0?(r===0?[1,3]:[4,8]):['?','?']];
  s+=matrixSVG(x+17,235,left,{name:'local input '+r,cw:22,ch:23,owner:()=>col&&!back?null:r})+textSVG(x+84,253,'×','text-anchor="middle" style="font-size:18px"')+matrixSVG(x+105,weight.length===2?222:235,weight,{name:'weight shard '+r,cw:22,ch:23,owner:()=>r})+textSVG(x+175,253,'=','text-anchor="middle" style="font-size:18px"')+matrixSVG(x+199,235,result,{name:'local output '+r,cw:22,ch:23,owner:()=>r});
 }
 const result=back?(col?'SUM dX: [1,2] + [3,4] = [4,6]':'LOCAL dX SHARDS: [4] | [6]'):col?(st===3?'OPTIONAL ALLGATHER: [5] ⧺ [11] = [5,11]':'KEEP FEATURE SHARDS: [5] | [11]'):(st>=2?'ALLREDUCE SUM: [1,3] + [4,8] = [5,11]':'COMPUTE LOCAL PRODUCTS FIRST');
 s+=rectSVG(44,320,632,32,'#e6efd7')+textSVG(360,341,result,'text-anchor="middle" class="mono" style="font-size:11px"');return s;
}
function renderSequenceMatrices(f){
 const st=f.stage,full=st===1||st===2;let s=label(360,27,'ACTIVATION LAYOUT · SEQUENCE × HIDDEN');
 s+=matrixSVG(83,83,Array.from({length:8},()=>Array(4).fill('')),{name:'global activation',label:'S = 8, H = 4',cw:23,ch:23,owner:(r,c)=>Math.floor(r/2)});
 for(let r=0;r<8;r++)s+=textSVG(65,100+r*26,'t'+r,'text-anchor="end" class="mono" style="font-size:10px"');
 s+=textSVG(131,321,'8 token rows','text-anchor="middle" class="subtext"');
 for(let r=0;r<4;r++){
  const x=303+(r%2)*205,y=57+Math.floor(r/2)*151;
  s+=rectSVG(x,y,178,138,'#fff','class="node-shell"')+textSVG(x+13,y+20,'RANK '+r+' · '+(full?'8×4':'2×4'),'class="node-label"');
  s+=matrixSVG(x+58,y+36,Array.from({length:full?8:2},()=>Array(4).fill('')),{name:'rank '+r+' activation',cw:full?13:18,ch:full?6:22,owner:(row,col)=>full?Math.floor(row/2):r});
  s+=textSVG(x+89,y+123,st===2?'TP partial outputs':full?'all token rows':'local token rows','text-anchor="middle" class="subtext" style="font-size:9px"');
 }
 s+=pathSVG('M 208 186 H 286',st===1||st===3)+textSVG(248,175,st===3?'Σ / P':st===1?'copy':'layout','text-anchor="middle" class="mono" style="font-size:11px"');
 return s;
}
function renderContextMatrices(f){
 const st=f.stage,visit=Math.min(Math.max(st,1),4)-1,activeKV=(2-visit+4)%4;let s=label(360,25,'CAUSAL ATTENTION · LOCAL Q × GLOBAL Kᵀ');
 s+=textSVG(161,51,'key positions →','text-anchor="middle" class="subtext"');
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){
  const valid=c<=r,local=r===4||r===5,active=local&&(st===5||Math.floor(c/2)===activeKV),fill=!valid?'#eff2eb':active?PALETTE[2]:'#dfe9d5';
  s+=`<rect x="${63+c*24}" y="${68+r*24}" width="21" height="21" rx="3" fill="${fill}" class="${!valid?'masked-cell':''}"/>`;
  if(!valid)s+=textSVG(73.5+c*24,82.5+r*24,'×','text-anchor="middle" style="font-size:9px;fill:#a6b09c"');
 }
 for(let i=0;i<8;i++)s+=textSVG(52,82+i*24,String(i),'text-anchor="end" class="mono" style="font-size:10px"')+textSVG(73+i*24,58,String(i),'text-anchor="middle" class="mono" style="font-size:10px"');
 s+=`<rect x="59" y="161" width="196" height="51" rx="4" fill="none" stroke="#b18a54" stroke-width="1.6"/>`;
 s+=textSVG(160,285,'Highlighted query rows: rank 2','text-anchor="middle" class="subtext" style="font-size:10px"')+textSVG(160,305,'× = future key, masked out','text-anchor="middle" class="subtext" style="font-size:10px"');
 const pos=[[350,65],[535,65],[535,230],[350,230]];
 for(let r=0;r<4;r++){let[x,y]=pos[r],kv=(r-visit+4)%4;s+=rectSVG(x,y,125,89,'#fff','class="node-shell"')+textSVG(x+12,y+20,'RANK '+r,'class="node-label"')+textSVG(x+62,y+42,'local Q'+r,'text-anchor="middle" class="mono" style="font-size:10px"')+rectSVG(x+18,y+54,89,24,PALETTE[kv])+textSVG(x+62,y+70,'K/V '+kv,'text-anchor="middle" class="mono" style="font-size:11px"');}
 const moving=st>1&&st<5;s+=arrow(484,110,525,110,moving)+arrow(597,164,597,220,moving)+arrow(526,275,485,275,moving)+arrow(412,219,412,164,moving);
 s+=textSVG(506,348,st===5?'Merge global softmax statistics':'Q stays local · K/V blocks circulate','text-anchor="middle" class="mono" style="font-size:10px"');return s;
}
const originalConceptRenderer=renderConcept;
renderConcept=function(frame){if(frame.kind==='tp')return renderTensorParallel(frame);if(frame.kind==='sp')return renderSequenceMatrices(frame);if(frame.kind==='cp')return renderContextMatrices(frame);return originalConceptRenderer(frame);};
