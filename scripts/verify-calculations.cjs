/* Dependency-free numerical contracts; run with Node 18+ from any directory. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context=vm.createContext({console,matchMedia:()=>({matches:false})});
for(const name of ['content','lessons','animations','tensor-views','semantics','zh','pipeline-plans','pipeline','model-content','model-views','operator-workbench'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),context,{filename:name+'.js'});
const data=JSON.parse(vm.runInContext(`JSON.stringify({
 logical:topics.filter(t=>t.section==='communication').map(t=>({id:t.id,traces:[0,1,2,3].map(entry=>semanticFrames(t,entry))})),
 mla:mlaExample(),
 operators:topics.filter(t=>t.curriculum&&t.modelViews[t.variants[0]].op).map(t=>({id:t.id,variants:t.variants.map(v=>{const f=modelFrames(t,v,'Inference')[0],s=operatorContract(f);return{view:v,input:s.input,output:s.output,equation:s.equation,traces:s.traces};})}))
})`,context));
let checks=0;function equal(a,e,label){assert.deepEqual(a,e,label);checks++;}function close(a,e,label){assert(Math.abs(a-e)<1e-10,label+': '+a+' ≠ '+e);checks++;}
for(const {id,traces}of data.logical)for(const [entry,frames]of traces.entries()){
 equal(frames.every(f=>f.total===frames.length),true,id+' step count');
 if(['all-reduce','reduce','reduce-scatter'].includes(id)){
  let sum=0;for(const [rank,f]of frames.filter(f=>f.arithmetic).entries()){
   equal(f.arithmetic.previous,sum,id+' previous partial');const contribution=(rank+1)*(entry+1);equal(f.arithmetic.value,contribution,id+' source contribution');sum+=contribution;equal(f.arithmetic.result,sum,id+' arithmetic');
  }
  equal(sum,10*(entry+1),id+' selected sum');
  equal(frames.at(-1).outputs,id==='all-reduce'?Array(4).fill([10,20,30,40]):id==='reduce'?[[10,20,30,40],...Array(3).fill([null,null,null,null])]:[[10],[20],[30],[40]],id+' full output');
 }
 if(id==='scan')equal(frames.at(-1).outputs,[[1],[3],[6],[10]],'ordered prefixes');
 for(const f of frames.filter(f=>f.transfer)){const t=f.transfer,raw=f.outputs[t.to][t.destColumn??t.column],value=raw&&typeof raw==='object'?raw.text:raw;equal(value,t.value,id+' copy destination');}
 if(id==='all-gather')equal(frames[0].inputs.map(r=>r.length),[1,1,1,1],'compact gather inputs');
 if(id==='scatter'||id==='reduce-scatter')equal(frames.at(-1).outputs.map(r=>r.length),[1,1,1,1],'compact sharded outputs');
}
const m=data.mla;equal(m.C,[[1,3],[2,2],[3,1]],'latent down projection');equal(m.KR,[[1,1],[-1,0],[-2,-1]],'position-separated rotary keys');equal(m.cQ,[3,1],'temporary compressed query');
equal(m.heads.map(h=>h.scores),[[1,5.5,8.5],[-3,2.5,7.5]],'content + rotary scores');
for(const h of m.heads){h.scores.forEach((x,i)=>close(x,h.absorbed[i],'key absorption'));h.o.forEach((x,i)=>close(x,h.absorbedO[i],'value absorption'));close(h.weights.reduce((a,b)=>a+b,0),1,'softmax normalization');}
[2.9515459473052688,1.0484540526947312,5.986505258653649,1.006747370673175].forEach((x,i)=>close(m.output[i],x,'independent output fixture'));
equal(m.compactPerToken,4,'toy compact cache');equal(m.expandedPerToken,12,'naive expanded cache');
for(const op of data.operators)for(const v of op.variants){equal(Boolean(v.input&&v.output&&v.equation&&v.traces.length),true,op.id+' '+v.view+' numerical contract');for(const trace of v.traces){if(trace.sum){let sum=trace.terms.reduce((s,t)=>s+t.value,0);if(trace.denominator)sum/=trace.denominator;close(sum,trace.result,'dot-product trace result');}else equal(trace.terms.at(-1).value,trace.result,'step trace result');}}
console.log(`${checks} numerical contract assertions passed: 12 collectives, ${data.operators.length} operators, and both MLA heads.`);
