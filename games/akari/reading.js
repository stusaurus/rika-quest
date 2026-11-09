"use strict";
(function(){
/* Student-first copy: short action prompts, with the complete original science
 * explanations still available through the "くわしく" control. No answers are
 * given before the experiment and no existing success condition is changed. */
const copy=[
 null,
 {story:"小屋が まっくら！ まめ電球を つけよう。",steps:["電池と まめ電球を 線で つなごう。","光ったら、電気の 道を たどろう。","電気の 道が ひと回りできたかな？"]},
 {story:"まちの あかりが 消えちゃった！",steps:["線が 切れた ところを さがそう。","たりない 線を 1本 つなごう。","光ったら、どこを 直したか 考えよう。"]},
 {story:"まちの あかりが 消えちゃった！",steps:["🔎 回路の 3かしょを さわろう。","🧱 ざいりょうを えらんで ためそう。","🧩 回路の すき間を なおそう。"]},
 {story:"いろいろな 材料で じっけんだ！",steps:["同じ クリップで、つなぎ方を かえよう。","材料を かえて、光るか ためそう。","光った わけを せつめいしよう。"]},
 {story:"ピカピカの ものは みんな 光るの？",steps:["見た目で 決めずに ためそう。","3か所に 材料を おいてみよう。","あぶなくない つなぎ方を 考えよう。"]},
 {story:"時計の とうが とまっちゃった！",steps:["こわれた ところを さがそう。","なおしたら、光るか ためそう。","電気の 道を たどってみよう。"]},
 {story:"スイッチが 2つ！ どう つなぐ？",steps:["スイッチを 1つずつ おしてみよう。","4つの 場合を くらべよう。","2つとも ONで 光るように 作ろう。"]},
 {story:"どちらの スイッチでも 光らせたい！",steps:["2つの スイッチを おしてみよう。","4つの 場合を くらべよう。","どちらか ONで 光るように 作ろう。"]},
 {story:"大きい 電池の ほうが よく 光る？",steps:["電池の 大きさを かえて ためそう。","4つの 結果を くらべよう。","長く 使うなら どの 電池が いい？"]},
 {story:"電池を 2つ つないだら どうなる？",steps:["電池と まめ電球の 組み合わせを かえよう。","4つの 結果を くらべよう。","あぶなくない つなぎ方を えらぼう。"]},
 {story:"電池の 向きを かえたら 消えた！",steps:["まず、電池1この 向きを かえよう。","電池2この 向きも ためそう。","光る 向きに なおそう。"]},
 {story:"あぶない 近道を とめよう！",steps:["どの 線が あぶないかな？","線を はずして、光るか ためそう。","あぶない 道だけを なくそう。"]},
 {story:"灯台が 消えた！ こわれた所は 2つ？",steps:["4つの 部品を しらべよう。","1か所 なおして、もう一度 ためそう。","もう1か所も なおして 光らせよう。"]},
 {story:"さいごは 灯台！ みんなの 力を あわせよう。",steps:["3か所で 6つの じっけんを しよう。","しらべた 部品で 回路を 作ろう。","光った わけを せつめいしよう。"]}
];
const max=14;
const names={short:"みじかく",full:"くわしく"};
const sample=id=>copy[id]||copy[1];
function prompt(id,phase,ui={},completed=false){
 if(completed)return "できた！ じっけんの けっかを ふりかえろう。";
 if(ui.transfer)return "はじめての 回路で 3つ ためしてみよう。";
 if(ui.builder)return "自分で 線を つないで、光るか ためそう。";
 if(ui.switchLab)return "スイッチを つないで 4回 ためそう。";
 return sample(id).steps[Math.max(0,Math.min(2,phase-1))];
}
function validate(){
 return copy.slice(1).length===max&&copy.slice(1).every((m,i)=>m&&typeof m.story==="string"&&m.story.length<=38&&
   m.steps.length===3&&m.steps.every(t=>t.length<=38));
}
window.AkariReading={copy,max,names,sample,prompt,validate};
})();
