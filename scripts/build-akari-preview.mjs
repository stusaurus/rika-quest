import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {mission1Trial} from "./akari-mission1-trial.mjs";
const html=readFileSync("games/akari/index.html","utf8");
const sourceCss=readFileSync("games/akari/style.css","utf8");
const fontFiles={"Kosugi Maru":"kosugi-maru-game.woff",Nunito:"nunito-latin.woff"};
const localFontFaces=Object.entries(fontFiles).map(([family,file])=>
 '@font-face{font-family:"'+family+'";font-style:normal;font-weight:'+(family==="Nunito"?'200 1000':'400')+
 ';font-display:swap;src:url("data:font/woff;base64,'+readFileSync("games/akari/assets/fonts/"+file).toString("base64")+'") format("woff")}').join("\n");
const css=sourceCss.replace(/^@import url\([^)]*fonts\.googleapis\.com[^)]*\);/,localFontFaces);
if(css===sourceCss)throw new Error("Expected the original external font import before embedding identical typefaces");
const fontLicenses={KosugiMaru:readFileSync("games/akari/assets/fonts/kosugi-LICENSE.txt","utf8"),Nunito:readFileSync("games/akari/assets/fonts/nunito-OFL.txt","utf8")};
const polish=readFileSync("games/akari/design-polish.css","utf8");
const referenceCss=readFileSync("games/akari/reference-layout.css","utf8");
const wireCss=readFileSync("games/akari/wire-effects.css","utf8");
const immersiveCss=readFileSync("games/akari/immersive-lab.css","utf8");
const cinematicCss=readFileSync("games/akari/bridge-cinematic.css","utf8");
const cuteTownCss=readFileSync("games/akari/cute-town.css","utf8");
const circuitVillageCss=readFileSync("games/akari/circuit-village.css","utf8");
const wireFocusCss=readFileSync("games/akari/wire-focus.css","utf8");
const sideDrawersCss=readFileSync("games/akari/side-drawers.css","utf8");
const storybookCss=readFileSync("games/akari/storybook-skin.css","utf8");
const cinematicDirectionCss=readFileSync("games/akari/cinematic-direction.css","utf8");
const cinematicSceneryCss=readFileSync("games/akari/cinematic-scenery.css","utf8");
const switchFocusCss=readFileSync("games/akari/switch-focus.css","utf8");
const freeLabCss=readFileSync("games/akari/free-lab.css","utf8");
const art=readFileSync("games/akari/art.js","utf8");
const scenes=readFileSync("games/akari/scenes.js","utf8");
const cuteTownArt=readFileSync("games/akari/cute-town.js","utf8");
const layeredTownArt=readFileSync("games/akari/cinematic-scenery.js","utf8");
const circuitVillage=readFileSync("games/akari/circuit-village.js","utf8");
const transfer=readFileSync("games/akari/transfer.js","utf8");
const builder=readFileSync("games/akari/builder.js","utf8");
const switchLab=readFileSync("games/akari/switch-lab.js","utf8");
const safetyLab=readFileSync("games/akari/safety-lab.js","utf8");
const bridgeLab=readFileSync("games/akari/bridge-lab.js","utf8");
const sideDrawers=readFileSync("games/akari/side-drawers.js","utf8");
const gardenLab=readFileSync("games/akari/garden-lab.js","utf8");
const batteryLab=readFileSync("games/akari/battery-lab.js","utf8");
const doubleFaultLab=readFileSync("games/akari/double-fault-lab.js","utf8");
const finaleLab=readFileSync("games/akari/finale-lab.js","utf8");
const pacing=readFileSync("games/akari/pacing.js","utf8");
const reading=readFileSync("games/akari/reading.js","utf8");
const game=readFileSync("games/akari/game.js","utf8");
const furigana=readFileSync("games/akari/furigana.js","utf8");
const referenceJs=readFileSync("games/akari/reference-layout.js","utf8");
const wireCanvas=readFileSync("games/akari/wire-canvas.js","utf8");
const wireCut=readFileSync("games/akari/wire-cut.js","utf8");
const freeLabModel=readFileSync("games/akari/free-lab-model.js","utf8");
const freeLab=readFileSync("games/akari/free-lab.js","utf8");
const shortEffects=readFileSync("games/akari/short-effects.js","utf8");
const cinematicLayoutJs=readFileSync("games/akari/cinematic-layout.js","utf8");
const paintedCss=readFileSync("games/akari/mission1-art.css","utf8");
const paintedFinishCss=readFileSync("games/akari/mission1-finish.css","utf8");
const paintedArt=readFileSync("games/akari/mission1-art.js","utf8");
function replaceOne(source,what,withText){
 if(!source.includes(what))throw new Error("Missing expected HTML resource: "+what);
 return source.replace(what,withText);
}
function inlineScript(source){return "<script data-akari-preview-script>"+source+"</script>";}
let output=replaceOne(html,'<link rel="stylesheet" href="./style.css">',"<style>\n"+css+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./mission1-art.css?v=1">',"<style>\n"+paintedCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./mission1-finish.css?v=1">',"<style>\n"+paintedFinishCss+"\n</style>");
output=replaceOne(output,'<script src="./mission1-art.js?v=1" defer></script>',inlineScript(paintedArt));
output=replaceOne(output,'<link rel="stylesheet" href="./design-polish.css">',"<style>\n"+polish+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./reference-layout.css">',"<style>\n"+referenceCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./wire-effects.css?v=4690ff5">',"<style>\n"+wireCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./immersive-lab.css?v=282606d">',"<style>\n"+immersiveCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./bridge-cinematic.css?v=1">',"<style>\n"+cinematicCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./cute-town.css?v=1">',"<style>\n"+cuteTownCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./circuit-village.css?v=inside2">',"<style>\n"+circuitVillageCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./wire-focus.css?v=reason-flow-2">',"<style>\n"+wireFocusCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./side-drawers.css?v=piece18">',"<style>\n"+sideDrawersCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./storybook-skin.css?v=4">',"<style>\n"+storybookCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./cinematic-direction.css?v=prototype1">',"<style>\n"+cinematicDirectionCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./cinematic-scenery.css?v=paint1">',"<style>\n"+cinematicSceneryCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./switch-focus.css">',"<style>\n"+switchFocusCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./free-lab.css?v=uncovered1">',"<style>\n"+freeLabCss+"\n</style>");
output=replaceOne(output,'<script src="./art.js?v=cinematic-mount1" defer></script>',inlineScript(art));
output=replaceOne(output,'<script src="./game.js?v=clarity15" defer></script>',inlineScript(game));
output=replaceOne(output,"<script src=\"./scenes.js?v=streetlamp3\" defer></script>",inlineScript(scenes));
output=replaceOne(output,'<script src="./cinematic-scenery.js?v=layered1" defer></script>',inlineScript(layeredTownArt));
output=replaceOne(output,"<script src=\"./cute-town.js?v=cinematic2\" defer></script>",inlineScript(cuteTownArt));
output=replaceOne(output,"<script src=\"./circuit-village.js?v=inside1\" defer></script>",inlineScript(circuitVillage));
output=replaceOne(output,'<script src="./transfer.js" defer></script>',inlineScript(transfer));
output=replaceOne(output,'<script src="./builder.js" defer></script>',inlineScript(builder));
output=replaceOne(output,'<script src="./switch-lab.js" defer></script>',inlineScript(switchLab));
output=replaceOne(output,'<script src="./safety-lab.js" defer></script>',inlineScript(safetyLab));
output=replaceOne(output,'<script src="./bridge-lab.js?v=cinematic-mount1" defer></script>',inlineScript(bridgeLab));
output=replaceOne(output,'<script src="./side-drawers.js?v=pro-inspect1" defer></script>',inlineScript(sideDrawers));
output=replaceOne(output,'<script src="./garden-lab.js" defer></script>',inlineScript(gardenLab));
output=replaceOne(output,'<script src="./battery-lab.js" defer></script>',inlineScript(batteryLab));
output=replaceOne(output,'<script src="./double-fault-lab.js" defer></script>',inlineScript(doubleFaultLab));
output=replaceOne(output,'<script src="./finale-lab.js" defer></script>',inlineScript(finaleLab));
output=replaceOne(output,'<script src="./pacing.js" defer></script>',inlineScript(pacing));
output=replaceOne(output,'<script src="./reading.js?v=visual2" defer></script>',inlineScript(reading));
output=replaceOne(output,'<script src="./furigana.js" defer></script>',inlineScript(furigana));
output=replaceOne(output,'<script src="./reference-layout.js?v=reason-flow-2" defer></script>',inlineScript(referenceJs));
output=replaceOne(output,'<script src="./wire-canvas.js" defer></script>',inlineScript(wireCanvas));
output=replaceOne(output,'<script src="./wire-cut.js" defer></script>',inlineScript(wireCut));
output=replaceOne(output,'<script src="./free-lab-model.js?v=drawer1" defer></script>',inlineScript(freeLabModel));
output=replaceOne(output,'<script src="./free-lab.js?v=discovery1" defer></script>',inlineScript(freeLab));
output=replaceOne(output,'<script src="./short-effects.js" defer></script>',inlineScript(shortEffects));
output=replaceOne(output,'<script src="./cinematic-layout.js?v=prototype2" defer></script>',inlineScript(cinematicLayoutJs));
// An inline script does not honor `defer`. Preserve the production script order
// at the end of the body, where wire-cut and other DOM-bound modules can attach
// to the same real workspace instead of silently returning from an empty head.
const readyScripts=[];
output=output.replace(/<script data-akari-preview-script>([\s\S]*?)<\/script>/g,(_match,source)=>{
 readyScripts.push("<script>"+source+"</script>");return "";
});
output=replaceOne(output,"</body>",readyScripts.join("\n")+"\n</body>");
const previewCommit=process.env.AKARI_PREVIEW_SHA;
if(previewCommit&&/^[a-f0-9]{40}$/.test(previewCommit)){
 output=output.replace(
  "https://rawcdn.githack.com/stusaurus/rika-quest/a45e52b643eb1e21e435e5c6b57ecfbcfdd6f47f/games/akari/index.html",
  "https://rawcdn.githack.com/stusaurus/rika-quest/"+previewCommit+"/games/akari/index.html"
 );
}

output=output.replace('href="../../index.html"','href="https://stusaurus.github.io/rika-quest/"');
output=output.replace("<title>あかりクエスト | Rika Quest</title>","<title>あかりクエスト｜試遊版</title>");
output=replaceOne(output,"</body>",'<script type="application/json" id="akari-font-licenses">'+JSON.stringify(fontLicenses)+'</script>\n</body>');
mkdirSync("artifacts",{recursive:true});
writeFileSync("artifacts/akari-preview.html",output,"utf8");
console.log("Created standalone playable HTML:",Buffer.byteLength(output),"bytes");

// Embed the exact production assets, including CSS textures and SVG <image>
// hrefs. This preview must be genuinely playable offline with no art downgrade.
let paintedOutput=output;
for(const name of ["battery","bulb-dark","bulb-lit","hud-panel","village-dark","village-lit","workbench","short-burst-sheet"]){
 const relative="./assets/mission1/"+name+".webp";
 const bytes=readFileSync("games/akari/assets/mission1/"+name+".webp");
 paintedOutput=paintedOutput.replaceAll(relative,"data:image/webp;base64,"+bytes.toString("base64"));
}
writeFileSync("artifacts/akari-preview.html",paintedOutput,"utf8");
paintedOutput=paintedOutput.replace('new URLSearchParams(location.search).get("visual")==="painted"',
 '(new URLSearchParams(location.search).get("visual")||"painted")==="painted"');
paintedOutput=paintedOutput.replace(/(https:\/\/rawcdn\.githack\.com\/stusaurus\/rika-quest\/[a-f0-9]+\/games\/akari\/index\.html)(?=")/g,"$1?visual=painted");
// A file viewer is not necessarily a JavaScript-capable browser. Give that
// route a real online alternative without diagnosing the user's device.
const reviewURL=process.env.AKARI_REVIEW_URL;
if(reviewURL){
 const parsed=new URL(reviewURL);
 if(parsed.protocol!=="https:"||parsed.username||parsed.password||/["<>]/.test(reviewURL)){
  throw new Error("AKARI_REVIEW_URL must be an ordinary HTTPS review URL");
 }
 paintedOutput=paintedOutput.replace(/<div id="startupFallback"[\s\S]*?<\/div>/,
  '<div id="startupFallback" class="startup-fallback" role="status"><strong>実験画面が 表示されないとき</strong><p>オンライン試遊版を、ChromeやSafariなどのブラウザで ひらいてください。</p><a class="startup-open-web" href="'+parsed.href+'" target="_blank" rel="noopener noreferrer">オンライン試遊版を ひらく ↗</a><small>ファイルのプレビューでは、ゲームのプログラムが動かないことがあります。</small></div>');
}
paintedOutput=paintedOutput.replace("</head>",'<meta name="robots" content="noindex,nofollow">\n</head>');
if(paintedOutput.includes('./assets/mission1/'))throw new Error("Painted preview contains an external image reference");
writeFileSync("artifacts/akari-mission1-painted.html",paintedOutput,"utf8");
console.log("Created offline painted mission 1 preview:",Buffer.byteLength(paintedOutput),"bytes");
// Public review + its downloadable copy are limited to the approved mission.
// The full 14-mission painted preview above is retained for regression testing.
const publicTrial=mission1Trial(paintedOutput,game);
mkdirSync("artifacts/akari-review",{recursive:true});
for(const name of ["index.html","akari-mission1-complete.html"]){
 writeFileSync("artifacts/akari-review/"+name,publicTrial,"utf8");
}
writeFileSync("artifacts/akari-review/robots.txt","User-agent: *\nDisallow: /\n");
writeFileSync("artifacts/akari-review/font-licenses.txt",Object.entries(fontLicenses).map(([name,text])=>name+"\n\n"+text).join("\n\n"));
writeFileSync("artifacts/akari-review/build-manifest.json",JSON.stringify({
 sourceCommit:previewCommit||null,
 htmlSha256:createHash("sha256").update(publicTrial).digest("hex"),
 fullPreviewHtmlSha256:createHash("sha256").update(paintedOutput).digest("hex"),
 reviewURL:reviewURL||null,
 designScope:"mission-1-only",
 playableMissions:[1],
},null,2)+"\n");
