"use strict";
(function(){
const wrap=(view,body,label="",css="")=>'<svg class="science-illustration '+css+'" viewBox="'+view+'" role="img" aria-label="'+label+'" xmlns="http://www.w3.org/2000/svg">'+body+'</svg>';
const defs='<defs><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#fbfffa"/><stop offset=".37" stop-color="#b5cbd3"/><stop offset=".71" stop-color="#e5f2ed"/><stop offset="1" stop-color="#738c99"/></linearGradient><linearGradient id="cell" x2="0" y2="1"><stop stop-color="#f8d99c"/><stop offset=".52" stop-color="#e7a15f"/><stop offset="1" stop-color="#c67450"/></linearGradient><radialGradient id="glass"><stop stop-color="#fffbdd"/><stop offset=".7" stop-color="#f4e0a6"/><stop offset="1" stop-color="#adcdcb" stop-opacity=".7"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="7"/></filter></defs>';
const plate=(x,y,w,h,fill="#233f56")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="13" fill="'+fill+'" stroke="#62899e" stroke-width="2"/>';
function battery(kind="small",active=true){
 const count=(kind==="series"||kind==="reverse")?2:1,reverse=kind==="reverse",wide=kind==="large";
 const cells=Array.from({length:count},(_,i)=>{
  const x=count===1?85:32+i*112,y=34,w=wide?92:78,h=112,plusTop=!(reverse&&i===1);
  const topContact=plusTop?'<rect x="'+(x+28)+'" y="'+(y-8)+'" width="'+(w-56)+'" height="10" rx="4" fill="url(#metal)"/>':'<rect x="'+(x+9)+'" y="'+(y-4)+'" width="'+(w-18)+'" height="5" rx="2" fill="#dce5da"/>';
  const bottomContact=plusTop?'<rect x="'+(x+9)+'" y="'+(y+h-2)+'" width="'+(w-18)+'" height="6" rx="2" fill="#bdc9c4"/>':'<rect x="'+(x+28)+'" y="'+(y+h-1)+'" width="'+(w-56)+'" height="10" rx="4" fill="url(#metal)"/>';
  return '<g><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" fill="url(#cell)" stroke="#fbe1aa" stroke-width="3"/>'
   +'<rect x="'+(x+7)+'" y="'+(y+13)+'" width="'+(w-14)+'" height="70" rx="7" fill="#be6351" stroke="#faad86" stroke-width="2"/>'
   +'<path d="M'+(x+13)+' '+(y+20)+'v43" stroke="#f6c498" stroke-width="4" opacity=".7"/>'
   +'<rect x="'+(x+9)+'" y="'+(y+88)+'" width="'+(w-18)+'" height="18" rx="3" fill="#e8e9d9"/>'
   +topContact+bottomContact
   +'<text x="'+(x+w/2)+'" y="'+(y+56)+'" text-anchor="middle" font-size="24" font-weight="900" fill="#fff">1.5V</text>'
   +'<text x="'+(x+w/2)+'" y="'+(plusTop?y+25:y+104)+'" text-anchor="middle" font-size="21" font-weight="900" fill="'+(plusTop?'#fff':'#27465d')+'">＋</text>'
   +'<text x="'+(x+w/2)+'" y="'+(plusTop?y+104:y+25)+'" text-anchor="middle" font-size="20" font-weight="900" fill="'+(plusTop?'#27465d':'#fff')+'">−</text></g>';
 }).join("");
 const wire=count===2?'<path d="M71 150 C70 183 113 182 128 162 C143 145 142 56 181 25" fill="none" stroke="#ffe4b6" stroke-width="6" stroke-linecap="round"/><path d="M71 150 C70 183 113 182 128 162 C143 145 142 56 181 25" fill="none" stroke="#bd8f56" stroke-width="2" stroke-linecap="round"/>':'';
 const foot=count===2?(reverse?"逆向きの直列（電圧は相殺）":"同じ向きの直列（約3V）"):(wide?"単1形・公称1.5V":"単4形・公称1.5V");
 return wrap("0 0 260 190",defs+plate(3,3,254,184)+cells+wire+'<text x="130" y="178" text-anchor="middle" fill="#d6f7f2" font-size="12" font-weight="700">'+foot+'</text>',count===2?(reverse?"乾電池2個の逆向き直列つなぎ":"乾電池2個の同じ向きの直列つなぎ"):(wide?"単1形乾電池":"単4形乾電池"),"battery-art"+(active?" active":""));
}
function bulb(on=false,short=false){
 return wrap("0 0 220 205",defs+plate(5,4,210,196,'#21455e')+
 (on?'<ellipse cx="111" cy="81" rx="78" ry="70" fill="#ffed9c" opacity=".35" filter="url(#glow)"/>':'')+
 '<path d="M87 124Q49 86 63 56Q77 20 111 21Q154 23 160 58Q171 94 136 124Z" fill="'+(on?'url(#glass)':'#8cadbd')+'" fill-opacity="'+(on?'.96':'.44')+'" stroke="'+(on?'#fff4bb':'#b2d4e0')+'" stroke-width="5"/>'+
 '<path d="M86 104 101 91 112 100 122 90 136 103" fill="none" stroke="'+(on?'#fff6d3':'#dfb989')+'" stroke-width="4" stroke-linecap="round"/><path d="M101 93V128M122 91V128" stroke="#d5d2c3" stroke-width="4"/>'+
 '<rect x="82" y="123" width="60" height="47" rx="9" fill="url(#metal)" stroke="#a5bec6" stroke-width="3"/><path d="M87 133H136M87 146H136M90 158H134" stroke="#7793a0" stroke-width="4"/><rect x="100" y="169" width="24" height="8" rx="3" fill="#ebc18a" stroke="#fff1d3" stroke-width="2"/>'+
 '<path d="M73 148H39M112 176V191" stroke="#f2cb8e" stroke-width="5" fill="none"/>'+
 '<circle cx="39" cy="148" r="7" fill="#eadcbb"/><circle cx="112" cy="190" r="7" fill="#eadcbb"/>'+
 '<text x="10" y="141" fill="#cce5f0" font-size="10">金属の横</text><text x="127" y="189" fill="#cce5f0" font-size="10">底の接点</text>',
 "豆電球の金属の横部分と底の接点"+(on?"、点灯中":""),
 "bulb-art");
}
function material(id){
 let obj={
 clip:'<path d="M120 49Q171 31 175 75L175 140Q170 173 138 169Q110 164 110 134L110 80Q110 61 124 62Q139 64 140 80L140 137Q142 148 130 146Q121 142 122 128" fill="none" stroke="#476c81" stroke-width="15" stroke-linecap="round"/><path d="M120 49Q171 31 175 75L175 140Q170 173 138 169Q110 164 110 134L110 80Q110 61 124 62Q139 64 140 80L140 137Q142 148 130 146Q121 142 122 128" fill="none" stroke="url(#metal)" stroke-width="10" stroke-linecap="round"/>',
 foil:'<path d="M54 63 190 38 204 164 70 180Z" fill="#8ca6b6" stroke="#d9eff6" stroke-width="4"/><path d="M54 63 160 83 190 38 148 112 204 164 109 149 70 180 87 107Z" fill="#e3eff3" opacity=".8"/><path d="M98 65 132 96 107 149M159 87 174 148M87 107 156 119" stroke="#728d9e" stroke-width="3" fill="none"/>',
 wood:'<path d="M50 104 179 48 208 81 78 136Z" fill="#c88d54" stroke="#f4c890" stroke-width="4"/><path d="M78 136V163L208 105V81Z" fill="#90653f"/><path d="M50 104V133L78 163V136Z" fill="#ad794e"/><path d="M68 108 178 61M84 126 187 80M96 141 192 101" stroke="#8d5939" stroke-width="3" opacity=".8"/>',
 plastic:'<g transform="rotate(-17 120 100)"><rect x="29" y="74" width="190" height="60" rx="8" fill="#76ccef" stroke="#e3f7ff" stroke-width="5"/><path d="M45 79v23m18-23v11m18-11v22m18-22v11m18-11v22m18-22v11m18-11v22m18-22v11m18-11v22" stroke="#f9ffff" stroke-width="3"/><path d="M35 115H211" stroke="#488bb3" stroke-width="3" opacity=".5"/></g>',
 iron:'<path d="M90 46 152 111 143 120 79 59Z" fill="url(#metal)" stroke="#c9e1e7" stroke-width="3"/><path d="M150 108 188 149 179 158 140 118Z" fill="#829caa"/><ellipse cx="82" cy="50" rx="17" ry="9" transform="rotate(45 82 50)" fill="#b5d2d7" stroke="#e5eff4" stroke-width="3"/>'
 }[id]||'';
 return wrap("0 0 250 205",defs+plate(3,3,244,198)+obj,
 {clip:"鉄のクリップ",foil:"アルミはく",wood:"木の棒",plastic:"プラスチックの定規",iron:"鉄のくぎ"}[id]||"材料の見本","material-art");
}
function circuit(design,a,b){
 const parallel=design==="parallel",on=parallel?(a||b):(a&&b);
 const S=(x,y,v,label)=>'<g><circle cx="'+x+'" cy="'+y+'" r="4" fill="#f5e0b8"/><circle cx="'+(x+30)+'" cy="'+y+'" r="4" fill="#f5e0b8"/><path d="M'+x+' '+y+'L'+(x+25)+' '+(v?y:y-16)+'" fill="none" stroke="'+(v?'#9bf4b8':'#ffc09f')+'" stroke-width="5" stroke-linecap="round"/><text x="'+(x+15)+'" y="'+(y-22)+'" text-anchor="middle" font-size="13" fill="#fff">'+label+'</text></g>';
 const common='<rect x="20" y="92" width="48" height="58" rx="9" fill="#c47b54" stroke="#ecd1a6" stroke-width="3"/><text x="44" y="115" font-size="13" text-anchor="middle" fill="#fff">＋</text><text x="44" y="136" font-size="13" text-anchor="middle" fill="#fff">−</text>'
 +'<path d="M44 92V58H110M310 58H348V91M348 144V192H44V151" fill="none" stroke="#ffd4a4" stroke-width="5" stroke-linejoin="round"/>'
 +'<circle cx="348" cy="118" r="28" fill="'+(on?'#ffefad':'#537d91')+'" stroke="#d9e8e8" stroke-width="4"/><path d="M333 117H363M348 104V131" stroke="#ffffe4" stroke-width="3"/>';
 const routes=parallel?
 '<path d="M110 58V90M110 90V144M110 90H154M184 90H276M110 144H154M184 144H276M276 90V58M276 144V90M276 58H310" stroke="#f9dab4" fill="none" stroke-width="5"/>'+S(154,90,a,'A')+S(154,144,b,'B'):
 '<path d="M110 58H154M184 58H232M262 58H310" stroke="#f9dab4" fill="none" stroke-width="5"/>'+S(154,58,a,'A')+S(232,58,b,'B');
 return wrap("0 0 390 230",defs+plate(2,2,386,226)+common+routes+
 '<text x="195" y="216" text-anchor="middle" fill="#d6eef4" font-size="15">'+(parallel?"並列：どちらか":"直列：両方")+' ONで点灯</text>',
 parallel?"2つのスイッチが並列の回路":"2つのスイッチが直列の回路","logic-art");
}
function shortDiagram(){
 return wrap("0 0 390 235",defs+plate(2,2,386,231)+
 '<rect x="29" y="85" width="72" height="65" rx="11" fill="#d99c61" stroke="#ffdf9b" stroke-width="3"/><text x="65" y="108" text-anchor="middle" fill="#fff" font-size="16">＋</text><text x="65" y="130" text-anchor="middle" fill="#fff" font-size="16">−</text>'+
 '<circle cx="304" cy="118" r="27" fill="#ffdf8c" stroke="#fff6b3" stroke-width="5"/><path d="M293 117l9 7 10-14" stroke="#f5c46c" stroke-width="4" fill="none"/>'+
 '<path d="M65 85V39H304V91M304 145V187H65V150" stroke="#f2deac" stroke-width="6" fill="none"/>'+
 '<path d="M65 85 160 77 225 163 65 150" stroke="#ff7058" stroke-width="6" stroke-dasharray="10 7" fill="none"/>'+
 '<path d="M65 85 65 150" stroke="#ff7058" stroke-width="5" stroke-dasharray="6 7"/>'+
 '<text x="190" y="33" fill="#dcf4f2" font-size="13" text-anchor="middle">正しい通り道</text>'+
 '<text x="155" y="103" fill="#fff0b0" font-weight="900" font-size="21">X</text><text x="38" y="122" fill="#fff0b0" font-weight="900" font-size="21">Y</text><text x="212" y="213" fill="#ff9b91" font-size="13" text-anchor="middle">赤い近道は危険！</text>',
 "乾電池から電球を通る正常な導線とショートする赤い導線","short-art");
}

function testCircuit(id,lit){
 const names={clip:"鉄",foil:"アルミ",wood:"木",plastic:"プラスチック"};
 const color={clip:"#d9f0f0",foil:"#d5e5e9",wood:"#c29364",plastic:"#70c9eb"}[id]||"#91b5c4";
 const sample={
 clip:'<path d="M205 91C221 78 230 88 227 101L227 109Q226 118 216 116Q207 115 207 105L207 95Q208 89 212 91Q218 93 216 101L216 109" stroke="url(#metal)" stroke-width="6" stroke-linecap="round" fill="none"/>',
 foil:'<path d="M190 90L219 87L229 109L194 119Z" fill="#d6e8ea" stroke="#f8ffff" stroke-width="3"/><path d="M194 119L203 94L219 87L213 111L229 109L202 105" stroke="#7b9caa" stroke-width="2" fill="none"/>',
 wood:'<path d="M189 91L219 85L232 112L198 119Z" fill="#b78553" stroke="#f0cb97" stroke-width="3"/><path d="M194 96L218 91M198 103L223 98M201 109L228 106" stroke="#8b5e3f" stroke-width="2"/>',
 plastic:'<g transform="rotate(-13 208 102)"><rect x="183" y="90" width="49" height="26" rx="3" fill="#78cbed" stroke="#d4f6ff" stroke-width="3"/><path d="M190 91V101M199 91V97M207 91V101M215 91V97M224 91V101" stroke="#e8ffff" stroke-width="2"/></g>'
 }[id]||'<path d="M195 96L217 110" stroke="#daeaf1" stroke-width="5"/>';
 const glow=lit?"#ffe494":"#8aaebe";
 return wrap("0 0 420 225",defs+plate(3,3,414,219)+
 '<path d="M70 49V32H206V83M206 118V138H323M354 162V186H70V161" stroke="'+(lit?"#ffec9b":"#dcb78f")+'" stroke-width="7" fill="none" stroke-linecap="round"/>'+
 '<rect x="39" y="64" width="62" height="97" rx="11" fill="url(#cell)" stroke="#ffdc9e" stroke-width="4"/><rect x="45" y="74" width="50" height="57" rx="6" fill="#a9574b"/>'+
 '<rect x="61" y="50" width="18" height="15" rx="4" fill="url(#metal)"/><text x="70" y="107" font-size="19" text-anchor="middle" fill="#fff" font-weight="900">1.5V</text>'+
 '<text x="70" y="80" font-size="17" text-anchor="middle" fill="#fff">＋</text><text x="70" y="148" font-size="17" text-anchor="middle" fill="#fff">−</text>'+
 '<rect x="170" y="82" width="75" height="40" rx="7" fill="'+color+'" stroke="#fff2c7" stroke-width="5"/><path d="M190 102h36" stroke="#66818a" stroke-width="5"/>'+
 '<text x="206" y="148" text-anchor="middle" fill="#ccecf3" font-size="12">'+(names[id]||"材料を選ぼう")+'</text>'+
 (lit?'<circle cx="354" cy="87" r="52" fill="#ffe494" opacity=".5" filter="url(#glow)"/>':'')+
 '<path d="M335 122Q312 91 329 60Q348 36 370 54Q397 84 373 122Z" fill="'+glow+'" stroke="#e9f7ed" stroke-width="5"/>'+
 '<path d="M339 92l13 12 14-13" stroke="#f7f2c4" stroke-width="4" fill="none"/><rect x="338" y="119" width="32" height="28" rx="4" fill="url(#metal)"/><path d="M339 126h30m-30 8h30" stroke="#6f8a91" stroke-width="3"/>'+
 '<circle cx="354" cy="150" r="7" fill="#efc98a"/>'+
 '<text x="355" y="212" text-anchor="middle" fill="#cfe9f2" font-size="12">豆電球</text>',
 "材料を入れて乾電池と豆電球をつなぐ実験回路","test-circuit-art");
}

function workbench(wires,lit){
 const points={P:[80,70],N:[80,174],L:[260,121],R:[310,174]};
 const leads=wires.map(([a,b])=>{
  const p=points[a],q=points[b];if(!p||!q)return "";
  const danger=(a==="P"&&b==="N")||(a==="N"&&b==="P");
  return '<path d="M'+p[0]+' '+p[1]+'L'+q[0]+' '+q[1]+'" fill="none" class="wire'+(lit?' lit':'')+(danger?' danger':'')+'" stroke-linecap="round" stroke-width="7"/>';
 }).join("");
 return '<svg class="circuit-svg" viewBox="0 0 400 250" aria-label="乾電池と豆電球を導線でつなぐ実験回路" role="img">'+
 '<defs><linearGradient id="workCell" x1="0" y1="0" x2=".95" y2="1"><stop stop-color="#e7a361"/><stop offset=".32" stop-color="#c97255"/><stop offset=".65" stop-color="#b9574b"/><stop offset="1" stop-color="#803d42"/></linearGradient>'+
 '<linearGradient id="workMetal" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#788e99"/><stop offset=".32" stop-color="#f0f7ed"/><stop offset=".65" stop-color="#9fbdc3"/><stop offset="1" stop-color="#577080"/></linearGradient>'+
 '<radialGradient id="workGlass" cx=".36" cy=".26" r=".85"><stop stop-color="'+(lit?'#fff9d7':'#b7e5ea')+'" stop-opacity="'+(lit?'.99':'.68')+'"/><stop offset=".8" stop-color="'+(lit?'#f6c765':'#709cae')+'" stop-opacity="'+(lit?'.88':'.5')+'"/><stop offset="1" stop-color="#31516c" stop-opacity=".45"/></radialGradient></defs>'+
 (lit?'<ellipse cx="310" cy="96" rx="66" ry="67" fill="#ffdf86" opacity=".24" filter="url(#glow)"/>':'')+
 '<ellipse cx="82" cy="178" rx="62" ry="10" fill="#061a32" opacity=".35"/><ellipse cx="310" cy="181" rx="53" ry="8" fill="#061a32" opacity=".25"/>'+
 leads+
 '<g class="battery-model"><rect x="32" y="83" width="98" height="83" rx="19" fill="url(#workCell)" stroke="#ffdfac" stroke-width="4"/>'+
 '<rect x="39" y="91" width="85" height="64" rx="13" fill="#e3a065" opacity=".23"/>'+
 '<path d="M46 91Q38 116 47 152" stroke="#ffe3b0" stroke-width="8" opacity=".35" fill="none"/>'+
 '<path d="M80 83V70M80 166V174" stroke="url(#workMetal)" stroke-width="11" stroke-linecap="round"/>'+
 '<rect x="64" y="77" width="32" height="9" rx="4" fill="url(#workMetal)" stroke="#d9eced" stroke-width="2"/>'+
 '<rect x="49" y="161" width="62" height="7" rx="3" fill="url(#workMetal)"/>'+
 '<text x="81" y="116" text-anchor="middle" fill="#fff9e7" font-size="21" font-weight="900">1.5V</text>'+
 '<text x="81" y="140" text-anchor="middle" fill="#fff2da" font-size="13" font-weight="800">乾電池</text></g>'+
 '<g class="bulb-model">'+
 '<path d="M260 121L286 141" stroke="#e3ca8f" stroke-width="8" stroke-linecap="round"/>'+
 '<path d="M310 159V174" stroke="url(#workMetal)" stroke-width="8" stroke-linecap="round"/>'+
 '<path d="M284 132C271 117 265 102 268 83C273 47 294 35 312 36C339 36 356 57 356 85C356 109 344 123 333 136Z" fill="url(#workGlass)" stroke="'+(lit?'#fff1af':'#c1e9ed')+'" stroke-width="4"/>'+
 '<path d="M284 82C288 59 299 52 306 53" fill="none" stroke="#fff" opacity=".62" stroke-width="7" stroke-linecap="round"/>'+
 '<path d="M296 126L296 102L302 98L310 105L318 98L325 103L325 126" fill="none" stroke="'+(lit?'#fff8be':'#dfb98d')+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
 '<path d="M296 103L296 132M325 103L325 132" stroke="#c2d9d2" stroke-width="3"/>'+
 '<rect x="285" y="127" width="51" height="34" rx="7" fill="url(#workMetal)" stroke="#d2e4de" stroke-width="3"/>'+
 '<path d="M289 137H331M289 145H331M289 153H331" stroke="#58788a" stroke-width="3"/>'+
 '<rect x="298" y="161" width="24" height="11" rx="4" fill="#ddb779" stroke="#fff5d1" stroke-width="2"/></g>'+
 '<text x="80" y="212" text-anchor="middle" fill="#f8e6b9" font-size="15" font-weight="900">乾電池</text>'+
 '<text x="310" y="212" text-anchor="middle" fill="#f8e6b9" font-size="15" font-weight="900">豆電球</text>'+
 '<text x="80" y="235" text-anchor="middle" fill="#b8dae2" font-size="11">＋／− の接点</text>'+
 '<text x="309" y="235" text-anchor="middle" fill="#b8dae2" font-size="11">横と底に金属の接点</text></svg>';
}

window.AkariArt={battery,bulb,material,circuit,shortDiagram,testCircuit,workbench};
})();