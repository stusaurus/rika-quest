"use strict";
(function(){
/* UI-only pace guide: never changes scientific scoring or the experiment graph. */
const chapters=[
 {from:1,to:3,title:"第1幕　光の通り道",tag:"通り道を見つける",principle:"乾電池から豆電球の横・底を通り、乾電池に戻る輪を作る"},
 {from:4,to:6,title:"第2幕　材料と接点",tag:"材料を調べる",principle:"接点の条件をそろえ、金属と不導体の性質を実験で比べる"},
 {from:7,to:8,title:"第3幕　スイッチの条件",tag:"点灯条件を設計する",principle:"スイッチのON/OFFを比較し、直列・並列の働きを判断する"},
 {from:9,to:11,title:"第4幕　乾電池のひみつ",tag:"電源を選ぶ",principle:"乾電池の個数・向き・容量と、豆電球の定格を使い分ける"},
 {from:12,to:14,title:"最終幕　灯台の復旧",tag:"原因を突き止める",principle:"ショートや断線を見分け、証拠に基づいて安全な回路を完成させる"}
];
const count=x=>Array.isArray(x)?x.length:Object.keys(x&&typeof x==="object"?x:{}).length;
const chapter=id=>chapters.find(x=>id>=x.from&&id<=x.to)||chapters[0];
function status(id,ui={},completed=false){
 if(completed)return {phase:3,label:"発見を記録できた！",detail:"この場所のあかりが戻った。次の冒険や、観察手帳を見よう。",count:""};
 if(ui.transfer){
  const index=Math.min(3,count(ui.transfer.answers));
  return {phase:3,label:"応用問題に挑戦",detail:"初めて見る回路を観察し、点灯の予想と理由を確かめよう。",count:index+" / 3 回路"};
 }
 if(ui.builder){
  const tests=ui.builder.tests||{};
  const n=count(tests);
  return {phase:3,label:"自由配線に挑戦",detail:"自分で導線をつなぎ、測定結果と電気の通り道を確認しよう。",count:n+" 通りの測定"};
 }
 if(ui.switchLab){
  const n=count(ui.switchLab.trials);
  return {phase:3,label:"設計を実験で証明",detail:"配線を作り、スイッチ4通りの点灯・消灯を説明しよう。",count:n+" / 4 通り"};
 }
 if(id<=2){
  const n=count(ui.wires),correct=n>=2;
  return {phase:correct?2:1,label:correct?"回路のつながりを確かめよう":"豆電球につながる道を作ろう",detail:"乾電池の＋極から豆電球の2つの金属接点を通り、−極へ戻れるかな？",count:n+" 本の導線"};
 }
 if(id===3){
  const b=ui.bridge||{},ins=count(b.inspected),tested=count(b.tests),slots=count(Object.values(b.slots||{}).filter(Boolean));
  if(ins<3)return {phase:1,label:"橋の3か所を調べる",detail:"消えた理由を、目で見える証拠から探そう。",count:ins+" / 3 か所"};
  if(!b.repairResult||slots<2)return {phase:2,label:"材料を比べ、2か所を修理する",detail:"予想と実験の結果を比べてから、回路のすき間を直そう。",count:tested+" 種類を実験"};
  return {phase:3,label:"修理結果の理由を考える",detail:"豆電球を通る電気の輪ができたか、結果から説明しよう。",count:slots+" / 2 修理"};
 }
 if(id===4){
  const g=ui.garden||{},cal=count(g.calibrations),n=count(g.trials);
  if(cal<2||g.calibrationReason!=="control")return {phase:1,label:"同じ材料で接点を比べる",detail:"変える条件は1つだけ。点灯結果の違いを観察しよう。",count:cal+" / 2 接点条件"};
  if(!g.finalReason)return {phase:2,label:"条件をそろえて材料実験",detail:"鉄・アルミ・木・プラスチックで結果の違いを確かめよう。",count:n+" 種類を調査"};
  return {phase:3,label:"実験から規則を説明する",detail:"材料の性質と、接点のつなぎ方を区別して説明しよう。",count:n+" 種類を調査"};
 }
 if(id===5){
  const g=ui.garden||{},n=count(g.tests),installed=Object.values(g.slots||{}).filter(Boolean).length;
  if(n<3)return {phase:1,label:"材料を実験で見分ける",detail:"色や光り方にだまされず、予想と通電結果を比較しよう。",count:n+" 種類の実験"};
  if(!g.measurement)return {phase:2,label:"電気の道と仕切りを設計",detail:"電気を流す部分と、電池の両極を隔てる部分を使い分けよう。",count:installed+" / 3 部品"};
  return {phase:3,label:"安全な回路を説明する",detail:"通電する部分・隔てる部分の両方の役割を確認しよう。",count:installed+" / 3 部品"};
 }
 if(id===6){
  const n=count(ui.inspected),fixed=count(ui.fixed);
  return {phase:fixed?2:1,label:fixed?"修理した回路を確かめる":"故障の証拠を探す",detail:"部品の状態を調べ、消灯の原因を特定しよう。",count:n+" か所を検査"};
 }
 if(id===7||id===8){
  const n=count(ui.trials);
  return {phase:n===4?3:2,label:n===4?"4通りをもとに考える":"スイッチの条件を測る",detail:"2つのスイッチを切り替えて、どんなときに点灯するか比べよう。",count:n+" / 4 通り"};
 }
 if(id>=9&&id<=11){
  const b=ui.batteryLab||{},n=count(b.trials);
  if(n<4)return {phase:1,label:"電池の条件を変えて比較",detail:"同じ回路の条件を1つずつ変えて、予想から実験しよう。",count:n+" / 4 実験"};
  if(!b.service)return {phase:2,label:"観察した結果を現場に使う",detail:"どの電源と豆電球を採用するか、実験結果から選ぼう。",count:"4 / 4 実験"};
  return {phase:3,label:"選んだ理由を説明する",detail:"結果だけでなく、電圧や電池の向きとの関係を確かめよう。",count:"4 / 4 実験"};
 }
 if(id===12){
  const s=ui.safety||{};
  return {phase:Math.min(3,(s.index??0)+1),label:(s.index??0)===2?"最後の安全点検":"危険な電気の近道を調べる",detail:"危険な道を減らしても、豆電球を通る輪は残せるかな？",count:((s.index??0)+1)+" / 3 点検"};
 }
 if(id===13){
  const d=ui.doubleFault||{},n=count(d.probes),fixed=count(d.fixed);
  if(n<4)return {phase:1,label:"4つの部品を検査する",detail:"電池を外した安全な仮想検査で、どこがつながらないか調べよう。",count:n+" / 4 か所"};
  if(fixed<2||!d.last||d.last.kind!=="lit")return {phase:2,label:"修理してから再測定する",detail:"1か所直したあとも、もう一度点灯を調べよう。",count:fixed+" / 2 修理"};
  return {phase:3,label:"2つの故障を説明する",detail:"なぜ片方だけでは光らず、両方直すと光ったのだろう？",count:fixed+" / 2 修理"};
 }
 if(id===14){
  const f=ui.finale||{},n=Object.values(f.tests||{}).reduce((a,v)=>a+count(v),0),installed=Object.values(f.installed||{}).filter(Boolean).length;
  if(n<6)return {phase:1,label:"3つの調査場所で比較する",detail:"2条件ずつ、合計6通りを予想してから実験しよう。",count:n+" / 6 実験"};
  if(!f.overall||f.overall.kind!=="bright")return {phase:2,label:"調査した3部品を組み合わせる",detail:"証拠をもとに取り付け、灯台全体の点灯を仮想実験しよう。",count:installed+" / 3 部品"};
  return {phase:3,label:"最後の科学的な説明",detail:"閉じた電気の輪を、部品と接点から説明しよう。",count:"6 / 6 実験"};
 }
 return {phase:1,label:"実験の準備",detail:"予想を立て、結果とその理由を確かめよう。",count:""};
}
function render(id,ui,completed){
 const c=chapter(id),p=status(id,ui,completed),stages=["調べる","実験する","考えて直す"];
 return '<div class="pacing-guide" data-guide-phase="'+p.phase+'">'+
 '<div class="pacing-heading"><span class="pacing-chapter">'+c.title+'</span><span class="pacing-count">'+p.count+'</span></div>'+
 '<div class="pacing-track" aria-label="調査・実験・考察の3段階のうち'+p.phase+'段階目">'+stages.map((label,i)=>'<span class="pacing-segment'+(completed||i+1<p.phase?" done":i+1===p.phase?" current":"")+'">'+(completed||i+1<p.phase?"✓":i+1)+' '+label+'</span>').join("")+'</div>'+
 '<div class="pacing-tip"><strong>いまの目標：'+p.label+'</strong><span>'+p.detail+'</span></div>'+
 '</div>';
}
function report(state){
 const done=new Set(Object.keys(state?.completed||{}).filter(k=>Boolean(state.completed[k])).map(Number));
 if(done.size!==14)return "";
 const tokens=Object.keys(state?.masteries||{}).filter(k=>state.masteries[k]).length;
 const list=chapters.map((c,i)=>
  '<div class="campaign-chapter"><span class="campaign-medal">'+(i+1)+'</span><div><strong>'+c.title+'</strong><p>'+c.principle+'</p></div><span class="campaign-check">✓</span></div>').join("");
 return '<div class="campaign-report"><div class="campaign-top"><span>✦ 冒険の完成記録</span><strong>14のあかりが戻った！</strong><p>実験で確かめた5つの学びを、次の理科の問題でも使おう。</p><div class="campaign-stats"><span>🌟 14 / 14 ミッション</span><span>🔍 '+tokens+' / 6 応用の証</span></div></div><div class="campaign-chapters">'+list+'</div><p class="campaign-foot">★を集めるだけでなく、予想・実験・理由をつなげて解決した記録が残っているよ。地図からいつでも遊び直せるよ。</p></div>';
}
window.AkariPacing={chapters,chapter,status,render,report};
})();
