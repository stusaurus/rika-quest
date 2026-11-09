"use strict";
/* Stage 3 pilot: science stays in one workspace. The existing inspection,
   materials, experiments and repair controls are MOVED, never cloned, so
   data-bridge-* clicks keep using the same authoritative game engine. */
(function(){
 let opened="";
 let lastInspection="";
 const get=id=>document.getElementById(id);
 const sides=["left","right"];
 // Show a concise cue only while horizontal options remain out of sight.
 // Keep it outside the circuit and do not alter any science state.
 function attachShelfGuide(panel){
  if(!panel||panel.hidden)return;
  const strip=panel.querySelector(".free-lab-tools, .free-lab-samples, .bridge-sites, .bridge-materials");
  if(!strip)return;
  let cue=strip.nextElementSibling;
  if(!cue||!cue.classList.contains("shelf-scroll-hint")){
   cue=document.createElement("p");
   cue.className="shelf-scroll-hint";
   cue.hidden=true;
   cue.setAttribute("aria-hidden","true");
   strip.insertAdjacentElement("afterend",cue);
  }
  const refresh=()=>{
   if(panel.hidden||!strip.isConnected){cue.hidden=true;return;}
   const max=strip.scrollWidth-strip.clientWidth;
   const canScroll=max>12&&getComputedStyle(strip).overflowX!=="hidden";
   if(canScroll){
    strip.tabIndex=0;
    strip.setAttribute("role","region");
    strip.setAttribute("aria-label","よこに動かしてえらべる道具と材料");
   }else{
    strip.removeAttribute("tabindex");
    strip.removeAttribute("role");
    strip.removeAttribute("aria-label");
   }
   cue.hidden=!canScroll||strip.scrollLeft>=max-8;
   if(!cue.hidden)cue.textContent=strip.scrollLeft>12?"→ 右にも あるよ":"→ よこに うごかせるよ";
  };
  if(strip.dataset.akariShelfGuideBound!=="yes"){
   strip.dataset.akariShelfGuideBound="yes";
   strip.addEventListener("scroll",refresh,{passive:true});
  }
  requestAnimationFrame(refresh);
 }
 window.AkariShelfGuide={attach:attachShelfGuide};
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
   if(opened){
    attachShelfGuide(shell.querySelector('[data-dock-panel="'+opened+'"]'));
    shell.querySelector('[data-dock-panel="'+opened+'"] button:not([disabled])')?.focus({preventScroll:true});
   }
 };
 function render(root,stage){
   if(stage!==3){opened="";lastInspection="";return;}
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
   const readout=document.createElement("aside");
   readout.className="akari-dock-readout";
   readout.setAttribute("role","status");
   readout.setAttribute("aria-live","polite");
   readout.setAttribute("aria-label","回路で みつけたこと");
   readout.hidden=true;
   shell.append(makeTab("left","どうぐ","🔋","akariToolsDrawer"),readout,center,makeTab("right","ざいりょう","🧱","akariMaterialsDrawer"),left,right);
   lab.insertBefore(shell,circuit);
   center.append(circuit);
   // The circuit is the entrypoint. No observation or answer is revealed
   // before the learner actively inspects one of the three sites.
   const inspected=sections[0].querySelectorAll(".bridge-site.found").length;
   const focus=document.createElement("div");
   focus.className="akari-board-focus";
   focus.setAttribute("aria-label","回路の いまの しらべどころ");
   const repairReady=sections.some(section=>section.querySelector(".bridge-slot-actions"));
   const explained=lab.querySelector(".bridge-why");
   // Use the authoritative findings, and reveal them only after inspection.
   const inspectedSite=window.AkariBridge?.sites?.find(site=>site.id===lastInspection);
   const justFound=inspectedSite&&!!sections[0].querySelector('[data-bridge-inspect="'+lastInspection+'"].found');
   focus.setAttribute("aria-live","polite");
   if(inspected<3){
    focus.innerHTML='<strong>🔎 '+(inspected?"つぎは どこを しらべる？":"どこから しらべる？")+'</strong><span class="akari-focus-count">'+inspected+' / 3</span>';
    const markers=document.createElement("div");
    markers.className="akari-inspection-hotspots";
    for(const spot of [
     {id:"battery",label:"でんち",description:"乾電池をしらべる"},
     {id:"lamp",label:"まめ電球",description:"豆電球をしらべる"},
     {id:"return",label:"もどる線",description:"もどる線をしらべる"}
    ]){
     const found=!!sections[0].querySelector('[data-bridge-inspect="'+spot.id+'"].found');
     const button=document.createElement("button");
     button.type="button";
     button.className="akari-inspection-pin"+(found?" found":"")+(found&&spot.id===lastInspection?" is-latest":"");
     button.dataset.dockInspect=spot.id;
     button.setAttribute("aria-label",spot.description+(found?"・しらべた":""));
     button.setAttribute("aria-pressed",String(found));
     button.innerHTML='<span aria-hidden="true">'+(found?"✓":"🔎")+'</span><strong>'+spot.label+'</strong>';
     markers.append(button);
    }
    circuit.append(markers);
   }else if(!repairReady){
    focus.innerHTML='<strong>🔍 3かしょ しらべた！</strong><button type="button" data-dock-jump="right">🧱 ざいりょうを えらぶ →</button>';
   }else if(explained){
    focus.innerHTML='<strong>💡 光った！ なぜかな？</strong>';
   }else{
    focus.innerHTML='<strong>🧩 すき間 A・B を なおそう</strong><button type="button" data-dock-jump="right">🧱 ざいりょうを みる →</button>';
   }
   if(justFound){
    const names={battery:"でんち",lamp:"まめ電球",return:"もどる線"};
    const result=document.createElement("div");
    result.className="akari-observation";
    const heading=document.createElement("strong");
    heading.textContent="👀 "+names[lastInspection]+"を しらべた！";
    const finding=document.createElement("span");
    finding.className="akari-observation-finding";
    finding.textContent=inspectedSite.finding;
    result.append(heading,finding);
    readout.hidden=false;
    const caption=document.createElement("strong");
    caption.className="akari-readout-title";
    caption.textContent="👀 みつけたこと";
    readout.append(caption,result);
   }
   center.insertBefore(focus,circuit);
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
   if(repair){
     center.append(repair);
     // Put the action exactly on the two gaps in the actual circuit, without
     // duplicating the model or changing the existing repair state machine.
     const overlay=document.createElement("div");
     overlay.className="akari-dock-gap-controls";
     for(const slot of ["a","b"]){
       const source=repair.querySelector('[data-bridge-place="'+slot+'"]');
       if(!source)continue;
       const target=document.createElement("button");
       target.type="button";target.dataset.dockPlace=slot;
       target.className="akari-dock-gap akari-dock-gap-"+slot;
       target.disabled=source.disabled;
       target.setAttribute("aria-label","修理 "+slot.toUpperCase()+" に えらんだ材料を いれる");
       target.textContent=slot.toUpperCase()+" に いれる";
       overlay.append(target);
     }
     circuit.append(overlay);
     const note=document.createElement("p");
     note.className="akari-dock-drop-note";
     note.textContent="右から 材料を えらんで、回路の A・B に いれよう。";
     center.insertBefore(note,repair);
   }
   const info=lab.querySelector(".bridge-quest-strip");
   info?.classList.add("akari-dock-status");
   if(opened)attachShelfGuide(shell.querySelector('[data-dock-panel="'+opened+'"]'));
 }
 function attach(root){
   if(!root||root.dataset.akariDockReady)return;
   root.dataset.akariDockReady="yes";
   // Capture original shelf taps before the game controller replaces its DOM.
   // Bubble listeners can observe a detached target after renderWorkspace().
   root.addEventListener("click",event=>{
    const site=event.target.closest("[data-bridge-inspect]");
    if(site&&root.contains(site))lastInspection=site.dataset.bridgeInspect;
   },true);
   root.addEventListener("click",event=>{
     const inspection=event.target.closest("[data-dock-inspect]");
     if(inspection&&root.contains(inspection)){
      const id=inspection.dataset.dockInspect;
      lastInspection=id;
      root.querySelector('.akari-dock-left [data-bridge-inspect="'+id+'"]')?.click();
      requestAnimationFrame(()=>{
       const observation=root.querySelector(".akari-observation");
       if(observation){
        const box=observation.getBoundingClientRect();
        if(box.top<72||box.bottom>window.innerHeight-12){
         observation.scrollIntoView({block:"nearest",behavior:"instant"});
        }
       }
       const marker=root.querySelector('[data-dock-inspect="'+id+'"]');
       (marker||root.querySelector("[data-dock-jump]"))?.focus({preventScroll:true});
      });
      return;
     }
     const jump=event.target.closest("[data-dock-jump]");
     if(jump&&root.contains(jump)){
      if(opened!=="right")toggle(root,"right");
      return;
     }
     const insertion=event.target.closest("[data-dock-place]");
     if(insertion&&root.contains(insertion)){
       const slot=insertion.dataset.dockPlace;
       root.querySelector('.bridge-slot-actions [data-bridge-place="'+slot+'"]')?.click();
       return;
     }
     const button=event.target.closest("[data-dock-tab]");
     if(!button||!root.contains(button))return;
     toggle(root,button.dataset.dockTab);
   });
   root.addEventListener("keydown",event=>{
     if(event.key!=="Escape"||!opened||!root.querySelector(".akari-dock"))return;
     const previous=opened;toggle(root,previous);
     root.querySelector('[data-dock-tab="'+previous+'"]')?.focus();
   });
 }
 function decorate(root,stage){attach(root);render(root,stage);}
 window.AkariDock={decorate,collapse:()=>{opened="";}};
})();