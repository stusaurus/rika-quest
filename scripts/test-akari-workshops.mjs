import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const engine=process.env.ENGINE||'chromium',width=+(process.env.WIDTH||768),baseline=process.env.BASELINE==='1';
const browser=await ({chromium,webkit}[engine]).launch();
const folder='artifacts/workshop-'+engine+'-'+width+(baseline?'-before':'');
mkdirSync(folder,{recursive:true});
const context=await browser.newContext({viewport:{width,height:width<=390?844:1024},hasTouch:width<=1024,isMobile:width<=1024,reducedMotion:'reduce'});
const page=await context.newPage(),errors=[],network=[];
page.on('pageerror',e=>errors.push(e.message));await context.route(/^https?:/,r=>{network.push(r.request().url());return r.abort()});
const fixture=JSON.parse(readFileSync('tests/fixtures/akari-workshop-actions.json'));
const key=baseline?'rika-akari-quest-v2':'akari-workshops-v1';
async function press(loc){await loc.scrollIntoViewIfNeeded();if(width<=1024)await loc.tap({timeout:4500});else await loc.click({timeout:4500});}
const click=sel=>press(page.locator(sel).first());
const connect=async(a,b)=>{await click('[data-t="'+a+'"]');await click('[data-t="'+b+'"]')};
const completed=[],metrics=[],direct=new Set();
let sawClockShort=false;
async function directAction(loc,stage){
 const selector=await loc.evaluate(b=>[...document.querySelectorAll('.workshop-hit')].find(g=>document.querySelector('#workspace').querySelector(g.dataset.workshopControl)===b)?.dataset.workshopControl);
 if(!selector)return false;
 const target=page.locator('.workshop-hit').filter({visible:true});
 for(const g of await target.all()){
  if(await g.getAttribute('data-workshop-control')===selector){await press(g);direct.add(stage);return true;}
 }
 return false;
}
async function experiment(stage){
 if(stage===1||stage===2){
  if(stage===1)await connect('P','L');
  await connect('R','N');await click('[data-first-reason="'+(stage===1?'loop':'joined')+'"]');
  if(stage===2){
   for(const [id,value] of [['a','dark'],['b','lit'],['c','lit']])await click('[data-transfer-answer="'+id+'"][data-transfer-value="'+value+'"]');
   await click('[data-transfer-reason="path"]');await click('[data-transfer-verify]');
  }
 }else if(stage===3){
  await click('[data-m3-gap]');
  for(const [id,guess] of [['wood','dark'],['clip','lit']]){
   await click('[data-m3-find="'+id+'"]');await click('[data-m3-guess="'+guess+'"]');await click('[data-m3-gap]');
   if(id==='wood')await click('[data-m3-gap]');
  }
  await click('[data-m3-reason="metal"]');
 }else{
  for(const action of fixture[stage]){
   const selector=action==='check'?'#checkBtn':Object.entries(action).map(([k,v])=>{
    const name='data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
    return v==='1'?'['+name+']':'['+name+'="'+v+'"]';
   }).join('');
   const loc=page.locator(selector+':visible:not(:disabled)').last();
   // Some probes represent intentionally unavailable actions. Completion
   // below requires the real game's persisted success for this mission.
   if(await loc.isVisible()&&await loc.isEnabled()){
    if(baseline||!(await directAction(loc,stage)))await press(loc);
    const clock=page.locator('.builder-direct svg[data-lamp-state]');
    if(!baseline&&stage===6&&action.builderCause==='short'&&await clock.getAttribute('data-lamp-state')==='short'){
     sawClockShort=true;
     await page.waitForTimeout(1200);
     assert.equal(await page.locator('.workshop-fire').count(),1,'Fire lasts while terminals remain shorted');
    }
   }
  }
 }
}
try{
 await page.goto(pathToFileURL(resolve('artifacts/'+(baseline?'akari-mission1-painted.html':'akari-fourteen.html'))).href);
 for(let stage=1;stage<=14;stage++){
  await page.waitForSelector('#storyScene[data-stage="'+stage+'"]',{state:'attached'});
  console.log('enter',stage);
  const view=page.locator('#workspace');
  await view.scrollIntoViewIfNeeded();
  const first=view.locator('svg[data-workshop],.circuit-board,.garden-circuit-svg,.battery-lab-svg,.dual-circuit-svg,.safety-svg,.finale-circuit-svg').first();
  if(await first.isVisible())await first.scrollIntoViewIfNeeded();
  await page.screenshot({path:folder+'/mission-'+stage+'.jpg',quality:72});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  metrics.push({stage,overflow});assert.ok(overflow<=1,'page overflow in '+stage);
  if(stage===9&&width===768){
   await page.setViewportSize({width:1024,height:768});await page.reload();
   await page.waitForSelector('#storyScene[data-stage="9"]',{state:'attached'});
   await page.setViewportSize({width,height:1024});
  }
  await experiment(stage);
  assert.ok(await page.evaluate(([k,s])=>JSON.parse(localStorage.getItem(k))?.completed[s],[key,stage]),'Missing real completion for '+stage+' / '+await page.locator('#feedbackText').innerText());
  completed.push(stage);
  if(stage<14)await click('#nextBtn');
 }
 if(!baseline)assert.ok(sawClockShort,'Observed clock short');
 if(!baseline)assert.ok(direct.size>=8,'Diagram actions: '+[...direct]);
 console.log('Verified diagram actions',Array.from(direct));
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);console.log('Completed',completed,'Layout',JSON.stringify(metrics));
}finally{writeFileSync(folder+'/results.json',JSON.stringify({completed,metrics,errors,network,direct:[...direct]}));await browser.close();}
