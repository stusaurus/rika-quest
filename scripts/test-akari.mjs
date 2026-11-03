import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const elements={};
function el(id){
 return elements[id] ||= {
  listeners:{},dataset:{},innerHTML:"",textContent:"",className:"",hidden:false,offsetWidth:10,
  classList:{add(){},remove(){},toggle(){return true}},
  setAttribute(){},getAttribute(){return null},focus(){},
  addEventListener(type,fn){this.listeners[type]=fn}
 };
}
const document={readyState:"complete",getElementById:el,addEventListener(){}};
const window={scrollTo(){}};
const stored={};
const localStorage={getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}};
const context=vm.createContext({window,document,localStorage,setTimeout(){},console});
vm.runInContext(readFileSync("games/akari/art.js","utf8"),context,{filename:"art.js"});
vm.runInContext(readFileSync("games/akari/scenes.js","utf8"),context,{filename:"scenes.js"});
vm.runInContext(readFileSync("games/akari/character.js","utf8"),context,{filename:"character.js"});
vm.runInContext(readFileSync("games/akari/transfer.js","utf8"),context,{filename:"transfer.js"});
vm.runInContext(readFileSync("games/akari/game.js","utf8"),context,{filename:"game.js"});
const button=dataset=>({hasAttribute(attr){return Object.hasOwn(dataset,attr.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()))},dataset});
const click=dataset=>el("workspace").listeners.click({target:{closest(s){return s==="button"?button(dataset):null}}});
const check=()=>el("checkBtn").listeners.click();
const move=i=>el("missionList").listeners.click({target:{closest(s){return s==="[data-mission]"?{dataset:{mission:String(i)}}:null}}});
const saved=()=>JSON.parse(stored["rika-akari-quest-v2"]||"{}");
const done=i=>assert.ok(saved().completed?.[i],"Mission "+i+" should be completed");
const wire=(a,b)=>{click({t:a});click({t:b})};
const transfer=(id,withMistake=false)=>{
 const puzzle=window.AkariTransfer.get(id);
 assert.ok(puzzle,"An independent challenge must exist for stage "+id);
 assert.equal(saved().completed[id],undefined,"Main mission alone must not clear "+id);
 assert.match(el("workspace").innerHTML,/transfer-puzzle/,"Transfer puzzle must be displayed");
 assert.match(el("workspace").innerHTML,/transfer-focus/,"Only the first unfamiliar circuit is initially presented");
 assert.doesNotMatch(el("workspace").innerHTML,/class="transfer-reason"/,"Require prediction before showing causal options");
 if(withMistake){
  const probe=puzzle.probes[0];
  click({transferAnswer:probe.id,transferValue:puzzle.choices.find(x=>x!==probe.answer)});
  assert.ok(saved().drafts[id]?.answers?.[probe.id],"First transfer prediction must be checkpointed");
  if(id===2){
   move(1);move(2);
   assert.match(el("workspace").innerHTML,/transfer-puzzle/,"Transfer challenge must survive leaving and revisiting");
   assert.match(el("workspace").innerHTML,/調査 2 \/ 3/,"Reopened challenge resumes at the next unseen circuit");
  }
  for(const x of puzzle.probes.slice(1))click({transferAnswer:x.id,transferValue:x.answer});
  click({transferReason:puzzle.correct});click({transferVerify:"1"});
  assert.equal(saved().completed[id],undefined,"Incorrect prediction must not clear "+id);
  assert.match(el("feedbackText").textContent,/予想/);
 }
 for(const probe of puzzle.probes)click({transferAnswer:probe.id,transferValue:probe.answer});
 assert.match(el("workspace").innerHTML,/transfer-review-row/,"After three predictions show comparative reasoning review");
  const wrongReason=puzzle.reasons.find(([key])=>key!==puzzle.correct)[0];
 click({transferReason:wrongReason});click({transferVerify:"1"});
 assert.equal(saved().completed[id],undefined,"Correct outcomes alone cannot bypass the causal explanation for "+id);
 click({transferReason:puzzle.correct});click({transferVerify:"1"});
 assert.ok(saved().completed[id],"Understanding the novel cases must unlock stage "+id);
 assert.equal(saved().drafts[id],undefined,"Completed transfer draft must not linger in saved progress");
 assert.ok(saved().notes.some(n=>n.mission===id&&n.key==="transfer:"+id),"Scientific transfer must be saved in notebook");
};
move(14);assert.equal(saved().active,1,"Locked final mission cannot be opened");
wire("P","N");check();assert.match(el("feedbackText").textContent,/ショート/);
assert.equal(el("sceneCharacter").dataset.mood,"danger","Danger should visibly warn without celebrating");
assert.equal(el("stageCelebration").hidden,true,"Short must never trigger victory visuals");
click({unwire:"0"});wire("P","L");wire("N","R");check();done(1);
assert.equal(el("sceneCharacter").dataset.mood,"celebrate","Completing a safe circuit should trigger a cheer");
assert.equal(el("stageCelebration").hidden,false,"Clear should show nonblocking celebration");
assert.equal((el("mapLights").innerHTML.match(/class="map-lamp lit/g)||[]).length,1,"First light should update the map");
assert.equal(el("restorationTrail").hidden,false,"First clear should send a short pulse to the town");
assert.match(el("characterArt").innerHTML,/tiranon-sprite-strip/,"Canonical dinosaur walk sprite should mount");
move(2);assert.equal(el("restorationTrail").hidden,true,"Transition must cancel old light trail");wire("N","R");check();transfer(2,true);done(2);
move(3);for(const choice of ["wood","plastic","iron"])click({choice});check();done(3);
move(4);
click({choice:"clip"});check();assert.equal(saved().completed[4],undefined,"No experiment before a prediction");
assert.match(el("feedbackText").textContent,/予想/);
click({predict:"dark"});check();assert.match(el("journalPanel").innerHTML||el("feedbackText").textContent,/./);
for(const [choice,prediction] of [["foil","lit"],["wood","dark"]]){click({choice});click({predict:prediction});check()}
done(4);assert.equal(saved().completed[4],3,"An incorrect scientific prediction must not cost stars");
move(5);for(const [choice,prediction] of [["wood","dark"],["plastic","dark"],["clip","lit"]]){click({choice});click({predict:prediction});check()}transfer(5);done(5);
move(6);
click({inspect:"wire"});click({fix:"wire"});check();
assert.equal(saved().completed[6],undefined,"Cannot fix before evidence diagnosis");
click({inspect:"battery"});click({inspect:"bulb"});
click({suspect:"battery"});click({diagnose:"1"});
assert.match(el("feedbackText").textContent,/予想/,"Incorrect diagnosis should invite comparison without losing stars");
click({suspect:"battery"});click({suspect:"wire"});click({diagnose:"1"});
click({fix:"wire"});check();done(6);
assert.equal(saved().completed[6],3,"Wrong hypothesis should not cost a star");
move(7);check();click({switch:"a"});check();click({switch:"b"});check();click({switch:"a"});check();
assert.equal(saved().completed[7],undefined,"Four switch outcomes alone must not auto-complete");
click({conclude:"either"});check();assert.equal(saved().completed[7],undefined,"Incorrect interpretation cannot clear");
click({conclude:"both"});check();transfer(7);done(7);
move(8);click({design:"parallel"});check();click({switch:"a"});check();click({switch:"b"});check();click({switch:"a"});check();
click({conclude:"either"});check();transfer(8);done(8);
move(9);for(const choice of ["small","large"]){click({choice});check()}
 click({answer:"sameVoltage"});check();assert.equal(saved().completed[9],undefined,"Battery outcome alone must not clear");
 click({why:"size"});check();assert.equal(saved().completed[9],undefined,"Incorrect battery reason must not clear");
 click({why:"voltage"});check();done(9);
move(10);for(const choice of ["single","series"]){click({choice});check()}
 click({answer:"seriesBrighter"});click({why:"shape"});check();assert.equal(saved().completed[10],undefined,"Brightness needs voltage reasoning");
 click({why:"seriesAdds"});check();done(10);
move(11);for(const choice of ["same","reverse"]){click({choice});check()}
 click({answer:"same"});click({why:"single"});check();assert.equal(saved().completed[11],undefined,"Two-battery polarity requires cancellation concept");
 click({why:"cancel"});check();done(11);
move(12);click({cut:"x"});click({cut:"y"});check();transfer(12,true);done(12);
move(13);
for(const key of ["wire","bulb","battery"])click({inspect:key});
click({suspect:"wire"});click({diagnose:"1"});
assert.equal(saved().completed[13],undefined,"One suspected defect is insufficient for the double fault");
click({suspect:"bulb"});click({diagnose:"1"});
click({fix:"wire"});check();
assert.equal(saved().completed[13],undefined,"Repairing one of two faults cannot relight the tower");
click({fix:"bulb"});check();done(13);
move(14);click({final:"direction",value:"same"});click({final:"material",value:"clip"});click({final:"contact",value:"true"});check();
assert.equal(saved().completed[14],undefined,"Correct guesses alone must not complete final mission");
for(const verify of ["direction","material","contact"])click({verify});
click({final:"material",value:"wood"});check();
assert.equal(saved().completed[14],undefined,"Changing a verified part must invalidate that diagnosis");
click({verify:"material"});click({final:"material",value:"clip"});click({verify:"material"});check();transfer(14);done(14);
assert.equal(Object.keys(saved().completed).length,14,"All 14 missions must be completed");
assert.equal(Object.keys(saved().masteries||{}).length,6,"Every mastered transfer must award one unique reasoning token");
assert.equal(el("masteryCount").textContent,"6","Mastery tracker should show six completed scientific transfers");
assert.equal((el("mapLights").innerHTML.match(/class="map-lamp lit/g)||[]).length,14,"All 14 map lights must persist");
assert.equal(saved().active,14);
assert.ok(window.AkariCharacter.moods.includes("walk"),"Mission travel should animate the canonical walk");
assert.ok(saved().notes.length>=14,"Observation journal should retain a discovery for each completed mission");
assert.equal(window.AkariTransfer.stages.length,6,"Six scientific transfer checkpoints are required");
for(const id of window.AkariTransfer.stages){
 const puzzle=window.AkariTransfer.get(id);
 assert.equal(puzzle.probes.length,3,"Three independent novel cases per transfer checkpoint");
 for(const probe of puzzle.probes){
  assert.equal(probe.answer,window.AkariTransfer.expected(id,probe.diagram),
   "Circuit topology must determine the answer in stage "+id+" case "+probe.id);
  assert.ok(window.AkariTransfer.diagram(probe.diagram).includes('<svg'),"Every transfer case needs visible diagram");
 }
}
assert.equal(window.AkariTransfer.evaluateCircuit("parallel001"),"lit","A third parallel path still lights the bulb");
assert.equal(window.AkariTransfer.evaluateCircuit("series110"),"dark","An open third series switch breaks the circuit");
assert.equal(window.AkariTransfer.evaluateCircuit("shunt"),"short","A bypass remains dangerous even when a lamp is attached");
const scenes=Array.from({length:14},(_,i)=>window.AkariScenes.render(i+1));
assert.equal(new Set(scenes).size,14,"Each mission needs a distinct scene illustration");
const landmarks=["village","bridge","garden","tower","port","museum","lighthouse"].map(place=>window.AkariScenes.landmark(place));
assert.equal(new Set(landmarks).size,7,"All seven regions need a unique illustrated landmark");
assert.ok(landmarks.every(svg=>svg.includes("class=\"window\"")),"Each landmark should have a lightable window");
assert.ok(window.AkariArt.material("clip").includes("<svg"));
assert.ok(window.AkariArt.circuit("series",false,false).includes("<svg"));
assert.ok(window.AkariArt.bulb(true).includes("<svg"));
assert.ok(window.AkariCharacter.render().includes("tiranon-walk-prototype.webp"));
assert.equal(el("litPlaceCount").textContent,14,"Restoration progress should reach 14 regions");
move(1);wire("P","L");wire("N","R");check();assert.equal(el("restorationTrail").hidden,true,"Replay must not trigger a first-clear town pulse");
assert.equal(Object.keys(saved().masteries||{}).length,6,"Replays must not duplicate reasoning tokens");
console.log("Akari Quest: 14/14 missions passed; dangerous battery short rejected; art templates rendered.");
