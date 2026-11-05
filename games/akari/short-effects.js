"use strict";
/* A single clear, short, child-friendly safety signal for virtual battery shorts.
   Never changes the circuit model, rewards, or physics. */
(function(){
 let token=0;
 function showShort(){
  const current=++token;
  requestAnimationFrame(()=>{
   if(current!==token)return;
   const workspace=document.getElementById("workspace");
   const board=workspace?.querySelector(".circuit-board,.builder-board,.garden-design,.garden-schematic,.lab-panel");
   if(!board)return;
   workspace.querySelectorAll(".short-event").forEach(node=>node.remove());
   const event=document.createElement("div");
   event.className="short-event";
   event.setAttribute("data-short-event","");
   event.setAttribute("role","img");
   event.setAttribute("aria-label","ショート。電池があぶない。");
   event.innerHTML='<div class="short-glow"></div>'+
    '<div class="short-arc" aria-hidden="true"><span>⚡</span><span>✴</span><span>⚡</span></div>'+
    '<div class="short-flames" aria-hidden="true"><span>🔥</span><span>🔥</span><span>🔥</span></div>'+
    '<div class="short-smoke" aria-hidden="true"><span>☁</span><span>☁</span><span>☁</span></div>'+
    '<div class="short-alert"><strong>⚠ ショート！</strong><small>あぶない！ せんを はずそう</small></div>';
   board.append(event);
   const spark=document.getElementById("spark");
   spark?.classList.remove("active");
   setTimeout(()=>{if(current===token)event.remove();},1900);
  });
 }
 window.AkariEffects={...(window.AkariEffects||{}),shortCircuit:showShort};
})();
