"use strict";
/* Illustrated hometown for the first three lessons. The real circuit and its
   science live in the interactive workbench, not in this decorative SVG. */
(function(){
 const twilight=document.documentElement.classList.contains('akari-cinematic');
 const sky='<defs>'+
 '<linearGradient id="tcSky" x2="0" y2="1"><stop stop-color="'+(twilight?"#172f4f":"#7bc6ec")+'"/><stop offset=".60" stop-color="'+(twilight?"#466984":"#c5e8ee")+'"/><stop offset="1" stop-color="'+(twilight?"#c88772":"#f2e5cf")+'"/></linearGradient>'+
 '<linearGradient id="tcHill" x2=".2" y2="1"><stop stop-color="'+(twilight?"#416c76":"#a5c6ae")+'"/><stop offset="1" stop-color="'+(twilight?"#254f61":"#5f9c8a")+'"/></linearGradient>'+
 '<linearGradient id="tcWater" x2="0" y2="1"><stop stop-color="#8dcfd8"/><stop offset="1" stop-color="#398ba5"/></linearGradient>'+
 '<linearGradient id="tcStone" x2=".5" y2="1"><stop stop-color="#faecd4"/><stop offset="1" stop-color="#b7aaa4"/></linearGradient>'+
 '<linearGradient id="tcCopper" x2=".4" y2="1"><stop stop-color="#f6deaa"/><stop offset=".4" stop-color="#8b8171"/><stop offset="1" stop-color="#516874"/></linearGradient>'+
 '<radialGradient id="tcGlow"><stop stop-color="#fff6c6" stop-opacity=".82"/><stop offset=".36" stop-color="#ffe49a" stop-opacity=".42"/><stop offset="1" stop-color="#ffe49a" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="tcRoof" x2="0" y2="1"><stop stop-color="#fff6e2" stop-opacity=".7"/><stop offset="1" stop-color="#fff6e2" stop-opacity="0"/></linearGradient>'+
 '<linearGradient id="tcWarmWindow" x2="0" y2="1"><stop stop-color="#fffaf1" stop-opacity=".6"/><stop offset="1" stop-color="#ffe49d" stop-opacity="0"/></linearGradient>'+
 '</defs>'+
 '<rect width="900" height="340" fill="url(#tcSky)"/>'+
 (twilight?'<path d="M0 195Q135 153 287 181T620 171T900 197V262H0Z" fill="#75959d" opacity=".16"/>'+
 '<g fill="#fff1bd" opacity=".86"><circle cx="32" cy="32" r="1.7"/><circle cx="96" cy="82" r="1.4"/><circle cx="176" cy="38" r="2.3"/><circle cx="261" cy="88" r="1.7"/><circle cx="333" cy="34" r="1.9"/><circle cx="414" cy="78" r="1.3"/><circle cx="544" cy="24" r="2"/><circle cx="615" cy="61" r="1.5"/><circle cx="795" cy="28" r="1.8"/><circle cx="868" cy="88" r="1.2"/></g>'+
 '<circle cx="735" cy="65" r="69" fill="url(#tcGlow)" opacity=".46"/>':'')+
 '<path d="M0 218Q135 148 259 189T520 166T900 193V340H0Z" fill="'+(twilight?"#527788":"#d9e7d7")+'" opacity=".56"/>'+
 '<g class="town-sky-sparkles" fill="'+(twilight?"#fff0c0":"#fff9df")+'" opacity=".7"><circle cx="68" cy="52" r="2.4"/><circle cx="302" cy="40" r="1.7"/><circle cx="626" cy="70" r="2.1"/><circle cx="827" cy="109" r="1.6"/></g>'+
 '<circle cx="735" cy="65" r="41" fill="'+(twilight?"#fff1c9":"#fff4da")+'" opacity=".8"/>'+
 '<g fill="'+(twilight?"#b1c5d2":"#fffaf1")+'" opacity="'+(twilight?".27":".72")+'"><ellipse cx="130" cy="64" rx="69" ry="16"/><ellipse cx="105" cy="53" rx="31" ry="21"/><ellipse cx="510" cy="53" rx="50" ry="13"/><ellipse cx="485" cy="44" rx="25" ry="16"/></g>'+
 '<path d="M0 216Q115 158 232 198Q333 151 447 206Q598 140 719 195Q814 163 900 195V340H0Z" fill="url(#tcHill)"/>'+
 '<path d="M0 247Q99 211 216 243Q344 198 470 239Q622 206 900 244V340H0Z" fill="'+(twilight?"#376675":"#7fb2a4")+'"/>';
 const house=(x,y,k,roof,wall)=>{
  const windows=[[-37,-68],[23,-68]].map(([wx,wy])=>
   '<rect class="town-window" x="'+wx+'" y="'+wy+'" width="29" height="36" rx="6" stroke="#f8edd6" stroke-width="5"/>'+
   '<path d="M'+(wx+14.5)+' '+wy+'v36M'+wx+' '+(wy+18)+'h29" stroke="#e7ddc7" stroke-width="2.5" opacity=".9"/>').join("");
  return '<g class="town-house" transform="translate('+x+' '+y+') scale('+k+')">'+
  '<ellipse cy="0" rx="82" ry="10" fill="#355d60" opacity=".18"/>'+
  '<rect x="-72" y="-133" width="144" height="131" rx="13" fill="'+wall+'" stroke="#e3cdbb" stroke-width="4"/>'+
  '<path d="M-81-127L0-192L80-127L71-115L0-169L-71-115Z" fill="'+roof+'" stroke="#fff3d8" stroke-width="5" stroke-linejoin="round"/>'+
  '<path class="town-roof-detail" d="M-70-123L0-181L70-123M-52-140L0-163L53-140" fill="none" stroke="#fff8e8" opacity=".44" stroke-width="3.4" stroke-linecap="round"/>'+
  '<path class="town-roof-detail" d="M-18-176L-30-156M18-176L30-156" fill="none" stroke="#784d48" opacity=".21" stroke-width="2.2"/>'+
  '<rect x="34" y="-192" width="18" height="29" rx="4" fill="#d2ab95" stroke="#faeee1" stroke-width="3"/>'+
  '<path d="M-43-159L0-177L44-159" fill="none" stroke="#ffffff" opacity=".27" stroke-width="5" stroke-linecap="round"/>'+
  '<path d="M-65-109H64M-64-15H65" stroke="#b38e8a" opacity=".35" stroke-width="4"/>'+
  '<ellipse class="town-home-glow" cx="0" cy="-69" rx="68" ry="58" fill="#ffe29b" opacity="0"/>'+
  windows+
  '<path class="town-porch" d="M-28 0H28" stroke="#fff4dd" stroke-width="9" stroke-linecap="round"/>'+
  '<rect x="-64" y="-50" width="23" height="14" rx="3" fill="#b58770" stroke="#f6e1c3" stroke-width="2"/>'+
  '<path d="M-62-44L-56-62M-54-43L-51-66M-47-44L-44-59" stroke="#538c68" stroke-width="4" stroke-linecap="round"/>'+
  '<circle cx="-58" cy="-63" r="5" fill="#efb8ac"/><circle cx="-48" cy="-65" r="4" fill="#f3d29a"/>'+
  '<path d="M-13 0V-56Q0-68 15-56V0Z" fill="#aa8575" stroke="#f8e9d3" stroke-width="5"/>'+
  '<circle cx="6" cy="-27" r="3.5" fill="#ffe1a4"/>'+
  '<path d="M-58-125V-145Q-50-153-42-145V-128" fill="none" stroke="#eef5d9" opacity=".7" stroke-width="4"/>'+
  '<path d="M-59-9H-31M26-9H56" stroke="#fff4e4" opacity=".65" stroke-width="3"/>'+
  '</g>';
 };
 const tree=(x,y,k)=>
  '<g class="town-tree" transform="translate('+x+' '+y+') scale('+k+')">'+
  '<path d="M0 0V-107" stroke="#896e64" stroke-width="15" stroke-linecap="round"/>'+
  '<circle cx="-24" cy="-118" r="36" fill="#72ad8b" stroke="#c8df9f" stroke-width="5"/>'+
  '<circle cx="24" cy="-123" r="39" fill="#6ca88b" stroke="#c5e6b1" stroke-width="5"/>'+
  '<circle cx="0" cy="-153" r="34" fill="#83b69b" stroke="#d0e7b8" stroke-width="5"/>'+
  '<circle cx="-14" cy="-152" r="6" fill="#e2d99a" opacity=".8"/>'+
  '<path d="M-34-143Q-11-154 6-142M9-173Q28-161 42-146" stroke="#d5eabd" stroke-width="5" stroke-linecap="round" fill="none" opacity=".72"/>'+
  '<circle cx="-33" cy="-110" r="8" fill="#9ec7a6" opacity=".88"/>'+
  '</g>';
 const lantern=(x,y,k,bridge)=>
  '<g class="'+(bridge?'bridge-lamp':'town-lamp')+'" transform="translate('+x+' '+y+') scale('+k+')">'+
  '<ellipse cy="4" rx="31" ry="7" fill="#476d73" opacity=".22"/>'+
  '<path d="M0-4V-132" stroke="#566c79" stroke-width="12" stroke-linecap="round"/>'+
  '<path d="M-2-9V-132" stroke="url(#tcCopper)" stroke-width="8" stroke-linecap="round"/>'+
  '<path d="M-31-135L-25-167H25L31-135Z" fill="#667d82" stroke="#ead6ae" stroke-width="5" stroke-linejoin="round"/>'+
  '<path d="M-23-161H23V-138H-23Z" class="'+(bridge?'bridge-lantern-glass':'town-lantern-glass')+'" stroke="#f1dfbd" stroke-width="3"/>'+
  '<path d="M-31-134H31M-18-167L0-185L18-167" stroke="#eeddbf" stroke-width="5" fill="none" stroke-linecap="round"/>'+
  '<path d="M-17-174Q0-186 17-174" fill="none" stroke="#fff6d9" stroke-width="2.5" opacity=".8"/>'+
  '<rect x="-22" y="-8" width="44" height="9" rx="4" fill="#a5a99a" stroke="#f5e4bd" stroke-width="2"/>'+
  '<g class="'+(bridge?'bridge-stage-lights':'town-stage-lights')+'">'+
  '<circle cy="-151" r="90" fill="url(#tcGlow)"/>'+
  '<rect x="-20" y="-158" width="40" height="22" rx="3" fill="#ffeb9e"/>'+
  '<circle cy="-149" r="7" fill="#fffbe0"/>'+
  '<path d="M-32-148H32M0-179V-124" stroke="#fffbe7" stroke-width="3" opacity=".7"/>'+
  '<path d="M-28-113L-62-4H62L28-113Z" fill="#ffe49a" opacity=".12"/>'+
  '</g>'+
  '</g>';
 const littleFlower=(x,y,hue)=>
  '<g transform="translate('+x+' '+y+')"><path d="M0 0V-19" stroke="#4b8b6e" stroke-width="3"/>'+
  '<circle cy="-21" r="9" fill="'+hue+'"/><circle cy="-21" r="4" fill="#fff4bb"/></g>';
 const path='<path d="M0 317Q150 277 310 298Q490 320 659 286Q773 269 900 303V340H0Z" fill="'+(twilight?"#5a686c":"#c8b9a8")+'"/>'+
  '<path d="M0 319Q235 289 450 313T900 302" stroke="#aeaa98" stroke-width="2" opacity=".6" fill="none"/>'+
  '<g fill="#ece2d0" opacity=".87"><ellipse cx="150" cy="319" rx="14" ry="4"/><ellipse cx="240" cy="327" rx="12" ry="3"/><ellipse cx="518" cy="325" rx="17" ry="4"/><ellipse cx="802" cy="322" rx="19" ry="4"/></g>'+
  '<path d="M0 317Q230 301 454 320T900 303" fill="none" stroke="#f8ead2" stroke-width="6"/>'+
  '<g fill="#e8dbc9" opacity=".6"><ellipse cx="340" cy="318" rx="20" ry="5"/><ellipse cx="710" cy="314" rx="29" ry="5"/></g>';
 const town=sky+
  house(208,276,0.80,twilight?"#9a6b76":"#d98281",twilight?"#c9a7a1":"#f5dcc3")+
  house(455,278,1.09,twilight?"#567c91":"#749db4",twilight?"#dbc9b4":"#fbebd2")+
  house(722,280,.79,twilight?"#a57b6d":"#cc917b",twilight?"#ceb6a4":"#f1dcc7")+
  tree(60,294,.84)+tree(842,288,.87)+
  path+
  '<path d="M0 326Q165 293 310 318T640 318T900 313" fill="none" stroke="#ab9f91" stroke-width="2.5" opacity=".44"/>'+
  littleFlower(116,301,"#f6bdc5")+littleFlower(280,302,"#f5d085")+
  littleFlower(622,304,"#f2c4d2")+littleFlower(808,309,"#f1d58d");
 // The third mission is another streetlamp in the town, not a bridge rescue.
 const streetlamp=town+lantern(490,302,1.07,false)+
  '<g class="town-stage-lights"><ellipse cx="490" cy="313" rx="150" ry="25" fill="url(#tcGlow)"/></g>';
 const art={
  1:town+lantern(557,280,.89,false),
  2:town+lantern(325,286,.94,false)+lantern(605,286,.91,false),
  3:streetlamp
 };
 window.AkariTownArt={render:stage=>art[Number(stage)]||art[2]};
})();