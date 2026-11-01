import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css'};
const server=createServer(async (req,res)=>{
 try{
  let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(p.endsWith('/'))p+='index.html';
  const full=resolve(root,'.'+p);
  if(!full.startsWith(root+sep))throw Error('forbidden');
  const body=await readFile(full);
  res.setHeader('Content-Type',mime[extname(full)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');res.end(body);
 }catch(e){res.writeHead(404);res.end('Not found');}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const address='http://127.0.0.1:'+server.address().port+'/games/magnet/';
const proofDir=resolve(root,'tests/.evidence/magnet');
await mkdir(proofDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const report=[];
const click=(page,action,value)=>page.locator('button[data-action="'+action+'"][data-value="'+value+'"]').click();
const phase=page=>page.locator('#app').getAttribute('data-phase');
try{
 for(const width of [320,390,430,1440]){
  const context=await browser.newContext({viewport:{width,height:width===1440?900:844},deviceScaleFactor:1,locale:'ja-JP'});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const response=await page.goto(address,{waitUntil:'networkidle'});
  assert.equal(response.status(),200,'HTTP on width '+width);
  assert.equal(await phase(page),'0','new state phase');
  const initOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(initOverflow<=2,'Initial horizontal overflow '+width+': '+initOverflow);
  for(const spot of ['left','center','right'])await click(page,'probe',spot);
  assert.equal(await page.locator('.observations .obs').count(),3,'all mandatory probes were recorded');
  await page.locator('button[data-action="next"]').click();
  assert.equal(await phase(page),'1');
  await click(page,'answer','center');assert.equal(await phase(page),'1','wrong guess must not complete');
  await click(page,'answer','both');assert.equal(await phase(page),'2');
  await click(page,'reference','left');await click(page,'reference','right');
  assert.equal(await page.locator('.observations .obs').count(),2);
  await page.reload({waitUntil:'networkidle'});assert.equal(await phase(page),'2','save/reload phase');
  assert.equal(await page.locator('.observations .obs').count(),2,'save/reload reference results');
  await click(page,'identify','S');assert.equal(await phase(page),'2','wrong identification rejected');
  await click(page,'identify','N');assert.equal(await phase(page),'3');
  await click(page,'pick','N');
  const distance=page.locator('#distance');
  await distance.focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#distance-value').textContent(),'2 cm');
  await page.locator('button[data-action="gate"]').click();
  assert.equal(await phase(page),'3','repulsion cannot open gate');
  await click(page,'pick','S');await page.locator('button[data-action="gate"]').click();
  assert.equal(await phase(page),'4','opposite poles open gate');
  assert.ok((await page.locator('#task').textContent()).includes('目覚めた'));
  await page.reload({waitUntil:'networkidle'});assert.equal(await phase(page),'4','clear persists after reload');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,'Clear horizontal overflow '+width+': '+overflow);
  assert.deepEqual(errors,[],'no browser JavaScript errors');
  await page.screenshot({path:resolve(proofDir,'clear-'+width+'.png'),fullPage:true});
  await page.locator('button[data-action="reset"]').click();
  assert.equal(await phase(page),'0','reset clears game');
  report.push({width,steps:'complete',overflow,consoleErrors:errors.length});
  await context.close();
 }
 console.log('PASS: Magnet Quest Playwright visual/interaction walkthrough '+JSON.stringify(report));
}finally{await browser.close();await new Promise(ok=>server.close(ok));}
