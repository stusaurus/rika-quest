import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const html=readFileSync("games/akari/index.html","utf8");
const css=readFileSync("games/akari/style.css","utf8");
const art=readFileSync("games/akari/art.js","utf8");
const scenes=readFileSync("games/akari/scenes.js","utf8");
const character=readFileSync("games/akari/character.js","utf8");
const transfer=readFileSync("games/akari/transfer.js","utf8");
const builder=readFileSync("games/akari/builder.js","utf8");
const switchLab=readFileSync("games/akari/switch-lab.js","utf8");
const characterSprite=readFileSync("games/akari/assets/tiranon-walk-prototype.webp").toString("base64");
const safetyLab=readFileSync("games/akari/safety-lab.js","utf8");
const bridgeLab=readFileSync("games/akari/bridge-lab.js","utf8");
const gardenLab=readFileSync("games/akari/garden-lab.js","utf8");
const batteryLab=readFileSync("games/akari/battery-lab.js","utf8");
const doubleFaultLab=readFileSync("games/akari/double-fault-lab.js","utf8");
const finaleLab=readFileSync("games/akari/finale-lab.js","utf8");
const pacing=readFileSync("games/akari/pacing.js","utf8");
const reading=readFileSync("games/akari/reading.js","utf8");
const game=readFileSync("games/akari/game.js","utf8");
const furigana=readFileSync("games/akari/furigana.js","utf8");
function replaceOne(source,what,withText){
 if(!source.includes(what))throw new Error("Missing expected HTML resource: "+what);
 return source.replace(what,withText);
}
function inlineScript(source){return "<script>"+source+"</script>";}
let output=replaceOne(html,'<link rel="stylesheet" href="./style.css">',"<style>\n"+css+"\n</style>");
output=replaceOne(output,'<script src="./art.js" defer></script>',inlineScript(art));
output=replaceOne(output,'<script src="./game.js" defer></script>',inlineScript(game));
output=replaceOne(output,"<script src=\"./scenes.js\" defer></script>",inlineScript(scenes));
output=replaceOne(output,'<script src="./character.js" defer></script>',inlineScript(character));
output=replaceOne(output,'<script src="./transfer.js" defer></script>',inlineScript(transfer));
output=replaceOne(output,'<script src="./builder.js" defer></script>',inlineScript(builder));
output=replaceOne(output,'<script src="./switch-lab.js" defer></script>',inlineScript(switchLab));
output=replaceOne(output,'<script src="./safety-lab.js" defer></script>',inlineScript(safetyLab));
output=replaceOne(output,'<script src="./bridge-lab.js" defer></script>',inlineScript(bridgeLab));
output=replaceOne(output,'<script src="./garden-lab.js" defer></script>',inlineScript(gardenLab));
output=replaceOne(output,'<script src="./battery-lab.js" defer></script>',inlineScript(batteryLab));
output=replaceOne(output,'<script src="./double-fault-lab.js" defer></script>',inlineScript(doubleFaultLab));
output=replaceOne(output,'<script src="./finale-lab.js" defer></script>',inlineScript(finaleLab));
output=replaceOne(output,'<script src="./pacing.js" defer></script>',inlineScript(pacing));
output=replaceOne(output,'<script src="./reading.js" defer></script>',inlineScript(reading));
output=replaceOne(output,'<script src="./furigana.js" defer></script>',inlineScript(furigana));
output=output.replace("./assets/tiranon-walk-prototype.webp","data:image/webp;base64,"+characterSprite);
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
