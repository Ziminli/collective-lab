/* Preserve data identity between SVG frames and animate its movement, rather than crossfading the whole picture. */
const motionReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function sceneElementKey(el,index){
 const matrix=el.closest('[data-model-matrix],[data-matrix]');
 if(matrix){const group=matrix.dataset.modelMatrix||matrix.dataset.matrix;return group+'|'+el.tagName+'|'+[...matrix.querySelectorAll(el.tagName)].indexOf(el);}
 if(el.tagName==='text')return 'text|'+el.getAttribute('x')+'|'+el.getAttribute('y');
 return el.tagName+'|'+el.getAttribute('x')+'|'+el.getAttribute('y')+'|'+index;
}
function mountAnimatedScene(host,markup,sceneKey=state.topic.id+'|'+state.algorithm+'|'+state.mode){
 const previous=host.querySelector('svg'),same=previous&&host.dataset.sceneKey===sceneKey,old=new Map();
 if(same&&!motionReduced())previous.querySelectorAll('rect,text,path,circle').forEach((el,i)=>{try{old.set(sceneElementKey(el,i),{box:el.getBBox(),fill:getComputedStyle(el).fill,text:el.textContent,opacity:getComputedStyle(el).opacity});}catch{}});
 host.innerHTML=markup;host.dataset.sceneKey=sceneKey;
 const svg=host.querySelector('svg');if(!svg)return;svg.classList.add('studio-scene');
 if(same&&!motionReduced())svg.querySelectorAll('rect,text,path,circle').forEach((el,i)=>{const before=old.get(sceneElementKey(el,i));if(!before)return;try{
  const after=el.getBBox(),dx=before.box.x-after.x,dy=before.box.y-after.y,frames=[];
  if(Math.abs(dx)+Math.abs(dy)>.1)frames.push({transform:`translate(${dx}px,${dy}px)`,opacity:.6},{transform:'translate(0,0)',opacity:1});
  else if(el.tagName==='rect'&&before.fill!==getComputedStyle(el).fill)frames.push({fill:before.fill},{fill:getComputedStyle(el).fill});
  else if(el.tagName==='text'&&before.text!==el.textContent)frames.push({opacity:.15,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'});
  if(frames.length)el.animate(frames,{duration:Math.max(180,600/state.speed),easing:'cubic-bezier(.2,.8,.2,1)'});
 }catch{}});
 if(!motionReduced()&&window.labPlaying){
  const ns='http://www.w3.org/2000/svg';for(const path of svg.querySelectorAll('.model-edge-active')){
   if(!path.getAttribute('d')||path.closest('defs'))continue;try{if(path.getTotalLength()<18)continue;}catch{continue;}
   const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','3');dot.setAttribute('class','studio-packet');const motion=document.createElementNS(ns,'animateMotion');motion.setAttribute('path',path.getAttribute('d'));motion.setAttribute('dur',1.7/state.speed+'s');motion.setAttribute('repeatCount','indefinite');dot.append(motion);svg.append(dot);
  }
 }
}
