"use strict";
(function(){
 const colors=[{id:"red",color:"#dc493a",label:"あかい どう線"},{id:"blue",color:"#277fea",label:"あおい どう線"},{id:"yellow",color:"#df9d16",label:"きいろい どう線"}];
 const get=id=>document.getElementById(id);
 const read=(k,d)=>{try{return localStorage.getItem(k)||d}catch{return d}};
 const store=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let chosen=read("rika-akari-wire-color-v1","blue");
 let predictions={};try{predictions=JSON.parse(read("rika-akari-predictions-v1","{}"))||{}}catch{predictions={}};
 let seen=0;
 const mission=()=>Number((get("missionNumber")?.textContent||"MISSION 01 / 14").match(/(\d+)\s*\/\s*14/)?.[1]||1);
 function setup(){
  document.body.dataset.visualTheme="reference-rebuild";
  const top=document.querySelector(".topbar"),sidebar=get("sidebar");
  if(top&&sidebar&&sidebar.parentNode!==top){
   const progress=document.createElement("div");progress.className="top-mission-progress";
   progress.innerHTML='<span class="top-progress-dots" aria-hidden="true">'+Array.from({length:7},()=>"<i></i>").join("")+'</span><strong id="topMissionIndex">1 / 14</strong>';
   top.insertBefore(progress,top.querySelector(".top-actions"));top.append(sidebar);
  }
  const brand=top?.querySelector(".brand");
  if(brand)brand.innerHTML='<span class="brand-symbol" aria-hidden="true">💡</span><span>あかりクエスト<small>まちの あかりを とりもどそう！</small></span>';
  const main=document.querySelector(".main");
  if(main&&!get("learningSteps")){
   const steps=document.createElement("aside");steps.id="learningSteps";steps.className="learning-steps";
   steps.setAttribute("aria-label","予想・実験・考察の3ステップ");
   steps.innerHTML=[
    '<section class="learning-step"><h3><span class="step-index">1</span>よそうしよう</h3>',
    '<p>つなぐと、あかりは つくかな？</p>',
    '<div class="prediction-options" id="designPredictionChoices">',
    '<button type="button" class="prediction-option" data-prediction="lit" aria-pressed="false">つくと おもう</button>',
    '<button type="button" class="prediction-option" data-prediction="dark" aria-pressed="false">つかないと おもう</button></div>',
    '<p class="step-note" id="designPredictionNote">まず かんがえよう。</p></section>',
    '<section class="learning-step"><h3><span class="step-index">2</span>じっけんしよう</h3>',
    '<p>まるを 2つ タップして、どう線を つなごう。</p>',
    '<p class="step-note">「電気を流す」で たしかめよう。</p></section>',
    '<section class="learning-step"><h3><span class="step-index">3</span>かんがえよう</h3>',
    '<p>よそうと けっかを くらべよう。</p>',
    '<p class="step-note" id="designComparisonNote">どうして そうなったのかな？</p></section>'
   ].join("");
   main.insertBefore(steps,main.querySelector(".story-scene"));
   steps.addEventListener("click",e=>{
    const b=e.target.closest("[data-prediction]");if(!b)return;
    predictions[mission()]=b.dataset.prediction;store("rika-akari-predictions-v1",JSON.stringify(predictions));refresh();
   });
  }
 }
 function refresh(){
  const n=mission();
  if(n!==seen){
   seen=n;const idx=get("topMissionIndex");if(idx)idx.textContent=n+" / 14";
   document.querySelectorAll(".top-progress-dots i").forEach((dot,i)=>dot.classList.toggle("done",i<Math.ceil(n/2)));
  }
  const options=get("designPredictionChoices"),note=get("designPredictionNote");if(!options||!note)return;
  const simple=n===1||n===2;options.hidden=!simple;
  if(simple){
   options.querySelectorAll("[data-prediction]").forEach(b=>b.setAttribute("aria-pressed",String(predictions[n]===b.dataset.prediction)));
   note.textContent=predictions[n]?"よそうを きろくしたよ。じっけんで たしかめよう。":"どちらでも だいじょうぶ。まず かんがえよう。";
  }else note.textContent="この ミッションの もんだいで よそうを えらぼう。";
  const compare=get("designComparisonNote"),complete=get("discovery")&&!get("discovery").hidden;
  if(compare)compare.textContent=complete&&simple&&predictions[n]?
   "けっかは『ついた』。よそうと "+(predictions[n]==="lit"?"おなじだったね。":"ちがったね。")+" わけを かんがえよう。":"どうして そうなったのかな？";
 }
 function decorate(){
  const root=get("workspace"),board=root?.querySelector(".circuit-board");if(!board)return;
  board.style.setProperty("--chosen-wire-color",colors.find(c=>c.id===chosen)?.color||"#277fea");
  if(board.dataset.referenceReady==="yes")return;
  board.dataset.referenceReady="yes";
  const inner=board.querySelector(".circuit-inner");
  if(inner){
   const tag=(side,title,reading)=>{
    const div=document.createElement("div");div.className="component-tag "+side+"-tag";
    div.setAttribute("aria-hidden","true");
    div.innerHTML="<small>"+reading+"</small><strong>"+title+"</strong>";inner.append(div);
   };
   tag("battery","乾電池","かんでんち");tag("bulb","豆電球","まめでんきゅう");
  }
  const legend=root.querySelector(".circuit-legend");if(!legend)return;
  const palette=document.createElement("section");palette.className="wire-palette";
  palette.setAttribute("aria-label","導線の色を選ぶ");
  palette.innerHTML='<strong class="wire-palette-heading">つかう どう線を えらぼう</strong>'+
   colors.map(c=>'<button type="button" class="wire-color-choice" data-wire-color="'+c.id+'" aria-pressed="'+(chosen===c.id)+'"><span class="wire-sample" style="--sample-wire:'+c.color+'"></span><span>'+c.label+'</span></button>').join("")+
   '<p class="wire-palette-foot">※ 色が ちがっても、電気の とおりやすさは おなじだよ。</p>';
  legend.before(palette);
  palette.addEventListener("click",e=>{
   const b=e.target.closest("[data-wire-color]");if(!b)return;
   chosen=b.dataset.wireColor;store("rika-akari-wire-color-v1",chosen);
   board.style.setProperty("--chosen-wire-color",colors.find(c=>c.id===chosen)?.color||"#277fea");
   palette.querySelectorAll("[data-wire-color]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
  });
 }
 function init(){
  setup();refresh();decorate();
  const root=get("workspace"),head=get("missionNumber"),discovery=get("discovery");
  if(root)new MutationObserver(decorate).observe(root,{childList:true});
  if(head)new MutationObserver(refresh).observe(head,{childList:true,characterData:true,subtree:true});
  if(discovery)new MutationObserver(refresh).observe(discovery,{attributes:true,attributeFilter:["hidden"]});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
