"use strict";
(function SwitchWorkshop(){
const points={
 P:{name:"乾電池＋",x:75,y:108},N:{name:"乾電池−",x:75,y:330},
 A1:{name:"A入口",x:320,y:105},A2:{name:"A出口",x:488,y:105},
 B1:{name:"B入口",x:320,y:318},B2:{name:"B出口",x:488,y:318},
 L:{name:"電球の横",x:820,y:105},R:{name:"電球の底",x:820,y:330}
};
const ids=Object.keys(points),codes=["00","10","01","11"];
const edge=(a,b)=>[a,b].sort().join("-");
function normalize(wires){
 const seen=new Set();
 return (Array.isArray(wires)?wires:[]).filter(p=>{
 if(!Array.isArray(p)||p.length!==2||p[0]===p[1]||!ids.includes(p[0])||!ids.includes(p[1]))return false;
 const id=edge(p[0],p[1]);if(seen.has(id))return false;seen.add(id);return true;
 }).map(p=>p.slice()).slice(0,16);
}
const signature=wires=>normalize(wires).map(p=>edge(...p)).sort().join("|");
function reaches(start,end,parts){
 const graph=Object.fromEntries(ids.map(k=>[k,[]]));
 for(const [a,b] of parts){graph[a].push(b);graph[b].push(a)}
 const seen=new Set([start]),queue=[start];
 for(let i=0;i<queue.length;i++){
  const node=queue[i];if(node===end)return true;
  for(const next of graph[node])if(!seen.has(next)){queue.push(next);seen.add(next)}
 }
 return false;
}
function evaluate(wires,a,b){
 const conductors=normalize(wires);
 if(a)conductors.push(["A1","A2"]);
 if(b)conductors.push(["B1","B2"]);
 const short=reaches("P","N",conductors);
 return {short,safe:!short,lit:!short&&reaches("P","N",[...conductors,["L","R"]])};
}
function conductors(wires,a,b){
 const parts=normalize(wires);
 if(a)parts.push(["A1","A2"]);
 if(b)parts.push(["B1","B2"]);
 return parts;
}
function findPath(start,end,edges){
 const graph=Object.fromEntries(ids.map(k=>[k,[]]));
 for(const [a,b] of edges){graph[a].push(b);graph[b].push(a)}
 const queue=[start],parent={[start]:null};
 for(let i=0;i<queue.length;i++){
  const at=queue[i];
  if(at===end){const route=[];let node=at;while(node!==null){route.unshift(node);node=parent[node]}return route}
  for(const next of graph[at])if(!(next in parent)){parent[next]=at;queue.push(next)}
 }
 return [];
}
function pathEvidence(wires,a,b){
 const active=conductors(wires,a,b);
 const simulated=evaluate(wires,a,b);
 if(simulated.short)return {kind:"short",route:findPath("P","N",active)};
 if(simulated.lit)return {kind:"lit",route:findPath("P","N",[...active,["L","R"]])};
 return {kind:"open",route:[]};
}
function reachableContacts(wires,a,b){
 const active=conductors(wires,a,b),graph=Object.fromEntries(ids.map(k=>[k,[]]));
 for(const [x,y] of active){graph[x].push(y);graph[y].push(x)}
 const visited=new Set(["P"]),queue=["P"];
 for(let i=0;i<queue.length;i++)for(const node of graph[queue[i]])if(!visited.has(node)){visited.add(node);queue.push(node)}
 return [...visited];
}
function discrepancy(stage,wires,a,b){
 const reality=evaluate(wires,a,b),code=Number(a)+""+Number(b);
 const shouldLight=stage===7?code==="11":code!=="00";
 if(reality.short)return"short";
 if(reality.lit&&!shouldLight)return"bypass";
 if(!reality.lit&&shouldLight)return"open";
 return null;
}
function diagnosticMessage(kind){
 return kind==="short"?"豆電球を通らず、乾電池の＋と−を導線と閉じたスイッチだけでつなぐ危険な道があるよ。":
  kind==="bypass"?"消すべき組み合わせでも電球に電気が通っている。スイッチを通らない道や、別の回り道がないか調べよう。":
  kind==="open"?"光らせたい組み合わせでも、豆電球を通って乾電池に戻る輪ができていないよ。接点と閉じたスイッチの道をたどろう。":
  "まず4通りの実験で配線の働きを確かめよう。";
}
function expected(stage,wires,trials,reason){
 const target=stage===7?{"00":false,"10":false,"01":false,"11":true}:{"00":false,"10":true,"01":true,"11":true};
 const sig=signature(wires);
 return [7,8].includes(stage)&&reason===(stage===7?"both":"either")&&codes.every(code=>{
  const trial=trials?.[code],truth=evaluate(wires,code[0]==="1",code[1]==="1");
  return !!trial&&trial.signature===sig&&trial.safe&&!trial.short&&truth.safe&&trial.lit===target[code]&&truth.lit===target[code];
 });
}
function render(stage,wires=[],selected=null,a=false,b=false,trials={},reason=null,insight=null){
 const wiring=normalize(wires),sig=signature(wiring),code=Number(a)+""+Number(b);
 const current=trials[code],result=evaluate(wiring,a,b),tested=current?.signature===sig;
 const problem=tested?discrepancy(stage,wiring,a,b):null;
 const insightSolved=!!problem&&insight?.code===code&&insight.signature===sig&&insight.kind===problem;
 const evidence=pathEvidence(wiring,a,b);
 const illuminated=tested&&((result.lit&&!problem)||insightSolved);
 const route=illuminated?evidence.route:[];
 const routeArt=route.slice(1).map((node,i)=>{
  const from=route[i],u=points[from],v=points[node],id=edge(from,node),danger=evidence.kind==="short",tone=danger?"#ff9f89":"#ffeb8b";
  const drawn=id===edge("L","R")?"M820 105V159 M820 273V330":"M"+u.x+" "+u.y+"L"+v.x+" "+v.y;
  return '<path class="network-flow-segment'+(danger?' danger':'')+'" d="'+drawn+'" fill="none" stroke="'+tone+'" stroke-width="10" stroke-linecap="round" data-flow-edge="'+id+'"/>';
 }).join("");
 const inspection=problem&&!insightSolved?'<div class="network-diagnosis"><strong>🕵️ 結果が設計条件と違う！原因を推理しよう</strong><p>配線した導線と、ON・OFFの状態を見比べよう。原因に近いものを選んでね。</p>'+
   '<div class="network-causes"><button type="button" data-net-cause="open">どこかの接点で電気の輪が切れている</button>'+
   '<button type="button" data-net-cause="bypass">必要なスイッチを通らない別の道がある</button>'+
   '<button type="button" data-net-cause="short">豆電球を通らない危険な直結がある</button></div></div>':
   problem&&insightSolved?'<div class="network-diagnosis solved"><strong>🔎 診断成功！</strong><p>'+diagnosticMessage(problem)+'</p>'+
    '<p>'+(problem==="open"?"乾電池の＋極から届く端子を図に表示しているよ。":"実際に電気が通る道を図に光で表示しているよ。")+'</p></div>':"";
 const targetResult=stage===7?code==="11":code!=="00";
 const comparison=tested?'<div class="network-comparison '+(problem?"mismatch":"match")+'" role="status">'+
  '<span>今回：'+(result.short?"危険：ショート":result.lit?"点灯":"消灯")+' ／ 目標：'+(targetResult?"点灯":"消灯")+'</span>'+
  '<strong>'+(problem?"⚠ 条件と合わない":"✓ この組み合わせは成功")+'</strong></div>':"";
 const reachable=problem==="open"&&insightSolved?reachableContacts(wiring,a,b):[];

 const lineArt=wiring.map(([u,v],i)=>`<g class="network-line student-wire" data-student-wire="${edge(u,v)}"><path class="student-wire-outline" d="M${points[u].x} ${points[u].y}L${points[v].x} ${points[v].y}" stroke="#fff" opacity=".82" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path class="student-wire-ink" d="M${points[u].x} ${points[u].y}L${points[v].x} ${points[v].y}" stroke="${i%2?"#a8dedb":"#f1d49f"}" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`).join("");
 const controls=ids.map(id=>`<button type="button" data-net-t="${id}" class="builder-terminal ${selected===id?"selected":""} ${reachable.includes(id)?"network-reachable":""}" style="left:${points[id].x/9.2}%;top:${points[id].y/4.45}%" aria-pressed="${selected===id}" aria-label="${points[id].name}">${id}</button>`).join("");
 const results=codes.map(k=>{
  const t=trials[k],valid=t?.signature===sig;
  const stateA=k[0]==="1"?"ON":"OFF",stateB=k[1]==="1"?"ON":"OFF";
  const outcome=valid?(t.short?"⚠ ショート":t.lit?"💡 つく":"◯ きえる"):"❔ まだ";
  const spoken=valid?(t.short?"ショート":t.lit?"点灯":"消灯"):"まだ観察していない";
  return `<button type="button" class="network-trial ${valid?"measured":""} ${code===k?"current":""}"
   data-net-case="${k}" aria-pressed="${code===k}" ${wiring.length?"":"disabled"}
   aria-label="スイッチA ${stateA}、B ${stateB}：${spoken}。この組み合わせにする">
   <span class="network-trial-switches"><span>A <b class="${stateA==="ON"?"on":""}">${stateA}</b></span><span>B <b class="${stateB==="ON"?"on":""}">${stateB}</b></span></span>
   <span class="network-trial-outcome">${outcome}</span></button>`;
 }).join("");
 const count=codes.filter(k=>trials[k]?.signature===sig).length;
 const observedProgress='<div class="network-observed" role="status"><span>📒 みた けっか <strong>'+count+' / 4</strong></span>'+
  '<span class="network-observed-dots" aria-hidden="true">'+codes.map(k=>'<i class="'+(trials[k]?.signature===sig?"done":"")+'"></i>').join("")+'</span></div>';
 const switchDrawing=(id,on,x,y)=>`<g><path d="M${x} ${y}L${x+168} ${on?y:y-28}" stroke="#ffdfa3" stroke-width="7" stroke-linecap="round" fill="none"/><text x="${x+84}" y="${y-47}" text-anchor="middle" font-size="22" fill="#e9f4e9">${id} ${on?"ON":"OFF"}</text></g>`;
 return `<section class="network-lab${expected(stage,wiring,trials,reason)?" network-ready":""}">
  <div class="builder-heading"><span>⚡ 街からの設計依頼</span><h3>${stage===7?"時計塔の二重ロック":"港の2か所スイッチ"}</h3>
  <p>${stage===7?"2つのスイッチが両方ONのときだけ点灯する回路を作ろう。":"どちらかのスイッチがONなら点灯する回路を作ろう。"}4通りを実験して確かめてね。</p></div>
  <div class="builder-layout">
   <div class="builder-panel"><p class="builder-help">丸から丸へ線を引こう。2回タップでもつなげるよ。</p>
   <div class="builder-nav"><button type="button" data-net-view="left">◀ 電池・スイッチ</button><button type="button" data-net-view="right">豆電球 ▶</button></div>
   <div class="builder-viewport network-viewport" tabindex="0" aria-label="乾電池、スイッチAとB、豆電球の回路設計図">
    <div class="builder-board network-board"><svg viewBox="0 0 920 445" role="img" aria-label="8端子の配線と2つのスイッチ">
    <rect width="920" height="445" rx="22" fill="#183d54"/>
    <rect x="39" y="156" width="72" height="122" rx="12" fill="#d6a56b" stroke="#f3dba0" stroke-width="4"/>
    <text x="75" y="222" fill="#fff5dc" font-size="23" text-anchor="middle">1.5V</text>
    ${switchDrawing("A",a,320,105)}${switchDrawing("B",b,320,318)}
    <path d="M820 105V157M820 273V330" stroke="#e4ede2" stroke-width="6"/>
    <circle cx="820" cy="215" r="57" fill="${result.lit?"#ffe6ad":"#86a4a9"}" fill-opacity=".85" stroke="#fff2d1" stroke-width="5"/>
    <path d="M791 187L849 243M849 187L791 243" stroke="#fef1d9" stroke-width="5"/>
    <text x="820" y="407" fill="#eaf3e6" font-size="20" text-anchor="middle">豆電球</text>${lineArt}<g class="network-flow-layer" aria-hidden="true">${routeArt}</g></svg>${controls}</div>
   </div>
   <div class="builder-bottom"><strong>導線 ${wiring.length} 本</strong><button type="button" class="builder-clear" data-net-clear="1">導線をすべて外す</button></div>
  </div>
  <div class="builder-panel"><h3>🔬 4通りの通電実験</h3>
   <p class="builder-help">スイッチを うごかして 4つの けっかを くらべよう。</p>
   <div class="network-switches"><button type="button" data-net-switch="a" aria-pressed="${a}" class="${a?"on":""}">A：${a?"ON":"OFF"}</button><button type="button" data-net-switch="b" aria-pressed="${b}" class="${b?"on":""}">B：${b?"ON":"OFF"}</button></div>
   <p class="builder-live">${result.short?"⚠ ショート！":result.lit?"💡 ついている":"◯ きえている"}</p>
   ${observedProgress}
   <p class="network-choice-note">カードを おすと スイッチが かわるよ</p>
   ${comparison}<div class="network-results" role="group" aria-label="4通りのスイッチの組み合わせ">${results}</div>${inspection}
   ${count===4?`<div class="network-reason"><strong>🧠 4つの結果から、なぜ点灯する？</strong>
    <button type="button" data-net-reason="both" class="${reason==="both"?"chosen":""}">直列：2つともONで一本道がつながる</button>
    <button type="button" data-net-reason="either" class="${reason==="either"?"chosen":""}">並列：どちらかの道がつながればよい</button>
   </div>`:`<p class="builder-hint">${wiring.length?"あと "+(4-count)+"つ の けっかを みよう":"まず どう線を つなごう"}</p>`}
   ${expected(stage,wiring,trials,reason)?'<div class="network-power-ready" aria-live="polite"><span class="network-power-dot">✦</span><strong>街の電気設備の準備が整った！</strong><small>4通りの働きが設計条件と一致しているよ。</small></div>':""}
   <button type="button" data-net-submit="1" class="builder-submit" ${expected(stage,wiring,trials,reason)?"":"disabled"}>🏆 設計を完成する</button>
  </div></div></section>`;
}
window.AkariSwitchLab={points,ids,edge,normalize,signature,evaluate,expected,conductors,findPath,pathEvidence,reachableContacts,discrepancy,diagnosticMessage,render,codes};
})();
