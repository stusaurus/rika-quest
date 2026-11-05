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
function conductiveEdges(wires,on){
 return normalize(wires).concat(on?[["S","T"]]:[]);
}
function findPath(edges,from="P",to="N"){
 const graph=Object.fromEntries(ids.map(id=>[id,[]]));
 for(const [a,b] of edges){graph[a].push(b);graph[b].push(a)}
 const queue=[from],parents={[from]:null};
 for(let i=0;i<queue.length;i++){
  const current=queue[i];
  if(current===to){
   const result=[];let node=current;
   while(node!==null){result.unshift(node);node=parents[node]}
   return result;
  }
  for(const next of graph[current])if(!(next in parents)){parents[next]=current;queue.push(next)}
 }
 return [];
}
function reachedEdges(edges){
 const graph=Object.fromEntries(ids.map(id=>[id,[]]));
 for(const [a,b] of edges){graph[a].push(b);graph[b].push(a)}
 const queue=["P"],seen=new Set(queue);
 for(let i=0;i<queue.length;i++)for(const adjacent of graph[queue[i]])if(!seen.has(adjacent)){seen.add(adjacent);queue.push(adjacent)}
 return [...seen];
}
function diagnose(task,wires,switchOn){
 const result=evaluate(wires,task==="direct"?false:switchOn);
 if(result.short)return"short";
 if(task==="direct")return result.lit?null:"open";
 if(!switchOn&&result.lit)return"bypass";
 if(switchOn&&!result.lit)return"open";
 return null;
}
function evidence(task,wires,switchOn){
 const on=task!=="direct"&&!!switchOn,kind=diagnose(task,wires,switchOn),conductors=conductiveEdges(wires,on);
 if(kind==="short")return {kind,route:findPath(conductors),reachable:[]};
 if(kind==="bypass")return {kind,route:findPath([...conductors,["L","R"]]),reachable:[]};
 if(kind==="open")return {kind,route:[],reachable:reachedEdges(conductors)};
 const lit=evaluate(wires,on).lit;
 return {kind:lit?"lit":"normal",route:lit?findPath([...conductors,["L","R"]]):[],reachable:[]};
}
function diagnosisMessage(kind){
 if(kind==="short")return"豆電球を通らず、乾電池の＋と−が導線だけでつながってしまう危険な道があるよ。";
 if(kind==="bypass")return"スイッチをOFFにしたのに点灯するのは、閉じていないスイッチを通らず電球へ向かう別の道があるからだよ。";
 if(kind==="open")return"豆電球を光らせたいのに消えている。乾電池の＋極から電球を通って−極まで戻る道のどこかが切れているよ。";
 return"実験の結果は設計条件に合っているよ。";
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
function render(wires=[],selected=null,switchOn=false,tests={},task="switch",trace=[],insight=null){
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
     '<div class="builder-trace-edit"><button type="button" data-builder-trace-back="1"'+(route.length?'':' disabled')+'>↶ 1つ戻る</button><button type="button" data-builder-trace-reset="1"'+(route.length?'':' disabled')+'>↺ 最初から</button></div></div>'+
     (!direct&&!switchOn?'<p class="builder-trace-warning">通り道をたどるときは、先にスイッチをONにしよう。</p>':'')
  :'<p class="builder-trace-pending">まず安全な回路を作り、'+(direct?'通電実験で点灯を確かめよう。':'OFF・ONの両方を実験して確かめよう。')+'</p>')+'</div>';

 const simulation=evaluate(segments,direct?false:switchOn);
 const mode=direct?"single":switchOn?"on":"off";
 const recorded=tests[mode],measured=!!recorded&&recorded.signature===signature(segments);
 const issue=measured?diagnose(task,segments,direct?false:switchOn):null;
 const validInsight=!!issue&&insight?.mode===mode&&insight?.signature===signature(segments)&&insight.kind===issue;
 const physical=evidence(task,segments,direct?false:switchOn);
 const shownEvidence=measured&&(!issue||validInsight);
 const observedRoute=shownEvidence?physical.route:[];
 const routeDiagram=observedRoute.slice(1).map((node,i)=>{
  const from=observedRoute[i],one=terminals[from],two=terminals[node],key=edge(from,node),danger=physical.kind==="short";
  const d=key===edge("L","R")?"M888 118V340":
    key===edge("S","T")?"M382 118L555 118":
    "M"+one.x+" "+one.y+"L"+two.x+" "+two.y;
  return '<path class="builder-diagnostic-flow'+(danger?' danger':'')+'" d="'+d+'" stroke="'+(danger?'#ff9680':'#ffe78d')+'" stroke-width="9" fill="none" stroke-linecap="round" data-diagnostic-edge="'+key+'"/>';
 }).join("");
 const reached=issue==="open"&&validInsight?physical.reachable:[];
 const comparison=measured?'<div class="builder-comparison'+(issue?' mismatch':' match')+'"><strong>'+
 (issue?'⚠ 設計条件と違う結果！':'✓ この通電条件は成功！')+'</strong><span>'+
 (direct?'基本回路':switchOn?'スイッチON':'スイッチOFF')+'：'+
 (simulation.short?'ショート':simulation.lit?'点灯':'消灯')+' ／ 目標：'+(direct||switchOn?'点灯':'消灯')+'</span></div>':"";
 const diagnosisPanel=issue&&!validInsight?
  '<div class="builder-diagnosis"><strong>🕵️ どうして失敗した？</strong><p>実験結果とつないだ導線を見比べて、原因を推理しよう。</p>'+
   '<div class="builder-causes"><button type="button" data-builder-cause="open">電気の輪のどこかが切れている</button>'+
   (direct?'':'<button type="button" data-builder-cause="bypass">スイッチを通らない別の道がある</button>')+
   '<button type="button" data-builder-cause="short">電池の＋と−を直接つなぐ危険な道がある</button></div></div>':
 issue&&validInsight?
  '<div class="builder-diagnosis solved"><strong>🔎 原因を発見した！</strong><p>'+diagnosisMessage(issue)+'</p>'+
   '<p>'+(issue==="open"?'＋極から導線でつながる端子を光らせているよ。':'実際に電気が通る道を図に光で表示しているよ。')+'</p></div>':"";

 const glow=simulation.lit;
 const status=simulation.short?"⚠ ショート！ せんを はずそう":simulation.lit?"💡 ついている":"◯ きえている";
 const lineSvg=segments.map(([a,b],i)=>{
  const u=terminals[a],v=terminals[b];
  return '<g class="builder-line student-wire" data-student-wire="'+edge(a,b)+'"><path class="student-wire-outline" d="M'+u.x+' '+u.y+'L'+v.x+' '+v.y+'" fill="none" stroke="#fff" stroke-width="12" opacity=".76" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<path class="student-wire-ink" d="M'+u.x+' '+u.y+'L'+v.x+' '+v.y+'" fill="none" stroke="'+(i%2?"#b9e4e4":"#f2d69f")+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>';
 }).join("");
 const available=direct?ids.filter(id=>id!=="S"&&id!=="T"):ids;
 const buttons=available.map(id=>{
  const t=terminals[id];
  return '<button type="button" class="builder-terminal'+(selected===id?' selected':'')+(route.includes(id)?' traced':'')+(reached.includes(id)?' builder-reachable':'')+'" style="left:'+(100*t.x/1000)+'%;top:'+(100*t.y/460)+'%" data-builder-t="'+id+'" aria-label="'+t.name+' を選ぶ" aria-pressed="'+(selected===id)+'"><span>'+id+'</span></button>';
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
 '<div class="builder-layout"><div class="builder-panel"><p class="builder-help">丸から丸へ指で線を引こう。丸を2回タップしてもつなげるよ。画面を左右に動かせるよ。</p>'+
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
 lineSvg+'<g class="builder-diagnostic-path" aria-hidden="true">'+routeDiagram+'</g><g class="builder-proof-path">'+routeSvg+'</g></svg>'+buttons+'</div></div>'+
 '<div class="builder-bottom"><span>導線 '+segments.length+' 本</span><button type="button" data-builder-clear="1" class="builder-clear">導線を全部外す</button></div></div>'+
 '<div class="builder-panel"><h3>🔬 回路を検証する</h3><p class="builder-help">'+(direct?'つないだら すぐ つくよ。けっかを きろくしよう。':'スイッチOFFとONの けっかを きろくしよう。ショートは きけんだよ。')+'</p>'+
 switchControl+'<p class="builder-live">'+status+'</p>'+
 '<button type="button" data-builder-test="1" class="builder-test">✎ けっかを きろく</button>'+
 '<div class="builder-measures">'+statusBlocks+'</div>'+comparison+diagnosisPanel+
 '<p class="builder-hint">'+(direct?'合格条件：電球の2つの金属部分を通る、切れ目のない輪を作る。ショートは不合格。':'合格条件：OFFで消灯、ONで点灯、どちらもショートなし。')+'</p>'+
 tracePanel+'<button type="button" class="builder-submit" data-builder-submit="1"'+(scientificComplete(task,tests,segments,route)?'':' disabled')+'>'+
 (direct?'🏆 時計塔の回路を完成させる':'🏆 設計を完成して灯台に光を戻す')+'</button></div></div></section>';
}
window.AkariBuilder={ids,terminals,edge,normalize,signature,evaluate,diagnose,evidence,diagnosisMessage,expected,expectedDirect,expectedFor,traceStatus,scientificComplete,render};
})();