"use strict";
(function(){
/* A physically grounded ideal-wire model.
 * P/N: battery terminals (never joined internally)
 * L/R: lamp's two electrical terminals
 * S/T: two terminals of the controllable switch
 * The lamp is a load, so a wire-only P->N path is always a dangerous short.
 */
const terminals={
 P:{name:"乾電池 ＋",x:85,y:118},
 N:{name:"乾電池 −",x:85,y:340},
 S:{name:"スイッチ入口",x:382,y:118},
 T:{name:"スイッチ出口",x:555,y:118},
 L:{name:"豆電球の横",x:888,y:118},
 R:{name:"豆電球の底",x:888,y:340}
};
const ids=Object.keys(terminals);
const names={P:"電池＋",N:"電池−",S:"スイッチ入口",T:"スイッチ出口",L:"電球の横",R:"電球の底"};
function edge(a,b){return [a,b].sort().join("-");}
function normalize(wires){
 const seen=new Set();
 if(!Array.isArray(wires))return[];
 return wires.filter(pair=>{
   if(!Array.isArray(pair)||pair.length!==2||!ids.includes(pair[0])||!ids.includes(pair[1])||pair[0]===pair[1])return false;
   const key=edge(...pair);if(seen.has(key))return false;seen.add(key);return true;
 }).map(pair=>pair.slice()).slice(0,15);
}
function signature(wires){return normalize(wires).map(([a,b])=>edge(a,b)).sort().join("|");}
function connected(from,to,edges){
 const graph=Object.fromEntries(ids.map(id=>[id,[]]));
 edges.forEach(([a,b])=>{graph[a].push(b);graph[b].push(a)});
 const visit=new Set([from]),queue=[from];
 while(queue.length){const node=queue.shift();if(node===to)return true;for(const next of graph[node])if(!visit.has(next)){visit.add(next);queue.push(next)}}
 return false;
}
function evaluate(wires,switchOn){
 const physical=normalize(wires);
 const conductive=physical.concat(switchOn?[["S","T"]]:[]);
 const short=connected("P","N",conductive);
 const forward=connected("P","L",conductive)&&connected("R","N",conductive);
 const reverse=connected("P","R",conductive)&&connected("L","N",conductive);
 return {short,lit:!short&&(forward||reverse),safe:!short,condition:switchOn?"on":"off"};
}
function expected(tests,wires){
 const sig=signature(wires);
 const off=tests?.off,on=tests?.on;
 return !!off&&!!on&&off.signature===sig&&on.signature===sig&&off.safe&&!off.lit&&on.safe&&on.lit;
}
function render(wires=[],selected=null,switchOn=false,tests={}){
 const normalized=normalize(wires),sim=evaluate(normalized,switchOn);
 const test=tests[switchOn?"on":"off"];
 const measured=!!test&&test.signature===signature(normalized);
 const lineSvg=normalized.map(([a,b],i)=>{
   const p=terminals[a],q=terminals[b];
   return '<g class="builder-line"><path d="M'+p.x+' '+p.y+'L'+q.x+' '+q.y+'" fill="none" stroke="#eff5e6" stroke-width="11" opacity=".17" stroke-linecap="round"/>'+
     '<path d="M'+p.x+' '+p.y+'L'+q.x+' '+q.y+'" fill="none" stroke="'+(i%2?"#b9e4e4":"#f2d69f")+'" stroke-width="5" stroke-linecap="round"/></g>';
 }).join("");
 const lampGlow=measured&&sim.lit;
 const status=measured?(sim.short?"⚠ ショート：危険な直結がある":sim.lit?"💡 豆電球が点灯":"◯ 豆電球は消灯"):"？ 通電実験はまだ";
 const endpoints=ids.map(id=>{
  const p=terminals[id];
  return '<button type="button" class="builder-terminal'+(selected===id?' selected':'')+'" style="left:'+(100*p.x/1000)+'%;top:'+(100*p.y/460)+'%" data-builder-t="'+id+'" aria-label="'+p.name+' を選ぶ" aria-pressed="'+(selected===id)+'"><span>'+id+'</span></button>';
 }).join("");
 const testsPanel=[["off","OFFの実験",tests.off],["on","ONの実験",tests.on]].map(([mode,label,result])=>{
  const valid=result&&result.signature===signature(normalized);
  return '<div class="builder-measure'+(valid?' measured':'')+'"><strong>'+label+'</strong><span>'+
   (valid?(result.short?"⚠ ショート（危険）":result.lit?"💡 点灯":"◯ 消灯"):"？ 未実験")+'</span></div>';
 }).join("");
 return '<section class="builder-puzzle"><div class="builder-heading"><span>🌟 最終の設計依頼</span><h3>灯台のスイッチ回路を組み立てよう</h3>'+
  '<p>スイッチ <b>ONで点灯</b>、<b>OFFで消灯</b>。どちらの状態でもショートしない回路を作ってね。</p></div>'+
  '<div class="builder-layout"><div class="builder-panel"><p class="builder-help">端子を2つ順にタップすると導線でつながるよ。すでにつないだ2つを選ぶと外せるよ。</p>'+
  '<div class="builder-board"><svg viewBox="0 0 1000 460" role="img" aria-label="乾電池の＋−、豆電球の横と底、スイッチの入口出口を自由につなぐ回路図">'+
  '<rect width="1000" height="460" rx="27" fill="#183c55"/>'+
  '<g><rect x="39" y="164" width="92" height="125" rx="15" fill="#d7a96b" stroke="#ffdeab" stroke-width="5"/>'+
  '<text x="85" y="226" text-anchor="middle" font-size="28" fill="#fff6d3" font-weight="bold">1.5V</text>'+
  '<text x="85" y="258" text-anchor="middle" font-size="18" fill="#fff6d3">乾電池</text>'+
  '<path d="M85 118V164M85 289V340" stroke="#e9ecdf" stroke-width="7" fill="none"/>'+
  '<text x="151" y="120" fill="#fff1ae" font-size="18">＋</text><text x="151" y="347" fill="#fff1ae" font-size="18">−</text></g>'+
  '<g><path d="M382 118L555 '+(switchOn?'118':'91')+'" fill="none" stroke="#f7d69e" stroke-width="7" stroke-linecap="round"/>'+
  '<path d="M382 118L555 118" stroke="#94b3bc" stroke-width="4" stroke-dasharray="5 12" opacity=".48"/>'+
  '<text x="467" y="62" text-anchor="middle" font-size="22" fill="#e8eecf">スイッチ '+(switchOn?'ON':'OFF')+'</text></g>'+
  '<g><path d="M888 118V170M888 286V340" stroke="#dcebe2" stroke-width="7"/>'+
  '<circle cx="888" cy="230" r="57" fill="'+(lampGlow?'#ffe6aa':'#7d9ca4')+'" fill-opacity="'+(lampGlow?'1':'.42')+'" stroke="#fff1c5" stroke-width="5"/>'+
  (lampGlow?'<circle cx="888" cy="230" r="75" fill="none" stroke="#ffe5a1" stroke-width="8" opacity=".6"/>':'')+
  '<path d="M859 202L917 258M917 202L859 258" stroke="#fff5d8" stroke-width="6" fill="none"/>'+
  '<text x="888" y="419" text-anchor="middle" fill="#e1f3e6" font-size="20">豆電球</text>'+
  '<text x="790" y="123" fill="#eff4df" font-size="18">横</text><text x="790" y="346" fill="#eff4df" font-size="18">底</text></g>'+
   lineSvg+'</svg>'+endpoints+'</div>'+
  '<div class="builder-bottom"><span>導線 '+normalized.length+' 本</span><button type="button" data-builder-clear="1" class="builder-clear">導線を全部外す</button></div></div>'+
  '<div class="builder-panel"><h3>🔬 回路を検証する</h3><p class="builder-help">まずOFF、次にONを確かめてみよう。ショートがあると危険なので、このゲーム内だけで試してね。</p>'+
  '<div class="builder-switch"><button type="button" data-builder-switch="off" aria-pressed="'+(!switchOn)+'" class="'+(!switchOn?'on':'')+'">OFF</button>'+
  '<button type="button" data-builder-switch="on" aria-pressed="'+switchOn+'" class="'+(switchOn?'on':'')+'">ON</button></div>'+
  '<p class="builder-live">'+status+'</p><button type="button" data-builder-test="1" class="builder-test">⚡ 今の状態を実験する</button>'+
  '<div class="builder-measures">'+testsPanel+'</div>'+
  '<p class="builder-hint">合格条件：OFFで消灯、ONで点灯、そしてどちらもショートなし。</p>'+
  '<button type="button" class="builder-submit" data-builder-submit="1"'+(expected(tests,normalized)?'':' disabled')+'>🏆 設計を完成して灯台に光を戻す</button></div></div></section>';
}
window.AkariBuilder={ids,terminals,edge,normalize,signature,evaluate,expected,render};
})();