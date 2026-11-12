import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,mkdirSync} from "node:fs";
import {normalize,join,extname} from "node:path";
import {chromium,webkit} from "playwright";

const root=process.cwd(),origin="http://127.0.0.1:8766";
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml"};
const server=createServer((req,res)=>{
 const p=new URL(req.url,origin).pathname;
 const full=normalize(join(root,decodeURIComponent(p.endsWith("/")?p+"index.html":p).replace(/^\//,"")));
 if(!full.startsWith(root)){res.writeHead(403).end();return;}
 try{res.writeHead(200,{"Content-Type":mime[extname(full)]||"application/octet-stream","Cache-Control":"no-store"});res.end(readFileSync(full));}
 catch{res.writeHead(404).end("Not found");}
});
await new Promise(resolve=>server.listen(8766,"127.0.0.1",resolve));
mkdirSync("artifacts/akari",{recursive:true});
try{
 for(const [engine,width,height] of [["chromium",390,844],["chromium",1440,900],["webkit",390,844]]){
  const browser=await (engine==="webkit"?webkit:chromium).launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:"reduce",hasTouch:width<741,isMobile:width<741});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",err=>errors.push(String(err)));
   const url=origin+"/games/akari/?visual=cinematic";
   await page.goto(url,{waitUntil:"domcontentloaded"});
   await page.locator(".circuit-svg-v2 .battery-model").waitFor();
   assert.equal(await page.locator("html.akari-cinematic").count(),1,"Opt-in cinematic look must initialize before original game scripts");
   await page.waitForFunction(()=>{
     const board=document.querySelector(".circuit-town-board");
     return !!board&&getComputedStyle(board).borderTopColor==="rgb(189, 160, 127)";
   },null,{timeout:7000}).catch(async error=>{
     const diagnostics=await page.evaluate(()=>{
       const board=document.querySelector(".circuit-town-board");
       return {body:document.body.outerHTML.slice(0,350),
         board:board?.outerHTML.slice(0,260),
         boardColor:board&&getComputedStyle(board).borderTopColor,
         bodyWireFocus:document.body.dataset.wireFocus,
         cssHref:[...document.styleSheets].map(x=>x.href).filter(Boolean).slice(-6),
         classes:document.documentElement.className};
     });
     throw new Error("Game-theme CSS not ready: "+JSON.stringify(diagnostics)+"; "+error);
   });
   const stageOne=await page.evaluate(()=>{
     const board=document.querySelector(".circuit-board.circuit-town-board"),head=document.querySelector(".quest-head"),
      terminal=document.querySelector(".terminal"),sky=document.querySelector("#tcSky stop");
     const rect=board.getBoundingClientRect(),tap=terminal.getBoundingClientRect();
     return {frame:getComputedStyle(board).borderTopColor,
       header:getComputedStyle(head).backgroundImage,
       sky:sky?.getAttribute("stop-color"),
       boardTop:rect.top,boardWidth:rect.width,
       touch:Math.min(tap.width,tap.height),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
   assert.equal(stageOne.sky,"#172f4f","Cinematic version must repaint the actual world, not merely recolor website boxes");
   assert.equal(await page.locator(".circuit-svg-v2 .workbench-fixture").count(),1,
     "Real 1.5V battery and bulb mount on a sculpted game board with original contacts untouched");
   assert.equal(await page.locator(".circuit-town-board .town-house").count(),3,
     "Painted depth includes the three actual village houses, not a static screenshot");
   assert.equal(await page.locator(".circuit-town-board .town-roof-detail").count(),6,
     "Each painted gabled roof has two vector detail layers");
   assert.equal(await page.locator(".circuit-town-board .town-play-surface").count(),1,
     "The physical circuit has a separate illustrated wood surface IN FRONT of the village");
   assert.equal(await page.locator(".circuit-town-board .town-stone-bridge").count(),1,
     "The river bridge is painted behind, not substituted for, any electrical wire");
   assert.equal(await page.locator(".circuit-town-board .town-power-reflections").first().evaluate(el=>getComputedStyle(el).opacity),"0",
     "Electric reflections must be invisible while the real circuit is open");
   assert.equal(await page.locator(".circuit-town-board .town-window").first().evaluate(el=>getComputedStyle(el).fill),"rgb(54, 85, 105)",
     "A dark village must not show simulated electrical window light before the experiment");
   assert.equal(await page.locator(".main.town-immersive>.story-scene").isVisible(),false,
     "The redundant scenic header is removed in game mode; the real village lives in the playable board");
   assert.equal(await page.locator(".quest-head #sceneProgress").count(),1,
     "Actual progress status moves into the mission HUD without duplicating state");
   assert.equal(await page.locator("body>#stageCelebration").count(),1,
     "Victory art is decoupled from the clipped scenic banner");
   assert.equal(stageOne.frame,"rgb(189, 160, 127)","Real circuit should sit within the new cinematic warm-metal frame");
   assert.ok(stageOne.touch>=44,"Electrical contacts remain thumb-sized");
   assert.equal(await page.locator("#workspace>.circuit-board").count(),1,
     "The real circuit is a single interactive scene, not a redundant decorative thumbnail");
   if(width<741){
     const flow=await page.evaluate(()=>{
       const board=document.querySelector(".circuit-town-board").getBoundingClientRect();
       const free=document.querySelector("#freeLabToggle").getBoundingClientRect();
       return {boardTop:board.top,freeTop:free.top,boardBottom:board.bottom};
     });
     assert.ok(flow.boardTop<275,"The circuit begins above the first mobile fold: "+JSON.stringify(flow));
     assert.ok(flow.freeTop>=flow.boardBottom-3,"The optional sandbox follows, rather than precedes, the primary experiment");
   }
   assert.ok(stageOne.overflow<=2,"No sideways page scroll");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-cinematic-start.png",fullPage:true});
   await page.locator('[data-t="P"]').click();await page.locator('[data-t="L"]').click();
   await page.locator('[data-t="R"]').click();await page.locator('[data-t="N"]').click();
   assert.equal(await page.locator(".circuit-town-board.is-lit").count(),1,"The new visual design must respond to a real connected loop");
   assert.equal(await page.locator(".circuit-town-board .town-power-reflections").first().evaluate(el=>getComputedStyle(el).opacity),"0.75",
     "Water reflections appear only when the circuit has genuinely powered the village");
   assert.equal(await page.locator(".circuit-town-board .town-window").first().evaluate(el=>getComputedStyle(el).fill),"rgb(255, 226, 160)",
     "Windows gain warm light only after the student closes the electrical loop");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-cinematic-lit.png",fullPage:true});
   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",state=JSON.parse(localStorage.getItem(key));
     state.completed={1:3,2:3};state.active=3;localStorage.setItem(key,JSON.stringify(state));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator(".akari-inspection-pin").first().waitFor();
   assert.equal(await page.locator(".akari-inspection-pin").count(),3,"Investigation remains part of the real working circuit");
   const stageThree=await page.evaluate(()=>{
     const el=document.querySelector(".akari-dock-center>.bridge-circuit");
     const r=el.getBoundingClientRect();
     return {frame:getComputedStyle(el).borderTopColor,
       width:r.width,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
   assert.equal(stageThree.frame,"rgb(189, 160, 127)","Stage 3 should use the same game-world frame");
   assert.equal(await page.locator(".bridge-circuit-svg .bridge-repair-fixtures").count(),1,
     "The battery and bulb share the same crafted hardware language in repair mode");
   assert.equal(await page.locator(".circuit-town-repair .town-play-surface").count(),1,
     "Stage 3 uses the same foreground workbench as the wiring mission");
   assert.equal(await page.locator(".circuit-town-repair .town-stone-bridge").count(),1,
     "The repair experiment uses the SAME painted 2.5D village as the early missions");
   assert.equal(await page.locator(".circuit-town-repair .town-power-reflections").first().evaluate(el=>getComputedStyle(el).opacity),"0",
     "Stage 3 cannot spoil the measured outcome with premature river illumination");
   assert.ok(stageThree.overflow<=2,"Stage 3 must not introduce horizontal overflow");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-cinematic-investigate.png",fullPage:true});
   // A later mission must recover the default HUD and free-lab location.
   await page.evaluate(()=>document.querySelector(".main").classList.remove("town-immersive"));
   await page.waitForFunction(()=>
     !!document.querySelector("#storyScene #sceneProgress")&&
     !!document.querySelector("#storyScene #stageCelebration")&&
     document.getElementById("freeLabToggle")?.nextElementSibling?.id==="workspace"
   );
   assert.equal(await page.locator("#storyScene #spark").count(),1,
     "Restoration of the ordinary scene includes the genuine short-circuit warning");
   assert.deepEqual(errors,[],"No runtime exceptions during stage 1 or stage 3");
   console.log("CINEMATIC PASS",engine,width,{stageOne,stageThree});
   await context.close();
  }finally{await browser.close();}
 }
}finally{await new Promise(resolve=>server.close(resolve));}
