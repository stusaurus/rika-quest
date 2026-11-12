import {Script} from "node:vm";

// The public review is a release artifact, not a change to the lesson engine.
// Exact, checked substitutions keep the normal 14-mission build untouched.
export function mission1Trial(html,game){
 const one=(source,from,to)=>{
  if(source.split(from).length!==2)throw new Error("Trial boundary source changed: "+from.slice(0,90));
  return source.replace(from,to);
 };
 let trial=one(game,'storageKey="rika-akari-quest-v2"','storageKey="rika-akari-quest-mission1-trial-v2"');
 trial=one(trial,'let state=readSave(),','let state=Object.assign(readSave(),{active:1}),');
 trial=one(trial,'function changeMission(id){','function changeMission(id){if(id!==1)return;');
 trial=one(trial,'$("missionList").innerHTML=M.map(','$("missionList").innerHTML=M.filter(m=>m.id===1).map(');
 trial=one(trial,'String(m.id).padStart(2,"0")+" / 14"','String(m.id).padStart(2,"0")+" / 1"');
 trial=one(trial,'$("nextBtn").textContent="つぎへ すすむ ➜"','$("nextBtn").textContent="もういちど あそぶ ↻"');
 trial=one(trial,'$("nextBtn").addEventListener("click",()=>changeMission(Math.min(14,state.active+1)))',
  '$("nextBtn").addEventListener("click",()=>changeMission(1))');
 new Script(trial,{filename:"akari-mission1-trial-game.js"});
 let result=one(html,game,trial);
 result=one(result,'<title>あかりクエスト｜試遊版</title>','<title>あかりクエスト｜第1ミッション試遊</title>');
 result=one(result,'href="https://stusaurus.github.io/rika-quest/"','href="./"');
 result=one(result,'title="Rika Quest トップへ"','title="もういちど あそぶ"');
 result=one(result,'<small>/ 42</small>','<small>/ 3</small>');
 result=result.replace('</head>',`<meta name="akari-trial-scope" content="mission-1-only">
<style id="akari-trial-scope-style">
html.akari-painted body[data-visual-theme="reference-rebuild"][data-painted-mission="1"] :is(#sidebar,#sceneProgress,.top-mission-progress){display:none!important}
</style></head>`);
 return result;
}
