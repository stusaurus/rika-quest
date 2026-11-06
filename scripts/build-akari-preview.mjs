import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const html=readFileSync("games/akari/index.html","utf8");
const css=readFileSync("games/akari/style.css","utf8");
const polish=readFileSync("games/akari/design-polish.css","utf8");
const referenceCss=readFileSync("games/akari/reference-layout.css","utf8");
const wireCss=readFileSync("games/akari/wire-effects.css","utf8");
const immersiveCss=readFileSync("games/akari/immersive-lab.css","utf8");
const cinematicCss=readFileSync("games/akari/bridge-cinematic.css","utf8");
const cuteTownCss=readFileSync("games/akari/cute-town.css","utf8");
const circuitVillageCss=readFileSync("games/akari/circuit-village.css","utf8");
const wireFocusCss=readFileSync("games/akari/wire-focus.css","utf8");
const sideDrawersCss=readFileSync("games/akari/side-drawers.css","utf8");
const switchFocusCss=readFileSync("games/akari/switch-focus.css","utf8");
const freeLabCss=readFileSync("games/akari/free-lab.css","utf8");
const art=readFileSync("games/akari/art.js","utf8");
const scenes=readFileSync("games/akari/scenes.js","utf8");
const cuteTownArt=readFileSync("games/akari/cute-town.js","utf8");
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
function replaceOne(source,what,withText){
 if(!source.includes(what))throw new Error("Missing expected HTML resource: "+what);
 return source.replace(what,withText);
}
function inlineScript(source){return "<script>"+source+"</script>";}
let output=replaceOne(html,'<link rel="stylesheet" href="./style.css">',"<style>\n"+css+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./design-polish.css">',"<style>\n"+polish+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./reference-layout.css">',"<style>\n"+referenceCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./wire-effects.css?v=4690ff5">',"<style>\n"+wireCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./immersive-lab.css?v=282606d">',"<style>\n"+immersiveCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./bridge-cinematic.css?v=1">',"<style>\n"+cinematicCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./cute-town.css?v=1">',"<style>\n"+cuteTownCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./circuit-village.css?v=inside1">',"<style>\n"+circuitVillageCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./wire-focus.css?v=1">',"<style>\n"+wireFocusCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./side-drawers.css?v=1">',"<style>\n"+sideDrawersCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./switch-focus.css">',"<style>\n"+switchFocusCss+"\n</style>");
output=replaceOne(output,'<link rel="stylesheet" href="./free-lab.css">',"<style>\n"+freeLabCss+"\n</style>");
output=replaceOne(output,'<script src="./art.js" defer></script>',inlineScript(art));
output=replaceOne(output,'<script src="./game.js?v=trays1" defer></script>',inlineScript(game));
output=replaceOne(output,"<script src=\"./scenes.js?v=streetlamp3\" defer></script>",inlineScript(scenes));
output=replaceOne(output,"<script src=\"./cute-town.js?v=streetlamp3\" defer></script>",inlineScript(cuteTownArt));
output=replaceOne(output,"<script src=\"./circuit-village.js?v=inside1\" defer></script>",inlineScript(circuitVillage));
output=replaceOne(output,'<script src="./transfer.js" defer></script>',inlineScript(transfer));
output=replaceOne(output,'<script src="./builder.js" defer></script>',inlineScript(builder));
output=replaceOne(output,'<script src="./switch-lab.js" defer></script>',inlineScript(switchLab));
output=replaceOne(output,'<script src="./safety-lab.js" defer></script>',inlineScript(safetyLab));
output=replaceOne(output,'<script src="./bridge-lab.js?v=streetlamp3" defer></script>',inlineScript(bridgeLab));
output=replaceOne(output,'<script src="./side-drawers.js?v=1" defer></script>',inlineScript(sideDrawers));
output=replaceOne(output,'<script src="./garden-lab.js" defer></script>',inlineScript(gardenLab));
output=replaceOne(output,'<script src="./battery-lab.js" defer></script>',inlineScript(batteryLab));
output=replaceOne(output,'<script src="./double-fault-lab.js" defer></script>',inlineScript(doubleFaultLab));
output=replaceOne(output,'<script src="./finale-lab.js" defer></script>',inlineScript(finaleLab));
output=replaceOne(output,'<script src="./pacing.js" defer></script>',inlineScript(pacing));
output=replaceOne(output,'<script src="./reading.js" defer></script>',inlineScript(reading));
output=replaceOne(output,'<script src="./furigana.js" defer></script>',inlineScript(furigana));
output=replaceOne(output,'<script src="./reference-layout.js?v=wirefocus1" defer></script>',inlineScript(referenceJs));
output=replaceOne(output,'<script src="./wire-canvas.js" defer></script>',inlineScript(wireCanvas));
output=replaceOne(output,'<script src="./wire-cut.js" defer></script>',inlineScript(wireCut));
output=replaceOne(output,'<script src="./free-lab-model.js" defer></script>',inlineScript(freeLabModel));
output=replaceOne(output,'<script src="./free-lab.js" defer></script>',inlineScript(freeLab));
output=replaceOne(output,'<script src="./short-effects.js" defer></script>',inlineScript(shortEffects));
const previewCommit=process.env.AKARI_PREVIEW_SHA;
if(previewCommit&&/^[a-f0-9]{40}$/.test(previewCommit)){
 output=output.replace(
  "https://rawcdn.githack.com/stusaurus/rika-quest/a45e52b643eb1e21e435e5c6b57ecfbcfdd6f47f/games/akari/index.html",
  "https://rawcdn.githack.com/stusaurus/rika-quest/"+previewCommit+"/games/akari/index.html"
 );
}

output=output.replace('href="../../index.html"','href="https://stusaurus.github.io/rika-quest/"');
output=output.replace("<title>あかりクエスト | Rika Quest</title>","<title>あかりクエスト｜試遊版</title>");
mkdirSync("artifacts",{recursive:true});
writeFileSync("artifacts/akari-preview.html",output,"utf8");
console.log("Created standalone playable HTML:",Buffer.byteLength(output),"bytes");
