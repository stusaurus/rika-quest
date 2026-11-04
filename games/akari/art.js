"use strict";
(function(){
const wrap=(view,body,label="",css="")=>'<svg class="science-illustration '+css+'" viewBox="'+view+'" role="img" aria-label="'+label+'" xmlns="http://www.w3.org/2000/svg">'+body+'</svg>';
const defs='<defs><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#fbfffa"/><stop offset=".37" stop-color="#b5cbd3"/><stop offset=".71" stop-color="#e5f2ed"/><stop offset="1" stop-color="#738c99"/></linearGradient><linearGradient id="cell" x2="0" y2="1"><stop stop-color="#f8d99c"/><stop offset=".52" stop-color="#e7a15f"/><stop offset="1" stop-color="#c67450"/></linearGradient><radialGradient id="glass"><stop stop-color="#fffbdd"/><stop offset=".7" stop-color="#f4e0a6"/><stop offset="1" stop-color="#adcdcb" stop-opacity=".7"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="7"/></filter></defs>';
const plate=(x,y,w,h,fill="#233f56")=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="13" fill="'+fill+'" stroke="#62899e" stroke-width="2"/>';
function battery(kind="small",active=true){
 const count=kind==="series"||kind==="reverse"?2:1,reverse=kind==="reverse",wide=kind==="large";
 const sw=wide?74:count===2?58:57;
 const xs=count===1?[130-sw/2]:[55,147];
 const scheme='<defs><linearGradient id="batteryWrapV2" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#14536c"/><stop offset=".22" stop-color="#53a5af"/><stop offset=".55" stop-color="#2b8399"/><stop offset="1" stop-color="#154860"/></linearGradient></defs>';
 const cells=xs.map((x,i)=>{
  const plusTop=!(reverse&&i===1),y=38,h=100,mid=x+sw/2;
  const top=plusTop?
    '<rect x="'+(mid-11)+'" y="29" width="22" height="11" rx="4" fill="url(#metal)" stroke="#f3f8f6" stroke-width="1.5"/>':
    '<path d="M'+(x+3)+' 39H'+(x+sw-3)+'" stroke="#cbdde2" stroke-width="7" stroke-linecap="round"/>';
  const bottom=plusTop?
    '<path d="M'+(x+3)+' 139H'+(x+sw-3)+'" stroke="#b4c6cf" stroke-width="7" stroke-linecap="round"/>':
    '<rect x="'+(mid-11)+'" y="137" width="22" height="11" rx="4" fill="url(#metal)" stroke="#f3f8f6" stroke-width="1.5"/>';
  return '<g class="battery-cell-v2">'+
    '<rect x="'+x+'" y="'+y+'" width="'+sw+'" height="'+h+'" rx="12" fill="url(#batteryWrapV2)" stroke="#b8e2e7" stroke-width="2.6"/>'+
    '<path d="M'+(x+8)+' 48V126" stroke="#bde7e2" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>'+
    '<rect x="'+(x+7)+'" y="64" width="'+(sw-14)+'" height="43" rx="5" fill="#f7faf3" fill-opacity=".95"/>'+
    '<text x="'+mid+'" y="82" text-anchor="middle" fill="#23596c" font-size="14" font-weight="900">1.5V</text>'+
    '<text x="'+mid+'" y="96" text-anchor="middle" fill="#23596c" font-size="10" font-weight="900">乾電池</text>'+
    top+bottom+
    '<text x="'+mid+'" y="24" text-anchor="middle" fill="#ffefb6" font-size="19" font-weight="900">'+(plusTop?'＋':'−')+'</text>'+
    '<text x="'+mid+'" y="163" text-anchor="middle" fill="#eaf3ee" font-size="19" font-weight="900">'+(plusTop?'−':'＋')+'</text></g>';
 }).join("");
 const wire=count===2?'<path d="M84 141Q99 178 130 163Q137 151 137 33Q151 26 175 30" stroke="#efd49e" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="6 4"/>':'';
 const foot=count===2?(reverse?"2こ・ぎゃく向き":"2こ・同じ向き"):(wide?"単1形　1.5V":"単4形　1.5V");
 const description=count===2?(reverse?"乾電池2個を逆向きにつないだ模型":"乾電池2個を同じ向きにつないだ模型"):(wide?"大きな単1形乾電池の模型":"小さな単4形乾電池の模型");
 return wrap("0 0 260 190",defs+scheme+plate(3,3,254,184,"#1e4154")+wire+cells+
  '<text x="130" y="182" text-anchor="middle" fill="#e9f5e8" font-size="12" font-weight="800">'+foot+'</text>',
  description,"battery-art battery-art-v2"+(active?" active":""));
}
function bulb(on=false,short=false){
 const glass='<path d="M86 128C78 115 63 100 64 78C64 47 83 25 111 25C141 25 159 48 160 78C160 101 147 116 136 128Z" fill="'+(on?'url(#glass)':'#d8edf0')+'" fill-opacity="'+(on?'.95':'.78')+'" stroke="'+(on?'#fff0b1':'#d4edf0')+'" stroke-width="4"/>';
 const filament='<path d="M98 133V98L104 94L111 103L119 94L127 99V133" stroke="'+(on?'#fff2b2':'#ad7c4e')+'" stroke-width="3.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<path d="M98 100V139M127 100V139" stroke="#a2b4b8" stroke-width="2.4" fill="none"/>';
 return wrap("0 0 220 205",defs+plate(5,4,210,196,"#214659")+
  (on?'<ellipse cx="111" cy="76" rx="74" ry="67" fill="#ffe59a" opacity=".30" filter="url(#glow)"/>':'')+
  glass+'<path d="M82 78Q85 48 99 41" stroke="#fff" stroke-opacity=".65" stroke-width="5" fill="none" stroke-linecap="round"/>'+
  filament+
  '<rect x="83" y="128" width="57" height="44" rx="5" fill="url(#metal)" stroke="#e4f1ec" stroke-width="2.5"/>'+
  '<path d="M86 138H137M86 147H137M86 156H137M86 165H137" stroke="#6c8795" stroke-width="3.5"/>'+
  '<path d="M82 144H43" stroke="#b5c8ce" stroke-width="7" stroke-linecap="round"/>'+
  '<circle cx="43" cy="144" r="6" fill="#f8d795" stroke="#f6efd5" stroke-width="1.5"/>'+
  '<path d="M111 173V184" stroke="#c4d1cf" stroke-width="8" stroke-linecap="round"/>'+
  '<circle cx="111" cy="183" r="7" fill="#f8d795" stroke="#f6efd5" stroke-width="1.5"/>'+
  '<text x="12" y="133" fill="#f7f4e7" font-size="10" font-weight="800">横の金属</text>'+
  '<text x="128" y="188" fill="#f7f4e7" font-size="10" font-weight="800">底の接点</text>',
 "豆電球。ガラス部分と、側面の金属および底の接点が明確に分かれる模型"+(on?"。点灯中":""),
 "bulb-art bulb-art-v2");
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
function shortDiagram(removed=[]){
 const removedSet=new Set(Array.isArray(removed)?removed:[]);
 const lampOn=removedSet.has("x")&&removedSet.has("y")&&!removedSet.has("normal");
 const wire=(id,d,color,width=6)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"'+
  (removedSet.has(id)?' stroke-dasharray="4 14" opacity=".21"':'')+' data-line="'+id+'"/>';
 const mark=(id,x,y)=>'<g><rect x="'+(x-12)+'" y="'+(y-16)+'" width="24" height="23" rx="7" fill="#163c50" stroke="#d9e5c9" stroke-width="1.5"/><text x="'+x+'" y="'+y+'" text-anchor="middle" fill="#fff1c2" font-weight="900" font-size="15">'+id.toUpperCase()+'</text></g>';
 const bulbColor=lampOn?"#fff1ae":"#bad4d2";
 const bulbLine=lampOn?"#fff7c9":"#e4f3ec";
 return wrap("0 0 390 235",defs+plate(2,2,386,231)+
 '<rect x="29" y="85" width="72" height="65" rx="11" fill="#d99c61" stroke="#ffdf9b" stroke-width="3"/><text x="65" y="108" text-anchor="middle" fill="#fff" font-size="16">＋</text><text x="65" y="130" text-anchor="middle" fill="#fff" font-size="16">−</text>'+
 '<circle cx="304" cy="118" r="27" fill="'+bulbColor+'" stroke="'+bulbLine+'" stroke-width="5"/><path d="M293 110L314 129M314 110L293 129" stroke="#70878c" stroke-width="4" fill="none"/>'+
 (lampOn?'<circle cx="304" cy="118" r="38" fill="none" stroke="#ffe6a7" stroke-width="3" opacity=".7"/>':'')+
 wire("normal","M65 85V39H304V91M304 145V187H65V150","#f2deac")+
 wire("x","M65 85L160 77L225 163L65 150","#a0d8d3")+
 wire("y","M65 85V150","#adc1ec",5)+
 mark("z",202,37)+mark("x",165,101)+mark("y",33,122)+
 '<text x="202" y="213" fill="#d8eded" font-size="12" text-anchor="middle">'+(lampOn?"安全な回路だけが残った！":"3つの道を追って、どれを切るか考えよう")+'</text>',
 "乾電池から豆電球への3本の電気の道。ショートする経路を自分で見分ける安全なシミュレーション","short-art");
}
function testCircuit(id,lit){
 const names={iron:"鉄",clip:"鉄",foil:"アルミ",wood:"木",plastic:"プラスチック"};
 const color={clip:"#d9f0f0",foil:"#d5e5e9",wood:"#c29364",plastic:"#70c9eb"}[id]||"#91b5c4";
 const sample={
 iron:'<path d="M190 87L221 118L226 112L195 81Z" fill="url(#metal)" stroke="#dbeefa" stroke-width="2"/><ellipse cx="192" cy="86" rx="7" ry="4" transform="rotate(43 192 86)" fill="#e1f1ef"/>',
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
 '<rect x="177" y="83" width="61" height="39" rx="8" fill="#15344d" stroke="#7898a4" stroke-width="2"/>'+
 '<path d="M206 83v8M206 113v12" stroke="#efce96" stroke-width="7" stroke-linecap="round"/>'+sample+
 '<text x="206" y="148" text-anchor="middle" fill="#ccecf3" font-size="12">'+(names[id]||"材料を選ぼう")+'</text>'+
 (lit?'<circle cx="354" cy="87" r="52" fill="#ffe494" opacity=".5" filter="url(#glow)"/>':'')+
 '<path d="M335 122Q312 91 329 60Q348 36 370 54Q397 84 373 122Z" fill="'+glow+'" stroke="#e9f7ed" stroke-width="5"/>'+
 '<path d="M339 92l13 12 14-13" stroke="#f7f2c4" stroke-width="4" fill="none"/><rect x="338" y="119" width="32" height="28" rx="4" fill="url(#metal)"/><path d="M339 126h30m-30 8h30" stroke="#6f8a91" stroke-width="3"/>'+
 '<circle cx="354" cy="150" r="7" fill="#efc98a"/>'+
 '<text x="355" y="212" text-anchor="middle" fill="#cfe9f2" font-size="12">豆電球</text>',
 "材料を入れて乾電池と豆電球をつなぐ実験回路","test-circuit-art");
}

function workbench(wires,lit){
 // Terminal positions are a public contract with game.js and CSS.
 // P 80,43; N 80,207; L 245,144; R 310,206.
 const points={P:[80,43],N:[80,207],L:[245,144],R:[310,206]};
 const leads=wires.map(([a,b])=>{
  const p=points[a],q=points[b];if(!p||!q)return "";
  const danger=(a==="P"&&b==="N")||(a==="N"&&b==="P");
  return '<path d="M'+p[0]+' '+p[1]+'L'+q[0]+' '+q[1]+'" fill="none" class="wire'+(lit?' lit':'')+(danger?' danger':'')+'" stroke-linecap="round" stroke-width="7"/>';
 }).join("");
 const defs='<defs>'+
  '<linearGradient id="workCell" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#1c607a"/><stop offset=".16" stop-color="#4da3b5"/><stop offset=".52" stop-color="#2d829b"/><stop offset="1" stop-color="#164b66"/></linearGradient>'+
  '<linearGradient id="workMetal" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#7a8e99"/><stop offset=".24" stop-color="#f5faf9"/><stop offset=".56" stop-color="#cad7db"/><stop offset=".85" stop-color="#819aa5"/><stop offset="1" stop-color="#536b7b"/></linearGradient>'+
  '<linearGradient id="workGlass" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="'+(lit?'#fff6ca':'#e6f7f8')+'" stop-opacity="'+(lit?".98":".86")+'"/><stop offset=".65" stop-color="'+(lit?'#ffe5a5':'#bad5dc')+'" stop-opacity="'+(lit?".95":".69")+'"/><stop offset="1" stop-color="'+(lit?'#fff1cb':'#96b6c0')+'" stop-opacity=".70"/></linearGradient>'+
  '<filter id="workGlow"><feGaussianBlur stdDeviation="9"/></filter></defs>';
 const battery='<g class="battery-model" role="group" aria-label="たて型の単3形に似た乾電池。上がプラス、下がマイナス">'+
  '<ellipse cx="80" cy="212" rx="41" ry="6" fill="#081e36" opacity=".30"/>'+
  '<rect x="52" y="72" width="56" height="114" rx="10" fill="url(#workCell)" stroke="#e3f2f2" stroke-width="2.2"/>'+
  '<path d="M60 83V174" stroke="#b8e3e5" stroke-width="4" stroke-linecap="round" opacity=".64"/>'+
  '<rect x="52" y="72" width="56" height="13" rx="5" fill="url(#workMetal)" stroke="#a5bfc8" stroke-width="1.4"/>'+
  '<ellipse cx="80" cy="72" rx="28" ry="7" fill="url(#workMetal)" stroke="#e3ebec" stroke-width="1.3"/>'+
  '<path d="M80 72V49" stroke="url(#workMetal)" stroke-width="11" stroke-linecap="round"/>'+
  '<rect x="70" y="38" width="20" height="12" rx="4" fill="url(#workMetal)" stroke="#f3f6eb" stroke-width="1.5"/>'+
  '<path d="M61 181H99" stroke="#b4cdd0" stroke-width="10" stroke-linecap="round"/>'+
  '<rect x="52" y="180" width="56" height="10" rx="4" fill="url(#workMetal)" stroke="#bdcacf" stroke-width="1.5"/>'+
  '<path d="M80 188V206" stroke="url(#workMetal)" stroke-width="11" stroke-linecap="round"/>'+
  '<rect x="67" y="199" width="26" height="9" rx="3" fill="url(#workMetal)" stroke="#e4eff0" stroke-width="1.2"/>'+
  '<rect x="59" y="100" width="42" height="42" rx="5" fill="#e8f6f1" opacity=".94"/>'+
  '<text x="80" y="119" text-anchor="middle" fill="#154a65" font-size="15" font-weight="900">1.5 V</text>'+
  '<text x="80" y="135" text-anchor="middle" fill="#23546b" font-size="9" font-weight="800">乾電池</text>'+
  '<text x="123" y="56" text-anchor="middle" fill="#fff1bf" font-size="23" font-weight="900">＋</text>'+
  '<text x="124" y="211" text-anchor="middle" fill="#e9f2ef" font-size="22" font-weight="900">−</text></g>';
 const filament='<path d="M298 126L298 103L304 98L310 107L317 98L323 103L323 126" fill="none" stroke="'+(lit?'#fff1ae':'#b27745')+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<path d="M298 104L298 137M323 104L323 137" stroke="#9ea9ad" stroke-width="2.5"/>';
 const bulb='<g class="bulb-model" role="group" aria-label="豆電球。左の金属側面と下の小さな金属が別々の接点">'+
  (lit?'<ellipse cx="310" cy="87" rx="73" ry="64" fill="#ffdf80" opacity=".40" filter="url(#workGlow)"/>':'')+
  '<path d="M285 139C279 124 273 111 275 90C276 58 289 42 311 42C334 42 347 60 348 88C351 110 342 124 336 139Z" fill="url(#workGlass)" stroke="'+(lit?'#ffefae':'#e4f2f4')+'" stroke-width="3.7"/>'+
  '<path d="M285 86C289 61 298 54 304 52" fill="none" stroke="#fff" opacity=".8" stroke-width="4.5" stroke-linecap="round"/>'+
  filament+
  '<rect x="286" y="138" width="49" height="40" rx="6" fill="url(#workMetal)" stroke="#e3eff2" stroke-width="2.2"/>'+
  '<path d="M288 146H333M288 154H333M288 162H333M288 170H333" fill="none" stroke="#617788" stroke-width="3"/>'+
  '<path d="M246 144H284" fill="none" stroke="#a6b9bc" stroke-width="8" stroke-linecap="round"/>'+
  '<circle cx="247" cy="144" r="6.5" fill="#f7d799" stroke="#d2a75e" stroke-width="1.5"/>'+
  '<path d="M310 180V205" fill="none" stroke="#b8c6cb" stroke-width="8" stroke-linecap="round"/>'+
  '<rect x="300" y="178" width="20" height="7" rx="3" fill="#e7f0eb" stroke="#91a4b5" stroke-width="1.2"/>'+
  '<circle cx="310" cy="206" r="6.5" fill="#f7d799" stroke="#d2a75e" stroke-width="1.5"/></g>';
 return '<svg class="circuit-svg circuit-svg-v2" viewBox="0 0 400 250" aria-label="実物に近い乾電池と豆電球。乾電池の上は＋極、下は−極。豆電球の左に金属の横、下に底の接点がある" role="img">'+
  defs+
  '<path d="M18 222H380" stroke="#5d8593" stroke-width="1" stroke-dasharray="3 7" opacity=".42"/>'+
  leads+battery+bulb+'</svg>';
}

window.AkariArt={battery,bulb,material,circuit,shortDiagram,testCircuit,workbench};
})();