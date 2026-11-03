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
   const completeNetwork=async(id)=>{
     const wires=id===7?[["P","A1"],["A2","B1"],["B2","L"],["R","N"]]:
       [["P","A1"],["P","B1"],["A2","L"],["B2","L"],["R","N"]];
     assert.equal(await page.locator(".network-lab").count(),1,"Free-wiring two-switch lab must open");
     assert.equal(await page.locator('[data-net-t]').count(),8,"Eight terminals should be usable");
     await page.locator('[data-net-view="right"]').click();
     if(width<740)assert.ok(await page.locator(".network-viewport").evaluate(e=>e.scrollLeft)>20,"Bulb side must be reachable on mobile");
     await page.locator('[data-net-view="left"]').click();
     const tap=async(a,b)=>{await page.locator('[data-net-t="'+a+'"]').click();await page.locator('[data-net-t="'+b+'"]').click()};
     // An incorrect prediction must not expose the dangerous route.
     await tap("P","N");await page.locator('[data-net-test]').click();
     assert.match(await page.locator("#feedbackText").textContent(),/ショート/,"Direct battery connection is unsafe");
     assert.equal(await page.locator(".network-diagnosis").count(),1,"Unsafe outcome opens science-based fault diagnosis");
     assert.equal(await page.locator(".network-flow-segment").count(),0,"Dangerous shortcut not spoiled before hypothesis");
     await page.locator('[data-net-cause="open"]').click();
     assert.equal(await page.locator(".network-diagnosis.solved").count(),0,"Wrong cause must be rejected");
     await page.locator('[data-net-cause="short"]').click();
     assert.equal(await page.locator(".network-diagnosis.solved").count(),1,"Correct hazardous shortcut diagnosis rewarded");
     assert.equal(await page.locator('.network-flow-segment.danger').count(),1,"Actual battery shortcut should glow after diagnosis");
     assert.equal(await page.locator(".network-trial.measured").count(),1,"Diagnosing must not erase recorded observation");
     await page.reload({waitUntil:"domcontentloaded"});
     assert.equal(await page.locator(".network-diagnosis.solved").count(),1,"A solved fault cause persists after reload");
     await tap("P","N");
     assert.equal(await page.locator(".network-diagnosis.solved").count(),0,"Rewiring invalidates old diagnostic evidence");
     if(id===8){
       // The lamp can glow while both switches are OFF if wires bypass them.
       for(const [a,b] of [["P","L"],["R","N"]])await tap(a,b);
       await page.locator('[data-net-test]').click();
       assert.equal(await page.locator(".network-diagnosis").count(),1,"Unexpected light must be investigated");
       await page.locator('[data-net-cause="bypass"]').click();
       assert.equal(await page.locator(".network-diagnosis.solved").count(),1,"Bypass diagnosis must match the actual circuit");
       assert.ok(await page.locator(".network-flow-segment").count()>0,"Electric path through bypassed switches should be visible");
       await page.locator('[data-net-clear]').click();
     }
     for(const [a,b] of wires)await tap(a,b);
     await page.locator('[data-net-test]').click(); // 00
     await page.locator('[data-net-switch="a"]').click();await page.locator('[data-net-test]').click(); // 10
     await page.reload({waitUntil:"domcontentloaded"});
     assert.equal(await page.locator(".network-lab").count(),1,"Reload restores unfinished network");
     assert.equal(await page.locator(".network-trial.measured").count(),2,"Two trials survived reload");
     await page.locator('[data-net-switch="b"]').click();await page.locator('[data-net-test]').click(); // 11
     if(id===7)assert.ok(await page.locator(".network-flow-segment").count()>4,"Closed series circuit must show the measured complete path");
     await page.locator('[data-net-switch="a"]').click();await page.locator('[data-net-test]').click(); // 01
     assert.equal(await page.locator(".network-trial.measured").count(),4,"All four combinations tested");
     assert.equal(await page.locator('[data-net-submit]').isDisabled(),true,"Causal explanation required");
     await page.locator('[data-net-reason="'+(id===7?"either":"both")+'"]').click();
     assert.equal(await page.locator('[data-net-submit]').isDisabled(),true,"Wrong conclusion rejected");
     await page.locator('[data-net-reason="'+(id===7?"both":"either")+'"]').click();
     assert.equal(await page.locator('[data-net-submit]').isDisabled(),false,"Correct topology and reasoning unlock stage");
     assert.equal(await page.locator(".network-power-ready").count(),1,"Completing the objective restores the power-ready indicator");
     await page.evaluate(()=>window.scrollTo(0,0));
     await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-switch-network-"+id+".png",fullPage:true});
     await page.locator('[data-net-submit]').click();
     assert.equal(await page.locator("#discovery").isVisible(),true,"Design success completes mission");
     assert.ok(await page.evaluate(id=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.key==="switchbuilder:"+id),id),"Design evidence saved");
   };

   const completeTransfer=async(id,tryWrong=false)=>{
     const values={
       2:{a:"dark",b:"lit",c:"lit",reason:"path"},
       7:{a:"dark",b:"lit",c:"dark",reason:"both"},
       12:{a:"short",b:"safe",c:"short",reason:"battery"},
       14:{a:"lit",b:"dark",c:"dark",reason:"closed"}
     }[id];
     assert.ok(values,"Unknown transfer test "+id);
     assert.equal(await page.locator(".transfer-probe").count(),1,"Only one unknown circuit is shown at a time on iPhone");
     assert.equal(await page.locator(".transfer-reason").count(),0,"Learners must predict before seeing causal choices");
     if(id===7)assert.match(await page.locator(".transfer-focus").textContent(),/AとBがON、CがOFF/,"Three-switch transfer should differ from two-switch tutorial");
     assert.equal(await page.locator("#checkBtn").isVisible(),false,"Main check must not bypass transfer challenge");
     if(tryWrong){
       const wrong=id===12?"safe":"lit";
       const wrongValue=wrong===values.a?(id===12?"short":"dark"):wrong;
       await page.locator('[data-transfer-answer="a"][data-transfer-value="'+wrongValue+'"]').click();
       assert.ok(await page.evaluate(id=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).drafts?.[id]?.answers?.a,id), "Draft answer should persist in storage");
       if(id===2){
         await page.reload({waitUntil:"domcontentloaded"});
         assert.equal(await page.locator(".transfer-probe").count(),1,"Reload should reopen the unfinished rescue scenario");
         assert.match(await page.locator(".transfer-focus").textContent(),/調査 2 \/ 3/,"Reload should continue from the second unfamiliar circuit");
         assert.equal(await page.locator("#checkBtn").isVisible(),false,"Reload should not escape the gated science puzzle");
       }
       for(const item of ["b","c"])await page.locator('[data-transfer-answer="'+item+'"][data-transfer-value="'+values[item]+'"]').click();
       await page.locator('[data-transfer-reason="'+values.reason+'"]').click();
       await page.locator('[data-transfer-verify]').click();
       assert.equal(await page.locator("#discovery").isVisible(),false,"Blind guessing must not complete scientific transfer");
     }
     for(const item of ["a","b","c"])await page.locator('[data-transfer-answer="'+item+'"][data-transfer-value="'+values[item]+'"]').click();
     assert.equal(await page.locator(".transfer-review-row").count(),3,"After prediction, show a compact comparison of three results");
     assert.equal(await page.locator(".transfer-probe").count(),0,"Collapse circuit diagrams into editable review after prediction");
     const wrongReason=id===7?"one":id===12?"off":id===14?"battery":"plus";
     await page.locator('[data-transfer-reason="'+wrongReason+'"]').click();
     await page.locator('[data-transfer-verify]').click();
     assert.equal(await page.locator("#discovery").isVisible(),false,"Predictions alone cannot bypass causal explanation");
     await page.locator('[data-transfer-reason="'+values.reason+'"]').click();
     await page.evaluate(()=>window.scrollTo(0,0));
     await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-transfer-"+id+".png",fullPage:true});
     await page.locator('[data-transfer-verify]').click();
     if(id===14){
       assert.equal(await page.locator(".builder-puzzle").count(),1,"Final transfer must unlock six-terminal circuit engineering");
       assert.equal(await page.locator("#discovery").isVisible(),false,"Final level cannot clear before circuit construction");
     }else assert.equal(await page.locator("#discovery").isVisible(),true,"Evidence-based challenge should open the next stage");
     assert.ok(await page.evaluate(id=>!JSON.parse(localStorage.getItem("rika-akari-quest-v2")).drafts?.[id],id),"Completed transfer must discard its draft");
   };
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto(origin+"/games/akari/",{waitUntil:"domcontentloaded"});
   await page.locator("#missionTitle").waitFor();
   assert.equal(await page.locator("#missionTitle").textContent(),"はじめてのひかり");
   assert.ok(await page.locator("#workspace svg").count()>0,"Game must render an illustrated circuit");
   assert.equal(await page.locator("#startupFallback").count(),0,"Normal browser must replace startup recovery with the interactive circuit");
   assert.equal(await page.locator("#sceneProps svg").count(),1,"Stage-specific scene illustration should load");
   assert.equal(await page.locator("#mapLights .map-lamp").count(),14,"Map must contain fourteen distinct lamps");
   assert.equal(await page.locator("#mapLights .map-lamp.lit").count(),0,"Fresh progress should start unlit");
   if(width<740){
     await page.locator("#mapToggle").click();
     assert.equal(await page.locator(".sidebar.open .map-light-grid").isVisible(),true,"Mobile map must display light status");
     await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-map.png",fullPage:true});
     await page.locator("#mapToggle").click();
   }
   assert.equal(await page.locator("#characterArt .tiranon-sprite-strip").count(),1,"Canonical dinosaur guide must render");
   assert.equal(await page.locator("#characterArt .tiranon-emote-fx").count(),1,"Character should have independent nonwarping expressive effects");
   await page.locator(".tiranon-sprite-strip").evaluate(async img=>{await img.decode();if(img.naturalWidth<100)throw Error("Walk sprite missing");});
   const spriteGeometry=await page.evaluate(()=>{
     const img=document.querySelector(".tiranon-sprite-strip"),frame=document.querySelector(".tiranon-sprite-frame");
     return {cellRatio:(img.naturalWidth/8)/img.naturalHeight,shownRatio:frame.getBoundingClientRect().width/frame.getBoundingClientRect().height,frames:img.naturalWidth/106};
   });
   assert.ok(Math.abs(spriteGeometry.cellRatio-spriteGeometry.shownRatio)<0.025,"Tiranon face and proportions must not stretch: "+JSON.stringify(spriteGeometry));
   assert.equal(spriteGeometry.frames,8,"Use all eight original Tiranon frames");

   const crowded=await page.evaluate(()=>{
     const c=document.querySelector("#sceneCharacter").getBoundingClientRect();
     const t=document.querySelector(".scene-caption").getBoundingClientRect();
     return c.left<t.right&&c.right>t.left&&c.top<t.bottom&&c.bottom>t.top;
   });
   assert.equal(crowded,false,"Character must remain visible outside the mission caption");

   const overflow=async()=>page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
   let dimensions=await overflow();assert.ok(dimensions.scroll<=dimensions.width+2,engine+" "+width+" initial overflow: "+JSON.stringify(dimensions));
   const overlap=await page.evaluate(()=>{
     const a=document.querySelector(".circuit-zoom-btn").getBoundingClientRect(),b=document.querySelector('[data-t="P"]').getBoundingClientRect();
     return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   });
   assert.equal(overlap,false,"Magnifier must not cover battery terminal");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-start.png",fullPage:true});
   await page.locator("[data-zoom]").click();
   assert.equal(await page.locator(".circuit-board.zoomed").count(),1,"Zoom should enlarge the interactive circuit");
   await page.locator('[data-view="bulb"]').click();
   const before=await page.locator(".circuit-board").evaluate(e=>({left:e.scrollLeft,client:e.clientWidth,total:e.scrollWidth}));
   if(before.total>before.client+20)assert.ok(before.left>50,"Zoomed mobile circuit must jump to bulb");
   await page.locator('[data-t="L"]').click();
   const scrollAfter=await page.locator(".circuit-board").evaluate(e=>e.scrollLeft);
   assert.ok(Math.abs(before.left-scrollAfter)<5,"Pan position must survive selecting a terminal");
   await page.locator('[data-t="L"]').click();
   await page.locator('[data-view="battery"]').click();
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-zoom.png",fullPage:true});
   await page.locator('[data-t="P"]').click();await page.locator('[data-t="N"]').click();
   assert.match(await page.locator("#feedbackText").textContent(),/ショート/);
   assert.equal(await page.locator("#sceneCharacter").getAttribute("data-mood"),"danger","Short should trigger worried reaction");
   assert.equal(await page.locator("#stageCelebration").isVisible(),false,"Short is never celebrated");
   assert.equal(await page.locator(".fx-danger").evaluate(e=>getComputedStyle(e).visibility),"visible","Short must show a distinct caution symbol");
   assert.equal(await page.locator("#restorationTrail").isVisible(),false,"Short must not light the town");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-danger.png",fullPage:true});

   await page.locator('[data-unwire="0"]').click();
   await page.locator('[data-t="P"]').click();await page.locator('[data-t="L"]').click();
   await page.locator('[data-t="N"]').click();await page.locator('[data-t="R"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Stage 1 completion must show discovery");
   assert.equal(await page.locator("#sceneCharacter").getAttribute("data-mood"),"celebrate","Safe success should cheer");
   assert.equal(await page.locator("#stageCelebration").isVisible(),true,"A nonblocking victory burst should show");
   assert.equal(await page.locator("#litPlaceCount").textContent(),"1","The map restoration counter should advance");
   assert.equal(await page.locator("#mapLights .map-lamp.lit").count(),1,"First clear should illuminate one journey map lantern");
   assert.equal(await page.locator(".story-scene.energizing").count(),1,"First successful experiment should trigger the town restoration pulse");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-clear.png",fullPage:true});

   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.mission===1)),"Completed discovery must be saved");
   await page.emulateMedia({reducedMotion:"no-preference"});
   await page.locator("#nextBtn").click();
   const walkName=await page.locator(".tiranon-sprite-strip").evaluate(e=>getComputedStyle(e).animationName);
   assert.match(walkName,/tiranonWalkFrames/,"Only mission travel should play the eight-frame walk");
   await page.emulateMedia({reducedMotion:"reduce"});

   assert.equal(await page.locator("#missionTitle").textContent(),"切れた通り道");
   assert.equal(await page.locator("#sceneCharacter").getAttribute("data-mood"),"walk","Next mission triggers a natural short walk");
   assert.equal(await page.locator("#stageCelebration").isVisible(),false,"Victory badge must not leak to next stage");
   assert.equal(await page.locator("#restorationTrail").isVisible(),false,"Restoration pulse must not leak to next mission");

   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"切れた通り道","Progress must be restored after reload");
   await page.evaluate(()=>{const k="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(k));s.active=1;localStorage.setItem(k,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".story-scene.restored").count(),1,"Previously restored town must remain illuminated after return and reload");
   assert.equal(await page.locator(".circuit-board.is-lit").count(),0,"Saved town lights must not fake a closed experiment circuit");
   assert.match(await page.locator("#missionStory").textContent(),/前の冒険/,"Revisited stage must explain that town was already restored");
   assert.equal(await page.locator("#mapLights .map-lamp.lit").count(),1,"Revisiting should retain the first map light");
   await page.evaluate(()=>{const k="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(k));s.active=2;localStorage.setItem(k,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator('[data-t="N"]').click();await page.locator('[data-t="R"]').click();await page.locator("#checkBtn").click();
   await completeTransfer(2,true);
   assert.equal(await page.locator("#masteryCount").textContent(),"1","First successful transfer earns a reasoning token");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".story-scene.restored").count(),1,"A solved transfer case stays saved after reload");
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.key==="transfer:2")),"Scientific transfer discovery must persist");
   await page.evaluate(()=>{const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));s.completed={};for(let i=1;i<=10;i++)s.completed[i]=3;s.active=11;localStorage.setItem(key,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"電池の向きのひみつ");
   assert.equal(await page.locator(".battery-art").count(),2,"Compare two detailed battery orientations");
   await page.locator('[data-choice="reverse"]').click();
   dimensions=await overflow();assert.ok(dimensions.scroll<=dimensions.width+2,engine+" "+width+" battery overflow: "+JSON.stringify(dimensions));
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-battery.png",fullPage:true});
   await page.locator("#checkBtn").click();
   await page.locator('[data-choice="same"]').click();await page.locator("#checkBtn").click();
   await page.locator('[data-answer="same"]').click();await page.locator("#checkBtn").click();
   assert.match(await page.locator("#feedbackText").textContent(),/理由/,"Observations alone should not clear polarity");
   await page.locator('[data-why="single"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Incorrect polarity explanation should not clear");
   await page.locator('[data-why="cancel"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Battery cancellation explanation should clear");

   await page.evaluate(()=>{const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));s.active=4;localStorage.setItem(key,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator('[data-choice="clip"]').click();
   await page.locator("#checkBtn").click();
   assert.match(await page.locator("#feedbackText").textContent(),/予想/,"Material test requires an explicit hypothesis");
   await page.locator('[data-predict="dark"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator(".test-circuit-art").count(),1,"Material test must show the complete circuit");
   assert.match(await page.locator(".prediction-panel").textContent(),/予想.*消灯.*実際.*点灯/s,"A mistaken prediction should be compared to real evidence");
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.mission===4&&n.text.includes("予想は消灯"))),"Observation journal should retain scientific hypotheses");
   dimensions=await overflow();assert.ok(dimensions.scroll<=dimensions.width+2,"Material circuit overflow");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-materials.png",fullPage:true});

   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.completed={};for(let i=1;i<=5;i++)s.completed[i]=3;
     s.active=6;localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator('[data-inspect="wire"]').click();
   await page.locator('[data-suspect="wire"]').click();
   assert.equal(await page.locator('[data-diagnose]').isDisabled(),true,"Diagnosis requires examining all components");
   for(const id of ["battery","bulb"])await page.locator('[data-inspect="'+id+'"]').click();
   await page.locator('[data-suspect="battery"]').click();
   await page.locator('[data-diagnose]').click();
   assert.equal(await page.locator('.diagnosis-panel.complete').count(),0,"Wrong hypothesis cannot enable repair");
   await page.locator('[data-suspect="battery"]').click();
   await page.locator('[data-diagnose]').click();
   assert.equal(await page.locator('.diagnosis-panel.complete').count(),1,"Correct deduction unlocks repair");
   await page.locator('[data-fix="wire"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Diagnosing fault does not bypass scientific wiring");
   assert.equal(await page.locator(".builder-direct").count(),1,"Clock tower should unlock basic four-terminal construction");
   assert.equal(await page.locator('[data-builder-switch]').count(),0,"Basic practice does not yet use switches");
   assert.equal(await page.locator('[data-builder-t]').count(),4,"Only battery and bulb terminals should be selectable");
   const tapPractice=async(a,b)=>{
     await page.locator('[data-builder-t="'+a+'"]').click();
     await page.locator('[data-builder-t="'+b+'"]').click();
   };
   await tapPractice("P","N");
   await page.locator('[data-builder-test]').click();
   assert.match(await page.locator("#feedbackText").textContent(),/ショート/,"Unsafe direct connection should never pass");
   await tapPractice("P","N");
   await tapPractice("P","L");
   await tapPractice("N","R");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".builder-direct").count(),1,"Reload must resume the basic construction task");
   assert.equal(await page.locator(".builder-line").count(),2,"Both student-drawn wires must survive reload");
   await page.locator('[data-builder-test]').click();
   assert.match(await page.locator(".builder-measure").textContent(),/点灯/,"Closed circuit must light the bulb");
   assert.equal(await page.locator('[data-builder-submit]').isDisabled(),true,"A lit circuit is not enough until the student traces its path");
   assert.equal(await page.locator(".builder-proof").count(),1,"Proof panel appears after a safe experiment");
   await page.locator('[data-builder-trace="L"]').click();
   assert.match(await page.locator("#feedbackText").textContent(),/＋極/,"Tracing must start at the positive terminal");
   await page.locator('[data-builder-trace="P"]').click();
   await page.locator('[data-builder-trace="L"]').click();
   await page.reload({waitUntil:"domcontentloaded"});
   assert.match(await page.locator(".builder-trace-sequence").textContent(),/電池＋.*電球の横/,"Half-complete scientific route survives reload");
   await page.locator('[data-builder-trace="R"]').click();
   await page.locator('[data-builder-trace="N"]').click();
   assert.equal(await page.locator('[data-builder-submit]').isDisabled(),false,"Correct path through both lamp contacts unlocks finishing");
   assert.equal(await page.locator(".builder-proof-path path").count(),3,"The proof path should glow on the actual diagram");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-clock-wired.png",fullPage:true});
   await page.locator('[data-builder-submit]').click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Investigated and rewired clock tower should finish");
   assert.equal(await page.locator(".builder-direct").count(),0,"After completion workshop must close");
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.key==="builder:6")),"Observations should include student-built circuit");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-clock-diagnosis.png",fullPage:true});

   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.completed={};for(let i=1;i<=6;i++)s.completed[i]=3;
     s.active=7;localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator("#checkBtn").click();
   await page.locator('[data-switch="a"]').click();await page.locator("#checkBtn").click();
   await page.locator('[data-switch="b"]').click();await page.locator("#checkBtn").click();
   await page.locator('[data-switch="a"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator('.science-conclusion').count(),1,"Four switch trials must require a conclusion");
   assert.equal(await page.locator("#discovery").isVisible(),false,"Filling all four switch outcomes cannot auto-clear");
   await page.locator('[data-conclude="both"]').click();await page.locator("#checkBtn").click();
   await completeNetwork(7);
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-switch-conclusion.png",fullPage:true});
   await page.evaluate(()=>{const k="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(k));for(let i=1;i<=7;i++)s.completed[i]=3;s.active=8;localStorage.setItem(k,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator('[data-design="parallel"]').click();
   await page.locator("#checkBtn").click();
   await page.locator('[data-switch="a"]').click();await page.locator("#checkBtn").click();
   await page.locator('[data-switch="b"]').click();await page.locator("#checkBtn").click();
   await page.locator('[data-switch="a"]').click();await page.locator("#checkBtn").click();
   await page.locator('[data-conclude="either"]').click();await page.locator("#checkBtn").click();
   await completeNetwork(8);

   await page.evaluate(()=>{const k="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(k));s.completed={};for(let i=1;i<=11;i++)s.completed[i]=3;s.active=12;localStorage.setItem(k,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator('.short-art [data-line="x"]').count(),1,"Dangerous path X should be distinguishable geometrically");
   assert.doesNotMatch(await page.locator(".lab-reading").first().textContent(),/赤い導線がショートの原因/,"Unsafe wires must not be color-coded as the answer");
   await page.locator('[data-cut="normal"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Removing the path through the bulb must not work");
   await page.locator('[data-cut="normal"]').click();
   await page.locator('[data-cut="x"]').click();
   assert.equal(await page.locator('.short-art [data-line="x"]').getAttribute("opacity"),".21","Cut wires should visibly dim in the topology drawing");
   await page.locator('[data-cut="y"]').click();
   assert.match(await page.locator(".short-art").textContent(),/安全な回路だけが残った/,"Safe repair changes the diagram state");
   await page.locator("#checkBtn").click();
   await completeTransfer(12,true);

   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.completed={};for(let i=1;i<=12;i++)s.completed[i]=3;
     s.active=13;localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   for(const id of ["wire","bulb","battery"])await page.locator('[data-inspect="'+id+'"]').click();
   await page.locator('[data-suspect="wire"]').click();
   await page.locator('[data-diagnose]').click();
   assert.equal(await page.locator('.diagnosis-panel.complete').count(),0,"Double faults need two suspects");
   await page.locator('[data-suspect="bulb"]').click();
   await page.locator('[data-diagnose]').click();
   await page.locator('[data-fix="wire"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"One of two repairs cannot complete");
   await page.locator('[data-fix="bulb"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Two repairs restore lighthouse");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-double-fault.png",fullPage:true});

   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.completed={};for(let i=1;i<=13;i++)s.completed[i]=3;
     s.active=14;localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"ひかりを取り戻せ！");
   assert.ok(await page.locator(".landmark .window").count()>0,"Lighthouse must show physical lighting");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-lighthouse-before.png",fullPage:true});
   await page.locator('[data-final="direction"][data-value="same"]').click();
   await page.locator('[data-final="material"][data-value="clip"]').click();
   await page.locator('[data-final="contact"][data-value="true"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator(".story-scene.restored").count(),0,"Selecting three answers must not bypass diagnostic experiments");
   for(const key of ["direction","material","contact"]){
     await page.locator('[data-verify="'+key+'"]').click();
   }
   assert.equal(await page.locator(".verification-step.ok").count(),3,"All final components must be investigated separately");
   await page.locator("#checkBtn").click();
   await completeTransfer(14,true);
   assert.equal(await page.locator("#masteryCount").textContent(),"5","Engineering of two switch networks plus three transfer discoveries must be recorded");

   const tapPair=async(a,b)=>{
     await page.locator('[data-builder-t="'+a+'"]').click();
     await page.locator('[data-builder-t="'+b+'"]').click();
   };
   await page.locator('[data-builder-view="bulb"]').click();
   if(width<740){
     const scrolled=await page.locator(".builder-viewport").evaluate(e=>e.scrollLeft);
     assert.ok(scrolled>50,"Small-screen bulb navigation should reveal hidden right terminals");
   }
   await page.locator('[data-builder-view="battery"]').click();
   assert.equal(await page.locator(".builder-viewport").evaluate(e=>e.scrollLeft),0,"Battery navigation returns to first endpoints");
   assert.equal(await page.locator('[data-builder-submit]').isDisabled(),true,"Builder completion locked until both tests succeed");
   await tapPair("P","N");
   await page.locator('[data-builder-test]').click();
   assert.match(await page.locator("#feedbackText").textContent(),/ショート/,"Direct battery connection is a hazard");
   assert.equal(await page.locator("#discovery").isVisible(),false,"Unsafe circuit must not clear");
   await tapPair("P","N");

   for(const [a,b] of [["P","S"],["T","L"],["R","N"]])await tapPair(a,b);
   await page.locator('[data-builder-switch="off"]').click();
   await page.locator('[data-builder-test]').click();
   assert.match(await page.locator(".builder-measure").first().textContent(),/消灯/,"OFF must leave bulb unlit");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".builder-puzzle").count(),1,"Reload should reopen unfinished wiring design");
   assert.equal(await page.locator(".builder-line").count(),3,"Saved wires must reappear");
   await page.locator('[data-builder-switch="on"]').click();
   await page.locator('[data-builder-test]').click();
   assert.match(await page.locator(".builder-measure").last().textContent(),/点灯/,"ON must light bulb through switch");
   assert.equal(await page.locator('[data-builder-submit]').isDisabled(),true,"Both safe tests still require a circuit-path explanation");
   await page.locator('[data-builder-trace="P"]').click();
   await page.locator('[data-builder-trace="N"]').click();
   assert.match(await page.locator("#feedbackText").textContent(),/つながり/,"Unsafe impossible leap is rejected without revealing next terminal");
   for(const id of ["S","T","L"])await page.locator('[data-builder-trace="'+id+'"]').click();
   await page.locator('[data-builder-trace-back]').click();
   assert.match(await page.locator(".builder-trace-sequence").textContent(),/スイッチ出口/,"Student can undo a science explanation step");
   await page.locator('[data-builder-trace="L"]').click();
   await page.reload({waitUntil:"domcontentloaded"});
   assert.match(await page.locator(".builder-trace-sequence").textContent(),/電球の横/,"Reload retains reasoning as well as wiring");
   for(const id of ["R","N"])await page.locator('[data-builder-trace="'+id+'"]').click();
   assert.equal(await page.locator('[data-builder-submit]').isDisabled(),false,"A valid route through switch AND bulb unlocks finishing");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-self-built-circuit.png",fullPage:true});
   if(width<740){
     await page.locator('[data-builder-view="bulb"]').click();
     await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-self-built-bulb-side.png",fullPage:true});
     await page.locator('[data-builder-view="battery"]').click();
   }
   await page.locator('[data-builder-submit]').click();
   assert.equal(await page.locator(".builder-puzzle").count(),0,"Correct wiring closes workbench");
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.key==="builder:14")),"Final engineering result saved in notebook");

   assert.equal(await page.locator(".story-scene.restored").count(),1,"Final restoration should relight scenery");
   assert.equal(await page.locator("#celebrationTitle").textContent(),"灯台の光が戻った！");
   assert.equal(await page.locator("#litPlaceCount").textContent(),"14","All 14 places should light");
   assert.equal(await page.locator("#mapLights .map-lamp.lit").count(),14,"Final restoration must illuminate every map lamp");

   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-lighthouse-after.png",fullPage:true});
   assert.deepEqual(errors,[],engine+" "+width+" browser errors");
   console.log("PASS",engine,width+"px","circuit tap, short warning, save, battery art, overflow");
   if(engine==="chromium"&&width===320){
     const noJavaScript=await browser.newContext({viewport:{width:320,height:690},javaScriptEnabled:false});
     const viewer=await noJavaScript.newPage();
     await viewer.goto(origin+"/games/akari/",{waitUntil:"domcontentloaded"});
     const recovery=viewer.locator("#startupFallback");
     assert.equal(await recovery.isVisible(),true,"Script-blocking preview must explain why the circuit is blank");
     assert.match(await recovery.textContent(),/Safari.*Web版/s,"Recovery must direct users to web playback");
     const href=await recovery.locator("a").getAttribute("href");
     assert.match(href||"",/^https:\/\/rawcdn\.githack\.com\/stusaurus\/rika-quest\/[a-f0-9]{40}\/games\/akari\/index\.html$/);
     await viewer.screenshot({path:"artifacts/akari/no-javascript-recovery-320.png",fullPage:true});
     await noJavaScript.close();
   }
   await context.close();count++;
  }finally{await browser.close()}
 }
 console.log("Browser QA passed:",count,"viewport/engine combinations");
}finally{await new Promise(resolve=>server.close(resolve))}
