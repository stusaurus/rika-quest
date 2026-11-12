"use strict";
/* The painted town is a REWARD backdrop behind the real electric circuit.
 * Every glowing street lamp/window has the existing .is-lit gate. Decorative
 * lights NEVER represent conducting edges, connectors or electrical results.
 * Colors/geometry are original vector work; no rasterized text or controls. */
(function(){
 const H=(x,y,k,roof,wall)=>{
  const windows=[[-37,-68],[20,-68]].map(([wx,wy])=>
   '<g class="town-window-set">'+
   '<rect x="'+(wx-4)+'" y="'+(wy-6)+'" width="37" height="45" rx="6" fill="#173948" stroke="#e0c7ae" stroke-width="3"/>'+
   '<rect class="town-window" x="'+wx+'" y="'+wy+'" width="28" height="35" rx="4" fill="#4d7180"/>'+
   '<path d="M'+(wx+14)+' '+wy+'v35M'+wx+' '+(wy+17)+'h28" fill="none" stroke="#e3c8ab" stroke-width="2.5"/>'+
   '<path d="M'+wx+' '+(wy-8)+'v-5h28v5" fill="none" stroke="#f4d5b0" stroke-width="3"/>'+
   '<rect x="'+(wx-6)+'" y="'+(wy+36)+'" width="40" height="4" rx="2" fill="#766775"/>'+
   '</g>').join("");
  return '<g class="town-house" transform="translate('+x+' '+y+') scale('+k+')">'+
   '<ellipse cx="2" cy="5" rx="91" ry="12" fill="#041f32" opacity=".43"/>'+
   '<path d="M61-118L84-131V-6L61 2Z" fill="#526676" stroke="#2f465c" stroke-width="3"/>'+
   '<path d="M-72-128H70V0H-72Z" fill="'+wall+'" stroke="#765e6b" stroke-width="3"/>'+
   '<path d="M-68-111H65M-68-22H65" stroke="#fff4df" opacity=".22" stroke-width="3"/>'+
   '<path d="M-66-44H61" stroke="#453e56" opacity=".16" stroke-width="4"/>'+
   '<path d="M-91-121L-2-195L91-120L73-112L-2-172L-73-111Z" fill="'+roof+'" stroke="#eacbac" stroke-width="4" stroke-linejoin="round"/>'+
   '<path class="town-roof-detail" d="M-86-122L-2-186L86-122" stroke="#ffe6c2" opacity=".40" fill="none" stroke-width="3"/>'+
   '<path class="town-roof-detail" d="M-65-125L-2-175L63-125" stroke="#1d3b54" opacity=".26" fill="none" stroke-width="3.5"/>'+
   '<g stroke="#efc6a3" stroke-width="1.5" opacity=".26"><path d="M-63-126L-21-162M-27-126L11-163M9-126L46-155M48-126L67-140"/></g>'+
   '<path d="M34-193h19v32H34z" fill="#a57973" stroke="#f4d7b5" stroke-width="2"/>'+
   '<path d="M32-195h23v7H32z" fill="#e3b99c"/>'+
   '<ellipse class="town-home-glow" cx="0" cy="-74" rx="79" ry="73" fill="#ffcc73" opacity="0"/>'+
   windows+
   '<path d="M-12 0V-63Q3-75 19-60V0Z" fill="#534b63" stroke="#e1c5a4" stroke-width="3.5"/>'+
   '<path d="M0-57Q6-63 12-57" fill="none" stroke="#d7b48e" stroke-width="2"/>'+
   '<circle cx="11" cy="-28" r="3" fill="#ead49e"/>'+
   '<path d="M-20 1h46" stroke="#eacbad" stroke-width="8" stroke-linecap="round"/>'+
   '<path d="M-68-6h-28M73-6h31" stroke="#8b7775" stroke-width="5" stroke-linecap="round"/>'+
   '<path d="M-84-6q12-26 27-9q10-33 24-18" fill="none" stroke="#557d67" stroke-width="7" stroke-linecap="round"/>'+
   '<circle cx="-57" cy="-28" r="6" fill="#c77b78"/><circle cx="-73" cy="-21" r="5" fill="#e1ad89"/>'+
   '</g>';
 };
 const T=(x,y,k)=>{
  return '<g class="town-tree" transform="translate('+x+' '+y+') scale('+k+')">'+
   '<ellipse cx="0" cy="4" rx="50" ry="7" fill="#0e3042" opacity=".5"/>'+
   '<path d="M0 0V-136M0-72L-34-95M0-93L30-126" stroke="#554e52" stroke-width="15" fill="none" stroke-linecap="round"/>'+
   '<path d="M0 0V-136" stroke="#ad8170" stroke-width="5" opacity=".7"/>'+
   '<ellipse cx="-31" cy="-136" rx="42" ry="37" fill="#234d52" stroke="#65876d" stroke-width="4"/>'+
   '<ellipse cx="26" cy="-143" rx="41" ry="39" fill="#2c5e62" stroke="#7f9471" stroke-width="4"/>'+
   '<ellipse cx="-4" cy="-178" rx="48" ry="45" fill="#2d6463" stroke="#91aa7c" stroke-width="4"/>'+
   '<path d="M-47-159Q-34-181-22-176M3-200Q20-203 29-188" stroke="#b4bd83" stroke-width="5" stroke-linecap="round" opacity=".53" fill="none"/>'+
   '<g fill="#d8bb79" opacity=".85"><circle cx="-42" cy="-154" r="3"/><circle cx="29" cy="-163" r="4"/><circle cx="8" cy="-199" r="3"/><circle cx="18" cy="-126" r="3"/></g>'+
   '</g>';
 };
 const L=(x,y,k)=>{
  return '<g class="town-lamp" transform="translate('+x+' '+y+') scale('+k+')">'+
   '<ellipse cx="0" cy="0" rx="23" ry="6" fill="#061f30" opacity=".7"/>'+
   '<path d="M0 0V-139" stroke="#213747" stroke-width="12" stroke-linecap="round"/>'+
   '<path d="M-2-8V-143" stroke="url(#tcCopper)" stroke-width="7" stroke-linecap="round"/>'+
   '<path d="M-31-145L-24-171H24L31-145Z" fill="#415866" stroke="#e7c18f" stroke-width="4"/>'+
   '<rect class="town-lantern-glass" x="-21" y="-163" width="42" height="21" rx="3" fill="#6b929d" stroke="#e7c69e" stroke-width="2"/>'+
   '<path d="M-24-174H24L17-183H-17Z" fill="#536b73" stroke="#e9c38d" stroke-width="3"/>'+
   '<path d="M-33-143H33M-19-170L0-185L19-170" stroke="#f2d19b" stroke-width="3" fill="none"/>'+
   '<path d="M-17-150h34" stroke="#fff4d5" stroke-width="2" opacity=".5"/>'+
   '<rect x="-16" y="-6" width="32" height="7" rx="3" fill="#53676b" stroke="#ad9d87" stroke-width="2"/>'+
   '<g class="town-stage-lights">'+
   '<ellipse cx="0" cy="-152" rx="116" ry="100" fill="url(#tcGlow)" opacity=".96"/>'+
   '<ellipse cx="0" cy="-144" rx="27" ry="21" fill="#ffebaf" opacity=".88"/>'+
   '<path d="M-27-112L-92 0H92L27-112Z" fill="#ffe3a5" opacity=".10"/>'+
   '<ellipse cx="0" cy="1" rx="61" ry="10" fill="#fbc87f" opacity=".55"/>'+
   '<g class="town-light-rays" stroke="#ffedbe" opacity=".47" stroke-width="2.5" stroke-linecap="round">'+
   '<path d="M0-206v-12M-53-194l-9-9M54-195l9-9M-74-150h-12M74-150h12"/></g>'+
   '</g></g>';
 };
 const defs='<defs>'+
  '<linearGradient id="tcSky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#172f4f"/><stop offset=".43" stop-color="#455478"/><stop offset=".79" stop-color="#a77377"/><stop offset="1" stop-color="#d9947c"/></linearGradient>'+
  '<linearGradient id="tcHill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#677b86"/><stop offset="1" stop-color="#2a5966"/></linearGradient>'+
  '<linearGradient id="tcWater" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7d8ea3"/><stop offset=".47" stop-color="#426579"/><stop offset="1" stop-color="#102e4b"/></linearGradient>'+
  '<linearGradient id="tcRoad" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8d7a79"/><stop offset="1" stop-color="#324454"/></linearGradient>'+
  '<linearGradient id="tcCopper" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#29394b"/><stop offset=".25" stop-color="#9b9a8c"/><stop offset=".51" stop-color="#d2bc95"/><stop offset="1" stop-color="#42525b"/></linearGradient>'+
  '<radialGradient id="tcGlow"><stop stop-color="#fff8bf" stop-opacity=".93"/><stop offset=".23" stop-color="#ffdb87" stop-opacity=".53"/><stop offset=".67" stop-color="#f9c375" stop-opacity=".14"/><stop offset="1" stop-color="#ffd58e" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="tcSunset" cx=".7" cy=".70" r=".58"><stop stop-color="#ffd69d" stop-opacity=".7"/><stop offset=".65" stop-color="#e8a47c" stop-opacity=".19"/><stop offset="1" stop-color="#df977f" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="tcWood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b5865f"/><stop offset=".24" stop-color="#916746"/><stop offset=".65" stop-color="#78503d"/><stop offset="1" stop-color="#4f3c3a"/></linearGradient>'+
  '<linearGradient id="tcWoodRim" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f7dba5"/><stop offset=".55" stop-color="#c69d70"/><stop offset="1" stop-color="#674b43"/></linearGradient>'+
  '<radialGradient id="tcMoon" cx=".33" cy=".28" r=".8"><stop stop-color="#fff8d9"/><stop offset=".68" stop-color="#ffdfa9"/><stop offset="1" stop-color="#f3bb8d"/></radialGradient>'+
  '</defs>';
 // Three parallax planes. All illumination tied to .is-lit in CSS.
 const sky=defs+
  '<rect width="900" height="340" fill="url(#tcSky)"/>'+
  '<rect width="900" height="340" fill="url(#tcSunset)"/>'+
  '<path d="M0 91Q108 64 220 94T471 69T900 84L900 167Q735 142 596 173T240 162T0 168Z" fill="#6a6e84" opacity=".22"/>'+
  '<circle cx="742" cy="53" r="52" fill="#ffe7b7" opacity=".12"/>'+
  '<circle cx="742" cy="53" r="19" fill="url(#tcMoon)"/>'+
  '<circle cx="735" cy="49" r="3.5" fill="#dbc5af" opacity=".48"/>'+
  '<g fill="#fff7dc" opacity=".85">'+
  [[50,29,1.7],[96,69,1.1],[169,46,1.3],[234,25,1.2],[317,69,1.6],[413,31,1.2],[501,57,2],[577,15,1],[667,48,1.8],[796,25,1.5],[843,71,1.2],[872,34,1.9]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+p[2]+'"/>').join('')+
  '</g>'+
  '<path d="M0 173Q105 116 204 146T399 151T618 126T900 158L900 258H0Z" fill="#596f80" opacity=".75"/>'+
  '<path d="M0 203Q106 154 194 176T438 164T671 170T900 181V285H0Z" fill="url(#tcHill)"/>'+
  '<g fill="#203f55" opacity=".75">'+
   [[50,194,32],[104,193,41],[267,181,30],[340,191,21],[475,176,31],[589,178,25],[693,176,32],[829,186,44]]
   .map(([x,y,w])=>'<path d="M'+x+' '+(y+54)+'v-43l'+(w/2)+'-26l'+(w/2)+' 26v43Z"/>').join('')+
  '</g>';
 const river='<path d="M0 245Q140 232 269 239T516 231T900 235V340H0Z" fill="url(#tcWater)"/>'+
  '<g fill="none" stroke-linecap="round" opacity=".36">'+
  '<path d="M11 258Q114 243 217 256M260 252Q370 242 483 249M552 262Q695 250 829 260" stroke="#c7b6a3" stroke-width="3"/>'+
  '<path d="M78 281Q196 273 318 283M374 277Q501 267 606 284M680 282Q772 274 892 282" stroke="#91b0c1" stroke-width="2"/>'+
  '<path d="M15 311Q185 301 338 310M446 307Q611 302 796 309" stroke="#f1d0a3" stroke-width="2.1"/>'+
  '</g>';
 const bridge='<g class="town-stone-bridge" opacity=".91">'+
  '<path d="M562 247Q663 204 784 230L816 247V263H562Z" fill="#9a8587" stroke="#d7b19e" stroke-width="4"/>'+
  '<path d="M600 249Q645 209 684 248v15h-84Z" fill="#244d60" stroke="#cab5a4" stroke-width="3"/>'+
  '<path d="M699 248Q738 217 776 248v15h-77Z" fill="#244d60" stroke="#cab5a4" stroke-width="3"/>'+
  '<path d="M558 240Q667 188 821 238" fill="none" stroke="#f2d3ac" stroke-width="6"/>'+
  '<path d="M574 244v-9M616 225v-10M662 215v-10M712 218v-9M757 228v-10M809 242v-9" stroke="#d4b09a" stroke-width="5"/>'+
  '</g>';
 const path='<path d="M0 314Q124 290 223 304T456 307T900 304V340H0Z" fill="url(#tcRoad)" stroke="#b59286" stroke-width="3"/>'+
  '<path d="M0 317Q156 297 292 312T613 313T900 311" fill="none" stroke="#d9bca6" stroke-width="4" opacity=".38"/>'+
  '<g fill="#c3a9a3" opacity=".25">'+
  [[102,317,14,3],[257,321,20,4],[369,313,13,3],[534,325,17,3],[741,314,19,4]]
  .map(a=>'<ellipse cx="'+a[0]+'" cy="'+a[1]+'" rx="'+a[2]+'" ry="'+a[3]+'"/>').join('')+
  '</g>';
 const flower=(x,y,c)=>'<g transform="translate('+x+' '+y+')"><path d="M0 0v-17" stroke="#648b75" stroke-width="3"/>'+
  '<circle cy="-18" r="8" fill="'+c+'"/><circle cy="-18" r="3.5" fill="#f9d8a2"/></g>';
 // A true working stage: distant village / warm instrument bench / touchable
 // circuit in three distinct planes. No false conducting connection is painted.
 const table='<g class="town-play-surface" pointer-events="none" aria-hidden="true">'+
  '<path d="M-30 200Q450 184 930 201L935 350H-35Z" fill="url(#tcWood)" stroke="#eed0a5" stroke-width="4"/>'+
  '<path d="M-25 201Q450 184 925 201" fill="none" stroke="url(#tcWoodRim)" stroke-width="12" stroke-linecap="round"/>'+
  '<path d="M-10 212Q450 201 907 212" fill="none" stroke="#f5cd91" stroke-width="2.6" opacity=".55"/>'+
  '<path d="M0 239Q168 225 345 237T900 238M0 282Q235 266 434 281T900 278M0 316Q239 305 500 317T900 314" fill="none" stroke="#442c2b" opacity=".23" stroke-width="3"/>'+
  '<path d="M0 246Q190 232 379 244T900 241M0 299Q235 287 434 299T900 296" fill="none" stroke="#f0b77f" opacity=".19" stroke-width="2"/>'+
  '<path d="M-20 332H920" stroke="#312c36" stroke-width="12" opacity=".8"/>'+
  '<g fill="#c3a28b" stroke="#4d4244" stroke-width="2" opacity=".7"><circle cx="26" cy="226" r="5"/><circle cx="875" cy="224" r="5"/><circle cx="26" cy="317" r="5"/><circle cx="875" cy="317" r="5"/></g>'+
  '<path d="M23 222L29 230M29 222L23 230M870 221l10 6m0-6l-10 6M23 312l7 8m0-8l-7 8M870 313l9 8m0-8l-9 8" stroke="#554b4c" stroke-width="1.7"/>'+
  '</g>';
 const world=(stage)=>{
  const s=Number(stage);
  return sky+
   river+bridge+
   H(148,228,.68,"#80667b","#c6b0ac")+
   H(451,230,.72,"#596b84","#d2b8af")+
   H(752,228,.68,"#976c70","#c2a999")+
   T(42,246,.58)+T(863,245,.60)+
   path+
   flower(275,240,"#c48c9e")+flower(332,242,"#e2b274")+flower(608,241,"#d89caa")+
   (s===1?L(565,280,.69):s===2?L(332,279,.68)+L(627,278,.69):L(501,282,.77))+
   table+
   '<g class="town-power-reflections"><path d="M446 221Q483 217 525 221M426 233Q501 228 552 233" stroke="#ffdf9a" stroke-width="3" fill="none" opacity=".70"/>'+
   '<ellipse cx="501" cy="250" rx="137" ry="43" fill="url(#tcGlow)" opacity=".35"/></g>';
 };
 window.AkariCinematicScenery={render:stage=>world(stage)};
})();