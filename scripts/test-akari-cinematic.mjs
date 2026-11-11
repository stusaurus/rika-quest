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
   const stageOne=await page.evaluate(()=>{
     const board=document.querySelector(".circuit-board"),head=document.querySelector(".quest-head"),
      terminal=document.querySelector(".terminal"),sky=document.querySelector("#tcSky stop");
     const rect=board.getBoundingClientRect(),tap=terminal.getBoundingClientRect();
     return {frame:getComputedStyle(board).borderTopColor,
       header:getComputedStyle(head).backgroundImage,
       sky:sky?.getAttribute("stop-color"),
       boardTop:rect.top,boardWidth:rect.width,
       touch:Math.min(tap.width,tap.height),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
   });
   assert.equal(stageOne.sky,"#172f4f","Cinematic version must repaint the actual world, not merely recolor website boxes");
   assert.equal(stageOne.frame,"rgb(198, 165, 116)","Real circuit should sit within the new cinematic warm-metal frame");
   assert.ok(stageOne.touch>=44,"Electrical contacts remain thumb-sized");
   assert.ok(stageOne.overflow<=2,"No sideways page scroll");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-cinematic-start.png",fullPage:true});
   await page.locator('[data-t="P"]').click();await page.locator('[data-t="L"]').click();
   await page.locator('[data-t="R"]').click();await page.locator('[data-t="N"]').click();
   assert.equal(await page.locator(".circuit-town-board.is-lit").count(),1,"The new visual design must respond to a real connected loop");
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
   assert.equal(stageThree.frame,"rgb(198, 165, 116)","Stage 3 should use the same game-world frame");
   assert.ok(stageThree.overflow<=2,"Stage 3 must not introduce horizontal overflow");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-cinematic-investigate.png",fullPage:true});
   assert.deepEqual(errors,[],"No runtime exceptions during stage 1 or stage 3");
   console.log("CINEMATIC PASS",engine,width,{stageOne,stageThree});
   await context.close();
  }finally{await browser.close();}
 }
}finally{await new Promise(resolve=>server.close(resolve));}
