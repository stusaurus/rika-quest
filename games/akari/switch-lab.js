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
function expected(stage,wires,trials,reason){
 const target=stage===7?{"00":false,"10":false,"01":false,"11":true}:{"00":false,"10":true,"01":true,"11":true};
 const sig=signature(wires);
 return [7,8].includes(stage)&&reason===(stage===7?"both":"either")&&codes.every(code=>{
  const trial=trials?.[code],truth=evaluate(wires,code[0]==="1",code[1]==="1");
  return !!trial&&trial.signature===sig&&trial.safe&&!trial.short&&truth.safe&&trial.lit===target[code]&&truth.lit===target[code];
 });
}
function render(stage,wires=[],selected=null,a=false,b=false,trials={},reason=null){
 const wiring=normalize(wires),sig=signature(wiring),code=Number(a)+""+Number(b);
 const current=trials[code],result=evaluate(wiring,a,b),tested=current?.signature===sig;
 const lineArt=wiring.map(([u,v],i)=>`<path d="M${points[u].x} ${points[u].y}L${points[v].x} ${points[v].y}" stroke="${i%2?"#a8dedb":"#f1d49f"}" fill="none" stroke-width="6" stroke-linecap="round"/>`).join("");
 const controls=ids.map(id=>`<button type="button" data-net-t="${id}" class="builder-terminal ${selected===id?"selected":""}" style="left:${points[id].x/9.2}%;top:${points[id].y/4.45}%" aria-pressed="${selected===id}" aria-label="${points[id].name}">${id}</button>`).join("");
 const results=codes.map(k=>{
  const t=trials[k],valid=t?.signature===sig;
  return `<div class="network-trial ${valid?"measured":""}"><strong>A ${k[0]==="1"?"ON":"OFF"} ／ B ${k[1]==="1"?"ON":"OFF"}</strong><span>${valid?(t.short?"⚠ ショート":t.lit?"💡 点灯":"◯ 消灯"):"？ 未実験"}</span></div>`;
 }).join("");
 const count=codes.filter(k=>trials[k]?.signature===sig).length;
 const switchDrawing=(id,on,x,y)=>`<g><path d="M${x} ${y}L${x+168} ${on?y:y-28}" stroke="#ffdfa3" stroke-width="7" stroke-linecap="round" fill="none"/><text x="${x+84}" y="${y-47}" text-anchor="middle" font-size="22" fill="#e9f4e9">${id} ${on?"ON":"OFF"}</text></g>`;
 return `<section class="network-lab">
  <div class="builder-heading"><span>⚡ 街からの設計依頼</span><h3>${stage===7?"時計塔の二重ロック":"港の2か所スイッチ"}</h3>
  <p>${stage===7?"2つのスイッチが両方ONのときだけ点灯する回路を作ろう。":"どちらかのスイッチがONなら点灯する回路を作ろう。"}4通りを実験して確かめてね。</p></div>
  <div class="builder-layout">
   <div class="builder-panel"><p class="builder-help">端子を2つタップすると導線でつながる。つないだ2つをもう一度選ぶと外せるよ。</p>
   <div class="builder-nav"><button type="button" data-net-view="left">◀ 電池・スイッチ</button><button type="button" data-net-view="right">豆電球 ▶</button></div>
   <div class="builder-viewport network-viewport" tabindex="0" aria-label="乾電池、スイッチAとB、豆電球の回路設計図">
    <div class="builder-board network-board"><svg viewBox="0 0 920 445" role="img" aria-label="8端子の配線と2つのスイッチ">
    <rect width="920" height="445" rx="22" fill="#183d54"/>
    <rect x="39" y="156" width="72" height="122" rx="12" fill="#d6a56b" stroke="#f3dba0" stroke-width="4"/>
    <text x="75" y="222" fill="#fff5dc" font-size="23" text-anchor="middle">1.5V</text>
    ${switchDrawing("A",a,320,105)}${switchDrawing("B",b,320,318)}
    <path d="M820 105V157M820 273V330" stroke="#e4ede2" stroke-width="6"/>
    <circle cx="820" cy="215" r="57" fill="${tested&&result.lit?"#ffe6ad":"#86a4a9"}" fill-opacity=".85" stroke="#fff2d1" stroke-width="5"/>
    <path d="M791 187L849 243M849 187L791 243" stroke="#fef1d9" stroke-width="5"/>
    <text x="820" y="407" fill="#eaf3e6" font-size="20" text-anchor="middle">豆電球</text>${lineArt}</svg>${controls}</div>
   </div>
   <div class="builder-bottom"><strong>導線 ${wiring.length} 本</strong><button type="button" class="builder-clear" data-net-clear="1">導線をすべて外す</button></div>
  </div>
  <div class="builder-panel"><h3>🔬 4通りの通電実験</h3>
   <p class="builder-help">スイッチを1つずつ切り替えて結果を記録しよう。ショートは実物で試してはいけないよ。</p>
   <div class="network-switches"><button type="button" data-net-switch="a" aria-pressed="${a}" class="${a?"on":""}">A：${a?"ON":"OFF"}</button><button type="button" data-net-switch="b" aria-pressed="${b}" class="${b?"on":""}">B：${b?"ON":"OFF"}</button></div>
   <p class="builder-live">${tested?(result.short?"⚠ ショート！":result.lit?"💡 点灯":"◯ 消灯"):"？ 通電前"}</p>
   <button type="button" data-net-test="1" class="builder-test">⚡ この組み合わせを実験</button>
   <div class="network-results">${results}</div>
   ${count===4?`<div class="network-reason"><strong>🧠 4つの結果から、なぜ点灯する？</strong>
    <button type="button" data-net-reason="both" class="${reason==="both"?"chosen":""}">直列：2つともONで一本道がつながる</button>
    <button type="button" data-net-reason="either" class="${reason==="either"?"chosen":""}">並列：どちらかの道がつながればよい</button>
   </div>`:`<p class="builder-hint">実験 ${count} / 4。4通りの結果を比べよう。</p>`}
   <button type="button" data-net-submit="1" class="builder-submit" ${expected(stage,wiring,trials,reason)?"":"disabled"}>🏆 設計を完成する</button>
  </div></div></section>`;
}
window.AkariSwitchLab={points,ids,edge,normalize,signature,evaluate,expected,render,codes};
})();
