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
function expectedDirect(tests,wires){
 const segments=normalize(wires),sig=signature(segments),result=tests?.single;
 if(segments.some(([a,b])=>["S","T"].includes(a)||["S","T"].includes(b)))return false;
 const check=evaluate(segments,false);
 return !!result&&result.signature===sig&&check.safe&&check.lit&&result.safe&&result.lit;
}
function expectedFor(task,tests,wires){return task==="direct"?expectedDirect(tests,wires):expected(tests,wires)}
function traceStatus(task,wires,steps){
 const allowed=task==="direct"?["P","L","R","N"]:ids;
 const route=Array.isArray(steps)?steps:[];
 if(route.length===0)return{valid:true,complete:false,viaLamp:false,viaSwitch:false};
 if(route.length>allowed.length||route[0]!=="P"||route.some(node=>!allowed.includes(node))||new Set(route).size!==route.length)
  return{valid:false,complete:false,viaLamp:false,viaSwitch:false};
 const graphEdges=new Set(normalize(wires).filter(([a,b])=>allowed.includes(a)&&allowed.includes(b)).map(([a,b])=>edge(a,b)));
 graphEdges.add(edge("L","R")); // a real lamp is an electrical load, not a wire
 if(task!=="direct")graphEdges.add(edge("S","T")); // trace the closed-switch case
 let viaLamp=false,viaSwitch=false;
 for(let i=1;i<route.length;i++){
  const key=edge(route[i-1],route[i]);
  if(!graphEdges.has(key)||route[i-1]==="N"||(route[i]==="N"&&i!==route.length-1))
   return{valid:false,complete:false,viaLamp:false,viaSwitch:false};
  if(key===edge("L","R"))viaLamp=true;
  if(key===edge("S","T"))viaSwitch=true;
 }
 const complete=route.at(-1)==="N"&&viaLamp&&(task==="direct"||viaSwitch);
 return{valid:true,complete,viaLamp,viaSwitch};
}
function scientificComplete(task,tests,wires,trace){
 return (task==="direct"?expectedDirect(tests,wires):expected(tests,wires))&&traceStatus(task,wires,trace).complete;
}
function render(wires=[],selected=null,switchOn=false,tests={},task="switch",trace=[]){
 const direct=task==="direct",segments=normalize(wires);
 const proofReady=expectedFor(task,tests,segments),route=Array.isArray(trace)?trace:[];
 const proof=traceStatus(task,segments,route);
 const routeSvg=route.slice(1).map((node,i)=>{
  const prev=route[i],a=terminals[prev],b=terminals[node],key=edge(prev,node);
  if(key===edge("L","R"))return '<path d="M888 118V340" stroke="#ffef94" stroke-width="11" stroke-linecap="round" fill="none" opacity=".8"/>';
  if(key===edge("S","T"))return '<path d="M382 118L555 118" stroke="#ffef94" stroke-width="11" stroke-linecap="round" fill="none" opacity=".85"/>';
  return '<path d="M'+a.x+' '+a.y+'L'+b.x+' '+b.y+'" stroke="#ffef94" stroke-width="10" stroke-linecap="round" fill="none" opacity=".85"/>';
 }).join("");
 const tracePanel='<div class="builder-proof'+(proof.complete?' finished':'')+'"><h4>🧠 電気の道を証明しよう</h4>'+
  '<p>電気の通り道を、<b>乾電池の＋極から−極へ</b>順番にたどろう。豆電球の「横と底」の間も必ず通ってね。'+(direct?'':'スイッチはONにして、入口と出口の間もたどろう。')+'</p>'+
  (proofReady?'<div class="builder-trace-sequence" aria-live="polite">'+(route.length?route.map(id=>names[id]).join(' → '):'まだ通り道を選んでいないよ')+'</div>'+
   '<div class="builder-trace-choices">'+(direct?["P","L","R","N"]:["P","S","T","L","R","N"]).map(id=>'<button type="button" data-builder-trace="'+id+'"'+(!direct&&!switchOn?' disabled':'')+' aria-label="電気の道：'+terminals[id].name+'" class="'+(route.includes(id)?' traced':'')+'">'+names[id]+'</button>').join("")+'</div>'+
   '<div class="builder-trace-footer">'+
     (proof.complete?'<strong>✓ 豆電球'+(direct?'':'とスイッチ')+'を通る道を説明できた！</strong>':
       '<span>'+(direct?'電球の接点を通る輪をたどろう。':'スイッチONの状態で、電球も通る輪をたどろう。')+'</span>')+
     '<button type="button" data-builder-trace-reset="1"'+(route.length?'':' disabled')+'>↺ 通り道をやり直す</button></div>'+
     (!direct&&!switchOn?'<p class="builder-trace-warning">通り道をたどるときは、先にスイッチをONにしよう。</p>':'')
  :'<p class="builder-trace-pending">まず安全な回路を作り、'+(direct?'通電実験で点灯を確かめよう。':'OFF・ONの両方を実験して確かめよう。')+'</p>')+'</div>';

 const simulation=evaluate(segments,direct?false:switchOn);
 const mode=direct?"single":switchOn?"on":"off";
 const recorded=tests[mode],measured=recorded&&recorded.signature===signature(segments);
 const glow=!!measured&&simulation.lit;
 const status=measured?(simulation.short?"⚠ ショート！ 乾電池を直結している":simulation.lit?"💡 点灯した！":"◯ 消灯した"):"？ まだ実験していない";
 const lineSvg=segments.map(([a,b],i)=>{
  const u=terminals[a],v=terminals[b];
  return '<g class="builder-line"><path d="M'+u.x+' '+u.y+'L'+v.x+' '+v.y+'" fill="none" stroke="#eff5e6" stroke-width="11" opacity=".17" stroke-linecap="round"/>'+
  '<path d="M'+u.x+' '+u.y+'L'+v.x+' '+v.y+'" fill="none" stroke="'+(i%2?"#b9e4e4":"#f2d69f")+'" stroke-width="5" stroke-linecap="round"/></g>';
 }).join("");
 const available=direct?ids.filter(id=>id!=="S"&&id!=="T"):ids;
 const buttons=available.map(id=>{
  const t=terminals[id];
  return '<button type="button" class="builder-terminal'+(selected===id?' selected':'')+(route.includes(id)?' traced':'')+'" style="left:'+(100*t.x/1000)+'%;top:'+(100*t.y/460)+'%" data-builder-t="'+id+'" aria-label="'+t.name+' を選ぶ" aria-pressed="'+(selected===id)+'"><span>'+id+'</span></button>';
 }).join("");
 const statusBlocks=(direct?[["single","点灯の実験"]]:[["off","OFFの実験"],["on","ONの実験"]]).map(([id,label])=>{
  const data=tests[id],valid=data&&data.signature===signature(segments);
  return '<div class="builder-measure'+(valid?' measured':'')+'"><strong>'+label+'</strong><span>'+
   (valid?(data.short?"⚠ ショート（危険）":data.lit?"💡 点灯":"◯ 消灯"):"？ 未実験")+'</span></div>';
 }).join("");
 const switchArt=direct?
   '<text x="475" y="226" text-anchor="middle" font-size="18" fill="#92b9be">自分で電気の輪を作ろう</text>':
   '<g><path d="M382 118L555 '+(switchOn?'118':'91')+'" stroke="#f7d69e" stroke-width="7" fill="none" stroke-linecap="round"/>'+
   '<path d="M382 118L555 118" stroke="#94b3bc" stroke-width="4" stroke-dasharray="5 12" opacity=".48"/>'+
   '<text x="467" y="62" text-anchor="middle" font-size="22" fill="#e8eecf">スイッチ '+(switchOn?"ON":"OFF")+'</text></g>';
 const switchControl=direct?'':'<div class="builder-switch"><button type="button" data-builder-switch="off" aria-pressed="'+(!switchOn)+'" class="'+(!switchOn?'on':'')+'">OFF</button>'+
  '<button type="button" data-builder-switch="on" aria-pressed="'+switchOn+'" class="'+(switchOn?'on':'')+'">ON</button></div>';
 return '<section class="builder-puzzle'+(direct?' builder-direct':'')+'"><div class="builder-heading"><span>'+(direct?'🕰 時計塔の再配線':'🌟 最終の設計依頼')+'</span>'+
 '<h3>'+(direct?'切れた回路を自分で直そう':'灯台のスイッチ回路を組み立てよう')+'</h3>'+
 '<p>'+(direct?'故障の原因を見つけたね。乾電池の＋と−を、豆電球の横と底の金属部分につないで<b>安全に点灯</b>させよう。':
 '灯台本体の修理が終わった！ 乾電池1個の非常用スイッチ盤を設計しよう。<b>ONで点灯・OFFで消灯</b>、どちらもショートなしが条件だよ。')+'</p></div>'+
 '<div class="builder-layout"><div class="builder-panel"><p class="builder-help">端子を2つ順にタップすると導線がつながるよ。もう一度同じ2つを選ぶと外せるよ。スマホでは左右に移動しよう。</p>'+
 '<div class="builder-nav"><button type="button" data-builder-view="battery">◀ 乾電池側</button><button type="button" data-builder-view="bulb">豆電球側 ▶</button></div>'+
 '<div class="builder-viewport" tabindex="0" aria-label="回路図。左右にスクロールして端子を選べます"><div class="builder-board">'+
 '<svg viewBox="0 0 1000 460" role="img" aria-label="'+(direct?'乾電池と豆電球の4端子':'乾電池・スイッチ・豆電球の6端子')+'をつなぐ回路の模式図">'+
 '<rect width="1000" height="460" rx="27" fill="#183c55"/>'+
 '<g><rect x="39" y="164" width="92" height="125" rx="15" fill="#d7a96b" stroke="#ffdeab" stroke-width="5"/>'+
 '<text x="85" y="226" text-anchor="middle" font-size="28" fill="#fff6d3" font-weight="bold">1.5V</text>'+
 '<text x="85" y="258" text-anchor="middle" font-size="18" fill="#fff6d3">乾電池</text>'+
 '<path d="M85 118V164M85 289V340" stroke="#e9ecdf" stroke-width="7" fill="none"/>'+
 '<text x="151" y="120" fill="#fff1ae" font-size="18">＋</text>'+
 '<text x="151" y="347" fill="#fff1ae" font-size="18">−</text></g>'+switchArt+
 '<g><path d="M888 118V170M888 286V340" stroke="#dcebe2" stroke-width="7"/>'+
 '<circle cx="888" cy="230" r="57" fill="'+(glow?'#ffe6aa':'#7d9ca4')+'" fill-opacity="'+(glow?'1':'.42')+'" stroke="#fff1c5" stroke-width="5"/>'+
 (glow?'<circle cx="888" cy="230" r="75" fill="none" stroke="#ffe5a1" stroke-width="8" opacity=".6"/>':'')+
 '<path d="M859 202L917 258M917 202L859 258" stroke="#fff5d8" stroke-width="6" fill="none"/>'+
 '<text x="888" y="419" text-anchor="middle" fill="#e1f3e6" font-size="20">豆電球</text>'+
 '<text x="790" y="123" fill="#eff4df" font-size="18">横</text><text x="790" y="346" fill="#eff4df" font-size="18">底</text></g>'+
 lineSvg+'<g class="builder-proof-path">'+routeSvg+'</g></svg>'+buttons+'</div></div>'+
 '<div class="builder-bottom"><span>導線 '+segments.length+' 本</span><button type="button" data-builder-clear="1" class="builder-clear">導線を全部外す</button></div></div>'+
 '<div class="builder-panel"><h3>🔬 回路を検証する</h3><p class="builder-help">'+(direct?'このゲーム内で通電して、安全に豆電球がつくか確かめよう。':'スイッチOFFとONをそれぞれ試そう。実物でショートを試すのは危険だよ。')+'</p>'+
 switchControl+'<p class="builder-live">'+status+'</p>'+
 '<button type="button" data-builder-test="1" class="builder-test">⚡ 今の状態を実験する</button>'+
 '<div class="builder-measures">'+statusBlocks+'</div>'+
 '<p class="builder-hint">'+(direct?'合格条件：電球の2つの金属部分を通る、切れ目のない輪を作る。ショートは不合格。':'合格条件：OFFで消灯、ONで点灯、どちらもショートなし。')+'</p>'+
 tracePanel+'<button type="button" class="builder-submit" data-builder-submit="1"'+(scientificComplete(task,tests,segments,route)?'':' disabled')+'>'+
 (direct?'🏆 時計塔の回路を完成させる':'🏆 設計を完成して灯台に光を戻す')+'</button></div></div></section>';
}
window.AkariBuilder={ids,terminals,edge,normalize,signature,evaluate,expected,expectedDirect,expectedFor,traceStatus,scientificComplete,render};
})();