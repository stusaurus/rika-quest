"use strict";
/* The first-mission art pilot is opt-in. This module only replaces rendering;
 * graph connectivity, device obstacles, input, scoring and saves belong to the
 * existing lesson engines. All four contacts retain the 400 x 250 coordinates. */
(function(){
 if(!document.documentElement.classList.contains("akari-painted"))return;
 const images={battery:"./assets/mission1/battery.webp",bulbDark:"./assets/mission1/bulb-dark.webp",bulbLit:"./assets/mission1/bulb-lit.webp",villageDark:"./assets/mission1/village-dark.webp",villageLit:"./assets/mission1/village-lit.webp"};
 const originalWorkbench=window.AkariArt.workbench;
 const originalVillage=window.AkariCircuitVillage.board;
 window.AkariArt.workbench=function(wires,lit,stage){
  const svg=originalWorkbench(wires,lit);
  if(stage!==1)return svg;
  const battery='<g class="battery-model painted-battery" role="group" aria-label="1.5ボルト乾電池。左の出っぱりが＋極、右の平らな面が−極">'+
   '<image class="painted-battery-image" href="'+images.battery+'" x="40" y="124" width="138" height="55" preserveAspectRatio="none"/></g>';
  const bulb='<g class="bulb-model painted-bulb" role="group" aria-label="豆電球。ねじの金属と底の金属が別々の接点。間の黒い部分は電気を通さない">'+
   '<image class="painted-bulb-image" href="'+(lit?images.bulbLit:images.bulbDark)+'" x="268" y="20" width="90" height="170"/>'+
   '<path d="M268 152H289M313 186V210" class="painted-contact-leads" stroke="#cdd4cc" stroke-width="4" stroke-linecap="round" fill="none"/>'+
   '<circle cx="268" cy="152" r="4" fill="#f3d59c"/><circle cx="313" cy="210" r="4" fill="#f3d59c"/></g>';
  return svg.replace(/<g class="battery-model"[\s\S]*?<\/g>/,battery)
   .replace(/<g class="bulb-model"[\s\S]*?<\/g>/,bulb);
 };
 window.AkariCircuitVillage.board=function(stage){
  if(stage!==1)return originalVillage(stage);
  return '<div class="painted-world" aria-hidden="true">'+
   '<div class="painted-village"><img class="painted-world-dark" src="'+images.villageDark+'" alt="" width="1536" height="456" draggable="false">'+
   '<img class="painted-world-lit" style="opacity:0" src="'+images.villageLit+'" alt="" width="1536" height="456" draggable="false">'+
   '<span class="painted-place">ひかりの村</span><span class="painted-live-state">'+
   '<span class="painted-off-label">あかりを ともそう</span><span class="painted-on-label">ひかりが もどった！</span></span></div>'+
   '<div class="painted-desk"></div></div>';
 };
 document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(()=>{
  const main=document.querySelector(".main"),workspace=document.getElementById("workspace");
  const scene=document.getElementById("storyScene"),heading=document.querySelector(".quest-head");
  const progress=document.getElementById("sceneProgress"),celebration=document.getElementById("stageCelebration");
  const shortFlash=document.getElementById("spark"),free=document.getElementById("freeLabToggle");
  const steps=document.getElementById("learningSteps");
  if(!workspace||!main||!heading||!scene)return;
  function sync(){
   const active=!!workspace.querySelector(".painted-world");
   const value=active?"1":"";
   if(document.body.dataset.paintedMission!==value)document.body.dataset.paintedMission=value;
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
