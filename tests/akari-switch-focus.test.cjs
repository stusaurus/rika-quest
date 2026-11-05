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
