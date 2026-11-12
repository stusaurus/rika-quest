import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join,normalize,extname} from "node:path";
import {chromium,webkit} from "playwright";

// Real inputs, real lesson state. The artwork does not get a separate demo engine.
const root=process.cwd(),origin=process.env.AKARI_BROWSER_ORIGIN||"http://127.0.0.1:8767";
const mime={".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".webp":"image/webp",".svg":"image/svg+xml"};
let server;
if(!process.env.AKARI_BROWSER_ORIGIN){
 server=createServer((req,res)=>{
  const p=new URL(req.url,origin).pathname;
  const full=normalize(join(root,decodeURIComponent(p.endsWith("/")?p+"index.html":p).replace(/^\//,"")));
  if(!full.startsWith(root+"/")){res.writeHead(403).end();return;}
  try{res.writeHead(200,{"Content-Type":mime[extname(full)]||"application/octet-stream","Cache-Control":"no-store"});res.end(readFileSync(full));}
  catch{res.writeHead(404).end("Not found");}
 });
 await new Promise(resolve=>server.listen(8767,"127.0.0.1",resolve));
}
mkdirSync("artifacts/akari",{recursive:true});
const results=[];
try{
 for(const [engine,width,height] of [["chromium",320,740],["chromium",390,844],["chromium",1440,1000],["webkit",390,844],["webkit",1440,1000]]){
  const browser=await (engine==="webkit"?webkit:chromium).launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:"reduce",hasTouch:width<741,isMobile:width<741});
   const page=await context.newPage(),errors=[],failedResources=[];
   page.on("pageerror",e=>errors.push(String(e)));
   page.on("response",r=>{if(r.status()>=400&&/mission1/.test(r.url()))failedResources.push(r.url());});
   const prefix="artifacts/akari/"+engine+"-"+width;
   const snapshot=async name=>{
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:prefix+"-"+name+".png",fullPage:true,animations:"disabled"});
   };
   const tap=async t=>{const b=page.locator('[data-t="'+t+'"]');if(width<741)await b.tap();else await b.click();};
   const connect=async(a,b)=>{await tap(a);await tap(b);};
   const reset=async()=>{await page.locator("#resetBtn").click();await page.locator(".painted-bulb-image").waitFor();};
   const state=async(lit,short=false)=>{
    await page.evaluate(()=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=document.querySelector('.painted-bulb-image').getAttribute('href');}));
    const actual=await page.evaluate(()=>{
     const board=document.querySelector(".circuit-board");
     return {lit:board.classList.contains("is-lit"),short:board.classList.contains("is-short"),
      village:Number(getComputedStyle(board.querySelector(".painted-world-lit")).opacity),
      bulb:board.querySelector(".painted-bulb-image").getAttribute("href")};
    });
    assert.equal(actual.lit,lit,JSON.stringify(actual));assert.equal(actual.short,short,JSON.stringify(actual));
    assert.equal(actual.village,lit&&!short?1:0,"Village must follow actual circuit truth");
    assert.ok(actual.bulb.endsWith(lit&&!short?"bulb-lit.webp":"bulb-dark.webp"),"The actual sprite must follow circuit truth");
   };
   // Same PR34 view, same browser, same viewport, same unlit initial circuit.
   await page.goto(origin+"/games/akari/?visual=cinematic",{waitUntil:"networkidle"});
   await page.locator(".circuit-svg-v2").waitFor();await snapshot("before-pr34");
   assert.equal(await page.locator(".painted-world").count(),0);
   await page.goto(origin+"/games/akari/?visual=painted",{waitUntil:"networkidle"});
   await page.waitForFunction(()=>document.body.dataset.paintedMission==="1");
   await page.evaluate(async()=>{
    await Promise.all([...document.querySelectorAll('.painted-village img')].map(i=>i.decode()));
    await Promise.all([...document.querySelectorAll('.circuit-svg-v2 image')].map(el=>new Promise((resolve,reject)=>{
     const i=new Image();i.onload=resolve;i.onerror=reject;i.src=el.getAttribute('href');
    })));
   });
   await state(false);
   const layout=await page.evaluate(()=>{
    const inner=document.querySelector(".circuit-inner"),r=inner.getBoundingClientRect();
    const expected={P:[42,151],N:[178,151],L:[268,152],R:[313,210]};
    const contacts=[...inner.querySelectorAll(".terminal")].map(b=>{
     const p=b.getBoundingClientRect(),[x,y]=expected[b.dataset.t];
     return {id:b.dataset.t,size:Math.min(p.width,p.height),error:Math.hypot(p.x+p.width/2-(r.x+x/400*r.width),p.y+p.height/2-(r.y+y/250*r.height))};
    });
    const board=document.querySelector(".circuit-board").getBoundingClientRect(),free=document.getElementById("freeLabToggle").getBoundingClientRect();
    return {contacts,overflow:document.documentElement.scrollWidth-innerWidth,boardTop:board.top,boardBottom:board.bottom,freeTop:free.top,
     hud:getComputedStyle(document.querySelector(".quest-head")).backgroundImage};
   });
   for(const c of layout.contacts){assert.ok(c.size>=44,"44px touch contact: "+JSON.stringify(c));assert.ok(c.error<1,"Painted sprite and input coordinate drift: "+JSON.stringify(c));}
   assert.ok(layout.overflow<=2,"No sideways page scroll");
   assert.ok(layout.boardTop<300,"Experiment must be visible without searching down the page");
   assert.ok(layout.freeTop>=layout.boardBottom,"Optional laboratory follows the primary experiment");
   assert.ok(layout.hud.includes("hud-panel.webp"),"The generated HUD art must be in the real game");
   await snapshot("painted-start");
   await page.locator(".circuit-board").screenshot({path:prefix+"-painted-board-dark.png",animations:"disabled"});
   if(width<741){
    await page.locator("[data-zoom]").click();await page.locator('[data-view="bulb"]').click();
    const zoom=await page.evaluate(()=>{const b=document.querySelector('.circuit-board').getBoundingClientRect(),p=document.querySelector('[data-t="R"]').getBoundingClientRect();return{left:b.left,right:b.right,x:p.x+p.width/2};});
    assert.ok(zoom.x>=zoom.left&&zoom.x<=zoom.right,"Enlarged bulb contact remains reachable");
    await page.locator("[data-zoom]").click();
   }
   // One wire is not a loop.
   await connect("P","L");await state(false);
   await connect("R","N");await state(true);await snapshot("painted-lit");
   await page.locator(".circuit-board").screenshot({path:prefix+"-painted-board-lit.png",animations:"disabled"});
   // Cutting a real connected wire immediately extinguishes the scene.
   await page.locator("[data-unwire]").first().click();await state(false);
   // A battery short never lights the bulb, even alongside a closed lamp loop.
   await reset();await connect("P","N");await state(false,true);await snapshot("painted-short");
   await reset();await connect("P","L");await connect("N","R");await connect("P","N");await state(false,true);
   // An incandescent bulb works with the two poles swapped.
   await reset();await connect("P","R");await connect("N","L");await state(true);
   // Both lamp contacts connected to the same pole do not form a circuit.
   await reset();await connect("P","L");await connect("P","R");await state(false);
   // Genuine hand drawing uses the same contacts and avoids physical components.
   await reset();
   const stroke=async(points)=>{
    const r=await page.locator(".circuit-inner").boundingBox();
    const screen=([x,y])=>({x:r.x+x/400*r.width,y:r.y+y/250*r.height});
    await page.mouse.move(...Object.values(screen(points[0])));await page.mouse.down();
    for(const p of points.slice(1))await page.mouse.move(...Object.values(screen(p)),{steps:6});
    await page.mouse.up();
   };
   await stroke([[42,151],[25,130],[25,94],[225,94],[244,120],[268,152]]);
   assert.equal(await page.locator(".wire-chip").count(),1,"Drawing a wire connects actual terminals");
   await stroke([[313,210],[285,230],[235,230],[220,190],[178,151]]);await state(true);
   // The explanation stays with the experiment; wrong reasons cannot complete it.
   await page.locator('[data-first-reason="cut"]').click();
   assert.equal(await page.locator("#nextBtn").isVisible(),false);
   await page.locator('[data-first-reason="loop"]').click();
   await page.locator("#nextBtn").waitFor({state:"visible"});await snapshot("painted-complete");
   await page.locator("#nextBtn").click();
   await page.waitForFunction(()=>document.body.dataset.paintedMission==="");
   assert.equal(await page.locator(".painted-world,.painted-battery,.painted-bulb").count(),0,"Pilot MUST stop at mission 1");
   assert.equal(await page.locator("#storyScene #sceneProgress").count(),1,"Original HUD is restored for mission 2");
   assert.equal(await page.locator("#storyScene #spark").count(),1,"Original short warning is restored");
   await snapshot("stage2-unchanged");
   // A single-file deliverable must contain the very same art and usable inputs.
   await context.close();
   const offline=await browser.newContext({viewport:{width,height},reducedMotion:"reduce"});
   const op=await offline.newPage();
   await op.goto(origin+"/artifacts/akari-mission1-painted.html",{waitUntil:"networkidle"});
   await op.waitForFunction(()=>document.body.dataset.paintedMission==="1");
   assert.ok((await op.locator(".painted-bulb-image").getAttribute("href")).startsWith("data:image/webp;base64,"));
   for(const t of ["P","L","N","R"])await op.locator('[data-t="'+t+'"]').click();
   assert.equal(await op.locator(".circuit-board.is-lit").count(),1,"Offline deliverable uses the actual engine");
   await offline.close();
   assert.deepEqual(errors,[]);assert.deepEqual(failedResources,[]);
   results.push({engine,width,height,status:"pass",layout});
   console.log("PAINTED MISSION1 PASS",engine,width);
  }finally{await browser.close();}
 }
 writeFileSync("artifacts/akari/painted-qa.json",JSON.stringify(results,null,2));
}finally{if(server)await new Promise(resolve=>server.close(resolve));}
