"use strict";
(function(){
const Art=window.AkariArt||{};
const M=[
{id:1,name:"はじめてのひかり",place:"village",placeName:"ひかりの村",mode:"wire",goal:"小屋のあかりをつけよう",story:"村の小屋がまっくらだ。乾電池と豆電球をつないで、はじめてのひかりをともそう。",instructions:"乾電池の＋と−を、豆電球の金属の横部分・底の接点につなごう。端子を2つ順番にタップすると導線を引けるよ。",discovery:"豆電球は、乾電池の＋極と−極が豆電球を通る1つの輪でつながると光る。電気の通り道を「回路」というよ。",hints:["豆電球には電気が出入りする2つの接点があるよ。","＋から豆電球の金属の横部分へ、−から底の接点へ。2本つなごう。"]},
{id:2,name:"切れた通り道",place:"village",placeName:"ひかりの村",mode:"wire",prefill:[["P","L"]],goal:"消えた街灯を直そう",story:"さっきまで明るかった街灯が消えちゃった。1本の導線がはずれているみたい。",instructions:"すでにつながっている導線を観察して、足りない1本をつなごう。",discovery:"回路にすき間があると電気が流れず、豆電球はつかない。1か所でも切れていると点灯しないんだ。",hints:["すでに＋極と豆電球はつながっているよ。","−極と、まだつながっていない底の接点をつなごう。"]},
{id:3,name:"橋の材料さがし",place:"bridge",placeName:"こもれび橋",mode:"explore",goal:"橋を調べて修理しよう",story:"橋のあかりが消えた！代わりの材料を探して通り道をつなごう。",instructions:"3つの材料をすべて調べてから、電気を通す材料を選んで修理しよう。",discovery:"鉄などの金属は電気を通す。見た目が似ていても、材料が違うと電気の通しやすさが違うよ。",hints:["電気が通りやすい材料は何でできているかな？","鉄のくぎは金属。木やプラスチックより電気を通しやすいよ。"]},
{id:4,name:"庭の実験工房",place:"garden",placeName:"ふしぎな庭",mode:"material",target:"conductor",goal:"電気を通すものを2つ見つけよう",story:"庭師さんが材料を集めてきた。豆電球を使って、どれが電気を通すのか実験しよう。",instructions:"材料を選んで電気を流そう。電気を通す2種類と、通さない1種類以上を調べたらクリア！",discovery:"鉄のクリップやアルミはくのような金属は電気を通す「導体」。実験で確かめることができるんだ。",hints:["金属でできているものに注目しよう。","クリップとアルミはくを実験し、木やプラスチックとも比べよう。"]},
{id:5,name:"にせものの金属",place:"garden",placeName:"ふしぎな庭",mode:"material",target:"insulator",goal:"電気を通さないものを見つけよう",story:"ぴかぴかの材料は全部電気を通す？ 見た目にだまされないで調べてみよう。",instructions:"4種類を実験し、電気を通さない2種類と、通す1種類以上を見つけてね。",discovery:"色や光り方ではなく、材料の性質が大切。プラスチックや乾いた木はふつう電気を通しにくい「不導体」だよ。",hints:["ぴかぴかだからといって金属とは限らないよ。","プラスチックは見た目が金属でも通しにくい。木も試そう。"]},
{id:6,name:"時計塔の故障調査",place:"tower",placeName:"古時計の塔",mode:"repair",goal:"故障した回路を修理しよう",story:"時計塔の時計が暗くて読めない。点灯しない理由を、部品を調べて探そう。",instructions:"部品を1つずつ調べよう。原因が見つかったら修理して通電チェック！",discovery:"電球がつかないとき、すぐに乾電池のせいと決めつけず、接点や導線を1か所ずつ調べると原因がわかる。",hints:["故障は乾電池とは限らないよ。","導線のつなぎ目を調べてみよう。"]},
{id:7,name:"ふたつの合図",place:"tower",placeName:"古時計の塔",mode:"logic",target:"series",goal:"両方押したときだけ点灯する回路",story:"時計塔の扉には2つのスイッチがある。両方ONのときだけ明かりをつけたいんだ。",instructions:"直列か並列を選び、A・Bの4通りをすべて実験しよう。",discovery:"スイッチを直列につなぐと、両方閉じたときだけ回路がつながる。「両方」が必要なんだね。",hints:["1つでもスイッチが開くと電気が止まる回路はどっち？","2つのスイッチが1本の通り道に並ぶ『直列』を選ぼう。"]},
{id:8,name:"どちらかの合図",place:"port",placeName:"月あかり港",mode:"logic",target:"parallel",goal:"どちらかで点灯する回路",story:"港の灯りは、船着き場からでも倉庫からでもつけたい。スイッチAかB、どちらかがONなら点灯させよう。",instructions:"回路を選び、A・Bの4通りすべてで光り方を確かめよう。",discovery:"スイッチを並列につなぐと、どちらか一方が閉じていれば電気の通り道ができる。",hints:["電気の通り道が2つに分かれるとどうなる？","スイッチAかBを通れる『並列』の回路を選んでみよう。"]},
{id:9,name:"乾電池の大きさ",place:"port",placeName:"月あかり港",mode:"battery",goal:"大きさと明るさを比べよう",story:"港の電池屋さんから質問！ 大きな乾電池なら必ず明るくなるのかな？",instructions:"同じ種類・電圧表示の単4形と単1形を両方試してから答えよう。",discovery:"同じ種類の1.5V乾電池なら、大きさが違っても公称電圧は同じ。ただし使える時間や大きな電流を流す力などは異なる。",hints:["乾電池に書かれた1.5Vという数字を見てみよう。","単4形も単1形も公称電圧は1.5V。大きいから必ず明るいわけではないよ。"]},
{id:10,name:"ふたつの力",place:"museum",placeName:"ひかり博物館",mode:"battery",goal:"直列つなぎの効果を比べよう",story:"博物館の展示には乾電池を2個使う装置がある。1個のときとの違いを調べよう。",instructions:"乾電池1個と、同じ向きの2個直列つなぎを両方試してから答えよう。",discovery:"同じ1.5Vの乾電池を2個直列にすると、電圧は約3Vになる。対応する豆電球では1個より明るくなることがある。電球の定格を守ろう。",hints:["2個の乾電池を同じ向きに直列につなぐと、電圧が足し合わされるよ。","この装置では2個直列のほうが明るい設定だよ。"]},
{id:11,name:"電池の向きのひみつ",place:"museum",placeName:"ひかり博物館",mode:"polarity",goal:"乾電池の向きを調べよう",story:"展示の電池を入れ直したら、急に消えちゃった。向きは大切なのかな？",instructions:"同じ向き・逆向きの2つの直列つなぎを両方実験して、光るつなぎ方を答えよう。",discovery:"同じ乾電池2個を直列で逆向きにすると、電圧が打ち消し合い、豆電球は光らない。乾電池1個だけなら向きを逆にしても普通の豆電球は光るよ。",hints:["電池1個の向きではなく、2個の向きの組み合わせだよ。","2個を同じ向きに直列につなぐと電圧が足し合わされるよ。"]},
{id:12,name:"危険な近道",place:"port",placeName:"月あかり港",mode:"cut",goal:"危険な導線を2本外そう",story:"船の作業灯に危険な近道が2本！ 電気が豆電球を通らず、電池が熱くなりそう。",instructions:"正しい2本は残し、ショートの原因になる赤い導線X・Yを外そう。",discovery:"豆電球を通らず、乾電池の＋と−がほぼ直接つながるとショート。大きな電流が流れ発熱・発火の危険がある。実物では絶対に試さないでね。",hints:["豆電球を通っていない『近道』を探そう。","赤い導線XとYを外し、電池→豆電球→電池の通り道だけを残そう。"]},
{id:13,name:"灯台の二重故障",place:"lighthouse",placeName:"星あかり灯台",mode:"repair",goal:"2つの故障を見つけよう",story:"灯台が消えて船が帰れない。1か所直しても点灯しないみたい。",instructions:"部品を調べて、2つの故障を両方修理してから電気を流そう。",discovery:"複数の故障が重なることもある。電球・導線・接点・乾電池を順番に確認すると落ち着いて直せる。",hints:["1つ直しても消えたままなら、ほかにも故障があるよ。","導線の断線と、豆電球の接触不良を両方直そう。"]},
{id:14,name:"ひかりを取り戻せ！",place:"lighthouse",placeName:"星あかり灯台",mode:"finale",goal:"最終ミッション！ 灯台をともそう",story:"最後の夜。乾電池、材料、豆電球の3つに問題が！ ここまでの発見を使って灯台を救おう。",instructions:"2個の乾電池の向きを直し、電気を通す材料を選び、豆電球の接点を修理して通電しよう。",discovery:"回路は『電源・電気を通す導線・豆電球・確かな接点』の組み合わせ。ひとつひとつ確かめれば、街にあかりを取り戻せる！",hints:["電源・材料・接点をすべて確認してみよう。","乾電池は同じ向き、材料は鉄のクリップ、豆電球はしっかり接触させよう。"]}
];
const $=id=>document.getElementById(id), storageKey="rika-akari-quest-v2";
let state=readSave(),ui={},stageComplete=false,hintIndex=0,failures=0,helpReturnFocus=null,soundCtx=null;
const materials=[{id:"clip",name:"鉄のクリップ",conductive:true},{id:"foil",name:"アルミはく",conductive:true},{id:"wood",name:"乾いた木",conductive:false},{id:"plastic",name:"プラスチック",conductive:false}];
const inspectedItems=[{id:"wood",name:"木の板",description:"木は電気を通しにくそうだね。",correct:false},{id:"iron",name:"鉄のくぎ",description:"鉄は金属！ 電気を通しそうだ。",correct:true},{id:"plastic",name:"プラスチック板",description:"プラスチックは電気を通しにくい。",correct:false}];
function readSave(){try{const d=JSON.parse(localStorage.getItem(storageKey)||"null");if(d&&d.version===2&&d.completed&&typeof d.completed==="object")return{version:2,completed:d.completed,active:Math.min(14,Math.max(1,+d.active||1)),sound:!!d.sound};}catch(e){}return{version:2,completed:{},active:1,sound:false};}
function current(){return M[state.active-1]}
function initial(m){switch(m.mode){case"wire":return{wires:(m.prefill||[]).map(a=>a.slice()),selected:null};case"explore":return{inspected:[],chosen:null};case"material":return{selected:null,tried:[]};case"repair":return{inspected:[],fixed:[]};case"logic":return{design:"series",a:false,b:false,trials:{}};case"battery":case"polarity":return{selected:null,tried:[],answer:null};case"cut":return{removed:[]};default:return{direction:"reverse",material:"wood",contact:false}}}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(e){}}
function unlocked(){let id=1;while(id<=14&&state.completed[id])id++;return Math.min(id,14)}
function changeMission(id){if(id>unlocked()&&!state.completed[id])return;state.active=id;ui=initial(current());hintIndex=0;failures=0;stageComplete=false;persist();renderAll();window.scrollTo({top:0,behavior:"smooth"});}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function setFeedback(t,type=""){const e=$("feedback");e.className="feedback"+(type?" "+type:"");$("feedbackText").textContent=t;}
function playTone(ok){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;soundCtx=soundCtx||new C();const now=soundCtx.currentTime;(ok?[523,659,784,1046]:[220,175]).forEach((freq,i)=>{const oscillator=soundCtx.createOscillator(),gain=soundCtx.createGain(),start=now+i*.12;oscillator.type=ok?"sine":"triangle";oscillator.frequency.value=freq;oscillator.connect(gain);gain.connect(soundCtx.destination);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.065,start+.02);gain.gain.exponentialRampToValueAtTime(.0001,start+.22);oscillator.start(start);oscillator.stop(start+.23);});}catch(e){}}
function fail(message,short=false){failures++;setFeedback(message,"warning");playTone(false);if(short){const s=$("storyScene"),spark=$("spark");s.classList.add("shorted");spark.classList.remove("active");void spark.offsetWidth;spark.classList.add("active");setTimeout(()=>{s.classList.remove("shorted");spark.classList.remove("active")},850);}}
function success(){const stars=Math.max(1,3-(hintIndex?1:0)-(failures>=2?1:0));stageComplete=true;state.completed[current().id]=Math.max(stars,state.completed[current().id]||0);persist();renderAll();setFeedback("✦ 大成功！ "+current().placeName+"にあかりが戻った！ ★"+stars+"つ獲得。","success");playTone(true);}
function icon(place){return{village:"🏡",bridge:"🌉",garden:"🌿",tower:"🕰",port:"⚓",museum:"🏛",lighthouse:"🌟"}[place]||"✦"}
function renderMenu(){
 $("missionList").innerHTML=M.map(m=>{let done=!!state.completed[m.id],allow=m.id<=unlocked()||done,active=m.id===state.active;return'<button type="button" class="mission-item'+(active?' current':'')+(done?' done':'')+'" data-mission="'+m.id+'" '+(!allow?'disabled':'')+' '+(active?'aria-current="step"':'')+'><span class="mission-index">'+(done?'★':allow?m.id:'🔒')+'</span><span class="mission-label"><strong>'+m.name+'</strong><small>'+icon(m.place)+' '+m.placeName+'</small></span></button>'}).join("");
 const count=Object.keys(state.completed).length;$("starCount").textContent=Object.values(state.completed).reduce((n,x)=>n+(+x||0),0);
 $("summaryNote").textContent=count===14?"すべてのあかりを取り戻した！ 14ミッションクリア！":count+" / 14 ミッションクリア。次のひみつを見つけよう！";
}
const buildings={
 village:'<path fill="#b95c55" d="M40 91 140 22 240 91Z"/><rect x="64" y="91" width="154" height="141" rx="7" fill="#f2d9af"/><path d="M65 91h153M65 178h153" stroke="#d0a57c" stroke-width="5"/><rect x="128" y="157" width="43" height="75" rx="4" fill="#87614e"/><circle cx="160" cy="190" r="3" fill="#f8d58f"/><rect class="window" x="76" y="120" width="43" height="46" rx="6"/><rect class="window" x="180" y="120" width="27" height="46" rx="6"/><path d="M97 120v46m83-23h27" stroke="#ecd9b4" stroke-width="4"/><path d="M46 93H238" stroke="#ffe6ae" stroke-width="7"/>',
 bridge:'<path d="M5 185Q140 73 275 185L275 210Q140 120 5 210Z" fill="#bb957b"/><path d="M14 167H268" stroke="#e8cfaa" stroke-width="16"/><path d="M26 169V215M251 169V215" stroke="#7e675d" stroke-width="10"/><path d="M45 166 61 121M224 166 214 121" stroke="#fbe7b3" stroke-width="7"/><circle class="window" cx="61" cy="112" r="13"/><circle class="window" cx="214" cy="112" r="13"/>',
 garden:'<rect x="45" y="110" width="205" height="119" rx="10" fill="#c8b69d"/><path d="M26 112 148 44 271 112Z" fill="#6aa68f"/><rect x="119" y="144" width="59" height="85" fill="#618e8e"/><circle class="window" cx="70" cy="155" r="18"/><circle class="window" cx="225" cy="155" r="18"/><path d="M0 221Q39 179 80 220Q130 177 168 218Q226 168 280 221" fill="#41856f"/>',
 tower:'<rect x="98" y="32" width="104" height="202" rx="7" fill="#d4c2a7"/><path d="M87 45 150 1 215 45Z" fill="#6986ac"/><circle cx="150" cy="99" r="36" fill="#fff4da" stroke="#946e60" stroke-width="6"/><path d="M150 99V72M150 99H172" stroke="#4a6276" stroke-width="6" stroke-linecap="round"/><rect class="window" x="134" y="158" width="34" height="45" rx="12"/><rect x="119" y="216" width="63" height="20" rx="8" fill="#79695f"/>',
 port:'<path d="M22 190 260 190 226 226 68 226Z" fill="#976f5f"/><path d="M100 196V36L234 194Z" fill="#e5ebdd"/><path d="M104 46 34 192H104Z" fill="#e8b98e"/><path d="M100 32V216" stroke="#6b716e" stroke-width="9"/><circle class="window" cx="169" cy="202" r="14"/><path d="M0 228Q22 211 46 228T93 228T140 228T188 228T282 228" stroke="#bee6e6" stroke-width="9" fill="none"/>',
 museum:'<path d="M17 87 148 21 280 87Z" fill="#b37f79"/><rect x="26" y="87" width="247" height="24" fill="#f0d4a9"/><rect x="29" y="206" width="240" height="25" fill="#d2b18d"/><path d="M55 110V204M106 110V204M159 110V204M214 110V204M255 110V204" stroke="#f7e7c9" stroke-width="22"/><rect class="window" x="132" y="125" width="32" height="64" rx="5"/>',
 lighthouse:'<path d="M89 231 110 47 186 47 207 231Z" fill="#f2e5ce"/><path d="M105 89H192L195 115H101ZM98 165H201L204 189H95Z" fill="#c76f66"/><path d="M93 48H207L183 21H120Z" fill="#587d9e"/><rect class="window" x="115" y="48" width="67" height="39" fill="#38556c"/><rect class="window" x="134" y="135" width="36" height="26" rx="6"/><rect x="121" y="202" width="49" height="29" rx="13" fill="#7a8179"/>'
};
function renderScene(){
 const m=current(),scene=$("storyScene");scene.dataset.place=m.place;scene.classList.toggle("restored",stageComplete);$("placeLabel").textContent=m.placeName;$("missionTitle").textContent=m.name;$("missionStory").textContent=stageComplete?"ありがとう！この場所にあかりが戻ったよ！":m.story;$("landmark").innerHTML='<svg viewBox="0 0 290 245" aria-hidden="true"><ellipse cx="147" cy="233" rx="125" ry="10" fill="#284a5a" opacity=".28"/>'+buildings[m.place]+'</svg>';
}
function renderHeader(){
 const m=current();$("missionNumber").textContent="MISSION "+String(m.id).padStart(2,"0")+" / 14";$("missionGoal").textContent=m.goal;$("missionInstructions").textContent=m.instructions;
 $("questStars").textContent=stageComplete?"★ ".repeat(state.completed[m.id]||3):state.completed[m.id]?"★ "+state.completed[m.id]+"つ獲得済み":"☆ ☆ ☆";
 $("checkBtn").hidden=stageComplete;$("nextBtn").hidden=!stageComplete||m.id===14;$("nextBtn").textContent="次の冒険へ ➜";
 $("discovery").hidden=!stageComplete;if(stageComplete)$("discoveryText").textContent=m.discovery;
 $("soundBtn").setAttribute("aria-pressed",String(state.sound));$("soundBtn").textContent=state.sound?"♫":"♪̸";
}
const pts={P:[80,70],N:[80,174],L:[260,121],R:[310,174]};const labels={P:"乾電池の＋極",N:"乾電池の−極",L:"豆電球の金属の横部分",R:"豆電球の底の接点"};
function edgeKey(a,b){return[a,b].sort().join("-");}
function circuitStatus(wires){
 const g={P:[],N:[],L:[],R:[]};wires.forEach(([a,b])=>{if(g[a]&&g[b]){g[a].push(b);g[b].push(a);}});
 function reachable(lamp){const x={P:g.P.slice(),N:g.N.slice(),L:g.L.slice(),R:g.R.slice()};if(lamp){x.L.push("R");x.R.push("L")}let seen=new Set(["P"]),stack=["P"];while(stack.length){let next=stack.pop();x[next].forEach(n=>{if(!seen.has(n)){seen.add(n);stack.push(n)}});}return seen.has("N");}
 const short=reachable(false);return{short,lit:!short&&reachable(true)};
}
function renderWire(){
 const stat=circuitStatus(ui.wires),lit=stageComplete||stat.lit;
 const wires=ui.wires.map(([a,b])=>'<line x1="'+pts[a][0]+'" y1="'+pts[a][1]+'" x2="'+pts[b][0]+'" y2="'+pts[b][1]+'" class="wire'+(lit?' lit':'')+(edgeKey(a,b)==="N-P"?' danger':'')+'"/>').join("");
 const svg='<svg class="circuit-svg" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><radialGradient id="akbulb"><stop stop-color="#fff8c4"/><stop offset="1" stop-color="#f5bd65"/></radialGradient></defs>'
 +'<rect x="46" y="85" width="68" height="78" rx="14" fill="#c57b55" stroke="#f8d6a6" stroke-width="4"/><rect x="52" y="95" width="56" height="41" rx="7" fill="#d9574d"/><path d="M80 85V70M80 163V174" stroke="#d3d9d1" stroke-width="7"/><text x="80" y="111" text-anchor="middle" font-weight="900" fill="#fff" font-size="12">1.5V</text><text x="80" y="129" text-anchor="middle" fill="#fff6de" font-size="13">乾電池</text><text x="80" y="229" text-anchor="middle" fill="#c9eff8" font-size="12">乾電池</text>'
 +'<path d="M260 121L285 145M310 145V174" stroke="#dadbc7" stroke-width="6" fill="none"/><circle cx="310" cy="111" r="36" fill="'+(lit?'#ffe6a0':'#80a9bb')+'" opacity="'+(lit?".95":".4")+'" class="lamp-glow"/><circle cx="310" cy="111" r="27" fill="'+(lit?'url(#akbulb)':'#567e91')+'" stroke="#c1dce0" stroke-width="4"/><path d="M300 106 307 114 316 102 325 110" stroke="'+(lit?'#fff':'#e2c88d')+'" stroke-width="3" fill="none"/><rect x="293" y="135" width="34" height="16" rx="4" fill="#bdc8c9" stroke="#e6d5a7" stroke-width="2"/><path d="M296 141h28M296 146h28" stroke="#718798" stroke-width="2"/><text x="315" y="229" text-anchor="middle" font-size="12" fill="#c7edf6">豆電球</text>'
 +wires+'</svg>';
 return'<div class="circuit-board'+(stageComplete?' is-lit':'')+'"><span class="circuit-label">⚡ 電気の通り道をつくろう</span><div class="circuit-inner">'+svg
 +Object.entries(pts).map(([t])=>'<button class="terminal'+(ui.selected===t?' selected':'')+'" data-t="'+t+'" aria-label="'+labels[t]+'" title="'+labels[t]+'">'+(t==="P"?"+":t==="N"?"−":t==="L"?"横":"底")+'</button>').join("")
 +'<div class="terminal-label label-p">＋極</div><div class="terminal-label label-n">−極</div><div class="terminal-label label-l">金属の横</div><div class="terminal-label label-r">底の接点</div></div>'
 +'<div class="wire-chip-list">'+ui.wires.map((p,i)=>'<button class="wire-chip" data-unwire="'+i+'" title="この導線を外す">'+(i+1)+'本目 ×</button>').join("")+'</div>'
 +'<div class="circuit-help">丸い端子を2つ順番にタップして接続。線を外すには上の「×」。</div></div>';
}
function choice(id,label,picture,selected,extra=""){return'<button type="button" class="choice'+(selected?' chosen':'')+' '+extra+'" data-choice="'+id+'" aria-pressed="'+!!selected+'"><span class="choice-picture">'+picture+'</span><span>'+escapeHtml(label)+'</span></button>';}
function renderExplore(){let selected=inspectedItems.find(x=>x.id===ui.chosen);
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🔎 橋の材料を調査</h3><p class="lab-sub">材料をタップすると調査ノートが更新されるよ。</p><div class="choices two">'+inspectedItems.map(x=>choice(x.id,x.name,Art.material(x.id),ui.chosen===x.id,ui.inspected.includes(x.id)?"tried":"")).join("")+'</div></div>'
 +'<div class="lab-panel"><h3>📖 発見ノート</h3><p class="lab-sub">調べた材料：'+ui.inspected.length+' / 3</p>'+inspectedItems.map(x=>'<p class="lab-reading">'+(ui.inspected.includes(x.id)?'✓ '+x.description:'？ '+x.name+" はまだ調査していない")+'</p>').join("")+'<p class="lab-reading">選択中：'+(selected?selected.name:"まだ選んでいない")+'</p></div></div>';
}
function renderMaterial(){
 const selected=materials.find(x=>x.id===ui.selected),tried=ui.tried;
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🧪 材料で実験</h3><p class="lab-sub">導線のすき間に材料をはさんで豆電球がつくか調べるよ。</p><div class="choices two">'+materials.map(x=>choice(x.id,x.name,Art.material(x.id),ui.selected===x.id,tried.includes(x.id)?"tried":"")).join("")+'</div></div>'
 +'<div class="lab-panel"><h3>🔬 電気の通り道</h3><div class="science-spotlight">'+(selected?Art.material(selected.id):Art.bulb(false))+'</div><div class="test-light'+(selected&&tried.includes(selected.id)&&selected.conductive?' on':'')+'">'+(selected&&tried.includes(selected.id)&&selected.conductive?'💡':'◯')+'</div><p class="test-caption">'+(selected&&tried.includes(selected.id)?selected.conductive?"電気を通した！ 豆電球が点灯。":"電気を通さない。豆電球は消えたまま。":"材料を選んで通電チェック！")+'</p><div class="lab-reading">実験済み：'+tried.length+' / 4<br>'+tried.map(t=>{let x=materials.find(z=>z.id===t);return x.name+"："+(x.conductive?"点灯":"消灯")}).join(" ／ ")+'</div></div></div>';
}
function repairParts(){return current().id===6?[{id:"battery",name:"乾電池",broken:false,detail:"1.5V・残量あり。問題なし。"},{id:"wire",name:"導線のつなぎ目",broken:true,detail:"接触がはずれている！"},{id:"bulb",name:"豆電球",broken:false,detail:"フィラメントは切れていない。"}]:[{id:"wire",name:"導線",broken:true,detail:"途中で切れていた！"},{id:"bulb",name:"豆電球の接点",broken:true,detail:"底が端子に触れていない！"},{id:"battery",name:"乾電池",broken:false,detail:"十分な電気がある。"}];}
function renderRepair(){
 let p=repairParts(),fixedCount=p.filter(x=>ui.fixed.includes(x.id)).length;
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🔧 回路を調査しよう</h3><div class="science-spotlight">'+Art.bulb(fixedCount===p.filter(x=>x.broken).length)+'</div><p class="lab-reading">発見した故障：'+p.filter(x=>x.broken&&ui.inspected.includes(x.id)).length+' / '+p.filter(x=>x.broken).length+'　修理済み：'+fixedCount+' / '+p.filter(x=>x.broken).length+'</p></div>'
 +'<div class="lab-panel"><h3>🛠 故障チェック</h3><p class="lab-sub">まず「調べる」で状態を確認してね。</p><div class="repair-list">'+p.map(x=>'<div class="repair-card"><div><strong>'+x.name+'</strong><small>'+(!ui.inspected.includes(x.id)?"？ 未調査":ui.fixed.includes(x.id)?"✓ 修理完了":x.detail)+'</small></div><div class="repair-buttons"><button data-inspect="'+x.id+'">調べる</button>'+(x.broken&&ui.inspected.includes(x.id)&&!ui.fixed.includes(x.id)?'<button class="repair-now" data-fix="'+x.id+'">修理する</button>':'')+'</div></div>').join("")+'</div></div></div>';
}
function renderLogic(){
 const k=ui.a?"1":"0",l=ui.b?"1":"0",lit=ui.design==="series"?(ui.a&&ui.b):(ui.a||ui.b);
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🔌 回路を組み立てよう</h3><div class="toggle-row"><button class="toggle'+(ui.design==="series"?' on':'')+'" data-design="series" aria-pressed="'+(ui.design==="series")+'">直列</button><button class="toggle'+(ui.design==="parallel"?' on':'')+'" data-design="parallel" aria-pressed="'+(ui.design==="parallel")+'">並列</button></div>'+Art.circuit(ui.design,ui.a,ui.b)+'<div class="toggle-row"><button class="toggle'+(ui.a?' on':'')+'" data-switch="a">スイッチ A：'+(ui.a?"ON":"OFF")+'</button><button class="toggle'+(ui.b?' on':'')+'" data-switch="b">スイッチ B：'+(ui.b?"ON":"OFF")+'</button></div></div>'
 +'<div class="lab-panel"><h3>📊 実験記録</h3><p class="lab-sub">それぞれの組み合わせで「電気を流してみる」を押そう。</p><div class="light-status">'+(lit?"💡 点灯":"◯ 消灯")+'</div><table class="truth-table"><thead><tr><th>A</th><th>B</th><th>実験結果</th></tr></thead><tbody>'+[["0","0"],["0","1"],["1","0"],["1","1"]].map(([x,y])=>{let result=ui.trials[x+y];return'<tr><td>'+(x==="1"?"ON":"OFF")+'</td><td>'+(y==="1"?"ON":"OFF")+'</td><td>'+(result===undefined?"？":result?"💡 点灯":"○ 消灯")+'</td></tr>'}).join("")+'</tbody></table><p class="lab-reading">試した組み合わせ：'+Object.keys(ui.trials).length+' / 4</p></div></div>';
}
function batteryOptions(){return current().id===9?[{id:"small",name:"単4形（1.5V）",kind:"small"},{id:"large",name:"単1形（1.5V）",kind:"large"}]:[{id:"single",name:"乾電池1個（1.5V）",kind:"small"},{id:"series",name:"2個を直列（3V）",kind:"series"}]}
function renderBattery(){
 let opts=batteryOptions(),selected=opts.find(x=>x.id===ui.selected),done=opts.every(x=>ui.tried.includes(x.id));
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🔋 電池を入れ替えて実験</h3><div class="choices two">'+opts.map(x=>choice(x.id,x.name,Art.battery(x.kind),ui.selected===x.id,ui.tried.includes(x.id)?"tried":"")).join("")+'</div><p class="lab-reading">実験済み：'+ui.tried.length+' / 2</p></div><div class="lab-panel"><h3>💡 光り方を観察</h3><div class="science-spotlight">'+Art.bulb(ui.selected&&ui.tried.includes(ui.selected))+'</div><p class="test-caption">'+(selected&&ui.tried.includes(selected.id)?(current().id===10&&selected.id==="series"?"1個のときより明るい！（対応する豆電球の場合）":"点灯した！ 公称電圧は1.5V。"):"電池を選んで通電しよう")+'</p>'
 +(done?'<div class="answer-area"><strong>調べてわかったことは？</strong>'+((current().id===9)?[['correct',"大きさだけで明るさは決まらない"],['wrong',"大きい乾電池ほど必ず明るい"]]:[['correct',"2個直列で電圧が大きくなり、明るくなることがある"],['wrong',"2個直列にしても必ず同じ明るさ"]]).map(x=>'<button class="answer-option'+(ui.answer===x[0]?' chosen':'')+'" data-answer="'+x[0]+'">'+x[1]+'</button>').join("")+'</div>':'<p class="lab-reading">まず2つとも試そう。</p>')+'</div></div>';
}
function renderPolarity(){
 let opts=[{id:"same",name:"2個を同じ向き"},{id:"reverse",name:"2個を逆向き"}],done=opts.every(x=>ui.tried.includes(x.id));
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🔋 乾電池の向きを変えよう</h3><div class="choices two">'+opts.map(x=>choice(x.id,x.name,Art.battery(x.id==="same"?"series":"reverse"),ui.selected===x.id,ui.tried.includes(x.id)?"tried":"")).join("")+'</div><p class="lab-reading">実験済み：'+ui.tried.length+' / 2</p></div><div class="lab-panel"><h3>💡 光り方を観察</h3><div class="science-spotlight">'+Art.bulb(ui.selected==="same"&&ui.tried.includes(ui.selected))+'</div><p class="test-caption">'+(ui.selected&&ui.tried.includes(ui.selected)?ui.selected==="same"?"2個を同じ向きに直列：点灯！":"2個を逆向きに直列：消灯":"乾電池を選んで実験しよう")+'</p>'
 +(done?'<div class="answer-area"><strong>どちらの向きが光った？</strong><button class="answer-option'+(ui.answer==="same"?" chosen":"")+'" data-answer="same">同じ向き</button><button class="answer-option'+(ui.answer==="reverse"?" chosen":"")+'" data-answer="reverse">逆向き</button></div>':'')+'</div></div>';
}
function renderCut(){
 return'<div class="experiment-layout"><div class="lab-panel"><h3>⚠ 危険な導線を発見！</h3>'+Art.shortDiagram()+'<p class="lab-reading">赤い導線がショートの原因。実物の乾電池では絶対に試さないでね。</p></div><div class="lab-panel"><h3>✂ 外す導線を選ぼう</h3><p class="lab-sub">押すと外す／戻すを切り替えられるよ。</p>'+[["normal","通常の導線（電池→豆電球）"],["x","危険な赤い近道 X"],["y","危険な赤い近道 Y"]].map(([id,label])=>'<button class="cut-wire'+(ui.removed.includes(id)?' removed':'')+'" data-cut="'+id+'" aria-pressed="'+ui.removed.includes(id)+'"><span>'+label+'</span><strong>'+(ui.removed.includes(id)?"外した ✓":"接続中")+'</strong></button>').join("")+'<p class="lab-reading">外した導線：'+ui.removed.length+' 本</p></div></div>';
}
function renderFinale(){
 const opts=[["direction","乾電池2個の向き",[["reverse","逆向き"],["same","同じ向き"]]],["material","すき間にはさむ材料",[["wood","木の棒"],["clip","鉄のクリップ"]]],["contact","豆電球の接点",[[false,"はずれたまま"],[true,"底と横をしっかり接続"]]]];
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🌟 灯台の最終修理</h3><div class="science-spotlight">'+Art.battery(ui.direction==="same"?"series":"reverse")+'</div><div class="science-spotlight">'+Art.bulb(stageComplete)+'</div></div><div class="lab-panel"><h3>🛠 3つのチェック</h3>'+opts.map(([key,title,options])=>'<div class="final-question"><strong>'+title+'</strong><div class="toggle-row">'+options.map(([value,label])=>'<button class="toggle'+(ui[key]===value?' on':'')+'" data-final="'+key+'" data-value="'+String(value)+'" aria-pressed="'+(ui[key]===value)+'">'+label+'</button>').join("")+'</div></div>').join("")+'</div></div>';
}
function renderWorkspace(){
 const mode=current().mode;
 $("workspace").innerHTML=mode==="wire"?renderWire():mode==="explore"?renderExplore():mode==="material"?renderMaterial():mode==="repair"?renderRepair():mode==="logic"?renderLogic():mode==="battery"?renderBattery():mode==="polarity"?renderPolarity():mode==="cut"?renderCut():renderFinale();
}
function renderAll(){renderMenu();renderScene();renderHeader();renderWorkspace();if(!stageComplete){$("discovery").hidden=true;setFeedback("✦ いろいろ試してみよう！");}}
function check(){
 if(stageComplete)return;const m=current();
 if(m.mode==="wire"){const s=circuitStatus(ui.wires);if(s.short){fail("⚠ ショート！ 豆電球を通らず＋と−がつながっています。実物では絶対にまねしないでね。",true);return;}if(s.lit){success();return;}fail("まだ回路がつながっていないよ。電気が豆電球を通って電池に戻る道をつくろう。");return;}
 if(m.mode==="explore"){if(ui.inspected.length<3){fail("橋の材料を3種類とも観察してから決めよう。");return;}if(ui.chosen==="iron"){success();return;}fail("その材料では電気が通りにくいよ。金属の材料を選んでみよう。");return;}
 if(m.mode==="material"){if(!ui.selected){setFeedback("まず実験する材料を選んでね。","warning");return;}let x=materials.find(x=>x.id===ui.selected);if(!ui.tried.includes(x.id))ui.tried.push(x.id);renderWorkspace();let conductor=ui.tried.filter(t=>materials.find(x=>x.id===t).conductive).length,insulator=ui.tried.length-conductor;
 if(m.target==="conductor"?conductor>=2&&insulator>=1:insulator>=2&&conductor>=1){success();return;}setFeedback(x.name+"："+(x.conductive?"電気を通して光った！":"電気を通さず光らなかった。")+" ほかの材料とも比べてみよう。",x.conductive?"success":"");return;}
 if(m.mode==="repair"){const broken=repairParts().filter(x=>x.broken);if(broken.every(x=>ui.fixed.includes(x.id))){success();return;}fail("まだ直っていない場所があるよ。部品を一つずつ調べよう。");return;}
 if(m.mode==="logic"){const code=(ui.a?"1":"0")+(ui.b?"1":"0");ui.trials[code]=ui.design==="series"?(ui.a&&ui.b):(ui.a||ui.b);renderWorkspace();
 if(Object.keys(ui.trials).length===4){if(ui.design===m.target){success();return;}fail("4通りの結果を見よう。今回の条件に合う回路は、もう一方のつなぎ方だよ。");return;}setFeedback("記録したよ！ 残り "+(4-Object.keys(ui.trials).length)+" 通りのスイッチを試そう。","success");return;}
 if(m.mode==="battery"||m.mode==="polarity"){if(!ui.selected){setFeedback("まず乾電池を選んでね。","warning");return;}if(!ui.tried.includes(ui.selected)){ui.tried.push(ui.selected);renderWorkspace();setFeedback("実験結果を記録したよ。もう一方も試そう！","success");return;}if(ui.tried.length<2){setFeedback("もう一方も実験して比べてみよう。","warning");return;}if(ui.answer==null){setFeedback("実験結果を見比べて、右側の答えを選ぼう。","warning");return;}if((m.mode==="battery"&&ui.answer==="correct")||(m.mode==="polarity"&&ui.answer==="same")){success();return;}fail("結果をもう一度比べてみよう。");return;}
 if(m.mode==="cut"){if(ui.removed.includes("x")&&ui.removed.includes("y")&&!ui.removed.includes("normal")){success();return;}if(!ui.removed.includes("x")||!ui.removed.includes("y")){fail("⚠ ショートする近道がまだ残っているよ。実物ではとても危険！",true);return;}fail("必要な導線まで外してしまった。豆電球につながる道は残そう。");return;}
 if(m.mode==="finale"){if(ui.direction==="same"&&ui.material==="clip"&&ui.contact){success();return;}fail("あと少し！ 電池の向き・電気を通す材料・豆電球の接点を調べてみよう。");return;}
}
function handleWorkspace(e){
 const target=e.target.closest("button");if(!target||stageComplete)return;
 if(target.hasAttribute("data-t")){const t=target.dataset.t;if(ui.selected===null){ui.selected=t;setFeedback(labels[t]+"を選んだよ。次につなぐ端子を選ぼう。");}
 else if(ui.selected===t){ui.selected=null;setFeedback("端子の選択を解除したよ。");}
 else{const a=ui.selected,b=t;ui.selected=null;if(!ui.wires.some(pair=>edgeKey(...pair)===edgeKey(a,b))){ui.wires.push([a,b]);const circuit=circuitStatus(ui.wires);if(circuit.short){fail("⚠ 直接つながるとショート！ 実物では危険です。導線を外してね。",true);}else{setFeedback(labels[a]+" と "+labels[b]+"をつないだよ。");}}else setFeedback("その2つはもうつながっているよ。");}
 renderWorkspace();return;}
 if(target.hasAttribute("data-unwire")){ui.wires.splice(+target.dataset.unwire,1);ui.selected=null;renderWorkspace();setFeedback("導線を外したよ。");return;}
 if(target.hasAttribute("data-choice")){const id=target.dataset.choice;ui.selected!==undefined&&(ui.selected=id);
 if(current().mode==="explore"){ui.chosen=id;if(!ui.inspected.includes(id))ui.inspected.push(id);const x=inspectedItems.find(x=>x.id===id);setFeedback("🔎 "+x.description);}
 else{setFeedback("「"+(materials.find(x=>x.id===id)?.name||batteryOptions().find(x=>x.id===id)?.name||({same:"2個を同じ向き",reverse:"2個を逆向き"}[id])||id)+"」をセットしたよ。通電チェックしてみよう。");}
 renderWorkspace();return;}
 if(target.hasAttribute("data-inspect")){let id=target.dataset.inspect;if(!ui.inspected.includes(id))ui.inspected.push(id);let part=repairParts().find(x=>x.id===id);setFeedback(part.name+"："+part.detail,part.broken?"warning":"");renderWorkspace();return;}
 if(target.hasAttribute("data-fix")){let id=target.dataset.fix;if(!ui.fixed.includes(id))ui.fixed.push(id);setFeedback("🔧 修理完了！ ほかにも故障がないか調べよう。","success");renderWorkspace();return;}
 if(target.hasAttribute("data-design")){ui.design=target.dataset.design;ui.trials={};renderWorkspace();setFeedback("回路を"+(ui.design==="series"?"直列":"並列")+"に組み替えたよ。4通りを試そう。");return;}
 if(target.hasAttribute("data-switch")){const key=target.dataset.switch;ui[key]=!ui[key];renderWorkspace();setFeedback("スイッチを切り替えたよ。通電して記録しよう。");return;}
 if(target.hasAttribute("data-answer")){ui.answer=target.dataset.answer;renderWorkspace();setFeedback("答えを選んだよ。通電チェックで確かめよう。");return;}
 if(target.hasAttribute("data-cut")){let key=target.dataset.cut;if(ui.removed.includes(key))ui.removed=ui.removed.filter(x=>x!==key);else ui.removed.push(key);renderWorkspace();setFeedback(key==="normal"?"正常な導線まで外すと電気が流れないよ。":"選んだ導線を外したよ。2本の近道を確認しよう。",key==="normal"?"warning":"");return;}
 if(target.hasAttribute("data-final")){const key=target.dataset.final,raw=target.dataset.value;ui[key]=key==="contact"?raw==="true":raw;renderWorkspace();setFeedback("設定を変更したよ。3つの箇所を確認しよう。");}
}
function modal(open){const box=$("helpModal");box.hidden=!open;if(open){helpReturnFocus=document.activeElement;$("closeHelpBtn").focus();}else if(helpReturnFocus&&typeof helpReturnFocus.focus==="function")helpReturnFocus.focus();}
function bind(){
 $("missionList").addEventListener("click",e=>{const b=e.target.closest("[data-mission]");if(b)changeMission(+b.dataset.mission)});
 $("workspace").addEventListener("click",handleWorkspace);
 $("checkBtn").addEventListener("click",check);
 $("nextBtn").addEventListener("click",()=>changeMission(Math.min(14,state.active+1)));
 $("resetBtn").addEventListener("click",()=>{ui=initial(current());stageComplete=false;hintIndex=0;failures=0;renderAll()});
 $("hintBtn").addEventListener("click",()=>{if(stageComplete)return;const h=current().hints;setFeedback("💡 "+h[Math.min(hintIndex,h.length-1)],"success");hintIndex=Math.min(hintIndex+1,h.length)});
 $("mapToggle").addEventListener("click",()=>{const s=$("sidebar"),open=s.classList.toggle("open");$("mapToggle").setAttribute("aria-expanded",String(open));$("mapToggle").textContent=open?"閉じる ▴":"開く ▾"});
 $("soundBtn").addEventListener("click",()=>{state.sound=!state.sound;persist();renderHeader();playTone(true)});
 $("helpBtn").addEventListener("click",()=>modal(true));
 $("closeHelpBtn").addEventListener("click",()=>modal(false));
 $("closeHelpSecondary").addEventListener("click",()=>modal(false));
 $("helpModal").addEventListener("click",e=>{if(e.target===$("helpModal"))modal(false)});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("helpModal").hidden)modal(false);if(e.key==="Tab"&&!$("helpModal").hidden){const focusable=[...$("helpModal").querySelectorAll("button")],first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
}
function boot(){ui=initial(current());bind();persist();renderAll();window.scrollTo(0,0);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();