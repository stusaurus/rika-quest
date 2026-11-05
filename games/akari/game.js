"use strict";
(function(){
const Art=window.AkariArt||{};
const M=[
{id:1,name:"はじめてのひかり",place:"village",placeName:"ひかりの村",mode:"wire",goal:"小屋のあかりをつけよう",story:"村の小屋がまっくらだ。乾電池と豆電球をつないで、はじめてのひかりをともそう。",instructions:"乾電池の＋と−を、豆電球の金属の横部分・底の接点につなごう。端子を2つ順番にタップすると導線を引けるよ。",discovery:"豆電球は、乾電池の＋極と−極が豆電球を通る1つの輪でつながると光る。電気の通り道を「回路」というよ。",hints:["豆電球には電気が出入りする2つの接点があるよ。","＋から豆電球の金属の横部分へ、−から底の接点へ。2本つなごう。"]},
{id:2,name:"切れた通り道",place:"village",placeName:"ひかりの村",mode:"wire",prefill:[["P","L"]],goal:"消えた街灯を直そう",story:"さっきまで明るかった街灯が消えちゃった。1本の導線がはずれているみたい。",instructions:"すでにつながっている導線を観察して、足りない1本をつなごう。",discovery:"回路にすき間があると電気が流れず、豆電球はつかない。1か所でも切れていると点灯しないんだ。",hints:["すでに＋極と豆電球はつながっているよ。","−極と、まだつながっていない底の接点をつなごう。"]},
{id:3,name:"橋の材料さがし",place:"bridge",placeName:"こもれび橋",mode:"explore",goal:"橋を調べて修理しよう",story:"橋のあかりが消えた！代わりの材料を探して通り道をつなごう。",instructions:"橋の3か所を調査。材料を予想して仮想実験し、電気の通り道にある2つのすき間を自分で修理して、なぜ光ったか説明しよう。",discovery:"電球の横と底の接点を通り、乾電池の＋と−が閉じた輪になると点灯する。途中に木やプラスチックのような不導体が入ると通り道が途切れる。",hints:["電気が通るかは材料によって違うよ。実験の記録を比べてみよう。","2か所のすき間のどちらも、電気を通すものをはさみ、＋から−へ戻る輪を作ろう。"]},
{id:4,name:"庭の実験工房",place:"garden",placeName:"ふしぎな庭",mode:"material",target:"conductor",goal:"電気を通すものを2つ見つけよう",story:"庭師さんが材料を集めてきた。豆電球を使って、どれが電気を通すのか実験しよう。",instructions:"同じクリップで接点の条件を変えたらどうなる？基準実験から始め、条件をそろえて材料を比べ、電気を通す性質を説明しよう。",discovery:"同じ金属でも接点が離れると消灯する。接点条件をそろえて比べると、鉄やアルミニウムは電気を通し、乾いた木やプラスチックは通しにくいとわかる。",hints:["最初は材料を変えず、同じクリップの接点だけを変えてみよう。","材料を比べるときは接点を両方しっかり合わせて、条件をそろえよう。"]},
{id:5,name:"にせものの金属",place:"garden",placeName:"ふしぎな庭",mode:"material",target:"insulator",goal:"電気を通さないものを見つけよう",story:"ぴかぴかの材料は全部電気を通す？ 見た目にだまされないで調べてみよう。",instructions:"見た目が似た4材料を仮想実験で見分け、電気を通す修理部品1つ・電気を通しにくい仕切り2つを選び、ショートせず点灯する設備を完成させよう。",discovery:"主回路では導体を使うと豆電球に電気が流れる。一方、乾電池の＋と−を隔てる仕切りは不導体が適している。金属が両極をつなぐとショートし危険。",hints:["豆電球に電気を通す部分と、電池の＋と−が直接触れるのを防ぐ部分では必要な材料が違うよ。","主回路には金属、むき出しの2極の間には木やプラスチックなど電気を通しにくい材料を考えよう。"]},
{id:6,name:"時計塔の故障調査",place:"tower",placeName:"古時計の塔",mode:"repair",goal:"故障した回路を修理しよう",story:"時計塔の時計が暗くて読めない。点灯しない理由を、部品を調べて探そう。",instructions:"3つの部品を調査して原因を推理。修理後は自分で回路を作り、点灯を実験して＋極から−極までの道をたどろう。",discovery:"電球がつかないとき、すぐに乾電池のせいと決めつけず、接点や導線を1か所ずつ調べると原因がわかる。",hints:["故障は乾電池とは限らないよ。","3つの部品の観察結果を比較し、異常のあるものを考えよう。"]},
{id:7,name:"ふたつの合図",place:"tower",placeName:"古時計の塔",mode:"logic",target:"series",goal:"両方押したときだけ点灯する回路",story:"時計塔の扉には2つのスイッチがある。両方ONのときだけ明かりをつけたいんだ。",instructions:"直列・並列の違いを4通りで調べよう。次は自分で導線を引き、両方ONのときだけ点灯する回路を作ろう。",discovery:"スイッチを直列につなぐと、両方閉じたときだけ回路がつながる。「両方」が必要なんだね。",hints:["1つでもスイッチが開くと電気が止まる回路はどっち？","スイッチが1つ開いていても電流が通れる、別の道はあるかな？"]},
{id:8,name:"どちらかの合図",place:"port",placeName:"月あかり港",mode:"logic",target:"parallel",goal:"どちらかで点灯する回路",story:"港の灯りは、船着き場からでも倉庫からでもつけたい。スイッチAかB、どちらかがONなら点灯させよう。",instructions:"4通りの点灯・消灯を比べたら、自分で導線をつないで、どちらかONなら点灯する回路を設計しよう。",discovery:"スイッチを並列につなぐと、どちらか一方が閉じていれば電気の通り道ができる。",hints:["電気の通り道が2つに分かれるとどうなる？","1本の通り道が閉じても、もう1本が使えるつなぎ方を考えよう。"]},
{id:9,name:"乾電池の大きさ",place:"port",placeName:"月あかり港",mode:"battery",goal:"大きさと明るさを比べよう",story:"港の電池屋さんから質問！ 大きな乾電池なら必ず明るくなるのかな？",instructions:"単4形・単1形の点灯直後と長時間後を予想して比較。4条件の結果から、港の非常用灯に使う乾電池と理由を決めよう。",discovery:"同じ種類の新品単4形・単1形は公称電圧1.5V。大きさだけで最初の明るさは決まらない。容量・使い方が持続時間を左右する。",hints:["乾電池に書かれた1.5Vという数字を見てみよう。","単4形も単1形も公称電圧は1.5V。大きいから必ず明るいわけではないよ。"]},
{id:10,name:"ふたつの力",place:"museum",placeName:"ひかり博物館",mode:"battery",goal:"直列つなぎの効果を比べよう",story:"博物館の展示には乾電池を2個使う装置がある。1個のときとの違いを調べよう。",instructions:"1個・2個直列の乾電池と、1.5V用・3V用の豆電球を組み合わせて予想・仮想実験。安全な展示用電源を設計しよう。",discovery:"同種の1.5V乾電池を同じ向きで2個直列につなぐと約3V。豆電球の定格に合わせる必要があり、定格超過は危険。",hints:["2個の乾電池を同じ向きに直列につなぐと、電圧が足し合わされるよ。","この装置では2個直列のほうが明るい設定だよ。"]},
{id:11,name:"電池の向きのひみつ",place:"museum",placeName:"ひかり博物館",mode:"polarity",goal:"乾電池の向きを調べよう",story:"展示の電池を入れ直したら、急に消えちゃった。向きは大切なのかな？",instructions:"電池1個・2個直列の向きを変える4通りを予想して実験。1個を逆向きにした場合と2個を互いに逆向きにした場合を区別して復旧しよう。",discovery:"普通の豆電球は乾電池1個の向きを逆にしても光る。同じ乾電池2個を互いに逆向きに直列につなぐと電圧が打ち消し合い、光らない。",hints:["電池1個の向きではなく、2個の向きの組み合わせだよ。","2個を同じ向きに直列につなぐと電圧が足し合わされるよ。"]},
{id:12,name:"危険な近道",place:"port",placeName:"月あかり港",mode:"cut",goal:"安全に電気が流れる道を残そう",story:"船の作業灯に危険な近道が2本！ 電気が豆電球を通らず、電池が熱くなりそう。",instructions:"3か所の回路図を安全点検。外す導線を選び、ショート・点灯・消灯を予測して仮想実験し、最少の修理で豆電球の輪を残そう。",discovery:"豆電球を通らず、乾電池の＋と−がほぼ直接つながるとショート。大きな電流が流れ発熱・発火の危険がある。実物では絶対に試さないでね。",hints:["豆電球を通っていない『近道』を探そう。","豆電球を通らず乾電池へ戻る線と、豆電球へ向かう線を区別してみよう。"]},
{id:13,name:"灯台の二重故障",place:"lighthouse",placeName:"星あかり灯台",mode:"repair",goal:"2つの故障を見つけよう",story:"灯台が消えて船が帰れない。1か所直しても点灯しないみたい。",instructions:"電池・導線・豆電球内部・接点を別々に予想・仮想検査。証拠から1か所を修理→再通電→消灯の原因を推理→2か所目を修理して点灯させよう。",discovery:"電池や豆電球が正常でも、導線や接点が2か所同時に切れていることがある。1か所直しただけでは回路が閉じず、豆電球は光らない。検査結果から順序よく原因を絞り込もう。",hints:["全体の消灯だけで原因は決められない。電源・導線・フィラメント・接点をそれぞれ安全な仮想検査で確かめよう。","1か所を直しても消灯するなら、乾電池の＋から豆電球を通り−まで戻る道のどこが切れているか、残りの検査記録を見直そう。"]},
{id:14,name:"ひかりを取り戻せ！",place:"lighthouse",placeName:"星あかり灯台",mode:"finale",goal:"最終ミッション！ 灯台をともそう",story:"最後の夜。乾電池、材料、豆電球の3つに問題が！ ここまでの発見を使って灯台を救おう。",instructions:"3か所×2条件の合計6つの仮想実験で違いを確かめ、実験済みの部品を取り付けて灯台全体を予想・通電。根拠を説明したら最後の応用へ進もう。",discovery:"乾電池の向き・導体の性質・豆電球の2つの金属接点を実験で確かめ、3つを組み合わせて閉じた回路にすると、灯台に明かりがともる。",hints:["電源・材料・接点をすべて確認してみよう。","電源のつなぎ方、すき間の材料、豆電球の2つの金属接点をそれぞれ確かめよう。"]}
];
const $=id=>document.getElementById(id), storageKey="rika-akari-quest-v2";
let state=readSave(),ui={},stageComplete=false,hintIndex=0,failures=0,helpReturnFocus=null,soundCtx=null;
let reactionToken=0,celebrationToken=0,restorationToken=0;
const readingKey="rika-akari-reading-v1";
let detailMode=false;
try{detailMode=localStorage.getItem(readingKey)==="full";}catch(e){}
const yomiKey="rika-akari-yomi-v1";
let allYomi=false,activeSpeech=null,spokenTask="";
try{allYomi=localStorage.getItem(yomiKey)==="all";}catch(e){}
function voiceAvailable(){
 return typeof window.speechSynthesis?.speak==="function"&&typeof window.SpeechSynthesisUtterance==="function";
}
function updateSpeechButton(){
 const b=$("readTaskBtn");if(!b)return;
 b.hidden=!voiceAvailable();
 b.textContent=activeSpeech?"⏹ とめる":"🔊 よんで";
 b.setAttribute("aria-pressed",String(!!activeSpeech));
}
function stopReadingTask(){
 const spoken=activeSpeech;activeSpeech=null;spokenTask="";
 if(spoken&&typeof window.speechSynthesis?.cancel==="function"){
  try{window.speechSynthesis.cancel();}catch(e){}
 }
 updateSpeechButton();
}
function speakReadingTask(){
 if(!voiceAvailable()){setFeedback("この たんまつでは よみあげが できないよ。","warning");return;}
 if(activeSpeech){stopReadingTask();return;}
 const text=readingTask();if(!text)return;
 const u=new window.SpeechSynthesisUtterance(text);
 u.lang="ja-JP";u.rate=.87;u.pitch=1;
 u.onend=()=>{if(activeSpeech===u){activeSpeech=null;spokenTask="";updateSpeechButton();}};
 u.onerror=()=>{if(activeSpeech===u){activeSpeech=null;spokenTask="";updateSpeechButton();setFeedback("よみあげが できなかったよ。もじを みてね。","warning");}};
 activeSpeech=u;spokenTask=text;updateSpeechButton();
 try{window.speechSynthesis.cancel?.();window.speechSynthesis.speak(u);}
 catch(e){activeSpeech=null;spokenTask="";updateSpeechButton();setFeedback("よみあげが できなかったよ。もじを みてね。","warning");}
}
function readingTask(){
 const m=current(),phase=window.AkariPacing?.status(m.id,ui,stageComplete).phase||1;
 return window.AkariReading?.prompt(m.id,phase,ui,stageComplete)||m.instructions;
}
function applyReading(){
 const m=current(),task=readingTask();
 if(activeSpeech&&spokenTask!==task)stopReadingTask();
 const intro=$("missionStory"),instructions=$("missionInstructions"),button=$("readingToggle");
 if(intro)intro.textContent=stageComplete?"やった！ あかりが もどった！":
   state.completed[m.id]?"もう一度 ためしてみよう！":
   detailMode?m.story:(window.AkariReading?.sample(m.id).story||m.story);
 if(instructions)instructions.textContent=detailMode?m.instructions:task;
 updateSpeechButton();
 if(button){button.textContent=detailMode?"🔎 みじかく":"📖 くわしく";button.setAttribute("aria-pressed",String(detailMode));}
 if(document.body?.classList){
  document.body.classList.toggle("reading-easy",!detailMode);
  document.body.classList.toggle("reading-full",detailMode);
  document.body.classList.toggle("furigana-all",allYomi);
 }
 const few=$("yomiEssentials"),all=$("yomiAll");
 if(few)few.setAttribute("aria-pressed",String(!allYomi));
 if(all)all.setAttribute("aria-pressed",String(allYomi));
}

const materials=[{id:"clip",name:"鉄のクリップ",conductive:true},{id:"foil",name:"アルミはく",conductive:true},{id:"wood",name:"乾いた木",conductive:false},{id:"plastic",name:"プラスチックの定規",conductive:false}];

function readSave(){try{const d=JSON.parse(localStorage.getItem(storageKey)||"null");if(d&&d.version===2&&d.completed&&typeof d.completed==="object")return{version:2,completed:d.completed,active:Math.min(14,Math.max(1,+d.active||1)),sound:!!d.sound,masteries:d.masteries&&typeof d.masteries==="object"&&!Array.isArray(d.masteries)?Object.fromEntries(Object.entries(d.masteries).filter(([key,value])=>[2,5,7,8,12,14].includes(+key)&&value===true)): {},drafts:d.drafts&&typeof d.drafts==="object"&&!Array.isArray(d.drafts)?Object.fromEntries(Object.entries(d.drafts).filter(([key,value])=>[2,5,7,8,12,14].includes(+key)&&value&&typeof value==="object"&&!Array.isArray(value))):{},builderDraft:d.builderDraft&&typeof d.builderDraft==="object"&&!Array.isArray(d.builderDraft)?d.builderDraft:null,practiceDraft:d.practiceDraft&&typeof d.practiceDraft==="object"&&!Array.isArray(d.practiceDraft)?d.practiceDraft:null,switchDrafts:d.switchDrafts&&typeof d.switchDrafts==="object"&&!Array.isArray(d.switchDrafts)?d.switchDrafts:{},finaleDraft:d.finaleDraft&&typeof d.finaleDraft==="object"&&!Array.isArray(d.finaleDraft)?d.finaleDraft:null,doubleFaultDraft:d.doubleFaultDraft&&typeof d.doubleFaultDraft==="object"&&!Array.isArray(d.doubleFaultDraft)?d.doubleFaultDraft:null,batteryDrafts:d.batteryDrafts&&typeof d.batteryDrafts==="object"&&!Array.isArray(d.batteryDrafts)?Object.fromEntries(Object.entries(d.batteryDrafts).filter(([key,value])=>[9,10,11].includes(+key)&&value&&typeof value==="object"&&!Array.isArray(value))):{},gardenDrafts:d.gardenDrafts&&typeof d.gardenDrafts==="object"&&!Array.isArray(d.gardenDrafts)?Object.fromEntries(Object.entries(d.gardenDrafts).filter(([key,val])=>[4,5].includes(+key)&&val&&typeof val==="object"&&!Array.isArray(val))):{},bridgeDraft:d.bridgeDraft&&typeof d.bridgeDraft==="object"&&!Array.isArray(d.bridgeDraft)?d.bridgeDraft:null,safetyDraft:d.safetyDraft&&typeof d.safetyDraft==="object"&&!Array.isArray(d.safetyDraft)?d.safetyDraft:null,notes:Array.isArray(d.notes)?d.notes.filter(n=>n&&Number.isInteger(n.mission)&&typeof n.key==="string"&&typeof n.text==="string").slice(-100):[]};}catch(e){}return{version:2,completed:{},active:1,sound:false,masteries:{},drafts:{},builderDraft:null,practiceDraft:null,switchDrafts:{},safetyDraft:null,bridgeDraft:null,gardenDrafts:{},batteryDrafts:{},doubleFaultDraft:null,finaleDraft:null,notes:[]};}
function current(){return M[state.active-1]}
function initial(m){switch(m.mode){case"wire":return{wires:(m.prefill||[]).map(a=>a.slice()),selected:null,zoomed:false};case"explore":return{bridge:window.AkariBridge?window.AkariBridge.initial():null};case"material":return{garden:window.AkariGarden?window.AkariGarden.initial(m.id):null};case"repair":return m.id===13?{doubleFault:window.AkariDoubleFault?window.AkariDoubleFault.initial():null}:{inspected:[],fixed:[],suspected:[],diagnosed:false};case"logic":return{design:"series",a:false,b:false,trials:{},conclusion:null};case"battery":case"polarity":return{batteryLab:window.AkariBatteryLab?window.AkariBatteryLab.initial(m.id):null};case"cut":return{safety:window.AkariSafety?window.AkariSafety.empty():null};default:return{finale:window.AkariFinaleLab?window.AkariFinaleLab.initial():null}}}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(e){}}
function saveSafetyDraft(){if(current().id===12&&ui.safety){state.safetyDraft=window.AkariSafety.restore(ui.safety);persist();}}
function clearSafetyDraft(){state.safetyDraft=null;persist();}
function saveBridgeDraft(){if(current().id===3&&ui.bridge&&window.AkariBridge){state.bridgeDraft=window.AkariBridge.normalize(ui.bridge);persist();}}
function clearBridgeDraft(){state.bridgeDraft=null;persist();}
function saveGardenDraft(){
 const id=current().id;
 if(![4,5].includes(id)||!window.AkariGarden||!ui.garden)return;
 state.gardenDrafts=state.gardenDrafts||{};
 state.gardenDrafts[id]=window.AkariGarden.normalize(id,ui.garden);
 persist();
}
function clearGardenDraft(id){
 if(state.gardenDrafts?.[id]){delete state.gardenDrafts[id];persist();}
}
function saveBatteryDraft(){
 const id=current().id;
 if(![9,10,11].includes(id)||!window.AkariBatteryLab||!ui.batteryLab)return;
 state.batteryDrafts=state.batteryDrafts||{};
 state.batteryDrafts[id]=window.AkariBatteryLab.normalize(id,ui.batteryLab);
 persist();
}
function clearBatteryDraft(id){
 if(state.batteryDrafts?.[id]){delete state.batteryDrafts[id];persist();}
}
function saveDoubleFaultDraft(){
 if(current().id!==13||!window.AkariDoubleFault||!ui.doubleFault)return;
 state.doubleFaultDraft=window.AkariDoubleFault.normalize(ui.doubleFault);persist();
}
function clearDoubleFaultDraft(){state.doubleFaultDraft=null;persist();}
function saveFinaleDraft(){
 if(current().id!==14||!window.AkariFinaleLab||!ui.finale)return;
 state.finaleDraft=window.AkariFinaleLab.normalize(ui.finale);persist();
}
function clearFinaleDraft(){state.finaleDraft=null;persist();}
function restoreMissionUI(m){
 const base=initial(m),puzzle=window.AkariTransfer?.get(m.id),draft=state.drafts?.[m.id];
 if(m.id===14&&window.AkariFinaleLab)base.finale=window.AkariFinaleLab.normalize(state.completed[14]?null:state.finaleDraft);
 if(m.id===3&&window.AkariBridge){base.bridge=window.AkariBridge.normalize(state.completed[3]?null:state.bridgeDraft);return base;}
 if(m.id===13&&window.AkariDoubleFault){base.doubleFault=window.AkariDoubleFault.normalize(state.completed[13]?null:state.doubleFaultDraft);return base;}
 if([9,10,11].includes(m.id)&&window.AkariBatteryLab){base.batteryLab=window.AkariBatteryLab.normalize(m.id,state.completed[m.id]?null:state.batteryDrafts?.[m.id]);return base;}
 if([4,5].includes(m.id)&&window.AkariGarden){
  base.garden=window.AkariGarden.normalize(m.id,state.completed[m.id]?null:state.gardenDrafts?.[m.id]);
  if(m.id!==5||state.completed[m.id]||!window.AkariGarden.canFinish(5,base.garden)||!draft)return base;
 }
 if(m.id===12&&!state.completed[m.id]&&window.AkariSafety){base.safety=window.AkariSafety.restore(state.safetyDraft);const finished=base.safety.index===2&&window.AkariSafety.canAdvance(base.safety)&&base.safety.reason===window.AkariSafety.correctReason;if(!finished||!draft)return base;}
 if([7,8].includes(m.id)&&!state.completed[m.id]&&state.switchDrafts?.[m.id]?.unlocked&&window.AkariSwitchLab){
  const B=window.AkariSwitchLab,raw=state.switchDrafts[m.id],wires=B.normalize(raw.wires),sig=B.signature(wires),trials={};
  for(const code of B.codes)if(raw.trials?.[code]?.signature===sig){
   trials[code]={...B.evaluate(wires,code[0]==="1",code[1]==="1"),signature:sig};
  }
  const code=String(Number(!!raw.a))+String(Number(!!raw.b));
  const insight=raw.insight?.signature===sig&&raw.insight?.code===code&&
   raw.insight?.kind===B.discrepancy(m.id,wires,!!raw.a,!!raw.b)?
   {signature:sig,code,kind:raw.insight.kind}:null;
  base.switchLab={wires,selected:null,a:!!raw.a,b:!!raw.b,trials,reason:["both","either"].includes(raw.reason)?raw.reason:null,insight};
  return base;
 }
 if(m.id===6&&!state.completed[m.id]&&state.practiceDraft?.unlocked&&window.AkariBuilder){
  const raw=state.practiceDraft,wires=window.AkariBuilder.normalize(raw.wires).filter(([a,b])=>![a,b].some(t=>t==="S"||t==="T"));
  const sig=window.AkariBuilder.signature(wires),test=raw.tests?.single;
  const savedTrace=window.AkariBuilder.traceStatus("direct",wires,raw.trace).valid&&Array.isArray(raw.trace)?raw.trace.slice():[];
  const insight=raw.insight?.mode==="single"&&raw.insight.signature===sig&&raw.insight.kind===window.AkariBuilder.diagnose("direct",wires,false)?
    {mode:"single",signature:sig,kind:raw.insight.kind}:null;
  base.builder={wires,selected:null,switchOn:false,tests:test?.signature===sig?{single:{...window.AkariBuilder.evaluate(wires,false),signature:sig}}:{},trace:savedTrace,insight};
  base.builderTask="direct";
  return base;
 }
 if(m.id===14&&!state.completed[m.id]&&state.masteries?.[14]&&window.AkariBuilder){
  const raw=state.builderDraft||{},wires=window.AkariBuilder.normalize(raw.wires),signature=window.AkariBuilder.signature(wires);
  const tests={};
  for(const mode of ["off","on"]){
   if(raw.tests?.[mode]?.signature===signature){
    tests[mode]={...window.AkariBuilder.evaluate(wires,mode==="on"),signature};
   }
  }
  const savedTrace=window.AkariBuilder.traceStatus("switch",wires,raw.trace).valid&&Array.isArray(raw.trace)?raw.trace.slice():[];
  const mode=raw.switchOn?"on":"off",issue=window.AkariBuilder.diagnose("switch",wires,!!raw.switchOn);
  const insight=raw.insight?.mode===mode&&raw.insight.signature===signature&&raw.insight.kind===issue?
    {mode,signature,kind:issue}:null;
  base.builder={wires,selected:null,switchOn:!!raw.switchOn,tests,trace:savedTrace,insight};
  return base;
 }
 if(!puzzle||!draft||state.completed[m.id])return base;
 const raw=draft.answers&&typeof draft.answers==="object"?draft.answers:{};
 const answers={};
 puzzle.probes.forEach(q=>{if(puzzle.choices.includes(raw[q.id]))answers[q.id]=raw[q.id]});
 const reason=puzzle.reasons.some(([key])=>key===draft.reason)?draft.reason:null;
 const step=Number.isInteger(draft.step)&&draft.step>=0&&draft.step<=3?draft.step:0;
 base.transfer={answers,reason,step:step===3&&Object.keys(answers).length<3?Object.keys(answers).length:step};
 return base;
}
function saveSwitchDraft(){
 if(!ui.switchLab)return;
 const B=window.AkariSwitchLab,l=ui.switchLab;
 state.switchDrafts=state.switchDrafts||{};
 state.switchDrafts[current().id]={unlocked:true,wires:B.normalize(l.wires),a:!!l.a,b:!!l.b,trials:{...l.trials},reason:l.reason,insight:l.insight||null};
 persist();
}
function clearSwitchDraft(id){
 if(state.switchDrafts?.[id]){delete state.switchDrafts[id];persist();}
}
function saveBuilderDraft(){
 if(!ui.builder)return;
 const {wires,switchOn,tests,trace,insight}=ui.builder;
 const raw={wires:window.AkariBuilder.normalize(wires),switchOn:!!switchOn,tests:{...tests},trace:Array.isArray(trace)?trace.slice():[],insight:insight||null};
 if(current().id===6)state.practiceDraft={...raw,unlocked:true};
 else state.builderDraft=raw;
 persist();
}
function clearBuilderDraft(){
 if(current().id===6){if(state.practiceDraft){state.practiceDraft=null;persist();}}
 else if(state.builderDraft){state.builderDraft=null;persist();}
}
function saveTransferDraft(){
 if(!ui.transfer)return;
 const id=current().id;
 state.drafts=state.drafts||{};
 state.drafts[id]={answers:{...ui.transfer.answers},reason:ui.transfer.reason,step:ui.transfer.step};
 persist();
}
function clearTransferDraft(id){
 if(state.drafts&&state.drafts[id]){delete state.drafts[id];persist();}
}


function recordObservation(key,description){
 const id=current().id;
 if(!state.notes.some(n=>n.mission===id&&n.key===key)){
 state.notes.push({mission:id,key,text:description});state.notes=state.notes.slice(-100);persist();if(!stageComplete)reactCharacter("discover");
 }
 renderJournal();
}
function renderJournal(){
 const panel=$("journalPanel");if(!panel||typeof panel.querySelector!=="function")return;
 const notes=state.notes.filter(n=>n.mission===current().id);
 const rows=panel.querySelector(".journal-rows"),counter=panel.querySelector(".journal-count");
 if(!rows||!counter)return;counter.textContent=notes.length+"件の記録";rows.replaceChildren();
 const entries=notes.length?notes.map(n=>n.text):["実験をすると、ここに発見が残るよ。"];
 entries.forEach(message=>{const p=document.createElement("p");p.className="journal-entry";p.textContent="✦ "+message;rows.appendChild(p)});
}
function unlocked(){let id=1;while(id<=14&&state.completed[id])id++;return Math.min(id,14)}
function changeMission(id){if(id>unlocked()&&!state.completed[id])return;stopReadingTask();state.active=id;ui=restoreMissionUI(current());hintIndex=0;failures=0;stageComplete=false;resetPresentation();persist();renderAll();reactCharacter("walk");window.scrollTo({top:0,behavior:"smooth"});}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function setFeedback(t,type=""){const e=$("feedback");e.className="feedback"+(type?" "+type:"");$("feedbackText").textContent=t;}
function playTone(ok){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;soundCtx=soundCtx||new C();const now=soundCtx.currentTime;(ok?[523,659,784,1046]:[220,175]).forEach((freq,i)=>{const oscillator=soundCtx.createOscillator(),gain=soundCtx.createGain(),start=now+i*.12;oscillator.type=ok?"sine":"triangle";oscillator.frequency.value=freq;oscillator.connect(gain);gain.connect(soundCtx.destination);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.065,start+.02);gain.gain.exponentialRampToValueAtTime(.0001,start+.22);oscillator.start(start);oscillator.stop(start+.23);});}catch(e){}}

