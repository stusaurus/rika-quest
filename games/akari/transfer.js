"use strict";
(function(){
/*
 * The transfer puzzle data deliberately uses situations different from each
 * mission's demonstration. The rule is first applied, then explained.
 * The lamp is drawn unlit in every probe so the picture never leaks the answer.
 */
const puzzles={
 2:{title:"街灯の分かれ道",intro:"別の街灯も消えてしまった。配線図から、点灯するか予想しよう。",choices:["lit","dark"],
 probes:[
  {id:"a",name:"街灯A：＋極と電球の横だけをつないだ",diagram:"open",answer:"dark"},
  {id:"b",name:"街灯B：＋極を横、−極を底につないだ",diagram:"loop",answer:"lit"},
  {id:"c",name:"街灯C：＋極を底、−極を横につないだ",diagram:"reverseLoop",answer:"lit"}
 ],reasons:[
  ["path","乾電池の＋と−が、豆電球の2つの接点を通る輪になっているかが大切"],
  ["plus","＋極が電球に触れていれば、−極をつながなくても光る"],
  ["direction","豆電球は＋極を横につながないと絶対に光らない"]
 ],correct:"path",discovery:"豆電球の横と底の2つの金属接点が回路につながれば、乾電池1個の向きは逆でも点灯する。"},
 5:{title:"見た目にだまされない！",intro:"同じ色の物でも、材料は違う。配線のすき間にはさんだときの結果を予想しよう。",choices:["lit","dark"],
 probes:[
  {id:"a",name:"銀色のプラスチック定規をはさむ",diagram:"plastic",answer:"dark"},
  {id:"b",name:"小さな鉄のクリップをはさむ",diagram:"clip",answer:"lit"},
  {id:"c",name:"薄いアルミはくをはさむ",diagram:"foil",answer:"lit"}
 ],reasons:[
  ["look","銀色で光っている物は、どれでも電気を通す"],
  ["material","電気の通りやすさは、物の色や形より、材料の性質で決まる"],
  ["length","すき間にはさむ物が短ければ、どんな材料でも電気が通る"]
 ],correct:"material",discovery:"見た目が金属に似ていても、プラスチックは電気を通しにくい。鉄とアルミは金属なので通す。"},
 7:{title:"時計塔の二重ロック",intro:"2つのスイッチは直列。条件が変わっても点灯を予測できるかな？",choices:["lit","dark"],
 probes:[
  {id:"a",name:"AがON、BがOFF",diagram:"series10",answer:"dark"},
  {id:"b",name:"AもBもON",diagram:"series11",answer:"lit"},
  {id:"c",name:"AがOFF、BがON",diagram:"series01",answer:"dark"}
 ],reasons:[
  ["both","直列ではAとBの両方が閉じて、はじめて電気の通り道がつながる"],
  ["one","直列ではAとBの片方が閉じれば、もう片方は開いていても光る"],
  ["count","2つスイッチがあれば、ON・OFFに関係なく必ず明るくなる"]
 ],correct:"both",discovery:"直列スイッチの通り道は1本。どこか1か所でも開けば消灯する。"},
 8:{title:"港の遠隔スイッチ",intro:"今度は並列。船着き場と倉庫のどちらからでも明かりをつけられる？",choices:["lit","dark"],
 probes:[
  {id:"a",name:"AがOFF、BがON",diagram:"parallel01",answer:"lit"},
  {id:"b",name:"AもBもOFF",diagram:"parallel00",answer:"dark"},
  {id:"c",name:"AがON、BがOFF",diagram:"parallel10",answer:"lit"}
 ],reasons:[
  ["both","並列では2つともONでなければ点灯しない"],
  ["either","並列は道が2本。どちらか1つでも閉じれば道がつながる"],
  ["open","並列なら全部OFFでも電流が流れる"]
 ],correct:"either",discovery:"スイッチが並列なら、どちらかの道がつながっていれば豆電球は点灯する。"},
 12:{title:"危険な近道を見破れ！",intro:"赤い線を外す前に、別の3つの回路が安全かを判断しよう。現実の乾電池で試すのは禁止。",choices:["short","safe"],
 probes:[
  {id:"a",name:"豆電球を通らず＋極と−極を導線でつなぐ",diagram:"short",answer:"short"},
  {id:"b",name:"乾電池の＋と−を電球の横と底につなぐ",diagram:"loop",answer:"safe"},
  {id:"c",name:"電球をつないだまま、＋と−を別の導線でも直結する",diagram:"shunt",answer:"short"}
 ],reasons:[
  ["off","豆電球が消灯した回路は、どれでも安全"],
  ["battery","乾電池の＋と−を直接つなぐ道があると、豆電球の有無にかかわらずショートして危険"],
  ["thin","導線が細ければショートしても危なくない"]
 ],correct:"battery",discovery:"豆電球と並んで直接の近道があっても、乾電池の＋と−が導線だけでつながれば危険なショート。"},
 14:{title:"最後の夜の応用試験",intro:"修理した知識を別の回路に応用！ 2つの接点と材料に注意して判断しよう。",choices:["lit","dark"],
 probes:[
  {id:"a",name:"金属のクリップ、電球の横と底の接点を両方つなぐ",diagram:"clip",answer:"lit"},
  {id:"b",name:"木の棒をはさみ、電球の両方の接点をつなぐ",diagram:"wood",answer:"dark"},
  {id:"c",name:"アルミはくを使うが、電球の底の接点だけ外れている",diagram:"bottomGap",answer:"dark"}
 ],reasons:[
  ["battery","乾電池を2個使えば、途中が切れていても点灯する"],
  ["closed","乾電池から豆電球の両接点へ電気を通す材料で輪ができていることが必要"],
  ["foil","金属を1か所使えば、ほかの接点が外れていても点灯する"]
 ],correct:"closed",discovery:"電源、導体、電球の2つの金属接点が、切れ目のない回路になることが最も大切。"}
};
const labels={lit:"💡 点灯",dark:"◯ 消灯",short:"⚠ ショート（危険）",safe:"💡 正しく点灯"};
function diagram(kind){
 const isSeries=kind.startsWith("series"),isParallel=kind.startsWith("parallel");
 const status=kind.match(/[01]{2}$/)?.[0]||"00";
 const topLine='<path d="M53 48V28H294V72M294 107V143H53V99" fill="none" stroke="#f5d6a4" stroke-width="5" stroke-linecap="round"/>';
 const reverseBattery=kind==="reverseLoop";
 const battery='<g><rect x="32" y="58" width="42" height="41" rx="9" fill="#b96253" stroke="#ffe6a7" stroke-width="3"/><path d="M53 58V47M53 99V145" stroke="#dce9e2" stroke-width="5"/><text x="53" y="84" fill="#fff6dc" font-size="11" font-weight="bold" text-anchor="middle">1.5V</text><text x="53" y="44" fill="#ffe0a9" font-size="12" text-anchor="middle">'+(reverseBattery?"−":"＋")+'</text><text x="53" y="159" fill="#ffe0a9" font-size="12" text-anchor="middle">'+(reverseBattery?"＋":"−")+'</text></g>';
 const bulb='<g><path d="M295 110Q272 95 277 74Q279 51 295 51Q318 55 319 76Q322 93 306 111Z" fill="#c0d3d0" fill-opacity=".6" stroke="#edf9ea" stroke-width="3"/><path d="M287 87L295 94L303 87" fill="none" stroke="#fbe9c6" stroke-width="3"/><rect x="288" y="106" width="23" height="19" rx="4" fill="#9dbbc0" stroke="#e7ebdf" stroke-width="2"/><path d="M288 112h23m-23 6h23" stroke="#557c87" stroke-width="2"/><text x="294" y="158" text-anchor="middle" font-size="12" fill="#e5f6ef">豆電球</text></g>';
 function switchGlyph(x,y,on,label){return '<g><circle cx="'+(x-22)+'" cy="'+y+'" r="4" fill="#ffe1ac"/><circle cx="'+(x+22)+'" cy="'+y+'" r="4" fill="#ffe1ac"/><path d="M'+(x-22)+' '+y+'L'+(x+17)+' '+(on?y:y-18)+'" stroke="#e9c997" stroke-width="5" stroke-linecap="round"/><text x="'+x+'" y="'+(y-20)+'" text-anchor="middle" font-size="12" fill="#e9f3ee">'+label+' '+(on?"ON":"OFF")+'</text></g>'}
 let paths=topLine,details="";
 if(kind==="open"){paths='<path d="M53 48V28H167M198 28H294V72M294 107V143H53V99" stroke="#f5d6a4" stroke-width="5" fill="none" stroke-linecap="round"/>';details='<text x="180" y="20" fill="#f6cfa0" text-anchor="middle" font-size="10">すき間</text>'}
 if(kind==="reverseLoop"){details='<text x="175" y="79" text-anchor="middle" font-size="12" fill="#d0e5e5">電池の向きだけ逆</text>'}
 if(["plastic","wood","foil","clip","bottomGap"].includes(kind)){
  const material={plastic:"プラスチック",wood:"乾いた木",foil:"アルミはく",clip:"鉄のクリップ",bottomGap:"アルミはく"}[kind];
  paths='<path d="M53 48V28H139M221 28H294V72M294 107V143H53V99" stroke="#f5d6a4" stroke-width="5" fill="none" stroke-linecap="round"/>';
  if(kind==="bottomGap")paths='<path d="M53 48V28H139M221 28H294V72M294 107V114M294 140V143H53V99" stroke="#f5d6a4" stroke-width="5" fill="none" stroke-linecap="round"/>';
  details='<rect x="139" y="13" width="82" height="30" rx="8" fill="'+({plastic:"#70c5df",wood:"#bc946b",foil:"#c4dadb",clip:"#95bdc3",bottomGap:"#c4dadb"}[kind])+'" stroke="#f5e1b5" stroke-width="2"/>'+
  '<text x="180" y="31" font-size="11" text-anchor="middle" fill="#25465a" font-weight="900">'+material+'</text>';
  if(kind==="bottomGap")details+='<text x="271" y="131" fill="#ffe19d" font-size="10" text-anchor="end">接点が外れた</text>';
 }
 if(isSeries){paths='<path d="M53 48V28H114M158 28H207M251 28H294V72M294 107V143H53V99" stroke="#f5d6a4" stroke-width="5" fill="none"/>';details=switchGlyph(136,28,status[0]==="1","A")+switchGlyph(229,28,status[1]==="1","B")}
 if(isParallel){paths='<path d="M53 48V28H103M263 28H294V72M103 28V8H123M166 8H263V28M103 28V53H123M166 53H263" stroke="#f5d6a4" stroke-width="5" fill="none"/>';details=switchGlyph(144,8,status[0]==="1","A")+switchGlyph(144,53,status[1]==="1","B")}
 if(kind==="short"||kind==="shunt"){details='<path d="M53 48H16V147H53" stroke="#f7a990" stroke-width="5" fill="none" stroke-dasharray="7 4"/><text x="80" y="119" font-size="11" fill="#ffc5aa">豆電球を通らない道</text>';if(kind==="short")paths='<path d="M294 107V143H53" stroke="#f5d6a4" stroke-width="5" fill="none"/>';else details='<path d="M53 48H16V147H53" stroke="#f7a990" stroke-width="5" fill="none" stroke-dasharray="7 4"/><text x="80" y="119" font-size="11" fill="#ffc5aa">別の導線で直結</text>'}
 return '<svg viewBox="0 0 340 173" class="transfer-diagram" role="img" aria-label="乾電池と豆電球の回路の模式図。結果はまだ表示しない"><rect x="1" y="1" width="338" height="171" rx="13" fill="#173a53" stroke="#55808c" stroke-width="2"/>'+
 paths+battery+bulb+details+'</svg>';
}
function get(id){return puzzles[id]||null;}
function render(id,answers,reason){
 const p=get(id);if(!p)return"";
 return '<section class="transfer-puzzle"><div class="transfer-heading"><span>🚨 街からの追加依頼</span><h3>'+p.title+'</h3><p>'+p.intro+'</p></div>'+
 '<div class="transfer-probes">'+p.probes.map((t,index)=>'<div class="transfer-probe"><strong>調査 '+(index+1)+'：'+t.name+'</strong>'+diagram(t.diagram)+'<div class="transfer-answers">'+p.choices.map(value=>'<button type="button" data-transfer-answer="'+t.id+'" data-transfer-value="'+value+'" aria-pressed="'+(answers[t.id]===value)+'" class="'+(answers[t.id]===value?'selected':'')+'">'+labels[value]+'</button>').join("")+'</div></div>').join("")+'</div>'+
 '<div class="transfer-reason"><strong>🧠 どうしてそうなる？</strong><p>3つの予想をつなぐ、正しい理由を選ぼう。</p>'+p.reasons.map(([key,label])=>'<button type="button" data-transfer-reason="'+key+'" aria-pressed="'+(reason===key)+'" class="'+(reason===key?'selected':'')+'">'+label+'</button>').join("")+'</div>'+
 '<button type="button" class="transfer-verify" data-transfer-verify="1">🔑 予想と理由を提出して街を救う</button></section>';
}
function score(id,answers,reason){const p=get(id);if(!p)return null;
 const wrong=p.probes.filter(x=>answers[x.id]!==x.answer).map(x=>x.id);
 const reasonOk=reason===p.correct;
 return {ok:wrong.length===0&&reasonOk,wrong,reasonOk,discovery:p.discovery};
}
const hints={
 2:"乾電池の＋から出て、豆電球の2つの金属接点を通り、−まで戻る道があるかな？",
 5:"金属のように見えるかではなく、何の材料でできているかを確認しよう。",
 7:"直列は電気の道が一本。AとBのどちらかで道が切れていないかな？",
 8:"並列の2本の道を別々にたどって、どちらか一方でもつながっているか見よう。",
 12:"豆電球を通らない道で、乾電池の＋と−が直接つながっていないかな？",
 14:"電池、通す材料、豆電球の横と底、電池に戻るまでを指でなぞってみよう。"
};
window.AkariTransfer={get,render,score,diagram,hint:id=>hints[id],stages:Object.keys(puzzles).map(Number)};
})();