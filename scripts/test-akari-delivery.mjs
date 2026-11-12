import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {createHash} from "node:crypto";
import {chromium,webkit} from "playwright";

// Test the deliverable itself, not only the source page that generated it.
const root=process.cwd(),out="artifacts/akari-delivery",key="rika-akari-quest-v2";
const htmlPath=process.env.AKARI_DELIVERY_HTML||join(root,"artifacts/akari-mission1-painted.html");
const bytes=readFileSync(htmlPath),hash=createHash("sha256").update(bytes).digest("hex");
const origin="http://127.0.0.1:8768",online=process.env.AKARI_DELIVERY_ONLINE_URL;
mkdirSync(out,{recursive:true});
const server=createServer((_req,res)=>{
 res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});res.end(bytes);
});
await new Promise(resolve=>server.listen(8768,"127.0.0.1",resolve));
const transports=[["http",origin+"/"],["file",pathToFileURL(htmlPath).href]];
const results=[],storageResults=[],fallbackResults=[];
if(online){
 // A login/interstitial page must not be mistaken for a successfully deployed game.
 const response=await fetch(online),actual=Buffer.from(await response.arrayBuffer());
 assert.equal(response.status,200,"Online review URL must serve successfully");
 assert.equal(createHash("sha256").update(actual).digest("hex"),hash,
  "Online review must serve the tested HTML bytes, not a sign-in, download or interstitial page");
 transports.push(["online",online]);
}

function cutStroke(path){
 const length=path.getTotalLength(),matrix=path.getScreenCTM();
 const point=at=>{const p=path.getPointAtLength(at);return new DOMPoint(p.x,p.y).matrixTransform(matrix);};
 const clear=p=>p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight&&
  !!document.elementFromPoint(p.x,p.y)?.closest('.circuit-board')&&
  !document.elementFromPoint(p.x,p.y)?.closest('button,a,input,summary,[role="button"]');
 for(const fraction of [.5,.4,.6]){
  const at=length*fraction,p=point(at),a=point(Math.max(0,at-3)),b=point(Math.min(length,at+3));
  const dx=b.x-a.x,dy=b.y-a.y,mag=Math.hypot(dx,dy)||1;
  for(const [from,to]of[[-12,36],[-8,36],[12,-36],[8,-36],[-26,26],[-42,42]]){
   const start={x:p.x-dy/mag*from,y:p.y+dx/mag*from},end={x:p.x-dy/mag*to,y:p.y+dx/mag*to};
   if(clear(start)&&clear(end))return{start,end};
  }
 }
 throw new Error("No unobstructed cable crossing is visible");
}

async function operate(browser,engine,width,height,transport,url){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,
  hasTouch:width<741,isMobile:width<741,reducedMotion:"reduce"});
 const p=await context.newPage(),errors=[],failures=[];
 p.on("pageerror",e=>errors.push(String(e)));
 p.on("requestfailed",r=>failures.push(r.url().slice(0,180)));
 const snap=async state=>{
  if(transport==="file")return;
  await p.evaluate(()=>scrollTo(0,0));
  await p.screenshot({path:`${out}/${engine}-${width}-${transport}-${state}.png`,fullPage:true,animations:"disabled"});
 };
 const press=async t=>{const button=p.locator(`[data-t="${t}"]`);if(width<741)await button.tap();else await button.click();};
 const connect=async(a,b)=>{await press(a);await press(b);};
 const circuit=async(lit,short=false)=>{
  await p.waitForFunction(({lit,short})=>{
   const b=document.querySelector('.circuit-board');
   return !!b&&b.classList.contains('is-lit')===lit&&b.classList.contains('is-short')===short;
  },{lit,short});
  const pool=await p.locator('.painted-light-pool').evaluate(e=>getComputedStyle(e).opacity);
  assert.equal(pool,lit?'1':'0',"Actual illumination must immediately follow the electrical result");
 };
 try{
  const response=await p.goto(url,{waitUntil:"networkidle"});
  if(transport!=="file")assert.equal(response.status(),200);
  await p.waitForFunction(()=>document.body.dataset.paintedMission==="1");
  await p.evaluate(async()=>{
   await Promise.all([...document.querySelectorAll('.painted-village img')].map(i=>i.decode()));
   await Promise.all([...document.querySelectorAll('.circuit-svg-v2 image')].map(el=>new Promise((resolve,reject)=>{
    const i=new Image();i.onload=resolve;i.onerror=reject;i.src=el.getAttribute('href');
   })));
  });
  assert.equal(await p.locator('#startupFallback').count(),0,"The real workspace replaces the fallback");
  const layout=await p.locator('.circuit-inner').evaluate(inner=>{
   const r=inner.getBoundingClientRect(),expected={P:[42,151],N:[178,151],L:[268,152],R:[313,210]};
   return{overflow:document.documentElement.scrollWidth-innerWidth,contacts:[...inner.querySelectorAll('.terminal')].map(b=>{
    const q=b.getBoundingClientRect(),[x,y]=expected[b.dataset.t];
    return{id:b.dataset.t,size:Math.min(q.width,q.height),drift:Math.hypot(q.x+q.width/2-r.x-x/400*r.width,q.y+q.height/2-r.y-y/250*r.height)};
   })};
  });
  assert.ok(layout.overflow<=2);assert.equal(layout.contacts.length,4);
  assert.ok(layout.contacts.every(c=>c.size>=44&&c.drift<1),JSON.stringify(layout));
  await circuit(false);await snap('start');
  await connect('P','L');await circuit(false);await snap('one-wire');
  await connect('R','N');await circuit(true);await snap('lit');
  await p.locator('.circuit-inner').scrollIntoViewIfNeeded();
  const cross=await p.locator('[data-visual-wire="LP"] .wire').evaluate(cutStroke);
  await p.mouse.move(cross.start.x,cross.start.y);await p.mouse.down();
  await p.mouse.move(cross.end.x,cross.end.y,{steps:10});await p.mouse.up();
  await circuit(false);assert.equal(await p.locator('.wire-chip').count(),1);await snap('cut');
  await p.locator('#resetBtn').click();await connect('P','N');await circuit(false,true);
  await p.locator('.painted-short-frame').waitFor({state:'visible'});await snap('short');
  await p.locator('[data-unwire]').click();await circuit(false);
  assert.equal(await p.locator('.painted-short-event').count(),0);
  await p.locator('#resetBtn').click();await connect('P','L');await connect('R','N');await circuit(true);
  const contrasts=await p.locator('.reason-option').evaluateAll(nodes=>{
   const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number);
   const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
   return nodes.map(el=>{const c=getComputedStyle(el),fg=lum(rgb(c.color));
    const stops=[...c.backgroundImage.matchAll(/rgba?\([^)]*\)/g)].map(m=>rgb(m[0])).filter(c=>c.length===3||c[3]===1);
    return{minimum:stops.length?Math.min(...stops.map(s=>{const b=lum(s);return(Math.max(fg,b)+.05)/(Math.min(fg,b)+.05);})):0};
   });
  });
  assert.equal(contrasts.length,3);assert.ok(contrasts.every(c=>c.minimum>=4.5),JSON.stringify(contrasts));
  await p.locator('[data-first-reason="cut"]').click();
  assert.equal(await p.locator('#nextBtn').isVisible(),false);await snap('reason');
  await p.locator('[data-first-reason="loop"]').click();
  await p.locator('#nextBtn').waitFor({state:'visible'});await snap('complete');
  const saved=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(saved.version,2);assert.ok(saved.completed[1]>=1);assert.ok(saved.notes.length>=1);
  await p.reload({waitUntil:'networkidle'});
  assert.equal(await p.evaluate(key=>JSON.parse(localStorage.getItem(key)).completed[1],key),saved.completed[1]);
  // Replay needs a real experiment; a stored result must not auto-light the lamp.
  await circuit(false);
  for(const t of['P','L','R','N'])await press(t);
  await p.locator('[data-first-reason="loop"]').click();await p.locator('#nextBtn').click();
  await p.waitForFunction(()=>document.body.dataset.paintedMission==='');
  assert.equal(await p.locator('.painted-world,.painted-battery,.painted-bulb').count(),0);
  await p.reload({waitUntil:'networkidle'});
  assert.equal(await p.locator('#storyScene').getAttribute('data-stage'),'2',"Progress persists on the same delivery route");
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
  results.push({engine,width,height,transport,status:'pass',layout,reasonContrast:contrasts,
   savedVersion:saved.version,checks:['start','one-wire','lit','swipe-cut','short','reason-wrong','reason-correct','complete','reload','stage-2-original']});
  console.log('DELIVERY PASS',engine,width,transport);
 }finally{await context.close();}
}

