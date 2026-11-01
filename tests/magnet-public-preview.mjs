import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const url = 'https://raw.githack.com/stusaurus/rika-quest/magnet-preview/games/magnet/index.html';
const browser = await chromium.launch();
try {
  const context = await browser.newContext({viewport:{width:390,height:844},locale:'ja-JP'});
  // raw.githack.com explicitly documents this opt-in cookie for automated browsing.
  // Human visitors may see a one-time confirmation interstitial.
  await context.addCookies([{name:'__Http-phish',value:'1',domain:'raw.githack.com',path:'/',secure:true}]);
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const responses=[];page.on('response',res=>{
    if(res.url().includes('/games/magnet/') && (res.url().endsWith('.mjs')||res.url().endsWith('.html')))responses.push({url:res.url(),status:res.status()});
  });
  const main=await page.goto(url,{waitUntil:'networkidle',timeout:45000});
  assert.equal(main?.status(),200,'Preview HTML must load over HTTPS');
  assert.ok((await page.title()).includes('マグネット・クエスト'),'HTML must render, not appear as plaintext');
  assert.equal(await page.locator('#app').getAttribute('data-phase'),'0','Initial game state must render');
  const module=responses.find(x=>x.url.endsWith('engine.mjs'));
  assert.equal(module?.status,200,'Game module should be loaded');
  assert.deepEqual(errors,[],'No JavaScript errors on preview');
  for(const value of ['left','center','right']){
    await page.locator('button[data-action="probe"][data-value="'+value+'"]').click();
  }
  await page.locator('button[data-action="next"]').click();
  assert.equal(await page.locator('#app').getAttribute('data-phase'),'1');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  console.log('PASS: public mobile preview responds and game can be controlled: '+url);
  await context.close();
} finally {await browser.close();}
