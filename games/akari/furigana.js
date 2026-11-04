"use strict";
(function(){
/* Keep the original written text and experiment data intact. Readings are
   generated from data-yomi on an empty rt so textContent stays unchanged. */
const entries=[
["乾電池","かんでんち"],["豆電球","まめでんきゅう"],["電球","でんきゅう"],["電池","でんち"],
["電気回路","でんきかいろ"],["回路","かいろ"],["電気","でんき"],["電圧","でんあつ"],["電流","でんりゅう"],["電源","でんげん"],
["導線","どうせん"],["導体","どうたい"],["不導体","ふどうたい"],["絶縁","ぜつえん"],["金属","きんぞく"],["接点","せってん"],
["端子","たんし"],["両極","りょうきょく"],["正極","せいきょく"],["負極","ふきょく"],["直列","ちょくれつ"],["並列","へいれつ"],
["定格超過","ていかくちょうか"],["定格","ていかく"],["接触","せっしょく"],["実験","じっけん"],["予想","よそう"],
["観察","かんさつ"],["確認","かくにん"],["結果","けっか"],["記録","きろく"],["比較","ひかく"],["説明","せつめい"],
["理由","りゆう"],["原因","げんいん"],["検査","けんさ"],["検証","けんしょう"],["推理","すいり"],["調査","ちょうさ"],
["証拠","しょうこ"],["発見","はっけん"],["測定","そくてい"],["条件","じょうけん"],["同条件","どうじょうけん"],
["材料","ざいりょう"],["試料","しりょう"],["種類","しゅるい"],["部分","ぶぶん"],["部品","ぶひん"],["修理","しゅうり"],
["復旧","ふっきゅう"],["点灯","てんとう"],["消灯","しょうとう"],["通電","つうでん"],["断線","だんせん"],
["短絡","たんらく"],["過電圧","かでんあつ"],["発熱","はつねつ"],["発火","はっか"],["危険","きけん"],["安全","あんぜん"],
["注意","ちゅうい"],["電極","でんきょく"],["抵抗","ていこう"],["電流計","でんりゅうけい"],["電圧計","でんあつけい"],
["状態","じょうたい"],["正常","せいじょう"],["異常","いじょう"],["故障","こしょう"],["回復","かいふく"],
["成功","せいこう"],["失敗","しっぱい"],["不正解","ふせいかい"],["正解","せいかい"],["完了","かんりょう"],
["挑戦","ちょうせん"],["冒険","ぼうけん"],["攻略","こうりゃく"],["装置","そうち"],["設備","せつび"],["設計","せっけい"],
["実物","じつぶつ"],["仮想","かそう"],["方法","ほうほう"],["順番","じゅんばん"],["順序","じゅんじょ"],
["操作","そうさ"],["表示","ひょうじ"],["選択","せんたく"],["変更","へんこう"],["交換","こうかん"],["調整","ちょうせい"],
["使用","しよう"],["利用","りよう"],["必要","ひつよう"],["同時","どうじ"],["別々","べつべつ"],["再度","さいど"],
["最初","さいしょ"],["最後","さいご"],["初回","しょかい"],["今回","こんかい"],["途中","とちゅう"],["実際","じっさい"],
["全部","ぜんぶ"],["全体","ぜんたい"],["反対","はんたい"],["逆向き","ぎゃくむき"],["向き","むき"],
["明るさ","あかるさ"],["明るい","あかるい"],["光る","ひかる"],["消える","きえる"],["通る","とおる"],
["通り道","とおりみち"],["切れ目","きれめ"],["切れる","きれる"],["戻る","もどる"],["閉じる","とじる"],["開く","ひらく"],
["現場","げんば"],["実験室","じっけんしつ"],["研究所","けんきゅうじょ"],["研究","けんきゅう"],
["時計塔","とけいとう"],["時計","とけい"],["灯台","とうだい"],["博物館","はくぶつかん"],["街灯","がいとう"],
["小屋","こや"],["庭師","にわし"],["工房","こうぼう"],["港","みなと"],["橋","はし"],["村","むら"],["庭","にわ"],
["倉庫","そうこ"],["船","ふね"],["鉄","てつ"],["銅","どう"],["乾いた木","かわいたき"],
["金属片","きんぞくへん"],["仕切り","しきり"],["材質","ざいしつ"],["単1形","たんいちがた"],["単4形","たんよんがた"],
["光源","こうげん"],["強さ","つよさ"],["変化","へんか"],["長時間","ちょうじかん"],["長さ","ながさ"],
["重さ","おもさ"],["容量","ようりょう"],["獲得","かくとく"],["応用","おうよう"],["学習","がくしゅう"],
["先生","せんせい"],["生徒","せいと"],["手帳","てちょう"],["地図","ちず"],
["第1幕","だいいちまく"],["第2幕","だいにまく"],["第3幕","だいさんまく"],["第4幕","だいよんまく"],
["最終幕","さいしゅうまく"],["第3学年","だいさんがくねん"]
];
const dictionary=new Map(entries);
const terms=[...dictionary.keys()].sort((a,b)=>b.length-a.length||a.localeCompare(b,"ja"));
// All dictionary keys consist solely of literal Japanese characters and digits.
const expression=new RegExp(terms.join("|"),"g");
function tokenize(value){
 const text=String(value),out=[];let end=0;
 for(const match of text.matchAll(expression)){
  if(match.index>end)out.push({text:text.slice(end,match.index),reading:null});
  const reading=dictionary.get(match[0]);
  const following=text.slice(match.index+match[0].length);
  const written=following.startsWith("（"+reading+"）")||following.startsWith("("+reading+")");
  out.push({text:match[0],reading:written?null:reading});
  end=match.index+match[0].length;
 }
 if(end<text.length)out.push({text:text.slice(end),reading:null});
 return out;
}
const excluded=new Set(["SCRIPT","STYLE","SVG","TEXTAREA","INPUT","OPTION","CODE","PRE","RUBY","RT","RB","NOSCRIPT"]);
function eligible(node){
 if(!node?.nodeValue||!/[一-龥々]/.test(node.nodeValue))return false;
 for(let p=node.parentElement;p;p=p.parentElement){
  if(excluded.has(p.tagName)||p.classList?.contains("akari-yomi")||p.isContentEditable||p.getAttribute?.("aria-hidden")==="true")return false;
 }
 return true;
}
function decorate(node){
 if(!eligible(node))return 0;
 const fragments=tokenize(node.nodeValue);
 if(!fragments.some(x=>x.reading))return 0;
 const fragment=document.createDocumentFragment();let n=0;
 for(const x of fragments){
  if(!x.reading){fragment.appendChild(document.createTextNode(x.text));continue;}
  const ruby=document.createElement("ruby");ruby.className="akari-yomi";
  ruby.setAttribute("aria-label",x.text+"（"+x.reading+"）");
  ruby.appendChild(document.createTextNode(x.text));
  const rt=document.createElement("rt");rt.setAttribute("data-yomi",x.reading);rt.setAttribute("aria-hidden","true");
  ruby.appendChild(rt);fragment.appendChild(ruby);n++;
 }
 node.replaceWith(fragment);return n;
}
function annotate(root){
 if(!root||typeof document.createTreeWalker!=="function")return 0;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())if(eligible(walker.currentNode))nodes.push(walker.currentNode);
 return nodes.reduce((n,node)=>n+decorate(node),0);
}
function start(){
 if(!document.body||typeof document.createTreeWalker!=="function"||typeof MutationObserver==="undefined")return;
 let pending=false;
 const observer=new MutationObserver(records=>{
  const fresh=records.some(record=>[...record.addedNodes].some(node=>
   node.nodeType===3?eligible(node):node.nodeType===1&&!node.closest?.(".akari-yomi")));
  if(!fresh||pending)return;
  pending=true;
  queueMicrotask(()=>{pending=false;annotate(document.body);});
 });
 annotate(document.body);
 observer.observe(document.body,{childList:true,subtree:true});
}
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
 else start();
}
window.AkariFurigana={entries,dictionary,terms,tokenize,annotate};
})();