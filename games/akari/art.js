"use strict";
(function(){
const wrap=(view,body,label="",css="")=>'<svg class="science-illustration '+css+'" viewBox="'+view+'" role="img" aria-label="'+label+'" xmlns="http://www.w3.org/2000/svg">'+body+'</svg>';
const defs='<defs><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#fbfffa"/><stop offset=".37" stop-color="#b5cbd3"/><stop offset=".71" stop-color="#e5f2ed"/><stop offset="1" stop-color="#738c99"/></linearGradient><linearGradient id="cell" x2="0" y2="1"><stop stop-color="#f8d99c"/><stop offset=".52" stop-color="#e7a15f"/><stop offset="1" stop-color="#c67450"/></linearGradient><radialGradient id="glass"><stop stop-color="#fffbdd"/><stop offset=".7" stop-color="#f4e0a6"/><stop offset="1" stop-color="#adcdcb" stop-opacity=".7"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="7"/></filter></defs>';
const plate=(x,y,w,h,fill="#233f56")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="13" fill="'+fill+'" stroke="#62899e" stroke-width="2"/>';
function battery(kind="small",active=true){
 let count=kind==="series"||kind==="reverse"?2:1,reverse=kind==="reverse",wide=kind==="large";
 let cells=Array.from({length:count},(_,i)=>{const x=count===1?73:28+i*115,y=32,w=wide?93:79,h=110;
 const flip=reverse&&i===1;return '<g transform="'+(flip?'translate('+(2*x+w)+' 0) scale(-1 1)':'translate(0 0)')+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="14" fill="url(#cell)" stroke="#f9e2bd" stroke-width="3"/><rect x="'+(x+8)+'" y="'+(y+14)+'" width="'+(w-16)+'" height="62" rx="6" fill="#c65d44" stroke="#f7ad80" stroke-width="2"/><rect x="'+(x+10)+'" y="'+(y+84)+'" width="'+(w-20)+'" height="23" rx="4" fill="#e1e7d6" opacity=".93"/><rect x="'+(x+29)+'" y="'+(y-9)+'" width="'+(w-58)+'" height="10" rx="4" fill="url(#metal)"/><path d="M'+(x+8)+' '+(y+111)+' h'+(w-16)+'" stroke="#68757c" stroke-width="7"/><text x="'+(x+w/2)+'" y="'+(y+51)+'" text-anchor="middle" font-size="27" font-weight="900" fill="#fff">1.5V</text><text x="'+(x+w/2)+'" y="'+(y+25)+'" text-anchor="middle" font-size="21" font-weight="900" fill="#fff">＋</text><text x="'+(x+w/2)+'" y="'+(y+101)+'" text-anchor="middle" font-size="21" font-weight="900" fill="#35526a">−</text></g>';}).join("");
 return wrap("0 0 260 190",defs+plate(3,3,254,184)+cells+(count===2?'<path d="M109 82h15" stroke="#f4db8f" stroke-width="4"/><text x="130" y="174" fill="#e0f7fa" font-size="13" text-anchor="middle">'+(reverse?"反対向き":"直列・同じ向き")+'</text>':'<text x="130" y="174" fill="#e0f7fa" font-size="13" text-anchor="middle">'+(wide?"単1形":"単4形")+'　1.5 V</text>'),count===2?"乾電池2個 "+(reverse?"逆向き":"直列"):"乾電池 "+(wide?"単1形":"単4形"),"battery-art"+(active?" active":""));
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
 plastic:'<path d="M92 44h74v20h-16v55q0 33-31 34q-33 0-35-34v-55h8Z" fill="#86cdf1" stroke="#dbf6fe" stroke-width="5"/><path d="M104 71V115Q104 137 119 137" fill="none" stroke="#d3ecff" stroke-width="7" opacity=".85"/><circle cx="120" cy="94" r="18" fill="#b7e8f7" opacity=".7"/>',
 iron:'<path d="M90 46 152 111 143 120 79 59Z" fill="url(#metal)" stroke="#c9e1e7" stroke-width="3"/><path d="M150 108 188 149 179 158 140 118Z" fill="#829caa"/><ellipse cx="82" cy="50" rx="17" ry="9" transform="rotate(45 82 50)" fill="#b5d2d7" stroke="#e5eff4" stroke-width="3"/>'
 }[id]||'';
 return wrap("0 0 250 205",defs+plate(3,3,244,198)+obj,
 {clip:"鉄のクリップ",foil:"アルミはく",wood:"木の棒",plastic:"プラスチック",iron:"鉄のくぎ"}[id]||"材料の見本","material-art");
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
 '<text x="212" y="213" fill="#ff9b91" font-size="13" text-anchor="middle">赤い近道は危険！</text>',
 "乾電池から電球を通る正常な導線とショートする赤い導線","short-art");
}
window.AkariArt={battery,bulb,material,circuit,shortDiagram};
})();