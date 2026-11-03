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
vm.runInContext(readFileSync("games/akari/builder.js","utf8"),context,{filename:"builder.js"});
vm.runInContext(readFileSync("games/akari/switch-lab.js","utf8"),context,{filename:"switch-lab.js"});
vm.runInContext(readFileSync("games/akari/safety-lab.js","utf8"),context,{filename:"safety-lab.js"});
vm.runInContext(readFileSync("games/akari/game.js","utf8"),context,{filename:"game.js"});
const button=dataset=>({hasAttribute(attr){return Object.hasOwn(dataset,attr.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()))},dataset});
const click=dataset=>el("workspace").listeners.click({target:{closest(s){return s==="button"?button(dataset):null}}});
const check=()=>el("checkBtn").listeners.click();
const move=i=>el("missionList").listeners.click({target:{closest(s){return s==="[data-mission]"?{dataset:{mission:String(i)}}:null}}});
const saved=()=>JSON.parse(stored["rika-akari-quest-v2"]||"{}");
const done=i=>assert.ok(saved().completed?.[i],"Mission "+i+" should be completed");
const wire=(a,b)=>{click({t:a});click({t:b})};
const builderWire=(a,b)=>{click({builderT:a});click({builderT:b})};
const netWire=(a,b)=>{click({netT:a});click({netT:b})};
const switchLab=(id,layout)=>{
 const B=window.AkariSwitchLab,expected=id===7?"both":"either";
 assert.ok(B,"Switch graph module must load");
 assert.equal(saved().completed[id],undefined,"Cannot clear switch lesson without the construction task");
 assert.match(el("workspace").innerHTML,/network-lab/,"Switch network engineering workshop must open");
 const edges=id===7?[["P","A1"],["A2","B1"],["B2","L"],["R","N"]]:
  [["P","A1"],["P","B1"],["A2","L"],["B2","L"],["R","N"]];
 for(const [a,b]of edges)netWire(a,b);
 assert.equal(saved().switchDrafts[id].wires.length,edges.length,"Network wiring must persist");
 const cases=B.codes.map(code=>({code,...B.evaluate(edges,code[0]==="1",code[1]==="1")}));
 assert.deepEqual(Array.from(cases,x=>Boolean(x.lit)),id===7?[false,false,false,true]:[false,true,true,true],"Circuit graph must produce target truth table");
 assert.equal(B.evaluate([["P","N"]],false,false).short,true,"Direct battery connection is always unsafe");
 const realPath=B.pathEvidence(edges,true,true);
 assert.equal(realPath.kind,"lit","A closed successful loop has an observable electric path");
 assert.equal(realPath.route[0],"P","Observed electrical path begins at battery positive");
 assert.equal(realPath.route.at(-1),"N","Observed electrical path returns to battery negative");
 assert.ok(realPath.route.includes("L")&&realPath.route.includes("R"),"Measured lamp current must pass the bulb contacts");
 assert.deepEqual(Array.from(B.pathEvidence([["P","N"]],false,false).route),["P","N"],"Real short path skips the bulb");
 assert.equal(B.discrepancy(id,[["P","N"]],false,false),"short","Direct short must be categorized as hazardous");
 assert.equal(B.discrepancy(id,[["P","L"],["R","N"]],false,false),"bypass","Unintended light without switches is a bypass");
 assert.equal(B.discrepancy(id,[],true,true),"open","Unlit circuit when light required is an open-path problem");
 assert.equal(B.discrepancy(id,edges,false,false),null,"Correctly dark cases should not trigger unsolicited diagnostics");
 const risky=B.render(id,[["P","N"]],null,false,false,{"00":{...B.evaluate([["P","N"]],false,false),signature:B.signature([["P","N"]])}},null);
 assert.match(risky,/data-net-cause="short"/,"A measured short should invite cause investigation");
 assert.doesNotMatch(risky,/network-flow-segment/,"Dangerous shortcut is not revealed before diagnosis");
 const explained=B.render(id,[["P","N"]],null,false,false,{"00":{...B.evaluate([["P","N"]],false,false),signature:B.signature([["P","N"]])}},null,{code:"00",kind:"short",signature:B.signature([["P","N"]])});
 assert.match(explained,/data-flow-edge="N-P"/,"Correct diagnosis reveals the observed shortcut, not a canned solution");
 assert.match(explained,/診断成功/,"Science-based correction evidence must be visible");

 move(id-1);move(id);
 assert.match(el("workspace").innerHTML,/network-lab/,"Wiring challenge must survive switching missions");
 click({netTest:"1"});  // 00
 click({netSwitch:"a"});click({netTest:"1"}); // 10
 click({netSwitch:"b"});click({netTest:"1"}); // 11
 click({netSwitch:"a"});click({netTest:"1"}); // 01
 assert.equal(Object.keys(saved().switchDrafts[id].trials).length,4,"All four switch tests must be recorded");
 click({netReason:id===7?"either":"both"});
 click({netSubmit:"1"});
 assert.equal(saved().completed[id],undefined,"A scientifically wrong explanation cannot unlock stage");
 click({netReason:expected});
 click({netSubmit:"1"});
 done(id);
 assert.equal(saved().masteries[id],true,"Switch-engineering discovery earns application mastery");
 assert.equal(saved().switchDrafts[id],undefined,"Successful network design removes its draft");
 assert.ok(saved().notes.some(n=>n.mission===id&&n.key==="switchbuilder:"+id),"Actual network evidence must be recorded in notebook");
};

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
 if(id===14){
  assert.equal(saved().completed[id],undefined,"Last mission requires constructing a real circuit, not only correct choices");
  assert.match(el("workspace").innerHTML,/builder-puzzle/,"Original circuit constructor must appear");
 }else assert.ok(saved().completed[id],"Understanding the novel cases must unlock stage "+id);
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
click({fix:"wire"});check();
assert.equal(saved().completed[6],undefined,"Correct fault diagnosis alone cannot clear without rebuilding circuit");
assert.match(el("workspace").innerHTML,/builder-direct/,"Clock tower should have a four-terminal construction workshop");
assert.doesNotMatch(el("workspace").innerHTML,/data-builder-switch=/,"The first independent wiring challenge does not require a switch");
const basic=window.AkariBuilder;
assert.equal(basic.expectedDirect({single:{...basic.evaluate([["P","L"],["N","R"]],false),signature:basic.signature([["P","L"],["N","R"]])}},[["P","L"],["N","R"]]),true,"A safe basic circuit should be accepted");
assert.equal(basic.expectedDirect({single:{...basic.evaluate([["P","N"]],false),signature:basic.signature([["P","N"]])}},[["P","N"]]),false,"A direct battery short cannot pass the basic repair");
builderWire("P","N");click({builderTest:"1"});
assert.match(el("feedbackText").textContent,/ショート/,"Short should be recognized in practice builder");
assert.match(el("workspace").innerHTML,/data-builder-cause="short"/,"Unsafe circuit must invite evidence-based diagnosis");
assert.doesNotMatch(el("workspace").innerHTML,/data-diagnostic-edge="N-P"/,"Unsafe route should not be revealed before reasoning");
click({builderCause:"open"});
assert.match(el("feedbackText").textContent,/原因/,"Wrong hypothesis must prompt reflection");
assert.equal(saved().practiceDraft.insight,null,"Incorrect diagnosis must not be stored");
click({builderCause:"short"});
assert.equal(saved().practiceDraft.insight.kind,"short","Correct cause must persist in draft");
assert.match(el("workspace").innerHTML,/data-diagnostic-edge="N-P"/,"Correct diagnosis reveals the real shortcut");
move(5);move(6);
assert.match(el("workspace").innerHTML,/原因を発見した/,"Diagnosis should survive revisiting the stage");
builderWire("P","N");
assert.equal(saved().practiceDraft.insight,null,"Editing wiring invalidates diagnosis");
builderWire("P","L");
click({builderTest:"1"});
assert.match(el("workspace").innerHTML,/data-builder-cause="open"/,"Incomplete practice circuit requires open-path diagnosis");
assert.doesNotMatch(el("workspace").innerHTML,/data-builder-cause="bypass"/,"Basic circuit must not require knowledge of a switch");
click({builderCause:"short"});
assert.equal(saved().practiceDraft.insight,null,"A misidentified open loop cannot unlock evidence");
click({builderCause:"open"});
assert.equal(saved().practiceDraft.insight.kind,"open","Open loop cause must be recorded");
assert.match(el("workspace").innerHTML,/builder-reachable/,"Correct open diagnosis highlights reachable terminals");
builderWire("N","R");
move(5);move(6);
assert.match(el("workspace").innerHTML,/builder-direct/,"Basic wiring stage should resume after mission navigation");
assert.equal(saved().practiceDraft.wires.length,2,"Unfinished practice circuit must preserve two wires");
click({builderTest:"1"});
assert.equal(saved().practiceDraft.tests.single.lit,true,"Safe basic loop must light the bulb during experiment");
assert.equal(saved().completed[6],undefined,"Correct circuit requires an explanation of the electricity path");
assert.equal(basic.scientificComplete("direct",saved().practiceDraft.tests,saved().practiceDraft.wires,[]),false,"Tested correct loop is not enough without proof");
click({builderSubmit:"1"});assert.equal(saved().completed[6],undefined,"Submission cannot bypass the route explanation");
click({builderTrace:"L"});assert.match(el("feedbackText").textContent,/＋極/,"Explanation must start from battery positive terminal");
for(const id of ["P","N"]){click({builderTrace:id})}
assert.match(el("feedbackText").textContent,/つながり/,"A missing wire cannot be invented by guessing a route");
click({builderTrace:"L"});click({builderTrace:"L"});assert.match(el("feedbackText").textContent,/同じ端子/);
click({builderTrace:"R"});
move(5);move(6);assert.deepEqual(Array.from(saved().practiceDraft.trace),["P","L","R"],"Partial scientific path must survive navigation");
click({builderTrace:"N"});assert.equal(basic.traceStatus("direct",saved().practiceDraft.wires,saved().practiceDraft.trace).complete,true,"Proof must traverse both bulb contacts");
click({builderSubmit:"1"});done(6);
assert.equal(saved().practiceDraft,null,"Completed practice wiring must clear its temporary save");
assert.ok(saved().notes.some(n=>n.mission===6&&n.key==="builder:6"),"Practice construction evidence must be recorded");
assert.equal(saved().completed[6],3,"Wrong diagnosis should not cost a star");
move(7);check();click({switch:"a"});check();click({switch:"b"});check();click({switch:"a"});check();
assert.equal(saved().completed[7],undefined,"Four switch outcomes alone must not auto-complete");
click({conclude:"either"});check();assert.equal(saved().completed[7],undefined,"Incorrect interpretation cannot clear");
click({conclude:"both"});check();switchLab(7);done(7);
move(8);click({design:"parallel"});check();click({switch:"a"});check();click({switch:"b"});check();click({switch:"a"});check();
click({conclude:"either"});check();switchLab(8);done(8);
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
move(12);
const safety=window.AkariSafety;
assert.equal(safety.stages.length,3,"Port safety rescue must have three distinct topology problems");
assert.equal(safety.minimumCuts(0),1,"Direct short requires one minimal cut");
assert.equal(safety.minimumCuts(1),1,"Breaking either branch of a shortcut can be safe");
assert.equal(safety.minimumCuts(2),2,"Two independent dangerous paths need two minimal cuts");
for(let i=0;i<3;i++){
 assert.equal(safety.evaluate(i,[]).kind,"short","Unrepaired case "+i+" is unsafe");
 assert.equal(safety.evaluate(i,safety.stages[i].wires.map(x=>x.id)).kind,"open","Removing every wire also fails");
}
assert.equal(safety.evaluate(0,["C"]).kind,"lit");
assert.equal(safety.evaluate(1,["A"]).kind,"lit");
assert.equal(safety.evaluate(1,["C"]).kind,"lit","Alternate minimal repair accepted");
assert.equal(safety.evaluate(2,["A","C"]).kind,"lit");
assert.equal(safety.evaluate(2,["A","E"]).kind,"lit","Multiple valid repairs should pass the graph engine");
assert.equal(safety.evaluate(2,["A"]).kind,"short","One dangerous path still remains");
assert.match(el("workspace").innerHTML,/safety-diagram/,"Safety route illustration is visible");
click({safeGuess:"lit"});click({safeTest:"1"});
assert.equal(saved().completed[12],undefined,"Unsafe predicted lit must never advance");
click({safeWire:"C"});click({safeGuess:"open"});click({safeTest:"1"});
assert.equal(saved().safetyDraft.index,0,"Incorrect outcome prediction must not unlock repair");
click({safeGuess:"lit"});click({safeTest:"1"});
assert.equal(safety.canAdvance(saved().safetyDraft),true,"Correct virtual measurement unlocks rescue");
click({safeNext:"1"});
assert.equal(saved().safetyDraft.index,1,"Next bridge rescue should start from a clean evidence state");
click({safeWire:"A"});click({safeGuess:"lit"});click({safeTest:"1"});
assert.equal(safety.canAdvance(saved().safetyDraft),true);
click({safeNext:"1"});
assert.equal(saved().safetyDraft.index,2);
click({safeWire:"A"});click({safeGuess:"lit"});click({safeTest:"1"});
assert.equal(safety.canAdvance(saved().safetyDraft),false,"A remaining parallel shortcut blocks certification");
click({safeWire:"C"});
assert.equal(saved().safetyDraft.measured,null,"Editing any wire must invalidate old evidence");
click({safeGuess:"lit"});click({safeTest:"1"});
assert.equal(safety.canAdvance(saved().safetyDraft),true);
click({safeReason:"shortcut"});check();
assert.equal(saved().completed[12],undefined,"Unsafe conceptual reason cannot finish");
click({safeReason:"lamp-path"});check();
move(11);move(12);
assert.match(el("workspace").innerHTML,/transfer-puzzle/,"Scientific transfer must resume directly after finishing safety inspections");
transfer(12,true);done(12);
assert.equal(saved().safetyDraft,null,"Completed safety inspection clears temporary work");
assert.ok(saved().notes.some(x=>x.key==="safety:0"),"Safety repair evidence enters the adventure journal");
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
click({verify:"material"});click({final:"material",value:"clip"});click({verify:"material"});check();transfer(14);
const builder=window.AkariBuilder;
assert.equal(builder.evaluate([["P","N"]],false).short,true,"Direct battery connection must always be hazardous");
assert.equal(builder.evaluate([["P","L"],["R","N"]],false).lit,true,"Bypassing switch can power bulb even when OFF and must fail objective");
assert.equal(builder.evaluate([["P","S"],["T","L"],["R","N"]],false).lit,false,"Open switch must interrupt the lamp");
assert.equal(builder.evaluate([["P","S"],["T","L"],["R","N"]],true).lit,true,"Closed switch must complete the loop through lamp");
assert.equal(builder.evaluate([["P","R"],["L","S"],["T","N"]],true).lit,true,"A reversed but electrically equivalent loop must be valid");
assert.equal(builder.evaluate([["P","R"],["L","S"],["T","N"]],false).lit,false,"The reversed valid circuit must still respond to the switch");
assert.equal(builder.evaluate([["P","L"],["R","N"]],false).lit,true,"Bypassing the switch must fail when it is OFF");
assert.equal(builder.evaluate([["P","S"],["T","L"],["R","N"],["P","N"]],true).short,true,"Direct shortcut must override any safe lamp connection");
builderWire("P","N");click({builderTest:"1"});
assert.match(el("feedbackText").textContent,/ショート/,"Unsafe battery short must be flagged by an interactive trial");
assert.equal(saved().completed[14],undefined,"Unsafe circuit must never clear");
click({builderCause:"short"});assert.equal(saved().builderDraft.insight.kind,"short");
builderWire("P","N");
assert.equal(saved().builderDraft.insight,null,"Rewiring should erase old short diagnosis");
builderWire("P","L");builderWire("R","N");
click({builderTest:"1"});
assert.equal(builder.diagnose("switch",saved().builderDraft.wires,false),"bypass","Lamp bypassing switch must fail the OFF requirement");
click({builderCause:"open"});assert.equal(saved().builderDraft.insight,null);
click({builderCause:"bypass"});
assert.equal(saved().builderDraft.insight.kind,"bypass","OFF lit must be recognized as a switch bypass");
assert.match(el("workspace").innerHTML,/builder-diagnostic-flow/,"Bypass path should only light after correct diagnosis");
builderWire("P","L");builderWire("R","N");
assert.equal(saved().builderDraft.insight,null);
assert.equal(builder.diagnose("switch",[],true),"open","A missing return path should require open-loop diagnosis");
builderWire("P","S");builderWire("T","L");builderWire("R","N");
click({builderTest:"1"});
assert.equal(saved().builderDraft.tests.off.lit,false,"OFF observation must remain recorded");
const staleSig=builder.signature([["P","S"],["T","L"],["R","N"]]);
assert.equal(builder.expected({off:{...builder.evaluate([["P","S"],["T","L"],["R","N"]],false),signature:staleSig},on:{...builder.evaluate([["P","S"],["T","L"],["R","N"]],true),signature:staleSig}},[["P","S"],["T","L"],["R","N"],["P","N"]]),false,"Old valid trials cannot be reused after dangerous rewiring");
move(13);move(14);
assert.match(el("workspace").innerHTML,/builder-puzzle/,"Custom wires must survive mission navigation");
assert.equal(saved().builderDraft.wires.length,3,"Three selected wires must survive the reload-ready save format");
click({builderSwitch:"on"});click({builderTest:"1"});
assert.equal(saved().builderDraft.tests.on.lit,true,"ON observation must be saved");
assert.equal(saved().completed[14],undefined,"Both experiments require a traced current path");
assert.equal(builder.scientificComplete("switch",saved().builderDraft.tests,saved().builderDraft.wires,["P","S","T","L","R","N"]),true,"Graph route through ON switch and lamp should qualify");
assert.equal(builder.traceStatus("switch",saved().builderDraft.wires,["P","S","T","L","N"]).valid,false,"Skipping the lamp's return contact is not physical");
click({builderSubmit:"1"});assert.equal(saved().completed[14],undefined);
click({builderTrace:"P"});click({builderTrace:"S"});click({builderTrace:"T"});
click({builderTrace:"N"});assert.match(el("feedbackText").textContent,/つながり/,"False route must not advance");
click({builderTraceBack:"1"});assert.deepEqual(Array.from(saved().builderDraft.trace),["P","S"]);
click({builderTrace:"T"});click({builderTrace:"L"});click({builderTrace:"R"});
move(13);move(14);
assert.deepEqual(Array.from(saved().builderDraft.trace),["P","S","T","L","R"],"Stage14 partial reasoning survives reload");
click({builderTrace:"N"});
assert.equal(builder.scientificComplete("switch",saved().builderDraft.tests,saved().builderDraft.wires,saved().builderDraft.trace),true);
click({builderSubmit:"1"});done(14);
assert.equal(saved().builderDraft,null,"Successful design must erase intermediate wiring draft");
assert.ok(saved().notes.some(n=>n.key==="builder:14"),"Final hand-built wiring evidence must enter notebook");
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
