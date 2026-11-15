"use strict";
/* Mission 3: one controlled gap, four real specimens, a real circuit graph.
 * A material result is recorded only with both contacts touching and the
 * unchanged reference circuit. Bad wiring is never classified as insulation. */
(function(){
 const samples=[
  {id:"clip",name:"鉄のクリップ",shortName:"クリップ",conductive:true,x:64,y:70},
  {id:"aluminum",name:"アルミの板",shortName:"アルミ",conductive:true,x:43,y:70},
  {id:"wood",name:"かわいた木",shortName:"木",conductive:false,x:20,y:70},
  {id:"plastic",name:"プラスチック",shortName:"プラスチック",conductive:false,x:85,y:70}
 ];
 const points={P:[42,151],N:[178,151],L:[268,152],R:[313,210],A:[120,65],B:[240,65]};
 const reference=[["P","A"],["B","L"],["R","N"]];
 const sample=id=>samples.find(x=>x.id===id);
 const edge=(a,b)=>[a,b].sort().join("-");
 const signature=w=>w.map(p=>edge(...p)).sort().join("|");
 const validWires=raw=>{
  const seen=new Set();return (Array.isArray(raw)?raw:[]).filter(p=>{
   if(!Array.isArray(p)||p.length!==2||!points[p[0]]||!points[p[1]]||p[0]===p[1])return false;
   const k=edge(...p);if(seen.has(k))return false;seen.add(k);return true;
  }).slice(0,15).map(p=>p.slice());
 };
 const initial=()=>({version:1,inspected:false,found:[],selected:null,guesses:{},installed:null,
  contact:"none",wires:reference.map(p=>p.slice()),tests:{},log:[],reason:null,notice:"",wireSelected:null});
 function evaluate(s){
  const wires=validWires(s.wires),g=Object.fromEntries(Object.keys(points).map(k=>[k,[]]));
  for(const [a,b] of wires){g[a].push(b);g[b].push(a);}
  if(s.contact==="both"&&sample(s.installed)?.conductive){g.A.push("B");g.B.push("A");}
  function path(bulb){
   const seen=new Set(["P"]),todo=["P"];
   while(todo.length){const n=todo.pop();let next=g[n];if(bulb&&n==="L")next=[...next,"R"];if(bulb&&n==="R")next=[...next,"L"];
    for(const k of next)if(!seen.has(k)){seen.add(k);todo.push(k);}
   }return seen.has("N");
  }
  const short=path(false);return {short,lit:!short&&path(true)};
 }
 function normalize(raw){
  const s=initial();if(!raw||raw.version!==1)return s;
  s.inspected=raw.inspected===true;
  s.found=[...new Set(Array.isArray(raw.found)?raw.found:[])].filter(id=>sample(id));
  s.selected=s.found.includes(raw.selected)?raw.selected:null;
  for(const id of s.found)if(["lit","dark"].includes(raw.guesses?.[id]))s.guesses[id]=raw.guesses[id];
  s.installed=s.found.includes(raw.installed)?raw.installed:null;
  s.contact=s.installed&&["both","left","right"].includes(raw.contact)?raw.contact:"none";
  s.wires=validWires(raw.wires);
  for(const m of samples){const t=raw.tests?.[m.id];
   if(t&&["lit","dark"].includes(t.guess)&&t.actual===(m.conductive?"lit":"dark"))s.tests[m.id]={guess:t.guess,actual:t.actual};
  }
  s.log=(Array.isArray(raw.log)?raw.log:[]).filter(t=>sample(t?.id)&&["lit","dark"].includes(t.guess)&&t.actual===(sample(t.id).conductive?"lit":"dark")).slice(-12).map(t=>({id:t.id,guess:t.guess,actual:t.actual}));
  s.reason=["metal","shiny","one"].includes(raw.reason)?raw.reason:null;
  return s;
 }
 const compared=s=>samples.some(m=>m.conductive&&s.tests[m.id]?.actual==="lit")&&samples.some(m=>!m.conductive&&s.tests[m.id]?.actual==="dark");
 const canFinish=s=>s.inspected&&compared(s)&&s.contact==="both"&&!!sample(s.installed)?.conductive&&signature(s.wires)===signature(reference)&&evaluate(s).lit&&s.reason==="metal";
 function record(s){
  const m=sample(s.installed),guess=s.guesses[s.installed],e=evaluate(s);
  if(!m||!guess||s.contact!=="both"||signature(s.wires)!==signature(reference)||e.short)return;
  const t={id:m.id,guess,actual:e.lit?"lit":"dark"};s.tests[m.id]={guess,actual:t.actual};
  if(!s.log.some(x=>x.id===t.id&&x.guess===t.guess&&x.actual===t.actual))s.log.push(t);
  s.log=s.log.slice(-12);
 }
 function act(raw,a){
  const s=normalize(raw);s.notice="";s.wireSelected=raw.wireSelected||null;
  if(a.type==="inspect"){s.inspected=true;s.notice="ここが きれている！ なにかを はさめそう。";}
  if(a.type==="find"&&s.inspected&&sample(a.id)){
   if(!s.found.includes(a.id))s.found.push(a.id);s.selected=a.id;s.notice=sample(a.id).name+"を みつけた！";
  }
  if(a.type==="select"&&s.found.includes(a.id)){s.selected=a.id;s.notice="つくかな？ よそうして はこぼう。";}
  if(a.type==="guess"&&s.selected&&["lit","dark"].includes(a.value))s.guesses[s.selected]=a.value;
  if(a.type==="place"&&s.inspected&&s.found.includes(a.id)){
   if(!s.guesses[a.id]){s.selected=a.id;s.notice="つく？ つかない？ よそうを えらぼう。";return s;}
   s.installed=a.id;s.contact=["both","left","right"].includes(a.contact)?a.contact:"none";s.selected=a.id;s.reason=null;
   record(s);const e=evaluate(s);
   s.notice=e.short?"ショート！ せんを はずそう。":s.contact!=="both"?"かたほうが はなれている。2つの まるに 合わせよう。":e.lit?"ついた！ ほかの 材料は どうかな？":"つかない。ほかの 材料と くらべよう。";
  }
  if(a.type==="remove"){s.installed=null;s.contact="none";s.reason=null;s.notice="はずした。べつの 材料も はめてみよう。";}
  if(a.type==="wire"&&points[a.from]&&points[a.to]&&a.from!==a.to){
   const k=edge(a.from,a.to),i=s.wires.findIndex(p=>edge(...p)===k);
   if(i<0)s.wires.push([a.from,a.to]);else s.wires.splice(i,1);
   s.reason=null;s.wireSelected=null;record(s);
  }
  if(a.type==="cut"){s.wires=s.wires.filter(p=>edge(...p)!==a.key);s.reason=null;s.wireSelected=null;}
  if(a.type==="reason"&&compared(s)&&evaluate(s).lit){
   s.reason=["metal","shiny","one"].includes(a.id)?a.id:null;
   const dark=samples.find(m=>!m.conductive&&s.tests[m.id])?.shortName||"ほかの 材料";
   s.notice=s.reason==="metal"?"金ぞくで 2つの まるを つなぐと、電気の 道が できた！":"メモを 見よう。"+dark+"を はめたときは、ついたかな？";
  }
  return s;
 }
 window.AkariMaterials={samples,points,reference,sample,edge,signature,initial,normalize,evaluate,compared,canFinish,act};
})();