try{
 for(const[engine,type]of[['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch({headless:true});
  try{
   for(const[width,height]of[[320,740],[390,844],[1440,1000]]){
    for(const[transport,url]of transports)await operate(browser,engine,width,height,transport,url);
   }
   const fixture={version:2,active:2,completed:{1:3},sound:false,masteries:{2:true},drafts:{},
    notes:[{mission:1,key:'existing-note',text:'前の実験のきろく'}]};
   const context=await browser.newContext({viewport:{width:390,height:844}});
   await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));},{key,fixture});
   const p=await context.newPage();await p.goto(origin,{waitUntil:'networkidle'});
   assert.equal(await p.locator('#storyScene').getAttribute('data-stage'),'2');
   assert.equal(await p.locator('.painted-world').count(),0);
   await p.locator('#soundBtn').click();
   const saved=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   assert.deepEqual(saved.completed,fixture.completed);assert.deepEqual(saved.notes,fixture.notes);
   assert.deepEqual(saved.masteries,fixture.masteries);assert.equal(saved.version,2);
   storageResults.push({engine,status:'pass',fixture:'existing version 2: progress, notes, masteries, active mission 2'});
   await context.close();
   const blocked=await browser.newContext({viewport:{width:390,height:844}});
   await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked for the test','SecurityError');}}));
   const bp=await blocked.newPage();await bp.goto(origin,{waitUntil:'networkidle'});
   await bp.waitForFunction(()=>document.body.dataset.paintedMission==='1');
   for(const t of['P','L','R','N'])await bp.locator(`[data-t="${t}"]`).click();
   await bp.locator('[data-first-reason="loop"]').click();await bp.locator('#nextBtn').waitFor({state:'visible'});
   storageResults.push({engine,status:'pass',fixture:'blocked storage still permits experiment and completion; persistence unavailable'});
   await blocked.close();
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
   const np=await nojs.newPage();await np.goto(origin,{waitUntil:'load'});
   assert.equal(await np.locator('#startupFallback').isVisible(),true);
   const fallback=await np.locator('.startup-open-web').getAttribute('href');
   if(process.env.AKARI_REVIEW_URL)assert.equal(fallback,new URL(process.env.AKARI_REVIEW_URL).href);
   fallbackResults.push({engine,status:'pass',javaScriptEnabled:false,onlineAlternative:!!fallback});
   await nojs.close();
  }finally{await browser.close();}
 }
}finally{
 writeFileSync(out+'/delivery-qa.json',JSON.stringify({htmlSha256:hash,onlineRequested:!!online,results,storageResults,fallbackResults},null,2));
 await new Promise(resolve=>server.close(resolve));
}
