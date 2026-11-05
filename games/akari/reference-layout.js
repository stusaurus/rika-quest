"use strict";
/* Observe the existing science game; guide the child without replacing its rules. */
(function(){
 const get=id=>document.getElementById(id);
 const read=(k,d)=>{try{return localStorage.getItem(k)||d}catch{return d}};
 const store=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let predictions={};try{predictions=JSON.parse(read("rika-akari-predictions-v1","{}"))||{}}catch{predictions={}};
 let reasons={};try{reasons=JSON.parse(read("rika-akari-first-reasons-v1","{}"))||{}}catch{reasons={}};
 let reasonFeedback="";
 const reasonsByMission={
  1:{title:"どうして ついた？",correct:"loop",success:"ぐるっと つながった！",
    choices:[["loop","🔁","ぐるっと つながった"],["cut","✂️","せんが きれた"],["extra","🔋","電池が ふえた"]]},
  2:{title:"どこを なおした？",correct:"joined",success:"すきまが なくなった！",
    choices:[["joined","🔗","せんを つないだ"],["removed","✂️","せんを はずした"],["extra","🔋","電池を ふやした"]]}
 };
 const mission=()=>Number((get("missionNumber")?.textContent||"MISSION 01 / 14").match(/(\d+)\s*\/\s*14/)?.[1]||1);
 function setup(){
  document.body.dataset.visualTheme="reference-rebuild";
  document.body.classList.add("gesture-first");
  const top=document.querySelector(".topbar"),sidebar=get("sidebar");
  if(top&&sidebar&&sidebar.parentNode!==top){
   const progress=document.createElement("div");progress.className="top-mission-progress";
   progress.innerHTML='<strong id="topMissionIndex">1 / 14</strong>';
   top.insertBefore(progress,top.querySelector(".top-actions"));top.append(sidebar);
  }
  const brand=top?.querySelector(".brand");
  if(brand)brand.innerHTML='<span class="brand-symbol" aria-hidden="true">💡</span><span>あかりクエスト<small>まちに ひかりを！</small></span>';
  const main=document.querySelector(".main");
  if(main&&!get("learningSteps")){
   const steps=document.createElement("aside");steps.id="learningSteps";steps.className="learning-steps";
   steps.setAttribute("aria-label","いまの操作");
   steps.innerHTML=[
    '<section class="learning-step" id="predictStep">',
    '<h3><span class="step-index">?</span>よそう</h3>',
    '<div class="prediction-options" id="designPredictionChoices">',
    '<button type="button" class="prediction-option" data-prediction="lit" aria-label="あかりが つくと おもう" aria-pressed="false"><span aria-hidden="true">💡</span><small>つく</small></button>',
    '<button type="button" class="prediction-option" data-prediction="dark" aria-label="あかりが つかないと おもう" aria-pressed="false"><span aria-hidden="true">◯</span><small>つかない</small></button>',
    '<button type="button" class="prediction-option" data-prediction="unsure" aria-label="まだ わからない" aria-pressed="false"><span aria-hidden="true">❔</span><small>わからない</small></button>',
    '</div></section>',
    '<section class="learning-step" id="connectStep">',
    '<h3><span class="step-index" aria-hidden="true">☝</span><span id="guideActionLabel">つなぐ</span></h3>',
    '<div class="gesture-demo" aria-hidden="true"><span class="gesture-node"></span><span class="gesture-line"></span><span class="gesture-node"></span></div>',
    '<p id="guideActionText">まるを 2つ おそう</p></section>',
    '<section class="learning-step" id="thinkStep">',
    '<h3><span class="step-index" aria-hidden="true">💡</span>かんがえる</h3>',
    '<p id="designComparisonNote" aria-live="polite">どうして ついた？</p>',
    '<div class="reason-choices" id="reasonChoices" role="group" aria-label="じっけんの わけを えらぶ"></div></section>'
   ].join("");
   main.insertBefore(steps,main.querySelector(".story-scene"));
   steps.addEventListener("click",e=>{
    const reasoning=e.target.closest("[data-first-reason]");
    if(reasoning){
     const n=mission(),question=reasonsByMission[n];
     if(!question||reasons[n]===question.correct)return;
     if(reasoning.dataset.firstReason===question.correct){
      reasons[n]=question.correct;
      store("rika-akari-first-reasons-v1",JSON.stringify(reasons));
      reasonFeedback=question.success;
     }else reasonFeedback="せんの つながりを もういちど みよう";
     refresh();return;
    }
    const b=e.target.closest("[data-prediction]");if(!b)return;
    predictions[mission()]=b.dataset.prediction;
    store("rika-akari-predictions-v1",JSON.stringify(predictions));refresh();
   });
  }
 }
 function decorate(){
  const root=get("workspace"),board=root?.querySelector(".circuit-board");if(!board)return;
  board.style.setProperty("--chosen-wire-color","#277fea");
  if(board.dataset.gestureReady!=="yes"){
   board.dataset.gestureReady="yes";
   const inner=board.querySelector(".circuit-inner");
   if(inner){
    for(const [side,title] of [["battery","乾電池"],["bulb","豆電球"]]){
     const el=document.createElement("div");el.className="component-tag "+side+"-tag";
     el.setAttribute("aria-hidden","true");el.textContent=title;inner.append(el);
    }
   }
  }
  const selected=board.querySelector(".terminal.selected");
  const all=board.querySelectorAll(".terminal[data-t]");
  all.forEach(btn=>{
   const id=btn.dataset.t;
   const samePart=selected?("PN".includes(id)==="PN".includes(selected.dataset.t)):false;
   btn.classList.toggle("gesture-next",!!selected&&!samePart&&!btn.classList.contains("selected"));
   btn.classList.toggle("gesture-idle",!selected);
  });
  refresh();
 }
 function refresh(){
  const n=mission(),firstSteps=n<=2;
  const idx=get("topMissionIndex");if(idx)idx.textContent=n+" / 14";
  const done=!!get("discovery")&&!get("discovery").hidden;
  const board=get("workspace")?.querySelector(".circuit-board");
  const hasSelection=!!board?.querySelector(".terminal.selected");
  const wireCount=board?.querySelectorAll(".wire-chip").length||0;
  const predicted=!!predictions[n];
  const steps=get("learningSteps"),pred=get("predictStep"),connect=get("connectStep"),think=get("thinkStep");
  if(!steps||!pred||!connect||!think)return;
  steps.hidden=!firstSteps;
  pred.hidden=!firstSteps||predicted||done;
  connect.hidden=!firstSteps||(!predicted&&!hasSelection&&!wireCount)||done;
  think.hidden=!firstSteps||!done;
  const stage=done?"reflect":!predicted&&!hasSelection&&!wireCount?"predict":wireCount>=2?"test":hasSelection?"second":"connect";
  document.body.dataset.guidePhase=firstSteps?stage:"lesson";
  pred.querySelectorAll("[data-prediction]").forEach(btn=>btn.setAttribute("aria-pressed",String(predictions[n]===btn.dataset.prediction)));
  const name=get("guideActionLabel"),hint=get("guideActionText"),compare=get("designComparisonNote");
  if(name)name.textContent=stage==="test"?"ためす":"つなぐ";
  if(hint)hint.textContent=stage==="second"?"もう1つの まる":stage==="test"?"みどりの ボタンを おそう":"まるから まるへ なぞろう";
  const question=reasonsByMission[n],reasonChoices=get("reasonChoices");
  if(question&&reasonChoices){
   if(reasonChoices.dataset.mission!==String(n)){
    reasonChoices.dataset.mission=String(n);
    reasonFeedback="";
    reasonChoices.innerHTML=question.choices.map(([id,icon,label])=>
     '<button type="button" class="reason-option" data-first-reason="'+id+'" aria-pressed="false">'+
     '<span aria-hidden="true">'+icon+'</span><small>'+label+'</small></button>'
    ).join("");
   }
   reasonChoices.querySelectorAll("[data-first-reason]").forEach(b=>{
    const chosen=reasons[n]===b.dataset.firstReason;
    b.setAttribute("aria-pressed",String(chosen));
    b.disabled=!!reasons[n];
   });
   if(compare)compare.textContent=reasons[n]===question.correct?question.success:reasonFeedback||question.title;
  }else if(compare)compare.textContent="どうして そうなった？";
  const next=get("nextBtn");
  if(next&&firstSteps&&!next.hidden)next.disabled=!reasons[n];
  const command=board?.querySelector(".circuit-help");
  if(command)command.textContent=stage==="second"?"もう1つの まるを タップ":stage==="test"?"できたら『ためす』を タップ":"なぞるか 2つの まるを タップ";
 }
 function bindWireDrawing(){
  const root=get("workspace");if(!root)return;
  const ns="http://www.w3.org/2000/svg";
  const storage="rika-akari-freehand-wires-v1";
  const contact={P:[42,151],N:[178,151],L:[268,152],R:[313,210]};
  const pair=(a,b)=>[a,b].sort().join("");
  const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
  const rounded=n=>Math.round(clamp(n,-20,420)*10)/10;
  let shapes={};
  try{
   const saved=JSON.parse(read(storage,"{}"));
   if(saved&&typeof saved==="object"&&!Array.isArray(saved))shapes=saved;
  }catch{}
  const saveShapes=()=>store(storage,JSON.stringify(shapes));
  // An SVG coordinate is stable on mobile, desktop, magnification and after reload.
  const svgPoint=(svg,x,y)=>{
   const matrix=svg.getScreenCTM();
   if(!matrix)return null;
   const p=new DOMPoint(x,y).matrixTransform(matrix.inverse());
   return [rounded(clamp(p.x,0,400)),rounded(clamp(p.y,0,250))];
  };
  const dOf=points=>points.map((p,i)=>(i?"L":"M")+p[0]+" "+p[1]).join(" ");
  const validPoints=points=>Array.isArray(points)&&points.length>=2&&points.length<=180&&
   points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=400));
  const blocked=([x,y])=>(x>49&&x<173&&y>115&&y<182)||
    (x>279&&x<353&&y>38&&y<135)||
    (x>289&&x<336&&y>133&&y<187);
  const intersectsDevice=points=>{
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let j=0,n=Math.max(1,Math.ceil(length/2));j<=n;j++){
     const q=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n];
     if(blocked(q))return true;
    }
   }
   return false;
  };
  const drawSaved=()=>{
   const svg=root.querySelector(".circuit-svg-v2");
   if(!svg)return;
   const n=mission(),saved=shapes[n]||{};
   const active=new Set();
   svg.querySelectorAll(".lead-on-top[data-visual-wire]").forEach(g=>{
    const key=g.dataset.visualWire;
    active.add(key);
    g.removeAttribute("data-freehand");
    const points=saved[key];
    if(!validPoints(points)||intersectsDevice(points))return;
    const d=dOf(points);
    g.querySelectorAll("path").forEach(path=>path.setAttribute("d",d));
    g.dataset.freehand="true";
   });
   // Disconnecting or restarting the mission removes obsolete drawings, too.
   let dirty=false;
   if(shapes[n])for(const key of Object.keys(saved)){
    if(!active.has(key)){delete saved[key];dirty=true;}
   }
   if(dirty)saveShapes();
  };
  let drag=null,preview=null,suppressTrustedClick=false;
  const discard=()=>{if(preview){preview.remove();preview=null;}};
  const makePreview=svg=>{
   const g=document.createElementNS(ns,"g");
   g.setAttribute("class","wire-freehand-preview");
   const outline=document.createElementNS(ns,"path");
   outline.setAttribute("class","wire-outline");
   const line=document.createElementNS(ns,"path");
   line.setAttribute("class","wire-freehand-trace");
   g.append(outline,line);svg.append(g);
   return g;
  };
  root.addEventListener("pointerdown",e=>{
   if(e.button!==0||drag)return;
   const button=e.target.closest(".circuit-inner .terminal[data-t]");
   const svg=root.querySelector(".circuit-svg-v2");
   if(!button||!svg||!contact[button.dataset.t])return;
   const start=contact[button.dataset.t];
   drag={id:e.pointerId,from:button.dataset.t,svg,x:e.clientX,y:e.clientY,
     moved:false,points:[start.slice()]};
  });
  document.addEventListener("pointermove",e=>{
   if(!drag||e.pointerId!==drag.id)return;
   if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9)return;
   drag.moved=true;
   if(!preview)preview=makePreview(drag.svg);
   const p=svgPoint(drag.svg,e.clientX,e.clientY);
   if(p){
    const last=drag.points[drag.points.length-1];
    if(Math.hypot(p[0]-last[0],p[1]-last[1])>=1.5&&drag.points.length<175)drag.points.push(p);
    const d=dOf(drag.points);
    preview.querySelectorAll("path").forEach(path=>path.setAttribute("d",d));
    preview.classList.toggle("crosses-device",intersectsDevice(drag.points));
   }
   if(e.cancelable)e.preventDefault();
  },{passive:false});
  root.addEventListener("click",e=>{
   if(suppressTrustedClick&&e.isTrusted&&e.target.closest(".terminal[data-t]")){
    e.preventDefault();e.stopImmediatePropagation();suppressTrustedClick=false;
   }
  },true);
  document.addEventListener("pointerup",e=>{
   if(!drag||e.pointerId!==drag.id)return;
   const previous=drag;drag=null;discard();
   if(!previous.moved)return;
   const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest(".circuit-inner .terminal[data-t]");
   if(!hit||!root.contains(hit)||!contact[hit.dataset.t]||hit.dataset.t===previous.from){
    const help=root.querySelector(".circuit-help");
    if(help)help.textContent="さいごは まるで ゆびを はなそう";
    return;
   }
   const dest=hit.dataset.t,key=pair(previous.from,dest);
   if(e.cancelable)e.preventDefault();
   const finish=contact[dest];
   const points=previous.points.concat([finish.slice()]);
   const good=validPoints(points)&&!intersectsDevice(points);
   // The game engine remains authoritative: reuse its normal terminal-click rules.
   const clickTerminal=id=>root.querySelector('.circuit-inner .terminal[data-t="'+id+'"]')?.click();
   const selected=root.querySelector(".circuit-inner .terminal.selected");
   if(selected)selected.click();
   clickTerminal(previous.from);clickTerminal(dest);
   const exists=!!root.querySelector('.lead-on-top[data-visual-wire="'+key+'"]');
   if(exists){
    const n=mission();
    if(good){
     (shapes[n]??={})[key]=points;
    }else if(shapes[n])delete shapes[n][key];
    saveShapes();drawSaved();
    if(!good){
     const help=root.querySelector(".circuit-help");
     if(help)help.textContent="ぶひんを よけて どう線を とおしたよ";
    }
   }
   suppressTrustedClick=true;
   setTimeout(()=>{suppressTrustedClick=false},70);
  },true);
  document.addEventListener("pointercancel",e=>{
   if(drag&&drag.id===e.pointerId){drag=null;discard();}
  },true);
  new MutationObserver(drawSaved).observe(root,{childList:true,subtree:false});
  drawSaved();
 }
 function init(){
  setup();decorate();refresh();bindWireDrawing();
  const root=get("workspace"),head=get("missionNumber"),discovery=get("discovery");
  if(root)new MutationObserver(()=>{decorate()}).observe(root,{childList:true});
  if(head)new MutationObserver(refresh).observe(head,{childList:true,characterData:true,subtree:true});
  if(discovery)new MutationObserver(refresh).observe(discovery,{attributes:true,attributeFilter:["hidden"]});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
