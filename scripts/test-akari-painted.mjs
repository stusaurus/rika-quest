import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join,normalize,extname} from "node:path";
import {pathToFileURL} from "node:url";
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
const results=[],motionResults=[];
function visibleCutStroke(path){
 const length=path.getTotalLength(),matrix=path.getScreenCTM();
 const board=path.closest('.circuit-board');
 const screen=at=>{const p=path.getPointAtLength(at);return new DOMPoint(p.x,p.y).matrixTransform(matrix);};
 const clear=p=>p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight&&
  !!document.elementFromPoint(p.x,p.y)?.closest('.circuit-board')&&
  !document.elementFromPoint(p.x,p.y)?.closest('button,a,input,select,summary,[role="button"]');
 for(const fraction of [.5,.4,.6]){
  const at=length*fraction,p=screen(at),a=screen(Math.max(0,at-3)),b=screen(Math.min(length,at+3));
  const dx=b.x-a.x,dy=b.y-a.y,mag=Math.hypot(dx,dy)||1,n={x:-dy/mag,y:dx/mag};
  for(const [from,to] of [[-12,36],[-8,36],[12,-36],[8,-36],[-26,26],[-42,42]]){
   const start={x:p.x+n.x*from,y:p.y+n.y*from},end={x:p.x+n.x*to,y:p.y+n.y*to};
   if(clear(start)&&clear(end))return{start,end};
  }
 }
 throw new Error('No visible wire-cut stroke avoids the actual control buttons: '+board.getBoundingClientRect().toJSON());
}
try{
 for(const [engine,width,height] of [["chromium",320,740],["chromium",390,844],["chromium",1440,1000],["webkit",320,740],["webkit",390,844],["webkit",1440,1000]]){
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
      pool:Number(getComputedStyle(board.querySelector(".painted-light-pool")).opacity),
      bulb:board.querySelector(".painted-bulb-image").getAttribute("href")};
    });
    assert.equal(actual.lit,lit,JSON.stringify(actual));assert.equal(actual.short,short,JSON.stringify(actual));
    assert.equal(actual.village,lit&&!short?1:0,"Village must follow actual circuit truth");
    assert.equal(actual.pool,lit&&!short?1:0,"Table illumination must follow actual circuit truth");
    assert.ok(actual.bulb.endsWith(lit&&!short?"bulb-lit.webp":"bulb-dark.webp"),"The actual sprite must follow circuit truth");
   };
   // Same PR34 view, same browser, same viewport, same unlit initial circuit.
   await page.goto(origin+"/games/akari/?visual=cinematic",{waitUntil:"networkidle"});
   await page.locator(".circuit-svg-v2").waitFor();await snapshot("before-pr34");
   assert.equal(await page.locator(".painted-world").count(),0);
   // Compare the new feedback to the already delivered PR35 raster build.
   await page.goto(origin+"/artifacts/akari-art-baseline/games/akari/?visual=painted",{waitUntil:"networkidle"});
   await page.waitForFunction(()=>document.body.dataset.paintedMission==="1");
   for(const t of ["P","L","R","N"])await tap(t);
   await snapshot("before-feedback-lit");
   await page.locator(".circuit-board").screenshot({path:prefix+"-before-feedback-board-lit.png",animations:"disabled"});
   await page.locator("#resetBtn").click();await connect("P","N");
   await page.locator(".short-event").waitFor({state:"visible"});
   await snapshot("before-feedback-short");
   await page.evaluate(()=>localStorage.clear());
   await page.goto(origin+"/games/akari/?visual=painted",{waitUntil:"networkidle"});
   await page.waitForFunction(()=>document.body.dataset.paintedMission==="1");
   await page.evaluate(async()=>{
    await Promise.all([...document.querySelectorAll('.painted-village img')].map(i=>i.decode()));
    await Promise.all([...document.querySelectorAll('.circuit-svg-v2 image')].map(el=>new Promise((resolve,reject)=>{
     const i=new Image();i.onload=resolve;i.onerror=reject;i.src=el.getAttribute('href');
    })));
   });
   await state(false);
   const finishHud=await page.evaluate(()=>{
     const q=document.querySelector(".quest-head"),tools=document.querySelector(".circuit-toolbar"),
       board=document.querySelector(".circuit-board"),points=[...document.querySelectorAll(".circuit-inner .terminal")],
       m=document.querySelector(".topbar");
     const summarize=el=>{const r=el.getBoundingClientRect(),st=getComputedStyle(el);return {top:r.top,bottom:r.bottom,height:r.height,bg:st.backgroundImage};};
     return {header:summarize(m),headerButtons:[...m.querySelectorAll('#soundBtn,#helpBtn,#mapToggle')].map(el=>{
       const r=el.getBoundingClientRect();return{id:el.id,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
     }),quest:summarize(q),tools:{...summarize(tools),
       parent:tools.parentElement?.id,rootMatches:tools.matches('html.akari-painted body[data-visual-theme="reference-rebuild"][data-painted-mission="1"] .main.town-immersive #workspace>.circuit-toolbar'),
       border:getComputedStyle(tools).borderTopColor,
       rule:[...document.styleSheets].flatMap(sheet=>{try{return [...sheet.cssRules].filter(rule=>rule.selectorText?.includes('mission1')&&rule.selectorText?.includes('circuit-toolbar')).slice(-2).map(rule=>rule.cssText.slice(0,350));}catch{return[]}}).slice(-3)
       },board:summarize(board),
       contacts:points.map(el=>{const r=el.getBoundingClientRect(),before=getComputedStyle(el,"::before"),
         after=getComputedStyle(el,"::after");return {id:el.dataset.t,aria:el.getAttribute("aria-label"),
           width:r.width,height:r.height,metal:before.backgroundImage,metalWidth:before.width,mark:after.content};})};
   });
   assert.ok(finishHud.header.height<=54,"Game chrome takes less space than the experiment: "+JSON.stringify(finishHud));
   assert.ok(finishHud.headerButtons.every(b=>b.width>=44&&b.height>=44&&b.top>=finishHud.header.top-2&&b.bottom<=finishHud.header.bottom+2),
     "All header controls stay in the header instead of wrapping over the mission: "+JSON.stringify(finishHud.headerButtons));
   assert.ok(finishHud.quest.height<=105,"Mission title remains compact even with real HUD texture: "+JSON.stringify(finishHud));
   assert.ok(finishHud.tools.bottom<=finishHud.board.top+8,
     "The live instruction belongs directly to the physical stage, not a detached webpage card");
   assert.ok(finishHud.tools.bg.includes("hud-panel.webp"),
     "The actual interactive toolbar reuses the painted HUD asset: "+JSON.stringify({...finishHud.tools,questBg:finishHud.quest.bg.slice(0,300),stage:await page.locator("body").getAttribute("data-painted-mission")}));
   assert.equal(finishHud.contacts.length,4);
   assert.ok(finishHud.contacts.every(c=>c.width>=44&&c.height>=44&&c.metal.includes("gradient")&&
     c.aria&&parseFloat(c.metalWidth)>=28&&c.mark!=="none"),
     "Four illustrated metal sockets retain their real tap areas and spoken identification: "+JSON.stringify(finishHud.contacts));
   assert.equal(await page.locator(".painted-village-revival").count(),1,
     "The actual village has one noninteractive restoration light");
   assert.equal(await page.locator(".painted-village-revival").evaluate(el=>getComputedStyle(el).opacity),"0",
     "The restoration glow is OFF before a closed circuit");
   assert.equal(await page.locator(".quest-panel").evaluate(el=>getComputedStyle(el).backgroundColor),
     "rgba(0, 0, 0, 0)",
     "The reasoning and journal should not sit on a pale website-colored sheet");
   assert.equal(await page.locator(".quest-panel").evaluate(el=>getComputedStyle(el).backgroundImage),"none",
     "The game stage, objectives and discoveries must share the same world background");
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
    const zoom=await page.evaluate(()=>{const board=document.querySelector('.circuit-board'),b=board.getBoundingClientRect(),p=document.querySelector('[data-t="R"]').getBoundingClientRect();return{left:b.left,right:b.right,x:p.x+p.width/2,art:board.querySelector('.painted-world').getBoundingClientRect().width,content:board.scrollWidth,toolbar:document.querySelector('.circuit-toolbar').getBoundingClientRect().height,questionWidth:document.querySelector('.circuit-question').getBoundingClientRect().width,overflow:document.documentElement.scrollWidth-innerWidth};});
    assert.ok(zoom.x>=zoom.left&&zoom.x<=zoom.right,"Enlarged bulb contact remains reachable");
    assert.ok(zoom.toolbar<145&&zoom.questionWidth>200,"Zoom instructions remain readable: "+JSON.stringify(zoom));
    assert.ok(zoom.art>=zoom.content-2,"Painted workbench covers the entire enlarged play area");
    assert.ok(zoom.overflow<=2,"Zooming must not turn the page into a horizontal scroller");
    await snapshot("painted-zoom");
    await page.locator("[data-zoom]").click();
   }
   // One wire is not a loop.
   await connect("P","L");await state(false);await snapshot("painted-one-wire");
   await connect("R","N");await state(true);
   assert.equal(await page.locator(".painted-village-revival").evaluate(el=>getComputedStyle(el).opacity),"1",
     "The village's new glow only appears after a genuine circuit");
   assert.equal(await page.locator(".painted-desk").evaluate(el=>getComputedStyle(el,"::after").opacity),"0.62",
     "Reflected light reaches the actual wooden desk, not an unrelated illustration");
   assert.ok((await page.locator("#thinkStep").evaluate(el=>getComputedStyle(el).backgroundImage)).includes("hud-panel.webp"),
     "The actual reasoning step uses the same crafted HUD material");
   await snapshot("painted-lit");
   assert.equal(await page.locator(".painted-wire-sheen").count(),2,"Each real cable has a material highlight");
   assert.equal(await page.locator(".wire.lit").first().evaluate(el=>getComputedStyle(el).stroke),"rgb(52, 139, 150)","Only the measured bulb is luminous; the insulated wire keeps its material");
   await page.locator(".circuit-board").screenshot({path:prefix+"-painted-board-lit.png",animations:"disabled"});
   // Cutting a real connected wire immediately extinguishes the scene.
   await page.locator("[data-unwire]").first().click();await state(false);await snapshot("painted-cut");
   assert.equal(await page.locator(".painted-village-revival").evaluate(el=>getComputedStyle(el).opacity),"0",
     "Cutting a necessary wire immediately extinguishes the village restoration glow");
   // A battery short never lights the bulb, even alongside a closed lamp loop.
   await reset();await connect("P","N");await state(false,true);
   await page.locator(".painted-short-frame").waitFor({state:"visible"});
   assert.equal(await page.locator(".painted-short-event .short-flames,.painted-short-event .short-smoke").count(),0,"The real warning uses painted artwork, not emoji placeholders");
   assert.equal(await page.locator(".painted-short-frame").evaluate(el=>getComputedStyle(el).animationName),"none","Reduced motion uses one clear static warning");
   await snapshot("painted-short");
   await page.locator("[data-unwire]").first().click();await state(false);
   assert.equal(await page.locator(".painted-short-event").count(),0,"Disconnecting immediately removes stale fire");
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
   for(const group of await page.locator('.lead-on-top').all()){
    assert.equal(await group.locator('.painted-wire-sheen').getAttribute('d'),await group.locator('.wire').getAttribute('d'),"Cable highlight follows the player's actual drawing");
   }
   await page.locator('.circuit-inner').scrollIntoViewIfNeeded();
   const cut=await page.locator('[data-visual-wire="LP"] .wire').evaluate(visibleCutStroke);
   await page.mouse.move(cut.start.x,cut.start.y);await page.mouse.down();await page.mouse.move(cut.end.x,cut.end.y,{steps:10});await page.mouse.up();
   await state(false);assert.equal(await page.locator('.wire-chip').count(),1,"Swiping the painted cable cuts only the crossed wire");
   await connect('P','L');await state(true);
   // The explanation stays with the experiment; wrong reasons cannot complete it.
   await page.locator('[data-first-reason="cut"]').click();
   assert.equal(await page.locator("#nextBtn").isVisible(),false);
   await snapshot("painted-reason");
   await page.locator('[data-first-reason="loop"]').click();
   await page.locator("#nextBtn").waitFor({state:"visible"});
   assert.ok((await page.locator("#discovery").evaluate(el=>getComputedStyle(el).backgroundImage)).includes("hud-panel.webp"),
     "The discovery reward uses the same painted game HUD instead of a separate worksheet card");
   const discovery=await page.locator("#discovery .discovery-more>summary").evaluate(el=>{
     const r=el.getBoundingClientRect(),c=getComputedStyle(el);
     return {height:r.height,color:c.color,bg:c.backgroundImage};
   });
   assert.ok(discovery.height>=44&&discovery.color==="rgb(255, 241, 206)"&&discovery.bg.includes("gradient"),
     "The optional discovery remains visibly readable and thumb-tappable: "+JSON.stringify(discovery));
   await page.locator("#discovery .discovery-more>summary").click();
   assert.equal(await page.locator("#discovery .discovery-more").evaluate(el=>el.open),true,
     "The in-world discovery remains an actual expandable, readable explanation");
   await page.locator("#discovery .discovery-more>summary").click();
   const clearPlakat=await page.evaluate(async()=>{
     scrollTo(0,0);
     await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
     const banner=document.getElementById("stageCelebration").getBoundingClientRect();
     const bulb=document.querySelector(".painted-bulb-image").getBoundingClientRect();
     const toolbar=document.querySelector(".circuit-toolbar").getBoundingClientRect();
     return {bannerTop:banner.top,bannerBottom:banner.bottom,toolbarBottom:toolbar.bottom,
       bulbTop:bulb.top,bannerPointerEvents:getComputedStyle(document.getElementById("stageCelebration")).pointerEvents};
   });
   assert.ok(clearPlakat.bannerTop>=clearPlakat.toolbarBottom-9&&
     clearPlakat.bannerBottom<clearPlakat.bulbTop&&clearPlakat.bannerPointerEvents==="none",
     "Compact in-world victory reward must leave the input toolbar and lit bulb visible: "+JSON.stringify(clearPlakat));
   await snapshot("painted-complete");
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
   await op.goto(pathToFileURL(join(root,"artifacts/akari-mission1-painted.html")).href,{waitUntil:"networkidle"});
   await op.waitForFunction(()=>document.body.dataset.paintedMission==="1");
   assert.ok((await op.locator(".painted-bulb-image").getAttribute("href")).startsWith("data:image/webp;base64,"));
   assert.ok((await op.locator(".circuit-toolbar").evaluate(el=>getComputedStyle(el).backgroundImage))
     .includes("data:image/webp;base64,"),
     "The locally downloaded playable game carries the SAME HUD texture, never a flat CSS fallback");
   for(const t of ["P","L","N","R"])await op.locator('[data-t="'+t+'"]').click();
   assert.equal(await op.locator(".circuit-board.is-lit").count(),1,"Offline deliverable uses the actual engine");
   await op.locator('.circuit-inner').scrollIntoViewIfNeeded();
   const fileCut=await op.locator('[data-visual-wire="LP"] .wire').evaluate(visibleCutStroke);
   await op.mouse.move(fileCut.start.x,fileCut.start.y);await op.mouse.down();await op.mouse.move(fileCut.end.x,fileCut.end.y,{steps:10});await op.mouse.up();
   assert.equal(await op.locator('.circuit-board.is-lit').count(),0,'Downloaded local HTML preserves swipe-to-cut, rather than offering a reduced interaction');
   assert.equal(await op.locator('.wire-chip').count(),1);
   await op.locator('#resetBtn').click();
   for(const t of ['P','N'])await op.locator('[data-t="'+t+'"]').click();
   await op.locator('.painted-short-frame').waitFor({state:'visible'});
   assert.ok((await op.locator('.painted-short-frame').evaluate(el=>getComputedStyle(el).backgroundImage)).includes('data:image/webp;base64,'));
   await offline.close();
   assert.deepEqual(errors,[]);assert.deepEqual(failedResources,[]);
   results.push({engine,width,height,status:"pass",layout});
   console.log("PAINTED MISSION1 PASS",engine,width);
  }finally{await browser.close();}
 }
 writeFileSync("artifacts/akari/painted-qa.json",JSON.stringify(results,null,2));
 // Inspect actual animation and cancellation with motion enabled as well.
 for(const [engine,width,height] of [["chromium",390,844],["chromium",1440,1000],["webkit",390,844],["webkit",1440,1000]]){
  const browser=await(engine==="webkit"?webkit:chromium).launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:"no-preference",hasTouch:width<741,isMobile:width<741});
   const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
   await p.goto(origin+'/games/akari/?visual=painted',{waitUntil:'networkidle'});
   await p.waitForFunction(()=>document.body.dataset.paintedMission==='1');
   const press=async t=>{const b=p.locator('[data-t="'+t+'"]');if(width<741)await b.tap();else await b.click();};
   for(const t of ['P','L','R','N'])await press(t);
   await p.waitForFunction(()=>document.querySelector('.painted-light-enter'));
   assert.equal(await p.locator(".painted-world-lit").evaluate(el=>getComputedStyle(el).animationName),
     "mission1-town-awakens",
     "The physical lamp reveals the powered town with its original light artwork");
   await p.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.painted-light-pool')).opacity)===1);
   await p.locator('[data-unwire]').first().click();
   assert.equal(await p.locator('.painted-light-pool').evaluate(el=>getComputedStyle(el).opacity),'0','Light disappears immediately on cutting, without a lingering animation');
   await p.locator('#resetBtn').click();await press('P');await press('N');
   await p.locator('.painted-short-frame').waitFor({state:'visible'});
   const warning=await p.locator('.painted-short-frame').evaluate(el=>({animation:getComputedStyle(el).animationName,image:getComputedStyle(el).backgroundImage}));
   assert.equal(warning.animation,'painted-short-frames');assert.ok(warning.image.includes('short-burst-sheet.webp'));
   await p.locator('.circuit-board').screenshot({path:`artifacts/akari/${engine}-${width}-motion-short.png`,animations:'allow'});
   await p.locator('#resetBtn').click();
   assert.equal(await p.locator('.painted-short-event').count(),0,'Reset cancels the in-flight fire animation');
   await press('P');await press('N');await p.locator('.painted-short-event').waitFor({state:'visible'});
   await p.locator('.painted-short-event').waitFor({state:'detached',timeout:4000});
   assert.equal(await p.locator('.circuit-board.is-short').count(),1,'Transient fire ends, but a genuine short keeps its persistent warning');
   await p.locator('[data-unwire]').click();
   assert.equal(await p.locator('.circuit-board.is-short').count(),0);
   assert.deepEqual(errors,[]);motionResults.push({engine,width,height,status:'pass',warning});
   console.log('PAINTED MOTION PASS',engine,width);await context.close();
  }finally{await browser.close();}
 }
 writeFileSync("artifacts/akari/painted-motion-qa.json",JSON.stringify(motionResults,null,2));
}finally{if(server)await new Promise(resolve=>server.close(resolve));}
