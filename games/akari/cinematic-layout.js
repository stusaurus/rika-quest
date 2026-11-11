"use strict";
/* Opt-in game HUD. Reuses the real status nodes; keeps physics and save intact.
 * Restore the default DOM when entering non-cinematic missions 4–14. */
(function(){
 if(!document.documentElement.classList.contains("akari-cinematic"))return;
 document.addEventListener("DOMContentLoaded",()=>{
  const main=document.querySelector(".main");
  const scene=document.getElementById("storyScene");
  const heading=main?.querySelector(".quest-head");
  const workspace=document.getElementById("workspace");
  const progress=document.getElementById("sceneProgress");
  const celebration=document.getElementById("stageCelebration");
  const shortFlash=document.getElementById("spark");
  const freeLabToggle=document.getElementById("freeLabToggle");
  const steps=document.getElementById("learningSteps");
  if(!main||!scene||!heading||!workspace)return;
  const sync=()=>{
   if(main.classList.contains("town-immersive")){
    const afterCircuit=steps||workspace;
    if(freeLabToggle&&afterCircuit.nextElementSibling!==freeLabToggle)
     afterCircuit.after(freeLabToggle);
    if(progress&&!heading.contains(progress))heading.append(progress);
    if(celebration&&celebration.parentElement!==document.body)document.body.append(celebration);
    if(shortFlash&&shortFlash.parentElement!==document.body)document.body.append(shortFlash);
   }else{
    // No layout changes survive when the art pilot ends at mission 3.
    if(freeLabToggle&&freeLabToggle.nextElementSibling!==workspace)
     workspace.before(freeLabToggle);
    if(progress&&progress.parentElement!==scene)
     scene.insertBefore(progress,scene.querySelector(".scene-caption"));
    if(celebration&&celebration.parentElement!==scene)
     scene.insertBefore(celebration,scene.querySelector(".scene-caption"));
    if(shortFlash&&shortFlash.parentElement!==scene)scene.append(shortFlash);
   }
  };
  sync();
  new MutationObserver(sync).observe(main,{attributes:true,attributeFilter:["class"]});
 });
})();