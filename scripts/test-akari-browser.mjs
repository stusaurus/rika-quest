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
       5:{a:"dark",b:"lit",c:"lit",reason:"material"},
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


   // Mission 3: bridge exploration -> material experiment -> repair two series gaps.
   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.completed={1:3,2:3};s.active=3;s.bridgeDraft=null;
     localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".bridge-sites [data-bridge-inspect]").count(),3,"Bridge should offer three real inspection locations");
   assert.equal(await page.locator(".bridge-materials").count(),0,"Equipment tests should not appear before observing site");
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Picking a winner without experiment cannot clear bridge");
   for(const site of ["battery","lamp","return"])await page.locator('[data-bridge-inspect="'+site+'"]').click();
   assert.equal(await page.locator(".bridge-materials [data-bridge-sample]").count(),4,"Discover four visually distinct material samples");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-bridge-explore.png",fullPage:true});
   await page.locator('[data-bridge-sample="iron"]').click();
   assert.equal(await page.locator('[data-bridge-test]').isDisabled(),true,"Scientifically explicit hypothesis is required");
   await page.locator('[data-bridge-guess="dark"]').click();
   await page.locator('[data-bridge-test]').click();
   assert.match(await page.locator(".bridge-test-box").textContent(),/予想：消灯.*実際：点灯/s,"Wrong hypothesis must be compared with evidence");
   assert.equal(await page.locator(".bridge-mini-circuit svg").count(),1,"Actual battery-bulb sample test schematic is present");
   await page.locator('[data-bridge-sample="wood"]').click();
   await page.locator('[data-bridge-guess="lit"]').click();await page.locator('[data-bridge-test]').click();
   await page.locator('[data-bridge-sample="foil"]').click();
   await page.locator('[data-bridge-guess="lit"]').click();await page.locator('[data-bridge-test]').click();
   assert.equal(await page.locator(".bridge-slot-actions").count(),1,"Contrasting scientific tests should reveal the real repair puzzle");
   await page.locator('[data-bridge-sample="iron"]').click();await page.locator('[data-bridge-place="a"]').click();
   await page.locator('[data-bridge-sample="wood"]').click();await page.locator('[data-bridge-place="b"]').click();
   await page.locator('[data-bridge-repair-guess="lit"]').click();await page.locator('[data-bridge-repair-test]').click();
   assert.equal(await page.locator(".bridge-outcome.dark").count(),1,"Insulator in series leaves the bridge unlit");
   assert.equal(await page.locator(".story-scene.bridge-powered").count(),0,"Failing circuit must not illuminate landscape");
   await page.locator('[data-bridge-sample="foil"]').click();
   await page.locator('[data-bridge-place="b"]').click();
   assert.equal(await page.locator(".bridge-outcome").count(),0,"Changing sample invalidates previous measurement");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".bridge-slot-actions").count(),1,"Interrupted iPhone experiment resumes repair phase");
   assert.equal(await page.locator('.bridge-slot-actions [data-bridge-place="b"] span').textContent(),"アルミはく","Saved repair persists after reload");
   await page.locator('[data-bridge-repair-guess="lit"]').click();await page.locator('[data-bridge-repair-test]').click();
   assert.equal(await page.locator(".bridge-outcome.lit").count(),1,"Two tested conductors complete an actual loop");
   assert.equal(await page.locator(".story-scene.bridge-powered").count(),1,"The bridge visually responds to observed working circuit");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-bridge-lit.png",fullPage:true});
   await page.locator('[data-bridge-reason="one"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"A wrong explanation cannot clear despite light");
   await page.locator('[data-bridge-reason="both"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Evidence, physical repair and scientific reason unlock stage3");
   assert.equal(await page.locator(".story-scene.restored").count(),1,"Restored story scene must remain consistent");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).bridgeDraft),null,"Completed bridge removes transient evidence");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).completed[3]),3,"Incorrect scientific predictions are not penalized");

   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.active=4;s.gardenDrafts={};localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".garden-contacts button").count(),2,"Stage4 asks about contact control");
   assert.equal(await page.locator(".garden-samples").count(),0,"Do not give materials before discovering experimental control");
   assert.equal(await page.locator('[data-garden-calibrate]').isDisabled(),true,"Calibration requires a prediction");
   await page.locator('[data-garden-guess="lit"]').click();await page.locator('[data-garden-calibrate]').click();
   assert.match(await page.locator(".garden-measured").first().textContent(),/実際.*消灯/,"An open metal contact must stay dark");
   await page.locator('[data-garden-clamp="tight"]').click();
   await page.locator('[data-garden-guess="dark"]').click();await page.locator('[data-garden-calibrate]').click();
   assert.match(await page.locator(".garden-measured").first().textContent(),/実際.*点灯/,"Closing the same clip changes the result");
   await page.locator('[data-garden-control-reason="identity"]').click();
   assert.equal(await page.locator(".garden-samples").count(),0,"Incorrect causal interpretation must not unlock comparison");
   await page.locator('[data-garden-control-reason="control"]').click();
   assert.equal(await page.locator('.garden-samples [data-garden-sample]').count(),4,"Learners can choose the order of material trials");
   await page.locator('[data-garden-sample="clip"]').click();
   await page.locator('[data-garden-guess="dark"]').last().click();
   await page.locator('[data-garden-test]').click();
   assert.match(await page.locator(".garden-measured").last().textContent(),/予想.*消灯.*実際.*点灯/s,"A mistaken prediction remains visible alongside actual observation");
   await page.locator('[data-garden-clamp="loose"]').click();
   await page.locator('[data-garden-guess="dark"]').last().click();await page.locator('[data-garden-test]').click();
   assert.match(await page.locator(".garden-measured").last().textContent(),/実際.*消灯/,"Loose contact must give a false negative even on same metal");
   await page.locator('[data-garden-clamp="tight"]').click();
   for(const [id,guess] of [["foil","lit"],["wood","dark"]]){
     await page.locator('[data-garden-sample="'+id+'"]').click();
     await page.locator('[data-garden-guess="'+guess+'"]').last().click();
     await page.locator('[data-garden-test]').click();
   }
   assert.equal(await page.locator(".garden-explain").count(),1,"Comparative evidence unlocks a scientific conclusion");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-garden4-controlled-research.png",fullPage:true});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".garden-explain").count(),1,"Experimental evidence should survive a mobile reload");
   assert.match(await page.locator(".garden-journal").textContent(),/鉄のクリップ/,"Lab notes survive navigation and reload");
   await page.locator('[data-garden-material-reason="shiny"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Looks-alone theory fails causal requirement");
   await page.locator('[data-garden-material-reason="material"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Controlled experimental design and explanation complete mission4");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).completed[4]),3,"Wrong hypotheses are not graded as failure");
   await page.locator("#nextBtn").click();
   assert.equal(await page.locator("#missionTitle").textContent(),"にせものの金属","Next mission has a distinct engineering story");
   assert.equal(await page.locator(".garden-hazard").count(),1,"Stage5 virtual short caution must remain visible");
   assert.equal(await page.locator(".garden-schematic").count(),0,"Safety wiring is unlocked only through material evidence");
   for(const [id,guess] of [["clip","dark"],["wood","lit"],["plastic","dark"]]){
     await page.locator('[data-garden-sample="'+id+'"]').click();
     await page.locator('[data-garden-guess="'+guess+'"]').click();
     await page.locator('[data-garden-test]').click();
   }
   assert.equal(await page.locator(".garden-slots [data-garden-slot]").count(),3,"After evidence, place a conductor and two insulating partitions");
   await page.locator('[data-garden-sample="wood"]').click();await page.locator('[data-garden-slot="link"]').click();
   await page.locator('[data-garden-sample="clip"]').click();await page.locator('[data-garden-slot="guardA"]').click();
   await page.locator('[data-garden-sample="plastic"]').click();await page.locator('[data-garden-slot="guardB"]').click();
   await page.locator('[data-garden-design-guess="lit"]').click();await page.locator('[data-garden-design-test]').click();
   assert.equal(await page.locator(".garden-measured.danger").count(),1,"A metal partition creates a dangerous virtual shortcut, even if lamp path is broken");
   assert.equal(await page.locator(".garden-explain").count(),0,"Hazard cannot unlock scientific explanation");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-garden5-virtual-short.png",fullPage:true});
   await page.locator('[data-garden-sample="clip"]').click();await page.locator('[data-garden-slot="link"]').click();
   await page.locator('[data-garden-sample="wood"]').click();await page.locator('[data-garden-slot="guardA"]').click();
   assert.equal(await page.locator(".garden-measured").count(),0,"Replacing material invalidates old dangerous measurement");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator('[data-garden-slot="link"] span').textContent(),"鉄のクリップ","Wired conductor must persist through reload");
   assert.equal(await page.locator('[data-garden-slot="guardA"] span').textContent(),"乾いた木片","Insulation remains in place after reload");
   await page.locator('[data-garden-design-guess="dark"]').click();await page.locator('[data-garden-design-test]').click();
   assert.match(await page.locator(".garden-measured").textContent(),/実際.*点灯/,"Actual lamp result overrules incorrect hypothesis");
   assert.equal(await page.locator(".garden-explain").count(),1,"Only safe current path unlocks causal science questions");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-garden5-safe-lit.png",fullPage:true});
   await page.locator('[data-garden-path-reason="glass"]').click();
   await page.locator('[data-garden-cover-reason="insulate"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Unscientific current-path explanation must not pass");
   await page.locator('[data-garden-path-reason="loop"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator(".transfer-puzzle").count(),1,"Engineering success must still require existing unseen-circuit transfer");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".transfer-puzzle").count(),1,"Transfer must resume rather than force the stage5 experiment again");
   await completeTransfer(5);
   assert.equal(await page.locator("#discovery").isVisible(),true,"Causal transfer plus safe design completes mission5");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).gardenDrafts?.[5]),undefined,"Clear removes temporary engineering save");
   dimensions=await overflow();assert.ok(dimensions.scroll<=dimensions.width+2,"Garden workshop must not overflow narrow viewport");
   await page.evaluate(()=>window.scrollTo(0,0));

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
   assert.equal(await page.locator(".builder-diagnostic-flow").count(),0,"Danger path is hidden until scientific cause is identified");
   await page.locator('[data-builder-cause="open"]').click();
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),0,"Incorrect diagnosis does not reveal fault");
   await page.locator('[data-builder-cause="short"]').click();
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),1,"Correct short-circuit diagnosis unlocks evidence");
   assert.equal(await page.locator('[data-diagnostic-edge="N-P"]').count(),1,"Real shortcut glows on the circuit");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-clock-short-diagnosed.png",fullPage:true});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),1,"Clock fault evidence persists on reload");
   await tapPractice("P","N");
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),0,"Rewiring invalidates the old diagnosis");
   await tapPractice("P","L");
   await page.locator('[data-builder-test]').click();
   assert.equal(await page.locator('[data-builder-cause="open"]').count(),1,"Incomplete loop should be investigated");
   await page.locator('[data-builder-cause="open"]').click();
   assert.ok(await page.locator(".builder-reachable").count()>0,"Correct open-loop reason lights reachable battery contacts");
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
   assert.equal(await page.locator(".safety-lab").count(),1,"Mission12 becomes three progressive safety designs");
   assert.equal(await page.locator(".safety-svg").count(),1,"Circuit topology must be visible before choosing wires");
   assert.equal(await page.locator(".safety-wire.cut").count(),0,"Dangerous paths must not be highlighted as answers");
   await page.locator('[data-safe-view="right"]').click();
   if(width<740)assert.ok(await page.locator(".safety-diagram").evaluate(e=>e.scrollLeft)>10,"Safety diagram should pan right on mobile");
   await page.locator('[data-safe-view="left"]').click();
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-safety-inspection-start.png",fullPage:true});
   await page.locator('[data-safe-guess="lit"]').click();
   await page.locator('[data-safe-test]').click();
   assert.match(await page.locator(".safety-result").textContent(),/ショート/,"Unrepaired path must be an unsafe simulated short");
   assert.equal(await page.locator('[data-safe-next]').count(),0,"Wrong prediction never unlocks next case");
   await page.locator('[data-safe-wire="A"]').click();
   await page.locator('[data-safe-wire="B"]').click();
   await page.locator('[data-safe-wire="C"]').click();
   await page.locator('[data-safe-guess="open"]').click();
   await page.locator('[data-safe-test]').click();
   assert.match(await page.locator(".safety-result").textContent(),/消灯/,"Removing the lamp loop must not earn credit");
   for(const id of ["A","B"])await page.locator('[data-safe-wire="'+id+'"]').click();
   await page.locator('[data-safe-guess="lit"]').click();
   await page.locator('[data-safe-test]').click();
   assert.equal(await page.locator('[data-safe-next]').count(),1,"Correct safe diagram and matching prediction unlocks rescue");
   assert.equal(await page.locator('.safety-wire[data-line="C"]').getAttribute("opacity"),".20","Removed conductor must be visibly dimmed");
   await page.locator('[data-safe-next]').click();
   assert.match(await page.locator(".safety-heading").textContent(),/2 \/ 3/);
   await page.reload({waitUntil:"domcontentloaded"});
   assert.match(await page.locator(".safety-heading").textContent(),/2 \/ 3/,"iPhone-style reload resumes next inspection");
   await page.locator('[data-safe-wire="C"]').click();
   await page.locator('[data-safe-guess="lit"]').click();
   await page.locator('[data-safe-test]').click();
   assert.equal(await page.locator('[data-safe-next]').count(),1,"Either branch of the shared shortcut can be removed");
   await page.locator('[data-safe-next]').click();
   assert.match(await page.locator(".safety-heading").textContent(),/3 \/ 3/);
   await page.locator('[data-safe-wire="A"]').click();
   await page.locator('[data-safe-guess="lit"]').click();
   await page.locator('[data-safe-test]').click();
   assert.equal(await page.locator(".safety-reasons").count(),0,"A second dangerous route must remain active");
   await page.locator('[data-safe-wire="E"]').click();
   assert.equal(await page.locator(".safety-result").count(),0,"Editing wires invalidates previous measurement");
   await page.locator('[data-safe-guess="lit"]').click();
   await page.locator('[data-safe-test]').click();
   assert.equal(await page.locator(".safety-reasons").count(),1,"Two minimal disconnections leave a working lamp loop");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-safety-inspection-solved.png",fullPage:true});
   await page.locator('[data-safe-reason="shortcut"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Wrong causal explanation cannot pass the final safety check");
   await page.locator('[data-safe-reason="lamp-path"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator(".transfer-puzzle").count(),1,"Safe explanation unlocks existing scientific transfer");
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
   await page.locator('[data-builder-cause="short"]').click();
   assert.equal(await page.locator('.builder-diagnostic-flow.danger').count(),1,"Correct short cause reveals only actual hazardous path");
   await tapPair("P","N");
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),0,"Edited circuit cannot reuse earlier cause");
   for(const [a,b] of [["P","L"],["R","N"]])await tapPair(a,b);
   await page.locator('[data-builder-test]').click();
   assert.equal(await page.locator('[data-builder-cause="bypass"]').count(),1,"OFF-on bypass condition must open investigation");
   await page.locator('[data-builder-cause="open"]').click();
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),0,"Incorrect bypass cause does not reveal route");
   await page.locator('[data-builder-cause="bypass"]').click();
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),1,"Correct OFF-bypass diagnosis rewarded");
   assert.ok(await page.locator(".builder-diagnostic-flow").count()>0,"Unexpected lit loop shown after science reasoning");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-lighthouse-bypass-diagnosed.png",fullPage:true});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),1,"Lighthouse diagnosis persists across Safari reload");
   for(const [a,b] of [["P","L"],["R","N"]])await tapPair(a,b);
   assert.equal(await page.locator(".builder-diagnosis.solved").count(),0);
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
