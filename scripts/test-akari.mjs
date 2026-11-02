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
vm.runInContext(readFileSync("games/akari/game.js","utf8"),context,{filename:"game.js"});
const button=dataset=>({hasAttribute(attr){return Object.hasOwn(dataset,attr.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()))},dataset});
const click=dataset=>el("workspace").listeners.click({target:{closest(s){return s==="button"?button(dataset):null}}});
const check=()=>el("checkBtn").listeners.click();
const move=i=>el("missionList").listeners.click({target:{closest(s){return s==="[data-mission]"?{dataset:{mission:String(i)}}:null}}});
const saved=()=>JSON.parse(stored["rika-akari-quest-v2"]||"{}");
const done=i=>assert.ok(saved().completed?.[i],"Mission "+i+" should be completed");
const wire=(a,b)=>{click({t:a});click({t:b})};
move(14);assert.equal(saved().active,1,"Locked final mission cannot be opened");
wire("P","N");check();assert.match(el("feedbackText").textContent,/ショート/);
assert.equal(el("sceneCharacter").dataset.mood,"danger","Danger should visibly warn without celebrating");
assert.equal(el("stageCelebration").hidden,true,"Short must never trigger victory visuals");
click({unwire:"0"});wire("P","L");wire("N","R");check();done(1);
assert.equal(el("sceneCharacter").dataset.mood,"celebrate","Completing a safe circuit should trigger a cheer");
assert.equal(el("stageCelebration").hidden,false,"Clear should show nonblocking celebration");
assert.match(el("characterArt").innerHTML,/tiranon-svg/,"Original dinosaur SVG should mount");
move(2);wire("N","R");check();done(2);
move(3);for(const choice of ["wood","plastic","iron"])click({choice});check();done(3);
move(4);for(const choice of ["clip","foil","wood"]){click({choice});check()}done(4);
move(5);for(const choice of ["wood","plastic","clip"]){click({choice});check()}done(5);
move(6);click({inspect:"wire"});click({fix:"wire"});check();done(6);
move(7);check();click({switch:"a"});check();click({switch:"b"});check();click({switch:"a"});check();done(7);
move(8);click({design:"parallel"});check();click({switch:"a"});check();click({switch:"b"});check();click({switch:"a"});check();done(8);
move(9);for(const choice of ["small","large"]){click({choice});check()}click({answer:"correct"});check();done(9);
move(10);for(const choice of ["single","series"]){click({choice});check()}click({answer:"correct"});check();done(10);
move(11);for(const choice of ["same","reverse"]){click({choice});check()}click({answer:"same"});check();done(11);
move(12);click({cut:"x"});click({cut:"y"});check();done(12);
move(13);for(const key of ["wire","bulb"]){click({inspect:key});click({fix:key})}check();done(13);
move(14);click({final:"direction",value:"same"});click({final:"material",value:"clip"});click({final:"contact",value:"true"});check();done(14);
assert.equal(Object.keys(saved().completed).length,14,"All 14 missions must be completed");
assert.equal(saved().active,14);
assert.ok(saved().notes.length>=14,"Observation journal should retain a discovery for each completed mission");
const scenes=Array.from({length:14},(_,i)=>window.AkariScenes.render(i+1));
assert.equal(new Set(scenes).size,14,"Each mission needs a distinct scene illustration");
const landmarks=["village","bridge","garden","tower","port","museum","lighthouse"].map(place=>window.AkariScenes.landmark(place));
assert.equal(new Set(landmarks).size,7,"All seven regions need a unique illustrated landmark");
assert.ok(landmarks.every(svg=>svg.includes("class=\"window\"")),"Each landmark should have a lightable window");
assert.ok(window.AkariArt.material("clip").includes("<svg"));
assert.ok(window.AkariArt.circuit("series",false,false).includes("<svg"));
assert.ok(window.AkariArt.bulb(true).includes("<svg"));
assert.ok(window.AkariCharacter.render().includes("tiranon-mouth-happy"));
assert.equal(el("litPlaceCount").textContent,14,"Restoration progress should reach 14 regions");
console.log("Akari Quest: 14/14 missions passed; dangerous battery short rejected; art templates rendered.");
