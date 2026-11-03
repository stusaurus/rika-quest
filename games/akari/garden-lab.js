"use strict";
(function GardenWorkshop(){
/* Grade 3 idealized low-voltage virtual model.
 * A test is valid only when the specimen is clamped at BOTH metal contacts.
 * A separate protective panel spans two exposed rails: conductive sheet => dangerous P-N short.
 * No experiment in this simulation should be reproduced with real shorted batteries. */
const specimens=[
 {id:"clip",name:"鉄のクリップ",secret:"小さな留め具",conductive:true},
 {id:"foil",name:"アルミはく",secret:"銀色の薄いシート",conductive:true},
 {id:"wood",name:"乾いた木片",secret:"木製の板",conductive:false},
 {id:"plastic",name:"銀色のプラスチック定規",secret:"銀色の定規",conductive:false}
];
const material=id=>specimens.find(s=>s.id===id)||null;
const modes=[["tight","両方の金属接点ではさむ"],["loose","片方の接点を浮かせる"]];
const reasons4=[
 ["control","同じ金属でも接点が離れると回路が切れて、点灯しない"],
 ["identity","鉄のクリップを使えば、どんな接点の状態でも必ず光る"],
 ["battery","豆電球が消えたのは、乾電池の色が変わったから"]
];
const conclusions4=[
 ["material","条件をそろえると、金属は通しやすく、乾いた木やプラスチックは通しにくい"],
 ["shiny","銀色で光るものは、材質にかかわらず必ず通す"],
 ["dark","一度消灯した材料は、いつも電気を通さないと決めてよい"]
];
const paths5=[
 ["loop","乾電池の＋から豆電球を通って−に戻るところに、電気を通す部品が必要"],
 ["glass","豆電球のガラス部分に金属を置くだけで光る"],
 ["wood","電気が通る道を木やプラスチックで切ると明るくなる"]
];
const covers5=[
 ["insulate","露出した＋と−の端子を隔てる場所は、電気を通しにくい材料で分ける"],
 ["metal","端子を隔てるところに金属を入れたほうが、いつも安全"],
 ["color","銀色なら通すかどうかに関係なく、安全と判断できる"]
];
const outcomeLabel={lit:"💡 点灯",dark:"◯ 消灯",short:"⚠ ショートの危険"};
const initial=(stage)=>stage===4?
 {clamp:"loose",guess:null,calibrations:{},calibrationReason:null,selected:null,trials:{},finalReason:null}:
 {selected:null,guess:null,tests:{},slots:{link:null,guardA:null,guardB:null},prediction:null,measurement:null,pathReason:null,guardReason:null};
function experiment(id,clamp){
 const sample=material(id);
 if(!sample||!["tight","loose"].includes(clamp))return null;
 return {lit:clamp==="tight"&&sample.conductive,kind:clamp==="tight"&&sample.conductive?"lit":"dark"};
}
const validGuess=g=>g==="lit"||g==="dark";
const validateTrial=(id,clamp,trial)=>{
 const actual=experiment(id,clamp);
 return actual&&trial&&validGuess(trial.guess)&&trial.actual===actual.kind?
 {guess:trial.guess,actual:trial.actual}:null;
};
const reasonValid=(arr,val)=>arr.some(([id])=>val===id);
function normalize(stage,raw){
 const s=initial(stage);
 if(!raw||typeof raw!=="object")return s;
 if(stage===4){
  s.clamp=modes.some(([k])=>k===raw.clamp)?raw.clamp:"loose";
  s.guess=validGuess(raw.guess)?raw.guess:null;
  for(const mode of ["loose","tight"]){
   const trial=validateTrial("clip",mode,raw.calibrations?.[mode]);
   if(trial)s.calibrations[mode]=trial;
  }
  s.calibrationReason=reasonValid(reasons4,raw.calibrationReason)?raw.calibrationReason:null;
  s.selected=material(raw.selected)?raw.selected:null;
  for(const item of specimens){
   const trial=validateTrial(item.id,"tight",raw.trials?.[item.id]?.tight);
   const loose=validateTrial(item.id,"loose",raw.trials?.[item.id]?.loose);
   if(trial||loose)s.trials[item.id]={...(trial?{tight:trial}:{}),...(loose?{loose}:{} )};
  }
  s.finalReason=reasonValid(conclusions4,raw.finalReason)?raw.finalReason:null;
  return s;
 }
 s.selected=material(raw.selected)?raw.selected:null;
 s.guess=validGuess(raw.guess)?raw.guess:null;
 for(const item of specimens){const t=validateTrial(item.id,"tight",raw.tests?.[item.id]);if(t)s.tests[item.id]=t}
 for(const key of ["link","guardA","guardB"]){
  if(material(raw.slots?.[key])&&s.tests[raw.slots[key]])s.slots[key]=raw.slots[key];
 }
 // One specimen cannot be installed in more than one physical position.
 const assigned=new Set();
 for(const key of ["link","guardA","guardB"]){
  if(s.slots[key]&&assigned.has(s.slots[key]))s.slots[key]=null;
  if(s.slots[key])assigned.add(s.slots[key]);
 }
 s.prediction=["lit","dark","short"].includes(raw.prediction)?raw.prediction:null;
 const actual=evaluate5(s.slots);
 if(raw.measurement?.signature===signature5(s.slots)&&raw.measurement?.actual===actual.kind&&
   raw.measurement?.prediction===s.prediction){
  s.measurement={signature:signature5(s.slots),actual:actual.kind,prediction:s.prediction};
 }
 s.pathReason=reasonValid(paths5,raw.pathReason)?raw.pathReason:null;
 s.guardReason=reasonValid(covers5,raw.guardReason)?raw.guardReason:null;
 return s;
}
function calibrated(raw){
 const s=normalize(4,raw);
 return Boolean(s.calibrations.loose&&s.calibrations.tight&&s.calibrationReason==="control");
}
function evidence4(raw){
 const s=normalize(4,raw);
 const done=specimens.filter(x=>s.trials[x.id]?.tight);
 return {done:done.length,metals:done.filter(x=>x.conductive).length,nonmetals:done.filter(x=>!x.conductive).length};
}
function canFinish4(raw){
 const s=normalize(4,raw),e=evidence4(s);
 return calibrated(s)&&e.metals>=2&&e.nonmetals>=1&&s.finalReason==="material";
}
function evidence5(raw){
 const s=normalize(5,raw),items=specimens.filter(x=>s.tests[x.id]);
 return {done:items.length,conductors:items.filter(x=>x.conductive).length,nonconductors:items.filter(x=>!x.conductive).length};
}
function evaluate5(slots={}){
 const link=material(slots.link),g1=material(slots.guardA),g2=material(slots.guardB);
 const short=Boolean(g1?.conductive||g2?.conductive);
 const lit=Boolean(link?.conductive&&!short);
 return {short,lit,kind:short?"short":lit?"lit":"dark"};
}
function signature5(slots){return ["link","guardA","guardB"].map(k=>material(slots[k])?slots[k]:"-").join("|")}
function measured5(raw){
 const s=normalize(5,raw);return s.measurement?.signature===signature5(s.slots)&&
 s.measurement.actual===evaluate5(s.slots).kind;
}
function canFinish5(raw){
 const s=normalize(5,raw),e=evidence5(s);
 return e.conductors>=1&&e.nonconductors>=2&&
 ["link","guardA","guardB"].every(k=>s.slots[k])&&
 new Set(Object.values(s.slots)).size===3&&
 measured5(s)&&evaluate5(s.slots).lit&&
 s.pathReason==="loop"&&s.guardReason==="insulate";
}
function canFinish(stage,raw){return stage===4?canFinish4(raw):canFinish5(raw)}
function iconMaterial(id){const a=window.AkariArt;return a?.material?a.material(id):""}
function notes(raw,stage){
 const s=normalize(stage,raw),list=stage===4?s.trials:s.tests;
 return Object.entries(list).flatMap(([id,t])=>{
  const trials=stage===4?Object.entries(t):[["tight",t]];
  return trials.map(([contact,o])=>'<div class="garden-record"><strong>'+material(id).name+'</strong><span>'+(stage===4?(contact==="tight"?"接点を合わせた":"片方を浮かせた"):"接点を合わせた")+'</span><span>予想：'+outcomeLabel[o.guess]+'　→　実験：'+outcomeLabel[o.actual]+'</span></div>');
 }).join("")||'<div class="garden-record empty">まだ観察記録がないよ。</div>';
}
function testDiagram(id,clamp,measured=false,labelOverride=null){
 const result=measured?experiment(id,clamp):null,lit=Boolean(result?.lit);
 const ink=lit?"#ffe9a2":"#a4c9d5",open=clamp==="loose";
 return '<svg class="garden-circuit-svg" role="img" aria-label="電池の＋極、調査材料と2つの金属接点、豆電球の横・底、電池の−極を順番につなぐ仮想回路。片方の接点が浮くとすき間ができる。" viewBox="0 0 610 290">'+
 '<rect width="610" height="290" rx="18" fill="#112f45"/>'+
 '<rect x="25" y="93" width="100" height="118" rx="12" fill="#b96856" stroke="#ffe4b6" stroke-width="4"/>'+
 '<text x="75" y="128" text-anchor="middle" fill="white" font-size="17">乾電池</text><text x="75" y="158" text-anchor="middle" fill="white" font-size="16">1.5V</text>'+
 '<text x="44" y="88" fill="#f8e8bd" font-size="17">＋</text><text x="44" y="237" fill="#f8e8bd" font-size="17">−</text>'+
 '<path d="M75 93V43H185V90H204" stroke="'+ink+'" stroke-width="7" fill="none" stroke-linejoin="round"/>'+
 '<path d="'+(open?"M204 90L219 73":"M204 90H238")+'" stroke="'+(open?"#ffb78d":ink)+'" stroke-width="7" fill="none" stroke-linecap="round"/>'+
 '<rect x="238" y="60" width="128" height="62" rx="11" fill="#365b6d" stroke="#c4d9d4" stroke-width="3"/>'+
 '<circle cx="238" cy="90" r="8" fill="#ffddb1"/><circle cx="366" cy="90" r="8" fill="#ffddb1"/>'+
 '<text x="302" y="85" text-anchor="middle" fill="#f3ffff" font-weight="800" font-size="13">'+(labelOverride||material(id)?.name||"試料")+'</text>'+
 '<text x="302" y="105" text-anchor="middle" fill="#c5e4e9" font-size="11">金属接点ではさむ</text>'+
 (open?'<path d="M218 75L229 69" stroke="#ffbb91" stroke-width="4"/><text x="210" y="135" fill="#ffe0b7" font-size="13">すき間</text>':"")+
 '<path d="M366 90H495V100M495 205V252H75V211" stroke="'+ink+'" stroke-width="7" fill="none" stroke-linejoin="round"/>'+
 '<circle cx="495" cy="152" r="51" fill="'+(lit?"#ffe4a2":"#294e66")+'" stroke="#e5ebd2" stroke-width="5"/>'+
 '<path d="M474 132L516 172M516 132L474 172" stroke="'+(lit?"#ae7e3f":"#b4d5db")+'" stroke-width="6"/>'+
 '<circle cx="495" cy="101" r="8" fill="#f9e8c0"/><circle cx="495" cy="204" r="8" fill="#f9e8c0"/>'+
 '<text x="560" y="151" text-anchor="middle" fill="#fff4de" font-size="14">豆電球</text>'+
 '<text x="495" y="273" text-anchor="middle" fill="#d2edf3" font-size="13">横・底の接点</text>'+
 '<text x="184" y="278" fill="#d4edf2" font-size="13">試料の接点：'+(open?"片方が浮いている":"両方が接触")+'</text>'+
 '</svg>';
}
function display4(raw){
 const s=normalize(4,raw),ready=calibrated(s),proof=evidence4(s),sample=material(s.selected);
 const current= s.selected&&s.trials[s.selected]?.[s.clamp];
 const trial=s.calibrations[s.clamp];
 const other=["loose","tight"].find(k=>!s.calibrations[k]);
 const modeButton=(k,label)=>'<button type="button" class="garden-contact'+(s.clamp===k?" chosen":"")+'" data-garden-clamp="'+k+'" aria-pressed="'+(s.clamp===k)+'">'+label+'</button>';
 const guess=(prefix,disabled)=>'<div class="garden-predictions">'+[["lit","💡 点灯"],["dark","◯ 消灯"]].map(([id,label])=>'<button type="button" data-garden-guess="'+id+'" class="'+(s.guess===id?" chosen":"")+'" aria-pressed="'+(s.guess===id)+'" '+(disabled?"disabled":"")+'>'+label+'</button>').join("")+'</div>';
 const trialResult=measured=>measured?'<div class="garden-measured" role="status">予想 '+outcomeLabel[measured.guess]+' → 実際 '+outcomeLabel[measured.actual]+'。'+(measured.guess===measured.actual?"予想どおり！":"予想が違っても、大切な発見だよ。")+'</div>':"";
 return '<div class="garden-lab"><div class="garden-heading"><span class="eyebrow">🌿 調査 4 / 14</span><strong>実験工房・原因を見つけよう</strong><small>基準実験 '+Object.keys(s.calibrations).length+'/2　｜　材料比較 '+proof.done+'/4</small></div>'+
 '<section class="lab-panel garden-section"><h3>① 接点の違いで結果は変わる？</h3><p class="lab-sub">同じ鉄のクリップで、接点のしめ方だけを変えよう。消灯したとき、すぐに「電気を通さない」と決めてもよいかな？</p>'+
 '<div class="garden-contacts">'+modeButton("loose","片方の接点が浮いている")+modeButton("tight","両方しっかりつける")+'</div>'+
 '<div class="garden-rig">'+testDiagram("clip",s.clamp,!!trial)+'</div>'+
 (trialResult(trial))+
 '<div class="garden-question"><strong>この状態では、豆電球はどうなる？</strong>'+guess("cal",!!trial)+'<button type="button" class="garden-try" data-garden-calibrate '+(!s.guess||trial?"disabled":"")+'>🔬 条件を変えて実験する</button></div>'+
 (Object.keys(s.calibrations).length===2?'<div class="garden-explain"><strong>2回の結果を比べて、どう説明する？</strong>'+
 reasons4.map(([id,label])=>'<button type="button" class="'+(s.calibrationReason===id?" chosen":"")+'" data-garden-control-reason="'+id+'">'+label+'</button>').join("")+'</div>':
 '<p class="lab-sub">両方の接点条件を調べよう。あと '+(2-Object.keys(s.calibrations).length)+' 回。</p>')+'</section>'+
 (ready?'<section class="lab-panel garden-section"><h3>② 条件をそろえて材料を比べよう</h3><p class="lab-sub">実験条件は自由に変更できる。ただし、材料の違いを比較するときは両方の金属接点をしっかりつなごう。</p>'+
 '<div class="garden-samples">'+specimens.map(m=>'<button type="button" class="garden-sample'+(s.selected===m.id?" chosen":"")+'" data-garden-sample="'+m.id+'" aria-pressed="'+(s.selected===m.id)+'"><span>'+iconMaterial(m.id)+'</span><strong>'+m.name+'</strong><small>'+(s.trials[m.id]?.tight?"比較済み":"調査中")+'</small></button>').join("")+'</div>'+
 (sample?'<div class="garden-rig">'+testDiagram(sample.id,s.clamp,!!current)+'</div>'+
 '<p class="lab-sub">選択中：'+sample.name+' ／ '+(s.clamp==="tight"?"両接点に接触":"片方の接点が浮いている")+'</p>'+
 trialResult(current)+
 '<div class="garden-question"><strong>通電結果を予想しよう</strong>'+guess("sample",!!current)+
 '<button type="button" class="garden-try" data-garden-test '+(!s.guess||current?"disabled":"")+'>🔬 材料を仮想通電</button></div>':
 '<p class="lab-sub">まず試してみたい材料を選ぼう。</p>')+
 '<div class="garden-journal"><strong>📖 実験の証拠</strong>'+notes(s,4)+'</div>'+
 '<p class="garden-goal">比較の条件：金属2種類と金属でないもの1種類を、接点をそろえて測ろう。今：'+proof.metals+' / 2 金属、'+proof.nonmetals+' / 1 その他</p>'+
 ((proof.metals>=2&&proof.nonmetals>=1)?
 '<div class="garden-explain"><strong>③ 実験から導いた結論は？</strong>'+conclusions4.map(([id,label])=>'<button type="button" class="'+(s.finalReason===id?" chosen":"")+'" data-garden-material-reason="'+id+'">'+label+'</button>').join("")+
 '<p class="lab-sub">答えを決めて、画面下の「研究結果を確かめる」で提出しよう。</p></div>':"")+
 '</section>':"")+'</div>';
}
function schematic5(raw){
 const s=normalize(5,raw),status=s.measurement?evaluate5(s.slots):null,lit=status?.lit,short=status?.short;
 const bright=lit?"#ffedab":"#9cbac8";
 const slot=(x,y,id)=>'<rect x="'+(x-60)+'" y="'+(y-22)+'" width="120" height="44" rx="9" fill="'+(id?"#d5ecdc":"#304f65")+'" stroke="#a3c7c6" stroke-width="3"/><text x="'+x+'" y="'+(y+5)+'" font-size="14" text-anchor="middle" fill="'+(id?"#244e43":"#f9dfd4")+'" font-weight="800">'+(id?material(id).name:"未設置")+'</text>';
 const base='<rect width="720" height="365" rx="18" fill="#11324a"/>'+
 '<rect x="28" y="122" width="103" height="130" rx="12" fill="#ba6e54" stroke="#ffdfa6" stroke-width="4"/>'+
 '<text x="80" y="160" font-size="17" text-anchor="middle" fill="#fff">乾電池</text><text x="80" y="189" font-size="18" text-anchor="middle" fill="#fff">1.5V</text>'+
 '<text x="43" y="112" font-size="17" fill="#fff">＋</text><text x="43" y="282" font-size="17" fill="#fff">−</text>'+
 '<path d="M80 122V68H200M320 68H590V125M590 239V308H80V252" stroke="'+bright+'" fill="none" stroke-width="7" stroke-linejoin="round"/>'+
 '<circle cx="590" cy="182" r="52" fill="'+(lit?"#ffe7a2":"#214963")+'" stroke="#e8ebdf" stroke-width="5"/>'+
 '<path d="M572 164L609 202M609 164L572 202" stroke="'+(lit?"#9b6832":"#bcd5de")+'" stroke-width="6"/>'+
 '<text x="590" y="264" font-size="15" text-anchor="middle" fill="#ecf4e7">豆電球</text>'+
 slot(260,68,s.slots.link)+
 '<text x="260" y="29" text-anchor="middle" fill="#e5f8ed" font-size="16">導線のすき間</text>'+
 '<path d="M80 122H145V140H480M80 252H145V310H480" stroke="'+(short?"#f1a493":"#92becb")+'" stroke-width="5"/>'+
 '<text x="169" y="124" fill="#f3e3ba" font-size="13">＋の露出端子</text>'+
 '<text x="169" y="345" fill="#f3e3ba" font-size="13">−の露出端子</text>'+
 '<path d="M210 140V173M210 236V310M430 140V173M430 236V310" stroke="'+(short?"#eea38f":"#8fbbcb")+'" stroke-width="6" fill="none"/>'+
 slot(210,205,s.slots.guardA)+slot(430,205,s.slots.guardB)+
 '<text x="210" y="258" text-anchor="middle" fill="#e3f1e8" font-size="13">仕切り A</text>'+
 '<text x="430" y="258" text-anchor="middle" fill="#e3f1e8" font-size="13">仕切り B</text>'+
 (short?'<text x="354" y="355" text-anchor="middle" fill="#ffbe9e" font-size="15" font-weight="800">⚠ 2本の電極を金属が結ぶ危険な近道</text>':"");
 return '<svg class="garden-design-svg" viewBox="0 0 720 365" role="img" aria-label="電池と豆電球を通る主回路、2本の露出した電極の間に置く仕切りA・Bを示す仮想設計図。">'+base+'</svg>';
}
function display5(raw){
 const s=normalize(5,raw),e=evidence5(s),selected=material(s.selected),ready=e.conductors>=1&&e.nonconductors>=2,
 result=s.measurement?evaluate5(s.slots):null;
 const samples='<div class="garden-samples">'+specimens.map(m=>'<button class="garden-sample'+(s.selected===m.id?" chosen":"")+'" type="button" data-garden-sample="'+m.id+'" aria-pressed="'+(s.selected===m.id)+'"><span>'+iconMaterial(m.id)+'</span><strong>'+m.secret+'</strong><small>'+(s.tests[m.id]?"実験済・材質："+m.name:"正体はまだわからない")+'</small></button>').join("")+'</div>';
 const test=selected&&s.tests[selected.id];
 const itemGuesses='<div class="garden-predictions">'+[["lit","💡 点灯"],["dark","◯ 消灯"]].map(([id,label])=>'<button type="button" data-garden-guess="'+id+'" class="'+(s.guess===id?" chosen":"")+'" aria-pressed="'+(s.guess===id)+'" '+(test?"disabled":"")+'>'+label+'</button>').join("")+'</div>';
 const role=(key,label,detail)=>'<button type="button" class="garden-slot" data-garden-slot="'+key+'" '+(!selected||!s.tests[selected.id]?"disabled":"")+'><strong>'+label+'</strong><span>'+(material(s.slots[key])?.name||"まだ決まっていない")+'</span><small>'+detail+'</small></button>';
 return '<div class="garden-lab"><div class="garden-heading"><span class="eyebrow">🕵️ 調査 5 / 14</span><strong>にせものの金属・夜の庭の修理</strong><small>材質の実験 '+e.done+'/4　｜　設置 '+Object.values(s.slots).filter(Boolean).length+'/3</small></div>'+
 '<div class="garden-hazard">⚠ ここに出るショートは画面内だけの仮想実験。実物では絶対に試さないでね。乾いた木の性質を扱う模型なので、実際の屋外配線には専用の安全な絶縁部品を使うよ。</div>'+
 '<section class="lab-panel garden-section"><h3>① 見た目ではなく、実験で正体を見つける</h3><p class="lab-sub">同じように光って見える試料もあるよ。先に予想を立てて、電気を通すか確かめてから、使い道を決めよう。</p>'+
 samples+
 (selected?'<div class="garden-rig">'+testDiagram(selected.id,"tight",!!test,test?selected.name:selected.secret)+'</div><strong class="garden-current">調査中：'+selected.secret+'</strong>'+
 (test?'<div class="garden-measured" role="status">予想：'+outcomeLabel[test.guess]+' ／ 実際：'+outcomeLabel[test.actual]+'。材質：'+selected.name+'</div>':
 '<div class="garden-question"><strong>この試料は電気を通す？</strong>'+itemGuesses+'<button type="button" class="garden-try" data-garden-test '+(!s.guess?"disabled":"")+'>🔬 仮想実験で確認する</button></div>'):'<p class="lab-sub">上の試料から1つ選ぼう。</p>')+
 '<div class="garden-journal"><strong>📖 材料の実験記録</strong>'+notes(s,5)+'</div>'+
 '<p class="garden-goal">修理に必要な実験：導体1種類以上、絶縁に使える不導体2種類。記録：'+e.conductors+' / 1 導体、'+e.nonconductors+' / 2 不導体</p></section>'+
 (ready?'<section class="lab-panel garden-section"><h3>② 明かりの配線と、危険を防ぐ仕切りを設計</h3><p class="lab-sub">上で選択した実験済みの試料を下の3か所へ置こう。主回路には導体、電池の＋と−の露出端子を隔てる2か所には何を置く？</p>'+
 '<div class="garden-schematic">'+schematic5(s)+'</div><div class="garden-nav"><button type="button" data-garden-view="left">◀ 乾電池側</button><button type="button" data-garden-view="right">豆電球側 ▶</button></div>'+
 '<div class="garden-slots">'+role("link","回路のつなぎ目","豆電球へ電気を通す道")+role("guardA","仕切り A","＋・−の露出した端子の間")+role("guardB","仕切り B","＋・−の露出した端子の間")+'</div>'+
 '<div class="garden-question"><strong>この設計を仮想通電したらどうなる？</strong>'+
 '<div class="garden-predictions">'+[["lit","💡 点灯"],["dark","◯ 消灯"],["short","⚠ ショート"]].map(([id,label])=>'<button type="button" data-garden-design-guess="'+id+'" class="'+(s.prediction===id?" chosen":"")+'" aria-pressed="'+(s.prediction===id)+'">'+label+'</button>').join("")+'</div>'+
 '<button type="button" class="garden-try" data-garden-design-test '+(!Object.values(s.slots).every(Boolean)||!s.prediction?"disabled":"")+'>🔬 設計した設備を仮想実験</button></div>'+
 (s.measurement?'<div class="garden-measured '+(result?.short?"danger":"")+'" role="status">予想：'+outcomeLabel[s.measurement.prediction]+' ／ 実際：'+outcomeLabel[s.measurement.actual]+(result?.short?"。電池の＋と−が電球を通らずつながる危険な近道がある！":result?.lit?"。安全な配線で庭にあかりが戻った！":"。電気の輪が途中で切れている。")+'</div>':"")+
 (result?.lit?'<div class="garden-explain"><h3>③ なぜ安全に明かりをつけられた？</h3><strong>電気を通す修理部品の役割</strong>'+paths5.map(([id,label])=>'<button type="button" class="'+(s.pathReason===id?" chosen":"")+'" data-garden-path-reason="'+id+'">'+label+'</button>').join("")+
 '<strong>電気を通しにくい仕切りの役割</strong>'+covers5.map(([id,label])=>'<button type="button" class="'+(s.guardReason===id?" chosen":"")+'" data-garden-cover-reason="'+id+'">'+label+'</button>').join("")+
 '<p class="lab-sub">両方答えて、画面下の「安全な修理を確認する」を押そう。</p></div>':"")+
 '</section>':"")+'</div>';
}
function render(stage,raw){return stage===4?display4(raw):display5(raw)}
window.AkariGarden={specimens,material,modes,reasons4,conclusions4,paths5,covers5,initial,normalize,
 experiment,calibrated,evidence4,evidence5,evaluate5,signature5,measured5,canFinish4,canFinish5,canFinish,render,testDiagram,schematic5};
})();
