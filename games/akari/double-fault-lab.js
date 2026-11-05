"use strict";
(function(){
/* Mission 13: safe virtual double-fault diagnosis. Every disconnected component
 * is tested with the battery removed, except the battery's isolated voltage check.
 * Battery P to N is never connected directly through a wire. */
const parts=[
 {id:"battery",name:"乾電池",icon:"🔋",question:"電池は 使えるかな？",goodLabel:"1.5V（正常）",badLabel:"0V（電圧なし）",kind:"good"},
 {id:"wire",name:"導線のつなぎ目",icon:"〰️",question:"電池を はずして、線を しらべよう。",goodLabel:"つながっている",badLabel:"つながらない",kind:"open"},
 {id:"filament",name:"豆電球の内部",icon:"💡",question:"電池を はずして、まめ電球を しらべよう。",goodLabel:"つながっている",badLabel:"つながらない",kind:"good"},
 {id:"contact",name:"豆電球の底の接点",icon:"🔎",question:"電池を はずして、下の 金ぞくを しらべよう。",goodLabel:"つながっている",badLabel:"つながらない",kind:"open"}
];
const known=id=>parts.some(p=>p.id===id);
const guessAllowed=x=>x==="good"||x==="open";
const reasons=[
 ["loop","＋から まめ電球を 通って −まで つながった"],
 ["bulb","ガラスに 電気が さわったから"],
 ["one","2か所 こわれても、1か所だけ なおせば 光る"]
];
const intermediateReasons=[
 ["other-gap","電気の 道に、まだ すき間が ある"],
 ["weak","2回目だから 電池が 弱くなった"],
 ["one-ok","1か所 なおせば、もう 光るはず"]
];
function initial(){return {selected:null,prediction:null,probes:{},fixed:[],circuitGuess:null,firstDark:null,last:null,insight:null,reason:null};}
function signature(fixed){return [...new Set(Array.isArray(fixed)?fixed.filter(x=>x==="wire"||x==="contact"):[])].sort().join("|")||"none"}
function connected(fixed){
 const f=new Set(fixed||[]),edges=[["P","A"],["L","R"],["B","N"]];
 if(f.has("wire"))edges.push(["A","L"]);
 if(f.has("contact"))edges.push(["R","B"]);
 const g={P:[],A:[],L:[],R:[],B:[],N:[]};
 for(const [x,y] of edges){g[x].push(y);g[y].push(x)}
 let seen=new Set(["P"]),queue=["P"];
 while(queue.length){for(const v of g[queue.pop()])if(!seen.has(v)){seen.add(v);queue.push(v)}}
 return {lit:seen.has("N"),edges,reachable:[...seen]};
}
function evaluate(fixed){const result=connected(fixed);return {kind:result.lit?"lit":"dark",lit:result.lit,signature:signature(fixed),edges:result.edges,reachable:result.reachable}}
function allTested(raw){return parts.every(p=>raw?.probes?.[p.id]?.actual===p.kind)}
function normalize(raw){
 const s=initial();if(!raw||typeof raw!=="object")return s;
 if(known(raw.selected))s.selected=raw.selected;
 if(guessAllowed(raw.prediction))s.prediction=raw.prediction;
 for(const part of parts){
  const t=raw.probes?.[part.id];
  if(t&&guessAllowed(t.guess)&&t.actual===part.kind)s.probes[part.id]={guess:t.guess,actual:part.kind};
 }
 if(allTested(s)){
  const fixed=Array.isArray(raw.fixed)?raw.fixed:[];
  s.fixed=[...new Set(fixed)].filter(id=>id==="wire"||id==="contact").slice(0,2);
 }
 if(["lit","dark"].includes(raw.circuitGuess))s.circuitGuess=raw.circuitGuess;
 const first=raw.firstDark;
 if(first&&["wire","contact"].includes(first.signature)&&["lit","dark"].includes(first.guess)&&
    first.actual==="dark"&&s.fixed.includes(first.signature))
  s.firstDark={signature:first.signature,guess:first.guess,actual:"dark"};
 if(intermediateReasons.some(([id])=>id===raw.insight))s.insight=raw.insight;
 if(reasons.some(([id])=>id===raw.reason))s.reason=raw.reason;
 const measured=raw.last,actual=evaluate(s.fixed);
 if(measured&&measured.signature===actual.signature&&measured.kind===actual.kind&&
    ["lit","dark"].includes(measured.guess)&&measured.guess===s.circuitGuess)
   s.last={signature:actual.signature,kind:actual.kind,guess:s.circuitGuess};
 return s;
}
function secondUnlocked(raw){
 const s=normalize(raw);
 return s.fixed.length===1&&s.firstDark?.signature===signature(s.fixed)&&s.insight==="other-gap";
}
function canFinish(raw){
 const s=normalize(raw),e=evaluate(s.fixed);
 return allTested(s)&&s.fixed.length===2&&
  Boolean(s.firstDark)&&s.insight==="other-gap"&&e.lit&&
  s.last?.signature===e.signature&&s.last.kind==="lit"&&s.last.guess==="lit"&&
  s.reason==="loop";
}
function circuitSvg(raw){
 const s=normalize(raw),measured=s.last?.signature===signature(s.fixed)?s.last:null,lit=measured?.kind==="lit";
 const wire=s.fixed.includes("wire"),contact=s.fixed.includes("contact");
 const color=lit?"#ffe29e":"#a6d0da";
 const gap=(x,y,fixed,label)=>'<rect x="'+(x-47)+'" y="'+(y-22)+'" width="94" height="44" rx="10" fill="'+(fixed?"#d7eedc":"#344f68")+'" stroke="'+(fixed?"#79b69a":"#efa789")+'" stroke-width="3"/><text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" font-size="13" fill="'+(fixed?"#285b45":"#ffe4c9")+'" font-weight="800">'+(fixed?"修理済":"すき間")+'</text><text x="'+x+'" y="'+(y-34)+'" text-anchor="middle" font-size="13" fill="#e3f5ee">'+label+'</text>';
 const line=(path,on)=>'<path d="'+path+'" fill="none" stroke="'+(on?color:"#718994")+'" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"'+(on?'':' stroke-dasharray="8 7"')+'/>';
 return '<svg class="dual-circuit-svg" viewBox="0 0 670 350" role="img" aria-label="乾電池のプラス極から導線のすき間、豆電球の横と底、戻り道の接点のすき間を通ってマイナス極に戻る回路図">'+
 '<rect x="0" y="0" width="670" height="350" rx="20" fill="#102f44"/>'+
 '<rect x="28" y="112" width="110" height="131" rx="14" fill="#be7562" stroke="#ffe0b9" stroke-width="4"/>'+
 '<text x="84" y="153" text-anchor="middle" fill="#fffaf5" font-size="18" font-weight="800">乾電池</text>'+
 '<text x="84" y="184" text-anchor="middle" fill="#fffaf5" font-size="17">1.5V</text>'+
 '<circle cx="84" cy="90" r="12" fill="#fff1b9"/><circle cx="84" cy="270" r="12" fill="#fff1b9"/>'+
 '<text x="109" y="85" fill="#f5eed7" font-size="15">＋</text><text x="109" y="291" fill="#f5eed7" font-size="15">−</text>'+
 line("M84 90H244",true)+line("M338 90H524V118",true)+
 gap(291,90,wire,"① 導線の接続")+
 '<circle cx="524" cy="175" r="57" fill="'+(lit?"#ffe6a2":"#315870")+'" stroke="#e5ecde" stroke-width="6"/>'+
 '<path d="M503 153L546 197M546 153L503 197" stroke="'+(lit?"#a16d3e":"#b9d6dc")+'" stroke-width="6"/>'+
 '<circle cx="524" cy="118" r="7" fill="#fff0c9"/><circle cx="524" cy="232" r="7" fill="#fff0c9"/>'+
 '<text x="595" y="175" fill="#effbec" font-size="13">豆電球</text>'+
 line("M524 232V270H338",true)+line("M244 270H84",true)+
 gap(291,270,contact,"② 底の接点")+
 '<text x="340" y="324" fill="#d5ecf5" text-anchor="middle" font-size="13">'+(lit?"安全に点灯：電気の輪が完成":measured?"消灯：回路のどこかにすき間が残る":"回路の状態を観察・修理して、通電を予想しよう")+'</text>'+
 '</svg>';
}
function render(raw){
 const s=normalize(raw),ready=allTested(s),first=s.fixed.length===1,second=s.fixed.length===2,e=evaluate(s.fixed);
 const selection=parts.find(p=>p.id===s.selected),trial=selection?s.probes[selection.id]:null;
 const options=(ids,attribute,picked)=>'<div class="dual-choices">'+ids.map(([id,label])=>'<button type="button" '+attribute+'="'+id+'" class="'+(picked===id?" chosen":"")+'" aria-pressed="'+(picked===id)+'">'+label+'</button>').join("")+'</div>';
 let repair="";
 if(ready){
  repair='<section class="lab-panel dual-section"><h3>② こわれた 所を なおそう</h3>'+
  '<p class="lab-sub">'+(first&&!s.firstDark?"1か所直したよ。本当に点灯したかを再実験しよう。":first&&s.firstDark&&s.insight!=="other-gap"?"まだ暗い理由を説明してから、次の修理に進もう。":second?"2か所を修理できた。最後の通電結果を確かめよう。":"4つの実験記録を参考に、原因だと思う場所を1か所修理しよう。")+'</p>'+
  '<div class="dual-diagram">'+circuitSvg(s)+'</div><div class="dual-nav"><button type="button" data-dual-view="left">◀ 乾電池側</button><button type="button" data-dual-view="right">豆電球側 ▶</button></div>'+
  '<div class="dual-repairs">'+parts.map(p=>{
   const fixed=s.fixed.includes(p.id),can=!fixed&&s.fixed.length<2&&(!first||secondUnlocked(s));
   return '<button type="button" data-dual-fix="'+p.id+'" '+(!can?"disabled":"")+' class="'+(fixed?" fixed":"")+'"><strong>'+p.icon+' '+p.name+'</strong><small>'+(fixed?"✓ 修理済み":s.probes[p.id]?.actual==="good"?"検査では正常":s.probes[p.id]?.actual==="open"?"検査ではつながらない":"まだ調査していない")+'</small></button>';
  }).join("")+'</div>'+
  (s.fixed.length>0?'<div class="dual-predict"><strong>⚡ この状態の灯台の光は？</strong>'+
   options([["dark","◯ 消灯"],["lit","💡 点灯"]],"data-dual-circuit-guess",s.circuitGuess)+
   '<button type="button" class="dual-measure" data-dual-circuit-test '+(!s.circuitGuess?"disabled":"")+'>🔬 光るか ためす</button></div>':"")+
  (s.last?'<div class="dual-result '+s.last.kind+'" role="status">予想：'+(s.last.guess==="lit"?"点灯":"消灯")+' ／ 実際：'+(s.last.kind==="lit"?"点灯":"消灯")+(s.last.kind==="dark"?"。1か所直しても、まだ通り道がつながっていない。":"。豆電球が点灯した！")+'</div>':"")+
  (first&&s.firstDark?'<div class="dual-reasoning"><h3>③ まだ 消えている。なぜ？</h3>'+options(intermediateReasons,"data-dual-insight",s.insight)+'</div>':"")+
  (second&&s.last?.kind==="lit"?'<div class="dual-reasoning"><h3>④ どうして 光った？</h3>'+options(reasons,"data-dual-reason",s.reason)+'<p class="lab-sub">理由を選んだら、画面下の最終確認を押そう。</p></div>':"")+
  '</section>';
 }
 return '<div class="dual-lab">'+
 '<div class="dual-heading"><span class="eyebrow">🔎 ミッション 13 / 14</span><strong>星あかり灯台・二重故障調査</strong><small>検査 '+Object.keys(s.probes).length+'/4　｜　修理 '+s.fixed.length+'/2</small></div>'+
 '<div class="dual-warning">これは安全な仮想検査です。導線や接点を調べるときは乾電池を取り外した設定で行います。実物の乾電池をショートさせないでください。</div>'+
 '<section class="lab-panel dual-section"><h3>① 4か所を しらべよう</h3><p class="lab-sub">回路全体が消灯していても、すべての部品が故障しているとは限らない。電池・導線・豆電球内部・接点を順番に調べよう。</p>'+
 '<div class="dual-parts">'+parts.map(p=>'<button type="button" class="dual-part'+(s.selected===p.id?" chosen":"")+'" data-dual-part="'+p.id+'" aria-pressed="'+(s.selected===p.id)+'"><strong>'+p.icon+' '+p.name+'</strong><small>'+(s.probes[p.id]?"実験済み":"未確認")+'</small></button>').join("")+'</div>'+
 (selection?'<div class="dual-testbench"><strong>🔮 '+selection.question+'</strong>'+
 (trial?'<div class="dual-result" role="status">予想：'+(trial.guess==="good"?selection.goodLabel:selection.badLabel)+' ／ 実際：'+(trial.actual==="good"?selection.goodLabel:selection.badLabel)+(trial.guess===trial.actual?"。予想どおり！":"。予想と違った。結果を記録したよ。")+'</div>':
 options([["good",selection.goodLabel],["open",selection.badLabel]],"data-dual-predict",s.prediction)+
 '<button class="dual-measure" data-dual-test type="button" '+(!s.prediction?"disabled":"")+'>🔬 しらべてみる</button>')+'</div>':"")+
 '<details class="dual-notes"><summary>📖 4回の けっかを 見る</summary>'+parts.map(p=>'<div class="dual-note"><strong>'+p.name+'</strong><span>'+(s.probes[p.id]?(s.probes[p.id].actual==="good"?p.goodLabel:p.badLabel):"？ 未確認")+'</span></div>').join("")+'</details></section>'+repair+'</div>';
}
window.AkariDoubleFault={parts,initial,normalize,connected,evaluate,signature,allTested,secondUnlocked,canFinish,render,circuitSvg};
})();
