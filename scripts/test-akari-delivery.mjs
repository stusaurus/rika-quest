import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {createHash} from "node:crypto";
import {chromium,webkit} from "playwright";
import {publicHTMLProof} from "./akari-public-html.mjs";

// Test the deliverable itself, not only the source page that generated it.
const trial=process.env.AKARI_TRIAL_MODE==="1";
const root=process.cwd(),out=process.env.AKARI_DELIVERY_OUT||"artifacts/akari-delivery";
const key=trial?"rika-akari-quest-mission1-trial-v2":"rika-akari-quest-v2";
const htmlPath=process.env.AKARI_DELIVERY_HTML||join(root,"artifacts/akari-mission1-painted.html");
const bytes=readFileSync(htmlPath),hash=createHash("sha256").update(bytes).digest("hex");
const origin="http://127.0.0.1:8768",online=process.env.AKARI_DELIVERY_ONLINE_URL;
mkdirSync(out,{recursive:true});
const server=createServer((_req,res)=>{
 res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});res.end(bytes);
});
await new Promise(resolve=>server.listen(8768,"127.0.0.1",resolve));
const transports=trial&&online?[]:[["http",origin+"/"],["file",pathToFileURL(htmlPath).href]];
const results=[],storageResults=[],fallbackResults=[];
let onlineVerification=null;
if(online){
 // A login/interstitial page must not be mistaken for a successfully deployed game.
 const deadline=Date.now()+Number(process.env.AKARI_DELIVERY_WAIT_MS||0);
 let verified=false,lastStatus;
 do{
  const response=await fetch(online,{redirect:"manual"});lastStatus=response.status;
  const actual=Buffer.from(await response.arrayBuffer());
  const proof=publicHTMLProof(bytes,actual),actualHash=proof.responseSha256;
  verified=response.status===200&&proof.matches;
  if(verified)onlineVerification={status:response.status,...proof};
  if(response.status===200&&!verified){
   let first=0;while(first<Math.min(actual.length,bytes.length)&&actual[first]===bytes[first])first++;
   const mismatch={expectedHash:hash,actualHash,expectedLength:bytes.length,actualLength:actual.length,
    firstDifference:first,expectedContext:bytes.subarray(Math.max(0,first-100),first+300).toString(),
    actualContext:actual.subarray(Math.max(0,first-100),first+300).toString()};
   writeFileSync(`${out}/online-byte-mismatch.json`,JSON.stringify(mismatch,null,2));
   writeFileSync(`${out}/online-response.html`,actual);
   console.log("Public HTML mismatch diagnostics",JSON.stringify(mismatch));
   break;
  }
  if(verified||Date.now()>=deadline)break;
  console.log("Waiting for the approved public artifact; status",lastStatus);
  await new Promise(resolve=>setTimeout(resolve,3000));
 }while(true);
 assert.ok(verified,"The anonymous online URL must serve the unchanged game payload, not a sign-in or interstitial page; status "+lastStatus);
 writeFileSync(`${out}/online-preflight.json`,JSON.stringify(onlineVerification,null,2));
 // The static host can canonicalize .html to its extensionless route. Follow
 // only same-origin redirects, without credentials; the final payload must
 // still match every game byte. A sign-in redirect cannot pass this check.
 let downloadURL=new URL('akari-mission1-complete.html',online);
 const downloadRedirects=[];
 let downloadable;
 for(let hop=0;hop<4;hop++){
  downloadable=await fetch(downloadURL,{redirect:'manual'});
  if(![301,302,303,307,308].includes(downloadable.status))break;
  const location=downloadable.headers.get('location');assert.ok(location);
  const next=new URL(location,downloadURL);
  assert.equal(next.origin,new URL(online).origin,'The download must not redirect to an account service');
  downloadRedirects.push({status:downloadable.status,from:downloadURL.href,to:next.href});
  console.log('Public download redirect',downloadable.status,downloadURL.href,'to',next.href);
  downloadURL=next;
 }
 const downloadProof=publicHTMLProof(bytes,Buffer.from(await downloadable.arrayBuffer()));
 assert.equal(downloadable.status,200);assert.ok(downloadProof.matches,'The public download contains the same mission-1-only game');
 const robots=await fetch(new URL('robots.txt',online),{redirect:'manual'});
 assert.equal(robots.status,200);assert.equal((await robots.text()).trim(),'User-agent: *\nDisallow: /');
 onlineVerification.download={status:downloadable.status,url:downloadURL.href,redirects:downloadRedirects,...downloadProof};
 onlineVerification.robots='User-agent: *; Disallow: /';
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
 const initialCookies=(await context.cookies()).length;
 assert.equal(initialCookies,0,"Every browser run starts without an account or cookie session");
 // WebKit 1.56.1 throws an internal navigation error for file:// when its
 // global offline flag is set. Block every possible network request instead;
 // the downloaded file must still run without any remote asset or font.
 if(transport==="file")await context.route(/^https?:/,route=>route.abort());
 const p=await context.newPage(),errors=[],failures=[],externalAssets=[];
 p.on("pageerror",e=>errors.push(String(e)));
 p.on("requestfailed",r=>failures.push(r.url().slice(0,180)));
 p.on("request",r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(url).origin&&
  ['font','stylesheet','script','image'].includes(r.resourceType()))externalAssets.push(r.url().slice(0,180));});
 const snap=async state=>{
  if(transport==="file")return;
  await p.evaluate(()=>scrollTo(0,0));
  const header=await p.locator('.topbar').evaluate(el=>{
   const h=el.getBoundingClientRect();return{top:h.top,bottom:h.bottom,
    buttons:[...el.querySelectorAll('#soundBtn,#helpBtn,#mapToggle')].map(b=>{
     const r=b.getBoundingClientRect();return{id:b.id,top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};
    }).filter(b=>b.width>0&&b.height>0)};
  });
  assert.ok(header.buttons.every(b=>b.width>=44&&b.height>=44&&b.top>=header.top-2&&b.bottom<=header.bottom+2&&b.left>=0&&b.right<=width),
   `Header overlap in ${engine}/${width}/${transport}/${state}: `+JSON.stringify(header));
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
  if(trial){
   assert.equal(await p.locator('meta[name="akari-trial-scope"]').getAttribute('content'),'mission-1-only');
   assert.equal(await p.locator('#mapToggle').isVisible(),false);
   assert.equal(await p.locator('#missionList [data-mission]').count(),1);
   assert.equal(await p.locator('#missionList [data-mission]').getAttribute('data-mission'),'1');
   assert.equal(await p.locator('meta[name="robots"]').getAttribute('content'),'noindex,nofollow');
  }
  await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.evaluate(()=>document.fonts.check('16px "Kosugi Maru"','あかり')&&document.fonts.check('700 16px "Nunito"','MISSION 01')),true,
   'The original Japanese and Latin typefaces load without a font CDN');
  await p.evaluate(async()=>{
   await Promise.all([...document.querySelectorAll('.painted-village img')].map(i=>i.decode()));
   await Promise.all([...document.querySelectorAll('.circuit-svg-v2 image')].map(el=>new Promise((resolve,reject)=>{
    const i=new Image();i.onload=resolve;i.onerror=reject;i.src=el.getAttribute('href');
   })));
  });
  assert.equal(await p.locator('#startupFallback').count(),0,"The real workspace replaces the fallback");
  assert.ok((await p.locator('#soundBtn').evaluate(el=>getComputedStyle(el,'::before').content)).includes('音'),
   'The mute control stays visible when the font cannot shape the original combining note');
  await p.locator('#soundBtn').click();assert.equal(await p.locator('#soundBtn').getAttribute('aria-pressed'),'true');
  await p.locator('#soundBtn').click();assert.equal(await p.locator('#soundBtn').getAttribute('aria-pressed'),'false');
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
  if(trial){
   await circuit(false);
   assert.equal(await p.locator('#storyScene').getAttribute('data-stage'),'1','Replay stays inside the approved mission');
   await p.reload({waitUntil:'networkidle'});
   assert.equal(await p.locator('#storyScene').getAttribute('data-stage'),'1');
   assert.equal(await p.evaluate(()=>localStorage.getItem('rika-akari-quest-v2')),null,'The public trial never writes the full-game save');
  }else{
   await p.waitForFunction(()=>document.body.dataset.paintedMission==='2');
   assert.equal(await p.locator('.painted-world,.painted-battery,.painted-bulb').count(),3,
     'Next mission shares the finished painted village and physical equipment');
   assert.equal(await p.locator('.wire-chip').count(),1,
     'Reloading the second mission must preserve its initial broken-circuit challenge');
   await p.reload({waitUntil:'networkidle'});
   assert.equal(await p.locator('#storyScene').getAttribute('data-stage'),'2',"Progress persists on the same delivery route");
   await p.waitForFunction(()=>document.body.dataset.paintedMission==='2');
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert.deepEqual(externalAssets,[]);
  results.push({engine,width,height,transport,status:'pass',initialCookies,layout,reasonContrast:contrasts,
   savedVersion:saved.version,checks:['start','one-wire','lit','swipe-cut','short','reason-wrong','reason-correct','complete','reload',trial?'mission-1-only-replay':'stage-2-painted-and-presaved']});
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
   const fixture={version:2,active:trial?14:2,completed:{1:3},sound:false,masteries:{2:true},drafts:{},
    notes:[{mission:1,key:'existing-note',text:'前の実験のきろく'}]};
   const fixtureURL=trial&&online?online:origin;
   const context=await browser.newContext({viewport:{width:390,height:844}});
   await context.addInitScript(({key,fixture})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(fixture));},{key,fixture});
   const p=await context.newPage();await p.goto(fixtureURL,{waitUntil:'networkidle'});
   assert.equal(await p.locator('#storyScene').getAttribute('data-stage'),trial?'1':'2');
   assert.equal(await p.locator('.painted-world').count(),1,
     'The local public trial remains stage 1, while the full saved game continues in the painted stage 2');
   await p.locator('#soundBtn').click();
   const saved=await p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
   assert.deepEqual(saved.completed,fixture.completed);assert.deepEqual(saved.notes,fixture.notes);
   assert.deepEqual(saved.masteries,fixture.masteries);assert.equal(saved.version,2);
   storageResults.push({engine,status:'pass',fixture:trial?'stale later-mission save still opens only mission 1':'existing version 2: progress, notes, masteries, active mission 2'});
   await context.close();
   const blocked=await browser.newContext({viewport:{width:390,height:844}});
   await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked for the test','SecurityError');}}));
   const bp=await blocked.newPage();await bp.goto(fixtureURL,{waitUntil:'networkidle'});
   await bp.waitForFunction(()=>document.body.dataset.paintedMission==='1');
   for(const t of['P','L','R','N'])await bp.locator(`[data-t="${t}"]`).click();
   await bp.locator('[data-first-reason="loop"]').click();await bp.locator('#nextBtn').waitFor({state:'visible'});
   storageResults.push({engine,status:'pass',fixture:'blocked storage still permits experiment and completion; persistence unavailable'});
   await blocked.close();
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
   const np=await nojs.newPage();await np.goto(fixtureURL,{waitUntil:'load'});
   assert.equal(await np.locator('#startupFallback').isVisible(),true);
   const fallback=await np.locator('.startup-open-web').getAttribute('href');
   if(process.env.AKARI_REVIEW_URL)assert.equal(fallback,new URL(process.env.AKARI_REVIEW_URL).href);
   fallbackResults.push({engine,status:'pass',javaScriptEnabled:false,onlineAlternative:!!fallback});
   await nojs.close();
  }finally{await browser.close();}
 }
}finally{
 writeFileSync(out+'/delivery-qa.json',JSON.stringify({htmlSha256:hash,onlineRequested:!!online,onlineVerification,trialOnly:trial,onlineURL:online||null,results,storageResults,fallbackResults},null,2));
 await new Promise(resolve=>server.close(resolve));
}
