"use strict";
(function(){
 const M=window.AkariMaterials;if(!M)return;
 const assets="./assets/mission3/";
 const asset=id=>window.AkariMaterialAssets?.[id]||assets+id+".webp";
 const image=id=>'<img src="'+asset(id)+'" alt="" draggable="false">';
 const lens='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg>';
 const scissors='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 12 12M8 16 20 4"/></svg>';
 const paths={"A-P":"M42 151V65H120","B-L":"M240 65H246V152H268","N-R":"M178 151H199V228H313V210"};
 function wirePath(a,b){
  const k=M.edge(a,b);if(paths[k])return paths[k];
  const p=M.points[a],q=M.points[b];
  if(k==="N-P")return "M42 151V199H178V151";
  // Wires travel above/below components, never behind the battery or glass.
  const y=[a,b].includes("R")?236:34;
  return 'M'+p[0]+' '+p[1]+'V'+y+'H'+q[0]+'V'+q[1];
 }
 function board(s,complete){
  const e=M.evaluate(s),center=s.contact==="left"?60:s.contact==="right"?300:180;
  let svg=window.AkariArt.workbench([],e.lit,3);
  const wires=s.wires.map(([a,b])=>'<g class="lead-on-top" data-visual-wire="'+M.edge(a,b)+'"><path class="m3-wire-outline" d="'+wirePath(a,b)+'"/><path class="wire m3-wire" d="'+wirePath(a,b)+'"/></g>').join('');
  const piece=s.installed?'<image class="m3-installed-image" data-specimen="'+s.installed+'" href="'+asset(s.installed)+'" x="'+(center-60)+'" y="44" width="120" height="42" preserveAspectRatio="xMidYMid meet"/>':'';
  svg=svg.replace('</svg>',wires+'<g class="m3-gap-art" aria-hidden="true"><rect x="110" y="39" width="140" height="47" rx="12" fill="#193b36" stroke="#d4b179" stroke-width="1.5"/>'+piece+
   '<circle cx="120" cy="65" r="4" fill="#e5c183"/><circle cx="240" cy="65" r="4" fill="#e5c183"/>'+
   (!s.installed?'<path d="m174 60 12 10m0-10-12 10" stroke="#f2c27e" stroke-width="2"/>':'')+'</g></svg>');
  const controls=Object.entries(M.points).map(([id,p])=>
   '<button type="button" class="m3-terminal" style="left:'+p[0]/4+'%;top:'+p[1]/2.5+'%" data-m3-terminal="'+id+'" '+(complete?'disabled':'')+' aria-label="'+({P:'電池のプラス',N:'電池のマイナス',L:'電球の横',R:'電球の底',A:'切れ目の左の接点',B:'切れ目の右の接点'}[id])+'">'+({P:'＋',N:'−',L:'横',R:'底',A:'A',B:'B'}[id])+'</button>').join('');
  return '<div class="m3-bench circuit-board circuit-town-board'+(e.lit?' is-lit':'')+(e.short?' is-short':'')+'" data-m3-status="'+(e.short?'short':e.lit?'lit':'dark')+'">'+
   '<div class="painted-world" data-painted-scene="3" aria-hidden="true"><div class="painted-desk"></div></div>'+
   '<div class="m3-circuit circuit-inner">'+svg+controls+
   '<button type="button" class="m3-gap'+(s.inspected?' inspected':'')+'" data-m3-gap '+(complete?'disabled':'')+' aria-label="'+(!s.inspected?'切れ目をしらべる':s.installed?M.sample(s.installed).name+(complete?'':'をはずす'):'切れ目に材料をはめる')+'" style="left:'+(s.installed?center/4:45)+'%;top:26%">'+
   (!s.inspected?lens+'<span>しらべる</span>':!s.installed?'<span>ここへ</span>':complete?'':'<span class="m3-remove-label">はずす</span>')+'</button></div>'+
   '<div class="m3-live" role="status">'+(e.short?'ショート！ せんを はずそう':e.lit?'ついた！ 街灯にも ひかりが！':s.installed?(s.contact==='both'?(M.signature(s.wires)===M.signature(M.reference)?'つかない。メモに のこしたよ':'せんの つなぎ方を 見よう'):'まるが はなれている'):s.inspected?'2つの まるに はさもう':'きれた ところを タップ')+'</div></div>';
 }
 M.render=function(raw,complete){
  const s={...M.normalize(raw),notice:raw.notice||''},e=M.evaluate(s),choice=M.sample(s.selected),compare=M.compared(s);
  const referenceWires=M.signature(s.wires)===M.signature(M.reference);
  const prompt=complete?'街灯が なおった！':!s.inspected?'きれた ところを しらべよう':s.found.length===0?'村の 材料を さがそう':e.short?'ショート！ せんを はずそう':!referenceWires?'せんを もとに もどそう':!choice?'材料を えらぼう':!s.guesses[choice.id]?'つくかな？ よそうしよう':s.installed!==choice.id?'材料を「ここへ」はこぼう':s.contact!=='both'?'2つの まるに 合わせよう':!compare?'ほかの 材料も ためそう':e.lit?'どうして ついた？':'ついた 材料で 街灯を なおそう';
  const finds=s.inspected&&!complete?M.samples.filter(m=>!s.found.includes(m.id)).map(m=>'<button class="m3-find" type="button" data-m3-find="'+m.id+'" style="left:'+m.x+'%;top:'+m.y+'%" aria-label="'+m.name+'を見つける">'+image(m.id)+'<span>みつけた？</span></button>').join(''):'';
  const tests=M.samples.filter(m=>s.tests[m.id]);
  const rows=tests.map(m=>'<li data-m3-record="'+m.id+'">'+image(m.id)+'<span>'+m.shortName+'</span><b class="'+(s.tests[m.id].actual==='lit'?'m3-lit-note':'')+'">'+(s.tests[m.id].actual==='lit'?'ついた':'つかない')+'</b></li>').join('');
  const memo='<aside class="m3-memo" aria-label="発見と実験のメモ"><h3>メモ</h3>'+(!s.inspected?'<p>みつけたことが<br>ここに のこるよ</p>':'<p class="m3-finding">ここが きれている！</p>')+
   '<ul class="m3-found-notes">'+s.found.map(id=>'<li>'+M.sample(id).shortName+'を 発見</li>').join('')+'</ul><ol class="m3-records">'+rows+'</ol>'+
   (tests.length?'<small>よそう → けっか</small><div class="m3-prediction-records">'+tests.map(m=>'<span>'+m.shortName+'：'+(s.tests[m.id].guess==='lit'?'つく':'つかない')+' → '+(s.tests[m.id].actual==='lit'?'ついた':'つかない')+'</span>').join('')+'</div>':'')+'</aside>';
  const inventory='<aside class="m3-inventory" aria-label="見つけた材料"><h3>材料</h3>'+M.samples.map(m=>s.found.includes(m.id)?'<button type="button" class="m3-item'+(s.selected===m.id?' selected':'')+'" data-m3-item="'+m.id+'" '+(complete?'disabled':'')+' aria-pressed="'+(s.selected===m.id)+'">'+image(m.id)+'<span>'+m.shortName+'</span></button>':'<span class="m3-empty" aria-label="まだ見つけていない材料">？</span>').join('')+'</aside>';
  const predict=complete||!s.inspected?'':choice?'<div class="m3-predict"><strong>'+choice.shortName+'は？</strong>'+[['lit','つく'],['dark','つかない']].map(([id,t])=>'<button type="button" data-m3-guess="'+id+'" aria-pressed="'+(s.guesses[choice.id]===id)+'">'+t+'</button>').join('')+'</div>':'<div class="m3-predict m3-predict-empty">村から 材料を さがそう</div>';
  const repaired=compare&&s.contact==='both'&&M.sample(s.installed)?.conductive&&M.signature(s.wires)===M.signature(M.reference)&&e.lit;
  const why=!complete&&repaired?'<section class="m3-why" aria-label="実験から理由を考える"><h3>なぜ あかりが ついた？</h3><p>メモの「ついた」「つかない」を 見くらべよう。</p>'+[
   ['shiny','ぴかぴかの ものなら 何でも つく'],['metal','金ぞくが 電気を 通し、ぐるっと つながった'],['one','かたほうの まるだけで 電気を 通す']].map(([id,t])=>'<button type="button" data-m3-reason="'+id+'" aria-pressed="'+(s.reason===id)+'">'+t+'</button>').join('')+'</section>':'';
  return '<section class="m3-lab'+(complete?' m3-complete':'')+'" aria-label="街灯の材料さがし" data-m3-selected="'+(s.selected||'')+'"><div class="circuit-toolbar m3-toolbar"><strong class="circuit-question">'+prompt+'</strong><button type="button" class="circuit-scissors" data-wire-cut-mode '+(complete?'disabled':'')+' aria-pressed="false" aria-label="はさみ：せんをきる">'+scissors+'<span>きる</span></button></div>'+
   '<div class="m3-village'+(e.lit&&!e.short?' is-lit':'')+'"><img class="m3-village-dark" src="'+asset('village-dark')+'" alt="街灯が消えたひかりの村" draggable="false"><img class="m3-village-lit" src="'+asset('village-lit')+'" alt="" draggable="false"><span class="m3-place">ひかりの村・材料さがし</span>'+finds+'</div>'+
   predict+'<div class="m3-workspace">'+memo+board(s,complete)+inventory+'</div>'+ (complete?'':'<p class="m3-notice" aria-live="polite">'+(s.notice||(!compare&&tests.length?'ついた 材料と つかない 材料を くらべよう。':'材料は つかんで はこぶ。タップでも はめられるよ。'))+'</p>')+why+
   (complete?'<div class="m3-victory"><strong>街灯が なおった！</strong><span>くらべて、ひみつを みつけたね。</span><p>金ぞくが 電気を 通して、電池と 電球の 輪が できた。</p></div>':'')+'</section>';
 };
 function init(){
  const root=document.getElementById('workspace');if(!root)return;
  const send=action=>root.dispatchEvent(new CustomEvent('akari-material-action',{detail:action}));
  let drag=null,ghost=null,suppress=false,wireStart=null,preview=null;
  const scene=()=>root.querySelector('.m3-lab');
  const point=e=>{
   const svg=root.querySelector('.m3-circuit svg'),matrix=svg?.getScreenCTM();
   if(!matrix)return null;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());return {x:p.x,y:p.y};
  };
  const contact=p=>!p||Math.abs(p.y-65)>31?'none':p.x>=128&&p.x<=232?'both':p.x>=28&&p.x<128?'left':p.x>232&&p.x<=332?'right':'none';
  const clear=()=>{ghost?.remove();ghost=null;preview?.remove();preview=null;root.querySelector('.m3-gap')?.classList.remove('drop-ready');};
  root.addEventListener('click',e=>{
   if(!scene())return;
   if(suppress){e.preventDefault();e.stopImmediatePropagation();suppress=false;return;}
   const b=e.target.closest('button');if(!b)return;
   if(b.hasAttribute('data-m3-find'))send({type:'find',id:b.dataset.m3Find});
   else if(b.hasAttribute('data-m3-item'))send({type:'select',id:b.dataset.m3Item});
   else if(b.hasAttribute('data-m3-guess'))send({type:'guess',value:b.dataset.m3Guess});
   else if(b.hasAttribute('data-m3-reason'))send({type:'reason',id:b.dataset.m3Reason});
   else if(b.hasAttribute('data-m3-gap')){
    if(!b.classList.contains('inspected'))send({type:'inspect'});
    else if(root.querySelector('.m3-installed-image'))send({type:'remove'});
    else send({type:'place',id:scene().dataset.m3Selected,contact:'both'});
   }else if(b.hasAttribute('data-m3-terminal')){
    const id=b.dataset.m3Terminal;
    if(wireStart&&wireStart!==id){send({type:'wire',from:wireStart,to:id});wireStart=null;}
    else{wireStart=wireStart===id?null:id;root.querySelectorAll('.m3-terminal').forEach(t=>t.classList.toggle('selected',t.dataset.m3Terminal===wireStart));}
   }
  },true);
  root.addEventListener('pointerdown',e=>{
   if(!scene()||e.button!==0||!e.isPrimary||drag)return;
   const item=e.target.closest('[data-m3-item]'),installed=e.target.closest('[data-m3-gap].inspected'),terminal=e.target.closest('[data-m3-terminal]');
   const specimen=root.querySelector('.m3-installed-image')?.dataset.specimen;
   if(!item&&!(installed&&specimen)&&!terminal)return;
   const source=item||installed||terminal;
   drag={pointerId:e.pointerId,x:e.clientX,y:e.clientY,source,id:item?.dataset.m3Item||specimen,terminal:terminal?.dataset.m3Terminal,moved:false,fromInstalled:!!installed};
   if(e.isTrusted)source.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove',e=>{
   if(!drag||drag.pointerId!==e.pointerId)return;
   if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<7)return;
   drag.moved=true;
   if(drag.terminal){
    const svg=root.querySelector('.m3-circuit svg'),p=point(e),from=M.points[drag.terminal];if(!svg||!p)return;
    if(!preview){preview=document.createElementNS('http://www.w3.org/2000/svg','path');preview.setAttribute('class','m3-wire-preview');svg.append(preview);}
    preview.setAttribute('d','M'+from[0]+' '+from[1]+'L'+p.x+' '+p.y);
   }else{
    if(!ghost){ghost=document.createElement('div');ghost.className='m3-drag-ghost';ghost.innerHTML=image(drag.id);document.body.append(ghost);}
    // The ghost, pointer and drop geometry share one center. No visual
    // offset makes the specimen appear to touch before the real contacts do.
    ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
    root.querySelector('.m3-gap')?.classList.toggle('drop-ready',contact(point(e))==='both');
   }
   if(e.cancelable)e.preventDefault();
  },{passive:false});
  function finish(e,cancel){
   if(!drag||e.pointerId!==drag.pointerId)return;
   const d=drag;drag=null;clear();
   if(d.source.hasPointerCapture?.(e.pointerId))d.source.releasePointerCapture(e.pointerId);
   if(cancel)return;
   if(!d.moved)return;
   suppress=true;setTimeout(()=>suppress=false,200);
   if(d.terminal){
    const t=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-m3-terminal]');
    if(t&&t.dataset.m3Terminal!==d.terminal){send({type:'wire',from:d.terminal,to:t.dataset.m3Terminal});wireStart=null;}
   }else{
    const c=contact(point(e));
    if(c!=='none')send({type:'place',id:d.id,contact:c});
    else if(d.fromInstalled)send({type:'remove'});
   }
   if(e.cancelable)e.preventDefault();
  }
  document.addEventListener('pointerup',e=>finish(e,false));
  document.addEventListener('pointercancel',e=>finish(e,true));
  root.addEventListener('lostpointercapture',e=>{if(drag?.pointerId===e.pointerId){drag=null;clear();}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){drag=null;wireStart=null;clear();}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
