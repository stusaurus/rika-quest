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
   const inspected=sections[0].querySelectorAll(".bridge-site.found").length;
   const repairReady=sections.some(section=>section.querySelector(".bridge-slot-actions"));
   const directTesting=inspected===3;
   const shell=document.createElement("div");
   shell.className="akari-dock";
   shell.dataset.open=opened;
   shell.setAttribute("aria-label","中央の回路に選んだ材料を直接はめる");
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
   shell.append(makeTab("left","しらべる","🔎","akariToolsDrawer"),readout,center,makeTab("right","きろく","📝","akariMaterialsDrawer"),left,right);
   lab.insertBefore(shell,circuit);
   center.append(circuit);
   // The circuit is the entrypoint. No observation or answer is revealed
   // before the learner actively inspects one of the three sites.
   const focus=document.createElement("div");
   focus.className="akari-board-focus";
   focus.setAttribute("aria-label","回路の いまの しらべどころ");
   const explained=lab.querySelector(".bridge-why");
   // Restore the memo cards from actual inspection state after each rerender.
   // Nothing undiscovered or merely guessed can appear in this list.
   const inspectedSites=(window.AkariBridge?.sites||[]).filter(site=>
    !!sections[0].querySelector('[data-bridge-inspect="'+site.id+'"].found'));
   focus.setAttribute("aria-live","polite");
   if(inspected<3){
    focus.innerHTML='<strong>🔎 '+(inspected?"つぎは どこを しらべる？":"どこから しらべる？")+'</strong><span class="akari-focus-count">'+inspected+' / 3</span>';
    const markers=document.createElement("div");
    markers.className="akari-inspection-hotspots";
    // Leader lines visibly connect each reachable touch target with the
    // real circuit element, without covering its open contacts.
    const leaders=document.createElementNS("http://www.w3.org/2000/svg","svg");
    leaders.classList.add("akari-inspection-leaders");
    leaders.setAttribute("viewBox","0 0 680 340");
    leaders.setAttribute("aria-hidden","true");
    for(const site of window.AkariBridge.sites){
     const line=document.createElementNS("http://www.w3.org/2000/svg","path");
     line.setAttribute("d","M"+site.diagram.pin.x+" "+site.diagram.pin.y+"L"+site.diagram.x+" "+site.diagram.y);
     line.setAttribute("data-inspection-leader",site.id);
     leaders.append(line);
     const endpoint=document.createElementNS("http://www.w3.org/2000/svg","circle");
     endpoint.setAttribute("cx",String(site.diagram.x));
     endpoint.setAttribute("cy",String(site.diagram.y));
     endpoint.setAttribute("r","8");
     endpoint.setAttribute("data-inspection-endpoint",site.id);
     leaders.append(endpoint);
    }
    markers.append(leaders);
    for(const site of window.AkariBridge.sites){
     const spot={id:site.id,label:site.id==="battery"?"A":site.id==="return"?"B":"まめ電球",
      description:site.name+"を しらべる"};
     const found=!!sections[0].querySelector('[data-bridge-inspect="'+spot.id+'"].found');
     const button=document.createElement("button");
     button.type="button";
     button.className="akari-inspection-pin"+(found?" found":"")+(found&&spot.id===lastInspection?" is-latest":"");
     button.dataset.dockInspect=spot.id;
     // The dotted leader points to site.diagram.x/y; the actual button
     // sits aside so the learner can inspect the two separated wire ends.
     button.style.setProperty("--akari-pin-x",(site.diagram.pin.x/680*100).toFixed(3)+"%");
     button.style.setProperty("--akari-pin-y",(site.diagram.pin.y/340*100).toFixed(3)+"%");
     button.setAttribute("aria-label",spot.description+(found?"・しらべた":""));
     button.setAttribute("aria-pressed",String(found));
     button.innerHTML='<span aria-hidden="true">'+(found?"✓":"🔎")+'</span><strong>'+spot.label+'</strong>';
     markers.append(button);
    }
    circuit.append(markers);
   }else if(explained){
    focus.innerHTML='<strong>💡 光った！ どうしてかな？</strong>';
   }else{
    const selected=sections.some(section=>section.querySelector(".bridge-material.selected"));
    focus.innerHTML='<strong>'+(selected?"🧩 えらんだ材料を A か B に はめよう":"🧱 材料を えらぼう")+'</strong>';
   }
   if(inspectedSites.length){
    readout.hidden=false;
    const caption=document.createElement("div");
    caption.className="akari-memo-heading";
    const title=document.createElement("strong");
    title.className="akari-readout-title";
    title.textContent="📝 わかったこと";
    const count=document.createElement("span");
    count.className="akari-memo-count";
    count.textContent=inspectedSites.length+" / 3";
    caption.append(title,count);
    const notes=document.createElement("div");
    notes.className="akari-memo-notes";
    notes.tabIndex=0;
    notes.setAttribute("role","region");
    notes.setAttribute("aria-label","しらべて わかったことの メモ");
    for(const site of inspectedSites){
     const result=document.createElement("div");
     result.className="akari-observation"+(site.id===lastInspection?" is-latest":"");
     result.dataset.observedSite=site.id;
     const heading=document.createElement("strong");
     heading.textContent="✓ "+site.name;
     const finding=document.createElement("span");
     finding.className="akari-observation-finding";
     finding.textContent=site.finding;
     result.append(heading,finding);
     notes.append(result);
    }
    readout.append(caption,notes);
   }
   center.insertBefore(focus,circuit);
   const leftIntro=document.createElement("p");
   leftIntro.className="akari-dock-intro";
   leftIntro.textContent="回路の 🔎 を さわって、わかったことを メモに のこそう。";
   left.append(leftIntro,sections[0]);
   const rightIntro=document.createElement("p");
   rightIntro.className="akari-dock-intro";
   rightIntro.textContent="回路で ためした きろく。";
   right.append(rightIntro);
   const materialsSection=sections.find(section=>section.querySelector(".bridge-materials"));
   if(materialsSection)right.append(materialsSection);
   else{
     const waiting=document.createElement("p");
     waiting.className="akari-dock-waiting";
     waiting.textContent="まず 回路の 🔎 を 3つ さわろう。";
     right.append(waiting);
   }
   // Move the original four materials beneath the circuit (no cloning).
   // Inserting either material into A or B is the actual live experiment.
   if(directTesting&&materialsSection){
     const desk=document.createElement("section");
     desk.className="akari-sample-desk";
     desk.setAttribute("aria-label","A と B に はめる 材料");
     const heading=document.createElement("strong");
     heading.className="akari-sample-heading";
     heading.textContent="🧱 材料を えらぶ";
     desk.append(heading);
     const choices=materialsSection.querySelector(".bridge-materials");
     if(choices){
       choices.classList.add("akari-sample-choices");
       desk.append(choices);
     }
     center.append(desk);
   }
   // The central diagram remains visible during material selection and repair.
   // After enough contrasting evidence, repair controls appear immediately below.
   const repair=sections.find(x=>x.querySelector(".bridge-slot-actions"));
   if(repair){
     center.append(repair);
     const history=repair.querySelector(".bridge-direct-history");
     if(history)right.append(history);
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
       target.setAttribute("aria-label","切れ目 "+slot.toUpperCase()+" に えらんだ材料を はめる");
       target.textContent=slot.toUpperCase()+" に はめる";
       overlay.append(target);
     }
     circuit.append(overlay);
     const note=document.createElement("p");
     note.className="akari-dock-drop-note";
     note.textContent="材料を えらんで、回路の A と B に はめよう。";
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
    if(site&&root.contains(site)){
     lastInspection=site.dataset.bridgeInspect;
     // Third fresh finding closes any leftover lookup panel, without
     // changing the recording or its restored save state.
     const seen=root.querySelectorAll(".akari-dock-left .bridge-site.found").length;
     if(seen===2&&!site.classList.contains("found"))opened="";
    }
   },true);
   root.addEventListener("click",event=>{
     const inspection=event.target.closest("[data-dock-inspect]");
     if(inspection&&root.contains(inspection)){
      const id=inspection.dataset.dockInspect;
      lastInspection=id;
      root.querySelector('.akari-dock-left [data-bridge-inspect="'+id+'"]')?.click();
      requestAnimationFrame(()=>{
       const observation=root.querySelector(".akari-observation.is-latest");
       if(observation){
        const strip=observation.closest(".akari-memo-notes");
        const box=strip.getBoundingClientRect();
        if(box.top<72||box.bottom>window.innerHeight-12){
         strip.scrollIntoView({block:"nearest",behavior:"instant"});
        }
        // On narrow screens the latest memo must be visible within the strip.
        const card=observation.getBoundingClientRect();
        if(card.left<box.left||card.right>box.right){
         observation.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});
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