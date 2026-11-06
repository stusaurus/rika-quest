"use strict";
/* Stage 3 pilot: science stays in one workspace. The existing inspection,
   materials, experiments and repair controls are MOVED, never cloned, so
   data-bridge-* clicks keep using the same authoritative game engine. */
(function(){
 let opened="";
 const get=id=>document.getElementById(id);
 const sides=["left","right"];
 const toggle=(root,side)=>{
   opened=opened===side?"":side;
   const shell=root.querySelector(".akari-dock");
   if(!shell)return;
   shell.dataset.open=opened;
   sides.forEach(name=>{
     const tab=shell.querySelector('[data-dock-tab="'+name+'"]');
     const panel=shell.querySelector('[data-dock-panel="'+name+'"]');
     if(!tab||!panel)return;
     tab.setAttribute("aria-expanded",String(name===opened));
     panel.hidden=name!==opened;
   });
   if(opened)shell.querySelector('[data-dock-panel="'+opened+'"] button:not([disabled])')?.focus({preventScroll:true});
 };
 function render(root,stage){
   if(stage!==3){opened="";return;}
   const lab=root?.querySelector(".bridge-lab");
   if(!lab||lab.querySelector(".akari-dock"))return;
   const circuit=lab.querySelector(":scope > .bridge-circuit");
   const sections=[...lab.querySelectorAll(":scope > .bridge-section")];
   if(!circuit||!sections[0])return;
   const shell=document.createElement("div");
   shell.className="akari-dock";
   shell.dataset.open=opened;
   shell.setAttribute("aria-label","回路を真ん中にして、左右から道具と材料を引き出す");
   const left=document.createElement("div");
   left.className="akari-dock-drawer akari-dock-left";
   left.dataset.dockPanel="left";left.id="akariToolsDrawer";
   left.hidden=opened!=="left";
   const right=document.createElement("div");
   right.className="akari-dock-drawer akari-dock-right";
   right.dataset.dockPanel="right";right.id="akariMaterialsDrawer";
   right.hidden=opened!=="right";
   const center=document.createElement("div");
   center.className="akari-dock-center";
   const makeTab=(side,title,icon,control)=>{
     const button=document.createElement("button");
     button.type="button";button.className="akari-dock-tab";
     button.dataset.dockTab=side;button.setAttribute("aria-expanded",String(opened===side));
     button.setAttribute("aria-controls",control);
     button.setAttribute("aria-label",title+"を ひきだす");
     button.innerHTML='<span aria-hidden="true">'+icon+'</span><strong>'+title+'</strong><span aria-hidden="true">'+(opened===side?"×":"‹ ›")+'</span>';
     return button;
   };
   shell.append(makeTab("left","どうぐ","🔋","akariToolsDrawer"),center,makeTab("right","ざいりょう","🧱","akariMaterialsDrawer"),left,right);
   lab.insertBefore(shell,circuit);
   center.append(circuit);
   const leftIntro=document.createElement("p");
   leftIntro.className="akari-dock-intro";
   leftIntro.textContent="でんち・まめ電球・もどる線を さわって しらべよう。";
   left.append(leftIntro,sections[0]);
   const rightIntro=document.createElement("p");
   rightIntro.className="akari-dock-intro";
   rightIntro.textContent="材料を えらんで、光るか ためそう。";
   right.append(rightIntro);
   if(sections[1]?.querySelector(".bridge-materials"))right.append(sections[1]);
   else{
     const waiting=document.createElement("p");
     waiting.className="akari-dock-waiting";
     waiting.textContent="まず 左の「どうぐ」で 3か所を しらべよう。";
     right.append(waiting);
   }
   // The central diagram remains visible during material selection and repair.
   // After enough contrasting evidence, repair controls appear immediately below.
   const repair=sections.find(x=>x.querySelector(".bridge-slot-actions"));
   if(repair)center.append(repair);
   const info=lab.querySelector(".bridge-quest-strip");
   info?.classList.add("akari-dock-status");
 }
 function attach(root){
   if(!root||root.dataset.akariDockReady)return;
   root.dataset.akariDockReady="yes";
   root.addEventListener("click",event=>{
     const button=event.target.closest("[data-dock-tab]");
     if(!button||!root.contains(button))return;
     toggle(root,button.dataset.dockTab);
   });
   root.addEventListener("keydown",event=>{
     if(event.key!=="Escape"||!opened||!root.querySelector(".akari-dock"))return;
     const previous=opened;opened="";toggle(root,previous);
     root.querySelector('[data-dock-tab="'+previous+'"]')?.focus();
   });
 }
 function decorate(root,stage){attach(root);render(root,stage);}
 window.AkariDock={decorate};
})();