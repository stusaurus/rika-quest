// Build a Netlify-ready, anonymous first-three-mission review, without
// changing the approved 14-mission QA build or the public mission-1 site.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Script} from 'node:vm';

const source=readFileSync('artifacts/akari-mission1-painted.html','utf8');
const game=readFileSync('games/akari/game.js','utf8');
const exact=(text,needle,replacement)=>{
  if(text.split(needle).length!==2)throw new Error('Review boundary changed: '+needle.slice(0,80));
  return text.replace(needle,replacement);
};
// The fourteen build has isolated storage and freehand state already. Match
// that exact script, then narrow only the standalone deliverable.
const baseGame=game;
if(!source.includes(baseGame))throw new Error('Expected original game in painted preview');
let limited=baseGame;
limited=exact(limited,'storageKey="rika-akari-quest-v2"','storageKey="rika-akari-three-netlify-v1"');
limited=exact(limited,'function changeMission(id){','function changeMission(id){if(id<1||id>3)return;');
limited=exact(limited,'$("missionList").innerHTML=M.map(','$("missionList").innerHTML=M.filter(m=>m.id<=3).map(');
limited=exact(limited,'lampMap.innerHTML=M.map(','lampMap.innerHTML=M.filter(m=>m.id<=3).map(');
limited=exact(limited,'String(m.id).padStart(2,"0")+" / 14"','String(m.id).padStart(2,"0")+" / 3"');
limited=exact(limited,'$("nextBtn").textContent="つぎへ すすむ ➜"','$("nextBtn").textContent=m.id===3?"もういちど あそぶ ↻":"つぎへ すすむ ➜"');
limited=exact(limited,'$("nextBtn").addEventListener("click",()=>changeMission(Math.min(14,state.active+1)))',
  '$("nextBtn").addEventListener("click",()=>changeMission(state.active>=3?1:state.active+1))');
new Script(limited,{filename:'akari-three-scoped-game.js'});
let html=exact(source,baseGame,limited);
// The first-step feedback observer reads the mission number from the header.
// Scope its parser and progress display to three, or mission 2 would be
// misclassified as mission 1 when the header changes from "/14" to "/3".
const reference=readFileSync('games/akari/reference-layout.js','utf8');
let localReference=exact(reference,'14/)','3/)');
localReference=localReference.replaceAll(' / 14',' / 3')
  .replaceAll('rika-akari-first-reasons-v1','rika-akari-three-first-reasons-v1');
html=exact(html,reference,localReference);
html=exact(html,'<title>あかりクエスト｜試遊版</title>',
  '<title>あかりクエスト｜第1〜3ミッション試遊</title>');
html=exact(html,'<small>/ 42</small>','<small>/ 9</small>');
// All features and storage remain local; no extra scripts, user accounts or
// telemetry are introduced by this delivery. Avoid claiming it is secret:
// the URL can be forwarded and robots.txt is not access protection.
if(!html.includes('<meta name="robots" content="noindex,nofollow">'))
  throw new Error('No noindex metadata in source');
html=exact(html,'</head>','<meta name="akari-trial-scope" content="mission-1-3-only">\n</head>');
const badRemoteScript=/<script\b[^>]*\bsrc\s*=\s*["']?\s*(?:https?:)?\/\//i;
if(badRemoteScript.test(html))throw new Error('Unexpected external script in public trial');
const folder='artifacts/netlify-akari-three';
mkdirSync(folder,{recursive:true});
for(const path of ['index.html','akari-missions-1-3.html'])
  writeFileSync(folder+'/'+path,html,'utf8');
writeFileSync(folder+'/robots.txt','User-agent: *\nDisallow: /\n');
writeFileSync(folder+'/_headers', '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Cache-Control: no-store\n');
writeFileSync(folder+'/README.txt',
  'あかりクエスト 第1〜3ミッション 試遊用\n' +
  'URLを知る人が閲覧できます。検索除外設定はアクセス制限ではありません。\n' +
  '児童名やメールの入力なし・分析タグなし。進行は端末のブラウザ内に保存されます。\n' +
  'Netlify Freeで使用。課金を伴う設定や本番ゲームへの反映は禁止。\n');
writeFileSync(folder+'/build-manifest.json',JSON.stringify({
  scope:'mission-1-3-only',
  playableMissions:[1,2,3],
  sha256:createHash('sha256').update(html).digest('hex'),
  sourceEnv:'review/PR-39',
  noIndex:true,
  hosting:'netlify-free-static',
  analyticsAdded:false,
},null,2)+'\n');
console.log('Created Netlify-ready mission 1-3 review:',Buffer.byteLength(html),'bytes');
