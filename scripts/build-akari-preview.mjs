import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const html=readFileSync("games/akari/index.html","utf8");
const css=readFileSync("games/akari/style.css","utf8");
const art=readFileSync("games/akari/art.js","utf8");
const scenes=readFileSync("games/akari/scenes.js","utf8");
const character=readFileSync("games/akari/character.js","utf8");
const characterSprite=readFileSync("games/akari/assets/tiranon-walk-prototype.webp").toString("base64");
const game=readFileSync("games/akari/game.js","utf8");
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
output=output.replace("./assets/tiranon-walk-prototype.webp","data:image/webp;base64,"+characterSprite);
output=output.replace('href="../../index.html"','href="https://stusaurus.github.io/rika-quest/"');
output=output.replace("<title>あかりクエスト | Rika Quest</title>","<title>あかりクエスト｜試遊版</title>");
mkdirSync("artifacts",{recursive:true});
writeFileSync("artifacts/akari-preview.html",output,"utf8");
console.log("Created standalone playable HTML:",Buffer.byteLength(output),"bytes");
