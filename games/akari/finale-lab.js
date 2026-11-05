"use strict";
(function(){
/* Chapter finale: evaluate the three faults independently, then predict the assembled circuit.
 * This is a safe low-voltage simulation, not instructions for shorting cells or overdriving lamps.
 * Two equal 1.5V cells are paired with a 3V rated ordinary filament bulb. */
const stations=[
 {id:"battery",title:"乾電池2個の向き",icon:"🔋",question:"電池2この 向きを かえたら 光る？",
  options:[{id:"opposed",name:"2個を互いに逆向き",detail:"電池2この 力が うちけし合う"},{id:"aligned",name:"2個を同じ向き",detail:"電池2この 力が たされる"}]},
 {id:"material",title:"回路のすき間の材料",icon:"🔩",question:"この 材料を はさむと 光る？",
  options:[{id:"plastic",name:"銀色のプラスチック片",detail:"ピカピカでも 電気は 通りにくい"},{id:"clip",name:"鉄のクリップ",detail:"金属なので電気を通す"}]},
 {id:"contact",title:"豆電球の2つの接点",icon:"💡",question:"まめ電球の どこに 線を つなぐ？",
  options:[{id:"glass",name:"ガラスと底の金属",detail:"ガラスは 電気が 通りにくい"},{id:"both",name:"横の金属と底の金属",detail:"横と 下の 金ぞくを つなぐ"}]}
];
const correct={battery:"aligned",material:"clip",contact:"both"};
const reasons=[
 ["loop","＋から まめ電球を 通って −まで ひと回りできた"],
 ["color","銀色の ものなら ぜんぶ 電気が 通る"],
 ["glass","ガラスに 電池を つければ 光る"]
];
const names={bright:"💡 点灯",dark:"◯ 消灯"};
const group=id=>stations.find(s=>s.id===id);
const option=(station,id)=>group(station)?.options.find(x=>x.id===id)||null;
const optionLabel=(station,id)=>option(station,id)?.name||null;
const initial=()=>({
 active:"battery",selected:{battery:"opposed",material:"plastic",contact:"glass"},
 guess:null,tests:{},installed:{battery:null,material:null,contact:null},
 overallGuess:null,overall:null,reason:null
});
function trialResult(station,value){
 return option(station,value)?(correct[station]===value?"bright":"dark"):null;
}
function signature(installed){return stations.map(s=>option(s.id,installed?.[s.id])?installed[s.id]:"-").join("|")}
function evaluate(installed){
 const wires=[["P","A"],["L","R"],["B","N"]];
 if(installed?.battery==="aligned")wires.push(["P","A2"]);
 if(installed?.material==="clip")wires.push(["A2","L"]);
 if(installed?.contact==="both")wires.push(["R","B"]);
 // Link the first battery contact only when the source actually generates voltage.
 const g={P:[],A:[],A2:[],L:[],R:[],B:[],N:[]};
 for(const [a,b] of wires){g[a].push(b);g[b].push(a)}
 const visited=new Set(["P"]),stack=["P"];
 while(stack.length){for(const next of g[stack.pop()])if(!visited.has(next)){visited.add(next);stack.push(next)}}
 return {kind:visited.has("N")?"bright":"dark",closed:visited.has("N"),edges:wires};
}
function normalize(raw){
 const s=initial();
 if(!raw||typeof raw!=="object")return s;
 if(group(raw.active))s.active=raw.active;
 for(const station of stations){
  const value=raw.selected?.[station.id];if(option(station.id,value))s.selected[station.id]=value;
  const o=raw.installed?.[station.id];
  if(option(station.id,o)&&raw.tests?.[station.id]?.[o]?.actual===trialResult(station.id,o))
   s.installed[station.id]=o;
  for(const choice of station.options){
   const t=raw.tests?.[station.id]?.[choice.id];
   if(t&&["bright","dark"].includes(t.guess)&&t.actual===trialResult(station.id,choice.id)){
    s.tests[station.id]||={};
    s.tests[station.id][choice.id]={guess:t.guess,actual:trialResult(station.id,choice.id)};
   }
  }
 }
 // A chosen installation can only reference an independently tested option.
 for(const station of stations)if(!s.tests[station.id]?.[s.installed[station.id]])s.installed[station.id]=null;
 if(["bright","dark"].includes(raw.guess))s.guess=raw.guess;
 if(["bright","dark"].includes(raw.overallGuess))s.overallGuess=raw.overallGuess;
 const value=evaluate(s.installed),measured=raw.overall;
 if(measured?.signature===signature(s.installed)&&measured?.kind===value.kind&&measured?.guess===s.overallGuess)
  s.overall={signature:signature(s.installed),kind:value.kind,guess:s.overallGuess};
 if(reasons.some(([id])=>id===raw.reason))s.reason=raw.reason;
 return s;
}
function nextUntested(raw){
 const s=normalize(raw),options=stations.flatMap(station=>station.options.map(item=>({station:station.id,option:item.id})));
 const current=options.findIndex(x=>x.station===s.active&&x.option===s.selected[x.station]);
 for(let i=1;i<=options.length;i++){
  const entry=options[(current+i+options.length)%options.length];
  if(entry&&!s.tests[entry.station]?.[entry.option])return entry;
 }
 return null;
}
function evidence(raw){
 const s=normalize(raw);
 return stations.every(station=>station.options.every(o=>s.tests[station.id]?.[o.id]?.actual===trialResult(station.id,o.id)));
}
function canFinish(raw){
 const s=normalize(raw);
 return evidence(s)&&stations.every(station=>s.installed[station.id]===correct[station.id])&&
   s.overall?.signature===signature(s.installed)&&s.overall.kind==="bright"&&s.overall.guess==="bright"&&s.reason==="loop";
}
function circuit(raw){
 const s=normalize(raw),lit=s.overall?.signature===signature(s.installed)&&s.overall.kind==="bright",ink=lit?"#ffe2a1":"#9cc9d5";
 const label=(x,y,text)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="13" fill="#d5f4f2">'+text+'</text>';
 const slot=(x,y,title,value)=>'<rect x="'+(x-65)+'" y="'+(y-22)+'" width="130" height="44" rx="11" fill="'+(value?"#deeee2":"#30546c")+'" stroke="'+(value?"#a6d2aa":"#d39b88")+'" stroke-width="3"/><text x="'+x+'" y="'+(y+5)+'" font-size="13" text-anchor="middle" font-weight="800" fill="'+(value?"#244a40":"#fff1dc")+'">'+(value||"まだ設置していない")+'</text>'+label(x,y-34,title);
 const optionLabel=(id,value)=>option(id,value)?.name||null;
 return '<svg class="finale-circuit-svg" viewBox="0 0 790 320" role="img" aria-label="乾電池2個の向きから金属のつなぎ目、豆電球の横・底の接点を経て電池のマイナスへ戻る一周の仮想回路図">'+
 '<rect width="790" height="320" rx="18" fill="#112f43"/>'+
 '<rect x="25" y="92" width="109" height="142" rx="12" fill="#a96b5a" stroke="#ffe4b7" stroke-width="4"/>'+
 '<text x="79" y="127" fill="#fff" font-size="16" text-anchor="middle">乾電池×2</text><text x="79" y="154" fill="#fff" font-size="17" text-anchor="middle">1.5V × 2</text>'+
 label(78,77,"＋")+label(78,265,"−")+
 '<path d="M79 91V63H194M324 63H420M550 63H672V106M672 216V265H550M420 265H79V234" stroke="'+ink+'" stroke-width="7" fill="none" stroke-linejoin="round"/>'+
 slot(259,63,"電池の向き",optionLabel("battery",s.installed.battery))+
 slot(485,63,"通す材料",optionLabel("material",s.installed.material))+
 slot(485,265,"豆電球の接点",optionLabel("contact",s.installed.contact))+
 '<circle cx="672" cy="162" r="55" fill="'+(lit?"#ffe7a2":"#274f68")+'" stroke="#e2f3e8" stroke-width="5"/>'+
 '<path d="M652 142L693 185M693 142L652 185" stroke="'+(lit?"#a0713e":"#bad2d9")+'" stroke-width="6"/>'+
 label(738,166,"豆電球")+
 '<text x="392" y="305" text-anchor="middle" fill="#d9eef1" font-size="13">'+(lit?"通電実験：閉じた輪ができた":"仮想回路の部品を調査・設置し、実験で確認しよう")+'</text></svg>';
}
function render(raw){
 const s=normalize(raw),stage=group(s.active),chosen=s.selected[stage.id],tested=s.tests[stage.id]?.[chosen],count=stations.reduce((n,x)=>n+(x.options.filter(o=>s.tests[x.id]?.[o.id]).length),0);
 const ready=evidence(s),assembled=stations.every(x=>s.installed[x.id]),lit=s.overall?.kind==="bright";
 const options=stage.options.map(o=>{
  const t=s.tests[stage.id]?.[o.id];
  return '<button type="button" class="finale-specimen'+(chosen===o.id?" selected":"")+'" data-finale-option="'+o.id+'" aria-pressed="'+(chosen===o.id)+'"><strong>'+o.name+'</strong><small>'+(t?"実験済み":"未実験")+'</small></button>';
 }).join("");
 const compare=stations.map(station=>'<div class="finale-log-item"><strong>'+station.icon+' '+station.title+'</strong><span>'+station.options.map(o=>(s.tests[station.id]?.[o.id]?o.name+"："+names[s.tests[station.id][o.id].actual]:"まだ "+o.name+" を実験していない")).join(" / ")+'</span></div>').join("");
 return '<div class="finale-lab"><div class="finale-head"><span class="eyebrow">🌟 ラストミッション</span><strong>灯台の科学捜査と最終修復</strong><small>実験 '+count+' / 6　・　設置 '+stations.filter(x=>s.installed[x.id]).length+' / 3</small></div>'+
 '<div class="finale-security">⚠ 乾電池・回路を危険な状態でつなぐ実験は、画面内の安全な仮想実験です。実際の電池のショートや定格超過は試さないでね。</div>'+
 '<section class="lab-panel finale-section"><h3>① 6つ ためしてみよう</h3><p class="lab-sub">電池・材料・まめ電球を 2つずつ くらべよう。</p>'+
 '<div class="finale-stations">'+stations.map(x=>'<button type="button" data-finale-station="'+x.id+'" class="'+(s.active===x.id?" selected":"")+'" aria-pressed="'+(s.active===x.id)+'"><strong>'+x.icon+' '+x.title+'</strong><small>'+x.options.filter(o=>s.tests[x.id]?.[o.id]).length+' / 2</small></button>').join("")+'</div>'+
 '<div class="finale-investigate"><h3>'+stage.icon+' '+stage.title+'</h3><p>'+stage.question+'</p><div class="finale-specimens">'+options+'</div>'+
 (tested?'<div class="finale-result">予想：'+names[tested.guess]+' ／ 実際：'+names[tested.actual]+'。'+(tested.actual===tested.guess?"予想どおり。":"予想が外れた！その理由を比べよう。")+'</div>':
 '<p class="lab-sub">現在の条件で点灯するか予想してね。</p><div class="finale-choices">'+[["bright","💡 点灯"],["dark","◯ 消灯"]].map(([id,label])=>'<button type="button" data-finale-guess="'+id+'" class="'+(s.guess===id?" selected":"")+'" aria-pressed="'+(s.guess===id)+'">'+label+'</button>').join("")+'</div><button type="button" class="finale-measure" data-finale-test '+(!s.guess?"disabled":"")+'>🔬 光るか ためす</button>')+
 '<div class="finale-place"><button type="button" data-finale-install '+(!tested?"disabled":"")+'>🔧 これを 灯台に つける</button><span>設置済み：'+(optionLabel(s.active,s.installed[stage.id])||"未設置")+'</span></div>'+
 (tested&&!ready?'<button type="button" class="finale-next" data-finale-next="1">🔎 つぎを ためす</button>':"")+'</div>'+
 '<details class="finale-log"><summary>📖 6回の けっかを 見る</summary>'+compare+'</details></section>'+
 (ready?'<section class="lab-panel finale-section"><h3>② 灯台を 光らせよう</h3><p class="lab-sub">各部品を実験結果から選び、全体の回路で点灯するか予想してから通電しよう。</p>'+
 '<div class="finale-circuit">'+circuit(s)+'</div><div class="finale-view"><button type="button" data-finale-view="left">◀ 乾電池側</button><button type="button" data-finale-view="right">豆電球側 ▶</button></div>'+
 (assembled?'<div class="finale-master-test"><strong>全部つないだら、光ると思う？</strong><div class="finale-choices">'+[["bright","💡 点灯"],["dark","◯ 消灯"]].map(([id,label])=>'<button type="button" data-finale-overall-guess="'+id+'" class="'+(s.overallGuess===id?" selected":"")+'">'+label+'</button>').join("")+'</div>'+
 '<button type="button" class="finale-measure" data-finale-overall-test '+(!s.overallGuess?"disabled":"")+'>⚡ 灯台を ためす</button></div>':'<p class="finale-reminder">まず調査した3つの条件を上の「灯台へ採用」でそれぞれ設置しよう。</p>')+
 (s.overall?'<div class="finale-result" role="status">予想：'+names[s.overall.guess]+' ／ 実際：'+names[s.overall.kind]+(lit?"。灯台をともす回路ができた！":"。回路がどこかで切れている。3つの部品の実験結果を見直そう。")+'</div>':"")+
 (lit?'<div class="finale-reasons"><h3>③ どうして 光った？</h3>'+reasons.map(([id,label])=>'<button type="button" data-finale-reason="'+id+'" class="'+(s.reason===id?" selected":"")+'">'+label+'</button>').join("")+'<p class="lab-sub">正しい理由まで確認できたら、画面下の「最終回路を確認する」を押そう。</p></div>':"")+
 '</section>':"")+'</div>';
}
window.AkariFinaleLab={stations,correct,reasons,initial,option,trialResult,signature,evaluate,normalize,evidence,nextUntested,canFinish,render,circuit};
})();
