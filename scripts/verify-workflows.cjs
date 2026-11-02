/* Validate every workflow option and drilldown, including branch and state contracts. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),c=vm.createContext({console,matchMedia:()=>({matches:false})});
for(const n of ['content','lessons','animations','tensor-views','semantics','zh','pipeline-plans','pipeline','model-content','model-views','operator-workbench','architecture-content','teaching-content','workflow-content'])vm.runInContext(fs.readFileSync(path.join(root,n+'.js'),'utf8'),c,{filename:n});
vm.runInContext(`var state={mode:'Training'};var logicState={entry:0};`,c);
let graphs=0,checks=0,variants=0,drilldowns=0;const issues=[];
function ok(value,label){assert(value,label);checks++;}
function validate(g,label){
 graphs++;ok(g.nodes.length>0,label+' has steps');const ids=new Set(g.nodes.map(n=>n.id));ok(ids.size===g.nodes.length,label+' unique IDs');
 for(const e of g.edges)ok(ids.has(e.from)&&ids.has(e.to),label+' connected endpoints');
 for(const o of [g,...g.nodes]){for(const side of ['input','output']){ok(Array.isArray(o[side])&&o[side].length,label+' '+(o.id||'boundary')+' '+side);for(const t of o[side])ok(typeof t.name==='string'&&typeof t.shape==='string'&&t.shape.length>0&&!/undefined|NaN/.test(t.shape),label+' typed tensor');}}
 for(const n of g.nodes){ok(n.label&&n.description&&n.focus,label+' inspectable '+n.id);if(!n.focus.logical)ok(n.focus.option!==undefined,label+' focus option');}
}
const catalog=vm.runInContext('topics',c);
for(const t of catalog)for(const mode of t.tags.filter(x=>['Training','Inference'].includes(x)))for(const option of t.scheduleOptions?.[mode]||t.algorithms||t.variants||['']){
 c.t=t;c.mode=mode;c.option=option;vm.runInContext('state={topic:t,mode,algorithm:option}',c);variants++;
 try{
 const g=vm.runInContext('WorkflowContent.build(t,option,mode)',c);validate(g,t.id+' '+option+' '+mode);
 for(const n of g.nodes){c.n=n;const d=vm.runInContext('WorkflowContent.detail(t,n,option,mode)',c);validate(d,t.id+' detail '+n.id);drilldowns++;
  for(const child of d.nodes.filter(n=>!n.terminal)){c.n=child;const inner=vm.runInContext('WorkflowContent.detail(t,n,option,mode)',c);validate(inner,t.id+' nested '+child.id);}
 }
 }catch(e){issues.push(t.id+' '+mode+' '+option+': '+e.stack);}
}
assert.deepEqual(issues,[]);
function graph(id,option,mode='Inference'){c.t=catalog.find(t=>t.id===id);c.option=option;c.mode=mode;vm.runInContext('state={topic:t,mode,algorithm:option}',c);return vm.runInContext('WorkflowContent.build(t,option,mode)',c);}
let g=graph('transformer','Encoder-decoder');ok(!g.edges.some(e=>e.from==='m2'&&e.to==='m3'),'encoder does not generate target input');ok(g.edges.some(e=>e.from==='m2'&&e.to==='m5'),'memory feeds cross-attention');ok(g.nodes[5].focus.option==='Cross-attention','correct cross-attention operator');ok(g.input.some(t=>t.shape==='[B,Tt]'),'target boundary');
g=graph('transformer','Encoder-only');ok(g.nodes[1].focus.option==='Bidirectional','correct encoder mask');
g=graph('deepseek-v3','Structure','Training');ok(g.nodes.filter(n=>/residual/i.test(n.label)).every(n=>!n.operator),'residual is not FFN');ok(g.input.some(t=>t.name==='targets')&&g.output.some(t=>t.name==='ℒ'),'training boundaries');
g=graph('deepseek-v3','Structure');ok(g.output.some(t=>t.name==='C_KV')&&g.output.some(t=>t.name==='K_R'),'MLA persistent state');
g=graph('diffusion','Structure','Training');ok(!g.input.some(t=>t.name==='targets'),'diffusion samples target from data and noise');ok(!g.edges.some(e=>e.type==='state'),'no inference sampling loop during diffusion training');
g=graph('op-attention','Bidirectional');ok(!g.nodes.some(n=>n.id==='cache'),'encoder attention has no autoregressive cache');
g=graph('op-attention','MHA');ok(g.edges.some(e=>e.from==='cache'&&e.to==='scores')&&!g.edges.some(e=>e.from==='k'&&e.to==='scores'),'decode scores read appended KV history');
g=graph('op-mla',catalog.find(t=>t.id==='op-mla').variants[0]);ok(g.nodes.find(n=>n.id==='content').output[0].shape==='[B,Tq,rKV]','MLA projects new tokens before append');ok(g.output.some(t=>t.name==='updated C_KV / K_R'),'MLA exposes updated cache');
console.log(JSON.stringify({status:'passed',topics:catalog.length,variants,graphs,drilldowns,checks},null,2));
