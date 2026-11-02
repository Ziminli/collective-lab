/* Independent arithmetic and tensor-reference checks for every miniature lesson. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),c=vm.createContext({console,matchMedia:()=>({matches:false})});
for(const n of ['content','lessons','animations','tensor-views','semantics','zh','pipeline-plans','pipeline','model-content','model-views','operator-workbench','architecture-content'])vm.runInContext(fs.readFileSync(path.join(root,n+'.js'),'utf8'),c,{filename:n});
let checks=0,lessons=0,cells=0,profiles=new Set(),stages=new Set();
function ok(test,label){assert(test,label);checks++;}function near(a,b,label){ok(a===b||Math.abs(a-b)<1e-9,label+': '+a+' != '+b);}
const catalog=vm.runInContext(`topics.filter(t=>t.curriculum&&t.modelViews[t.variants[0]].scene==='overview')`,c);
for(const topic of catalog)for(const option of topic.variants.filter(v=>topic.modelViews[v].scene==='overview'))for(const mode of ['Training','Inference'])for(const mixer of ['delta','attention']){
 c.architectureMixer=mixer;vm.runInContext('architectureOptions.hybrid=architectureMixer',c);c.currentTopic=topic;c.currentOption=option;c.currentMode=mode;
 const frames=vm.runInContext('modelFrames(currentTopic,currentOption,currentMode)',c);lessons++;
 for(const f of frames){if(!f.story){ok(topic.modelData.kind==='public','only public interface retains topology view');continue;}profiles.add(topic.id);const s=f.story;stages.add(s.operation);const out=s.panels.find(p=>p.id===s.output);
  ok(!!out,'output exists');ok(new Set(s.panels.map(p=>p.id)).size===s.panels.length,'unique tensor IDs');
  for(const p of s.panels)ok(p.values.every(row=>row.length===p.values[0].length&&row.every(v=>typeof v==='number'&&!Number.isNaN(v))),'rectangular numeric matrix '+p.id);
  out.values.forEach((row,r)=>row.forEach((expected,col)=>{const trace=s.trace(r,col);cells++;ok(trace.length>0,'nonempty arithmetic');near(trace.at(-1).value,expected,topic.id+' '+s.title+' result');
   for(const step of trace){ok(!step.formula.includes('undefined'),'defined formula');for(const ref of step.refs||[]){const p=s.panels.find(p=>p.id===ref.p);ok(p&&p.values[ref.r]?.[ref.c]!==undefined,'valid source cell '+JSON.stringify(ref));}}
  }));
  if(s.operation==='multiply'){
   const [A,B,Y]=s.panels;ok(A.values[0].length===B.values.length,'matmul contracted axis');Y.values.forEach((row,i)=>row.forEach((v,j)=>near(v,A.values[i].reduce((a,x,k)=>a+x*B.values[k][j],0),'independent dot product')));
  }
  if(s.operation==='softmax')for(const row of out.values){near(row.reduce((a,x)=>a+x,0),1,'normalized probability');ok(row.every(x=>x>=0&&x<=1),'valid probability');}
  if(s.operation==='convolution'){assert.deepEqual(JSON.parse(JSON.stringify(out.values)),[[-1,1,-1],[3,1,0],[-1,1,5]]);checks++;}
  if(s.operation==='pool')near(out.values[0][0],3,'max pool');
  if(s.operation==='mse')near(out.values[0][0],.01,'known error');
 }
}
// GQA has two different query heads and the same KV tensor values.
c.currentTopic=catalog.find(t=>t.id==='qwen3');vm.runInContext(`architectureOptions.hybrid='delta'`,c);
const frames=vm.runInContext(`modelFrames(currentTopic,currentTopic.variants[0],'Inference')`,c),scores=frames.filter(f=>f.story?.operation==='score');
assert.deepEqual(JSON.parse(JSON.stringify(scores[0].story.panels[1].values)),JSON.parse(JSON.stringify(scores[1].story.panels[1].values)));checks++;
ok(JSON.stringify(scores[0].story.panels[0].values)!==JSON.stringify(scores[1].story.panels[0].values),'distinct query heads');
// Key-side absorption must equal expanded content scoring with non-identity weights.
c.currentTopic=catalog.find(t=>t.id==='deepseek-v3');
const mla=vm.runInContext(`modelFrames(currentTopic,currentTopic.variants[0],'Inference')`,c),latent=mla.find(f=>f.story?.panels.at(-1).id==='QL').story,content=mla.find(f=>f.story?.panels.at(-1).id==='Content0').story,cache=mla.find(f=>f.story?.panels.at(-1).id==='C').story.panels.at(-1).values;
latent.panels.at(-1).values.forEach((q,r)=>cache.forEach((k,j)=>near(q.reduce((v,x,i)=>v+x*k[i],0),content.panels.at(-1).values[r][j],'exact MLA key absorption')));
console.log(JSON.stringify({status:'passed',checks,lessons,cells,profiles:profiles.size,operations:[...stages]},null,2));
