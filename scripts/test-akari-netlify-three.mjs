// Operate the actual scoped deploy folder (no fake state injection).
import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const engine=process.env.ENGINE||'chromium';
const width=Number(process.env.WIDTH||768);
const folder='artifacts/netlify-akari-three';
const bytes=readFileSync(folder+'/index.html');
assert.equal(Buffer.compare(bytes,readFileSync(folder+'/akari-missions-1-3.html')),0,'download matches index');
const manifest=JSON.parse(readFileSync(folder+'/build-manifest.json','utf8'));
assert.equal(manifest.scope,'mission-1-3-only');
assert.deepEqual(manifest.playableMissions,[1,2,3]);
assert.equal(manifest.sha256,createHash('sha256').update(bytes).digest('hex'));
assert.match(readFileSync(folder+'/_headers','utf8'),/X-Robots-Tag: noindex/);
assert.equal(readFileSync(folder+'/robots.txt','utf8').trim(),'User-agent: *\nDisallow: /');
const browser=await ({chromium,webkit}[engine]).launch();
const context=await browser.newContext({
  viewport:{width,height:width<=390?844:1024},
  hasTouch:true,isMobile:true,reducedMotion:'reduce',
});
const page=await context.newPage();
const pageErrors=[],requests=[];
page.on('pageerror',e=>pageErrors.push(String(e)));
await context.route(/^https?:/,route=>{requests.push(route.request().url());return route.abort()});
const press=async sel=>{
  const element=page.locator(sel).first();
  await element.scrollIntoViewIfNeeded();
  await element.tap({timeout:6000});
};
const connect=async(a,b)=>{await press('[data-t="'+a+'"]');await press('[data-t="'+b+'"]')};
const achievements=[];
const output='artifacts/three-review-'+engine+'-'+width;
mkdirSync(output,{recursive:true});
try{
  await page.goto(pathToFileURL(resolve(folder+'/index.html')).href);
  assert.equal(await page.locator('meta[name="akari-trial-scope"]').getAttribute('content'),'mission-1-3-only');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,nofollow');
  assert.equal(await page.locator('#missionList [data-mission]').count(),3);
  assert.equal(await page.locator('#missionList [data-mission="4"]').count(),0);
  for(let stage=1;stage<=3;stage++){
    await page.waitForSelector('#storyScene[data-stage="'+stage+'"]');
    const wide=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(wide<=1,'Viewport overflow stage '+stage+': '+wide);
    await page.screenshot({path:output+'/stage-'+stage+'.png',fullPage:true,animations:'disabled'});
    if(stage===1){await connect('P','L');await connect('R','N');await press('[data-first-reason="loop"]')}
    if(stage===2){
      await connect('R','N');await press('[data-first-reason="joined"]');
      for(const [id,value] of [['a','dark'],['b','lit'],['c','lit']])
        await press('[data-transfer-answer="'+id+'"][data-transfer-value="'+value+'"]');
      await press('[data-transfer-reason="path"]');
      await press('[data-transfer-verify]');
    }
    if(stage===3){
      await press('[data-m3-gap]');
      for(const [id,guess] of [['wood','dark'],['clip','lit']]){
        await press('[data-m3-find="'+id+'"]');
        await press('[data-m3-guess="'+guess+'"]');
        await press('[data-m3-gap]');
        if(id==='wood')await press('[data-m3-gap]');
      }
      await press('[data-m3-reason="metal"]');
    }
    const done=await page.evaluate(stage=>{
      const state=JSON.parse(localStorage.getItem('rika-akari-three-netlify-v1')||'null');
      return !!state?.completed?.[stage];
    },stage);
    assert.ok(done,'Missing real completion '+stage);
    achievements.push(stage);
    if(stage<3)await press('#nextBtn');
  }
  assert.match(await page.locator('#nextBtn').innerText(),/もういちど/);
  await press('#nextBtn');
  await page.waitForSelector('#storyScene[data-stage="1"]');
  await page.reload();
  await page.waitForSelector('#storyScene[data-stage="1"]');
  assert.equal(await page.locator('#missionList [data-mission]').count(),3);
  assert.deepEqual(pageErrors,[]);
  assert.deepEqual(requests,[]);
  console.log('PASS scoped missions 1-3',engine,width,achievements);
}finally{
  writeFileSync(output+'/results.json',JSON.stringify({
    engine,width,achievements,pageErrors,requests,
  },null,2));
  await browser.close();
}
