"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "games/akari/switch-lab.js"), "utf8");
const context = {window:{}};
vm.runInNewContext(source, context, {filename:"switch-lab.js"});
const lab = context.window.AkariSwitchLab;
const series = [["P","A1"],["A2","B1"],["B2","L"],["R","N"]];
const parallel = [["P","A1"],["P","B1"],["A2","L"],["B2","L"],["R","N"]];
const trialsFor = wires => Object.fromEntries(lab.codes.map(code => [code, {
 ...lab.evaluate(wires, code[0]==="1", code[1]==="1"),
 signature:lab.signature(wires)
}]));
test("series requires both switches; four observations unlock only the matching reasoning",()=>{
 assert.deepEqual(Array.from(lab.codes,c=>lab.evaluate(series,c[0]==="1",c[1]==="1").lit),[false,false,false,true]);
 assert.equal(lab.expected(7,series,trialsFor(series),"both"),true);
 assert.equal(lab.expected(7,series,trialsFor(series),"either"),false);
});
test("parallel lights with either switch and rejects the wrong reasoning",()=>{
 assert.deepEqual(Array.from(lab.codes,c=>lab.evaluate(parallel,c[0]==="1",c[1]==="1").lit),[false,true,true,true]);
 assert.equal(lab.expected(8,parallel,trialsFor(parallel),"either"),true);
 assert.equal(lab.expected(8,parallel,trialsFor(parallel),"both"),false);
});
test("an unsafe bypass is recognized as a short and cannot complete",()=>{
 const wires=[["P","N"]];
 assert.equal(lab.evaluate(wires,false,false).short,true);
 assert.equal(lab.expected(7,wires,trialsFor(wires),"both"),false);
});
test("visual choices and four experiment cards remain interactive and accessible",()=>{
 const html=lab.render(7,series,null,false,false,trialsFor(series));
 assert.equal((html.match(/data-net-case="/g)||[]).length,4);
 assert.match(html,/data-net-reason="both"/);
 assert.match(html,/data-net-reason="either"/);
 assert.match(html,/network-reason-diagram/);
 assert.match(html,/aria-pressed="false"/);
 assert.match(html,/network-switch-track/);
});
test("wire-cut dispatch distinguishes switch and builder workspaces",()=>{
 const source=fs.readFileSync(path.join(root,"games/akari/wire-cut.js"),"utf8");
 assert.match(source,/board\.closest\("\.network-lab"\)\?"network":"builder"/);
 assert.match(source,/akari-wire-cut/);
});

test("changing the wiring invalidates previously observed results",()=>{
 const old=trialsFor(series);
 const changed=[...series,["P","B1"]];
 assert.notEqual(lab.signature(series),lab.signature(changed));
 assert.equal(lab.expected(7,changed,old,"both"),false);
});
test("all four case cards reflect the currently selected switch state",()=>{
 const html=lab.render(8,parallel,null,true,false,trialsFor(parallel));
 assert.equal((html.match(/data-net-case="/g)||[]).length,4);
 assert.match(html,/data-net-case="10" aria-pressed="true"/);
 assert.match(html,/data-net-case="00" aria-pressed="false"/);
});
test("a cut lead can break a previously complete series circuit",()=>{
 const disconnected=series.filter(([a,b])=>!(a==="A2"&&b==="B1"));
 assert.equal(lab.evaluate(series,true,true).lit,true);
 assert.equal(lab.evaluate(disconnected,true,true).lit,false);
 assert.equal(lab.expected(7,disconnected,trialsFor(series),"both"),false);
});

test("visual feedback follows measured circuit truth for lit, dark and short states",()=>{
 const lit=lab.render(7,series,null,true,true,trialsFor(series));
 const dark=lab.render(7,series,null,false,false,trialsFor(series));
 const shortWires=[["P","N"]];
 const unsafe=lab.render(7,shortWires,null,false,false,trialsFor(shortWires));
 assert.match(lit,/builder-live live-lit/);
 assert.match(lit,/network-trial measured current trial-lit/);
 assert.match(dark,/builder-live live-dark/);
 assert.match(unsafe,/builder-live live-short/);
 assert.match(unsafe,/trial-short/);
});
test("visual feedback styles respect reduced-motion and retain visible short warnings",()=>{
 const css=fs.readFileSync(path.join(root,"games/akari/switch-focus.css"),"utf8");
 assert.match(css,/\.builder-live\.live-short/);
 assert.match(css,/\.builder-live\.live-lit/);
 assert.match(css,/@media\(prefers-reduced-motion:no-preference\)/);
});

test("the bulb and visible current path illuminate without waiting for four trials",()=>{
 const html=lab.render(7,series,null,true,true,{},"both");
 assert.match(html,/builder-live live-lit/);
 assert.match(html,/network-flow-segment/);
 assert.match(html,/data-flow-edge="A1-A2"/);
 assert.match(html,/4つ の けっか|4つの|あと 4つ/);
});
test("an open circuit never shows a lit current path",()=>{
 const broken=series.filter(([a,b])=>!(a==="A2"&&b==="B1"));
 const html=lab.render(7,broken,null,true,true,{});
 assert.doesNotMatch(html,/network-flow-segment/);
 assert.match(html,/builder-live live-dark/);
});

test("a diagnosed short shows the actual unsafe bypass, not a glowing bulb",()=>{
 const wires=[["P","N"]],trials=trialsFor(wires);
 const without=lab.render(7,wires,null,false,false,trials,null,null);
 assert.doesNotMatch(without,/data-flow-edge="N-P"/);
 const withDiagnosis=lab.render(7,wires,null,false,false,trials,null,{code:"00",signature:lab.signature(wires),kind:"short"});
 assert.match(withDiagnosis,/data-flow-edge="N-P"/);
 assert.match(withDiagnosis,/builder-live live-short/);
 assert.doesNotMatch(withDiagnosis,/builder-live live-lit/);
});

test("reasoning diagrams appear only after four observations, not before",()=>{
 const partial=trialsFor(series);
 delete partial["01"];
 const before=lab.render(7,series,null,true,true,partial);
 assert.doesNotMatch(before,/data-net-reason="both"/);
 assert.doesNotMatch(before,/data-net-reason="either"/);
 const after=lab.render(7,series,null,true,true,trialsFor(series));
 assert.match(after,/data-net-reason="both"/);
 assert.match(after,/data-net-reason="either"/);
 assert.match(after,/🔋 ━ A ━ B ━ 💡/);
 assert.match(after,/┏━ A ━┓/);
});
test("visually choosing the wrong circuit explanation never enables completion",()=>{
 const wrong=lab.render(7,series,null,true,true,trialsFor(series),"either");
 assert.match(wrong,/data-net-submit="1" class="builder-submit" disabled/);
 const right=lab.render(7,series,null,true,true,trialsFor(series),"both");
 assert.match(right,/data-net-submit="1" class="builder-submit" >/);
});

test("unobserved switch combinations are not presented as dark measurements",()=>{
 const unobserved=lab.render(7,series,null,false,false,{});
 assert.equal((unobserved.match(/trial-unknown/g)||[]).length,4);
 assert.equal((unobserved.match(/trial-dark/g)||[]).length,0);
 const partial=trialsFor(series);
 delete partial["01"];
 const html=lab.render(7,series,null,false,false,partial);
 assert.equal((html.match(/trial-unknown/g)||[]).length,1);
 assert.match(html,/data-net-case="01"[\s\S]*?network-trial-outcome">❔ まだ/);
 const css=fs.readFileSync(path.join(root,"games/akari/switch-focus.css"),"utf8");
 assert.ok(css.includes(".network-trial.trial-unknown .network-trial-outcome::before"));
 assert.ok(css.includes('content:"?"'));
});
