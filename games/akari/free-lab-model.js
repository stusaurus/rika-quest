"use strict";
/* Independent elementary-circuit sandbox model. 1.5 V cells, 8-ohm lamps and
   finite battery internal resistance. This is an educational approximation, not
   a substitute for laboratory instruments or an instruction to test short circuits. */
(function(){
 const limits={battery:2,bulb:3,switch:1,sample:2};
 const materials={
  iron:{name:"鉄のクリップ",conductive:true},
  foil:{name:"アルミはく",conductive:true},
  wood:{name:"木の板",conductive:false},
  plastic:{name:"プラスチック",conductive:false}
 };
 const defaults=[
  {id:"b1",type:"battery",x:23,y:28},
  {id:"l1",type:"bulb",x:75,y:28}
 ];
 const terminals={battery:["P","N"],bulb:["L","R"],switch:["A","B"],sample:["A","B"]};
 const defaultState=()=>({nodes:defaults.map(n=>({...n})),wires:[],next:2});
 const port=id=>typeof id==="string"&&/^[blsm]\d+:[A-Z]$/.test(id);
 function sanitize(raw){
  if(!raw||typeof raw!=="object")return defaultState();
  const nodes=[],counts={battery:0,bulb:0,switch:0},seen=new Set();
  for(const n of Array.isArray(raw.nodes)?raw.nodes:[]){
   if(!n||!Object.hasOwn(limits,n.type)||counts[n.type]>=limits[n.type])continue;
   if(typeof n.id!=="string"||!(/^[blsm]\d{1,4}$/).test(n.id)||seen.has(n.id))continue;
   if(n.type==="sample"&&!Object.hasOwn(materials,n.material))continue;
   seen.add(n.id);counts[n.type]++;
   nodes.push({id:n.id,type:n.type,x:Math.min(88,Math.max(12,Number(n.x)||50)),
    y:Math.min(86,Math.max(15,Number(n.y)||50)),...(n.type==="switch"?{on:!!n.on}:n.type==="sample"?{material:n.material}:{})});
  }
  if(!nodes.length)return defaultState();
  const available=new Set(nodes.flatMap(n=>terminals[n.type].map(t=>n.id+":"+t)));
  const edges=new Set(),wires=[];
  for(const w of Array.isArray(raw.wires)?raw.wires:[]){
   if(!w||!port(w.from)||!port(w.to)||w.from===w.to||!available.has(w.from)||!available.has(w.to))continue;
   const key=[w.from,w.to].sort().join("|");
   if(edges.has(key)||wires.length>=25)continue;
   edges.add(key);
   const points=Array.isArray(w.points)?w.points.slice(0,160).filter(p=>
    Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=0&&v<=1000)):[];
   wires.push({from:w.from,to:w.to,points});
  }
  const maxIndex=nodes.reduce((k,n)=>Math.max(k,Number(n.id.slice(1))),1);
  return {nodes,wires,next:Math.max(maxIndex+1,Number(raw.next)||2)};
 }
 function simulate(data){
  const s=sanitize(data),ports=s.nodes.flatMap(n=>terminals[n.type].map(t=>n.id+":"+t));
  const parent=Object.fromEntries(ports.map(p=>[p,p]));
  const find=a=>{let x=a;while(parent[x]!==x)x=parent[x];while(parent[a]!==a){const q=parent[a];parent[a]=x;a=q;}return x;};
  const union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};
  for(const w of s.wires)union(w.from,w.to);
  for(const n of s.nodes)if(n.type==="switch"&&n.on)union(n.id+":A",n.id+":B");
  for(const n of s.nodes)if(n.type==="sample"&&materials[n.material]?.conductive)union(n.id+":A",n.id+":B");
  const groups=[...new Set(ports.map(find))],idx=Object.fromEntries(groups.map((g,i)=>[g,i]));
  const group=p=>idx[find(p)];
  const resistors=[],sources=[];
  for(const n of s.nodes){
   if(n.type==="bulb")resistors.push({a:group(n.id+":L"),b:group(n.id+":R"),r:8,id:n.id});
   if(n.type==="battery")sources.push({a:group(n.id+":P"),b:group(n.id+":N"),r:.45,e:1.5,id:n.id});
  }
  // Group disconnected electrical islands so floating nodes are mathematically safe.
  const linked=groups.map((_,i)=>[i]);
  const addEdge=(a,b)=>{if(a!==b){linked[a].push(b);linked[b].push(a);}};
  for(const x of [...resistors,...sources])addEdge(x.a,x.b);
  const visited=new Set(),potentials=groups.map(()=>0);
  for(let k=0;k<groups.length;k++){
   if(visited.has(k))continue;
   const island=[k];visited.add(k);
   for(let i=0;i<island.length;i++)for(const other of linked[island[i]])
    if(!visited.has(other)){visited.add(other);island.push(other);}
   if(island.length===1)continue;
   const live=island.slice(1),lookup=Object.fromEntries(live.map((a,i)=>[a,i])),count=live.length;
   const matrix=Array.from({length:count},()=>Array(count+1).fill(0));
   for(const x of [...resistors,...sources]){
    if(x.a===x.b||!island.includes(x.a))continue;
    const g=1/x.r,ai=lookup[x.a],bi=lookup[x.b];
    if(ai!==undefined){matrix[ai][ai]+=g;if(bi!==undefined)matrix[ai][bi]-=g;}
    if(bi!==undefined){matrix[bi][bi]+=g;if(ai!==undefined)matrix[bi][ai]-=g;}
    if(x.e){const value=x.e/x.r;if(ai!==undefined)matrix[ai][count]+=value;if(bi!==undefined)matrix[bi][count]-=value;}
   }
   // Gaussian elimination with pivoting for small (<= 12-node) circuits.
   for(let i=0;i<count;i++){
    let pivot=i;for(let j=i+1;j<count;j++)if(Math.abs(matrix[j][i])>Math.abs(matrix[pivot][i]))pivot=j;
    if(Math.abs(matrix[pivot][i])<1e-11)continue;
    [matrix[i],matrix[pivot]]=[matrix[pivot],matrix[i]];
    const val=matrix[i][i];for(let c=i;c<=count;c++)matrix[i][c]/=val;
    for(let j=0;j<count;j++)if(j!==i){const factor=matrix[j][i];for(let c=i;c<=count;c++)matrix[j][c]-=factor*matrix[i][c];}
   }
   for(let i=0;i<count;i++)potentials[live[i]]=matrix[i][count];
  }
  const base=(1.5/(8+.45))**2*8;
  const bulbs=resistors.map(x=>{
   const delta=potentials[x.a]-potentials[x.b],ratio=(delta*delta/x.r)/base;
   return {id:x.id,ratio:Math.round(ratio*100)/100,
    level:ratio<.06?"off":ratio<.52?"dim":ratio<1.65?"normal":"bright"};
  });
  // Short means a near-zero load path bypasses a cell, or excessive cell current.
  const short=sources.some(x=>x.a===x.b||Math.abs((x.e-(potentials[x.a]-potentials[x.b]))/x.r)>1.25);
  const high=bulbs.some(x=>x.ratio>1.8);
  if(short)bulbs.forEach(x=>{x.level="off";x.ratio=0;});
  return {short,bulbs,litCount:bulbs.filter(x=>x.level!=="off").length,
   high:high&&!short,hasSwitch:s.nodes.some(x=>x.type==="switch")};
 }
 window.AkariFreeLabModel={limits,materials,terminals,defaultState,sanitize,simulate};
})();