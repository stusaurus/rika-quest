"use strict";
/* One finger-drawn wiring interaction for every circuit the player actually builds.
   The underlying lesson engines are responsible for connectivity, physics, and scoring. */
(function(){
 function init(){
 const NS="http://www.w3.org/2000/svg",STORAGE="rika-akari-other-handdrawn-v1";
 const root=document.getElementById("workspace");
 if(!root)return;
 let saved={};
 try{const raw=JSON.parse(localStorage.getItem(STORAGE)||"{}");if(raw&&typeof raw==="object"&&!Array.isArray(raw))saved=raw;}catch{}
 const profiles=[
  {id:"builder",board:".builder-puzzle .builder-board",terminal:"[data-builder-t]",
   module:"AkariBuilder",field:"terminals",width:1000,height:460,
   blocks:[[32,139,154,299],[824,952,166,299]]},
  {id:"network",board:".network-lab .network-board",terminal:"[data-net-t]",
   module:"AkariSwitchLab",field:"points",width:920,height:445,
   blocks:[[32,120,147,291],[756,885,151,284]]}
 ];
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const pair=(a,b)=>[a,b].sort().join("-");
 const dataKey=config=>config.id+":"+Number((document.getElementById("missionNumber")?.textContent||"01 / 14").match(/(\d+)\s*\/\s*14/)?.[1]||0);
 const write=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{}};
 const coords=(config,id)=>{
  const obj=window[config.module]?.[config.field]?.[id];
  return obj&&Number.isFinite(obj.x)&&Number.isFinite(obj.y)?[obj.x,obj.y]:null;
 };
 const inside=(config,p)=>config.blocks.some(([l,r,t,b])=>p[0]>l&&p[0]<r&&p[1]>t&&p[1]<b);
 const crosses=(config,points)=>{
  if(!Array.isArray(points)||points.length<2)return true;
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4));
   for(let n=0;n<=steps;n++){
    const p=[a[0]+(b[0]-a[0])*n/steps,a[1]+(b[1]-a[1])*n/steps];
    if(inside(config,p))return true;
   }
  }
  return false;
 };
 const good=(config,points)=>Array.isArray(points)&&points.length>=2&&points.length<=180&&
  points.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v))&&
   p[0]>=0&&p[0]<=config.width&&p[1]>=0&&p[1]<=config.height)&&!crosses(config,points);
 const pathD=points=>points.map((p,i)=>(i?"L":"M")+Math.round(p[0]*10)/10+" "+Math.round(p[1]*10)/10).join(" ");
 // Find a safe route outside the equipment, including for keyboard/two-tap connections.
 // A 10px grid search avoids the blocked physical components.
 function safeRoute(config,start,end){
  const step=10,nx=Math.floor(config.width/step)+1,ny=Math.floor(config.height/step)+1;
  const idx=(x,y)=>y*nx+x,nearest=p=>[clamp(Math.round(p[0]/step),0,nx-1),clamp(Math.round(p[1]/step),0,ny-1)];
  const [sx,sy]=nearest(start),[tx,ty]=nearest(end);
  const size=nx*ny,prev=new Int32Array(size);prev.fill(-1);
  const q=new Int32Array(size),source=idx(sx,sy),goal=idx(tx,ty);let front=0,back=1;
  q[0]=source;prev[source]=source;
  while(front<back&&prev[goal]===-1){
   const here=q[front++],x=here%nx,y=Math.floor(here/nx);
   for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
    const a=x+dx,b=y+dy;if(a<0||b<0||a>=nx||b>=ny)continue;
    const node=idx(a,b);
    if(prev[node]!==-1||inside(config,[a*step,b*step]))continue;
    prev[node]=here;q[back++]=node;
   }
  }
  if(prev[goal]===-1)return [start,end];
  const nodes=[],limit=size+1;let cur=goal;
  for(let i=0;i<limit;i++){
   nodes.push([(cur%nx)*step,Math.floor(cur/nx)*step]);
   if(cur===source)break;cur=prev[cur];
  }
  nodes.reverse();
  const slim=[start];
  for(let i=0;i<nodes.length;i++){
   if(i>0&&i<nodes.length-1){
    const d1=[nodes[i][0]-nodes[i-1][0],nodes[i][1]-nodes[i-1][1]];
    const d2=[nodes[i+1][0]-nodes[i][0],nodes[i+1][1]-nodes[i][1]];
    if(d1[0]===d2[0]&&d1[1]===d2[1])continue;
   }
   slim.push(nodes[i]);
  }
  slim.push(end);
  return slim;
 }
 const clientPoint=(svg,e,config)=>{
  const m=svg.getScreenCTM();if(!m)return null;
  const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());
  return [Math.round(clamp(p.x,0,config.width)*10)/10,Math.round(clamp(p.y,0,config.height)*10)/10];
 };
 const context=button=>{
  const config=profiles.find(c=>button.matches(c.terminal)&&button.closest(c.board));
  if(!config)return null;
  const board=button.closest(config.board),svg=board.querySelector("svg");
  const id=button.dataset[config.id==="builder"?"builderT":"netT"];
  const point=coords(config,id);
  return svg&&point?{config,board,svg,id,point}:null;
 };
 function apply(){
  for(const config of profiles){
   const board=root.querySelector(config.board);if(!board)continue;
   const key=dataKey(config),stored=saved[key]||{},active=new Set();
   board.querySelectorAll(".student-wire[data-student-wire]").forEach(group=>{
    const code=group.dataset.studentWire,ids=code.match(/(?:A1|A2|B1|B2|[PNSTRL])/g)||[];
    if(ids.length!==2)return;
    const from=coords(config,ids[0]),to=coords(config,ids[1]);if(!from||!to)return;
    active.add(code);
    const custom=stored[code],valid=good(config,custom);
    let points=valid?custom:safeRoute(config,from,to);
    if(crosses(config,points))points=safeRoute(config,to,from).reverse();
    const d=pathD(points);
    group.querySelectorAll("path.student-wire-outline,path.student-wire-ink").forEach(el=>el.setAttribute("d",d));
    group.dataset.handdrawn=valid?"true":"false";
   });
   let dirty=false;
   for(const code of Object.keys(stored)){if(!active.has(code)){delete stored[code];dirty=true;}}
   if(dirty)write();
  }
 }
 let drag=null,preview=null,suppress=false;
 function erase(){preview?.remove();preview=null;}
 function makePreview(svg){
  const group=document.createElementNS(NS,"g");group.setAttribute("class","other-wire-preview");
  for(const cls of ["other-wire-preview-halo","other-wire-preview-line"]){
   const p=document.createElementNS(NS,"path");p.setAttribute("class",cls);
   p.setAttribute("fill","none");group.append(p);
  }
  svg.append(group);return group;
 }
 root.addEventListener("pointerdown",e=>{
  if(drag||e.button!==0)return;
  const target=e.target.closest(".builder-terminal[data-builder-t],.builder-terminal[data-net-t]");
  const c=target&&context(target);if(!c)return;
  drag={...c,pointerId:e.pointerId,screen:[e.clientX,e.clientY],moved:false,points:[c.point.slice()]};
 });
 document.addEventListener("pointermove",e=>{
  if(!drag||e.pointerId!==drag.pointerId)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.screen[0],e.clientY-drag.screen[1])<10)return;
  drag.moved=true;if(!preview)preview=makePreview(drag.svg);
  const viewport=drag.board.closest(".builder-viewport");
  if(viewport&&viewport.scrollWidth>viewport.clientWidth+6){
   const r=viewport.getBoundingClientRect();
   if(e.clientX>r.right-22)viewport.scrollLeft+=17;
   else if(e.clientX<r.left+22)viewport.scrollLeft-=17;
  }
  const p=clientPoint(drag.svg,e,drag.config);
  if(p){
   const last=drag.points.at(-1);
   if(Math.hypot(last[0]-p[0],last[1]-p[1])>2&&drag.points.length<176)drag.points.push(p);
   const d=pathD(drag.points);
   preview.querySelectorAll("path").forEach(path=>path.setAttribute("d",d));
   preview.classList.toggle("crosses-device",crosses(drag.config,drag.points));
  }
  if(e.cancelable)e.preventDefault();
 },{passive:false});
 root.addEventListener("click",e=>{
  if(suppress&&e.isTrusted&&e.target.closest(".builder-terminal")){
   e.preventDefault();e.stopImmediatePropagation();suppress=false;
  }
 },true);
 document.addEventListener("pointerup",e=>{
  if(!drag||drag.pointerId!==e.pointerId)return;
  const old=drag;drag=null;erase();
  if(!old.moved)return;
  const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest(old.config.terminal)||
    [...old.board.querySelectorAll(old.config.terminal)].find(btn=>{
      const r=btn.getBoundingClientRect(),pad=12;
      return e.clientX>=r.left-pad&&e.clientX<=r.right+pad&&
        e.clientY>=r.top-pad&&e.clientY<=r.bottom+pad;
    });
  const target=hit&&context(hit);
  if(!target||target.board!==old.board||target.id===old.id)return;
  const code=pair(old.id,target.id),stage=dataKey(old.config),points=[...old.points,target.point.slice()];
  if(e.cancelable)e.preventDefault();
  const getTerminal=id=>root.querySelector(old.config.board+" "+old.config.terminal+"[data-"+(old.config.id==="builder"?"builder-t":"net-t")+'="'+id+'"]');
  const previousSelection=root.querySelector(old.config.board+" "+old.config.terminal+".selected");
  const already=!!root.querySelector(old.config.board+' [data-student-wire="'+code+'"]');
  if(previousSelection)previousSelection.click();
  getTerminal(old.id)?.click();getTerminal(target.id)?.click();
  const now=!!root.querySelector(old.config.board+' [data-student-wire="'+code+'"]');
  if(now&&!already){
   (saved[stage]??={});
   if(good(old.config,points))saved[stage][code]=points;
   else delete saved[stage][code];
   write();apply();
   if(!good(old.config,points)){
    const msg=root.querySelector(".builder-help");
    if(msg)msg.textContent="ぶひんを よけて どう線を つないだよ。";
   }
  }else if(!now&&saved[stage]){
   delete saved[stage][code];write();
  }
  suppress=true;setTimeout(()=>{suppress=false},120);
 },true);
 document.addEventListener("pointercancel",e=>{if(drag?.pointerId===e.pointerId){drag=null;erase();}},true);
 new MutationObserver(apply).observe(root,{childList:true,subtree:false});
 apply();
 window.AkariWireCanvas={refresh:apply};
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