function initializeCharacter(){
 const art=$("characterArt");
 if(art&&window.AkariCharacter)art.innerHTML=window.AkariCharacter.render();
 resetPresentation();
}
function resetPresentation(){
 reactionToken++;celebrationToken++;restorationToken++;
 const scene=$("storyScene"),trail=$("restorationTrail");
 if(scene)scene.classList.remove("energizing");
 if(trail)trail.hidden=true;
 const character=$("sceneCharacter"),bubble=$("characterSpeech"),victory=$("stageCelebration");
 if(character)character.dataset.mood="idle";
 if(bubble){bubble.hidden=true;bubble.textContent="";}
 if(victory){victory.hidden=true;victory.classList.remove("active");}
}
function reactCharacter(mood,text){
 const character=$("sceneCharacter"),bubble=$("characterSpeech");if(!character||!bubble)return;
 const known=window.AkariCharacter?.moods||["idle","inspect","discover","think","danger","celebrate"];
 if(!known.includes(mood))return;
 const token=++reactionToken;
 character.dataset.mood=mood;
 const spoken=text||(window.AkariCharacter?.message(mood)||"");
 bubble.textContent=spoken;bubble.hidden=!spoken||mood==="celebrate";
 if(mood==="idle"||mood==="celebrate")return;
 setTimeout(()=>{if(token===reactionToken){character.dataset.mood="idle";bubble.hidden=true;}},mood==="danger"?2300:mood==="walk"?940:1700);
}
function showCelebration(stars){
 const banner=$("stageCelebration");if(!banner)return;
 const token=++celebrationToken;
 const titles=[
  "小屋にあかりがともった！","街灯がふたたび光った！","橋のあかりが戻った！",
  "庭の工房が明るくなった！","材料のひみつを発見！","時計塔が動き出した！",
  "2つの合図に成功！","港のあかりをつけた！","乾電池のなぞを解いた！",
  "博物館の展示が光った！","乾電池の向きを解決！","危険な近道を取り除いた！",
  "灯台の故障を修理！","灯台の光が戻った！"
 ];
 $("celebrationTitle").textContent=titles[current().id-1]||"あかりがともった！";
 $("celebrationStars").textContent="★".repeat(stars);
 banner.hidden=false;banner.classList.remove("active");
 void banner.offsetWidth;banner.classList.add("active");
 setTimeout(()=>{if(token===celebrationToken){banner.hidden=true;banner.classList.remove("active");}},2800);
}
function startRestorationPulse(firstClear){
 const scene=$("storyScene"),trail=$("restorationTrail");
 if(!scene||!trail)return;
 const token=++restorationToken;
 scene.classList.remove("energizing");trail.hidden=true;
 if(!firstClear)return;
 void scene.offsetWidth;
 scene.classList.add("energizing");trail.hidden=false;
 setTimeout(()=>{
   if(token!==restorationToken)return;
   scene.classList.remove("energizing");trail.hidden=true;
 },1300);
}
function fail(message,short=false){failures++;setFeedback(message,"warning");reactCharacter(short?"danger":"think");playTone(false);if(short){const s=$("storyScene"),spark=$("spark");s.classList.add("shorted");spark.classList.remove("active");void spark.offsetWidth;spark.classList.add("active");window.AkariEffects?.shortCircuit?.();setTimeout(()=>{s.classList.remove("shorted");spark.classList.remove("active")},850);}}
function success(){
 if([7,8].includes(current().id)&&window.AkariSwitchLab&&!ui.switchLabPassed&&!state.completed[current().id]){
  if(!ui.switchLab){ui.switchLab={wires:[],selected:null,a:false,b:false,trials:{},reason:null,insight:null};saveSwitchDraft();}
  renderWorkspace();renderHeader();renderMenu();
  setFeedback("⚡ 新しい設計依頼！ 2つのスイッチを自分で配線して、4通りの結果を比べよう。","warning");
  reactCharacter("think","どうつなぐと条件どおりになるノン？");return;
 }
 const transfer=window.AkariTransfer?.get(current().id);
 if(transfer&&!ui.transferPassed&&!state.masteries?.[current().id]){
  if(!ui.transfer){ui.transfer={answers:{},reason:null,step:0};saveTransferDraft();}
  renderWorkspace();renderHeader();
  setFeedback("🚨 追加依頼！ 実験で見つけた法則を、別の3つの回路で使えるかな？","warning");
  reactCharacter("think","次の街灯も助けるノン！");
  return;
 }
 if(current().id===6&&window.AkariBuilder&&!ui.builderPassed){
  if(!ui.builder){ui.builder={wires:[],selected:null,switchOn:false,tests:{},trace:[],insight:null};ui.builderTask="direct";saveBuilderDraft();}
  renderWorkspace();renderHeader();renderMenu();
  setFeedback("🕰 時計塔の追加修理！ 乾電池と豆電球の端子を自分で配線して、実験で点灯を確かめよう。","warning");
  reactCharacter("think","電気の輪を作ってみるノン！");return;
 }
 if(current().id===14&&window.AkariBuilder&&!ui.builderPassed){
  if(!ui.builder){ui.builder={wires:[],selected:null,switchOn:false,tests:{},trace:[],insight:null};saveBuilderDraft();}
  renderWorkspace();renderHeader();renderMenu();
  setFeedback("🔧 最終の設計依頼！ 選択肢ではなく導線を自分でつなぎ、OFFとONの両方を確かめよう。","warning");
  reactCharacter("think","最後は自分で回路を作るノン！");return;
 }
 if(current().id===12)clearSafetyDraft();
 if([4,5].includes(current().id))clearGardenDraft(current().id);
 if([9,10,11].includes(current().id))clearBatteryDraft(current().id);
 if(current().id===13)clearDoubleFaultDraft();
 if(current().id===14)clearFinaleDraft();
 const firstClear=!state.completed[current().id];const stars=Math.max(1,3-(hintIndex?1:0)-(failures>=2?1:0));stageComplete=true;state.completed[current().id]=Math.max(stars,state.completed[current().id]||0);persist();renderAll();recordObservation("clear:"+current().id,current().discovery);setFeedback("✦ 大成功！ "+current().placeName+"にあかりが戻った！ ★"+stars+"つ獲得。"+(ui.transferPassed?" 🔍 応用の証 "+Object.keys(state.masteries).length+"/6":""),"success");reactCharacter("celebrate");showCelebration(stars);startRestorationPulse(firstClear);playTone(true);}
