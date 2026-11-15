const{test}=require('node:test');const assert=require('node:assert/strict');
const{readFileSync}=require('node:fs');const vm=require('node:vm');const window={};
vm.runInNewContext(readFileSync('games/akari/materials-model.js','utf8'),{window});
const M=window.AkariMaterials;
function ready(){let s=M.act(M.initial(),{type:'inspect'});for(const id of ['clip','aluminum','wood','plastic'])s=M.act(s,{type:'find',id});return s;}
function place(s,id,contact='both',guess='lit'){s=M.act(s,{type:'select',id});s=M.act(s,{type:'guess',value:guess});return M.act(s,{type:'place',id,contact});}
test('bare steel and aluminum close the loop; dry wood and plastic do not',()=>{
 for(const [id,lit] of [['clip',true],['aluminum',true],['wood',false],['plastic',false]]){
  const s=place(ready(),id);assert.equal(M.evaluate(s).lit,lit);assert.equal(s.tests[id].actual,lit?'lit':'dark');
 }
});
test('one-sided contact cannot light or become a material-property observation',()=>{
 for(const contact of ['left','right','none']){const s=place(ready(),'clip',contact);assert.equal(M.evaluate(s).lit,false);assert.equal(Object.keys(s.tests).length,0);}
});
test('a disconnected lead causes darkness without misclassifying metal',()=>{
 let s=ready();s=M.act(s,{type:'cut',key:'N-R'});s=place(s,'clip');assert.equal(M.evaluate(s).lit,false);assert.equal(s.tests.clip,undefined);
 s=M.act(s,{type:'wire',from:'R',to:'N'});assert.equal(M.evaluate(s).lit,true);assert.equal(s.tests.clip.actual,'lit');
});
test('direct battery short takes priority over an otherwise closed bulb loop',()=>{
 let s=place(ready(),'clip');s=M.act(s,{type:'wire',from:'P',to:'N'});assert.equal(M.evaluate(s).short,true);assert.equal(M.evaluate(s).lit,false);assert.equal(M.canFinish(s),false);
 s=M.act(s,{type:'cut',key:'N-P'});assert.equal(M.evaluate(s).short,false);assert.equal(M.evaluate(s).lit,true);
});
test('guess is required before insertion and may be wrong without blocking learning',()=>{
 let s=ready();s=M.act(s,{type:'place',id:'clip',contact:'both'});assert.equal(s.installed,null);
 s=place(s,'wood','both','lit');assert.equal(s.tests.wood.guess,'lit');assert.equal(s.tests.wood.actual,'dark');
});
test('a correct-looking metal choice cannot finish without a real comparison',()=>{
 let s=place(ready(),'clip');s=M.act(s,{type:'reason',id:'metal'});assert.equal(M.canFinish(s),false);
 s=place(s,'wood');s=place(s,'aluminum');s=M.act(s,{type:'reason',id:'metal'});assert.equal(M.canFinish(s),true);
});
test('a wrong explanation never clears a valid comparison',()=>{
 let s=place(ready(),'plastic');s=place(s,'clip');for(const id of ['shiny','one'])assert.equal(M.canFinish(M.act(s,{type:'reason',id})),false);
 assert.equal(M.canFinish(M.act(s,{type:'reason',id:'metal'})),true);
});
test('taking a specimen out opens the circuit and keeps the experiment record',()=>{
 let s=place(ready(),'clip');s=M.act(s,{type:'remove'});assert.equal(M.evaluate(s).lit,false);assert.equal(s.installed,null);assert.equal(s.tests.clip.actual,'lit');
});
test('save normalization retains observations and physical contact state',()=>{
 let s=place(ready(),'wood');s=place(s,'aluminum','left');const restored=M.normalize(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.installed,'aluminum');assert.equal(restored.contact,'left');assert.equal(restored.tests.wood.actual,'dark');assert.equal(M.evaluate(restored).lit,false);
});
test('malformed saves cannot invent material results or unknown wires',()=>{
 const s=M.normalize({version:1,found:['wood','fake','wood'],installed:'fake',contact:'both',wires:[['P','N'],['N','P'],['fake','L']],tests:{wood:{guess:'lit',actual:'lit'}}});
 assert.equal(s.found.length,1);assert.equal(s.installed,null);assert.equal(s.wires.length,1);assert.equal(s.tests.wood,undefined);
});
