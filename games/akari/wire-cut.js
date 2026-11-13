"use strict";
/* Cutting a drawn lead by swiping across it. Geometry is checked against the visible SVG
   path, while the existing lesson engine owns connectivity and science results. */
(function(){
 const root=document.getElementById("workspace");
 if(!root)return;
 let gesture=null,marked=null,cutMode=false;
 // Only the painted first mission gets the optional, visible scissors tool.
 // Legacy cross-swipe, keyboard and two-tap connection remain unchanged.
 const activePaintedBoard=()=>{
  const board=root.querySelector(".circuit-board.circuit-town-board");
  return document.documentElement.classList.contains("akari-painted")&&board?.querySelector(".painted-world")?board:null;
 };
 const scissorsMarkup='<svg viewBox="0 0 24 24" width="18" height="18" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l11 11M8 16L19 5"/></svg><span>きる</span>';
 function updateScissors(){
  const board=activePaintedBoard(),toolbar=root.querySelector(".circuit-toolbar");
  if(!board||!toolbar){
   cutMode=false;return;
  }
  const hasWires=!!board.querySelector('.lead-on-top[data-visual-wire] .wire');
  if(!hasWires)cutMode=false;
  let button=toolbar.querySelector("[data-wire-cut-mode]");
  if(!button){
   button=document.createElement("button");
   button.type="button";button.className="circuit-scissors";
   button.dataset.wireCutMode="";button.setAttribute("aria-label","はさみ：どう線を よこぎって きる");
   button.title="はさみをえらんで、どう線をよこぎるようにスライド";
   button.innerHTML=scissorsMarkup;
   toolbar.querySelector(".circuit-zoom-btn")?.before(button);
  }
  button.hidden=!hasWires;
  button.setAttribute("aria-pressed",String(cutMode));
  board.classList.toggle("wire-cut-mode",cutMode);
  const help=board.querySelector(".circuit-help");
  if(help)help.textContent=cutMode?"✂ せんを よこぎって ゆびで スライド":hasWires?"✂「きる」で どう線を きれるよ":"まるを 2つ つないでみよう";
  const question=toolbar.querySelector(".circuit-question");
  if(question){
   if(!question.dataset.scissorsPrompt)question.dataset.scissorsPrompt=question.textContent;
   question.textContent=cutMode?"✂ せんを よこぎって きろう":question.dataset.scissorsPrompt;
  }
 }
 root.addEventListener("click",e=>{
  const toggle=e.target.closest("[data-wire-cut-mode]");
  if(!toggle||!activePaintedBoard())return;
  cutMode=!cutMode;
  updateScissors();
 });
 new MutationObserver(updateScissors).observe(root,{childList:true});
 updateScissors();
 const viewportPaths=board=>{
  if(board.matches(".circuit-board"))
   return [...board.querySelectorAll(".lead-on-top[data-visual-wire] .wire")]
     .map(path=>({path,group:path.closest("[data-visual-wire]"),kind:"wire",key:path.closest("[data-visual-wire]").dataset.visualWire}));
  const kind=board.closest(".network-lab")?"network":"builder";
  return [...board.querySelectorAll(".student-wire[data-student-wire] .student-wire-ink")]
    .map(path=>({path,group:path.closest("[data-student-wire]"),kind,key:path.closest("[data-student-wire]").dataset.studentWire}));
 };
 const clear=()=>{
  marked?.group?.classList.remove("wire-cut-target");
  marked=null;
  gesture?.board?.classList.remove("wire-cut-ready");
 };
 const vec=(x,y)=>({x,y});
 const cross=(a,b,c,d)=>{
  const vx=b.x-a.x,vy=b.y-a.y,wx=d.x-c.x,wy=d.y-c.y;
  const det=vx*wy-vy*wx,len=Math.hypot(vx,vy)*Math.hypot(wx,wy);
  if(len<1||Math.abs(det)/len<0.4)return false;
  const ux=c.x-a.x,uy=c.y-a.y;
  const t=(ux*wy-uy*wx)/det,u=(ux*vy-uy*vx)/det;
  // A finger can cross a wire exactly at a pointermove endpoint.
  // Excluding the ends misses such valid crossings, especially with evenly spaced samples.
  const eps=1e-6;
  return t>=-eps&&t<=1+eps&&u>=-eps&&u<=1+eps;
 };
 const screenPoints=path=>{
  if(typeof path.getTotalLength!=="function")return [];
  const matrix=path.getScreenCTM();if(!matrix)return [];
  const length=path.getTotalLength(),n=Math.max(1,Math.min(240,Math.ceil(length/5)));
  const result=[];
  for(let i=0;i<=n;i++){
   const p=path.getPointAtLength(length*i/n);
   const q=new DOMPoint(p.x,p.y).matrixTransform(matrix);
   result.push(vec(q.x,q.y));
  }
  return result;
 };
 const candidate=()=>{
  if(!gesture||gesture.distance<28||gesture.points.length<2)return null;
  let best=null,bestDistance=Infinity;
  for(const item of viewportPaths(gesture.board)){
   const samples=screenPoints(item.path);
   let progress=0;
   for(let i=1;i<gesture.points.length;i++){
    const a=gesture.points[i-1],b=gesture.points[i];
    for(let j=1;j<samples.length;j++){
     if(cross(a,b,samples[j-1],samples[j])&&progress<bestDistance){
      best=item;bestDistance=progress;
     }
    }
    progress+=Math.hypot(b.x-a.x,b.y-a.y);
   }
  }
  return best;
 };
 const mark=item=>{
  if(marked?.group===item?.group)return;
  clear();
  if(!item||!gesture)return;
  marked=item;marked.group.classList.add("wire-cut-target");
  gesture.board.classList.add("wire-cut-ready");
 };
 const cutBurst=(x,y)=>{
  const el=document.createElement("span");
  el.className="wire-cut-burst";el.textContent="✂️";
  el.style.left=x+"px";el.style.top=y+"px";
  el.setAttribute("aria-hidden","true");document.body.append(el);
  setTimeout(()=>el.remove(),520);
 };
 root.addEventListener("pointerdown",e=>{
  if(gesture||e.button!==0||!e.isPrimary)return;
  if(e.target.closest("button,input,select,textarea,a,summary,[role=button]"))return;
  const board=e.target.closest(".circuit-board,.builder-board,.network-board") || e.target.closest(".builder-viewport,.network-viewport")?.querySelector(".builder-board,.network-board");
  if(!board||!root.contains(board)||!viewportPaths(board).length)return;
  // Starting on a contact is for *joining*, not cutting.
  if(e.target.closest(".terminal,.builder-terminal"))return;
  gesture={id:e.pointerId,board,points:[vec(e.clientX,e.clientY)],distance:0};
 },true);
 document.addEventListener("pointermove",e=>{
  if(!gesture||e.pointerId!==gesture.id)return;
  const last=gesture.points.at(-1),point=vec(e.clientX,e.clientY);
  const distance=Math.hypot(point.x-last.x,point.y-last.y);
  if(distance<3)return;
  gesture.distance+=distance;gesture.points.push(point);
  if(gesture.points.length>100)gesture.points.shift();
  mark(candidate());
  if(marked&&e.cancelable)e.preventDefault();
 },{passive:false,capture:true});
 const finish=(e,cancel=false)=>{
  if(!gesture||e.pointerId!==gesture.id)return;
  const item=!cancel?candidate():null;
  const position=vec(e.clientX,e.clientY);
  clear();gesture=null;
  if(!item)return;
  // The physics engine removes the connection; never fake a successful cut.
  // Switch off scissors first, so the newly rendered board restores scrolling.
  cutMode=false;
  const result=root.dispatchEvent(new CustomEvent("akari-wire-cut",{bubbles:false,detail:{
   kind:item.kind,key:item.key
  }}));
  updateScissors();
  if(result)cutBurst(position.x,position.y);
  if(e.cancelable)e.preventDefault();
 };
 document.addEventListener("pointerup",e=>finish(e,false),true);
 document.addEventListener("pointercancel",e=>finish(e,true),true);
 window.AkariWireCut={enabled:true};
})();