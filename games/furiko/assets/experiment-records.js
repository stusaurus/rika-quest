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
const api={KEY,DISC,valid,restore,compare};
if(typeof module!=='undefined')module.exports=api;
if(!root.document)return;
root.RikaExperiments=api;
let records=[];try{records=restore(localStorage.getItem(KEY))}catch(_){}
let selected=[];
const active=()=>typeof state!=='undefined'&&state.view==='world'&&state.sid==='s01';
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,records}));return true}catch(_){return false}}
function render(){const box=document.getElementById('rq-records');if(!box)return;
 box.innerHTML='<summary>実験記録・比較（'+records.length+'件）</summary><p>予想：条件を1つだけ変えたら、1往復の時間はどうなる？</p><p>同じ位置から出発して反対側を通り、元の位置に戻るまでが1往復。ここでは10往復の計算値÷10を記録します（シミュレーション）。</p><button type="button" data-rq-measure>今の振り子を測定して記録</button><div style="max-height:180px;overflow:auto">'+records.slice().reverse().map(r=>'<label style="display:block;padding:8px"><input type="checkbox" data-rq-order="'+r.order+'" '+(selected.includes(r.order)?'checked':'')+'> #'+r.order+'：'+r.length+'cm / '+r.mass+'g / '+r.amp+'° / '+r.period.toFixed(3)+'秒</label>').join('')+'</div><button type="button" data-rq-compare>選んだ2件を比較</button><div role="status" data-rq-result></div>';
}
function measure(){const v=state.pValues;const order=records.reduce((n,r)=>Math.max(n,r.order),0)+1;const r={order,length:Number(v.length),mass:Number(v.mass),amp:Number(v.amp),period:period(v.length,v.amp)};if(!valid(r))return;records.push(r);const saved=save();render();const result=document.querySelector('[data-rq-result]');if(result)result.textContent=saved?'記録したよ。条件を1つ変えて、もう一度測ってみよう。':'記録したよ。この端末では保存できないため、画面を閉じると失われます。';}
function mount(){if(!active())return;const run=document.getElementById('runStage');if(!run||document.getElementById('rq-records'))return;const box=document.createElement('details');box.id='rq-records';box.style.cssText='margin:12px 0;padding:12px;border:1px solid #a8c8c8;border-radius:10px;max-width:100%;overflow-wrap:anywhere';run.parentElement.insertAdjacentElement('afterend',box);render();}
document.addEventListener('click',e=>{if(!active())return;
 if(e.target.closest('#runStage,[data-rq-measure]'))measure();
 if(e.target.closest('[data-rq-compare]')){const out=document.querySelector('[data-rq-result]');if(selected.length!==2){out.textContent='記録を2件選ぼう。';return;}const pair=selected.map(n=>records.find(r=>r.order===n)),result=compare(...pair);out.textContent=result.hint;
 if(result.changed)out.insertAdjacentHTML('afterbegin','<strong>変えた条件：'+result.changed.map(k=>({length:'長さ',mass:'重さ',amp:'振れ幅'})[k]).join('・')+'</strong><br>');
 if(result.id){let found={};try{found=JSON.parse(localStorage.getItem(DISC)||'{}');if(!found||typeof found!=='object'||Array.isArray(found))found={};found[result.id]=true;localStorage.setItem(DISC,JSON.stringify(found));document.dispatchEvent(new CustomEvent('rika:discovery'));out.textContent='✦ 発見！ '+result.hint}catch(_){out.textContent+='（発見を保存できませんでした）';}}
 }
});
document.addEventListener('change',e=>{if(!e.target.matches('[data-rq-order]'))return;const n=Number(e.target.dataset.rqOrder);if(e.target.checked){if(selected.length===2){e.target.checked=false;return;}selected.push(n)}else selected=selected.filter(x=>x!==n);});
new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount();
})(typeof window==='undefined'?globalThis:window);
