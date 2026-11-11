"use strict";
(function(){
/* Streetlamp repair: a real two-gap series circuit rather than a lucky material choice.
 * Children put samples straight into the real A/B gaps; the circuit responds immediately.
 * The lamp is a load (L--R), not an ordinary piece of wire. */
const sites=[
 {id:"battery",name:"A（＋がわ）",icon:"🔋",diagram:{x:294,y:55,viewBox:"192 0 204 113",pin:{x:399,y:124}},memo:"Aの せんが きれている。",finding:"Aで 線が とぎれている。 でんちの ＋から 来た 線だよ。"},
 {id:"lamp",name:"まめ電球",icon:"💡",diagram:{x:533,y:170,viewBox:"446 84 174 173",pin:{x:612,y:280}},memo:"まめ電球は まだ 光っていない。",finding:"まめ電球の 上と 下に 線が ある。 でも、まだ 光っていない。"},
 {id:"return",name:"B（−がわ）",icon:"🔌",diagram:{x:294,y:287,viewBox:"192 227 204 113",pin:{x:191,y:216}},memo:"Bの せんが きれている。",finding:"Bで 線が とぎれている。 でんちの −へ もどる 線だよ。"}
];
const materials=[
 {id:"iron",name:"鉄のくぎ",conductive:true,detail:"鉄は金属。"},
 {id:"foil",name:"アルミはく",conductive:true,detail:"アルミニウムも金属。"},
 {id:"wood",name:"乾いた木片",conductive:false,detail:"乾いた木は通常は電気を通しにくい。"},
 {id:"plastic",name:"プラスチック片",conductive:false,detail:"プラスチックは通常は電気を通しにくい。"}
];
const reasonOptions=[
 ["both","＋から まめ電球を 通り、−へ もどる 道が ある"],
 ["one","＋から まめ電球まで つながれば 光る"],
 ["bright","−から まめ電球まで つながれば 光る"]
];
const material=id=>materials.find(x=>x.id===id);
const valid=id=>Boolean(material(id));
const initial=()=>({inspected:[],selected:null,sampleGuess:null,tests:{},slots:{a:null,b:null},repairGuess:null,repairResult:null,trialLog:[],reason:null});
function normalize(raw){
 const o=initial();if(!raw||typeof raw!=="object")return o;
 o.inspected=[...new Set(Array.isArray(raw.inspected)?raw.inspected:[])].filter(id=>sites.some(s=>s.id===id));
 o.selected=valid(raw.selected)?raw.selected:null;
 o.sampleGuess=["lit","dark"].includes(raw.sampleGuess)?raw.sampleGuess:null;
 const tests=raw.tests&&typeof raw.tests==="object"?raw.tests:{};
 for(const m of materials)if(["lit","dark"].includes(tests[m.id]?.guess)&&tests[m.id]?.actual===(m.conductive?"lit":"dark"))
   o.tests[m.id]={guess:tests[m.id].guess,actual:tests[m.id].actual};
 const slots=raw.slots&&typeof raw.slots==="object"?raw.slots:{};
 for(const slot of ["a","b"])if(valid(slots[slot]))o.slots[slot]=slots[slot];
 if(o.slots.a===o.slots.b)o.slots.b=null;
 // Legacy saved sample predictions are retained but never gate direct repair.
 o.repairGuess=["lit","dark"].includes(raw.repairGuess)?raw.repairGuess:null;
 o.reason=reasonOptions.some(([id])=>id===raw.reason)?raw.reason:null;
 const log=Array.isArray(raw.trialLog)?raw.trialLog:[];
 for(const trial of log.slice(-12)){
  if(!valid(trial?.a)||!valid(trial?.b)||trial.a===trial.b)continue;
  const actual=evaluate({a:trial.a,b:trial.b}).lit?"lit":"dark";
  const key=signature({a:trial.a,b:trial.b});
  if(o.trialLog.some(x=>x.signature===key))continue;
  o.trialLog.push({a:trial.a,b:trial.b,signature:key,actual});
 }
 // Old saves with a fully repaired circuit stay playable after migration.
 if(o.slots.a&&o.slots.b&&!o.trialLog.some(x=>x.signature===signature(o.slots))){
  const status=evaluate(o.slots);
  o.trialLog.push({a:o.slots.a,b:o.slots.b,signature:signature(o.slots),actual:status.lit?"lit":"dark"});
 }
 return o;
}
function traced(edges,from,to,includeBulb){
 const g={P:[],A:[],L:[],R:[],B:[],N:[]};
 for(const [a,b] of edges){g[a].push(b);g[b].push(a)}
 if(includeBulb){g.L.push("R");g.R.push("L")}
 const visited=new Set([from]),stack=[from];
 while(stack.length){for(const node of g[stack.pop()])if(!visited.has(node)){visited.add(node);stack.push(node)}}
 return visited.has(to);
}
function evaluate(slots={}){
 const wires=[["A","L"],["R","B"]];
 if(material(slots.a)?.conductive)wires.push(["P","A"]);
 if(material(slots.b)?.conductive)wires.push(["B","N"]);
 const short=traced(wires,"P","N",false);
 return {short,lit:!short&&traced(wires,"P","N",true),wires};
}
function signature(slots){return ["a","b"].map(k=>valid(slots[k])?slots[k]:"-").join("|")}
function evidenceReady(s){return normalize(s).inspected.length===3;}
function canFinish(s){
 const d=normalize(s),e=evaluate(d.slots);
 return evidenceReady(d)&&d.slots.a!==null&&d.slots.b!==null&&d.slots.a!==d.slots.b&&e.lit&&d.reason==="both";
}
function sceneLit(s){return evaluate(normalize(s).slots).lit}
function circuit(slots={},isLit=false){
 const c=isLit?"#ffefb3":"#ffe2a3";
 const wire=(d,on)=>'<path class="bridge-main-wire" d="'+d+'" stroke="'+(on?c:"#72838a")+'" stroke-width="8" stroke-linecap="round" fill="none" '+(on?'':'stroke-dasharray="7 8"')+'/>';
 const label=(x,y,s)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="15" font-weight="800" fill="#fff9e7">'+s+'</text>';
 // Draw the actual missing METAL CONTACTS, not an opaque box saying "unrepaired".
 // The repair gap is electrically open until a tested conducting sample joins both ends.
 const gap=(x,y,id,name)=>{
  const specimen=material(id),joins=!!specimen?.conductive;
  const letter=name.endsWith("A")?"A":"B",status=!id?"open":joins?"conductive":"insulator";
  const terminals='<path class="bridge-gap-stubs" d="M'+(x-57)+' '+y+'h38 M'+(x+19)+' '+y+'h38" fill="none" stroke="'+c+'" stroke-width="9" stroke-linecap="round"/>'+
   '<circle cx="'+(x-19)+'" cy="'+y+'" r="8" fill="#ffe4a3" stroke="#234e60" stroke-width="3"/>'+
   '<circle cx="'+(x+19)+'" cy="'+y+'" r="8" fill="#ffe4a3" stroke="#234e60" stroke-width="3"/>';
  // A piece on the board is THE SAME ORIGINAL SVG SHAPE as the material
  // card the learner dragged. Do not replace nails, foil, wood or plastic with
  // an abstract conductive bar or insulating square. The scientific status
  // still comes exclusively from evaluate(), not from the drawing.
  const piece=id&&window.AkariArt?.materialPiece?
   window.AkariArt.materialPiece(id,x-50,y-35,100,70,true):"";
  const bridge=id?
   '<g class="bridge-installed-specimen" data-bridge-specimen="'+id+'" data-bridge-joins="'+(joins?"true":"false")+'">'+piece+'</g>':
   '<path class="bridge-visible-break" d="M'+(x-8)+' '+(y-9)+'l16 18M'+(x+8)+' '+(y-9)+'l-16 18" stroke="#fff0d4" stroke-width="3" stroke-linecap="round" opacity=".9"/>';
  const placard='<rect x="'+(x-17)+'" y="'+(y-43)+'" width="34" height="26" rx="8" fill="#1e4353" stroke="#f9e2a0" stroke-width="2"/>'+
   '<text x="'+x+'" y="'+(y-25)+'" text-anchor="middle" font-size="18" font-weight="900" fill="#fff7de">'+letter+'</text>';
  const caption=id?'<text class="bridge-sample-label" x="'+x+'" y="'+(y+43)+'" text-anchor="middle" font-size="13" font-weight="900" fill="#fff9ec" stroke="#254658" stroke-width="3" paint-order="stroke">'+specimen.name+'</text>':"";
  return '<g class="bridge-gap-visual" data-bridge-gap="'+letter.toLowerCase()+'" data-bridge-gap-state="'+status+'">'+terminals+bridge+placard+caption+'</g>';
 };
 return '<svg class="bridge-circuit-svg" viewBox="0 0 680 340" role="img" aria-label="乾電池のプラス極から修理Aと豆電球を通り修理Bからマイナス極へ戻る回路図。修理が不足すると点灯しない。">'+
 '<defs><linearGradient id="akariRepairBattery" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#265e6d"/><stop offset=".3" stop-color="#5ca9ad"/><stop offset=".75" stop-color="#317e8e"/><stop offset="1" stop-color="#215666"/></linearGradient></defs><g id="akari-bridge-drawing">'+
 '<rect width="680" height="340" rx="19" fill="#b7dcdf"/>'+(window.AkariCircuitVillage?.repair()||'')+'<rect width="680" height="340" rx="19" fill="#12344d" opacity=".22" pointer-events="none"/>'+
 '<rect class="bridge-battery-body" x="31" y="85" width="112" height="172" rx="16" fill="url(#akariRepairBattery)" stroke="#d4ede5" stroke-width="4"/>'+
 '<path d="M43 102V239" stroke="#dcf6ed" stroke-opacity=".44" stroke-width="6" stroke-linecap="round"/>'+
 '<rect x="45" y="137" width="85" height="72" rx="11" fill="#fcf8e9" stroke="#b4d2c1" stroke-width="2"/>'+
 '<text x="87" y="126" font-size="19" font-weight="900" text-anchor="middle" fill="#fdf9e9">乾電池</text>'+
 '<text x="87" y="177" font-size="24" font-weight="900" text-anchor="middle" fill="#27576a">1.5V</text>'+
 '<text x="87" y="196" font-size="12" text-anchor="middle" fill="#43736f">かんでんち</text>'+
 '<circle cx="87" cy="74" r="15" fill="#fff6da"/><circle cx="87" cy="265" r="15" fill="#fff6da"/>'+
 label(114,70,"＋")+label(114,292,"−")+
 wire("M87 74V55H236",true)+wire("M352 55H533V112",true)+
 wire("M533 228V287H352",true)+wire("M236 287H87V265",true)+
 gap(294,55,slots.a,"修理 A")+gap(294,287,slots.b,"修理 B")+
 '<circle cx="533" cy="170" r="62" fill="'+(isLit?"#ffeab2":"#dcebee")+'" stroke="#e8f4ee" stroke-width="6"/>'+
 '<path d="M499 129Q514 116 526 117" fill="none" stroke="#fffef6" stroke-width="8" stroke-linecap="round" opacity=".8"/>'+
 '<circle cx="533" cy="170" r="57" fill="none" stroke="#88aeb4" stroke-width="2.5" opacity=".7"/>'+
 '<circle cx="533" cy="170" r="27" fill="none" stroke="'+(isLit?"#b67932":"#9abac8")+'" stroke-width="5"/>'+
 '<path class="bridge-filament" d="M513 170L520 161L528 179L536 161L544 179L551 170" fill="none" stroke="'+(isLit?"#fff3ab":"#a9c4c7")+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'+
 '<circle cx="533" cy="112" r="8" fill="#fff2cc"/><circle cx="533" cy="228" r="8" fill="#fff2cc"/>'+
 label(616,174,"豆電球")+
 (isLit?'<g class="bridge-sparkles"><circle cx="591" cy="101" r="7" fill="#ffe699"/><circle cx="483" cy="111" r="5" fill="#ffe699"/></g>':"")+
 '</g></svg>';
}
function render(raw){
 const s=normalize(raw),ready=evidenceReady(s),lit=sceneLit(s);
 const art=window.AkariArt||{};
 const details=sites.map(site=>{
  const done=s.inspected.includes(site.id);
  return '<button type="button" class="bridge-site'+(done?" found":"")+'" data-bridge-inspect="'+site.id+'"><span class="bridge-site-art" aria-hidden="true"><svg class="bridge-site-crop" viewBox="'+site.diagram.viewBox+'"><use href="#akari-bridge-drawing"></use></svg></span><strong>'+site.name+'</strong><small>'+(done?"✓ "+site.finding:"調査する")+'</small></button>';
 }).join("");
 const source=materials.map(m=>{
  const places=[s.slots.a===m.id?"A":"",s.slots.b===m.id?"B":""].filter(Boolean).join("・");
  return '<button type="button" class="bridge-material'+(s.selected===m.id?" selected":"")+'" data-bridge-sample="'+m.id+'" aria-pressed="'+(s.selected===m.id)+'"><span class="bridge-material-art">'+(art.material?art.material(m.id):"")+'</span><strong>'+m.name+'</strong><small>'+(places?places+" に はめた":"えらぶ")+'</small></button>';
 }).join("");
 const trials=s.trialLog.map(t=>'<li class="bridge-record">A：'+material(t.a).name+' ／ B：'+material(t.b).name+' → '+(t.actual==="lit"?"💡 光った":"◯ 光らない")+'</li>').join("");
 return '<div class="bridge-lab">'+
 '<div class="bridge-quest-strip"><strong>💡 街灯のあかりをもどそう</strong><span>調査 '+s.inspected.length+'/3 ｜ 回路 '+(lit?"点灯":"まだ光らない")+'</span></div>'+
 '<div class="bridge-circuit circuit-town-repair'+(lit?' is-lit':'')+'">'+circuit(s.slots,lit)+'</div>'+
 '<section class="lab-panel bridge-section"><h3>① 3かしょを しらべよう</h3><p class="lab-sub">🔎 を さわろう。わかったことが メモに のこるよ。</p><div class="bridge-sites">'+details+'</div></section>'+
 (ready?'<section class="lab-panel bridge-section bridge-direct-materials"><h3>② 材料を えらぼう</h3><p class="lab-sub">材料を えらんだら、回路の AかBに はめよう。</p><div class="bridge-materials">'+source+'</div></section>'+
 '<section class="lab-panel bridge-section bridge-direct-repair"><h3>③ A と B に はめよう</h3>'+
 '<div class="bridge-slot-actions">'+["a","b"].map(slot=>'<button type="button" data-bridge-place="'+slot+'" '+(!s.selected?"disabled":"")+'><strong>'+slot.toUpperCase()+'</strong><span>'+(material(s.slots[slot])?.name||"空いている")+'</span><small>'+(s.selected?"えらんだ材料を はめる":"先に 材料を えらぼう")+'</small></button>').join("")+'</div>'+
 '<p class="lab-sub">2かしょが つながったら、まめ電球を 見てみよう。</p>'+
 ((s.slots.a&&s.slots.b)?'<div class="bridge-outcome '+(lit?"lit":"dark")+'" role="status">'+(lit?"💡 光った！ ＋から −まで 道が できた。":"◯ まだ 光らない。A と B の 材料を かえてみよう。")+'</div>':"")+
 (s.trialLog.length?'<div class="bridge-direct-history"><strong>📖 ためした きろく</strong><ol>'+trials+'</ol></div>':"")+
 (lit?'<div class="bridge-why"><h3>④ どうして 光った？</h3><p class="lab-sub">回路を 見て、わけを えらぼう。</p>'+
 reasonOptions.map(([id,txt])=>'<button type="button" data-bridge-reason="'+id+'" class="'+(s.reason===id?" chosen":"")+'" aria-pressed="'+(s.reason===id)+'">'+txt+'</button>').join("")+
 '<p class="lab-sub">わけを えらんだら、「街灯の復旧を確認する」へ。</p></div>':"")+
 '</section>':"")+
 '</div>';
}
window.AkariBridge={sites,materials,reasonOptions,initial,normalize,material,evaluate,signature,evidenceReady,canFinish,sceneLit,render,circuit};
})();