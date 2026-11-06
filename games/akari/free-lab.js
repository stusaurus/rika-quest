"use strict";
/* A separate hands-on workshop: move equipment, add parts, wire by finger,
   cut any wire by crossing it. Does not modify story missions or star progress. */
(function(){
 const M=window.AkariFreeLabModel;
 if(!M)return;
 const key="rika-akari-free-lab-v1",noteKey="rika-akari-free-lab-notes-v1",
  labels={battery:"かんでんち",bulb:"まめでんきゅう",switch:"スイッチ",sample:"ざいりょう"};
 let state=M.defaultState(),chosen=null,open=false,openedDrawer="",gesture=null,suppressClick=0,rendered=null,records=[];
 try{const saved=localStorage.getItem(noteKey);if(saved){const parsed=JSON.parse(saved);
  if(Array.isArray(parsed))records=parsed.slice(-12).filter(x=>x&&typeof x==="object");
 }}catch{}
 try{const saved=localStorage.getItem(key);if(saved)state=M.sanitize(JSON.parse(saved));}catch{}
 const get=id=>document.getElementById(id);
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
 const showRecords=()=>{
  const target=get("freeLabRecordRows");if(!target)return;
  target.textContent="";
  [...records].reverse().forEach((entry,i)=>{
   const row=document.createElement("p");
   row.textContent=(records.length-i)+"｜でんち"+entry.cells+"・でんきゅう"+entry.bulbs+
    " → "+(entry.short?"⚠ ショート":entry.lit+"こ ついた");
   target.append(row);
  });
 };
 const record=()=>{
  const result=M.simulate(state);
  records.push({cells:state.nodes.filter(n=>n.type==="battery").length,
   bulbs:state.nodes.filter(n=>n.type==="bulb").length,
   lit:result.litCount,short:result.short});
  records=records.slice(-12);
  try{localStorage.setItem(noteKey,JSON.stringify(records));}catch{}
  showRecords();
 };
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const center=(rect)=>({x:rect.left+rect.width/2,y:rect.top+rect.height/2});
 const board=()=>get("freeLabBoard");
 const point=(clientX,clientY)=>{
  const r=board().getBoundingClientRect();
  return [Math.round(clamp((clientX-r.left)/r.width*1000,0,1000)),
    Math.round(clamp((clientY-r.top)/r.height*1000,0,1000))];
 };
 const screen=(x,y)=>{
  const r=board().getBoundingClientRect();return {x:r.left+x*r.width/1000,y:r.top+y*r.height/1000};
 };
 const portPos=port=>{
  const el=board()?.querySelector('[data-free-port="'+port+'"]');
  if(!el)return null;
  const p=center(el.getBoundingClientRect());return point(p.x,p.y);
 };
 const dOf=points=>points.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" ");
 const duplicate=(a,b)=>state.wires.some(w=>[w.from,w.to].sort().join("|")===[a,b].sort().join("|"));
 const usablePoints=points=>Array.isArray(points)&&points.length>1;
 const nearBody=(points,from,to)=>{
  const ends=new Set([from.split(":")[0],to.split(":")[0]]);
  const bodies=[...board().querySelectorAll(".free-device")]
    .filter(x=>!ends.has(x.dataset.freeNode)).map(x=>x.querySelector(".free-move"));
  const rects=bodies.map(x=>x.getBoundingClientRect());
  const r=board().getBoundingClientRect();
  const inside=p=>rects.some(b=>{
   const x=r.left+p[0]*r.width/1000,y=r.top+p[1]*r.height/1000;
   return x>b.left+5&&x<b.right-5&&y>b.top+5&&y<b.bottom-5;
  });
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10));
   for(let j=0;j<=n;j++)if(inside([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]))return true;
  }
  return false;
 };
 function safePath(from,to,points){
  const a=portPos(from),b=portPos(to);
  if(!a||!b)return [];
  const full=[a,...(Array.isArray(points)?points:[]),b];
  // Keep a learner's drawn route where it doesn't pass through equipment.
  if(full.length>2&&!nearBody(full,from,to))return full;
  // Otherwise lead the visible wire around the top/bottom of the workbench.
  const way=/:(?:N|R)$/.test(from)||/:(?:N|R)$/.test(to)?940:60;
  return [a,[a[0],way],[b[0],way],b];
 }
 function wireMarkup(){
  return state.wires.map((w,i)=>{
   const points=safePath(w.from,w.to,w.points),d=dOf(points);
   return '<g class="free-wire" data-wire-index="'+i+'"><path class="free-wire-halo" d="'+d+'"/><path class="free-wire-ink" d="'+d+'"/></g>';
  }).join("");
 }
 function renderWires(){
  const svg=get("freeLabLines");if(!svg)return;
  svg.innerHTML=wireMarkup()+(gesture?.mode==="wire"?
    '<path class="free-wire-preview" d="'+dOf(gesture.points)+'"/>':"");
 }
 const symbol=n=>{
  if(n.type==="battery")return '<span class="free-cell-art"><i class="free-cell-cap"></i><b>＋</b><em>1.5V</em><b>−</b></span>';
  if(n.type==="bulb")return '<span class="free-bulb-art"><span class="free-filament">〽</span><span class="free-metal"></span></span>';
  if(n.type==="sample"){
   const glyph={iron:"⌁",foil:"▤",wood:"▥",plastic:"▱"}[n.material]||"◇";
   return '<span class="free-sample-art sample-'+n.material+'"><b>'+glyph+'</b><small>'+M.materials[n.material].name+'</small></span>';
  }
  return '<span class="free-switch-art"><span class="free-switch-track">'+(n.on?"●──●":"● ╱ ●")+'</span><small>'+(n.on?"ON":"OFF")+'</small></span>';
 };
 const partsHtml=result=>state.nodes.map(n=>{
  const pins=M.terminals[n.type],lit=result.bulbs.find(b=>b.id===n.id),name=n.type==="sample"?M.materials[n.material].name:labels[n.type];
  return '<div class="free-device free-'+n.type+(chosen===n.id?' selected':'')+
   (lit?.level!=="off"&&lit?' is-on':'')+'" style="left:'+n.x+'%;top:'+n.y+'%" data-free-node="'+n.id+'">'+
   '<button class="free-move" data-free-move="'+n.id+'" aria-label="'+name+'を うごかす">'+symbol(n)+'</button>'+
   pins.map(p=>'<button type="button" data-free-port="'+n.id+':'+p+'" class="free-terminal port-'+p+
    '" aria-label="'+name+'の'+p+'のつなぎめ">'+
    (p==="P"?"+":p==="N"?"−":"●")+'</button>').join("")+
   (n.type==="switch"?'<button type="button" class="free-switch-toggle" data-free-switch="'+n.id+'" aria-label="スイッチを きりかえる">'+(n.on?"ON":"OFF")+'</button>':"")+
   '<span class="free-part-name">'+name+(lit?.level==="bright"?" ✨":lit?.level==="dim"?" ◌":"")+'</span></div>';
 }).join("");
 const safetyText='⚠ これは ゲームの じっけん。ほんものの でんちを ショートさせないでね。';
 function render(){
  const experiment=get("freeLabPanel");if(!experiment)return;
  const wasShort=!!rendered?.short;
  const result=M.simulate(state),counts={battery:0,bulb:0,switch:0,sample:0};
  state.nodes.forEach(n=>counts[n.type]++);
  const header=get("freeLabStatus");header.className="free-lab-status"+(result.short?" danger":result.high?" caution":result.litCount?" lit":"");
  header.textContent=result.short?"⚠ ショート！ せんを はずそう":result.high?"💡 ついた！ あかるすぎるかも":result.litCount?"💡 "+result.litCount+"こ ついた！":"◯ まだ つかない";
  const note=get("freeLabNote");note.textContent=result.short?safetyText:
   result.high?"2つの でんちだと、まめでんきゅうが あつくなる こともあるよ。":
   result.litCount?"いまの つなぎかたを みてみよう。":"まるから まるへ せんを ひこう。";
  for(const type of Object.keys(M.limits)){
   const btn=get("freeAdd"+type);if(btn)btn.disabled=counts[type]>=M.limits[type];
  }
  experiment.querySelectorAll("[data-free-material]").forEach(btn=>btn.disabled=counts.sample>=M.limits.sample);
  get("freeRemove").disabled=!state.nodes.some(n=>n.id===chosen);
  const target=board();target.innerHTML=
   '<svg class="free-lab-lines" id="freeLabLines" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"></svg>'+
   partsHtml(result);
  rendered=result;renderWires();
  if(!wasShort&&result.short)window.AkariEffects?.shortCircuit?.();
  get("freeLabCount").textContent="でんち "+counts.battery+"・でんきゅう "+counts.bulb+"・スイッチ "+counts.switch+"・ざいりょう "+counts.sample;
 }
 function addPart(type){
  if(!M.limits[type]||state.nodes.filter(n=>n.type===type).length>=M.limits[type])return;
  const placements={battery:[[23,28],[23,68]],bulb:[[75,28],[75,55],[75,80]],switch:[[49,78]]};
  const count=state.nodes.filter(n=>n.type===type).length;
  let id;do{id=({battery:"b",bulb:"l",switch:"s"})[type]+state.next++;}while(state.nodes.some(n=>n.id===id));
  state.nodes.push({id,type,x:placements[type][count][0],y:placements[type][count][1],...(type==="switch"?{on:false}:{})});
  chosen=id;persist();render();
 }
 function addSample(kind){
  if(!Object.hasOwn(M.materials,kind)||state.nodes.filter(n=>n.type==="sample").length>=M.limits.sample)return;
  const index=state.nodes.filter(n=>n.type==="sample").length;
  let id;do{id="m"+state.next++;}while(state.nodes.some(n=>n.id===id));
  state.nodes.push({id,type:"sample",material:kind,x:50,y:index?72:45});
  chosen=id;persist();render();
  setDrawer("");
 }
 function removePart(){
  if(!chosen)return;
  state.nodes=state.nodes.filter(n=>n.id!==chosen);
  state.wires=state.wires.filter(w=>!w.from.startsWith(chosen+":")&&!w.to.startsWith(chosen+":"));
  chosen=null;persist();render();
 }
 function attach(a,b,points){
  if(!a||!b||a===b||duplicate(a,b))return;
  const ports=new Set(state.nodes.flatMap(n=>M.terminals[n.type].map(p=>n.id+":"+p)));
  if(!ports.has(a)||!ports.has(b))return;
  state.wires.push({from:a,to:b,points:usablePoints(points)?points.slice(1,-1).slice(0,150):[]});
  persist();render();
 }
 function crossing(a,b,c,d){
  const vx=b.x-a.x,vy=b.y-a.y,wx=d.x-c.x,wy=d.y-c.y;
  const det=vx*wy-vy*wx,m=Math.hypot(vx,vy)*Math.hypot(wx,wy);
  if(m<2||Math.abs(det)/m<.46)return false;
  const dx=c.x-a.x,dy=c.y-a.y;
  const t=(dx*wy-dy*wx)/det,u=(dx*vy-dy*vx)/det;
  return t>.04&&t<.96&&u>=0&&u<=1;
 }
 function targetCut(){
  if(!gesture||gesture.mode!=="cut"||gesture.distance<27)return -1;
  const lines=[...board().querySelectorAll(".free-wire-ink")];
  for(let i=0;i<lines.length;i++){
   const line=lines[i],len=line.getTotalLength();
   if(len<=0)continue;
   const samples=Array.from({length:Math.min(180,Math.max(12,Math.ceil(len/10)))+1},(_,j)=>{
    const p=line.getPointAtLength(len*j/Math.min(180,Math.max(12,Math.ceil(len/10))));
    const q=screen(p.x,p.y);return q;
   });
   for(let j=1;j<gesture.screen.length;j++){
    for(let k=1;k<samples.length;k++)if(crossing(gesture.screen[j-1],gesture.screen[j],samples[k-1],samples[k]))return i;
   }
  }
  return -1;
 }
 const closestTerminal=e=>{
  const direct=document.elementFromPoint(e.clientX,e.clientY)?.closest("[data-free-port]");
  if(direct&&board().contains(direct))return direct.dataset.freePort;
  let result=null,dist=34;
  for(const btn of board().querySelectorAll("[data-free-port]")){
   const p=center(btn.getBoundingClientRect()),d=Math.hypot(p.x-e.clientX,p.y-e.clientY);
   if(d<dist){dist=d;result=btn.dataset.freePort;}
  }
  return result;
 };
 const handlerDown=e=>{
  if(e.button!==0||!e.isPrimary)return;
  const port=e.target.closest("[data-free-port]"),move=e.target.closest("[data-free-move]");
  if(port){
   const start=portPos(port.dataset.freePort);
   gesture={mode:"wire",id:e.pointerId,from:port.dataset.freePort,points:[start],distance:0,screen:[{x:e.clientX,y:e.clientY}]};
  }else if(move){
   const id=move.dataset.freeMove,n=state.nodes.find(n=>n.id===id);
   if(!n)return;
   gesture={mode:"move",id:e.pointerId,node:n,start:{x:e.clientX,y:e.clientY},original:{x:n.x,y:n.y},distance:0};
  }else if(!e.target.closest("button")){
   gesture={mode:"cut",id:e.pointerId,screen:[{x:e.clientX,y:e.clientY}],points:[],distance:0};
  }
 };
 const handlerMove=e=>{
  if(!gesture||gesture.id!==e.pointerId)return;
  if(gesture.mode==="move"){
   const g=gesture,r=board().getBoundingClientRect();
   const dx=e.clientX-g.start.x,dy=e.clientY-g.start.y;
   g.distance=Math.hypot(dx,dy);
   if(g.distance<5)return;
   g.node.x=clamp(g.original.x+dx/r.width*100,12,88);
   g.node.y=clamp(g.original.y+dy/r.height*100,15,86);
   const el=board().querySelector('[data-free-node="'+g.node.id+'"]');
   if(el){el.style.left=g.node.x+"%";el.style.top=g.node.y+"%";}
   renderWires();
  }else{
   const p={x:e.clientX,y:e.clientY},last=gesture.screen.at(-1),d=Math.hypot(p.x-last.x,p.y-last.y);
   if(d<3)return;
   gesture.distance+=d;gesture.screen.push(p);
   if(gesture.mode==="wire"){
    gesture.points.push(point(e.clientX,e.clientY));
    if(gesture.points.length>150)gesture.points.shift();
    renderWires();
   }else if(gesture.mode==="cut"){
    const index=targetCut();
    board().querySelectorAll(".free-wire").forEach((el,i)=>el.classList.toggle("cut-target",i===index));
   }
  }
  if(e.cancelable)e.preventDefault();
 };
 const handlerUp=(e,cancel)=>{
  if(!gesture||gesture.id!==e.pointerId)return;
  const g=gesture;gesture=null;
  if(cancel){renderWires();return;}
  if(g.mode==="move"){
   if(g.distance>5){suppressClick=Date.now()+240;persist();render();}
   else{chosen=g.node.id;render();}
  }else if(g.mode==="wire"){
   if(g.distance>12){
    suppressClick=Date.now()+240;
    const dest=closestTerminal(e);
    if(dest)attach(g.from,dest,g.points);
    else renderWires();
   }
  }else if(g.mode==="cut"){
   const index=(()=>{gesture=g;const n=targetCut();gesture=null;return n})();
   board().querySelectorAll(".free-wire").forEach(el=>el.classList.remove("cut-target"));
   if(index>=0){
    state.wires.splice(index,1);suppressClick=Date.now()+240;persist();render();
   }
  }
 };
 function presets(kind){
  const types=kind==="cells"?["battery","battery","bulb"]:kind==="lamps"?["battery","bulb","bulb"]:
   kind==="switch"?["battery","bulb","switch"]:["battery","bulb"];
  const spots={battery:[[23,28],[23,68]],bulb:[[75,28],[75,57],[75,83]],switch:[[49,70]]};
  const counted={battery:0,bulb:0,switch:0};
  state={nodes:types.map((type,i)=>{
   const index=counted[type]++,p=spots[type][index];
   return {id:({battery:"b",bulb:"l",switch:"s"})[type]+(i+1),type,x:p[0],y:p[1],...(type==="switch"?{on:false}:{})};
  }),wires:[],next:types.length+1};
  chosen=null;persist();render();
 }
 function setDrawer(side){
  openedDrawer=["tools","materials"].includes(side)?side:"";
  const shell=get("freeLabOneScreen");if(!shell)return;
  shell.dataset.open=openedDrawer;
  for(const name of ["tools","materials"]){
   const tab=shell.querySelector('[data-free-drawer="'+name+'"]');
   const panel=get(name==="tools"?"freeLabToolDrawer":"freeLabMaterialDrawer");
   if(tab)tab.setAttribute("aria-expanded",String(openedDrawer===name));
   if(panel)panel.hidden=openedDrawer!==name;
  }
 }
 function mount(){
  const workspace=get("workspace");if(!workspace||get("freeLabPanel"))return;
  const toggle=document.createElement("button");toggle.type="button";toggle.id="freeLabToggle";
  toggle.className="free-lab-trigger";toggle.textContent="🧪 じゆう実験";
  toggle.setAttribute("aria-expanded","false");
  workspace.parentNode.insertBefore(toggle,workspace);
  const section=document.createElement("section");section.id="freeLabPanel";
  section.className="free-lab-panel";section.hidden=true;section.setAttribute("aria-label","じゆうじっけんしつ");
  section.innerHTML=
   '<div class="free-lab-head"><strong>🧪 じゆうじっけんしつ</strong><button type="button" id="freeLabClose">× もどる</button></div>'+
   '<p class="free-lab-intro">ぶひんを うごかして、まるから まるへ せんを ひこう。</p>'+
   '<div class="free-lab-one-screen" id="freeLabOneScreen" data-open="">'+
   '<button type="button" class="free-drawer-tab" data-free-drawer="tools" aria-controls="freeLabToolDrawer" aria-expanded="false">🔋<strong>どうぐ</strong></button>'+
   '<button type="button" class="free-drawer-tab" data-free-drawer="materials" aria-controls="freeLabMaterialDrawer" aria-expanded="false">🧱<strong>ざいりょう</strong></button>'+
   '<div class="free-lab-stage">'+
   '<div class="free-lab-board" id="freeLabBoard" aria-label="ぶひんをうごかして、せんをつなぐじっけんだい"></div>'+
   '</div>'+
   '<aside class="free-drawer-panel free-drawer-tools" id="freeLabToolDrawer" aria-label="使える道具" hidden>'+
   '<p class="free-drawer-lead">つかう どうぐを えらぼう</p>'+
   '<div class="free-lab-tools"><button id="freeAddbattery" data-free-add="battery">＋ 🔋 でんち</button>'+
   '<button id="freeAddbulb" data-free-add="bulb">＋ 💡 でんきゅう</button>'+
   '<button id="freeAddswitch" data-free-add="switch">＋ 🎚️ スイッチ</button>'+
   '<button type="button" data-free-wire-tip>🧵 どう線を ひく</button>'+
   '<button id="freeRemove" disabled>✕ えらんだ ぶひんを はずす</button></div>'+
   '<p class="free-drawer-lead">どう線は、まるから まるへ なぞる。せんを よこぎると きれるよ。</p>'+
   '</aside>'+
   '<aside class="free-drawer-panel free-drawer-materials" id="freeLabMaterialDrawer" aria-label="電気を通すか調べる材料" hidden>'+
   '<p class="free-drawer-lead">どの ざいりょうが 電気を とおす？</p>'+
   '<div class="free-lab-samples">'+
   '<button type="button" data-free-material="iron"><span>⌁</span> 鉄のクリップ</button>'+
   '<button type="button" data-free-material="foil"><span>▤</span> アルミはく</button>'+
   '<button type="button" data-free-material="wood"><span>▥</span> 木の板</button>'+
   '<button type="button" data-free-material="plastic"><span>▱</span> プラスチック</button>'+
   '</div><p class="free-drawer-lead">材料の 2つのまるを、線で つなごう。つけるだけでは 光らないよ。</p></aside>'+
   '</div>'+
   '<div class="free-lab-status" id="freeLabStatus" role="status" aria-live="polite"></div>'+
   '<p class="free-lab-note" id="freeLabNote"></p>'+
   '<div class="free-lab-bottom"><span id="freeLabCount"></span><button type="button" id="freeLabClear">✂ せんを ぜんぶ けす</button></div>'+
   '<details class="free-lab-record"><summary>📒 じっけんの きろく</summary>'+
   '<button type="button" id="freeSaveRecord">✎ いまの けっかを きろく</button><div id="freeLabRecordRows"></div></details>'+
   '<details class="free-lab-preset"><summary>🔎 もっと じっけん</summary><p>どの つなぎかたで ひかるかな？</p>'+
   '<div class="free-lab-examples"><button data-free-preset="basic">① はじめの わ</button>'+
   '<button data-free-preset="switch">② スイッチ</button>'+
   '<button data-free-preset="cells">③ でんち 2こ</button>'+
   '<button data-free-preset="lamps">④ でんきゅう 2こ</button></div></details>'+
   '<p class="free-lab-safety">⚠ ゲームだけの じっけんだよ。ほんものの でんちを ショートさせないでね。'+
   '<small>あかるさは かんたんな けいさんモデルです。ほんものと まったく おなじでは ありません。</small></p>';
  workspace.after(section);
  const setOpen=value=>{
   open=value;section.hidden=!value;document.body.classList.toggle("akari-free-active",value);
   setDrawer("");
   toggle.setAttribute("aria-expanded",String(value));toggle.textContent=value?"↩ ぼうけんに もどる":"🧪 じゆう実験";
   if(value){render();showRecords();}
  };
  toggle.addEventListener("click",()=>setOpen(!open));
  get("freeLabClose").addEventListener("click",()=>setOpen(false));
  section.addEventListener("click",e=>{
   if(Date.now()<suppressClick&&e.target.closest("[data-free-move]"))return;
   const add=e.target.closest("[data-free-add]");if(add){addPart(add.dataset.freeAdd);setDrawer("");return;}
   const material=e.target.closest("[data-free-material]");if(material){addSample(material.dataset.freeMaterial);return;}
   const tip=e.target.closest("[data-free-wire-tip]");if(tip){
    setDrawer("");
    board()?.querySelector("[data-free-port]")?.focus({preventScroll:true});
    return;
   }
   const drawer=e.target.closest("[data-free-drawer]");if(drawer){setDrawer(openedDrawer===drawer.dataset.freeDrawer?"":drawer.dataset.freeDrawer);return;}
   const preset=e.target.closest("[data-free-preset]");if(preset){presets(preset.dataset.freePreset);return;}
   if(e.target.closest("#freeRemove")){removePart();return;}
   if(e.target.closest("#freeLabClear")){state.wires=[];persist();render();return;}
   if(e.target.closest("#freeSaveRecord")){record();return;}
   const flip=e.target.closest("[data-free-switch]");
   if(flip){const item=state.nodes.find(n=>n.id===flip.dataset.freeSwitch);if(item){item.on=!item.on;persist();render();}return;}
   const port=e.target.closest("[data-free-port]");
   if(port){const id=port.dataset.freePort;if(chosen?.includes(":")){const from=chosen;chosen=null;attach(from,id,[]);}else chosen=id;return;}
   const move=e.target.closest("[data-free-move]");
   if(move){chosen=move.dataset.freeMove;render();}
  });
  section.addEventListener("pointerdown",e=>{if(board()?.contains(e.target))handlerDown(e);});
  document.addEventListener("pointermove",e=>{if(open&&gesture)handlerMove(e);},{passive:false});
  document.addEventListener("pointerup",e=>{if(open&&gesture)handlerUp(e,false);},true);
  document.addEventListener("pointercancel",e=>{if(open&&gesture)handlerUp(e,true);},true);
  section.addEventListener("keydown",e=>{
   if(e.key==="Escape"&&openedDrawer){
    const previous=openedDrawer;setDrawer("");
    section.querySelector('[data-free-drawer="'+previous+'"]')?.focus();
    return;
   }
   if(!e.target.matches("[data-free-move]"))return;
   if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))return;
   e.preventDefault();
   const n=state.nodes.find(n=>n.id===e.target.dataset.freeMove);if(!n)return;
   n.x=clamp(n.x+(e.key==="ArrowLeft"?-3:e.key==="ArrowRight"?3:0),12,88);
   n.y=clamp(n.y+(e.key==="ArrowUp"?-3:e.key==="ArrowDown"?3:0),15,86);
   persist();render();
   board()?.querySelector('[data-free-move="'+n.id+'"]')?.focus();
  });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);
 else mount();
 window.AkariFreeLab={getState:()=>JSON.parse(JSON.stringify(state)),simulate:()=>M.simulate(state),open:()=>get("freeLabToggle")?.click()};
})();