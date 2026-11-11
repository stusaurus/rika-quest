"use strict";
/* Layout only. Physic and save state stay with the existing mission engine.
 * The external scenic banner is redundant because the actual circuitry
 * already contains the same village. Relocate two existing HUD elements
 * rather than cloning interactive state. */
(function(){
 if(!document.documentElement.classList.contains("akari-cinematic"))return;
 const configure=()=>{
  const main=document.querySelector(".main.town-immersive");
  if(!main)return;
  const heading=main.querySelector(".quest-head");
  const progress=document.getElementById("sceneProgress");
  const workspace=document.getElementById("workspace");
  const freeLabToggle=document.getElementById("freeLabToggle");
  const learningSteps=document.getElementById("learningSteps");
  // This button is originally a sibling BEFORE #workspace. Never place it
  // inside #workspace: renderAll() replaces that subtree during wiring.
  const afterCircuit=learningSteps||workspace;
  if(freeLabToggle&&afterCircuit&&afterCircuit.nextElementSibling!==freeLabToggle)
   afterCircuit.after(freeLabToggle);
  const celebration=document.getElementById("stageCelebration");
  const shortFlash=document.getElementById("spark");
  if(progress&&heading&&!heading.contains(progress))heading.append(progress);
  if(celebration&&celebration.parentElement!==document.body)document.body.append(celebration);
  if(shortFlash&&shortFlash.parentElement!==document.body)document.body.append(shortFlash);
 };
 document.addEventListener("DOMContentLoaded",configure);
})();