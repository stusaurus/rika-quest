"use strict";
/* The first two approved-village missions use one shared painted art system.
 * This module only replaces illustration and scene presentation;
 * graph connectivity, device obstacles, input, scoring and saves belong to the
 * existing lesson engines. All four contacts retain the 400 x 250 coordinates. */
(function(){
 if(!document.documentElement.classList.contains("akari-painted"))return;
 const images={battery:"./assets/mission1/battery.webp",bulbDark:"./assets/mission1/bulb-dark.webp",bulbLit:"./assets/mission1/bulb-lit.webp",villageDark:"./assets/mission1/village-dark.webp",villageLit:"./assets/mission1/village-lit.webp",shortBurst:"./assets/mission1/short-burst-sheet.webp"};
 const shortArt=new Image();shortArt.src=images.shortBurst;
 const originalWorkbench=window.AkariArt.workbench;
 const originalVillage=window.AkariCircuitVillage.board;
 window.AkariArt.workbench=function(wires,lit,stage){
  const svg=originalWorkbench(wires,lit);
  if(stage!==1&&stage!==2)return svg;
  const battery='<g class="battery-model painted-battery" role="group" aria-label="1.5ボルト乾電池。左の出っぱりが＋極、右の平らな面が−極">'+
   '<image class="painted-battery-image" href="'+images.battery+'" x="40" y="124" width="138" height="55" preserveAspectRatio="none"/></g>';
  const bulb='<g class="bulb-model painted-bulb" role="group" aria-label="豆電球。ねじの金属と底の金属が別々の接点。間の黒い部分は電気を通さない">'+
   '<image class="painted-bulb-image" href="'+(lit?images.bulbLit:images.bulbDark)+'" x="268" y="20" width="90" height="170"/>'+
   '<path d="M268 152H289M313 186V210" class="painted-contact-leads" stroke="#cdd4cc" stroke-width="4" stroke-linecap="round" fill="none"/>'+
   '<circle cx="268" cy="152" r="4" fill="#f3d59c"/><circle cx="313" cy="210" r="4" fill="#f3d59c"/></g>';
  const lightDefs='<radialGradient id="paintedDeskLight"><stop stop-color="#fff4cc" stop-opacity=".95"/><stop offset=".45" stop-color="#ffe3a0" stop-opacity=".7"/><stop offset=".8" stop-color="#ffd189" stop-opacity=".3"/><stop offset="1" stop-color="#ffc068" stop-opacity="0"/></radialGradient>'+
   '<radialGradient id="paintedContactShadow"><stop stop-color="#281b19" stop-opacity=".55"/><stop offset="1" stop-color="#281b19" stop-opacity="0"/></radialGradient>';
  const tableLight='<g class="painted-table-light" aria-hidden="true" pointer-events="none">'+
   '<ellipse class="painted-light-pool" cx="313" cy="212" rx="94" ry="33" fill="url(#paintedDeskLight)"/>'+
   '<ellipse cx="110" cy="183" rx="73" ry="11" fill="url(#paintedContactShadow)"/>'+
   '<ellipse cx="313" cy="212" rx="39" ry="9" fill="url(#paintedContactShadow)"/></g>';
  return svg.replace('</defs>',lightDefs+'</defs>')
   .replace(/<g class="battery-model"[\s\S]*?<\/g>/,tableLight+battery)
   .replace(/<g class="bulb-model"[\s\S]*?<\/g>/,bulb)
   .replace(/(<g class="lead-on-top"[^>]*>)([\s\S]*?)(<\/g>)/g,(whole,start,paths,end)=>{
    const d=paths.match(/ d="([^"]+)"/)?.[1];
    return d?start+paths+'<path class="painted-wire-sheen" d="'+d+'" fill="none" pointer-events="none"/>'+end:whole;
   });
 };
 window.AkariCircuitVillage.board=function(stage){
  if(stage!==1&&stage!==2)return originalVillage(stage);
  const repair=stage===2;
  return '<div class="painted-world" data-painted-scene="'+stage+'" aria-hidden="true">'+
   '<div class="painted-village"><img class="painted-world-dark" src="'+images.villageDark+'" alt="" width="1536" height="456" draggable="false">'+
   '<img class="painted-world-lit" style="opacity:0" src="'+images.villageLit+'" alt="" width="1536" height="456" draggable="false">'+
   '<span class="painted-village-revival" aria-hidden="true"></span>'+
   '<span class="painted-place">'+(repair?'ひかりの村・2':'ひかりの村')+'</span><span class="painted-live-state">'+
   '<span class="painted-off-label">'+(repair?'きれた どう線を なおそう':'あかりを ともそう')+'</span><span class="painted-on-label">'+(repair?'まちの あかりが もどった！':'ひかりが もどった！')+'</span></span></div>'+
   '<div class="painted-desk"></div></div>';
 };
 document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(()=>{
  const main=document.querySelector(".main"),workspace=document.getElementById("workspace");
  const scene=document.getElementById("storyScene"),heading=document.querySelector(".quest-head");
  const progress=document.getElementById("sceneProgress"),celebration=document.getElementById("stageCelebration");
  const shortFlash=document.getElementById("spark"),free=document.getElementById("freeLabToggle");
  const steps=document.getElementById("learningSteps");
  if(!workspace||!main||!heading||!scene)return;
  const originalShort=window.AkariEffects?.shortCircuit;
  let wasLit=false,effectTicket=0,shortPending=false,clearShort=null;
  const stopShort=()=>{
   effectTicket++;shortPending=false;clearShort?.();clearShort=null;
  };
  if(originalShort)window.AkariEffects.shortCircuit=function(){
   const freePanel=document.getElementById("freeLabPanel");
   if(!workspace.querySelector(".painted-world")||(freePanel&&!freePanel.hidden))return originalShort();
   stopShort();shortPending=true;const ticket=effectTicket;
   // The lesson calls its warning before replacing the workspace. Render the
   // effect on the measured NEW board, never the detached pre-short circuit.
   const ready=shortArt.complete&&shortArt.naturalWidth?Promise.resolve():shortArt.decode().catch(()=>{});
   ready.then(()=>requestAnimationFrame(()=>{
    if(ticket!==effectTicket)return;
    shortPending=false;
    const board=workspace.querySelector(".circuit-board.is-short:has(.painted-world)");
    if(!board)return;
    const event=document.createElement("div");
    event.className="short-event painted-short-event";
    event.setAttribute("data-short-event","");event.setAttribute("role","img");
    event.setAttribute("aria-label","ショート。電池があぶない。線を外そう。");
    event.innerHTML='<div class="painted-short-source" aria-hidden="true"><div class="painted-short-frame"></div></div>'+
     '<div class="painted-short-alert"><strong>ショート！</strong><small>あぶない！ せんを はずそう</small></div>';
    board.append(event);shortFlash?.classList.remove("active");
    const layout=()=>{
     const svg=board.querySelector(".circuit-svg-v2"),matrix=svg?.getScreenCTM();
     if(!matrix)return;
     const point=new DOMPoint(108,150).matrixTransform(matrix),r=board.getBoundingClientRect();
     const size=svg.getBoundingClientRect().width/400*155;
     const source=event.querySelector(".painted-short-source"),alert=event.querySelector(".painted-short-alert");
     source.style.cssText='width:'+size+'px;height:'+size+'px;left:'+(point.x-r.left+board.scrollLeft-size/2)+'px;top:'+(point.y-r.top+board.scrollTop-size*.76)+'px';
     alert.style.left=(board.scrollLeft+board.clientWidth/2)+'px';
     alert.style.top=(parseFloat(getComputedStyle(board).getPropertyValue("--painted-village-height"))||126)+7+'px';
    };
    layout();const controller=new AbortController();
    board.addEventListener("scroll",layout,{passive:true,signal:controller.signal});
    const resize=new ResizeObserver(layout);resize.observe(board);
    const timer=setTimeout(()=>{clearShort?.();clearShort=null;},1750);
    clearShort=()=>{clearTimeout(timer);controller.abort();resize.disconnect();event.remove();};
   }));
  };
  function sync(){
   const scene=workspace.querySelector(".painted-world[data-painted-scene]");
   const stage2Transfer=!!workspace.querySelector(".transfer-puzzle")&&
     document.getElementById("storyScene")?.dataset.stage==="2";
   const active=!!scene||stage2Transfer;
   // The science transfer is still part of mission 2: never drop back to
   // unrelated webpage styling between repairing the wire and explaining it.
   const value=scene?.dataset.paintedScene||(stage2Transfer?"2":"");
   if(document.body.dataset.paintedMission!==value)document.body.dataset.paintedMission=value;
   const board=workspace.querySelector(".circuit-board:has(.painted-world)");
   const lit=!!board?.classList.contains("is-lit")&&!board?.classList.contains("is-short");
   if(lit){
    board.querySelector(".painted-world-lit")?.style.removeProperty("opacity");
    if(!wasLit)board.classList.add("painted-light-enter");
   }
   wasLit=lit;
   // Restarting or cutting must cancel stale fire immediately. A re-rendered
   // short board can discard the transient effect but keeps its persistent warning.
   if(!board?.classList.contains("is-short")&&(clearShort||shortPending))stopShort();
   if(active){
    if(progress&&!heading.contains(progress))heading.append(progress);
    for(const el of [celebration,shortFlash])if(el&&el.parentElement!==document.body)document.body.append(el);
    const after=steps||workspace;
    if(free&&after.nextElementSibling!==free)after.after(free);
   }else{
    if(progress&&progress.parentElement!==scene)scene.insertBefore(progress,scene.querySelector(".scene-caption"));
    for(const el of [celebration,shortFlash])if(el&&el.parentElement!==scene)scene.append(el);
    if(free&&free.nextElementSibling!==workspace)workspace.before(free);
   }
  }
  new MutationObserver(sync).observe(workspace,{childList:true});
  sync();
 }));
})();
