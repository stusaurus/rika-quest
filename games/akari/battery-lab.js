"use strict";
(function(){
/* Akari Battery Expedition: virtual, controlled classroom models.
 * M9: two new alkaline cells of same chemistry, same rated 1.5V, same lamp.
 *    Later-time values are illustrations, not calibrated capacity measurements.
 * M10: ratings matter; an overvoltage case is a warning simulation only.
 * M11: matched cells in series, ordinary non-polar filament lamp.
 * Real short, overheating, and mismatched lamp experiments are prohibited.
 */
const outcomes={
 bright:"💡 点灯",dim:"🌙 弱い光",dark:"◯ 消灯",risk:"⚠ 定格超過の危険"
};
const colors={bright:"#ffe9a3",dim:"#f8dfba",dark:"#52768a",risk:"#ffc4a0"};
const reasons={
 9:[
  ["voltage","同じ種類の新品乾電池では、大きさが違っても表示の公称電圧はともに1.5V"],
  ["size","大きい乾電池のほうが、電池1個の電圧は必ず高い"],
  ["shape","乾電池の太さで、豆電球の明るさは最初から決まる"]
 ],
 10:[
  ["series","同じ向きの同種の乾電池を直列につなぐと電圧は加わる。豆電球の定格にも合わせる"],
  ["always","電池を増やせば、どんな豆電球でも安全に明るくできる"],
  ["weight","豆電球を明るくするのは、電池が重くなるから"]
 ],
 11:[
  ["cancel","同じ乾電池2個を逆向きに直列につなぐと電圧が打ち消し合う。普通の豆電球は1個なら向きに関係なく光る"],
  ["bulb","豆電球は電気が逆方向に流れると必ず消える"],
  ["size","向きを逆にすると乾電池そのものの大きさが減る"]
 ]
};
const configs={
 9:[
  {id:"small:early",size:"small",phase:"early",label:"単4形・点灯直後",actual:"bright",shownVoltage:"1.5V"},
  {id:"large:early",size:"large",phase:"early",label:"単1形・点灯直後",actual:"bright",shownVoltage:"1.5V"},
  {id:"small:late",size:"small",phase:"late",label:"単4形・長時間後",actual:"dim",shownVoltage:"電池の残量による"},
  {id:"large:late",size:"large",phase:"late",label:"単1形・長時間後",actual:"bright",shownVoltage:"電池の残量による"}
 ],
 10:[
  {id:"one:1.5",cells:"one",rating:"1.5",label:"1個・1.5V用電球",actual:"bright",voltage:1.5},
  {id:"one:3",cells:"one",rating:"3",label:"1個・3V用電球",actual:"dim",voltage:1.5},
  {id:"two:3",cells:"two",rating:"3",label:"2個直列・3V用電球",actual:"bright",voltage:3},
  {id:"two:1.5",cells:"two",rating:"1.5",label:"2個直列・1.5V用電球",actual:"risk",voltage:3}
 ],
 11:[
  {id:"one:forward",cells:"one",direction:"forward",label:"乾電池1個・通常の向き",actual:"bright",voltage:1.5},
  {id:"one:reverse",cells:"one",direction:"reverse",label:"乾電池1個・逆向き",actual:"bright",voltage:-1.5},
  {id:"two:aligned",cells:"two",direction:"aligned",label:"乾電池2個・そろえた向き",actual:"bright",voltage:3},
  {id:"two:opposed",cells:"two",direction:"opposed",label:"乾電池2個・互いに逆向き",actual:"dark",voltage:0}
 ]
};
function all(stage){return configs[stage]||[]}
function get(stage,id){return all(stage).find(x=>x.id===id)||null}
function model(stage,id){const c=get(stage,id);return c?{kind:c.actual,lit:c.actual==="bright"||c.actual==="dim",voltage:c.voltage??null,warning:c.actual==="risk",id:c.id}:null}
function initial(stage){
 return {
  size:"small",phase:"early",cells:"one",rating:"1.5",direction:"forward",
  guess:null,trials:{},reason:null,choice:null,serviceGuess:null,service:null
 };
}
function selectedId(stage,s){
 if(stage===9)return s.size+":"+s.phase;
 if(stage===10)return s.cells+":"+s.rating;
 return s.cells+":"+s.direction;
}
function deployment(stage,id){if(stage===9)return id==="large";if(stage===10)return id==="two:3";return id==="two:aligned"}
function normalize(stage,raw){
 const s=initial(stage);if(!raw||typeof raw!=="object")return s;
 if(["small","large"].includes(raw.size))s.size=raw.size;
 if(["early","late"].includes(raw.phase))s.phase=raw.phase;
 if(["one","two"].includes(raw.cells))s.cells=raw.cells;
 if(["1.5","3"].includes(raw.rating))s.rating=raw.rating;
 if(["forward","reverse","aligned","opposed"].includes(raw.direction))s.direction=raw.direction;
 // A one-cell circuit cannot use two-cell orientations and vice versa.
 if(s.cells==="one"&&["aligned","opposed"].includes(s.direction))s.direction="forward";
 if(s.cells==="two"&&["forward","reverse"].includes(s.direction))s.direction="aligned";
 if(["bright","dim","dark","risk"].includes(raw.guess))s.guess=raw.guess;
 const allowed={9:["bright","dim"],10:["bright","dim","risk"],11:["bright","dark"]}[stage];
 if(!allowed.includes(s.guess))s.guess=null;
 for(const c of all(stage)){
  const t=raw.trials?.[c.id];
  if(t&&allowed.includes(t.guess)&&t.actual===c.actual)
   s.trials[c.id]={guess:t.guess,actual:c.actual};
 }
 if(reasons[stage].some(([key])=>key===raw.reason))s.reason=raw.reason;
 const options=stage===9?["large","small"]:stage===10?["one:3","two:3","two:1.5"]:["two:aligned","two:opposed","one:reverse"];
 if(options.includes(raw.choice))s.choice=raw.choice;
 if(["bright","dim","dark","risk"].includes(raw.serviceGuess))s.serviceGuess=raw.serviceGuess;
 const expected=stage===9?null:model(stage,s.choice);
 const actual=stage===9?(s.choice==="large"?"bright":"dim"):expected?.kind;
 if(s.choice&&raw.service?.choice===s.choice&&raw.service?.guess===s.serviceGuess&&raw.service?.actual===actual){
  s.service={choice:s.choice,guess:s.serviceGuess,actual};
 }
 return s;
}
function evidence(stage,raw){
 const s=normalize(stage,raw);
 return all(stage).every(c=>Boolean(s.trials[c.id]));
}
function serviceActual(stage,choice){
 if(stage===9)return choice==="large"?"bright":choice==="small"?"dim":null;
 return model(stage,choice)?.kind||null;
}
function canFinish(stage,raw){
 const s=normalize(stage,raw);
 return evidence(stage,s)&&s.reason===({9:"voltage",10:"series",11:"cancel"}[stage])&&
   deployment(stage,s.choice)&&s.service?.choice===s.choice&&s.service?.guess===s.service?.actual&&
   s.service?.actual===serviceActual(stage,s.choice);
}
function fieldLabel(stage,field,value){
 const records={
  size:{small:"単4形 1.5V",large:"単1形 1.5V"},
  phase:{early:"点灯直後",late:"長時間後"},
  cells:{one:"乾電池1個",two:"乾電池2個を直列"},
  rating:{"1.5":"1.5V用の豆電球","3":"3V用の豆電球"},
  direction:{forward:"通常の向き",reverse:"1個を逆向き",aligned:"2個を同じ向き",opposed:"2個を互いに逆向き"}
 };
 return records[field]?.[value]||value;
}
function svg(stage,c,showResult){
 const result=model(stage,c.id),lit=Boolean(showResult&&result?.lit),
   count=stage===9?1:(c.cells==="two"?2:1),
   unitWidth=count===2?88:116,space=count===2?22:0,
   start=count===2?167:225,
   end=start+count*unitWidth+(count-1)*space,
   bulbColor=showResult?(result?.warning?"#edb39e":result?.kind==="dim"?"#d9c6a5":lit?"#ffe6a5":"#31586f"):"#31586f",
   wireInk=lit?"#ffe6ab":"#92c3d1";
 let source="";
 for(let unit=0;unit<count;unit++){
  const x=start+unit*(unitWidth+space);
  const reversed=stage===11&&(c.direction==="reverse"||(c.direction==="opposed"&&unit===1));
  const h=stage===9&&c.size==="small"?30:42,top=69-h/2;
  source+='<g data-cell="'+unit+'"><rect x="'+x+'" y="'+top+'" width="'+unitWidth+'" height="'+h+'" rx="9" fill="'+(stage===9&&c.size==="large"?"#d3a06e":"#c47961")+'" stroke="#ffe3b3" stroke-width="3"/>'+
  '<rect x="'+(reversed?x-9:x+unitWidth-3)+'" y="61" width="12" height="16" rx="3" fill="#f7e3a7"/>'+
  '<text x="'+(x+unitWidth/2)+'" y="74" fill="#fffdf1" text-anchor="middle" font-size="16" font-weight="900">1.5V</text>'+
  '<text x="'+(x-15)+'" y="96" text-anchor="middle" fill="#ffefd0" font-size="13">'+(reversed?"＋":"−")+'</text>'+
  '<text x="'+(x+unitWidth+15)+'" y="96" text-anchor="middle" fill="#ffefd0" font-size="13">'+(reversed?"−":"＋")+'</text></g>';
 }
 if(count===2)source+='<path d="M'+(start+unitWidth)+' 69H'+(start+unitWidth+space)+'" stroke="#f0ddbb" stroke-width="7"/>';
 return '<svg class="battery-lab-svg" role="img" aria-label="乾電池の端子から導線、豆電球の金属接点を通り、乾電池に戻る回路。電池2個の場合は直列つなぎ。" viewBox="0 0 660 300">'+
 '<rect width="660" height="300" rx="18" fill="#123146"/>'+
 '<path d="M'+start+' 69H92V254H521V206M521 94V69H'+end+'" stroke="'+wireInk+'" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'+
 source+
 '<text x="'+(start+(end-start)/2)+'" y="125" fill="#d3eef1" text-anchor="middle" font-size="13">'+(count===2?"2個の乾電池を直列":"乾電池1個")+'</text>'+
 (stage===9?'<text x="'+(start+(end-start)/2)+'" y="144" fill="#e3f4e5" text-anchor="middle" font-size="12">'+(c.size==="small"?"単4形":"単1形")+'・公称1.5V</text>':"")+
 '<circle cx="521" cy="150" r="56" fill="'+bulbColor+'" stroke="#e7ebda" stroke-width="5"/>'+
 '<path d="M499 129L542 172M542 129L499 172" stroke="'+(lit?"#a37539":"#c2d9dc")+'" stroke-width="6" fill="none"/>'+
 '<circle cx="521" cy="94" r="8" fill="#fceac6"/><circle cx="521" cy="206" r="8" fill="#fceac6"/>'+
 '<text x="521" y="235" text-anchor="middle" fill="#fff4dc" font-size="13">豆電球</text>'+
 (stage===10?'<text x="521" y="272" fill="#e2f1ec" text-anchor="middle" font-size="12">定格 '+c.rating+'V用</text>':"")+
 (stage===11?'<text x="297" y="163" fill="#dbeedc" text-anchor="middle" font-size="13">'+(c.direction==="opposed"?"互いに逆向きの直列つなぎ":c.direction==="aligned"?"同じ向きの直列つなぎ":"乾電池1個の向きの比較")+'</text>':"")+
 '<text x="20" y="289" fill="#d3edf2" font-size="12">'+(showResult?(result.warning?"仮想判定：定格超過の危険":result.kind==="dim"?"仮想判定：弱い光":result.kind==="dark"?"仮想判定：消灯":"仮想判定：点灯"):"仮想実験前：結果を予想しよう")+'</text>'+
 '</svg>';
}

function buttonData(field,value,label,selected){
 return '<button type="button" class="battery-option'+(selected===value?" chosen":"")+'" data-battery-field="'+field+'" data-battery-value="'+value+'" aria-pressed="'+(selected===value)+'">'+label+'</button>';
}
function title(stage){
 return {9:"港の電池研究所",10:"博物館の電源設計",11:"逆さま電池の謎"}[stage];
}
function instruction(stage){
 return {
  9:"同じ種類の新品乾電池と同じ豆電球で実験。点灯直後の明るさだけでなく、同じ使い方を続けた後の光り方も比べよう。",
  10:"1.5V・3V用の豆電球を使い分け、乾電池1個と2個直列の効果を調べる。定格を超える場合は危険の判定だけを画面内で示す。",
  11:"同じ乾電池2個の互いの向きを変えると何が起きる？1個を逆にした場合とも比較して、消灯の原因を説明しよう。"
 }[stage];
}
function selection(stage,s){
 const fields=stage===9?[["size",["small","large"]],["phase",["early","late"]]]:stage===10?[["cells",["one","two"]],["rating",["1.5","3"]]]:[["cells",["one","two"]],["direction",s.cells==="one"?["forward","reverse"]:["aligned","opposed"]]];
 return fields.map(([f,options])=>'<div class="battery-control-set"><strong>'+(f==="size"?"乾電池":f==="phase"?"時間":f==="cells"?"電池の数":f==="rating"?"豆電球の定格":"乾電池の向き")+'</strong><div class="battery-options">'+options.map(value=>buttonData(f,value,fieldLabel(stage,f,value),s[f])).join("")+'</div></div>').join("");
}
function cards(stage,s){
 return all(stage).map(c=>{
  const result=s.trials[c.id];
  return '<div class="battery-record'+(result?" tested":"")+'"><strong>'+c.label+'</strong><span>'+(result?"予想 "+outcomes[result.guess]+" ／ 実験 "+outcomes[result.actual]:"？ まだ実験していない")+'</span></div>';
 }).join("");
}
function serviceOptions(stage){
 return stage===9?[["small","単4形を設置"],["large","単1形を設置"]]:
  stage===10?[["one:3","1個＋3V用豆電球"],["two:3","2個直列＋3V用豆電球"],["two:1.5","2個直列＋1.5V用豆電球"]]:
 [["one:reverse","1個を逆向き"],["two:opposed","2個を互いに逆向き"],["two:aligned","2個を同じ向き"]];
}
function serviceText(stage){
 return stage===9?"長時間使う港の非常用灯。今回の実験結果から、点灯し続けた組み合わせを採用しよう。":
  stage===10?"博物館の3V用豆電球を、定格に合わせて安全に点灯させたい。どの電源を選ぶ？":
  "展示ケースは乾電池2個の装置。豆電球に光を戻すには、どの向きが必要？";
}
function render(stage,raw){
 const s=normalize(stage,raw),config=get(stage,selectedId(stage,s)),observed=s.trials[config.id],allDone=evidence(stage,s);
 const reason=(reasons[stage]||[]).map(([id,label])=>'<button type="button" class="battery-reason'+(s.reason===id?" chosen":"")+'" data-battery-reason="'+id+'" aria-pressed="'+(s.reason===id)+'">'+label+'</button>').join("");
 const guessChoices=(stage===9?["bright","dim"]:stage===10?["bright","dim","risk"]:["bright","dark"]);
 const predictions='<div class="battery-predictions">'+guessChoices.map(k=>'<button type="button" class="'+(s.guess===k?" chosen":"")+'" data-battery-guess="'+k+'" aria-pressed="'+(s.guess===k)+'" '+(observed?"disabled":"")+'>'+outcomes[k]+'</button>').join("")+'</div>';
 const service=allDone?'<section class="lab-panel battery-section"><h3>② 実験結果を使って現場を救う</h3><p class="lab-sub">'+serviceText(stage)+'</p>'+
 '<div class="battery-service-options">'+serviceOptions(stage).map(([id,label])=>'<button class="battery-option'+(s.choice===id?" chosen":"")+'" type="button" data-battery-service="'+id+'" aria-pressed="'+(s.choice===id)+'">'+label+'</button>').join("")+'</div>'+
 (s.choice?'<div class="battery-service-predict"><strong>この設備をつなぐとどうなる？</strong><div class="battery-predictions">'+
 ["bright","dim","dark",...(stage===10?["risk"]:[])].map(k=>'<button type="button" class="'+(s.serviceGuess===k?" chosen":"")+'" data-battery-service-guess="'+k+'" aria-pressed="'+(s.serviceGuess===k)+'">'+outcomes[k]+'</button>').join("")+
 '</div><button class="battery-test" type="button" data-battery-service-test '+(!s.serviceGuess?"disabled":"")+'>🔬 現場で仮想通電</button></div>':"")+
 (s.service?'<div class="battery-result" role="status">予想：'+outcomes[s.service.guess]+' ／ 実際：'+outcomes[s.service.actual]+(s.service.guess===s.service.actual?"。実験結果と一致！":"。予想と違った。記録を見直そう。")+'</div>':"")+
 '<div class="battery-science"><h3>③ なぜそうなる？</h3><p class="lab-sub">3つの科学的な説明のうち、実験記録と合うものを選ぼう。</p>'+reason+'</div>'+
 '<p class="lab-sub">現場の実験結果・理由の説明がそろったら、画面下の「点灯のしくみを確認」で完了。</p></section>':"";
 return '<div class="battery-expedition"><div class="battery-head"><span class="eyebrow">🔋 ミッション '+stage+' / 14</span><strong>'+title(stage)+'</strong><small>実験記録 '+Object.keys(s.trials).length+' / '+all(stage).length+'</small></div>'+
 '<div class="battery-caution">※ 仮想実験です。電池をショートさせたり、定格を超える豆電球を実物で試したりしないでね。'+(stage===9?"乾電池の持続時間は容量や使い方で変わるため、長時間後の結果は一例です。":"")+'</div>'+
 '<section class="lab-panel battery-section"><h3>① 条件を決め、予想してから実験する</h3><p class="lab-sub">'+instruction(stage)+'</p><div class="battery-controls">'+selection(stage,s)+'</div>'+
 '<div class="battery-diagram">'+svg(stage,config,!!observed)+'</div>'+
 '<div class="battery-predict-card"><strong>🔮 '+config.label+'：豆電球はどうなる？</strong>'+
 (observed?'<div class="battery-result">予想：'+outcomes[observed.guess]+' ／ 実際：'+outcomes[observed.actual]+(observed.guess===observed.actual?"。予想どおり。":"。予想と違っても大切な発見！")+'</div>':predictions+
 '<button type="button" class="battery-test" data-battery-test '+(!s.guess?"disabled":"")+'>⚡ 安全な仮想実験で確認する</button>')+
 '</div><div class="battery-notebook"><strong>📖 実験ノート</strong>'+cards(stage,s)+'</div></section>'+service+'</div>';
}
window.AkariBatteryLab={configs,outcomes,reasons,all,get,model,initial,normalize,evidence,canFinish,selectedId,serviceActual,render,svg};
})();
