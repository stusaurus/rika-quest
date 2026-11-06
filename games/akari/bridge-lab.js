"use strict";
(function(){
/* Streetlamp repair: a real two-gap series circuit rather than a lucky material choice.
 * The sample test is simulated; a metal is only proven conductive after prediction and measurement.
 * The lamp is a load (L--R), not an ordinary piece of wire. */
const sites=[
 {id:"battery",name:"街灯の回路・乾電池",icon:"🔋",finding:"電池から 線が のびている。 でも、すき間が ある！"},
 {id:"lamp",name:"街灯の回路・豆電球",icon:"💡",finding:"まめ電球の 横と 下に 線を つなごう。"},
 {id:"return",name:"街灯の回路・もどる線",icon:"🔌",finding:"電池の −へ もどる線にも、すき間が ある！"}
];
const materials=[
 {id:"iron",name:"鉄のくぎ",conductive:true,detail:"鉄は金属。"},
 {id:"foil",name:"アルミはく",conductive:true,detail:"アルミニウムも金属。"},
 {id:"wood",name:"乾いた木片",conductive:false,detail:"乾いた木は通常は電気を通しにくい。"},
 {id:"plastic",name:"プラスチック片",conductive:false,detail:"プラスチックは通常は電気を通しにくい。"}
];
const reasonOptions=[
 ["both","＋から 電球を 通り、−へ もどる 道が できた"],
 ["one","ガラスに ＋を つければ、もどる道は いらない"],
 ["bright","ピカピカなら ぜんぶ 電気が 通る"]
];
const material=id=>materials.find(x=>x.id===id);
const valid=id=>Boolean(material(id));
const initial=()=>({inspected:[],selected:null,sampleGuess:null,tests:{},slots:{a:null,b:null},repairGuess:null,repairResult:null,reason:null});
function normalize(raw){
 const o=initial();if(!raw||typeof raw!=="object")return o;
 o.inspected=[...new Set(Array.isArray(raw.inspected)?raw.inspected:[])].filter(id=>sites.some(s=>s.id===id));
 o.selected=valid(raw.selected)?raw.selected:null;
 o.sampleGuess=["lit","dark"].includes(raw.sampleGuess)?raw.sampleGuess:null;
 const tests=raw.tests&&typeof raw.tests==="object"?raw.tests:{};
 for(const m of materials)if(["lit","dark"].includes(tests[m.id]?.guess)&&tests[m.id]?.actual===(m.conductive?"lit":"dark"))
   o.tests[m.id]={guess:tests[m.id].guess,actual:tests[m.id].actual};
 const slots=raw.slots&&typeof raw.slots==="object"?raw.slots:{};
 for(const slot of ["a","b"])if(valid(slots[slot])&&o.tests[slots[slot]])o.slots[slot]=slots[slot];
 if(o.slots.a===o.slots.b)o.slots.b=null;
 o.repairGuess=["lit","dark"].includes(raw.repairGuess)?raw.repairGuess:null;
 o.reason=reasonOptions.some(([id])=>id===raw.reason)?raw.reason:null;
 const status=evaluate(o.slots);
 if(raw.repairResult&&raw.repairResult.signature===signature(o.slots)&&
    raw.repairResult.actual===(status.lit?"lit":"dark")&&raw.repairResult.guess===o.repairGuess)
     o.repairResult={signature:signature(o.slots),guess:o.repairGuess,actual:status.lit?"lit":"dark"};
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
function evidenceReady(s){
 const d=normalize(s);
 if(d.inspected.length!==3)return false;
 const seen=Object.keys(d.tests).map(material);
 return seen.filter(m=>m.conductive).length>=2&&seen.some(m=>!m.conductive);
}
function canFinish(s){
 const d=normalize(s),e=evaluate(d.slots);
 return evidenceReady(d)&&d.slots.a!==null&&d.slots.b!==null&&d.slots.a!==d.slots.b&&e.lit&&
  d.repairResult?.signature===signature(d.slots)&&d.repairResult.guess==="lit"&&d.repairResult.actual==="lit"&&d.reason==="both";
}
function sceneLit(s){const d=normalize(s);return d.repairResult?.signature===signature(d.slots)&&d.repairResult.actual==="lit"&&evaluate(d.slots).lit}
function circuit(slots={},isLit=false){
 const wires=evaluate(slots).wires;
 const c=isLit?"#ffe5a0":"#a9ced7";
 const edge=(a,b)=>wires.some(([x,y])=>x===a&&y===b||x===b&&y===a);
 const wire=(d,on)=>'<path d="'+d+'" stroke="'+(on?c:"#5c7683")+'" stroke-width="7" stroke-linecap="round" fill="none" '+(on?'':'stroke-dasharray="7 8"')+'/>';
 const label=(x,y,s)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="15" font-weight="800" fill="#e7f8f8">'+s+'</text>';
 const gap=(x,y,id,name)=>'<rect x="'+(x-58)+'" y="'+(y-23)+'" width="116" height="45" rx="9" fill="'+(id?"#dbeddf":"#254761")+'" stroke="'+(id?"#84be96":"#d49f83")+'" stroke-width="3"/>'+
 '<text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" font-size="14" font-weight="800" fill="'+(id?"#1b4c38":"#fff0dd")+'">'+(id?(material(id)?.name||""):"未修理")+'</text>'+label(x,y-34,name);
 return '<svg class="bridge-circuit-svg" viewBox="0 0 680 340" role="img" aria-label="乾電池のプラス極から修理Aと豆電球を通り修理Bからマイナス極へ戻る回路図。修理が不足すると点灯しない。">'+
 '<rect width="680" height="340" rx="19" fill="#b7dcdf"/>'+(window.AkariCircuitVillage?.repair()||'')+'<rect width="680" height="340" rx="19" fill="#12344d" opacity=".22" pointer-events="none"/>'+
 '<rect x="31" y="85" width="112" height="172" rx="14" fill="#b9644d" stroke="#ffe5ad" stroke-width="5"/>'+
 '<text x="87" y="130" font-size="19" text-anchor="middle" fill="#fff">乾電池</text><text x="87" y="172" font-size="24" font-weight="800" text-anchor="middle" fill="#fff">1.5V</text>'+
 '<circle cx="87" cy="74" r="15" fill="#fff6da"/><circle cx="87" cy="265" r="15" fill="#fff6da"/>'+
 label(114,70,"＋")+label(114,292,"−")+
 wire("M87 74V55H236",edge("P","A"))+wire("M352 55H533V112",true)+
 wire("M533 228V287H352",true)+wire("M236 287H87V265",edge("B","N"))+
 gap(294,55,slots.a,"修理 A")+gap(294,287,slots.b,"修理 B")+
 '<circle cx="533" cy="170" r="62" fill="'+(isLit?"#ffeab2":"#204961")+'" stroke="#e8f4ee" stroke-width="6"/>'+
 '<circle cx="533" cy="170" r="27" fill="none" stroke="'+(isLit?"#b67932":"#9abac8")+'" stroke-width="5"/>'+
 '<path d="M518 154L548 186M548 154L518 186" stroke="'+(isLit?"#9d6b39":"#bbd9df")+'" stroke-width="6"/>'+
 '<circle cx="533" cy="112" r="8" fill="#fff2cc"/><circle cx="533" cy="228" r="8" fill="#fff2cc"/>'+
 label(616,174,"豆電球")+
 (isLit?'<g class="bridge-sparkles"><circle cx="591" cy="101" r="7" fill="#ffe699"/><circle cx="483" cy="111" r="5" fill="#ffe699"/></g>':"")+
 '</svg>';
}
const inspectArtwork={"battery":"<svg viewBox=\"0 0 160 96\" aria-hidden=\"true\"><defs><linearGradient id=\"b3batt\" x2=\"0\" y2=\"1\"><stop stop-color=\"#fff2bd\"/><stop offset=\".4\" stop-color=\"#d8b86f\"/><stop offset=\"1\" stop-color=\"#75654d\"/></linearGradient></defs><rect width=\"160\" height=\"96\" fill=\"#173a4b\"/><rect y=\"65\" width=\"160\" height=\"31\" fill=\"#655440\"/><path d=\"M0 71H160M0 83H160\" stroke=\"#a48968\" opacity=\".4\"/><path d=\"M24 69V94M104 69V94\" stroke=\"#443f3a\" opacity=\".3\"/><ellipse cx=\"81\" cy=\"79\" rx=\"69\" ry=\"6\" fill=\"#182d34\" opacity=\".48\"/><rect x=\"28\" y=\"30\" width=\"111\" height=\"38\" rx=\"14\" fill=\"url(#b3batt)\" stroke=\"#d9d1ae\" stroke-width=\"2.4\"/><rect x=\"30\" y=\"30\" width=\"37\" height=\"38\" rx=\"12\" fill=\"#ad4033\"/><path d=\"M57 30H67V68H57\" fill=\"#ba5144\"/><path d=\"M64 32H128\" stroke=\"#fffce3\" opacity=\".55\" stroke-width=\"3\"/><rect x=\"18\" y=\"43\" width=\"12\" height=\"12\" rx=\"3\" fill=\"#c9dce3\" stroke=\"#6f8b99\"/><rect x=\"139\" y=\"41\" width=\"8\" height=\"16\" rx=\"2\" fill=\"#a7b4b6\"/><text x=\"47\" y=\"55\" font-size=\"20\" text-anchor=\"middle\" fill=\"#fff6e7\" font-weight=\"900\">＋</text><text x=\"119\" y=\"55\" font-size=\"20\" text-anchor=\"middle\" fill=\"#374656\" font-weight=\"900\">−</text><path d=\"M19 49H5V20H40\" stroke=\"#d6a35b\" stroke-width=\"5\" fill=\"none\"/><path d=\"M147 49H158V21H119\" stroke=\"#acbdc1\" stroke-width=\"4\" fill=\"none\"/><circle cx=\"40\" cy=\"20\" r=\"6\" fill=\"#cda77b\" stroke=\"#fff0b8\" stroke-width=\"2\"/><circle cx=\"119\" cy=\"21\" r=\"6\" fill=\"#cda77b\" stroke=\"#fff0b8\" stroke-width=\"2\"/></svg>","lamp":"<svg viewBox=\"0 0 160 96\" aria-hidden=\"true\"><defs><radialGradient id=\"b3glass\" cx=\".36\" cy=\".20\"><stop stop-color=\"#ffffff\" stop-opacity=\".98\"/><stop offset=\".65\" stop-color=\"#bddfe4\" stop-opacity=\".65\"/><stop offset=\"1\" stop-color=\"#6e9baa\" stop-opacity=\".9\"/></radialGradient></defs><rect width=\"160\" height=\"96\" fill=\"#173a4b\"/><rect y=\"65\" width=\"160\" height=\"31\" fill=\"#655440\"/><path d=\"M0 71H160M0 83H160\" stroke=\"#a48968\" opacity=\".4\"/><path d=\"M24 69V94M104 69V94\" stroke=\"#443f3a\" opacity=\".3\"/><ellipse cx=\"80\" cy=\"84\" rx=\"33\" ry=\"6\" fill=\"#102b3d\" opacity=\".6\"/><path d=\"M57 47Q43 29 51 15Q62 -3 80 3Q99 -3 110 17Q117 32 103 47L98 59H63Z\" fill=\"url(#b3glass)\" stroke=\"#e9f3ea\" stroke-width=\"3\"/><path d=\"M60 24Q61 12 70 9\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M70 45V29L76 24L83 32L89 24L96 30V45\" stroke=\"#b89c72\" stroke-width=\"2.6\" fill=\"none\"/><rect x=\"63\" y=\"48\" width=\"35\" height=\"24\" rx=\"5\" fill=\"#94aab1\" stroke=\"#e1d9c5\" stroke-width=\"2\"/><path d=\"M65 54H96M65 62H96M65 69H96\" stroke=\"#455b65\" stroke-width=\"3\"/><circle cx=\"80\" cy=\"75\" r=\"5\" fill=\"#d9b878\"/><path d=\"M63 56H28V84M80 76V89H132V56H98\" fill=\"none\" stroke=\"#ccaa68\" stroke-width=\"5\"/><circle cx=\"28\" cy=\"84\" r=\"5\" fill=\"#e8d9b7\"/><circle cx=\"132\" cy=\"56\" r=\"5\" fill=\"#e8d9b7\"/></svg>","return":"<svg viewBox=\"0 0 160 96\" aria-hidden=\"true\"><rect width=\"160\" height=\"96\" fill=\"#173a4b\"/><rect y=\"65\" width=\"160\" height=\"31\" fill=\"#655440\"/><path d=\"M0 71H160M0 83H160\" stroke=\"#a48968\" opacity=\".4\"/><path d=\"M24 69V94M104 69V94\" stroke=\"#443f3a\" opacity=\".3\"/><ellipse cx=\"81\" cy=\"78\" rx=\"67\" ry=\"7\" fill=\"#172b31\" opacity=\".5\"/><rect x=\"17\" y=\"32\" width=\"126\" height=\"38\" rx=\"8\" fill=\"#344d52\" stroke=\"#b1bfa8\" stroke-width=\"3\"/><path d=\"M20 51H53M105 51H140\" stroke=\"#c1a575\" stroke-width=\"8\" stroke-linecap=\"round\"/><path d=\"M20 51H53M105 51H140\" stroke=\"#f3cf88\" stroke-width=\"3\" stroke-linecap=\"round\"/><rect x=\"45\" y=\"37\" width=\"18\" height=\"29\" rx=\"4\" fill=\"#b8ad91\" stroke=\"#f0d6a6\" stroke-width=\"2\"/><rect x=\"97\" y=\"37\" width=\"18\" height=\"29\" rx=\"4\" fill=\"#b8ad91\" stroke=\"#f0d6a6\" stroke-width=\"2\"/><circle cx=\"54\" cy=\"51\" r=\"5\" fill=\"#d1b86f\"/><circle cx=\"106\" cy=\"51\" r=\"5\" fill=\"#d1b86f\"/><path d=\"M72 35L87 67M86 35L72 67\" stroke=\"#f2b263\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M78 23V13M61 28L55 20M95 28L103 20\" stroke=\"#f9cc7a\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></svg>"};
function render(raw){
 const s=normalize(raw),step=s.inspected.length<3?0:!evidenceReady(s)?1:2;
 const selected=material(s.selected),test=selected&&s.tests[selected.id],lit=sceneLit(s);
 const art=window.AkariArt||{};
 const details=sites.map(site=>{
  const done=s.inspected.includes(site.id);
  return '<button type="button" class="bridge-site'+(done?" found":"")+'" data-bridge-inspect="'+site.id+'"><span class="bridge-site-art" aria-hidden="true">'+inspectArtwork[site.id]+'</span><strong>'+site.name+'</strong><small>'+(done?"✓ "+site.finding:"調査する")+'</small></button>';
 }).join("");
 const source=materials.map(m=>{
  const observed=s.tests[m.id];
  return '<button type="button" class="bridge-material'+(s.selected===m.id?" selected":"")+'" data-bridge-sample="'+m.id+'" aria-pressed="'+(s.selected===m.id)+'"><span class="bridge-material-art">'+(art.material?art.material(m.id):"")+'</span><strong>'+m.name+'</strong><small>'+(observed?"実験済： "+(observed.actual==="lit"?"点灯":"消灯"):"未実験")+'</small></button>';
 }).join("");
 const tests=Object.entries(s.tests).map(([id,o])=>'<span class="bridge-record">'+material(id).name+"：予想 "+(o.guess==="lit"?"点灯":"消灯")+" → 実際 "+(o.actual==="lit"?"点灯":"消灯")+'</span>').join("");
 return '<div class="bridge-lab">'+
 '<div class="bridge-quest-strip"><strong>💡 街灯のあかりをもどそう</strong><span>回路の調査 '+s.inspected.length+'/3　｜　実験 '+Object.keys(s.tests).length+'/4　｜　回路 '+(lit?"点灯":"未復旧")+'</span></div>'+
 '<div class="bridge-circuit circuit-town-repair'+(lit?' is-lit':'')+'">'+circuit(s.slots,lit)+'</div>'+

 '<section class="lab-panel bridge-section"><h3>① 回路の 3か所を 見よう</h3><p class="lab-sub">3つの場所をタップ。まず事実を集めよう。まだ材料の正解はわからない。</p><div class="bridge-sites">'+details+'</div></section>'+
 (step>=1?'<section class="lab-panel bridge-section"><h3>② 材料を ためしてみよう</h3><p class="lab-sub">好きな材料を選んで、豆電球の実験装置に一つずつ挟もう。予想が外れても減点はないよ。</p>'+
 '<div class="bridge-materials">'+source+'</div>'+
 '<div class="bridge-test-box">'+
 (selected?'<strong>🔮 '+selected.name+'を実験装置に挟むと？</strong>'+
 (test?'<p class="lab-reading">予想：'+(test.guess==="lit"?"点灯":"消灯")+' ／ 実際：'+(test.actual==="lit"?"点灯":"消灯")+'。'+(test.guess===test.actual?"予想が合ったね。":"予想と違った！ 発見だね。")+'</p>':
 '<div class="bridge-guesses">'+[["lit","💡 点灯する"],["dark","◯ 点灯しない"]].map(([k,label])=>'<button type="button" data-bridge-guess="'+k+'" class="'+(s.sampleGuess===k?" chosen":"")+'" aria-pressed="'+(s.sampleGuess===k)+'">'+label+'</button>').join("")+'</div><button type="button" class="bridge-measure" data-bridge-test '+(!s.sampleGuess?"disabled":"")+'>🔬 仮想実験して記録する</button>')+
 '<div class="bridge-mini-circuit">'+(art.testCircuit?art.testCircuit(selected.id,!!test&&test.actual==="lit"):"")+'</div>':
 '<p>材料をタップすると実験装置にセットされるよ。</p>')+
 '</div><div class="bridge-log"><strong>📖 実験の記録</strong><div>'+ (tests||'<span class="bridge-record">まだ測定結果はないよ。</span>')+'</div></div>'+
 (step===1?'<p class="bridge-proceed">⚡ 回路修理へ進むには、電気を通す2種類・通さない1種類の実験結果を集めよう。</p>':"")+
 '</section>':"")+
 (step===2?'<section class="lab-panel bridge-section"><h3>③ 回路の 2か所を なおそう</h3><p class="lab-sub">回路にある2つのすき間を、実験済みの材料で埋めよう。どちらかが切れていても、豆電球はつかない。</p>'+
 '<div class="bridge-slot-actions">'+["a","b"].map(slot=>'<button type="button" data-bridge-place="'+slot+'" '+(!selected||!s.tests[selected.id]?"disabled":"")+'><strong>修理 '+slot.toUpperCase()+'</strong><span>'+(material(s.slots[slot])?.name||"未修理")+'</span><small>'+(!selected?"実験済み材料を選択":!s.tests[selected.id]?"選んだ材料を先に実験":"選択中の材料をはめる")+'</small></button>').join("")+'</div>'+
 '<div class="bridge-predict"><strong>🔮 修理した回路に電気を流すと？</strong><div class="bridge-guesses">'+[["lit","💡 点灯"],["dark","◯ 消灯"]].map(([id,label])=>'<button type="button" data-bridge-repair-guess="'+id+'" class="'+(s.repairGuess===id?" chosen":"")+'" aria-pressed="'+(s.repairGuess===id)+'">'+label+'</button>').join("")+'</div>'+
 '<button class="bridge-measure" type="button" data-bridge-repair-test '+(!s.slots.a||!s.slots.b||!s.repairGuess?"disabled":"")+'>🔬 修理した回路を仮想通電</button></div>'+
 (s.repairResult?'<div class="bridge-outcome '+(lit?"lit":"dark")+'" role="status">予想：'+(s.repairResult.guess==="lit"?"点灯":"消灯")+' ／ 実際：'+(lit?"点灯":"消灯")+(lit?"。街灯のあかりがともった！":"。実験結果を比べて、2つのすき間の材料を見直そう。")+'</div>':"")+
 (lit?'<div class="bridge-why"><h3>④ どうして 光った？</h3><p class="lab-sub">実際に組み立てた回路を見て、理由を選ぼう。</p>'+
 reasonOptions.map(([id,text])=>'<button type="button" data-bridge-reason="'+id+'" class="'+(s.reason===id?" chosen":"")+'" aria-pressed="'+(s.reason===id)+'">'+text+'</button>').join("")+
 '<p class="lab-sub">理由を選んだら、画面下の「街灯の復旧を確認する」でクリア。</p></div>':"")+'</section>':"")+
 '</div>';
}
window.AkariBridge={sites,materials,reasonOptions,initial,normalize,material,evaluate,signature,evidenceReady,canFinish,sceneLit,render,circuit};
})();