function icon(place){return{village:"🏡",bridge:"🌉",garden:"🌿",tower:"🕰",port:"⚓",museum:"🏛",lighthouse:"🌟"}[place]||"✦"}
function renderMenu(){
 $("missionList").innerHTML=M.map(m=>{let done=!!state.completed[m.id],allow=m.id<=unlocked()||done,active=m.id===state.active;return'<button type="button" class="mission-item'+(active?' current':'')+(done?' done':'')+'" data-mission="'+m.id+'" '+(!allow?'disabled':'')+' '+(active?'aria-current="step"':'')+'><span class="mission-index">'+(done?'★':allow?m.id:'🔒')+'</span><span class="mission-label"><strong>'+m.name+'</strong><small>'+icon(m.place)+' '+m.placeName+'</small></span></button>'}).join("");
 const lampMap=$("mapLights");
 if(lampMap)lampMap.innerHTML=M.map(m=>'<span class="map-lamp'+(state.completed[m.id]?' lit':'')+(m.id===state.active?' active':'')+'" title="'+m.id+'：'+escapeHtml(m.name)+'"><span></span></span>').join("");
 const count=Object.keys(state.completed).length;$("starCount").textContent=Object.values(state.completed).reduce((n,x)=>n+(+x||0),0);
 $("summaryNote").textContent=count===14?"すべてのあかりを取り戻した！ 14ミッションクリア！":count+" / 14 ミッションクリア。次のひみつを見つけよう！";
  const masteryCount=Object.keys(state.masteries||{}).length;const target=$("masteryCount");if(target)target.textContent=String(masteryCount);
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
 const m=current(),scene=$("storyScene");scene.dataset.place=m.place;scene.dataset.stage=m.id;$("litPlaceCount").textContent=Object.keys(state.completed).length;const props=$("sceneProps");if(props&&window.AkariScenes)props.innerHTML=window.AkariScenes.render(m.id);scene.classList.toggle("restored",stageComplete||!!state.completed[m.id]);scene.classList.toggle("bridge-powered",m.id===3&&!!window.AkariBridge?.sceneLit(ui.bridge));scene.classList.toggle("garden-powered",m.id===5&&!!window.AkariGarden?.measured5(ui.garden)&&!!window.AkariGarden?.evaluate5(ui.garden.slots).lit);scene.classList.toggle("finale-powered",m.id===14&&!!ui.finale?.overall&&ui.finale.overall.kind==="bright"&&ui.finale.overall.signature===window.AkariFinaleLab?.signature(ui.finale.installed));scene.classList.toggle("double-powered",m.id===13&&!!window.AkariDoubleFault?.canFinish(ui.doubleFault));$("placeLabel").textContent=m.placeName;$("missionTitle").textContent=m.name;$("missionStory").textContent=stageComplete?"ありがとう！この場所にあかりが戻ったよ！":state.completed[m.id]?"この場所には、前の冒険であかりをともしたよ。もう一度実験してみよう！":m.story;$("landmark").innerHTML='<svg viewBox="0 0 290 245" aria-hidden="true"><ellipse cx="147" cy="233" rx="125" ry="10" fill="#284a5a" opacity=".28"/>'+(window.AkariScenes&&window.AkariScenes.landmark?window.AkariScenes.landmark(m.place):buildings[m.place])+'</svg>';
}
function renderHeader(){
 const m=current();$("missionNumber").textContent="MISSION "+String(m.id).padStart(2,"0")+" / 14";$("missionGoal").textContent=m.goal;$("missionInstructions").textContent=m.instructions;
 $("questStars").textContent=stageComplete?"★ ".repeat(state.completed[m.id]||3):state.completed[m.id]?"★ "+state.completed[m.id]+"つ獲得済み":"☆ ☆ ☆";
 $("checkBtn").hidden=stageComplete||m.mode==="wire"||!!ui.transfer||!!ui.builder||!!ui.switchLab;$("checkBtn").textContent=m.id===12?"🛡 安全点検の最終確認":m.id===3?"🌉 橋の復旧を確認する":m.id===4?"🔬 研究結果を確かめる":m.id===5?"🛡 安全な修理を確認する":m.id===13?"🔎 灯台の復旧を確認する":m.id===14?"🌟 最終回路を確認する":[9,10,11].includes(m.id)?"🔋 点灯のしくみを確認":m.id<=2?"💡 つなぐと つくよ":"⚡ 電気を流してみる";$("nextBtn").hidden=!stageComplete||m.id===14;$("nextBtn").textContent="つぎへ すすむ ➜";$("hintBtn").hidden=stageComplete;
 $("discovery").hidden=!stageComplete;if(stageComplete)$("discoveryText").textContent=m.discovery;
 $("soundBtn").setAttribute("aria-pressed",String(state.sound));$("soundBtn").textContent=state.sound?"♫":"♪̸";
}
const pts={P:[42,151],N:[178,151],L:[268,152],R:[313,210]};const labels={P:"乾電池の＋極",N:"乾電池の−極",L:"豆電球の金属の横部分",R:"豆電球の底の接点"};
function edgeKey(a,b){return[a,b].sort().join("-");}
function circuitStatus(wires){
 const g={P:[],N:[],L:[],R:[]};wires.forEach(([a,b])=>{if(g[a]&&g[b]){g[a].push(b);g[b].push(a);}});
 function reachable(lamp){const x={P:g.P.slice(),N:g.N.slice(),L:g.L.slice(),R:g.R.slice()};if(lamp){x.L.push("R");x.R.push("L")}let seen=new Set(["P"]),stack=["P"];while(stack.length){let next=stack.pop();x[next].forEach(n=>{if(!seen.has(n)){seen.add(n);stack.push(n)}});}return seen.has("N");}
 const short=reachable(false);return{short,lit:!short&&reachable(true)};
}
function renderWire(){
 const stat=circuitStatus(ui.wires),lit=stageComplete||stat.lit;
 const svg=Art.workbench(ui.wires,lit);
 return'<div class="circuit-toolbar"><strong>⚡ 電気の通り道</strong><button type="button" class="circuit-zoom-btn" data-zoom="1" aria-pressed="'+!!ui.zoomed+'">'+(ui.zoomed?'🔍 全体を見る':'🔎 大きく見る')+'</button>'+(ui.zoomed?'<span class="circuit-quicknav"><button type="button" data-view="battery">◀ 乾電池</button><button type="button" data-view="bulb">豆電球 ▶</button></span>':'')+'</div><div class="circuit-board'+(lit?' is-lit':'')+(ui.zoomed?' zoomed':'')+'"><div class="circuit-inner">'+svg
 +Object.entries(pts).map(([t])=>'<button class="terminal'+(ui.selected===t?' selected':'')+'" data-t="'+t+'" aria-label="'+labels[t]+'" title="'+labels[t]+'">'+(t==="P"?"+":t==="N"?"−":t==="L"?"横":"底")+'</button>').join("")
 +'<div class="terminal-label label-p">＋極</div><div class="terminal-label label-n">−極</div><div class="terminal-label label-l">金属の横</div><div class="terminal-label label-r">底の接点</div></div>'
 +'<div class="wire-chip-list">'+ui.wires.map((p,i)=>'<button class="wire-chip" data-unwire="'+i+'" title="この導線を外す">'+(i+1)+'本目 ×</button>').join("")+'</div>'
 +'<div class="circuit-help">丸を2つタップして どう線をつなごう。外すときは「×」。</div></div><div class="circuit-legend"><span>🔋 <b>乾電池</b><small>＋極・−極</small></span><span>💡 <b>豆電球</b><small>金属の横・底の接点</small></span></div>';
}
function choice(id,label,picture,selected,extra=""){return'<button type="button" class="choice'+(selected?' chosen':'')+' '+extra+'" data-choice="'+id+'" aria-pressed="'+!!selected+'"><span class="choice-picture">'+picture+'</span><span>'+escapeHtml(label)+'</span></button>';}
function renderExplore(){return window.AkariBridge?window.AkariBridge.render(ui.bridge):'<p>橋の調査画面を読み込めませんでした。再読み込みしてください。</p>';}
function renderMaterial(){return window.AkariGarden?window.AkariGarden.render(current().id,ui.garden):'<div class="lab-panel">実験工房を読み込めませんでした。再読み込みしてください。</div>';}
function repairParts(){return current().id===6?[{id:"battery",name:"乾電池",broken:false,detail:"1.5V・残量あり。問題なし。"},{id:"wire",name:"導線のつなぎ目",broken:true,detail:"接触がはずれている！"},{id:"bulb",name:"豆電球",broken:false,detail:"フィラメントは切れていない。"}]:[{id:"wire",name:"導線",broken:true,detail:"途中で切れていた！"},{id:"bulb",name:"豆電球の接点",broken:true,detail:"底が端子に触れていない！"},{id:"battery",name:"乾電池",broken:false,detail:"十分な電気がある。"}];}
function renderRepair(){
 if(current().id===13)return window.AkariDoubleFault?window.AkariDoubleFault.render(ui.doubleFault):"<p>灯台の故障診断を読み込めませんでした。</p>";
 const parts=repairParts(),broken=parts.filter(x=>x.broken),fixedCount=parts.filter(x=>ui.fixed.includes(x.id)).length;
 const inspections=parts.filter(x=>ui.inspected.includes(x.id)).length;
 const diagnosed=!!ui.diagnosed;
 const cards=parts.map(x=>{
  const inspected=ui.inspected.includes(x.id),fixed=ui.fixed.includes(x.id),suspect=ui.suspected.includes(x.id);
  const observation=!inspected?"？ 未調査":fixed?"✓ 修理完了":x.detail;
  const action=diagnosed?(x.broken&&!fixed?'<button class="repair-now" data-fix="'+x.id+'">修理する</button>':''):
    (inspected?'<button class="suspect-btn'+(suspect?' chosen':'')+'" data-suspect="'+x.id+'" aria-pressed="'+suspect+'">'+(suspect?"原因に選んだ ✓":"故障の原因かも？")+'</button>':'');
  return'<div class="repair-card"><div><strong>'+x.name+'</strong><small>'+observation+'</small></div><div class="repair-buttons"><button data-inspect="'+x.id+'">調べる</button>'+action+'</div></div>';
 }).join("");
 const diagnosis=diagnosed?'<div class="diagnosis-panel complete"><strong>✓ 故障の原因を特定できた！</strong><p>発見した'+broken.length+'か所を修理して、最後に電気を流して確かめよう。</p></div>':
  '<div class="diagnosis-panel"><strong>🔍 証拠から原因を推理しよう</strong><p>3つの部品をすべて調べ、故障していると思うものを'+broken.length+'か所選ぼう。原因の予想は外れても減点しないよ。</p><p class="diagnosis-status">調査：'+inspections+' / 3　原因の候補：'+ui.suspected.length+' / '+broken.length+'</p><button type="button" class="diagnose-btn" data-diagnose="1"'+(inspections<parts.length?' disabled':'')+'>原因を診断する</button></div>';
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🔧 回路を調査しよう</h3><div class="science-spotlight">'+Art.bulb(fixedCount===broken.length)+'</div><p class="lab-reading">調査済み：'+inspections+' / 3　修理済み：'+fixedCount+' / '+broken.length+'</p><p class="lab-sub">1か所直しても消えたままなら、まだ別の故障があるかもしれないよ。</p></div>'
  +'<div class="lab-panel"><h3>🛠 故障チェック</h3><p class="lab-sub">「調べる」で証拠を集め、原因だと思う部品を選んでね。</p><div class="repair-list">'+cards+'</div>'+diagnosis+'</div></div>';
}
function renderLogic(){
 const k=ui.a?"1":"0",l=ui.b?"1":"0",lit=ui.design==="series"?(ui.a&&ui.b):(ui.a||ui.b);
 const complete=Object.keys(ui.trials).length===4;
 const conclusion=complete?'<div class="science-conclusion"><strong>✦ 4通りから何がわかった？</strong><p>結果を見てから、当てはまる説明を選ぼう。</p><div class="conclusion-choices">'+
  [["both","AもBもONのときだけ点灯"],["either","AかBのどちらかがONなら点灯"]].map(([id,label])=>'<button type="button" class="prediction-option'+(ui.conclusion===id?' chosen':'')+'" data-conclude="'+id+'" aria-pressed="'+(ui.conclusion===id)+'">'+label+'</button>').join("")+'</div></div>':
  '<div class="lab-reading">4通りをすべて実験すると、最後に回路の特徴を考えられるよ。</div>';
 return'<div class="experiment-layout"><div class="lab-panel"><h3>🔌 回路を組み立てよう</h3><div class="toggle-row"><button class="toggle'+(ui.design==="series"?' on':'')+'" data-design="series" aria-pressed="'+(ui.design==="series")+'">直列</button><button class="toggle'+(ui.design==="parallel"?' on':'')+'" data-design="parallel" aria-pressed="'+(ui.design==="parallel")+'">並列</button></div>'+Art.circuit(ui.design,ui.a,ui.b)+'<div class="toggle-row"><button class="toggle'+(ui.a?' on':'')+'" data-switch="a">スイッチ A：'+(ui.a?"ON":"OFF")+'</button><button class="toggle'+(ui.b?' on':'')+'" data-switch="b">スイッチ B：'+(ui.b?"ON":"OFF")+'</button></div></div>'
  +'<div class="lab-panel"><h3>📊 実験記録</h3><p class="lab-sub">それぞれの組み合わせで「電気を流してみる」を押そう。</p><div class="light-status">'+(lit?"💡 点灯":"◯ 消灯")+'</div><table class="truth-table"><thead><tr><th>A</th><th>B</th><th>実験結果</th></tr></thead><tbody>'+[["0","0"],["0","1"],["1","0"],["1","1"]].map(([x,y])=>{let result=ui.trials[x+y];return'<tr><td>'+(x==="1"?"ON":"OFF")+'</td><td>'+(y==="1"?"ON":"OFF")+'</td><td>'+(result===undefined?"？":result?"💡 点灯":"○ 消灯")+'</td></tr>'}).join("")+'</tbody></table><p class="lab-reading">試した組み合わせ：'+Object.keys(ui.trials).length+' / 4</p>'+conclusion+'</div></div>';
}
function batteryOptions(){return current().id===9?[{id:"small",name:"単4形（1.5V）",kind:"small"},{id:"large",name:"単1形（1.5V）",kind:"large"}]:[{id:"single",name:"乾電池1個（1.5V）",kind:"small"},{id:"series",name:"2個を直列（3V）",kind:"series"}]}
function batteryReasonOptions(){
 return current().id===9?[
  ["voltage","単1形も単4形も、同じ種類なら公称電圧は1.5Vだから"],
  ["size","大きい乾電池ほど電圧が高くなるから"],
  ["shape","乾電池が太いと電気が必ず強くなるから"]
 ]:current().id===10?[
  ["seriesAdds","同じ向きの乾電池2個を直列につなぐと、電圧が加わるから"],
  ["shape","乾電池が2個で重くなるから"],
  ["always","豆電球の電気の通り道が2倍になるから"]
 ]:[
  ["cancel","同じ乾電池を逆向きに直列につなぐと、電圧が打ち消し合うから"],
  ["single","乾電池1個でも向きを逆にしただけで豆電球が光らないから"],
  ["shape","乾電池を反対向きに置くと物理的に小さくなるから"]
 ];
}
function renderBattery(){return window.AkariBatteryLab?window.AkariBatteryLab.render(current().id,ui.batteryLab):'<p>乾電池の実験を読み込めませんでした。再読み込みしてください。</p>';}
function renderPolarity(){return renderBattery();}
function renderCut(){
 return window.AkariSafety?window.AkariSafety.render(ui.safety):
  '<div class="lab-panel"><h3>安全点検を読み込めませんでした</h3><p>画面を再読み込みしてください。</p></div>';
}
function renderFinale(){return window.AkariFinaleLab?window.AkariFinaleLab.render(ui.finale):'<div class="lab-panel">最後の実験室が読み込めませんでした。再読み込みしてください。</div>';}
function renderPacing(){
 const target=$("scienceCompass"),report=$("scienceReport");
 if(window.AkariPacing&&target){
  target.innerHTML=window.AkariPacing.render(current().id,ui,stageComplete);
 }
 if(report){
  const html=window.AkariPacing?.report(state)||"";
  report.hidden=!html;
  if(html)report.innerHTML=html;
  else report.innerHTML="";
 }
 applyReading();
}
function renderWorkspace(){
 const root=$("workspace"),old=typeof root.querySelector==="function"?root.querySelector(".circuit-board"):null;
 const position=old?old.scrollLeft:0,previousBuilder=typeof root.querySelector==="function"?root.querySelector(".builder-viewport"):null,builderPosition=previousBuilder?previousBuilder.scrollLeft:0,previousSafety=typeof root.querySelector==="function"?root.querySelector(".safety-diagram"):null,safetyPosition=previousSafety?previousSafety.scrollLeft:0,previousGarden=typeof root.querySelector==="function"?root.querySelector(".garden-schematic"):null,gardenPosition=previousGarden?previousGarden.scrollLeft:0,previousDouble=typeof root.querySelector==="function"?root.querySelector(".dual-diagram"):null,doublePosition=previousDouble?previousDouble.scrollLeft:0,previousFinale=typeof root.querySelector==="function"?root.querySelector(".finale-circuit"):null,finalePosition=previousFinale?previousFinale.scrollLeft:0,mode=current().mode;
 root.innerHTML=ui.switchLab&&window.AkariSwitchLab?window.AkariSwitchLab.render(current().id,ui.switchLab.wires,ui.switchLab.selected,ui.switchLab.a,ui.switchLab.b,ui.switchLab.trials,ui.switchLab.reason,ui.switchLab.insight):ui.builder&&window.AkariBuilder?window.AkariBuilder.render(ui.builder.wires,ui.builder.selected,ui.builder.switchOn,ui.builder.tests,ui.builderTask||"switch",ui.builder.trace||[],ui.builder.insight):ui.transfer&&window.AkariTransfer?window.AkariTransfer.render(current().id,ui.transfer.answers,ui.transfer.reason,ui.transfer.step):mode==="wire"?renderWire():mode==="explore"?renderExplore():mode==="material"?renderMaterial():mode==="repair"?renderRepair():mode==="logic"?renderLogic():mode==="battery"?renderBattery():mode==="polarity"?renderPolarity():mode==="cut"?renderCut():renderFinale();
 const board=typeof root.querySelector==="function"?root.querySelector(".circuit-board"):null;
 if(board&&ui.zoomed)board.scrollLeft=position;
 const builderView=typeof root.querySelector==="function"?root.querySelector(".builder-viewport"):null;
 if(builderView)builderView.scrollLeft=builderPosition;
 const safetyView=typeof root.querySelector==="function"?root.querySelector(".safety-diagram"):null;
 if(safetyView)safetyView.scrollLeft=safetyPosition;
 const gardenView=typeof root.querySelector==="function"?root.querySelector(".garden-schematic"):null;
 if(gardenView)gardenView.scrollLeft=gardenPosition;
 const doubleView=typeof root.querySelector==="function"?root.querySelector(".dual-diagram"):null;
 if(doubleView)doubleView.scrollLeft=doublePosition;
 const finaleView=typeof root.querySelector==="function"?root.querySelector(".finale-circuit"):null;
 if(finaleView)finaleView.scrollLeft=finalePosition;
 // Physical state is immediate: the bulb and village scene react to wiring,
 // while the first two lessons finish only after explaining *why* it lights.
 const liveWire=mode==="wire"&&!ui.builder&&!ui.switchLab&&!ui.transfer&&circuitStatus(ui.wires).lit;
 $("storyScene")?.classList.toggle("live-powered",liveWire);
 renderPacing();
}
function renderAll(){renderMenu();renderScene();renderHeader();renderWorkspace();renderJournal();if(!stageComplete){$("discovery").hidden=true;setFeedback("✦ いろいろ試してみよう！");}}
function check(){
 if(stageComplete)return;const m=current();if(ui.switchLab){setFeedback("4通りの通電実験と理由の確認を完成させよう。");return;}if(ui.builder){setFeedback("導線をつなぎ、OFFとONの両方を実験してから完成ボタンを押そう。");return;}if(ui.transfer){setFeedback("追加依頼の3つの予想と理由を選び、最後の「街を救う」を押そう。");return;}
 if(m.mode==="wire"){const s=circuitStatus(ui.wires);if(s.short){fail("⚠ ショート！ 豆電球を通らず＋と−がつながっています。実物では絶対にまねしないでね。",true);return;}if(s.lit){success();return;}fail("まだ回路がつながっていないよ。電気が豆電球を通って電池に戻る道をつくろう。");return;}
 if(m.mode==="explore"){
  if(!window.AkariBridge?.canFinish(ui.bridge)){setFeedback("3か所の観察・材料の比較・2か所の修理・仮想通電・理由の説明をそろえよう。","warning");return;}
  recordObservation("bridge:proof","【橋の回路】"+ui.bridge.slots.a+"と"+ui.bridge.slots.b+"を使い、乾電池＋→修理A→豆電球→修理B→乾電池−の通り道を復旧した。");
  clearBridgeDraft();success();return;
 }
 if(m.mode==="material"){
  const G=window.AkariGarden;
  if(!G||!G.canFinish(m.id,ui.garden)){
   setFeedback(m.id===4?"接点の比較・条件をそろえた材料実験・科学的な説明を完成させよう。":"実験済み材料で通電部分と2つの仕切りを設計し、安全な点灯と両方の理由を確認しよう。","warning");
   return;
  }
  const sampleText=m.id===4?"【実験工房】同じ鉄のクリップでも接点が離れると消灯。両接点の条件をそろえて金属と不導体の性質を比べた。":"【庭の安全設計】通電には"+ui.garden.slots.link+"、隔てる仕切りには"+ui.garden.slots.guardA+"と"+ui.garden.slots.guardB+"を使用。ショートなしの点灯を確認した。";
  recordObservation("garden:proof:"+m.id,sampleText);
  success();return;
 }
 if(m.mode==="repair"){
  if(m.id===13){
   const D=window.AkariDoubleFault;
   if(!D||!D.canFinish(ui.doubleFault)){
    setFeedback("4つの部品の検査→1か所修理後の消灯確認→残る故障の理由→2か所目の修理と点灯→科学的説明を完成させよう。","warning");return;
   }
   recordObservation("double:proof","【二重故障の解決】乾電池・フィラメントは正常。導線の切れと豆電球の底の接触不良を別々に確認し、1か所を直しても消灯することを確かめ、両方直して電気の輪を完成させた。");
   success();return;
  }
  const broken=repairParts().filter(x=>x.broken);
  if(!ui.diagnosed){setFeedback("🔎 まず3つの部品を調べ、故障の原因を推理して診断しよう。","warning");return;}
  if(broken.every(x=>ui.fixed.includes(x.id))){success();return;}
  setFeedback("🔧 診断はできたよ。まだ修理していない部品があるみたい。","warning");return;
 }
 if(m.mode==="logic"){const code=(ui.a?"1":"0")+(ui.b?"1":"0");ui.trials[code]=ui.design==="series"?(ui.a&&ui.b):(ui.a||ui.b);recordObservation("switch:"+ui.design+":"+code,(ui.trials[code]?"点灯":"消灯"));renderWorkspace();
 if(Object.keys(ui.trials).length===4){
  if(!ui.conclusion){setFeedback("4つの実験結果がそろった！結果からわかることを選んで、もう一度通電チェックしよう。","success");return;}
  const expected=ui.design==="series"?"both":"either";
  if(ui.conclusion!==expected){fail("選んだ説明は、記録した点灯・消灯と合っているかな？表を見直そう。");return;}
  if(ui.design!==m.target){fail("実験結果は正しくまとめられたね。でも今回の扉に必要なのは別のつなぎ方。");return;}
  success();return;
 }setFeedback("記録したよ！ 残り "+(4-Object.keys(ui.trials).length)+" 通りのスイッチを試そう。","success");return;}
 if(m.mode==="battery"||m.mode==="polarity"){
  const B=window.AkariBatteryLab;
  if(!B||!B.canFinish(m.id,ui.batteryLab)){
   setFeedback("条件を変えた実験の記録をそろえ、現場の設備を選んで仮想通電し、実験結果の理由まで説明しよう。","warning");
   return;
  }
  recordObservation("battery:proof:"+m.id,"【乾電池の推理】"+m.name+"：実験 "+Object.keys(ui.batteryLab.trials).length+" 通りを比べ、"+ui.batteryLab.choice+"を選び、理由を説明して復旧した。");
  success();return;
 }
 if(m.mode==="cut"){
  const B=window.AkariSafety,q=ui.safety;
  if(!B||!B.canAdvance(q)){
   setFeedback("予想→仮想実験で安全な点灯を確かめよう。必要な線は残し、危険な道だけ少なく外そう。","warning");return;
  }
  if(q.index!==B.stages.length-1){setFeedback("安全な修理ができた！「次の点検へ」を押して進もう。","success");return;}
  if(q.reason!==B.correctReason){
   setFeedback("回路が点灯した理由を、乾電池・豆電球の2つの接点・輪のつながりから説明しよう。","warning");return;
  }
  recordObservation("safety:"+q.index,"【安全点検】"+B.stages[q.index].name+"：外した導線 "+q.removed.join("、")+"。ショートなしで豆電球が点灯。");
  success();return;
 }
 if(m.mode==="finale"){
  const B=window.AkariFinaleLab;
  if(!B?.canFinish(ui.finale)){
   setFeedback("3つの現場で6条件の実験を完成し、試験済みの部品を設置して全体の点灯を予想・測定。理由まで説明しよう。","warning");return;
  }
  recordObservation("final:proof","【最終科学調査】6つの比較実験で電池の向き・金属の性質・豆電球の2接点を調べ、約3Vの閉じた回路を組み立てて灯台を点灯させた。");
  success();return;
 }
}
function handleWorkspace(e){
 const target=e.target.closest("button");if(!target||stageComplete)return;
 if(ui.switchLab){
  const B=window.AkariSwitchLab,l=ui.switchLab;
  if(target.hasAttribute("data-net-view")){
   const board=$("workspace").querySelector(".network-viewport"),dir=target.dataset.netView;
   if(!board||!["left","right"].includes(dir))return;
   board.scrollLeft=dir==="right"?board.scrollWidth-board.clientWidth:0;
   setFeedback(dir==="right"?"豆電球の横・底の接点を見よう。":"電池と2つのスイッチの端子を見よう。");return;
  }
  if(target.hasAttribute("data-net-t")){
   const id=target.dataset.netT;if(!B.ids.includes(id))return;
   if(l.selected==null){l.selected=id;renderWorkspace();setFeedback(B.points[id].name+"を選択した。次につなぐ端子を選んでね。");return;}
   const first=l.selected;l.selected=null;
   if(first===id){renderWorkspace();return;}
   const code=B.edge(first,id),index=l.wires.findIndex(w=>B.edge(...w)===code);
   if(index<0)l.wires.push([first,id]);else l.wires.splice(index,1);
   l.trials={};l.reason=null;l.insight=null;saveSwitchDraft();renderWorkspace();
   setFeedback(index<0?"導線を追加した。4通りを調べると本当の働きがわかるよ。":"導線を外した。実験記録も新しい配線で取り直そう。");
   reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-net-clear")){
   l.wires=[];l.selected=null;l.trials={};l.reason=null;l.insight=null;saveSwitchDraft();renderWorkspace();setFeedback("導線を外した。新しい配線を考えよう。");return;
  }
  if(target.hasAttribute("data-net-switch")){
   const id=target.dataset.netSwitch;if(!["a","b"].includes(id))return;
   l[id]=!l[id];l.selected=null;saveSwitchDraft();renderWorkspace();
   setFeedback("スイッチ"+id.toUpperCase()+"を"+(l[id]?"ON":"OFF")+"にしたよ。結果を確かめよう。");return;
  }
  if(target.hasAttribute("data-net-test")){
   const code=Number(l.a)+""+Number(l.b),value=B.evaluate(l.wires,l.a,l.b);
   l.trials[code]={...value,signature:B.signature(l.wires)};saveSwitchDraft();renderWorkspace();
   const problem=B.discrepancy(current().id,l.wires,l.a,l.b);
   if(value.short){window.AkariEffects?.shortCircuit?.();setFeedback("⚠ ショート！ なぜ危険な道ができたか、実験結果をもとに推理しよう。実物では絶対にまねしないでね。","warning");reactCharacter("danger");return;}
   if(problem){setFeedback("結果が目標の点灯・消灯と違った！ 原因の候補を選んで、回路の道を調べよう。","warning");reactCharacter("think");return;}
   setFeedback("A："+(l.a?"ON":"OFF")+" / B："+(l.b?"ON":"OFF")+" → "+(value.lit?"点灯":"消灯")+"。この条件は成功！ほかも確かめよう。","success");reactCharacter("discover");return;
  }
  if(target.hasAttribute("data-net-cause")){
   const hypothesis=target.dataset.netCause,code=Number(l.a)+""+Number(l.b),signature=B.signature(l.wires);
   if(!["open","bypass","short"].includes(hypothesis))return;
   if(l.trials[code]?.signature!==signature){setFeedback("まず今のスイッチの状態を通電して観察しよう。","warning");return;}
   const actual=B.discrepancy(current().id,l.wires,l.a,l.b);
   if(!actual){setFeedback("この組み合わせは条件どおりだよ。別の条件でも試そう。");return;}
   if(hypothesis!==actual){setFeedback("その予想と、今回の点灯・消灯・ショートは合っているかな？電気の道をもう一度たどろう。","warning");reactCharacter("think");return;}
   l.insight={code,signature,kind:actual};saveSwitchDraft();renderWorkspace();
   setFeedback("🔎 原因を発見！"+B.diagnosticMessage(actual),"success");reactCharacter("discover");
   recordObservation("network-clue:"+current().id+":"+code,
     "【回路の調査】A"+code[0]+"/B"+code[1]+"の結果が設計条件と異なる。"+B.diagnosticMessage(actual));return;
  }
  if(target.hasAttribute("data-net-reason")){
   if(B.codes.some(code=>l.trials[code]?.signature!==B.signature(l.wires)))return;
   const why=target.dataset.netReason;if(!["both","either"].includes(why))return;
   l.reason=why;saveSwitchDraft();renderWorkspace();setFeedback("理由を選んだ。4つの実験結果と合うかな？");return;
  }
  if(target.hasAttribute("data-net-submit")){
   if(!B.expected(current().id,l.wires,l.trials,l.reason)){
    setFeedback("配線と4通りの点灯・消灯を比べよう。全部安全で、目的どおりになっているかな？","warning");return;
   }
   recordObservation("switchbuilder:"+current().id,"【自分で配線】"+B.normalize(l.wires).map(([a,b])=>B.points[a].name+"―"+B.points[b].name).join("、")+"。4通りの結果："+B.codes.map(code=>"A"+code[0]+"/B"+code[1]+"＝"+(l.trials[code].lit?"点灯":"消灯")).join("／")+"。理由："+(l.reason==="both"?"直列の一本道は両方ONでつながる。":"並列の2本の道はどちらかONでつながる。"));
   ui.switchLabPassed=true;ui.switchLab=null;clearSwitchDraft(current().id);
   state.masteries[current().id]=true;persist();success();return;
  }
  return;
 }
 if(ui.builder){
  const B=window.AkariBuilder,b=ui.builder,direct=ui.builderTask==="direct";
  if(target.hasAttribute("data-builder-view")){
   const viewport=$("workspace").querySelector(".builder-viewport");
   if(!viewport)return;
   const direction=target.dataset.builderView;
   if(direction!=="battery"&&direction!=="bulb")return;
   viewport.scrollLeft=direction==="bulb"?viewport.scrollWidth-viewport.clientWidth:0;
   setFeedback(direction==="bulb"?"豆電球の横と底の端子を見てみよう。":"乾電池の＋と−、スイッチの端子を見てみよう。");
   return;
  }
  if(target.hasAttribute("data-builder-trace-reset")){
   b.trace=[];saveBuilderDraft();renderWorkspace();setFeedback("通り道の説明を最初からやり直せるよ。");return;
  }
  if(target.hasAttribute("data-builder-trace-back")){
   b.trace=(b.trace||[]).slice(0,-1);saveBuilderDraft();renderWorkspace();setFeedback("ひとつ前の端子まで戻ったよ。");return;
  }
  if(target.hasAttribute("data-builder-trace")){
   if(!B.expectedFor(direct?"direct":"switch",b.tests,b.wires)){
    setFeedback("まず回路を安全に点灯させ、必要な実験を記録しよう。","warning");return;
   }
   if(!direct&&!b.switchOn){setFeedback("電気の道をたどるにはスイッチをONにしよう。","warning");return;}
   const id=target.dataset.builderTrace,old=b.trace||[];
   if(!B.ids.includes(id)||(direct&&(id==="S"||id==="T")))return;
   if(old.length===0&&id!=="P"){setFeedback("最初は乾電池の＋極から始めよう。","warning");return;}
   if(old.length&&old.includes(id)){setFeedback("同じ端子は2度通らないよ。ひとつ戻るか、やり直そう。","warning");return;}
   const next=[...old,id],status=B.traceStatus(direct?"direct":"switch",b.wires,next);
   if(!status.valid){
    setFeedback("その2つの端子の間に、電気が通るつながりはあるかな？導線と部品の接点を見直そう。","warning");reactCharacter("think");return;
   }
   if(id==="N"&&!status.complete){
    setFeedback("まだ豆電球"+(direct?"":"とONのスイッチ")+"を通っていないよ。＋極からの通り道を見直そう。","warning");return;
   }
   b.trace=next;saveBuilderDraft();renderWorkspace();
   setFeedback(status.complete?"✨ 正しく通り道を証明できた！ 完成ボタンであかりを戻そう。":"次は実際につながっている端子を選ぼう。",status.complete?"success":"");
   reactCharacter(status.complete?"discover":"inspect");return;
  }
  if(target.hasAttribute("data-builder-t")){
   const term=target.dataset.builderT;
   if(!B.ids.includes(term)||(direct&&(term==="S"||term==="T")))return;
   if(b.selected===null){b.selected=term;renderWorkspace();setFeedback("選んだ端子："+B.terminals[term].name+"。次につなぐ端子をタップしよう。");return;}
   const from=b.selected;b.selected=null;
   if(from===term){renderWorkspace();setFeedback("端子の選択を解除したよ。");return;}
   const key=B.edge(from,term);
   const index=b.wires.findIndex(pair=>B.edge(...pair)===key);
   if(index>=0)b.wires.splice(index,1);
   else b.wires.push([from,term]);
   b.tests={};b.trace=[];b.insight=null;saveBuilderDraft();renderWorkspace();
   setFeedback(index>=0?"その導線を外したよ。":direct?"導線を追加したよ。回路ができたら通電してみよう。":"導線を追加したよ。OFFとONを両方確かめてみよう。");
   reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-builder-clear")){
   b.wires=[];b.selected=null;b.tests={};b.trace=[];b.insight=null;saveBuilderDraft();renderWorkspace();setFeedback("導線をすべて外したよ。新しく設計しよう。");return;
  }
  if(target.hasAttribute("data-builder-switch")){
   if(direct)return;
   const mode=target.dataset.builderSwitch;if(!["on","off"].includes(mode))return;
   b.switchOn=mode==="on";b.selected=null;saveBuilderDraft();renderWorkspace();
   setFeedback("スイッチを"+(b.switchOn?"ON":"OFF")+"に切り替えた。通電実験で確認しよう。");return;
  }
  if(target.hasAttribute("data-builder-test")){
   const mode=direct?"single":b.switchOn?"on":"off";
   const result=B.evaluate(b.wires,direct?false:b.switchOn);
   b.tests[mode]={...result,signature:B.signature(b.wires)};
   saveBuilderDraft();renderWorkspace();
   const issue=B.diagnose(direct?"direct":"switch",b.wires,direct?false:b.switchOn);
   if(result.short){window.AkariEffects?.shortCircuit?.();setFeedback("⚠ ショート！ 電池の＋と−が豆電球を通らずつながっている。原因を予想してから危険な道を見つけよう。実物で試さないでね。","warning");reactCharacter("danger");return;}
   const ok=!issue;
   setFeedback("実験記録："+(direct?"基本回路":mode==="on"?"ON":"OFF")+" → "+(result.lit?"点灯":"消灯")+(ok?"。目的どおり！":"。目標と違うよ。回路の原因を推理してみよう。"),ok?"success":"warning");
   reactCharacter(ok?"discover":"think");return;
  }
  if(target.hasAttribute("data-builder-cause")){
   const hypothesis=target.dataset.builderCause,mode=direct?"single":b.switchOn?"on":"off";
   if(!["short","open","bypass"].includes(hypothesis))return;
   const sig=B.signature(b.wires);
   if(b.tests[mode]?.signature!==sig){setFeedback("まず今の状態を通電実験で確かめよう。","warning");return;}
   const answer=B.diagnose(direct?"direct":"switch",b.wires,direct?false:b.switchOn);
   if(!answer){setFeedback("この状態は目標どおり。別の状態も調べてみよう。");return;}
   if(hypothesis!==answer){
    setFeedback("その原因で、今回の点灯・消灯・ショートを説明できるかな？導線をたどってもう一度考えよう。","warning");
    reactCharacter("think");return;
   }
   b.insight={mode,kind:answer,signature:sig};saveBuilderDraft();renderWorkspace();
   recordObservation("builder-clue:"+current().id+":"+mode,"【回路の原因】"+(direct?"基本回路":mode==="on"?"スイッチON":"スイッチOFF")+"の実験で "+B.diagnosisMessage(answer));
   setFeedback("🔎 故障の原因がわかった！"+B.diagnosisMessage(answer),"success");
   reactCharacter("discover");return;
  }
  if(target.hasAttribute("data-builder-submit")){
   if(!B.scientificComplete(direct?"direct":"switch",b.tests,b.wires,b.trace)){
    setFeedback("配線と実験結果に加え、乾電池の＋極から豆電球（とスイッチ）を通り−極に戻る経路を順番に証明しよう。","warning");return;}
   const used=B.normalize(b.wires),wiring=used.map(([a,c])=>B.terminals[a].name+"―"+B.terminals[c].name).join("、");
   const explainedRoute=(b.trace||[]).map(id=>B.terminals[id].name).join(" → ");
   recordObservation("builder:"+current().id,(direct?"【時計塔の再配線】":"【最終設計】")+wiring+(direct?"。乾電池と電球の2つの接点が輪になり、安全に点灯した。":"。スイッチOFFでは消灯、ONでは点灯。いずれもショートなし。")+"【自分でたどった電気の通り道】"+explainedRoute+"。");
   ui.builderPassed=true;ui.builder=null;clearBuilderDraft();
   success();return;
  }
  return;
 }
 if(ui.transfer){
  const p=window.AkariTransfer?.get(current().id);if(!p)return;
  if(target.hasAttribute("data-transfer-jump")){
   const step=Number(target.dataset.transferJump);
   if(!Number.isInteger(step)||step<0||step>3)return;
   if(step===3&&p.probes.some(q=>!ui.transfer.answers[q.id]))return;
   if(step>0&&step<3&&!ui.transfer.answers[p.probes[step-1].id]&&!ui.transfer.answers[p.probes[step].id])return;
   ui.transfer.step=step;saveTransferDraft();renderWorkspace();setFeedback(step===3?"3つの予想を見比べて理由を考えよう。":"この回路の電気の通り道をたどろう。");return;
  }
  if(target.hasAttribute("data-transfer-answer")){
   const id=target.dataset.transferAnswer,value=target.dataset.transferValue;
   if(!p.probes.some(q=>q.id===id)||!p.choices.includes(value))return;
   ui.transfer.answers[id]=value;
   if(ui.transfer.step<3){
    const allAnswered=p.probes.every(q=>!!ui.transfer.answers[q.id]);
    ui.transfer.step=allAnswered?3:Math.min(3,ui.transfer.step+1);
   }
   saveTransferDraft();renderWorkspace();setFeedback(ui.transfer.step===3?"3つの予想がそろった！結果を比べて理由を説明しよう。":"予想を記録したよ。次の回路もよく見てみよう。");return;
  }
  if(target.hasAttribute("data-transfer-reason")){
   const reason=target.dataset.transferReason;
   if(!p.reasons.some(([key])=>key===reason))return;
   ui.transfer.reason=reason;saveTransferDraft();renderWorkspace();setFeedback("理由を選んだよ。3つの予想とつながっているかな？");return;
  }
  if(target.hasAttribute("data-transfer-verify")){
   if(p.probes.some(q=>!ui.transfer.answers[q.id])||!ui.transfer.reason){
    setFeedback("3つすべての予想と、そう考えた理由を選ぼう。","warning");return;
   }
   const result=window.AkariTransfer.score(current().id,ui.transfer.answers,ui.transfer.reason);
   if(!result.ok){
    setFeedback("あと少し！ "+(result.wrong.length?"3つの回路のうち"+result.wrong.length+"つの予想を見直そう。 ":"")+
     (!result.reasonOk?"理由も、3つの結果すべてに当てはまるか考えよう。":"一つずつ通り道を確かめよう。"),"warning");
    reactCharacter("think","どうしてそうなるノン？");return;
   }
   const answeredReason=ui.transfer.reason;
   ui.transferPassed=true;ui.transfer=null;clearTransferDraft(current().id);
   state.masteries[current().id]=true;persist();
   const outcomeNames={lit:"点灯",dark:"消灯",short:"ショート（危険）",safe:"正しく点灯"};
   const evidence=p.probes.map(q=>q.name+" → "+outcomeNames[window.AkariTransfer.expected(current().id,q.diagram)]).join("／");
   const causal=p.reasons.find(([k])=>k===answeredReason)?.[1]||"";
   recordObservation("transfer:"+current().id,"【追加依頼】"+evidence+"。理由："+causal+"。"+result.discovery);
   success();return;
  }
  return;
 }
 if(target.hasAttribute("data-zoom")){ui.zoomed=!ui.zoomed;renderWorkspace();setFeedback(ui.zoomed?"大きく表示したよ。「豆電球 ▶」で右へ移動できるよ。":"全体を表示したよ。");return;}
 if(target.hasAttribute("data-view")){const root=$("workspace"),board=typeof root.querySelector==="function"?root.querySelector(".circuit-board"):null;if(board){board.scrollLeft=target.dataset.view==="bulb"?board.scrollWidth-board.clientWidth:0;setFeedback(target.dataset.view==="bulb"?"豆電球の金属の横と底を見てみよう。":"乾電池の＋極と−極を見てみよう。");}return;}
  if(target.hasAttribute("data-t")){const t=target.dataset.t;if(ui.selected===null){ui.selected=t;setFeedback(labels[t]+"を選んだよ。次につなぐ端子を選ぼう。");}
 else if(ui.selected===t){ui.selected=null;setFeedback("端子の選択を解除したよ。");}
 else{const a=ui.selected,b=t;ui.selected=null;if(!ui.wires.some(pair=>edgeKey(...pair)===edgeKey(a,b))){ui.wires.push([a,b]);const circuit=circuitStatus(ui.wires);if(circuit.short){fail("⚠ ショート！ あぶない！ せんを はずそう。",true);}else if(circuit.lit){setFeedback("💡 ついた！ どうして ついたのかな？","success");reactCharacter("discover");}else{setFeedback("どう線が つながったよ。");reactCharacter("inspect","つながったノン！");}}else setFeedback("その2つはもうつながっているよ。");}
 renderWorkspace();return;}
 if(target.hasAttribute("data-unwire")){const wasLit=circuitStatus(ui.wires).lit;ui.wires.splice(+target.dataset.unwire,1);ui.selected=null;renderWorkspace();setFeedback(wasLit&&!circuitStatus(ui.wires).lit?"◯ きえた。もういちど つなごう。":"✂️ 1本 はずしたよ。");return;}
 if(current().mode==="material"&&window.AkariGarden){
  const G=window.AkariGarden,id=current().id,g=ui.garden||G.initial(id);
  if(target.hasAttribute("data-garden-view")){
   if(id!==5)return;
   const view=$("workspace").querySelector(".garden-schematic"),direction=target.dataset.gardenView;
   if(!view||!["left","right"].includes(direction))return;
   view.scrollLeft=direction==="right"?view.scrollWidth-view.clientWidth:0;
   setFeedback(direction==="right"?"豆電球と、仕切りの端子を調べよう。":"乾電池の＋・−極から道をたどってみよう。");return;
  }
  if(target.hasAttribute("data-garden-clamp")){
   if(id!==4)return;
   const clamp=target.dataset.gardenClamp;
   if(!["loose","tight"].includes(clamp))return;
   g.clamp=clamp;g.guess=null;ui.garden=g;saveGardenDraft();renderWorkspace();
   setFeedback(clamp==="tight"?"2つの金属接点を合わせた。":"接点を1か所だけ離した。電気の輪はどうなる？");return;
  }
  if(target.hasAttribute("data-garden-sample")){
   const sample=G.material(target.dataset.gardenSample);
   if(!sample||(id===4&&!G.calibrated(g)))return;
   g.selected=sample.id;g.guess=null;ui.garden=g;saveGardenDraft();renderWorkspace();
   setFeedback("試料を選んだよ。点灯を予想して実験で確かめよう。");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-garden-guess")){
   const guess=target.dataset.gardenGuess;
   if(!["lit","dark"].includes(guess))return;
   if(id===4){
    const old=G.calibrated(g)?g.trials[g.selected]?.[g.clamp]:g.calibrations[g.clamp];
    if(old)return;
   }else if(!G.material(g.selected)||g.tests[g.selected])return;
   g.guess=guess;ui.garden=g;saveGardenDraft();renderWorkspace();
   setFeedback("予想を記録したよ。実験で比較しよう。");return;
  }
  if(target.hasAttribute("data-garden-calibrate")){
   if(id!==4||!g.guess||g.calibrations[g.clamp])return;
   const result=G.experiment("clip",g.clamp);
   g.calibrations[g.clamp]={guess:g.guess,actual:result.kind};g.guess=null;
   ui.garden=g;saveGardenDraft();renderWorkspace();
   recordObservation("garden:control:"+g.clamp,"【条件比較】同じクリップで"+(g.clamp==="tight"?"両接点を合わせると":"接点を浮かせると")+"："+(result.lit?"点灯":"消灯")+"。");
   setFeedback("同じクリップでも、接点によって結果が変わった。もう一方も比べよう。","success");reactCharacter("discover");return;
  }
  if(target.hasAttribute("data-garden-control-reason")){
   if(id!==4||Object.keys(g.calibrations).length!==2)return;
   const reason=target.dataset.gardenControlReason;
   if(!G.reasons4.some(([key])=>key===reason))return;
   g.calibrationReason=reason;ui.garden=g;saveGardenDraft();renderWorkspace();
   setFeedback(reason==="control"?"条件の違いがわかった！材料を調べてみよう。":"2つの実験は同じ材料だったね。変えた条件をもう一度見よう。",reason==="control"?"success":"warning");return;
  }
  if(target.hasAttribute("data-garden-test")){
   const sample=G.material(g.selected);
   if(!sample||!g.guess)return;
   const clamp=id===4?g.clamp:"tight";
   if(id===4&&(!G.calibrated(g)||g.trials[sample.id]?.[clamp]))return;
   if(id===5&&g.tests[sample.id])return;
   const result=G.experiment(sample.id,clamp),guess=g.guess;
   if(id===4){
    g.trials[sample.id]=g.trials[sample.id]||{};
    g.trials[sample.id][clamp]={guess,actual:result.kind};
   }else g.tests[sample.id]={guess,actual:result.kind};
   g.guess=null;ui.garden=g;saveGardenDraft();renderWorkspace();
   recordObservation("garden:trial:"+id+":"+sample.id+":"+clamp,"【材料調査】"+sample.name+"（"+(clamp==="tight"?"接点を合わせる":"接点を浮かせる")+"）：予想 "+(guess==="lit"?"点灯":"消灯")+"／実際 "+(result.lit?"点灯":"消灯")+"。");
   setFeedback(result.lit?"豆電球が点灯。材料と接点の関係を考えよう。":"豆電球は消灯。試料と接点の両方を確かめよう。","success");
   reactCharacter("discover");return;
  }
  if(target.hasAttribute("data-garden-material-reason")){
   if(id!==4)return;
   const reason=target.dataset.gardenMaterialReason;
   const p=G.evidence4(g);
   if(!G.calibrated(g)||p.metals<2||p.nonmetals<1||!G.conclusions4.some(([key])=>key===reason))return;
   g.finalReason=reason;ui.garden=g;saveGardenDraft();renderWorkspace();
   setFeedback("結論を選んだ。実験の条件と結果がつながっているか確認しよう。");return;
  }
  if(target.hasAttribute("data-garden-slot")){
   if(id!==5)return;
   const slot=target.dataset.gardenSlot,sample=G.material(g.selected),e=G.evidence5(g);
   if(!["link","guardA","guardB"].includes(slot)||!sample||!g.tests[sample.id]||e.conductors<1||e.nonconductors<2)return;
   const prev=g.slots[slot];
   if(prev===sample.id)g.slots[slot]=null;
   else{
    for(const k of ["link","guardA","guardB"])if(k!==slot&&g.slots[k]===sample.id)g.slots[k]=null;
    g.slots[slot]=sample.id;
   }
   g.prediction=null;g.measurement=null;g.pathReason=null;g.guardReason=null;
   ui.garden=g;saveGardenDraft();renderWorkspace();renderScene();
   setFeedback("役割を変更したよ。新しい設計でもう一度仮想通電しよう。");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-garden-design-guess")){
   if(id!==5)return;
   const guess=target.dataset.gardenDesignGuess;
   if(!["short","lit","dark"].includes(guess))return;
   g.prediction=guess;g.measurement=null;g.pathReason=null;g.guardReason=null;
   ui.garden=g;saveGardenDraft();renderWorkspace();
   setFeedback("設計した設備の結果を予想した。安全に仮想実験しよう。");return;
  }
  if(target.hasAttribute("data-garden-design-test")){
   if(id!==5||!g.prediction||!Object.values(g.slots).every(Boolean))return;
   const actual=G.evaluate5(g.slots);
   g.measurement={prediction:g.prediction,signature:G.signature5(g.slots),actual:actual.kind};
   g.pathReason=null;g.guardReason=null;ui.garden=g;saveGardenDraft();renderWorkspace();renderScene();
   if(actual.short){window.AkariEffects?.shortCircuit?.();setFeedback("⚠ 仮想実験でショートの危険を発見。電池の＋と−を隔てる部品を見直そう。実物では試さないでね。","warning");reactCharacter("danger");}
   else if(actual.lit){setFeedback("💡 安全な回路ができた！どこに導体・不導体を使ったか説明して完成させよう。","success");reactCharacter("discover");}
   else{setFeedback("回路が切れて消灯した。豆電球に電気を届ける部品を見直そう。","warning");reactCharacter("think");}
   recordObservation("garden:design:"+G.signature5(g.slots),"【設備の仮想実験】"+G.signature5(g.slots)+"：予想 "+(g.prediction==="lit"?"点灯":g.prediction==="short"?"ショート":"消灯")+"、実際 "+(actual.kind==="lit"?"点灯":actual.kind==="short"?"ショート":"消灯")+"。");
   return;
  }
  if(target.hasAttribute("data-garden-path-reason")||target.hasAttribute("data-garden-cover-reason")){
   if(id!==5||!G.measured5(g)||!G.evaluate5(g.slots).lit)return;
   if(target.hasAttribute("data-garden-path-reason")){
    const val=target.dataset.gardenPathReason;if(!G.paths5.some(([key])=>key===val))return;g.pathReason=val;
   }else{
    const val=target.dataset.gardenCoverReason;if(!G.covers5.some(([key])=>key===val))return;g.guardReason=val;
   }
   ui.garden=g;saveGardenDraft();renderWorkspace();
   setFeedback("理由を選んだよ。回路を通すところと、隔てるところの役割を確認しよう。");return;
  }
 }
 if(["battery","polarity"].includes(current().mode)&&window.AkariBatteryLab){
  const B=window.AkariBatteryLab,id=current().id,q=ui.batteryLab||B.initial(id);
  if(target.hasAttribute("data-battery-next")){
   const currentTest=B.get(id,B.selectedId(id,q));
   if(!currentTest||!q.trials[currentTest.id])return;
   const next=B.nextUntested(id,q);
   if(!next)return;
   if(id===9){q.size=next.size;q.phase=next.phase;}
   else if(id===10){q.cells=next.cells;q.rating=next.rating;}
   else{q.cells=next.cells;q.direction=next.direction;}
   q.guess=null;ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   setFeedback("次の条件に切り替えたよ。結果を自分で予想して、実験しよう。");return;
  }
  if(target.hasAttribute("data-battery-field")){
   const field=target.dataset.batteryField,val=target.dataset.batteryValue;
   const choices=id===9?{size:["small","large"],phase:["early","late"]}:id===10?{cells:["one","two"],rating:["1.5","3"]}:{cells:["one","two"],direction:["forward","reverse","aligned","opposed"]};
   if(!choices[field]?.includes(val))return;
   q[field]=val;
   if(id===11&&field==="cells")q.direction=val==="one"?"forward":"aligned";
   q.guess=null;ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   setFeedback("実験条件を変更した。新しい回路の結果を予想しよう。");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-battery-guess")){
   const guess=target.dataset.batteryGuess,c=B.get(id,B.selectedId(id,q));
   if(!c||q.trials[c.id]||!["bright","dim","dark","risk"].includes(guess))return;
   q.guess=guess;ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   setFeedback("予想を記録した。仮想実験で確かめよう。");return;
  }
  if(target.hasAttribute("data-battery-test")){
   const config=B.get(id,B.selectedId(id,q));
   if(!config||!q.guess||q.trials[config.id])return;
   const actual=B.model(id,config.id);
   q.trials[config.id]={guess:q.guess,actual:actual.kind};q.guess=null;
   ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   recordObservation("battery:trial:"+id+":"+config.id,"【乾電池の実験】"+config.label+"：予想 "+B.outcomes[q.trials[config.id].guess]+"、実際 "+B.outcomes[actual.kind]+"。");
   setFeedback(actual.warning?"⚠ 仮想判定：豆電球の定格を超える危険。実物では試さず、使い方を考え直そう。":"実験した結果を記録した。ほかの条件と比較しよう。",actual.warning?"warning":"success");
   reactCharacter(actual.warning?"danger":"discover");return;
  }
  if(target.hasAttribute("data-battery-service")){
   const choice=target.dataset.batteryService;
   const valid=id===9?["small","large"]:id===10?["one:3","two:3","two:1.5"]:["one:reverse","two:opposed","two:aligned"];
   if(!B.evidence(id,q)||!valid.includes(choice))return;
   q.choice=choice;q.serviceGuess=null;q.service=null;ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   setFeedback("現場に使う装置を選んだ。効果を予測して実験しよう。");return;
  }
  if(target.hasAttribute("data-battery-service-guess")){
   const guess=target.dataset.batteryServiceGuess;
   if(!q.choice||!["bright","dim","dark","risk"].includes(guess))return;
   q.serviceGuess=guess;q.service=null;ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   setFeedback("現場の予想を記録した。仮想通電で確かめよう。");return;
  }
  if(target.hasAttribute("data-battery-service-test")){
   if(!q.choice||!q.serviceGuess||!B.evidence(id,q))return;
   const actual=B.serviceActual(id,q.choice);
   q.service={choice:q.choice,guess:q.serviceGuess,actual};ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   recordObservation("battery:service:"+id,"【現場検証】"+q.choice+"：予想 "+B.outcomes[q.serviceGuess]+"／結果 "+B.outcomes[actual]+"。");
   setFeedback(actual==="risk"?"⚠ 定格を超える危険な設計。実物では試さず、別の部品を選ぼう。":actual==="bright"?"灯りの状態を確認した。実験結果と理由が合うかな？":"思った明るさと違うかな？研究ノートから条件を見直そう。",actual==="risk"?"warning":"success");
   reactCharacter(actual==="risk"?"danger":"discover");return;
  }
  if(target.hasAttribute("data-battery-reason")){
   const reason=target.dataset.batteryReason;
   if(!B.evidence(id,q)||!B.reasons[id].some(([k])=>k===reason))return;
   q.reason=reason;ui.batteryLab=q;saveBatteryDraft();renderWorkspace();
   setFeedback("説明を選んだ。実験結果・現場の点灯・理由が一致しているか確かめよう。");return;
  }
 }
 if(target.hasAttribute("data-predict")){
  if(current().mode!=="material"||!ui.selected)return;
  const guess=target.dataset.predict;if(guess!=="lit"&&guess!=="dark")return;
  ui.prediction=guess;ui.predictions[ui.selected]=guess;
  renderWorkspace();setFeedback("予想を決めたよ！通電して確かめよう。はずれても減点なし。");return;
 }
 if(current().mode==="explore"&&window.AkariBridge){
  const B=window.AkariBridge,b=ui.bridge||B.initial();
  if(target.hasAttribute("data-bridge-inspect")){
   const site=B.sites.find(x=>x.id===target.dataset.bridgeInspect);
   if(!site)return;
   if(!b.inspected.includes(site.id)){b.inspected.push(site.id);recordObservation("bridge:inspect:"+site.id,"【現地調査】"+site.name+"： "+site.finding);}
   ui.bridge=b;saveBridgeDraft();renderWorkspace();setFeedback(site.finding,"success");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-bridge-sample")){
   const id=target.dataset.bridgeSample;
   if(!B.material(id)||b.inspected.length<3)return;
   b.selected=id;b.sampleGuess=null;ui.bridge=b;saveBridgeDraft();renderWorkspace();
   setFeedback(B.material(id).name+"を選んだ。予想してから実験しよう。");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-bridge-guess")){
   if(!B.material(b.selected)||b.tests[b.selected])return;
   const guess=target.dataset.bridgeGuess;if(!["lit","dark"].includes(guess))return;
   b.sampleGuess=guess;saveBridgeDraft();renderWorkspace();setFeedback("仮説を立てたよ。実験で確かめよう。");return;
  }
  if(target.hasAttribute("data-bridge-test")){
   const m=B.material(b.selected);if(!m||b.inspected.length<3||b.tests[m.id]||!["lit","dark"].includes(b.sampleGuess))return;
   const actual=m.conductive?"lit":"dark";
   b.tests[m.id]={guess:b.sampleGuess,actual};
   b.sampleGuess=null;saveBridgeDraft();renderWorkspace();
   recordObservation("bridge:sample:"+m.id,"【材料実験】"+m.name+"：予想は"+(b.tests[m.id].guess==="lit"?"点灯":"消灯")+"、実際は"+(actual==="lit"?"点灯":"消灯")+"。");
   setFeedback("仮想実験："+m.name+" → "+(actual==="lit"?"豆電球が点灯した！":"豆電球は消えたまま。")+" 他の材料と比べよう。","success");reactCharacter("discover");return;
  }
  if(target.hasAttribute("data-bridge-place")){
   const slot=target.dataset.bridgePlace,id=b.selected;
   if(!["a","b"].includes(slot)||!B.material(id)||!b.tests[id]||!B.evidenceReady(b))return;
   if(b.slots[slot]===id){b.slots[slot]=null;}
   else{const other=slot==="a"?"b":"a";if(b.slots[other]===id)b.slots[other]=null;b.slots[slot]=id;}
   b.repairGuess=null;b.repairResult=null;b.reason=null;saveBridgeDraft();renderWorkspace();renderScene();
   setFeedback("修理"+slot.toUpperCase()+"の材料を変更した。以前の通電結果は無効になったよ。");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-bridge-repair-guess")){
   const v=target.dataset.bridgeRepairGuess;if(!["lit","dark"].includes(v)||!b.slots.a||!b.slots.b)return;
   b.repairGuess=v;b.repairResult=null;b.reason=null;saveBridgeDraft();renderWorkspace();renderScene();
   setFeedback("修理回路の予想を決めた。仮想通電で確かめよう。");return;
  }
  if(target.hasAttribute("data-bridge-repair-test")){
   if(!b.slots.a||!b.slots.b||!b.repairGuess||!B.evidenceReady(b))return;
   const actual=B.evaluate(b.slots);
   b.repairResult={signature:B.signature(b.slots),guess:b.repairGuess,actual:actual.lit?"lit":"dark"};
   b.reason=null;saveBridgeDraft();renderWorkspace();renderScene();
   setFeedback("仮想通電："+(actual.lit?"橋のあかりがともった！科学的な理由も説明しよう。":"消灯。材料が電気を通すか、両方のすき間を見直してみよう。"),actual.lit?"success":"warning");
   reactCharacter(actual.lit?"discover":"think");return;
  }
  if(target.hasAttribute("data-bridge-reason")){
   if(!B.sceneLit(b))return;
   const reason=target.dataset.bridgeReason;if(!B.reasonOptions.some(([id])=>id===reason))return;
   b.reason=reason;saveBridgeDraft();renderWorkspace();
   setFeedback("理由を選んだ。最後に「橋の復旧を確認する」で回路の説明を確かめよう。");return;
  }
 }
 if(target.hasAttribute("data-choice")){const id=target.dataset.choice;ui.selected!==undefined&&(ui.selected=id);
 if(current().mode==="material")ui.prediction=ui.predictions[id]||null;
 if(current().mode==="explore"){return;}
 else{setFeedback("「"+(materials.find(x=>x.id===id)?.name||batteryOptions().find(x=>x.id===id)?.name||({same:"2個を同じ向き",reverse:"2個を逆向き"}[id])||id)+"」をセットしたよ。通電チェックしてみよう。");}
 renderWorkspace();reactCharacter("inspect");return;}
 if(current().id===13&&window.AkariDoubleFault){
  const D=window.AkariDoubleFault,d=ui.doubleFault||D.initial();
  if(target.hasAttribute("data-dual-view")){
   const direction=target.dataset.dualView,board=$("workspace").querySelector(".dual-diagram");
   if(!board||!["left","right"].includes(direction))return;
   board.scrollLeft=direction==="right"?board.scrollWidth-board.clientWidth:0;
   setFeedback(direction==="right"?"豆電球の横・底と戻り道の接点を確かめよう。":"乾電池の＋・−から導線の道をたどろう。");return;
  }
  if(target.hasAttribute("data-dual-part")){
   const id=target.dataset.dualPart;
   if(!D.parts.some(p=>p.id===id))return;
   d.selected=id;d.prediction=null;ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();
   setFeedback("部品を選んだよ。結果を予想してから仮想検査しよう。");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-dual-predict")){
   const value=target.dataset.dualPredict;
   if(!["good","open"].includes(value)||!d.selected||d.probes[d.selected])return;
   d.prediction=value;ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();
   setFeedback("予想を記録したよ。検査して確かめよう。");return;
  }
  if(target.hasAttribute("data-dual-test")){
   const part=D.parts.find(p=>p.id===d.selected);
   if(!part||d.probes[part.id]||!["good","open"].includes(d.prediction))return;
   const guess=d.prediction;
   d.probes[part.id]={guess,actual:part.kind};
   d.prediction=null;ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();
   recordObservation("double:probe:"+part.id,"【単体検査】"+part.name+"：予想 "+(guess==="good"?part.goodLabel:part.badLabel)+"／結果 "+(part.kind==="good"?part.goodLabel:part.badLabel)+"。");
   setFeedback("検査結果を記録した。他の部品の結果と比べよう。","success");reactCharacter("discover");return;
  }
  if(target.hasAttribute("data-dual-fix")){
   const id=target.dataset.dualFix;
   if(!D.allTested(d)||d.fixed.includes(id)||d.fixed.length>=2)return;
   if(d.fixed.length===1&&!D.secondUnlocked(d)){setFeedback("1か所修理後の実験と原因の説明を先に終えよう。","warning");return;}
   if(!["wire","contact"].includes(id)){
    setFeedback("検査結果ではその部品は正常。通り道が切れている場所を修理しよう。","warning");return;
   }
   d.fixed.push(id);d.circuitGuess=null;d.last=null;d.reason=null;
   ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();renderScene();
   recordObservation("double:fix:"+id,"【修理】"+D.parts.find(p=>p.id===id).name+"の不具合を修理。");
   setFeedback(d.fixed.length===1?"🔧 1か所修理。これで点灯するか、仮想通電して確かめよう。":"🔧 2か所修理。再度、仮想通電して点灯を確かめよう。","success");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-dual-circuit-guess")){
   if(d.fixed.length===0)return;
   const guess=target.dataset.dualCircuitGuess;if(!["lit","dark"].includes(guess))return;
   d.circuitGuess=guess;d.last=null;ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();renderScene();
   setFeedback("修理した回路の状態を予想した。仮想通電で確かめよう。");return;
  }
  if(target.hasAttribute("data-dual-circuit-test")){
   if(d.fixed.length===0||!d.circuitGuess||!D.allTested(d))return;
   const result=D.evaluate(d.fixed);
   d.last={signature:result.signature,kind:result.kind,guess:d.circuitGuess};
   if(d.fixed.length===1)d.firstDark={signature:result.signature,guess:d.circuitGuess,actual:result.kind};
   ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();renderScene();
   recordObservation("double:circuit:"+result.signature,"【仮想通電】修理 "+result.signature+"：予想 "+(d.circuitGuess==="lit"?"点灯":"消灯")+"／実際 "+(result.lit?"点灯":"消灯")+"。");
   setFeedback(result.lit?"💡 灯台が点灯！電池から豆電球を通り戻る道を説明しよう。":"まだ消灯している。別の故障が残っている証拠を探そう。",result.lit?"success":"warning");
   reactCharacter(result.lit?"discover":"think");return;
  }
  if(target.hasAttribute("data-dual-insight")){
   if(!d.firstDark||d.fixed.length!==1)return;
   const reason=target.dataset.dualInsight;
   if(!["other-gap","weak","one-ok"].includes(reason))return;
   d.insight=reason;ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();
   setFeedback(reason==="other-gap"?"消灯の理由がつながった！ほかの故障を修理しよう。":"1か所を修理した後の検査結果をもう一度考えよう。",reason==="other-gap"?"success":"warning");return;
  }
  if(target.hasAttribute("data-dual-reason")){
   if(d.fixed.length!==2||!d.last||d.last.kind!=="lit")return;
   const reason=target.dataset.dualReason;
   if(!["loop","bulb","one"].includes(reason))return;
   d.reason=reason;ui.doubleFault=d;saveDoubleFaultDraft();renderWorkspace();renderScene();
   setFeedback("説明を選んだよ。画面下の最終確認で復旧を報告しよう。");return;
  }
 }
 if(target.hasAttribute("data-inspect")){
  if(current().mode!=="repair")return;
  const id=target.dataset.inspect,part=repairParts().find(x=>x.id===id);if(!part)return;
  if(!ui.inspected.includes(id))ui.inspected.push(id);
  setFeedback(part.name+"：観察したよ。"+part.detail,part.broken?"warning":"");
  recordObservation("inspect:"+id,part.name+"："+part.detail);
  reactCharacter("inspect");renderWorkspace();return;
 }
 if(target.hasAttribute("data-suspect")){
  if(current().mode!=="repair"||ui.diagnosed)return;
  const id=target.dataset.suspect;
  if(!ui.inspected.includes(id))return;
  ui.suspected=ui.suspected.includes(id)?ui.suspected.filter(x=>x!==id):[...ui.suspected,id];
  renderWorkspace();setFeedback("原因の予想を選んだよ。観察した3つの部品と比べてみよう。");return;
 }
 if(target.hasAttribute("data-diagnose")){
  if(current().mode!=="repair"||ui.diagnosed)return;
  const parts=repairParts();if(parts.some(x=>!ui.inspected.includes(x.id))){setFeedback("3つとも調べてから原因を診断しよう。","warning");return;}
  const actual=parts.filter(x=>x.broken).map(x=>x.id);
  const correct=ui.suspected.length===actual.length&&ui.suspected.every(id=>actual.includes(id));
  if(!correct){setFeedback("その予想では、観察した証拠と合わない部分があるよ。もう一度見比べよう。予想が外れても減点なし。","warning");reactCharacter("think");return;}
  ui.diagnosed=true;
  recordObservation("diagnosis",actual.map(id=>parts.find(x=>x.id===id).name).join("と")+"に故障があると、観察結果から判断した。");
  renderWorkspace();setFeedback("🔍 診断成功！ 原因を見つけたよ。正しい場所を修理して確かめよう。","success");reactCharacter("discover");return;
 }
 if(target.hasAttribute("data-fix")){
  if(current().mode!=="repair"||!ui.diagnosed)return;
  const id=target.dataset.fix,part=repairParts().find(x=>x.id===id);
  if(!part||!part.broken||!ui.suspected.includes(id))return;
  if(!ui.fixed.includes(id))ui.fixed.push(id);
  recordObservation("fixed:"+id,part.name+"を修理した。");
  setFeedback("🔧 修理完了！ 残りの故障がないか確かめよう。","success");reactCharacter("discover");renderWorkspace();return;
 }
 if(target.hasAttribute("data-design")){ui.design=target.dataset.design;ui.trials={};ui.conclusion=null;renderWorkspace();setFeedback("回路を"+(ui.design==="series"?"直列":"並列")+"に組み替えたよ。4通りを試そう。");return;}
 if(target.hasAttribute("data-switch")){const key=target.dataset.switch;ui[key]=!ui[key];renderWorkspace();setFeedback("スイッチを切り替えたよ。通電して記録しよう。");return;}
 if(target.hasAttribute("data-conclude")){
  if(current().mode!=="logic"||Object.keys(ui.trials).length!==4)return;
  const value=target.dataset.conclude;if(value!=="both"&&value!=="either")return;
  ui.conclusion=value;renderWorkspace();setFeedback("まとめを選んだよ。実験の記録と合っているか通電チェック！");return;
 }
 if(target.hasAttribute("data-why")){
  const value=target.dataset.why;
  if(!["voltage","size","shape","seriesAdds","always","cancel","single"].includes(value))return;
  ui.why=value;renderWorkspace();setFeedback("理由を選んだよ。観察した2つの結果と合っているかな？");return;
 }
 if(target.hasAttribute("data-answer")){ui.answer=target.dataset.answer;renderWorkspace();setFeedback("結論を選んだよ。理由も説明してから通電チェック！");return;}
 if(current().mode==="cut"&&window.AkariSafety){
  const B=window.AkariSafety,q=ui.safety||B.empty(),job=B.stages[q.index];
  if(target.hasAttribute("data-safe-view")){
   const board=$("workspace").querySelector(".safety-diagram"),direction=target.dataset.safeView;
   if(!board||!["left","right"].includes(direction))return;
   board.scrollLeft=direction==="right"?board.scrollWidth-board.clientWidth:0;
   setFeedback(direction==="right"?"豆電球の横・底の接点と導線を調べよう。":"乾電池の＋・−極から導線をたどろう。");return;
  }
  if(target.hasAttribute("data-safe-wire")){
   const id=target.dataset.safeWire;
   if(!job.wires.some(w=>w.id===id))return;
   q.removed=q.removed.includes(id)?q.removed.filter(x=>x!==id):[...q.removed,id];
   q.guess=null;q.measured=null;q.reason=null;
   ui.safety=q;saveSafetyDraft();renderWorkspace();
   setFeedback("導線"+id+"を"+(q.removed.includes(id)?"外した":"つなぎ直した")+"。新しい状態の結果を予想しよう。");return;
  }
  if(target.hasAttribute("data-safe-guess")){
   const guess=target.dataset.safeGuess;
   if(!["lit","open","short"].includes(guess))return;
   q.guess=guess;q.measured=null;saveSafetyDraft();renderWorkspace();
   setFeedback("予想を決めたよ。仮想実験で確かめてみよう。");return;
  }
  if(target.hasAttribute("data-safe-test")){
   if(!q.guess)return;
   const result=B.evaluate(q.index,q.removed);
   q.measured={signature:B.signature(q.index,q.removed),guess:q.guess,actual:result.kind};
   saveSafetyDraft();renderWorkspace();
   if(result.short){window.AkariEffects?.shortCircuit?.();setFeedback("⚠ 仮想実験：豆電球を通らず乾電池の両極がつながるショートの危険。現実には試さず、図を直そう。","warning");reactCharacter("danger");}
   else if(!result.lit){setFeedback("回路が切れて消灯した。ショートを避けるだけでなく、豆電球の輪を残そう。","warning");reactCharacter("think");}
   else if(!B.canAdvance(q)){setFeedback("安全な点灯を確認。予想や切断本数をもう一度考えてみよう。","warning");reactCharacter("think");}
   else{setFeedback("✨ 安全に点灯！予想と一致し、必要最小限の修理で危険をなくした。","success");reactCharacter("discover");}
   return;
  }
  if(target.hasAttribute("data-safe-next")){
   if(!B.canAdvance(q)||q.index>=B.stages.length-1)return;
   recordObservation("safety:"+q.index,"【安全点検】"+job.name+"：導線"+q.removed.join("・")+"を外し、安全な豆電球の輪を残した。");
   ui.safety={...B.empty(),index:q.index+1};saveSafetyDraft();renderWorkspace();
   setFeedback("🌉 修理完了！ 次の場所には違う分かれ道がある。図から考えよう。","success");reactCharacter("walk");return;
  }
  if(target.hasAttribute("data-safe-reason")){
   if(!B.canAdvance(q)||q.index!==B.stages.length-1)return;
   q.reason=target.dataset.safeReason;saveSafetyDraft();renderWorkspace();
   setFeedback("最後の説明を選んだよ。下の最終確認を押してみよう。");return;
  }
 }
 if(current().mode==="finale"&&window.AkariFinaleLab){
  const B=window.AkariFinaleLab,q=ui.finale||B.initial();
  if(target.hasAttribute("data-finale-next")){
   if(!q.tests[q.active]?.[q.selected[q.active]])return;
   const next=B.nextUntested(q);
   if(!next)return;
   q.active=next.station;q.selected[next.station]=next.option;q.guess=null;
   ui.finale=q;saveFinaleDraft();renderWorkspace();
   setFeedback("次の未実験の条件を用意した。結果を予想してから仮想実験しよう。");return;
  }
  if(target.hasAttribute("data-finale-view")){
   const panel=$("workspace").querySelector(".finale-circuit"),view=target.dataset.finaleView;
   if(!panel||!["left","right"].includes(view))return;
   panel.scrollLeft=view==="right"?panel.scrollWidth-panel.clientWidth:0;
   setFeedback(view==="right"?"豆電球の2つの金属接点と戻り道をたどろう。":"乾電池の向きから回路をたどろう。");return;
  }
  if(target.hasAttribute("data-finale-station")){
   const id=target.dataset.finaleStation;if(!B.stations.some(x=>x.id===id))return;
   q.active=id;q.guess=null;ui.finale=q;saveFinaleDraft();renderWorkspace();
   setFeedback("検査する場所を切り替えた。別の条件と比較しよう。");return;
  }
  if(target.hasAttribute("data-finale-option")){
   const id=target.dataset.finaleOption;if(!B.option(q.active,id))return;
   q.selected[q.active]=id;q.guess=null;ui.finale=q;saveFinaleDraft();renderWorkspace();
   setFeedback("試験の条件を選んだ。点灯するか予想してから測ろう。");return;
  }
  if(target.hasAttribute("data-finale-guess")){
   const guess=target.dataset.finaleGuess;
   if(!["bright","dark"].includes(guess)||q.tests[q.active]?.[q.selected[q.active]])return;
   q.guess=guess;ui.finale=q;saveFinaleDraft();renderWorkspace();
   setFeedback("予想を書き込んだ。安全な仮想検査で確かめよう。");return;
  }
  if(target.hasAttribute("data-finale-test")){
   const station=q.active,value=q.selected[station];
   if(!q.guess||q.tests[station]?.[value]||!B.option(station,value))return;
   const actual=B.trialResult(station,value),guess=q.guess;
   q.tests[station]=q.tests[station]||{};q.tests[station][value]={actual,guess};
   q.guess=null;ui.finale=q;saveFinaleDraft();renderWorkspace();
   recordObservation("final:trial:"+station+":"+value,"【最終試験】"+B.stations.find(s=>s.id===station).title+"「"+B.option(station,value).name+"」→予想 "+(guess==="bright"?"点灯":"消灯")+"、実際 "+(actual==="bright"?"点灯":"消灯")+"。");
   setFeedback("実験結果を記録した。予想が外れても減点はないよ。別の条件も調べよう。","success");
   reactCharacter("discover");return;
  }
  if(target.hasAttribute("data-finale-install")){
   const station=q.active,value=q.selected[station];
   if(!q.tests[station]?.[value])return;
   q.installed[station]=value;q.overallGuess=null;q.overall=null;q.reason=null;
   ui.finale=q;saveFinaleDraft();renderWorkspace();renderScene();
   setFeedback("試験済みの部品を灯台の回路へ設置した。前の回路の通電結果は使えないよ。");reactCharacter("inspect");return;
  }
  if(target.hasAttribute("data-finale-overall-guess")){
   if(!B.evidence(q)||!B.stations.every(x=>q.installed[x.id]))return;
   const guess=target.dataset.finaleOverallGuess;if(!["bright","dark"].includes(guess))return;
   q.overallGuess=guess;q.overall=null;q.reason=null;ui.finale=q;saveFinaleDraft();renderWorkspace();renderScene();
   setFeedback("3部品を組み合わせた回路の結果を予想した。仮想通電で確認しよう。");return;
  }
  if(target.hasAttribute("data-finale-overall-test")){
   if(!B.evidence(q)||!B.stations.every(x=>q.installed[x.id])||!q.overallGuess)return;
   const result=B.evaluate(q.installed);
   q.overall={signature:B.signature(q.installed),guess:q.overallGuess,kind:result.kind};
   q.reason=null;ui.finale=q;saveFinaleDraft();renderWorkspace();renderScene();
   recordObservation("final:assembled:"+B.signature(q.installed),"【灯台の仮想通電】3つの部品を組み立て、予想 "+(q.overallGuess==="bright"?"点灯":"消灯")+"／実際 "+(result.kind==="bright"?"点灯":"消灯")+"。");
   setFeedback(result.closed?"🌟 灯台の光が戻った！最後に回路が光った理由を考えよう。":"まだ暗い。電池・材料・接点の試験結果をもとに設置を見直そう。",result.closed?"success":"warning");
   reactCharacter(result.closed?"discover":"think");return;
  }
  if(target.hasAttribute("data-finale-reason")){
   if(q.overall?.kind!=="bright"||q.overall.signature!==B.signature(q.installed))return;
   const reason=target.dataset.finaleReason;if(!B.reasons.some(([id])=>id===reason))return;
   q.reason=reason;ui.finale=q;saveFinaleDraft();renderWorkspace();
   setFeedback("理由を選んだ。実験記録・全体の点灯・科学的な説明が一致したら最後の依頼に進めるよ。");return;
  }
 }
}
function modal(open){const box=$("helpModal");box.hidden=!open;if(open){helpReturnFocus=document.activeElement;$("closeHelpBtn").focus();}else if(helpReturnFocus&&typeof helpReturnFocus.focus==="function")helpReturnFocus.focus();}
function bind(){
 $("missionList").addEventListener("click",e=>{const b=e.target.closest("[data-mission]");if(b)changeMission(+b.dataset.mission)});
 $("workspace").addEventListener("click",handleWorkspace);
 $("workspace").addEventListener("akari-wire-cut",e=>{
  if(stageComplete||!e.detail)return;
  const {kind,key}=e.detail;
  if(typeof key!=="string")return;
  if(kind==="wire"&&!ui.builder&&!ui.switchLab&&current().mode==="wire"){
   const index=ui.wires.findIndex(w=>w.slice().sort().join("")===key);
   if(index<0)return;
   const wasLit=circuitStatus(ui.wires).lit;
   ui.wires.splice(index,1);ui.selected=null;
   renderWorkspace();setFeedback(wasLit&&!circuitStatus(ui.wires).lit?"◯ きえた。もういちど つなごう。":"✂️ 1本 きったよ。");
   return;
  }
  if(kind==="builder"&&ui.builder&&window.AkariBuilder){
   const B=window.AkariBuilder,b=ui.builder;
   const index=b.wires.findIndex(w=>B.edge(...w)===key);
   if(index<0)return;
   b.wires.splice(index,1);b.selected=null;
   b.tests={};b.trace=[];b.insight=null;
   saveBuilderDraft();renderWorkspace();setFeedback("✂️ 1本 きったよ。");
   return;
  }
  if(kind==="network"&&ui.switchLab&&window.AkariSwitchLab){
   const B=window.AkariSwitchLab,l=ui.switchLab;
   const index=l.wires.findIndex(w=>B.edge(...w)===key);
   if(index<0)return;
   l.wires.splice(index,1);l.selected=null;
   l.trials={};l.reason=null;l.insight=null;
   saveSwitchDraft();renderWorkspace();setFeedback("✂️ 1本 きったよ。");
  }
 });
 $("checkBtn").addEventListener("click",check);
 $("readTaskBtn").addEventListener("click",speakReadingTask);
 $("yomiEssentials").addEventListener("click",()=>{
  allYomi=false;try{localStorage.setItem(yomiKey,"essentials");}catch(e){}
  applyReading();
 });
 $("yomiAll").addEventListener("click",()=>{
  allYomi=true;try{localStorage.setItem(yomiKey,"all");}catch(e){}
  applyReading();
 });
 $("readingToggle").addEventListener("click",()=>{
  detailMode=!detailMode;try{localStorage.setItem(readingKey,detailMode?"full":"easy");}catch(e){}
  applyReading();
 });
 $("nextBtn").addEventListener("click",()=>changeMission(Math.min(14,state.active+1)));
 $("resetBtn").addEventListener("click",()=>{stopReadingTask();clearTransferDraft(current().id);clearBuilderDraft();ui=initial(current());if(current().id===12)clearSafetyDraft();if(current().id===3)clearBridgeDraft();if([4,5].includes(current().id))clearGardenDraft(current().id);if([9,10,11].includes(current().id))clearBatteryDraft(current().id);if(current().id===13)clearDoubleFaultDraft();if(current().id===14)clearFinaleDraft();stageComplete=false;hintIndex=0;failures=0;resetPresentation();renderAll()});
 $("hintBtn").addEventListener("click",()=>{if(stageComplete)return;if(ui.switchLab){setFeedback("💡 2つのスイッチそれぞれの入口・出口から電池と豆電球までの道をたどろう。片方だけONでもつながる道はあるかな？","success");reactCharacter("think");return;}if(ui.builder){setFeedback(ui.builderTask==="direct"?"💡 乾電池の＋から豆電球の金属の横・底を通って−に戻れるかな？ ガラスでは電気を通さないよ。":"💡 電気の道を指でたどろう。ONでだけ閉じる道を通り、豆電球の横と底を経て電池に戻れるかな？ 直接＋と−をつなぐ道は作らないでね。","success");reactCharacter("think","どの道を通るノン？");return;}if(ui.transfer){setFeedback("💡 "+(window.AkariTransfer?.hint(current().id)||"3つの回路の電気の道をたどってみよう。"),"success");reactCharacter("think","通り道をたどるノン！");hintIndex=Math.max(hintIndex,1);return;}const h=current().hints;setFeedback("💡 "+h[Math.min(hintIndex,h.length-1)],"success");reactCharacter("think","ヒントを見てみるノン");hintIndex=Math.min(hintIndex+1,h.length)});
 $("mapToggle").addEventListener("click",()=>{const s=$("sidebar"),open=s.classList.toggle("open");$("mapToggle").setAttribute("aria-expanded",String(open));$("mapToggle").textContent=open?"閉じる ▴":"開く ▾"});
 $("soundBtn").addEventListener("click",()=>{state.sound=!state.sound;persist();renderHeader();playTone(true)});
 $("helpBtn").addEventListener("click",()=>modal(true));
 $("closeHelpBtn").addEventListener("click",()=>modal(false));
 $("closeHelpSecondary").addEventListener("click",()=>modal(false));
 $("helpModal").addEventListener("click",e=>{if(e.target===$("helpModal"))modal(false)});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("helpModal").hidden)modal(false);if(e.key==="Tab"&&!$("helpModal").hidden){const focusable=[...$("helpModal").querySelectorAll("button")],first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
}
// The actual circuit remains editable until a learner explains the result.
window.AkariLiveWire={
 getStatus:()=>current().mode==="wire"?circuitStatus(ui.wires):null,
 complete:()=>{
  if(stageComplete||current().mode!=="wire"||ui.transfer||ui.builder||ui.switchLab)return false;
  if(!circuitStatus(ui.wires).lit)return false;
  success();
  return true;
 }
};
function boot(){ui=restoreMissionUI(current());bind();persist();renderAll();initializeCharacter();window.scrollTo(0,0);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();