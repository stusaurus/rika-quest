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
  let drag=null,trail=null,suppressTrustedClick=false;
  const erase=()=>{if(trail){trail.remove();trail=null;}};
  const center=button=>{
   const r=button.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};
  };
  root.addEventListener("pointerdown",e=>{
   if(e.button!==0||drag)return;
   const button=e.target.closest(".circuit-inner .terminal[data-t]");
   if(!button)return;
   const start=center(button);
   drag={pointerId:e.pointerId,from:button.dataset.t,x:start.x,y:start.y,moved:false};
  });
  document.addEventListener("pointermove",e=>{
   if(!drag||e.pointerId!==drag.pointerId)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y,length=Math.hypot(dx,dy);
   if(length<11&&!drag.moved)return;
   drag.moved=true;
   if(!trail){
    trail=document.createElement("div");trail.className="wire-drag-trail";
    trail.setAttribute("aria-hidden","true");document.body.appendChild(trail);
   }
   trail.style.left=drag.x+"px";trail.style.top=drag.y+"px";
   trail.style.width=length+"px";
   trail.style.transform="rotate("+Math.atan2(dy,dx)+"rad)";
   if(e.cancelable)e.preventDefault();
  },{passive:false});
  root.addEventListener("click",e=>{
   if(suppressTrustedClick&&e.isTrusted&&e.target.closest(".terminal[data-t]")){
    e.preventDefault();e.stopImmediatePropagation();suppressTrustedClick=false;
   }
  },true);
  document.addEventListener("pointerup",e=>{
   if(!drag||e.pointerId!==drag.pointerId)return;
   const previous=drag;drag=null;erase();
   if(!previous.moved)return;
   const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest(".circuit-inner .terminal[data-t]");
   if(!hit||!root.contains(hit)||hit.dataset.t===previous.from)return;
   const end=hit.dataset.t;
   if(e.cancelable)e.preventDefault();
   // Use the game's existing click handler for both the experiment and short-circuit rules.
   const clickTerminal=id=>root.querySelector('.circuit-inner .terminal[data-t="'+id+'"]')?.click();
   const currentlySelected=root.querySelector(".circuit-inner .terminal.selected");
   if(currentlySelected)currentlySelected.click();
   clickTerminal(previous.from);
   clickTerminal(end);
   // Ignore a browser-generated click that may follow pointerup; programmatic clicks are untrusted.
   suppressTrustedClick=true;
   setTimeout(()=>{suppressTrustedClick=false},70);
  },true);
  document.addEventListener("pointercancel",()=>{drag=null;erase();},true);
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
