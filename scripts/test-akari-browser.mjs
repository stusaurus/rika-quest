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
     const wrongReason=id===5?"look":id===7?"one":id===12?"off":id===14?"battery":"plus";
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
   await page.locator("#missionGoal ruby.akari-yomi").first().waitFor();
   assert.equal(await page.locator("#missionGoal").textContent(),"小屋のあかりをつけよう","Readings must never corrupt the underlying answer or sentence");
   assert.equal(await page.locator("#missionGoal ruby.akari-yomi").first().getAttribute("aria-label"),"小屋（こや）","The difficult kanji must expose its reading in accessibility");
   assert.match(await page.locator("#missionGoal ruby.akari-yomi rt").first().evaluate(el=>getComputedStyle(el,"::before").content),/こや/,"Ruby reading should actually be visible in the mobile browser");
   assert.ok(await page.locator("#missionList ruby.akari-yomi").count()>5,"Mission map must also show readings in dynamically rendered titles");
   assert.equal(await page.locator("#missionGoal ruby[data-yomi-kind='essential']").count(),1,"Core science and mission terms keep their readings in the compact mode");
   const extraYomi=page.locator("#missionList ruby[data-yomi-kind='extra'] rt").first();
   assert.ok(await extraYomi.count()>0,"Optional everyday readings remain available");
   assert.equal(await extraYomi.evaluate(el=>getComputedStyle(el).display),"none","Extra ruby should not crowd the default screen");
   assert.equal(await page.locator(".pacing-tip").first().evaluate(el=>getComputedStyle(el).display),"none","Avoid duplicating the live task text with the progress card");
   assert.equal(await page.locator(".reading-task-row").evaluate(el=>el.scrollWidth <= el.clientWidth+2),true,"Task and audio control must fit the phone width");
   assert.equal(await page.locator(".quest-head").evaluate(el=>el.scrollWidth <= el.clientWidth+2),true,"Mission title, stars and reading mode must not overflow on 320px phones");
   assert.equal(await page.locator("#readTaskBtn").evaluate(el=>el.hidden),!(await page.evaluate(()=>typeof window.speechSynthesis?.speak==="function"&&typeof window.SpeechSynthesisUtterance==="function")),"Audio button must match native speech capability");

   assert.match(await page.locator("#missionStory").textContent(),/小屋が まっくら/,"Default copy must fit third grade");
   assert.ok((await page.locator("#missionInstructions").textContent()).length<=40,"Only one short action is visible by default");
   assert.equal(await page.locator("body.reading-easy").count(),1,"Short child-friendly mode should be enabled by default");
   assert.equal(await page.locator("#readingToggle").textContent(),"📖 くわしく");
   await page.locator("#readingToggle").click();
   assert.match(await page.locator("#missionStory").textContent(),/村の小屋がまっくら/,"Teacher view restores nuanced original story");
   assert.match(await page.locator("#missionInstructions").textContent(),/乾電池の＋と−/,"Detailed instructions remain accessible");
   assert.equal(await page.locator("body.reading-full").count(),1);
   assert.equal(await page.locator("#missionGoal ruby.akari-yomi rt").first().evaluate(el=>getComputedStyle(el).display),"none","Teacher mode should hide redundant visual kana without deleting original text");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("body.reading-full").count(),1,"Reading mode must survive a reload");
   await page.locator("#readingToggle").click();
   assert.equal(await page.locator("body.reading-easy").count(),1);
   assert.notEqual(await page.locator("#missionGoal ruby.akari-yomi rt").first().evaluate(el=>getComputedStyle(el).display),"none","Switching back to child mode should restore ruby automatically");
   assert.ok((await page.locator("#missionInstructions").textContent()).length<=40);
   await page.locator("#helpBtn").click();
   assert.equal(await page.locator("#helpModal .kid-help-steps li").count(),4,"Game instructions should start with just four easy steps");
   assert.equal(await page.locator("#helpModal .help-more").getAttribute("open"),null,"Advanced how-to content starts folded");
   assert.equal(await page.locator("#yomiEssentials").getAttribute("aria-pressed"),"true","Only core readings show by default");
   await page.locator("#yomiAll").click();
   assert.equal(await page.locator("body.furigana-all").count(),1,"All reading mode is activated without changing the science game");
   assert.notEqual(await extraYomi.evaluate(el=>getComputedStyle(el).display),"none","Previously omitted story readings appear on demand");
   await page.locator("#closeHelpBtn").click();
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("body.furigana-all").count(),1,"Extra furigana choice should be remembered");
   await page.locator("#helpBtn").click();
   await page.locator("#yomiEssentials").click();
   assert.equal(await page.locator("body.furigana-all").count(),0,"Compact setting can be restored");
   await page.locator("#closeHelpBtn").click();
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-easy-reading-start.png",fullPage:true});
   assert.equal(await page.locator("#missionInstructions").textContent(),"電池と まめ電球を 線で つなごう。","Ruby must not disturb the current simple instruction");
   assert.equal(await page.locator(".pacing-count").count(),1,"A short experiment counter still provides progress");
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
   assert.equal(await page.locator("#sceneCharacter").count(),0,"No clipped dinosaur competes with the science illustration");
   assert.equal(await page.locator("#characterArt").count(),0,"Sprite frame should not consume space in regular play");
   assert.equal(await page.locator("#sceneProps svg").count(),1,"Stage-specific buildings remain visible after removing the dinosaur");
   assert.equal(await page.locator("body.gesture-first").count(),1,"Gesture-first mode should be enabled");
   assert.equal(await page.locator(".wire-palette").count(),0,"Decorative wire-color choices must not burden beginners");
   assert.equal(await page.locator("#predictStep").isVisible(),true,"Show one clear prediction choice at the start");
   assert.equal(await page.locator("#designPredictionChoices .prediction-option").count(),3,"Offer lit, unlit, and unsure without filling the screen with text");
   assert.equal(await page.locator('[data-prediction="unsure"]').count(),1,"Unsure is a valid scientific prediction before trying");
   assert.equal(await page.locator("#connectStep").isVisible(),false,"Avoid three simultaneous instruction cards");
   assert.equal(await page.locator("#thinkStep").isVisible(),false,"Reasoning step appears after the experiment");
   await page.locator('[data-prediction="lit"]').click();
   assert.equal(await page.locator("#predictStep").isVisible(),false,"Prediction panel should collapse after selection");
   assert.equal(await page.locator("#connectStep").isVisible(),true,"Only the next physical action should remain visible");
   assert.equal(await page.locator("#checkBtn").textContent(),"⚡ ためす","Early stage should use a short action label");
   assert.equal(await page.locator(".circuit-svg-v2").count(),1,"Updated detailed physical battery-and-bulb art must render");
   assert.equal(await page.locator(".circuit-svg-v2 .battery-model").count(),1);
   assert.equal(await page.locator(".circuit-svg-v2 .bulb-model").count(),1);
   const contactGeometry=await page.evaluate(()=>{
     const box=document.querySelector(".circuit-inner").getBoundingClientRect();
     const pts={P:[42,151],N:[178,151],L:[268,152],R:[313,210]};
     return Object.entries(pts).map(([id,[x,y]])=>{
       const button=document.querySelector('[data-t="'+id+'"]').getBoundingClientRect();
       const cx=button.left+button.width/2,cy=button.top+button.height/2;
       return {id,dx:Math.abs(cx-(box.left+x*box.width/400)),dy:Math.abs(cy-(box.top+y*box.height/250))};
     });
   });
   for(const p of contactGeometry)assert.ok(p.dx<3&&p.dy<3,"Touch target must sit on its electrical contact: "+JSON.stringify(p));

   // A child may trace one wire directly with a finger instead of memorizing a two-tap rule.
   await page.locator('[data-t="P"]').scrollIntoViewIfNeeded();
   const dragStart=await page.locator('[data-t="P"]').boundingBox();
   const dragEnd=await page.locator('[data-t="L"]').boundingBox();
   assert.ok(dragStart&&dragEnd,"Physical endpoints must be visible for drag wiring");
   await page.mouse.move(dragStart.x+dragStart.width/2,dragStart.y+dragStart.height/2);
   await page.mouse.down();
   await page.mouse.move(dragEnd.x+dragEnd.width/2,dragEnd.y+dragEnd.height/2,{steps:8});
   await page.mouse.up();
   assert.equal(await page.locator(".wire-chip").count(),1,"Dragging between contact circles must build exactly one wire");
   assert.equal(await page.locator(".terminal.selected").count(),0,"A completed drag should not leave a dangling tap selection");
   await page.locator('[data-unwire="0"]').click();

   assert.ok((await page.locator(".reading-task-row").evaluate(e=>e.getBoundingClientRect().width))>160,
     "Current task must receive readable width without a character overlay");

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
   assert.match(await page.locator("#feedbackText").textContent(),/ショート/,"The danger is explained without mascot reactions");
   assert.equal(await page.locator("#stageCelebration").isVisible(),false,"Short is never celebrated");
   assert.match(await page.locator("#spark").evaluate(e=>getComputedStyle(e,"::before").content),/⚡/,"Short hazard remains clearly signaled without mascot effects");
   assert.equal(await page.locator("#restorationTrail").isVisible(),false,"Short must not light the town");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-danger.png",fullPage:true});

   await page.locator('[data-unwire="0"]').click();
   await page.locator('[data-t="P"]').click();await page.locator('[data-t="L"]').click();
   await page.locator('[data-t="N"]').click();await page.locator('[data-t="R"]').click();
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Stage 1 completion must show discovery");
   assert.equal(await page.locator("#sceneCharacter").count(),0,"Celebration must use restored lights rather than a cropped character");
   assert.equal(await page.locator("#stageCelebration").isVisible(),true,"A nonblocking victory burst should show");
   assert.equal(await page.locator("#litPlaceCount").textContent(),"1","The map restoration counter should advance");
   assert.equal(await page.locator("#mapLights .map-lamp.lit").count(),1,"First clear should illuminate one journey map lantern");
   assert.equal(await page.locator(".story-scene.energizing").count(),1,"First successful experiment should trigger the town restoration pulse");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-clear.png",fullPage:true});

   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.mission===1)),"Completed discovery must be saved");
   await page.locator("#thinkStep").waitFor({state:"visible"});
   assert.equal(await page.locator(".reason-option").count(),3,"One visual reason question has three plausible choices");
   assert.equal(await page.locator("#nextBtn").isDisabled(),true,"Science reasoning, not just a lit bulb, is needed to advance");
   await page.locator('[data-first-reason="cut"]').click();
   assert.match(await page.locator("#designComparisonNote").textContent(),/もういちど/,"Wrong explanation redirects attention to the actual circuit");
   assert.equal(await page.locator("#nextBtn").isDisabled(),true,"Incorrect causal reasoning must not unlock next mission");
   await page.locator('[data-first-reason="loop"]').click();
   assert.equal(await page.locator("#nextBtn").isDisabled(),false,"Correct explanation unlocks the next mission");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-first-reasons-v1"))["1"]),"loop","First explanation persists as a learning choice");
   await page.locator("#nextBtn").click();

   assert.equal(await page.locator("#missionTitle").textContent(),"切れた通り道");
   assert.equal(await page.locator(".scene-character").count(),0,"No sprite may return when travelling to the next stage");
   assert.equal(await page.locator("#stageCelebration").isVisible(),false,"Victory badge must not leak to next stage");
   assert.equal(await page.locator("#restorationTrail").isVisible(),false,"Restoration pulse must not leak to next mission");

   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"切れた通り道","Progress must be restored after reload");
   await page.evaluate(()=>{const k="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(k));s.active=1;localStorage.setItem(k,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".story-scene.restored").count(),1,"Previously restored town must remain illuminated after return and reload");
   assert.equal(await page.locator(".circuit-board.is-lit").count(),0,"Saved town lights must not fake a closed experiment circuit");
   assert.match(await page.locator("#missionStory").textContent(),/もう一度 ためしてみよう/,"Revisited stage should offer a short child-readable replay invitation");
   assert.equal(await page.locator("#mapLights .map-lamp.lit").count(),1,"Revisiting should retain the first map light");
   await page.evaluate(()=>{const k="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(k));s.active=2;localStorage.setItem(k,JSON.stringify(s))});
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator('[data-t="N"]').click();await page.locator('[data-t="R"]').click();await page.locator("#checkBtn").click();
   await completeTransfer(2,true);
   await page.locator("#thinkStep").waitFor({state:"visible"});
   assert.equal(await page.locator("#nextBtn").isDisabled(),true,"The repaired streetlight still needs a short cause choice");
   await page.locator('[data-first-reason="joined"]').click();
   assert.equal(await page.locator("#nextBtn").isDisabled(),false,"Correct repair explanation makes next stage available");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-first-reasons-v1"))["2"]),"joined","Reason for stage two should persist");
   assert.equal(await page.locator("#masteryCount").textContent(),"1","First successful transfer earns a reasoning token");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".story-scene.restored").count(),1,"A solved transfer case stays saved after reload");
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.key==="transfer:2")),"Scientific transfer discovery must persist");
   // Mission 9: match battery chemistry & nominal voltage; distinguish initial brightness and modelled endurance.
   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.completed={};for(let i=1;i<=8;i++)s.completed[i]=3;
     s.active=9;s.batteryDrafts={};localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"乾電池の大きさ");
   assert.equal(await page.locator(".battery-lab-svg").count(),1,"Battery lab should show a controlled virtual circuit diagram");
   assert.equal(await page.locator(".battery-record").count(),4,"Four crossed size/time observations");
   await page.locator(".battery-caution ruby.akari-yomi").first().waitFor();
   assert.ok(await page.locator(".battery-caution ruby.akari-yomi").count()>=2,"Scientific safety warnings must also have kana readings when needed");

   assert.equal(await page.locator(".battery-notebook").evaluate(el=>el.tagName),"DETAILS","Four-row notebook is folded until the learner asks");
   assert.equal(await page.locator(".battery-notebook").getAttribute("open"),null);
   assert.equal(await page.locator("#scienceCompass .pacing-segment").count(),3,"Guide shows three learning phases");
   assert.match(await page.locator(".pacing-chapter").textContent(),/第4幕/,"Stage9 should identify the battery story chapter");
   assert.equal(await page.locator(".pacing-guide").getAttribute("data-guide-phase"),"1","A new investigation begins at the evidence phase");
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"No correct conclusion without experimental evidence");
   assert.equal(await page.locator('[data-battery-test]').isDisabled(),true,"The test button requires a prediction");
   assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem("rika-akari-quest-v2")).batteryDrafts?.[9]?.trials||{}).length),0,"Battery experiment requires scientific prediction");
   await page.locator('[data-battery-guess="dim"]').click();await page.locator('[data-battery-test]').click();
   assert.match(await page.locator(".battery-predict-card .battery-result").textContent(),/予想.*弱い光.*実際.*点灯/s,"Prediction and actual are compared without penalty");
   assert.equal(await page.locator('[data-battery-next]').count(),1,"A completed trial gives an optional next-condition shortcut");
   await page.locator('[data-battery-next]').click();
   assert.equal(await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem("rika-akari-quest-v2")).batteryDrafts[9];return s.size+":"+s.phase}),"large:early","A one-tap shortcut advances to a new experiment");
   assert.equal(await page.locator('[data-battery-test]').isDisabled(),true,"The shortcut never skips the next scientific prediction");
   const batteryField=async(key,val)=>page.locator('[data-battery-field="'+key+'"][data-battery-value="'+val+'"]').click();
   await batteryField("size","large");
   await page.locator('[data-battery-guess="bright"]').click();await page.locator('[data-battery-test]').click();
   await batteryField("phase","late");
   await page.locator('[data-battery-guess="dim"]').click();await page.locator('[data-battery-test]').click();
   await batteryField("size","small");
   await page.locator('[data-battery-guess="bright"]').click();await page.locator('[data-battery-test]').click();
   assert.equal(await page.locator(".battery-record.tested").count(),4,"Every size/duration combination recorded");
   assert.equal(await page.locator(".pacing-guide").getAttribute("data-guide-phase"),"2","Four observations advance the guide to application");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-battery9-controlled-comparison.png",fullPage:true});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".battery-record.tested").count(),4,"Saved long-watch observations survive iPhone reload");
   await page.locator('[data-battery-service="small"]').click();
   await page.locator('[data-battery-service-guess="dim"]').click();await page.locator('[data-battery-service-test]').click();
   await page.locator('[data-battery-reason="voltage"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"A poor field choice cannot earn rescue credit");
   await page.locator('[data-battery-service="large"]').click();
   await page.locator('[data-battery-service-guess="bright"]').click();await page.locator('[data-battery-service-test]').click();
   await page.locator('[data-battery-reason="size"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"False bigger-means-more-voltage claim must fail");
   await page.locator('[data-battery-reason="voltage"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Size, endurance and nominal voltage evidence completes rescue");
   assert.equal(await page.locator("#nextBtn").isVisible(),true,"The next adventure is visibly available after success");
   await page.locator("#nextBtn").click(); // Real pointer interaction: child-friendly button must stay stable.

   // Mission 10: varied series-cell voltage AND bulb voltage rating; never encourage overvolting real bulbs.
   assert.equal(await page.locator("#missionTitle").textContent(),"ふたつの力");
   assert.equal(await page.locator(".battery-record").count(),4);
   for(const [cells,rating,guess] of [["one","1.5","bright"],["one","3","dim"],["two","3","bright"],["two","1.5","risk"]]){
     await batteryField("cells",cells);await batteryField("rating",rating);
     await page.locator('[data-battery-guess="'+guess+'"]').click();await page.locator('[data-battery-test]').click();
   }
   assert.equal(await page.locator(".battery-record.tested").count(),4);
   assert.match(await page.locator(".battery-notebook").textContent(),/定格超過の危険/,"Overrating a bulb is presented as risk, not a real experiment");
   await page.locator('[data-battery-service="two:1.5"]').click();
   await page.locator('[data-battery-service-guess="risk"]').click();await page.locator('[data-battery-service-test]').click();
   await page.locator('[data-battery-reason="series"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Overrated setup cannot be approved");
   await page.locator('[data-battery-service="two:3"]').click();
   await page.locator('[data-battery-service-guess="bright"]').click();await page.locator('[data-battery-service-test]').click();
   await page.locator('[data-battery-reason="always"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"More batteries always safe is a misconception");
   await page.locator('[data-battery-reason="series"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true);
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-battery10-rated-device.png",fullPage:true});
   await page.locator("#nextBtn").click();

   // Mission 11: distinguish reversing one cell from opposing two matched cells.
   assert.equal(await page.locator("#missionTitle").textContent(),"電池の向きのひみつ");
   for(const [cells,dir,guess] of [["one","forward","bright"],["one","reverse","dark"],["two","aligned","bright"],["two","opposed","dark"]]){
     await batteryField("cells",cells);
     await batteryField("direction",dir);
     await page.locator('[data-battery-guess="'+guess+'"]').click();await page.locator('[data-battery-test]').click();
   }
   assert.equal(await page.locator(".battery-record.tested").count(),4);
   assert.match(await page.locator(".battery-notebook").textContent(),/乾電池1個・逆向き.*実験.*点灯/s,"Reversing just one battery cannot falsely be explained as cancelling voltage");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-battery11-polarity-observations.png",fullPage:true});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".battery-record.tested").count(),4,"Four polarity results persist after reload");
   await page.locator('[data-battery-service="two:opposed"]').click();
   await page.locator('[data-battery-service-guess="dark"]').click();await page.locator('[data-battery-service-test]').click();
   await page.locator('[data-battery-reason="cancel"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"The cancelled pair cannot relight museum display");
   await page.locator('[data-battery-service="two:aligned"]').click();
   await page.locator('[data-battery-service-guess="bright"]').click();await page.locator('[data-battery-service-test]').click();
   await page.locator('[data-battery-reason="bulb"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Polarity-sensitive lamp misconception must be rejected");
   await page.locator('[data-battery-reason="cancel"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Correct four-trial evidence and scientific reason relights exhibit");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).batteryDrafts?.[11]),undefined,"Successful polarity study removes temporary state");
   dimensions=await overflow();assert.ok(dimensions.scroll<=dimensions.width+2,engine+" "+width+" battery expedition overflow");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-battery11-restored.png",fullPage:true});

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
   assert.equal(await page.locator("[data-garden-material-reason]").count(),3,"Comparative evidence unlocks a scientific conclusion");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-garden4-controlled-research.png",fullPage:true});
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("[data-garden-material-reason]").count(),3,"Experimental evidence should survive a mobile reload");
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
   await page.locator('[data-garden-view="right"]').click();
   const pan=await page.locator(".garden-schematic").evaluate(e=>e.scrollLeft);
   if(width<740)assert.ok(pan>15,"On iPhone width, visible controls should pan to the bulb and safety partitions");
   await page.locator('[data-garden-sample="wood"]').click();await page.locator('[data-garden-slot="link"]').click();
   if(width<740)assert.ok(await page.locator(".garden-schematic").evaluate(e=>e.scrollLeft)>15,"Editing a sample should preserve the circuit pan position");
   await page.locator('[data-garden-sample="clip"]').click();await page.locator('[data-garden-slot="guardA"]').click();
   await page.locator('[data-garden-sample="plastic"]').click();await page.locator('[data-garden-slot="guardB"]').click();
   await page.locator('[data-garden-design-guess="lit"]').click();await page.locator('[data-garden-design-test]').click();
   assert.equal(await page.locator(".garden-measured.danger").count(),1,"A metal partition creates a dangerous virtual shortcut, even if lamp path is broken");
   assert.equal(await page.locator(".story-scene.garden-powered").count(),0,"A virtual short cannot illuminate the garden scene");
   assert.equal(await page.locator(".garden-explain").count(),0,"Hazard cannot unlock scientific explanation");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-garden5-virtual-short.png",fullPage:true});
   await page.locator('[data-garden-sample="clip"]').click();await page.locator('[data-garden-slot="link"]').click();
   await page.locator('[data-garden-sample="wood"]').click();await page.locator('[data-garden-slot="guardA"]').click();
   assert.equal(await page.locator(".garden-measured.danger").count(),0,"Replacing material invalidates the old dangerous circuit measurement");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).gardenDrafts[5].measurement),null,"Previous electrical evidence cannot be reused after rewiring");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator('[data-garden-slot="link"] span').textContent(),"鉄のクリップ","Wired conductor must persist through reload");
   assert.equal(await page.locator('[data-garden-slot="guardA"] span').textContent(),"乾いた木片","Insulation remains in place after reload");
   await page.locator('[data-garden-design-guess="dark"]').click();await page.locator('[data-garden-design-test]').click();
   assert.match(await page.locator(".garden-measured").last().textContent(),/実際.*点灯/,"Actual lamp result overrules incorrect hypothesis");
   assert.equal(await page.locator(".story-scene.garden-powered").count(),1,"Measured safe garden circuit glows in the game world");
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

   // Mission 13: diagnose two independent opens without revealing a ready-made answer.
   await page.evaluate(()=>{
     const key="rika-akari-quest-v2",s=JSON.parse(localStorage.getItem(key));
     s.completed={};for(let i=1;i<=12;i++)s.completed[i]=3;
     s.active=13;s.doubleFaultDraft=null;localStorage.setItem(key,JSON.stringify(s));
   });
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator("#missionTitle").textContent(),"灯台の二重故障");
   assert.equal(await page.locator(".dual-parts [data-dual-part]").count(),4,"Four parts must be separately tested without giving away faults");
   assert.equal(await page.locator(".dual-repairs").count(),0,"Repairs cannot be revealed before the investigation");
   await page.locator('[data-dual-part="battery"]').click();
   assert.equal(await page.locator('[data-dual-test]').isDisabled(),true,"Safe isolated battery test requires prediction");
   await page.locator('[data-dual-predict="open"]').click();await page.locator('[data-dual-test]').click();
   assert.match(await page.locator(".dual-testbench .dual-result").textContent(),/予想.*0V.*実際.*1.5V/s,"Incorrect hypothesis is recorded, never scored as failure");
   for(const [part,guess] of [["wire","good"],["filament","good"],["contact","open"]]){
     await page.locator('[data-dual-part="'+part+'"]').click();
     await page.locator('[data-dual-predict="'+guess+'"]').click();
     await page.locator('[data-dual-test]').click();
   }
   assert.equal(await page.locator(".dual-notes .dual-note").count(),4,"Evidence for all separate components enters notebook");
   assert.equal(await page.locator(".dual-diagram").count(),1,"Circuit repair topology appears after evidence");
   await page.locator('[data-dual-view="right"]').click();
   if(width<740)assert.ok(await page.locator(".dual-diagram").evaluate(el=>el.scrollLeft)>10,"Mobile lighthouse circuit can be navigated to bulb contact");

   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-double-fault-evidence.png",fullPage:true});
   await page.locator('[data-dual-fix="battery"]').click();
   assert.equal(await page.locator(".dual-repairs button.fixed").count(),0,"A healthy battery must not be treated as a fault");
   await page.locator('[data-dual-fix="wire"]').click();
   assert.equal(await page.locator(".dual-repairs button.fixed").count(),1);
   if(width<740)assert.ok(await page.locator(".dual-diagram").evaluate(el=>el.scrollLeft)>10,"Circuit pan is preserved when first wire is repaired");
   assert.equal(await page.locator('[data-dual-fix="contact"]').isDisabled(),true,"Must run a second measurement after fixing only one defect");
   await page.locator('[data-dual-circuit-guess="lit"]').click();
   await page.locator('[data-dual-circuit-test]').click();
   assert.equal(await page.locator(".dual-result.dark").count(),1,"The lamp stays dark while a second independent fault remains");
   assert.equal(await page.locator(".story-scene.double-powered").count(),0,"One repair must not illuminate the lighthouse");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-double-fault-first-repair-dark.png",fullPage:true});
   await page.locator('[data-dual-insight="weak"]').click();
   assert.equal(await page.locator('[data-dual-fix="contact"]').isDisabled(),true,"Wrong first-dark explanation must not unlock the second repair");
   await page.locator('[data-dual-insight="other-gap"]').click();
   assert.equal(await page.locator('[data-dual-fix="contact"]').isDisabled(),false,"Understanding a second open circuit unlocks remaining repair");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".dual-repairs button.fixed").count(),1,"Interrupted repair is preserved on iPhone reload");
   assert.equal(await page.locator('[data-dual-fix="contact"]').isDisabled(),false,"Measured dark evidence and explanation persist");
   await page.locator('[data-dual-fix="contact"]').click();
   assert.equal(await page.locator(".dual-result.dark").count(),0,"Any new wiring changes invalidate the old measurement");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).doubleFaultDraft.last),null,"Previous powered observations must not be reused after repair");
   await page.locator('[data-dual-circuit-guess="dark"]').click();await page.locator('[data-dual-circuit-test]').click();
   assert.equal(await page.locator(".dual-result.lit").count(),1,"Both physical gaps repaired causes a powered circuit");
   assert.equal(await page.locator(".story-scene.double-powered").count(),0,"Wrong final prediction cannot yet certify the lighthouse");
   await page.locator('[data-dual-circuit-guess="lit"]').click();await page.locator('[data-dual-circuit-test]').click();
   assert.equal(await page.locator(".dual-result.lit").count(),1);
   await page.locator('[data-dual-reason="one"]').click();await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Two physical repairs without correct causal reasoning cannot clear");
   await page.locator('[data-dual-reason="loop"]').click();
   assert.equal(await page.locator(".story-scene.double-powered").count(),1,"A verified powered loop lights the simulated scene");
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),true,"Four tests, two repairs, a dark retest, a lit retest and reasoning clear the stage");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).doubleFaultDraft),null,"Final clear removes only temporary diagnosis data");
   assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).notes.some(n=>n.key==="double:circuit:wire")),"The first unsuccessful repair is saved in the adventure journal");
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-double-fault-restored.png",fullPage:true});

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
   assert.equal(await page.locator(".finale-stations button").count(),3,"Finale must contain three separate science investigations");
   assert.equal(await page.locator(".finale-circuit").count(),0,"Final assembled circuit should require experimental evidence");
   assert.equal(await page.locator(".finale-log-item").count(),3,"Independent evidence log for battery, material and contacts");
   assert.equal(await page.locator(".finale-log").evaluate(el=>el.tagName),"DETAILS","Six experiment notes stay optional");
   assert.equal(await page.locator('[data-finale-test]').isDisabled(),true,"Prediction required before testing");
   const experimentFinale=async(station,value,guess)=>{
     await page.locator('[data-finale-station="'+station+'"]').click();
     await page.locator('[data-finale-option="'+value+'"]').click();
     await page.locator('[data-finale-guess="'+guess+'"]').click();
     await page.locator('[data-finale-test]').click();
     const result=await page.evaluate(([station,value])=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).finaleDraft.tests[station][value],[station,value]);
     return result.actual;
   };
   assert.equal(await experimentFinale("battery","opposed","bright"),"dark","Opposing matched sources cancel voltage in virtual circuit");
   assert.equal(await page.locator('[data-finale-next]').count(),1,"An optional shortcut finds the next untested final experiment");
   await page.locator('[data-finale-next]').click();
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).finaleDraft.selected.battery),"aligned","Finale shortcut selects next missing test");
   assert.equal(await page.locator('[data-finale-test]').isDisabled(),true,"Finale shortcut never performs or guesses the science");
   assert.equal(await experimentFinale("battery","aligned","bright"),"bright","Aligned two-source chain gives designed operating voltage");
   await page.locator('[data-finale-install]').click();
   assert.equal(await experimentFinale("material","plastic","bright"),"dark","Metallic-looking plastic remains insulating");
   await page.locator('[data-finale-install]').click();
   assert.equal(await experimentFinale("material","clip","dark"),"bright","An iron clip is conductive even after a wrong hypothesis");
   assert.equal(await experimentFinale("contact","glass","bright"),"dark","Glass and bulb bottom alone leave the circuit open");
   assert.equal(await experimentFinale("contact","both","bright"),"bright","Lamp side and bottom contacts complete load connection");
   await page.locator('[data-finale-install]').click();
   assert.equal(await page.locator(".finale-circuit").count(),1,"Six contrasting measurements should unlock integrated circuit diagram");
   assert.equal(await page.locator(".pacing-guide").getAttribute("data-guide-phase"),"2","Final objective switches to assembly only when six tests are complete");
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-finale-investigation-evidence.png",fullPage:true});
   await page.locator('[data-finale-view="right"]').click();
   if(width<740)assert.ok(await page.locator(".finale-circuit").evaluate(el=>el.scrollLeft)>10,"Touch control must show right-hand bulb contact");
   await page.reload({waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".finale-circuit").count(),1,"Reload resumes complete six-experiment laboratory");
   assert.match(await page.locator(".finale-log").textContent(),/鉄のクリップ.*点灯/s,"Evidence remains after reload");
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).finaleDraft.installed.material),"plastic","Incorrect installed specimen must remain in saved state");
   await page.locator('[data-finale-overall-guess="bright"]').click();
   await page.locator('[data-finale-overall-test]').click();
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).finaleDraft.overall.kind),"dark","Plastic in circuit must prevent illumination even after five correct observations");
   assert.equal(await page.locator(".story-scene.finale-powered").count(),0,"The lighthouse remains dark when an insulating gap exists");
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"An incomplete circuit cannot bypass final application");
   await page.locator('[data-finale-station="material"]').click();
   await page.locator('[data-finale-option="clip"]').click();
   await page.locator('[data-finale-install]').click();
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).finaleDraft.overall),null,"Edited installation invalidates earlier circuit measurement");
   await page.locator('[data-finale-overall-guess="dark"]').click();
   await page.locator('[data-finale-overall-test]').click();
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("rika-akari-quest-v2")).finaleDraft.overall.kind),"bright","Completed current path lights even after wrong prediction");
   assert.equal(await page.locator(".story-scene.finale-powered").count(),1,"The lighthouse reacts to a measured complete circuit");
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator("#discovery").isVisible(),false,"Incorrect assembled-circuit hypothesis must not pass");
   await page.locator('[data-finale-overall-guess="bright"]').click();await page.locator('[data-finale-overall-test]').click();
   await page.locator('[data-finale-reason="glass"]').click();
   await page.locator("#checkBtn").click();assert.equal(await page.locator("#discovery").isVisible(),false,"An erroneous explanation must not pass even if lit");
   await page.locator('[data-finale-reason="loop"]').click();
   await page.screenshot({path:"artifacts/akari/"+engine+"-"+width+"-finale-lighthouse-powered.png",fullPage:true});
   await page.locator("#checkBtn").click();
   assert.equal(await page.locator(".transfer-puzzle").count(),1,"Six tests, working topology and explanation must open existing advanced transfer");
   await completeTransfer(14,true);
   assert.equal(await page.locator("#masteryCount").textContent(),"6","Both switch networks and all four prior transfer discoveries, including redesigned mission5, must be recorded");

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
   assert.equal(await page.locator("#scienceReport").isVisible(),true,"Finishing the final experiment must unlock campaign recap");
   assert.equal(await page.locator("#scienceReport .campaign-chapter").count(),5,"The conclusion contains five earned learning discoveries");
   assert.match(await page.locator("#scienceReport").textContent(),/14のあかりが戻った/,"The ending celebrates all restored locations");
   assert.equal(await page.locator(".pacing-guide").getAttribute("data-guide-phase"),"3","Completed adventure remains in the reflection phase");

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
