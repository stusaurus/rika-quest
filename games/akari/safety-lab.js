"use strict";
(function(){
/* Mission 12: evidence-based *virtual* safety inspection. The battery has no
 * conductive internal edge, while the lamp does. A wire-only P-N path is
 * therefore a short even when a second path contains the lamp.
 * Do not simulate a physical short with real batteries. */
const shapes={
 "P-L":{path:"M85 89H475",label:[276,78]},
 "N-R":{path:"M85 276H475",label:[280,299]},
 "P-N":{path:"M85 89V45H550V320H85V276",label:[545,186]},
 "P-J":{path:"M85 89L280 183",label:[185,121]},
 "J-N":{path:"M280 183L85 276",label:[187,251]}
};
const stages=[
 {name:"港の作業灯",story:"どの導線を外せば、豆電球の道だけが残る？",wires:[["A","P-L"],["B","N-R"],["C","P-N"]]},
 {name:"分かれた連絡路",story:"枝分かれのどちらかを切るだけで危険をなくせるかな？",wires:[["A","P-J"],["B","P-L"],["C","J-N"],["D","N-R"]]},
 {name:"二つの危険な近道",story:"危険な道が2本ある。なるべく少ない切断で、安全な輪を残そう。",wires:[["A","P-N"],["B","P-L"],["C","P-J"],["D","N-R"],["E","J-N"]]}
].map((p,i)=>({...p,id:i+1,wires:p.wires.map(([id,link])=>({id,link,from:link.split("-")[0],to:link.split("-")[1]}))}));
const reasonOptions=[
 ["lamp-path","乾電池の＋から豆電球の2つの接点を通り、−に戻る輪だけを残す"],
 ["shortcut","乾電池の＋と−が、豆電球を通らず直接つながる道を残す"],
 ["all-cut","つながる導線を全部外せば、豆電球はつく"]
];
const empty=()=>({index:0,removed:[],guess:null,measured:null,reason:null});
const idset=wires=>new Set(wires.map(x=>x.id));
function normalize(index,removed){
 const allowed=idset(stages[index]?.wires||[]);
 return [...new Set(Array.isArray(removed)?removed:[])].filter(id=>typeof id==="string"&&allowed.has(id));
}
const signature=(index,removed)=>index+":"+normalize(index,removed).sort().join(",");
function connected(wires,withLamp){
 const graph={P:[],N:[],L:[],R:[],J:[]};
 for(const w of wires){graph[w.from].push(w.to);graph[w.to].push(w.from)}
 if(withLamp){graph.L.push("R");graph.R.push("L")}
 const seen=new Set(["P"]),stack=["P"];
 while(stack.length){for(const p of graph[stack.pop()])if(!seen.has(p)){seen.add(p);stack.push(p)}}
 return seen.has("N");
}
function evaluate(index,removed=[]){
 const stage=stages[index];if(!stage)return null;
 const cuts=new Set(normalize(index,removed));
 const wires=stage.wires.filter(w=>!cuts.has(w.id));
 const short=connected(wires,false),lit=!short&&connected(wires,true);
 return {short,lit,kind:short?"short":lit?"lit":"open",removed:normalize(index,removed)};
}
function minimumCuts(index){
 const stage=stages[index];if(!stage)return Infinity;
 let best=Infinity;
 for(let mask=0;mask<2**stage.wires.length;mask++){
  const removed=stage.wires.filter((_,i)=>mask&(1<<i)).map(w=>w.id);
  if(removed.length<best&&evaluate(index,removed).lit)best=removed.length;
 }
 return best;
}
function canAdvance(s){
 if(!s||!Number.isInteger(s.index)||!stages[s.index])return false;
 const actual=evaluate(s.index,s.removed);
 return s.guess==="lit"&&s.measured?.signature===signature(s.index,s.removed)&&
  s.measured?.guess==="lit"&&s.measured?.actual==="lit"&&actual.lit&&
  normalize(s.index,s.removed).length===minimumCuts(s.index);
}
function restore(raw){
 const d=empty();if(!raw||typeof raw!=="object")return d;
 d.index=Number.isInteger(raw.index)&&raw.index>=0&&raw.index<stages.length?raw.index:0;
 d.removed=normalize(d.index,raw.removed);
 d.guess=["short","lit","open"].includes(raw.guess)?raw.guess:null;
 const actual=evaluate(d.index,d.removed);
 if(raw.measured&&raw.measured.signature===signature(d.index,d.removed)&&
  raw.measured.guess===d.guess&&raw.measured.actual===actual.kind)
  d.measured={signature:raw.measured.signature,guess:d.guess,actual:actual.kind};
 d.reason=reasonOptions.some(([id])=>id===raw.reason)?raw.reason:null;
 return d;
}
function progress(s){return s.index+(canAdvance(s)?1:0)}
function svg(index,removed,measured){
 const stage=stages[index],cuts=new Set(normalize(index,removed));
 const nodes=[
 ["P",85,89,"＋"],["N",85,276,"−"],["L",475,89,"横"],["R",475,276,"底"]
 ];
 return '<svg class="safety-svg" viewBox="0 0 590 365" role="img" aria-label="乾電池のプラス・マイナス、豆電球の横と底、導線AからEのつながりを示す回路図">'+
 '<rect x="8" y="8" width="574" height="349" rx="23" fill="#112e42"/>'+
 '<path d="M85 109V153M85 215V258" stroke="#f0d8a3" stroke-width="6" fill="none"/>'+
 '<line x1="63" y1="163" x2="107" y2="163" stroke="#f8d9a6" stroke-width="7"/><line x1="74" y1="190" x2="96" y2="190" stroke="#f8d9a6" stroke-width="6"/>'+
 '<text x="31" y="238" font-size="15" fill="#e6f4f4">乾電池</text>'+
 '<path d="M475 109V149M475 217V258" stroke="#ffebb4" stroke-width="6"/><circle cx="475" cy="183" r="33" fill="'+(measured?.actual==="lit"?"#ffe5a1":"#16394d")+'" stroke="#ffedb5" stroke-width="6"/>'+
 '<path d="M458 166L492 200M492 166L458 200" stroke="'+(measured?.actual==="lit"?"#7c5425":"#d3e8ea")+'" stroke-width="5"/>'+
 '<text x="502" y="187" font-size="15" fill="#e6f4f4">豆電球</text>'+
 stage.wires.map(w=>{
 const sh=shapes[w.link],off=cuts.has(w.id);
 return '<g class="safety-wire'+(off?" cut":"")+'" data-line="'+w.id+'" opacity="'+(off?".20":"1")+'"><path d="'+sh.path+'" stroke="'+(off?"#c5d5d7":"#9bced5")+'" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" fill="none"/>'+
 '<rect x="'+(sh.label[0]-15)+'" y="'+(sh.label[1]-16)+'" width="30" height="30" rx="8" fill="'+(off?"#58666b":"#f3d494")+'" stroke="#204250" stroke-width="2"/>'+
 '<text x="'+sh.label[0]+'" y="'+(sh.label[1]+6)+'" font-size="20" text-anchor="middle" font-weight="900" fill="#1d3540">'+w.id+'</text></g>';
 }).join("")+
 nodes.map(([id,x,y,label])=>'<circle cx="'+x+'" cy="'+y+'" r="16" fill="#efffff" stroke="#308ba7" stroke-width="4"/><text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" font-size="15" fill="#17394b" font-weight="900">'+label+'</text>').join("")+
 (stage.wires.some(w=>w.from==="J"||w.to==="J")?'<circle cx="280" cy="183" r="11" fill="#eafff7" stroke="#478e98" stroke-width="4"/><text x="295" y="201" font-size="12" fill="#e3f9ef">分岐点</text>':"")+
 '</svg>';
}
const statusLabel={short:"⚠ ショートの危険",lit:"💡 豆電球が点灯",open:"◯ 回路が切れて消灯"};
function render(raw){
 const s=restore(raw),job=stages[s.index],ready=canAdvance(s),last=s.index===stages.length-1;
 return '<div class="safety-lab">'+
 '<div class="safety-heading"><div><span class="eyebrow">⚡ 安全点検 '+(s.index+1)+' / 3</span><h3>'+job.name+'</h3><p>'+job.story+'</p></div><strong class="safety-progress">'+progress(s)+' / 3 完了</strong></div>'+
 '<p class="safety-warning">これはゲーム内の仮想実験です。実際の乾電池をショートさせる実験は絶対にしないでください。</p>'+
 '<div class="experiment-layout"><section class="lab-panel"><h3>🧭 図から危険な道を探す</h3><p class="lab-sub">導線を切り替えると図から薄くなるよ。電池と豆電球の接点をたどろう。</p><div class="safety-diagram">'+svg(s.index,s.removed,s.measured)+'</div><div class="safety-nav"><button type="button" data-safe-view="left">◀ 乾電池側</button><button type="button" data-safe-view="right">豆電球側 ▶</button></div>'+
 '<p class="lab-reading">図は電池の＋・−、豆電球の横・底を表す。豆電球の内部を通る道は、電池を直接つなぐ導線とは違うよ。</p></section>'+
 '<section class="lab-panel"><h3>✂ 修理する導線を選ぼう</h3><p class="lab-sub">安全に点灯する道を残しながら、できるだけ少ない導線を外してね。</p><div class="safety-wires">'+job.wires.map(w=>'<button type="button" class="cut-wire'+(s.removed.includes(w.id)?" removed":"")+'" data-safe-wire="'+w.id+'" aria-pressed="'+s.removed.includes(w.id)+'"><span>導線 '+w.id+'</span><strong>'+(s.removed.includes(w.id)?"外した ✓":"つながっている")+'</strong></button>').join("")+'</div>'+
 '<div class="safety-prediction"><strong>🔮 この状態を仮想通電するとどうなる？</strong><div class="safety-guesses">'+[["lit","💡 点灯"],["open","◯ 消灯"],["short","⚠ ショート"]].map(([id,label])=>'<button type="button" class="'+(s.guess===id?"chosen":"")+'" data-safe-guess="'+id+'" aria-pressed="'+(s.guess===id)+'">'+label+'</button>').join("")+'</div></div>'+
 '<button type="button" class="safety-test" data-safe-test '+(!s.guess?"disabled":"")+'>🔬 仮想実験で確かめる</button>'+
 (s.measured?'<div class="safety-result '+s.measured.actual+'" role="status">予想：'+statusLabel[s.measured.guess]+' ／ 実際：'+statusLabel[s.measured.actual]+
 (s.measured.guess===s.measured.actual?'。予想と一致！':'。予想と違った。理由を考えてみよう。')+
 (ready?' 安全な回路を必要最小限の修理で残せた！':s.measured.actual==="lit"?' 安全だけど、外した線をもっと少なくできるかな？':"")+'</div>':"")+
 (ready&&!last?'<button type="button" class="safety-next" data-safe-next>✓ この場所を復旧して、次の点検へ</button>':"")+
 (ready&&last?'<div class="safety-reasons"><h3>📖 最後のなぜ？</h3><p class="lab-sub">3つの点検で使った、共通の法則はどれだろう？</p>'+
 reasonOptions.map(([id,txt])=>'<button class="safety-reason'+(s.reason===id?" chosen":"")+'" data-safe-reason="'+id+'" aria-pressed="'+(s.reason===id)+'">'+txt+'</button>').join("")+
 '<p>答えたら、下の「電気を流してみる」で最終確認しよう。</p></div>':"")+
 '</section></div></div>';
}
window.AkariSafety={stages,empty,normalize,signature,evaluate,minimumCuts,canAdvance,restore,progress,render,correctReason:"lamp-path"};
})();
