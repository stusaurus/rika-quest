const {test,expect}=require('@playwright/test');
const history=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('furiko-experiments-v1')||'{"records":[]}').records);
const found=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('furiko-clocktower-discoveries-v028')||'{}'));
async function range(page,id,value,min){const el=page.locator(id);await el.focus();await el.press('Home');const step=Number(await el.getAttribute('step'))||1;for(let i=min;i<value;i+=step)await el.press('ArrowRight');await expect(el).toHaveValue(String(value));}
async function enter(page){await page.goto('/games/furiko/');await page.locator('#heroStartGame').click();await expect(page.locator('.exp22-apparatus')).toBeVisible();}
async function lab(page){await page.locator('.exp22-apparatus').click();await expect(page.locator('.stage-viewport')).toHaveClass(/exp23-experiment/);await expect(page.locator('[data-rq-measure]')).toBeVisible();}
async function measure(page){const n=(await history(page)).length;await page.locator('[data-rq-measure]').click();await expect.poll(async()=> (await history(page)).length,{timeout:15000}).toBe(n+1);await expect(page.locator('[data-rq-result]')).not.toContainText('観察中');}
for(const width of [320,390,430,1440])test('stage one complete '+width,async({page},info)=>{
 await page.setViewportSize({width,height:width===1440?900:844});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const shots=async name=>{await page.screenshot({path:info.outputPath(name+'.png'),fullPage:true});const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('.exp22-apparatus,#runStage,[data-rq-measure],#exp29-length,[data-exp29-go]')].map(e=>{const r=e.getBoundingClientRect();return {label:e.getAttribute('aria-label')||e.textContent.slice(0,60),x:r.x,y:r.y,width:r.width,height:r.height}})}));await info.attach(name+'-layout',{body:JSON.stringify(layout),contentType:'application/json'});expect(layout.scrollWidth).toBeLessThanOrEqual(width);};
 test.info().annotations.push({type:'save-setup',description:'Fresh browser context; no localStorage or game-state injection'});const started=Date.now();await enter(page);await expect(page.locator('.rq-explore-help')).toBeVisible();await shots('explore');await lab(page);await expect(page.locator('.rq-explore-help')).toBeHidden();
 // Capture the actual open laboratory before any measurement; previous screenshots
 // were taken only after experiments and could not establish panel occlusion.
 await shots('lab-open');
 const labGeometry=await page.evaluate(()=>{
  const box=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,visible:getComputedStyle(el).display!=='none'};};
  return {viewport:{width:innerWidth,height:innerHeight},panel:box('.stage-command-panel'),visual:box('.stage-scene .visual-frame'),canvas:box('.stage-scene canvas'),measure:box('[data-rq-measure]')};
 });
 await info.attach('lab-open-geometry',{body:JSON.stringify(labGeometry,null,2),contentType:'application/json'});
 expect(labGeometry.visual).not.toBeNull();
 expect(labGeometry.panel).not.toBeNull();
 // On phones, the scrollable command sheet must start below the pendulum visual.
 if(width<=480){
  expect(labGeometry.panel.y).toBeGreaterThanOrEqual(labGeometry.visual.y+labGeometry.visual.height);
  expect(labGeometry.panel.y+labGeometry.panel.height).toBeLessThanOrEqual(844+1);
 }
 // A fresh browser context provides a new save without injecting progress.
 await measure(page);await range(page,'#rng-length',25,10);await measure(page);expect((await found(page)).length).toBe(true);await shots('length-discovery');
 await page.reload();await enterAfterReload(page);await lab(page);expect((await found(page)).length).toBe(true);expect((await history(page)).length).toBe(2);
 // Restore stage controls through UI; reloaded controls reset to 60cm.
 await range(page,'#rng-length',25,10);await range(page,'#rng-mass',40,5); // mass step is 5: helper below uses native End/Home step count instead.
 await measure(page);
 // A reload restores records, but controls may reset. Establish a controlled pair explicitly.
 await range(page,'#rng-length',25,10);await page.locator('#rng-mass').press('End');await measure(page);expect((await found(page)).mass).toBe(true);
 await range(page,'#rng-amp',5,5);await measure(page);expect((await found(page)).record).toBe(true);await shots('three-discoveries');
 await page.reload();await enterAfterReload(page);await lab(page);expect(Object.values(await found(page)).filter(v=>v===true)).toHaveLength(3);
 await range(page,'#rng-length',25,10);await page.locator('#runStage').click();await expect.poll(()=>page.evaluate(()=>Boolean(state.progress.s01)),{timeout:15000}).toBe(true);
 const back=page.locator('[data-exp24-back]');if(await back.isVisible())await back.click();else await page.locator('#exp22Interact').click();
 await expect(page.locator('.stage-viewport')).toHaveClass(/exp23-exploring/);
 await expect(page.locator('.rq-explore-help')).toBeVisible();
 await page.locator('.exp28-ledger').click();await expect(page.locator('.exp28-panel')).toContainText('3');await page.locator('.exp28-close').click();
 await page.locator('.exp29-gate-button').click();await expect(page.locator('#exp29-length')).toBeVisible({timeout:15000});
 await page.locator('[data-exp29-go="unlock"]').click();expect(await page.evaluate(()=>localStorage.getItem('furiko-clocktower-gate-v029'))).not.toBe('true');
 await range(page,'#exp29-length',25,10);await page.locator('[data-exp29-go="unlock"]').click();await expect(page.locator('[data-exp29-go="next"]')).toBeVisible();await shots('gate-open');
 await page.locator('[data-exp29-go="next"]').click();await expect.poll(()=>page.evaluate(()=>state.sid)).toBe('s02');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);await shots('stage2');await page.reload();await expect(page.locator('#heroStartGame')).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('furiko-clocktower-gate-v029'))).toBe('true');await info.attach('timing',{body:JSON.stringify({elapsedMs:Date.now()-started,width}),contentType:'application/json'});
});
async function enterAfterReload(page){await page.locator('#heroStartGame').click();await expect(page.locator('.exp22-apparatus')).toBeVisible();}
