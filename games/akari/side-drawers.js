"use strict";
/* Stage 3 pilot: science stays in one workspace. The existing inspection,
   materials, experiments and repair controls are MOVED, never cloned, so
   data-bridge-* clicks keep using the same authoritative game engine. */
(function(){
 let opened="";
 let lastInspection="";
 let dragging=null;
 let suppressClick=null;
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
    focus.innerHTML='<strong>💡 光った！ なぜかな？</strong>';
   }else{
    const selectedId=sections.find(section=>section.querySelector(".bridge-material.selected"))?.querySelector(".bridge-material.selected")?.dataset.bridgeSample;
    const selectedName=window.AkariBridge?.material(selectedId)?.name;
    focus.innerHTML='<strong>'+(selectedName?"② A か B へ はこぼう":"🖐 材料を A か B へ はこぼう")+'</strong>';
    if(selectedName){
     const badge=document.createElement("span");
     badge.className="akari-carrying-material";
     badge.textContent="🧱 "+selectedName;
     badge.setAttribute("aria-label","いま えらんでいるのは "+selectedName);
     focus.append(badge);
    }
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
     finding.textContent=site.memo||site.finding;
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
     heading.textContent="🧱 材料";
     desk.append(heading);
     const choices=materialsSection.querySelector(".bridge-materials");
     if(choices){
       choices.classList.add("akari-sample-choices");
       choices.setAttribute("aria-label","材料を つかんで A または B に はこぶ。タップでも えらべる");
       for(const card of choices.querySelectorAll("[data-bridge-sample]")){
        card.classList.add("akari-draggable-material");
        card.setAttribute("draggable","false");
        card.setAttribute("aria-description","指で 回路の A か B に はこべるよ。タップしてから A か B を おしてもよい");
       }
       desk.append(choices);
     }
     // The original material section is now empty; don't expose another
     // misleading "材料を選ぼう" panel inside the optional history drawer.
     materialsSection.remove();
     center.append(desk);
   }
   // The central diagram remains visible during material selection and repair.
   // After enough contrasting evidence, repair controls appear immediately below.
   const repair=sections.find(x=>x.querySelector(".bridge-slot-actions"));
   if(repair){
     repair.setAttribute("aria-label","A と B に 材料を はめて 回路を つくる");
     center.append(repair);
     const history=repair.querySelector(".bridge-direct-history");
     if(history)right.append(history);
     // Put the action exactly on the two gaps in the actual circuit, without
     // duplicating the model or changing the existing repair state machine.
     const overlay=document.createElement("div");
     overlay.className="akari-dock-gap-controls";
     const cards=[...center.querySelectorAll(".bridge-materials [data-bridge-sample]")];
     const chosenId=cards.find(card=>card.classList.contains("selected"))?.dataset.bridgeSample;
     const chosen=window.AkariBridge?.material(chosenId);
     for(const slot of ["a","b"]){
       const source=repair.querySelector('[data-bridge-place="'+slot+'"]');
       if(!source)continue;
       const placedId=cards.find(card=>card.querySelector("small")?.textContent.includes(slot.toUpperCase()+" に はめた"))?.dataset.bridgeSample;
       const placed=window.AkariBridge?.material(placedId);
       const target=document.createElement("button");
       target.type="button";
       target.dataset.dockPlace=slot;
       target.dataset.gapState=placed?"filled":"empty";
       target.className="akari-dock-gap akari-dock-gap-"+slot+(chosen?" is-ready":"");
       target.disabled=source.disabled;
       const letter=document.createElement("strong");
       letter.className="akari-gap-letter";
       letter.textContent=slot.toUpperCase();
       const contents=document.createElement("span");
       contents.className="akari-gap-contents";
       contents.textContent=placed?placed.name:"あいてる";
       target.append(letter,contents);
       target.setAttribute("aria-label",slot.toUpperCase()+(placed?"には "+placed.name+" が はいっている。":"は あいている。")+(chosen?" えらんだ "+chosen.name+" を はめる。":" まず 材料を えらぼう。"));
       overlay.append(target);
     }
     // Halo marks the real exposed A/B contacts, not a separate test panel.
     for(const slot of ["a","b"]){
      const pad=document.createElement("span");
      pad.className="akari-drop-pad akari-drop-pad-"+slot;
      pad.dataset.dropSlot=slot;
      pad.setAttribute("aria-hidden","true");
      overlay.append(pad);
     }
     circuit.append(overlay);
   }
   const info=lab.querySelector(".bridge-quest-strip");
   info?.classList.add("akari-dock-status");
   if(opened)attachShelfGuide(shell.querySelector('[data-dock-panel="'+opened+'"]'));
 }
 // Pointer Events work for a finger, mouse, and pen. Hit-testing accepts
 // either exposed A/B wire contacts or their accessible labeled buttons.
 function dropSlotAt(root,x,y){
   const svg=root.querySelector(".akari-dock .bridge-circuit-svg");
   if(!svg||typeof svg.getScreenCTM!=="function")return null;
   const matrix=svg.getScreenCTM(),point=svg.createSVGPoint();
   if(!matrix)return null;
   const radius=Math.max(34,Math.min(52,svg.getBoundingClientRect().width*.14));
   let found=null,score=Infinity;
   for(const slot of ["a","b"]){
     point.x=294;point.y=slot==="a"?55:287;
     const p=point.matrixTransform(matrix);
     const distance=Math.hypot(x-p.x,y-p.y);
     const button=root.querySelector('.akari-dock-gap[data-dock-place="'+slot+'"]');
     const r=button?.getBoundingClientRect();
     const onButton=!!r&&x>=r.left-12&&x<=r.right+12&&y>=r.top-12&&y<=r.bottom+12;
     if((distance<=radius||onButton)&&distance<score){found=slot;score=distance;}
   }
   return found;
 }
 function highlightDrops(root,slot){
   for(const pad of root.querySelectorAll(".akari-drop-pad")){
     pad.classList.toggle("is-over",pad.dataset.dropSlot===slot);
   }
   for(const button of root.querySelectorAll(".akari-dock-gap")){
     button.classList.toggle("drag-over",button.dataset.dockPlace===slot);
   }
 }
 function stopDrag(root){
   const previous=dragging;
   dragging=null;
   previous?.ghost?.remove();
   previous?.source?.classList.remove("is-drag-source");
   root.querySelector(".akari-dock")?.classList.remove("is-dragging-material");
   highlightDrops(root,null);
   if(previous?.source?.hasPointerCapture?.(previous.pointerId)){
     try{previous.source.releasePointerCapture(previous.pointerId);}catch{}
   }
   return previous;
 }
 function showDrag(root,g,x,y){
   if(!g.active){
     const ghost=document.createElement("div");
     ghost.className="akari-material-ghost";
     ghost.dataset.dragMaterial=g.id;
     ghost.setAttribute("aria-hidden","true");
     const artwork=g.source.querySelector(".bridge-material-art")?.cloneNode(true);
     if(artwork)ghost.append(artwork);
     const name=document.createElement("strong");
     name.textContent=window.AkariBridge?.material(g.id)?.name||"ざいりょう";
     ghost.append(name);
     document.body.append(ghost);
     g.ghost=ghost;
     g.active=true;
     g.source.classList.add("is-drag-source");
     root.querySelector(".akari-dock")?.classList.add("is-dragging-material");
   }
   g.ghost.style.left=x+"px";
   g.ghost.style.top=y+"px";
   g.over=dropSlotAt(root,x,y);
   highlightDrops(root,g.over);
   // Gentle edge scrolling keeps the upper sockets reachable on short phones.
   if(typeof window.scrollBy==="function"&&window.innerHeight){
     if(y<62)window.scrollBy(0,-14);
     else if(y>window.innerHeight-46)window.scrollBy(0,14);
   }
 }
 function attach(root){
   if(!root||root.dataset.akariDockReady)return;
   root.dataset.akariDockReady="yes";
   // A normal short tap still selects a sample; moving 9+ pixels turns it
   // into a material carried directly to the real electrical gap.
   root.addEventListener("pointerdown",event=>{
     if(dragging||!event.isPrimary||(event.pointerType==="mouse"&&event.button!==0))return;
     const source=event.target.closest(".akari-sample-desk [data-bridge-sample]");
     if(!source||!root.contains(source)||!root.querySelector(".akari-dock-gap-controls"))return;
     dragging={source,id:source.dataset.bridgeSample,pointerId:event.pointerId,x:event.clientX,y:event.clientY,active:false,ghost:null,over:null};
     try{source.setPointerCapture(event.pointerId);}catch{}
   });
   root.addEventListener("pointermove",event=>{
     const g=dragging;
     if(!g||g.pointerId!==event.pointerId)return;
     if(!g.active&&Math.hypot(event.clientX-g.x,event.clientY-g.y)<9)return;
     if(event.cancelable)event.preventDefault();
     showDrag(root,g,event.clientX,event.clientY);
   },{passive:false});
   root.addEventListener("pointerup",event=>{
     const g=dragging;
     if(!g||g.pointerId!==event.pointerId)return;
     if(!g.active){stopDrag(root);return;}
     const slot=dropSlotAt(root,event.clientX,event.clientY);
     if(event.cancelable)event.preventDefault();
     event.stopPropagation();
     stopDrag(root);
     const original=g.source;
     suppressClick={source:original,until:Date.now()+460};
     if(!slot)return;
     const specimen=window.AkariBridge?.material(g.id);
     const current=root.querySelector('.akari-dock-gap[data-dock-place="'+slot+'"] .akari-gap-contents')?.textContent;
     if(!specimen||current===specimen.name)return;
     // Existing material-click and slot-click handlers own all actual state:
     // this performs the SAME action sequence as the accessible tap fallback.
     const source=root.querySelector('.akari-sample-desk [data-bridge-sample="'+g.id+'"]');
     if(!source)return;
     source.click();
     const target=root.querySelector('.akari-dock-gap[data-dock-place="'+slot+'"]');
     if(target&&!target.disabled)target.click();
   });
   for(const name of ["pointercancel","lostpointercapture"]){
     root.addEventListener(name,event=>{
       if(dragging?.pointerId===event.pointerId){
         const previous=stopDrag(root);
         if(previous?.active)suppressClick={source:previous.source,until:Date.now()+460};
       }
     });
   }
   root.addEventListener("click",event=>{
     if(!suppressClick)return;
     if(Date.now()>suppressClick.until){suppressClick=null;return;}
     const source=suppressClick.source;
     if(event.target===source||source?.contains?.(event.target)){
       suppressClick=null;
       event.preventDefault();
       event.stopImmediatePropagation();
     }
   },true);
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