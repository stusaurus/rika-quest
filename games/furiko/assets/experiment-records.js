(function(root){
'use strict';
const KEY='furiko-experiments-v1', DISC='furiko-clocktower-discoveries-v028';
const valid=r=>r&&Number.isSafeInteger(r.order)&&r.order>0&&['length','mass','amp','period'].every(k=>Number.isFinite(r[k])&&r[k]>0)&&r.length<=140&&r.mass<=100&&r.amp<=30;
function restore(raw){try{const d=JSON.parse(raw);return d?.version===1&&Array.isArray(d.records)?d.records.filter(valid):[]}catch(_){return []}}
function compare(a,b){
 if(!valid(a)||!valid(b))return {hint:'測定した記録を2件選ぼう。'};
 const changed=['length','mass','amp'].filter(k=>a[k]!==b[k]);
 if(changed.length!==1)return {changed,hint:changed.length?'一度に変える条件は1つ。他の2つを同じにして測ろう。':'同じ条件の記録だね。条件を1つだけ変えて測ろう。'};
 const k=changed[0];
 if(Math.max(a.amp,b.amp)>15)return {changed,hint:'小さな振れ幅（5〜15°）で比べよう。大きな振れ幅では周期が少し長くなるよ。'};
 const rel=Math.abs(a.period-b.period)/Math.min(a.period,b.period);
 if(k==='length'&&((a.length-b.length)*(a.period-b.period)<=0||rel<.02))return {changed,hint:'長さの差をもう少し大きくして測ってみよう。'};
 if(k!=='length'&&rel>.02)return {changed,hint:'他の条件をそろえ、小さな振れ幅で測り直そう。'};
 return {changed,id:k==='amp'?'record':k,hint:k==='length'?'長い振り子ほど1往復に時間がかかる！':k==='mass'?'重さだけ変えても、1往復の時間はほぼ同じ！':'小さな振れ幅では、振れ幅だけ変えても周期はほぼ同じ！'};
}
function award(storage,id){if(!id)return false;let found=JSON.parse(storage.getItem(DISC)||'{}');if(!found||typeof found!=='object'||Array.isArray(found))throw Error('invalid discovery save');if(found[id]===true)return false;found[id]=true;storage.setItem(DISC,JSON.stringify(found));return true;}
function previousPair(history){return history.length>1?history.slice(-2):null;}
const api={KEY,DISC,valid,restore,compare,award,previousPair};
if(typeof module!=='undefined')module.exports=api;
if(!root.document)return;
root.RikaExperiments=api;
let records=[];try{records=restore(localStorage.getItem(KEY))}catch(_){}
let selected=[];
const active=()=>typeof state!=='undefined'&&state.view==='world'&&state.sid==='s01';
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,records}));return true}catch(_){return false}}
let discoveredNow=false;let busy=false, lastResult='最初の測定をしてみよう。';
const names={length:'長さ',mass:'重さ',amp:'振れ幅'},units={length:'cm',mass:'g',amp:'°'};
function showComparison(pair){const result=compare(...pair);const [a,b]=pair;
 let text=(result.changed||[]).map(k=>names[k]+' '+a[k]+units[k]+' → '+b[k]+units[k]).join('／')||'同じ条件で再測定';
 text+='。前回 '+a.period.toFixed(3)+'秒 → 今回 '+b.period.toFixed(3)+'秒。'+result.hint;
 if(result.id){try{if(award(localStorage,result.id)){text='✦ 発見！ '+text;discoveredNow=true;document.dispatchEvent(new CustomEvent('rika:discovery'));}}catch(_){text+='（発見を保存できませんでした）';}}
 lastResult=text;
}
function render(){const box=document.getElementById('rq-records');if(!box)return;
 box.innerHTML='<button type="button" data-rq-measure '+(busy?'disabled':'')+'>振り子を観察して測定</button><p role="status" aria-live="polite" data-rq-result></p><details><summary>過去の記録を選んで比較（'+records.length+'件）</summary><p>1往復：出発した位置から反対側を通り、元の位置に戻るまで。2往復の動きを観察後、10往復の計算値÷10を記録します（シミュレーション）。「ほぼ同じ」は差が2%以内です。</p><div style="max-height:180px;overflow:auto">'+records.slice().reverse().map(r=>'<label style="display:block;padding:10px"><input type="checkbox" data-rq-order="'+r.order+'" '+(selected.includes(r.order)?'checked':'')+'> #'+r.order+'：'+r.length+'cm / '+r.mass+'g / '+r.amp+'° / '+r.period.toFixed(3)+'秒</label>').join('')+'</div><button type="button" data-rq-compare>選んだ2件を比較</button></details>';
 box.querySelector('[data-rq-result]').textContent=lastResult;celebrate();
 box.querySelectorAll('button').forEach(b=>{b.style.minHeight='44px';b.style.maxWidth='100%'});
}
function celebrate(){if(!discoveredNow)return;discoveredNow=false;const node=document.querySelector('[data-rq-result]');if(node?.animate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)node.animate([{backgroundColor:'#c6a84e80'},{backgroundColor:'transparent'}],{duration:900});}
function measure(runExperiment){if(busy)return;const run=document.getElementById('runStage'),v={...state.pValues};const r={order:records.reduce((n,r)=>Math.max(n,r.order),0)+1,length:Number(v.length),mass:Number(v.mass),amp:Number(v.amp),period:period(v.length,v.amp)};if(!valid(r))return;
 busy=true;lastResult='振り子の2往復を観察中…';render();
 const inputs=[...document.querySelectorAll('#rng-length,#rng-mass,#rng-amp')];const disabled=inputs.map(e=>e.disabled);inputs.forEach(e=>e.disabled=true);const runDisabled=run.disabled;run.disabled=true;
 setTimeout(()=>{busy=false;inputs.forEach((e,i)=>e.disabled=disabled[i]);run.disabled=runDisabled;
 if(!active()||!run.isConnected){lastResult='画面を移動したため測定を中止したよ。';render();return;}
 records.push(r);const saved=save();lastResult='記録 #'+r.order+'：'+r.period.toFixed(3)+'秒。条件を1つだけ変えて、もう一度試そう。';const pair=previousPair(records);if(pair)showComparison(pair);if(!saved)lastResult+='（履歴を保存できませんでした）';render();if(runExperiment)runStage();
 },r.period*2000);
}
function mount(){if(!active())return;const run=document.getElementById('runStage');if(!run||document.getElementById('rq-records'))return;const box=document.createElement('section');box.id='rq-records';box.setAttribute('aria-label','測定結果と実験記録');box.style.cssText='margin:10px 0;padding:10px;border:1px solid #a8c8c8;border-radius:10px;max-width:100%;overflow-wrap:anywhere';run.parentElement.insertAdjacentElement('afterend',box);render();}
document.addEventListener('click',e=>{if(!active())return;
 if(e.target.closest('#runStage,[data-rq-measure]')){e.preventDefault();e.stopImmediatePropagation();measure(!!e.target.closest('#runStage'));return;}
 if(e.target.closest('[data-rq-compare]')){if(selected.length!==2)lastResult='記録を2件選ぼう。';else showComparison(selected.map(n=>records.find(r=>r.order===n)));const out=document.querySelector('[data-rq-result]');if(out)out.textContent=lastResult;celebrate();}
},true);
document.addEventListener('change',e=>{if(!e.target.matches('[data-rq-order]'))return;const n=Number(e.target.dataset.rqOrder);if(e.target.checked){if(selected.length===2){e.target.checked=false;return;}selected.push(n)}else selected=selected.filter(x=>x!==n);});
new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount();
})(typeof window==='undefined'?globalThis:window);
