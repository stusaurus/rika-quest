import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const server=createServer(async(req,res)=>{
 try{
  let path=new URL(req.url,'http://localhost').pathname;
  if(path.endsWith('/'))path+='index.html';
  const full=resolve(root,'.'+decodeURIComponent(path));
  if(!full.startsWith(root+sep))throw Error('forbidden path');
  const data=await readFile(full);
  res.setHeader('Content-Type',extname(full)==='.html'?'text/html; charset=utf-8':'text/javascript; charset=utf-8');
  res.end(data);
 }catch(e){res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/games/magnet/';
const evidence=resolve(root,'tests/.evidence/magnet');
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({headless:true});
const point=async(page,x,y)=>page.locator('.scenery').evaluate((svg,pt)=>{
 const p=svg.createSVGPoint();p.x=pt.x;p.y=pt.y;
 const pixel=p.matrixTransform(svg.getScreenCTM());
 return {x:pixel.x,y:pixel.y};
},{x,y});
const doMouse=async(page,a,b)=>{
 await page.mouse.move(a.x,a.y);await page.mouse.down();
 for(let i=1;i<=10;i++){const t=i/10;await page.mouse.move(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,{steps:1});}
 await page.mouse.up();
};
const doTouch=async(page,session,a,b)=>{
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x,y:a.y,id:1}]});
 await page.waitForTimeout(35);
 for(let i=1;i<=10;i++){const t=i/10;await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,id:1}]});await page.waitForTimeout(35);}
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await page.waitForTimeout(55);
};
const phase=page=>page.locator('#app').getAttribute('data-phase');
try{
 for(const {width,mode} of [{width:320,mode:'mouse'},{width:390,mode:'touch'}]){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,hasTouch:mode==='touch',isMobile:mode==='touch',locale:'ja-JP'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const session=mode==='touch'?await context.newCDPSession(page):null;
  const drag=async(x0,y0,x1,y1)=>{
   const [a,b]=await Promise.all([point(page,x0,y0),point(page,x1,y1)]);
   if(mode==='touch')await doTouch(page,session,a,b);else await doMouse(page,a,b);
  };
  await page.goto(url,{waitUntil:'networkidle'});
  assert.equal(await phase(page),'0');
  if(mode==='touch')await page.evaluate(()=>{
    window.__gestures=[];
    ['pointerdown','pointermove','pointerup','pointercancel','touchstart','touchmove','touchend'].forEach(type=>{
      document.querySelector('svg').addEventListener(type,e=>window.__gestures.push({type,target:e.target.id,x:e.clientX,y:e.clientY,scroll:scrollY}),true);
    });
  });
  assert.equal(await page.locator('#filing-dots .filing').count(),24);
  await drag(390,366,390,366);
  assert.equal(await page.locator('.observations .obs').count(),1,'first finger/mouse probe');
  await drag(390,366,491,366);
  if(mode==='touch')console.log('TOUCH_DIAGNOSTIC',JSON.stringify(await page.evaluate(()=>({events:window.__gestures,transform:document.getElementById('probe-lens').getAttribute('transform'),scrollY,observations:document.querySelectorAll('.observations .obs').length}))));
  assert.equal(await page.locator('.observations .obs').count(),2,'probe at center');
  const centerDots=await page.locator('#filing-dots .filing').evaluateAll(nodes=>nodes.filter(e=>e.getAttribute('opacity')!=='0').length);
  assert.equal(centerDots,7,'weak iron filing display at center');
  await drag(491,366,591,366);
  assert.equal(await page.locator('.observations .obs').count(),3,'probe at right end');
  const endDots=await page.locator('#filing-dots .filing').evaluateAll(nodes=>nodes.filter(e=>e.getAttribute('opacity')!=='0').length);
  assert.equal(endDots,24,'strong iron filing display near end');
  await page.screenshot({path:resolve(evidence,'drag-probe-'+width+'.png'),fullPage:true});
  await page.locator('button[data-action="next"]').click();
  await page.locator('button[data-action="answer"][data-value="both"]').click();
  assert.equal(await phase(page),'2');
  await drag(262,439,312,439);
  assert.equal(await page.locator('.observations .obs').count(),1,'magnet to left end');
  await drag(312,439,672,439);
  assert.equal(await page.locator('.observations .obs').count(),2,'magnet to right end');
  await page.screenshot({path:resolve(evidence,'drag-reference-'+width+'.png'),fullPage:true});
  await page.locator('button[data-action="identify"][data-value="N"]').click();
  assert.equal(await phase(page),'3');
  await page.locator('button[data-action="pick"][data-value="N"]').click();
  await drag(577.5,340,750,340);
  assert.equal(await page.locator('#distance-value').textContent(),'1 cm','drag sets distance');
  await page.locator('button[data-action="gate"]').click();
  assert.equal(await phase(page),'3','same poles cannot open gate');
  assert.match(await page.locator('#status').textContent(),/反発/);
  await page.locator('button[data-action="pick"][data-value="S"]').click();
  await page.locator('button[data-action="gate"]').click();
  assert.equal(await phase(page),'4','opposite poles open gate');
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await phase(page),'4','drag-derived result persists');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,'no horizontal overflow at '+width);
  assert.deepEqual(errors,[],'page errors at '+width);
  console.log('PASS: '+mode+' drag, magnetic reaction, save/reload at '+width+'px');
  await context.close();
 }
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
