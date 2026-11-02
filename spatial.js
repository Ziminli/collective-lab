/* A shared, disposable Three.js renderer. All numeric state comes from lesson frames. */
const SPATIAL_COLORS=[0x68b8ed,0xb096eb,0xf1b25b,0x63c9b0];
function spatialSupported(t){return t.section==='communication'||['tensor-parallel','sequence-parallel','context-parallel','hybrid-parallel','zero','fsdp'].includes(t.id);}
class TensorSpace{
 constructor(){this.renderer=null;this.scene=null;this.camera=null;this.host=null;this.root=null;this.meshes=new Map();this.routes=[];this.labels=[];this.raf=0;this.angle=.57;this.elevation=.68;this.distance=12;this.selected=null;this.key='';this.frame=null;this.dark=false;this.resize=null;}
 mount(host){
  if(this.host===host&&this.renderer)return true;this.detach();this.host=host;
  if(!window.THREE)return false;
  try{if(!this.renderer){this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor(0,0);}}
  catch{this.renderer=null;return false;}
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(36,1,.1,100);this.target=new THREE.Vector3(0,.4,0);this.root=new THREE.Group();this.scene.add(this.root);
  this.scene.add(new THREE.HemisphereLight(0xffffff,0x78889d,1.7));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(3,8,5);this.scene.add(light);
  const canvas=this.renderer.domElement;canvas.className='tensor-space-canvas';canvas.setAttribute('aria-label',tr(MT('Interactive GPU and tensor view. Drag to rotate; use zoom buttons.','可交互 GPU 与张量视图；拖动旋转，使用按钮缩放。')));canvas.setAttribute('role','img');host.prepend(canvas);this.bind(canvas);
  this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(host);this.fit();this.tick();return true;
 }
 bind(canvas){
  let drag=null;
  canvas.onpointerdown=ev=>{drag={x:ev.clientX,y:ev.clientY,startX:ev.clientX,startY:ev.clientY};canvas.setPointerCapture(ev.pointerId);};
  canvas.onpointermove=ev=>{if(!drag)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;this.angle-=dx*.006;this.elevation=Math.max(.28,Math.min(1.25,this.elevation+dy*.005));drag.x=ev.clientX;drag.y=ev.clientY;};
  canvas.onpointerup=ev=>{if(drag&&Math.hypot(ev.clientX-drag.startX,ev.clientY-drag.startY)<6)this.pick(ev);drag=null;};canvas.onpointercancel=()=>drag=null;
 }
 detach(){cancelAnimationFrame(this.raf);this.resize?.disconnect();this.resize=null;if(this.root)this.disposeRoot();this.renderer?.domElement.remove();this.host=null;this.key='';this.rendered='';this.fitAspect=null;}
 disposeRoot(){this.root.traverse(o=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose();}});this.root.clear();this.meshes.clear();this.labels=[];this.routes=[];}
 fit(){if(!this.host||!this.renderer)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(w<1||h<1)return;const aspect=w/h,framing=state.topic.id==='tensor-parallel'?1.25:1.44;
  if(this.fitAspect&&Math.abs(aspect-this.fitAspect)>.001)this.distance=Math.max(7,Math.min(36,this.distance*Math.max(1,framing/aspect)/Math.max(1,framing/this.fitAspect)));this.fitAspect=aspect;
  this.labelFactor=Math.max(1,Math.min(1.6,1.1/aspect));for(const label of this.labels)if(label.userData.baseScale)label.scale.copy(label.userData.baseScale).multiplyScalar(this.labelFactor);
  this.renderer.setSize(w,h,false);this.camera.aspect=aspect;this.camera.updateProjectionMatrix();this.rendered='';}

 label(text,x,y,z,scale=1){
  const words=tr(text),c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font='600 52px system-ui, sans-serif';c.width=Math.min(2048,Math.ceil(ctx.measureText(words).width)+32);c.height=88;ctx.font='600 52px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=this.dark?'#e1e9f7':'#24374d';ctx.fillText(words,c.width/2,44,c.width-16);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.position.set(x,y,z);const height=.48*Math.max(.82,scale),width=height*c.width/c.height;sprite.scale.set(Math.min(4.2,width),height,1);sprite.userData.baseScale=sprite.scale.clone();sprite.scale.multiplyScalar(this.labelFactor||1);sprite.renderOrder=3;this.root.add(sprite);this.labels.push(sprite);return sprite;
 }
 box(id,x,y,z,w,h,d,color,info,opacity=1){
  const material=new THREE.MeshStandardMaterial({color,metalness:.08,roughness:.46,transparent:true,opacity});const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.userData={id,info,targetY:y,baseOpacity:opacity};
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:this.dark?0xc5d6ef:0x395574,transparent:true,opacity:.18}));mesh.add(edge);this.root.add(mesh);this.meshes.set(id,mesh);return mesh;
 }
 plate(r,x,z,y=0,labelOffset=1.37){const plate=this.box('rank'+r,x,y-.17,z,3.25,.18,2.05,this.dark?0x263244:0xe1e8f2,MT('Rank '+r+' owns the tensors above this platform.','rank '+r+' 持有此平台上方的张量。'));this.label('RANK '+r,x,y+.04,z+labelOffset,.7);return plate;}
 grid(id,values,x,y,z,color,info,cw=.38,owner=null){const rows=values.length,cols=values[0]?.length||0;values.forEach((row,r)=>row.forEach((raw,c)=>{const val=raw&&typeof raw==='object'?raw.text:raw,empty=val===null||val===undefined,cc=raw&&typeof raw==='object'?SPATIAL_COLORS[raw.color%4]:owner?SPATIAL_COLORS[owner(r,c)]:color;
   const px=x+(c-(cols-1)/2)*cw,pz=z+(r-(rows-1)/2)*cw;
   this.box(id+'-'+r+'-'+c,px,y,pz,cw*.88,.14,cw*.88,empty?(this.dark?0x354154:0xe3e8ef):cc,info+' · ['+r+','+c+'] = '+(empty?'∅':val),empty?.22:1);
   if(!empty&&val!=='')this.label(String(val),px,y+.25,pz,.30);
  }));}
 route(a,b,from,to,color=0x82a3d9){const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(...a),new THREE.Vector3((a[0]+b[0])/2,Math.max(a[1],b[1])+1.1,(a[2]+b[2])/2),new THREE.Vector3(...b));
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(44)),new THREE.LineBasicMaterial({color,transparent:true,opacity:.65}));this.root.add(line);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.075,.22,7),new THREE.MeshBasicMaterial({color}));cone.position.copy(curve.getPoint(.91));cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),curve.getTangent(.91).normalize());this.root.add(cone);
  const packet=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),new THREE.MeshBasicMaterial({color}));this.root.add(packet);this.routes.push({curve,packet});
 }
 update(f,topic,force=false){
  if(!this.host||!this.root)return;const key=topic.id+'|'+state.algorithm+'|'+state.mode+'|'+state.frame+'|'+document.documentElement.lang+'|'+document.documentElement.dataset.theme;
  this.frame=f;this.dark=document.documentElement.dataset.theme==='dark';if(key===this.key&&!force)return;this.key=key;
  const old=new Map([...this.meshes].map(([id,m])=>[id,{pos:m.position.clone(),color:m.material.color.clone()}]));this.disposeRoot();
  this.target.set(0,-.35,0);
  if(f.kind==='ranks')this.ranks(f,topic);
  else if(topic.id==='tensor-parallel')this.tp(f);
  else if(topic.id==='sequence-parallel'||topic.id==='context-parallel')this.sequence(f,topic.id==='context-parallel');
  else if(topic.id==='hybrid-parallel')this.hybrid(f);
  else this.memory(f,topic);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.started=performance.now();this.tween=!reduced;
  for(const [id,m]of this.meshes){const previous=old.get(id);m.userData.start=previous?.pos||m.position.clone().add(new THREE.Vector3(0,.32,0));m.userData.end=m.position.clone();m.userData.startColor=previous?.color||m.material.color.clone();m.userData.endColor=m.material.color.clone();}
  const note=document.querySelector('#spatial-note');if(note)note.textContent=this.note;this.selected=null;this.updateAccessibleState();
  const inspector=document.querySelector('#spatial-inspector');if(inspector)inspector.textContent=tr(MT('Select a tensor tile to inspect its ownership and value.','选择张量色块，查看其所有权与数值。'));
 }
 ranks(f,t){const pos=[[-2.25,0,-1.55],[2.25,0,-1.55],[2.25,0,1.55],[-2.25,0,1.55]];
  for(let r=0;r<4;r++){const [x,y,z]=pos[r];this.plate(r,x,z);const row=f.values[r]||[];this.grid('r'+r,[row],x,.28,z,SPATIAL_COLORS[r],MT('Local buffer on rank '+r,'rank '+r+' 的本地缓冲'),.58,(_,c)=>{const raw=row[c];return raw&&typeof raw==='object'?raw.color:c%4;});}
  for(const e of f.edges||[]){const a=pos[e.from],b=pos[e.to];this.route([a[0],.6,a[2]],[b[0],.6,b[2]],e.from,e.to);}
  this.note=MT('Platforms are ranks. Tile color identifies a tensor shard; numbers are the current step’s buffer values. Arrows show this round’s transfers.','平台代表 rank，色块代表张量分片，数值为当前步骤缓冲值；箭头为本轮传输。');
 }
 tp(f){const col=f.variant==='Column-parallel',pair=f.variant==='Column → row MLP',st=f.stage,back=st===(pair?5:4);const coords=[-2.2,2.2];
  for(let r=0;r<2;r++){const x=coords[r];this.plate(r,x,.15,0,2.2);const weight=col||pair?(r===0?[[1],[2]]:[[3],[4]]):(r===0?[[1,3]]:[[2,4]]);
   this.grid('weight'+r,weight,x-(pair?.7:0),.32,-.10,SPATIAL_COLORS[r],MT('Weight shard W'+r,'权重分片 W'+r),.62);this.label(MT((pair?'W₁ col ':col?'W · column ':'W · row ')+r,(pair?'W₁ 列 ':col?'W · 列 ':'W · 行 ')+r),x-(pair?.7:0),1.3,-.65,.66);if(pair){this.grid('w2'+r,[[1]],x+.75,.32,0,SPATIAL_COLORS[r],'W₂ row '+r,.45);this.label(MT('W₂ row '+r,'W₂ 行 '+r),x+.75,1.05,.3,.5);}
   const input=back?(col||pair?[[1]]:[[1,1]]):(col||pair?[[1,2]]:[[r+1]]);this.grid('x'+r,input,x,.27,1.1,SPATIAL_COLORS[r],back?'dY':'X',.42);this.label(back?'dY':'X',x,.25,1.68,.5);
   let output=st===0?[['?','?']]:back?(col||pair?(r===0?[[1,2]]:[[3,4]]):[[r===0?4:6]]):pair?[[st>=4?16:r===0?5:11]]:col?[[r===0?5:11]]:st>=2?[[5,11]]:r===0?[[1,3]]:[[4,8]];
   if(col&&st===3&&!back)output=[[5,11]];
   this.grid('y'+r,output,x,.3,-1.4,SPATIAL_COLORS[r],back?'dX':pair?'hidden / output':'local output',.48);this.label(back?(col||pair?MT('partial dX','部分 dX'):MT('local dX','本地 dX')):pair&&st<4?'H':!col&&!pair&&st<2?MT('partial Y','部分 Y'):'Y',x,.4,-2,.5);
  }
  const sum=pair&&st>=4||!col&&!pair&&st>=2&&!back||col&&back,copy=col&&st===3&&!back;
  if(sum||copy){this.route([-1.1,.85,-.1],[1.1,.85,-.1],0,1);this.route([1.1,1,-.5],[-1.1,1,-.5],1,0);this.label(copy?'AllGather · concatenate':back?'Σ dX = [4, 6]':'AllReduce · SUM',0,2.2,0,.75);}
  this.note=back?MT('Backward view: weight ownership is fixed; the displayed gradient layouts follow the selected decomposition.','反向视图：权重所有权固定；图示梯度布局遵循所选分解。'):pair?MT('Column W₁ creates hidden shards. Row W₂ consumes them locally; the final scalar output is summed. Both W₁ and W₂ shards are shown.','列分片 W₁ 生成隐藏分片，行分片 W₂ 在本地使用它们，最后标量输出求和；图中展示 W₁、W₂ 分片。'):col?MT('Columns select different output features. Their results concatenate; they are not partial sums.','列分片选择不同输出特征，结果应拼接，而非求部分和。'):MT('Rows split the contracted input dimension. Each rank contributes to the same output positions: sum the partials.','行分片拆分收缩的输入维度；各 rank 贡献给相同输出位置，应对部分结果求和。');
 }
 sequence(f,context){const pos=[[-2.25,-1.5],[2.25,-1.5],[2.25,1.6],[-2.25,1.6]],st=f.stage,full=!context&&(st===1||st===2),visit=Math.min(Math.max(st,1),4)-1;
  pos.forEach(([x,z],r)=>{this.plate(r,x,z);const owner=context?(r-visit+4)%4:r,rows=full?8:2;
   this.grid('activation'+r,Array.from({length:rows},()=>Array(4).fill('')),x,.3,z,SPATIAL_COLORS[owner],context?'K/V '+owner:'activation rank '+r,.23,full?(row)=>Math.floor(row/2):()=>owner);
   this.label(context?'Q'+r+' + KV'+owner:MT(rows+' tokens × 4 features',rows+' token × 4 特征'),x,1,z,.68);
  });
  if(context&&st>1&&st<5)for(let r=0;r<4;r++)this.route([pos[r][0],.65,pos[r][1]],[pos[(r+1)%4][0],.65,pos[(r+1)%4][1]],r,(r+1)%4);
  this.note=context?MT('Query positions stay on their ranks. Colored K/V token blocks circulate; the 2D view shows causal masks and softmax merging.','查询位置留在各 rank，彩色 K/V token 块循环移动；二维视图展示因果掩码及 softmax 合并。'):MT('Rows are token positions; columns are hidden features. AllGather copies token rows; ReduceScatter reduces and restores row ownership.','行是 token 位置，列是隐藏特征；AllGather 复制 token 行，ReduceScatter 归约并恢复行所有权。');
 }
 hybrid(f){this.target.set(0,.65,0);for(let dp=0;dp<2;dp++)for(let pp=0;pp<2;pp++)for(let tp=0;tp<2;tp++){
  const r=dp*4+pp*2+tp,x=(pp-.5)*4.2,y=tp*1.3,z=(dp-.5)*3.4;this.box('gpu'+r,x,y,z,1.55,.35,.9,SPATIAL_COLORS[dp],MT('DP '+dp+' · PP '+pp+' · TP '+tp,'DP '+dp+' · PP '+pp+' · TP '+tp));this.label('R'+r+'  ('+dp+','+pp+','+tp+')',x,y+.55,z,.62);
  if(f.stage===1&&tp===0)this.route([x,y+.3,z],[x,y+1.6,z],r,r+1);if(f.stage===2&&pp===0)this.route([x,y+.3,z],[x+4.2,y+.3,z],r,r+2);if(f.stage===3&&dp===0)this.route([x,y+.3,z],[x,y+.3,z+3.4],r,r+4);
 }this.note=MT('Coordinates are (DP, PP, TP). Each highlighted edge joins ranks in one process group; different axes mean different groups.','坐标为 (DP, PP, TP)；高亮边连接同一通信组中的 rank，不同轴表示不同组。');}
 memory(f,t){const stage=t.id==='zero'?Number(state.algorithm.slice(-1)):3,gather=t.id==='fsdp'&&[1,2,4,5].includes(f.stage),pos=[[-2.25,-1.5],[2.25,-1.5],[2.25,1.6],[-2.25,1.6]];
  pos.forEach(([x,z],r)=>{this.plate(r,x,z);['P','G','O'].forEach((name,j)=>{const shard=j===0?stage===3&&!gather:j===1?stage>=2:stage>=1;const ids=shard?[r]:[0,1,2,3];this.grid(name+r,[ids.map(i=>({text:name+i,color:i}))],x,.26+j*.34,z,SPATIAL_COLORS[r],name==='P'?'parameters':name==='G'?'gradients':'optimizer',.5);});});
  this.note=t.id==='zero'?MT('Three stacked rows: P = parameters, G = gradients, O = optimizer. This view shows persistent allocation, not peak or transient buffers.','三层色块：P 参数、G 梯度、O 优化器；本视图展示常驻分配，不代表峰值或临时缓冲。'):MT('P = parameters, G = gradients, O = optimizer. Full parameter rows appear only in the illustrated gather/compute phases. Activations are omitted.','P 参数、G 梯度、O 优化器；完整参数行只在图示收集 / 计算阶段出现，激活未画出。');
 }
 updateAccessibleState(){
  const host=document.querySelector('#spatial-data');if(!host)return;
  const entries=[...this.meshes.values()].filter(m=>!m.userData.id.startsWith('rank')).map(m=>m.userData.info);
  host.innerHTML=entries.map(info=>'<li>'+esc(tr(info))+'</li>').join('');
 }
 pick(ev){const rect=this.renderer.domElement.getBoundingClientRect(),mouse=new THREE.Vector2((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,this.camera);const hit=ray.intersectObjects([...this.meshes.values()],false)[0];if(!hit)return;
  const inspector=document.querySelector('#spatial-inspector');if(inspector){inspector.textContent=tr(hit.object.userData.info);inspector.classList.add('has-selection');}
  if(this.selected)this.selected.material.emissive.setHex(0);this.selected=hit.object;this.selected.material.emissive.setHex(0x173e65);
 }
 tick(){if(!this.host||!this.renderer)return;const now=performance.now(),p=this.tween?Math.min(1,(now-this.started)/650):1,e=1-(1-p)**3;
  for(const m of this.meshes.values()){const d=m.userData;if(d.start){m.position.lerpVectors(d.start,d.end,e);m.material.color.copy(d.startColor).lerp(d.endColor,e);}}
  const moving=state.playing&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches;for(let i=0;i<this.routes.length;i++){const r=this.routes[i];r.packet.visible=moving;if(moving)r.packet.position.copy(r.curve.getPoint(((now*.00045*state.speed+i*.19)%1)));}
  const radius=this.distance,ce=Math.cos(this.elevation);this.camera.position.set(Math.sin(this.angle)*radius*ce,Math.sin(this.elevation)*radius,Math.cos(this.angle)*radius*ce);this.camera.lookAt(this.target);
  const signature=[this.key,this.angle,this.elevation,this.distance,this.host.clientWidth,this.host.clientHeight,this.selected?.uuid].join('|');if(!document.hidden&&this.host.offsetParent!==null&&(moving||p<1||signature!==this.rendered)){this.renderer.render(this.scene,this.camera);this.rendered=signature;}this.raf=requestAnimationFrame(()=>this.tick());
 }
 reset(){this.angle=.57;this.elevation=.68;const framing=state.topic.id==='tensor-parallel'?1.25:1.44;this.distance=12*Math.max(1,framing/(this.fitAspect||framing));this.rendered='';}
 zoom(delta){this.distance=Math.max(7,Math.min(40,this.distance+delta));}
}
const tensorSpace=new TensorSpace();
