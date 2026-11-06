"use strict";
/* Illustrated hometown for the first three lessons. The real circuit and its
   science live in the interactive workbench, not in this decorative SVG. */
(function(){
 const sky='<defs>'+
 '<linearGradient id="tcSky" x2="0" y2="1"><stop stop-color="#7bc6ec"/><stop offset=".60" stop-color="#c5e8ee"/><stop offset="1" stop-color="#f2e5cf"/></linearGradient>'+
 '<linearGradient id="tcHill" x2=".2" y2="1"><stop stop-color="#a5c6ae"/><stop offset="1" stop-color="#5f9c8a"/></linearGradient>'+
 '<linearGradient id="tcWater" x2="0" y2="1"><stop stop-color="#8dcfd8"/><stop offset="1" stop-color="#398ba5"/></linearGradient>'+
 '<linearGradient id="tcStone" x2=".5" y2="1"><stop stop-color="#faecd4"/><stop offset="1" stop-color="#b7aaa4"/></linearGradient>'+
 '<linearGradient id="tcCopper" x2=".4" y2="1"><stop stop-color="#f6deaa"/><stop offset=".4" stop-color="#8b8171"/><stop offset="1" stop-color="#516874"/></linearGradient>'+
 '<radialGradient id="tcGlow"><stop stop-color="#fff6c6" stop-opacity=".82"/><stop offset=".36" stop-color="#ffe49a" stop-opacity=".42"/><stop offset="1" stop-color="#ffe49a" stop-opacity="0"/></radialGradient>'+
 '</defs>'+
 '<rect width="900" height="340" fill="url(#tcSky)"/>'+
 '<circle cx="735" cy="65" r="41" fill="#fff4da" opacity=".8"/>'+
 '<g fill="#fffaf1" opacity=".72"><ellipse cx="130" cy="64" rx="69" ry="16"/><ellipse cx="105" cy="53" rx="31" ry="21"/><ellipse cx="510" cy="53" rx="50" ry="13"/><ellipse cx="485" cy="44" rx="25" ry="16"/></g>'+
 '<path d="M0 216Q115 158 232 198Q333 151 447 206Q598 140 719 195Q814 163 900 195V340H0Z" fill="url(#tcHill)"/>'+
 '<path d="M0 247Q99 211 216 243Q344 198 470 239Q622 206 900 244V340H0Z" fill="#7fb2a4"/>';
 const house=(x,y,k,roof,wall)=>{
  const windows=[[-37,-68],[23,-68]].map(([wx,wy])=>
   '<rect class="town-window" x="'+wx+'" y="'+wy+'" width="29" height="36" rx="6" stroke="#f8edd6" stroke-width="5"/>'+
   '<path d="M'+(wx+14.5)+' '+wy+'v36M'+wx+' '+(wy+18)+'h29" stroke="#e7ddc7" stroke-width="2.5" opacity=".9"/>').join("");
  return '<g class="town-house" transform="translate('+x+' '+y+') scale('+k+')">'+
  '<ellipse cy="0" rx="82" ry="10" fill="#355d60" opacity=".18"/>'+
  '<rect x="-72" y="-133" width="144" height="131" rx="13" fill="'+wall+'" stroke="#e3cdbb" stroke-width="4"/>'+
  '<path d="M-81-127L0-192L80-127L71-115L0-169L-71-115Z" fill="'+roof+'" stroke="#fff3d8" stroke-width="5" stroke-linejoin="round"/>'+
  '<path d="M-43-159L0-177L44-159" fill="none" stroke="#ffffff" opacity=".27" stroke-width="5" stroke-linecap="round"/>'+
  '<path d="M-65-109H64M-64-15H65" stroke="#b38e8a" opacity=".35" stroke-width="4"/>'+
  windows+
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
  '</g>';
 const lantern=(x,y,k,bridge)=>
  '<g class="'+(bridge?'bridge-lamp':'town-lamp')+'" transform="translate('+x+' '+y+') scale('+k+')">'+
  '<ellipse cy="4" rx="31" ry="7" fill="#476d73" opacity=".22"/>'+
  '<path d="M0-4V-132" stroke="#566c79" stroke-width="12" stroke-linecap="round"/>'+
  '<path d="M-2-9V-132" stroke="url(#tcCopper)" stroke-width="8" stroke-linecap="round"/>'+
  '<path d="M-31-135L-25-167H25L31-135Z" fill="#667d82" stroke="#ead6ae" stroke-width="5" stroke-linejoin="round"/>'+
  '<path d="M-23-161H23V-138H-23Z" class="'+(bridge?'bridge-lantern-glass':'town-lantern-glass')+'" stroke="#f1dfbd" stroke-width="3"/>'+
  '<path d="M-31-134H31M-18-167L0-185L18-167" stroke="#eeddbf" stroke-width="5" fill="none" stroke-linecap="round"/>'+
  '<g class="'+(bridge?'bridge-stage-lights':'town-stage-lights')+'">'+
  '<circle cy="-151" r="90" fill="url(#tcGlow)"/>'+
  '<rect x="-20" y="-158" width="40" height="22" rx="3" fill="#ffeb9e"/>'+
  '<circle cy="-149" r="7" fill="#fffbe0"/>'+
  '<path d="M-28-113L-62-4H62L28-113Z" fill="#ffe49a" opacity=".12"/>'+
  '</g>'+
  '</g>';
 const littleFlower=(x,y,hue)=>
  '<g transform="translate('+x+' '+y+')"><path d="M0 0V-19" stroke="#4b8b6e" stroke-width="3"/>'+
  '<circle cy="-21" r="9" fill="'+hue+'"/><circle cy="-21" r="4" fill="#fff4bb"/></g>';
 const path='<path d="M0 317Q150 277 310 298Q490 320 659 286Q773 269 900 303V340H0Z" fill="#c8b9a8"/>'+
  '<path d="M0 317Q230 301 454 320T900 303" fill="none" stroke="#f8ead2" stroke-width="6"/>'+
  '<g fill="#e8dbc9" opacity=".6"><ellipse cx="340" cy="318" rx="20" ry="5"/><ellipse cx="710" cy="314" rx="29" ry="5"/></g>';
 const town=sky+
  house(208,276,0.80,"#d98281","#f5dcc3")+
  house(455,278,1.09,"#749db4","#fbebd2")+
  house(722,280,.79,"#cc917b","#f1dcc7")+
  tree(60,294,.84)+tree(842,288,.87)+
  path+
  '<path d="M0 326Q165 293 310 318T640 318T900 313" fill="none" stroke="#ab9f91" stroke-width="2.5" opacity=".44"/>'+
  littleFlower(116,301,"#f6bdc5")+littleFlower(280,302,"#f5d085")+
  littleFlower(622,304,"#f2c4d2")+littleFlower(808,309,"#f1d58d");
 const bridge=sky+
  house(156,266,.82,"#c47e83","#f5dabc")+
  house(751,263,.82,"#779cb6","#fae9d0")+
  '<path d="M0 265Q260 238 540 260Q707 249 900 250V340H0Z" fill="url(#tcWater)"/>'+
  '<path d="M0 281Q150 269 290 281T600 285T900 283M0 305Q200 298 387 309T900 308" stroke="#e3f2e7" stroke-width="3" opacity=".42" fill="none"/>'+
  '<g class="bridge-monument">'+
  '<path d="M258 264Q417 167 629 261L637 305Q448 217 259 308Z" fill="url(#tcStone)" stroke="#f5e2be" stroke-width="6" stroke-linejoin="round"/>'+
  '<path d="M293 300Q377 225 446 300M447 299Q527 223 606 297" fill="none" stroke="#71939d" stroke-width="23" opacity=".76"/>'+
  '<path d="M249 256Q444 143 643 257" fill="none" stroke="#e3c59b" stroke-width="16" stroke-linecap="round"/>'+
  '<path d="M255 255Q450 148 635 258" fill="none" stroke="#fff1d5" stroke-width="4"/>'+
  '<path d="M245 256Q443 153 644 257" stroke="#b38f79" stroke-width="3.5" stroke-dasharray="16 13" fill="none"/>'+
  '</g>'+
  lantern(329,264,.72,true)+lantern(579,264,.72,true)+
  '<g class="bridge-stage-lights"><ellipse cx="450" cy="304" rx="175" ry="32" fill="url(#tcGlow)"/></g>'+
  tree(51,308,.88)+tree(862,302,.84)+
  littleFlower(268,301,"#eac1ca")+littleFlower(630,307,"#f2d187");
 const art={
  1:town+lantern(557,280,.89,false),
  2:town+lantern(325,286,.94,false)+lantern(605,286,.91,false),
  3:bridge
 };
 window.AkariTownArt={render:stage=>art[Number(stage)]||art[2]};
})();