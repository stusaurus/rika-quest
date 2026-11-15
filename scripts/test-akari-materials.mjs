import assert from 'node:assert/strict';
import{chromium,webkit}from'playwright';
import{createServer}from'node:http';
import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{join,normalize,extname}from'node:path';
import{pathToFileURL}from'node:url';
const root=process.cwd(),origin='http://127.0.0.1:8773';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff':'font/woff'};
const server=createServer((req,res)=>{const path=normalize(join(root,new URL(req.url,origin).pathname));if(!path.startsWith(root+'/'))return res.writeHead(403).end();try{const file=path.endsWith('/')?path+'index.html':path;res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(8773,'127.0.0.1',r));
const out='artifacts/akari-materials';mkdirSync(out,{recursive:true});const results=[];
function visibleCutStroke(path){
 const length=path.getTotalLength(),matrix=path.getScreenCTM();
 const board=path.closest('.circuit-board');
 const screen=at=>{const p=path.getPointAtLength(at);return new DOMPoint(p.x,p.y).matrixTransform(matrix);};
 const clear=p=>p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight&&
  !!document.elementFromPoint(p.x,p.y)?.closest('.circuit-board')&&
  !document.elementFromPoint(p.x,p.y)?.closest('button,a,input,select,summary,[role="button"]');
 for(const fraction of [.5,.4,.6]){
  const at=length*fraction,p=screen(at),a=screen(Math.max(0,at-3)),b=screen(Math.min(length,at+3));
  const dx=b.x-a.x,dy=b.y-a.y,mag=Math.hypot(dx,dy)||1,n={x:-dy/mag,y:dx/mag};
  for(const [from,to] of [[-12,36],[-8,36],[12,-36],[8,-36],[-26,26],[-42,42]]){
   const start={x:p.x+n.x*from,y:p.y+n.y*from},end={x:p.x+n.x*to,y:p.y+n.y*to};
   if(clear(start)&&clear(end))return{start,end};
  }
 }
 throw new Error('No visible wire-cut stroke avoids the actual control buttons: '+board.getBoundingClientRect().toJSON());
}
try{
 for(const[engine,type]of[['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch({headless:true,...(engine==='chromium'&&process.env.AKARI_CHROMIUM_PATH?{executablePath:process.env.AKARI_CHROMIUM_PATH}: {})});
  try{for(const[width,height]of[[320,740],[390,844],[1440,1000]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<741,isMobile:width<741,reducedMotion:'reduce'});
   const p=await context.newPage(),errors=[],failed=[];p.on('pageerror',e=>errors.push(String(e)));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
   const prefix=out+'/'+engine+'-'+width,checks=[];
   const shot=async name=>{await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:prefix+'-'+name+'.png',fullPage:true,animations:'disabled'});};
   const click=async selector=>{const el=p.locator(selector);if(width<741)await el.tap();else await el.click();};
   const state=async expected=>{await p.waitForFunction(v=>document.querySelector('.m3-bench')?.dataset.m3Status===v,expected);};
   const connect=async(a,b)=>{await click('[data-t="'+a+'"]');await click('[data-t="'+b+'"]');};
   const select=async(id,guess='lit')=>{await click('[data-m3-item="'+id+'"]');await click('[data-m3-guess="'+guess+'"]');};
   const bounds=async locator=>{await locator.scrollIntoViewIfNeeded();return locator.boundingBox();};
   async function drag(id,{contact='both',nativeTouch=false,remove=false}={}){
    const source=p.locator(remove?'[data-m3-gap]':'[data-m3-item="'+id+'"]');
    const r=await bounds(source),c=await p.locator('.m3-circuit').boundingBox();
    const start={x:r.x+r.width/2,y:r.y+r.height/2};
    const end=remove?{x:c.x+15,y:c.y+c.height-5}:{x:c.x+c.width*({both:180,left:60,right:300}[contact]/400),y:c.y+c.height*65/250};
    const scrollBefore=await p.evaluate(()=>scrollY);
    if(nativeTouch&&engine==='chromium'){
     const cdp=await context.newCDPSession(p);
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});
     for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/12,y:start.y+(end.y-start.y)*i/12,id:1}]});
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
    }else if(nativeTouch&&engine==='webkit'){
     // WebKit has no Playwright touch-swipe API. Exercise touch PointerEvents,
     // separately report this synthetic path; it is not a real iPhone swipe.
     await p.evaluate(({start,end})=>{
      const args=(x,y)=>({bubbles:true,cancelable:true,pointerId:41,pointerType:'touch',isPrimary:true,button:0,buttons:1,clientX:x,clientY:y});
      document.elementFromPoint(start.x,start.y).dispatchEvent(new PointerEvent('pointerdown',args(start.x,start.y)));
      for(let i=1;i<=12;i++)document.dispatchEvent(new PointerEvent('pointermove',args(start.x+(end.x-start.x)*i/12,start.y+(end.y-start.y)*i/12)));
      document.dispatchEvent(new PointerEvent('pointerup',{...args(end.x,end.y),buttons:0}));
     },{start,end});
    }else{await p.mouse.move(start.x,start.y);await p.mouse.down();await p.mouse.move(end.x,end.y,{steps:12});await p.mouse.up();}
    await p.waitForTimeout(230);
    assert.equal(await p.evaluate(()=>scrollY),scrollBefore,'Dragging does not become page scrolling');
   }
   await p.goto(origin+'/games/akari/?visual=painted',{waitUntil:'networkidle'});
   await p.waitForFunction(()=>document.body.dataset.paintedMission==='1');
   await connect('P','L');await connect('R','N');await click('[data-first-reason="loop"]');await click('#nextBtn');
   await p.waitForFunction(()=>document.body.dataset.paintedMission==='2');
   assert.equal(await p.locator('.wire-chip').count(),1);
   await connect('R','N');await click('[data-first-reason="joined"]');
   for(const[id,value]of[['a','dark'],['b','lit'],['c','lit']])await click('[data-transfer-answer="'+id+'"][data-transfer-value="'+value+'"]');
   await click('[data-transfer-reason="path"]');await click('[data-transfer-verify]');await click('#nextBtn');
   await p.waitForFunction(()=>document.body.dataset.paintedMission==='3');checks.push('1→2→3 actual progression');
   await shot('exploration');
   assert.equal(await p.locator('[data-m3-find]').count(),0,'Investigate the visible break first');
   await click('[data-m3-gap]');assert.ok((await p.locator('.m3-memo').innerText()).includes('ここが きれている'));checks.push('discovery and matching memo');
   for(const id of ['wood','clip','aluminum','plastic'])await click('[data-m3-find="'+id+'"]');
   assert.equal(await p.locator('[data-m3-item]').count(),4);checks.push('find four specimens');await shot('materials-found');
   // A prediction can be incorrect; the measured result must be honest.
   await select('wood','lit');await drag('wood',{nativeTouch:width<741});await state('dark');
   assert.equal(await p.locator('[data-m3-record="wood"] b').textContent(),'つかない');
   assert.equal(await p.locator('.m3-installed-image').getAttribute('data-specimen'),'wood');checks.push('wood dark and logged; same sprite');await shot('experiment-wood');
   await drag('wood',{remove:true,nativeTouch:width<741});assert.equal(await p.locator('.m3-installed-image').count(),0);checks.push('drag out specimen');
   await select('clip');await drag('clip',{contact:'left'});await state('dark');assert.equal(await p.locator('[data-m3-record="clip"]').count(),0);await shot('one-contact');checks.push('one contact remains open, no false material record');
   await drag('clip');await state('lit');await shot('lamp-lit');
   assert.equal(await p.locator('[data-m3-record="clip"] b').textContent(),'ついた');
   assert.equal(await p.locator('.m3-village-lit').evaluate(el=>getComputedStyle(el).opacity),'1');checks.push('steel lights actual bulb and village');
   await click('[data-m3-reason="shiny"]');assert.equal(await p.locator('#nextBtn').isVisible(),false);checks.push('wrong reason rejected');await shot('wrong-reason');
   // Save/reload from real gameplay, not a fabricated completed-state fixture.
   await p.reload({waitUntil:'networkidle'});await state('lit');assert.equal(await p.locator('[data-m3-record]').count(),2);checks.push('reload retains specimen and comparison');
   await click('[data-m3-gap]');await state('dark');await select('aluminum');await drag('aluminum',{nativeTouch:width<741});await state('lit');checks.push('aluminum also lights');
   await click('[data-m3-gap]');await select('plastic','dark');await drag('plastic');await state('dark');checks.push('plastic stays dark');
   await click('[data-m3-gap]');await select('clip');await drag('clip');await state('lit');
   // The real wire-input surface creates a real short; no model rewrite.
   await click('[data-m3-terminal="P"]');await click('[data-m3-terminal="N"]');await state('short');await p.locator('.painted-short-event').waitFor({state:'visible'});await shot('short');checks.push('short suppresses bulb and runs approved VFX');
   await click('[data-m3-terminal="P"]');await click('[data-m3-terminal="N"]');await state('lit');
   await click('[data-wire-cut-mode]');
   await p.locator('.m3-circuit').scrollIntoViewIfNeeded();
   const cut=await p.locator('[data-visual-wire="N-R"] .wire').evaluate(visibleCutStroke);
   console.log('M3 cut geometry',engine,width,JSON.stringify(cut));
   await p.mouse.move(cut.start.x,cut.start.y);await p.mouse.down();await p.mouse.move(cut.end.x,cut.end.y,{steps:10});await p.mouse.up();await shot('cut-attempt');await state('dark');checks.push('scissors cut actual reference wire');
   await click('[data-m3-terminal="R"]');await click('[data-m3-terminal="N"]');await state('lit');checks.push('wire reconnects by input');
   await click('[data-m3-reason="metal"]');await p.locator('#nextBtn').waitFor({state:'visible'});assert.equal(await p.locator('.m3-victory').isVisible(),true);await shot('complete');checks.push('correct evidence-based reason clears');
   const layout=await p.evaluate(()=>{
    const rail=document.querySelector('.m3-inventory').getBoundingClientRect(),board=document.querySelector('.m3-bench').getBoundingClientRect(),svg=document.querySelector('.m3-circuit svg');
    return{overflow:document.documentElement.scrollWidth-innerWidth,rail:{x:rail.x,right:rail.right,top:rail.top,bottom:rail.bottom},board:{x:board.x,right:board.right,top:board.top,bottom:board.bottom},
     buttons:[...document.querySelectorAll('.m3-item,.m3-terminal,.m3-gap')].map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})),
     contacts:[...document.querySelectorAll('.m3-terminal')].map(el=>{const [x,y]=window.AkariMaterials.points[el.dataset.m3Terminal],q=new DOMPoint(x,y).matrixTransform(svg.getScreenCTM()),r=el.getBoundingClientRect();return Math.hypot(q.x-r.x-r.width/2,q.y-r.y-r.height/2);})};
   });
   assert.ok(layout.overflow<=1,JSON.stringify(layout));assert.ok(layout.rail.x>=layout.board.right-1,'Inventory does not cover circuit');assert.ok(layout.buttons.every(b=>b.width>=43.9&&b.height>=43.9),'44px interaction targets');assert.ok(layout.contacts.every(d=>d<1),'Art and touch geometry match');
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
   const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('rika-akari-quest-v2')));assert.ok(saved.completed[3]);
   await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('.m3-records li').count(),4);checks.push('completed record persists');
   results.push({engine,width,status:'pass',touch:width<741?(engine==='chromium'?'CDP native touch pipeline':'synthetic touch PointerEvents; no physical iPhone'):'mouse',checks,layout,errors,failed});
   console.log('MATERIALS PASS',engine,width,checks.length);await context.close();
  }
  // Self-contained HTML: no remote art, script or font request is allowed.
  const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await c.newPage();const external=[];
  await c.route(/^https?:/,route=>{external.push(route.request().url());return route.abort();});
  await p.goto(pathToFileURL(join(root,'artifacts/akari-mission3.html')).href,{waitUntil:'networkidle'});
  await p.locator('[data-m3-gap]').click();await p.locator('[data-m3-find="wood"]').click();await p.locator('[data-m3-guess="dark"]').click();await p.locator('[data-m3-gap]').click();
  assert.equal(await p.locator('.m3-bench').getAttribute('data-m3-status'),'dark');
  await p.locator('[data-m3-gap]').click();await p.locator('[data-m3-find="aluminum"]').click();await p.locator('[data-m3-guess="lit"]').click();await p.locator('[data-m3-gap]').click();await p.locator('[data-m3-reason="metal"]').click();
  await p.locator('.m3-victory').waitFor({state:'visible'});assert.deepEqual(external,[]);await p.screenshot({path:out+'/'+engine+'-offline-complete.png',fullPage:true});results.push({engine,transport:'file',status:'pass',external});await c.close();
  }finally{await browser.close();}
 }
}finally{writeFileSync(out+'/results.json',JSON.stringify(results,null,2));server.close();}
