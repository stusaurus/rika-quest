import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,existsSync,mkdirSync} from "node:fs";
import {join,normalize,extname} from "node:path";
import {chromium,webkit} from "playwright";

const root=process.cwd(),port=8765,origin="http://127.0.0.1:"+port;
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml"};
const server=createServer((req,res)=>{
 const uri=new URL(req.url||"/",origin),route=decodeURIComponent(uri.pathname);
 const rel=route.endsWith("/")?route+"index.html":route;
 const full=normalize(join(root,rel.replace(/^\//,"")));
 if(!full.startsWith(root)){res.writeHead(403).end();return}
 try{const bytes=readFileSync(full);res.writeHead(200,{"Content-Type":mime[extname(full)]||"application/octet-stream","Cache-Control":"no-store"});res.end(bytes)}
 catch{res.writeHead(404).end("Not found")}
});
await new Promise(resolve=>server.listen(port,"127.0.0.1",resolve));
mkdirSync("artifacts/akari",{recursive:true});
let count=0;
try{
 for(const [engine,width,height] of [["chromium",320,690],["chromium",390,844],["chromium",1440,900],["webkit",390,844]]){
  const browser=await (engine==="chromium"?chromium:webkit).launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:engine==="webkit",isMobile:engine==="webkit",reducedMotion:"reduce"});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto(origin+"/games/akari/",{waitUntil:"domcontentloaded"});
   await page.locator("#missionTitle").waitFor();
   assert.equal(await page.locator("#missionTitle").textContent(),"はじめてのひかり");
   assert.ok(await page.locator("#workspace svg").count()>0,"Game must render an illustrated circuit");
   assert.equal(await page.locator("#sceneProps svg").count(),1,"Stage-specific scene illustration should load");
   await page.locator("[data-zoom]").click();
   assert.equal(await page.locator(".circuit-board.zoomed").count(),1,"Zoom should enlarge the interactive circuit");
   await page.locator("[data-zoom]").click();
   const overflow=async()=>page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
   let dimensions=await overflow();assert.ok(dimensions.scroll<=dimensions.width+2,engine+" "+width+" initial overflow: "+JSON.stringify(dimensions));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-start.png",fullPage:true});
   await page.locator('[data-t="P"]').click();await page.locator('[data-t="N"]').click();
   assert.match(await page.locator("#feedbackText").textContent(),/ショート/);
   await page.locator('[data-unwire="0"]').click();
   await page.locator('[data-t="P"]').click();await page.locator('[data-t="L"]').click();
   await page.locator('[data-t="N"]').click();await page.locator('[data-t="R"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Stage 1 completion must show discovery");
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.mission===1)),"Completed discovery must be saved");
   await page.locator("#nextBtn").click();
   assert.equal(await page.locator("#missionTitle").textContent(),"切れた通り道");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"切れた通り道","Progress must be restored after reload");
   await page.evaluate(()=>{const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));for(let i=1;i<=10;i++)s.completed[i]=3;s.active=11;localStorage.setItem(key,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"電池の向きのひみつ");
   assert.equal(await page.locator(".battery-art").count(),2,"Compare two detailed battery orientations");
   await page.locator('[data-choice="reverse"]').click();
   dimensions=await overflow();assert.ok(dimensions.scroll<=dimensions.width+2,engine+" "+width+" battery overflow: "+JSON.stringify(dimensions));
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-battery.png",fullPage:true});
   assert.deepEqual(errors,[],engine+" "+width+" browser errors");
   console.log("PASS",engine,width+"px","circuit tap, short warning, save, battery art, overflow");
   await context.close();count++;
  }finally{await browser.close()}
 }
 console.log("Browser QA passed:",count,"viewport/engine combinations");
}finally{await new Promise(resolve=>server.close(resolve))}
