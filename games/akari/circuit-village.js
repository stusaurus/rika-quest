"use strict";
/* Decorative town INSIDE the actual touch-operated electrical workspaces.
 * No electrical edges are drawn here. Existing workbench wiring, selectable
 * terminals and all circuit truth tables remain the sole source of truth. */
(function(){
 function art(stage,scope){
  if(!window.AkariTownArt)return "";
  const source=window.AkariTownArt.render(stage);
  const safe=String(scope).replace(/[^a-zA-Z0-9_-]/g,"");
  return source.replace(/id="tc/g,'id="'+safe+'tc')
   .replace(/url\(#tc/g,"url(#"+safe+"tc");
 }
 function board(stage){
  return '<div class="circuit-village-backdrop" aria-hidden="true">'+
   '<svg class="circuit-village-art" viewBox="0 0 900 340" preserveAspectRatio="xMidYMid slice" focusable="false">'+
   art(stage,"work-"+stage+"-")+'</svg></div>';
 }
 function repair(){
  return '<svg class="circuit-village-art circuit-village-repair-art" viewBox="0 0 900 340" preserveAspectRatio="xMidYMid slice" x="0" y="0" width="680" height="340" aria-hidden="true" focusable="false">'+
   art(3,"repair-3-")+'</svg>';
 }
 function prediction(){
  return '<svg class="circuit-village-prediction-art" x="1" y="1" width="338" height="171" viewBox="0 0 900 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'+
   art(2,"prediction-2-")+'</svg>';
 }
 window.AkariCircuitVillage={board,repair,prediction};
})();