/* The review build mounts this layer on the existing science engines. */
(() => {
 const assets=window.workshopArt;
 const ns='http://www.w3.org/2000/svg';
 function element(tag,attrs){
  const el=document.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attrs))el.setAttribute(key,value);
  return el;
 }
 function cell(svg,x,y,width,height,angle,before){
  const image=element('image',{href:assets.battery,x:-width/2,y:-height/2,width,height,
   preserveAspectRatio:'none',transform:'translate('+x+' '+y+') rotate('+angle+')','pointer-events':'none'});
  svg.insertBefore(image,before||null);
 }
 const root=document.getElementById('workspace');
 function hotspot(svg,x,y,width,height,selector){
  const control=root.querySelector(selector);
  if(!control||control.disabled)return;
  const label=control.getAttribute('aria-label')||control.textContent.trim();
  const g=element('g',{class:'workshop-hit',role:'button',tabindex:'0','aria-label':label,'data-workshop-control':selector});
  g.append(element('rect',{x:x-width/2,y:y-height/2,width,height,rx:10}));
  const apply=()=>{control.click();const next=[...root.querySelectorAll('.workshop-hit')].find(el=>el.dataset.workshopControl===selector);next?.focus({preventScroll:true});};
  g.addEventListener('click',apply);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();apply();}});
  svg.setAttribute('role','group');svg.append(g);
 }
 function paint(svg,stage){
  const hit=(x,y,w,h,sel)=>hotspot(svg,x,y,w,h,sel);
  const fixedCell=(x,y,len,dia)=>{
   const plate=svg.querySelector('rect:nth-of-type(2)');
   if(plate && Math.abs(plate.getBBox().x+plate.getBBox().width/2-x)<4){
    for(const text of svg.querySelectorAll('text')){
     const pos=Number(text.getAttribute('y'));
     if(Math.abs(Number(text.getAttribute('x'))-x)<3&&Math.abs(pos-y)<len/2)text.remove();
    }
    plate.remove();
   }
   cell(svg,x,y,len,dia,90);
  };
  if(svg.matches('.battery-lab-svg')){
   for(const part of svg.querySelectorAll('[data-cell]')){
    const body=part.querySelector('rect'),tip=body.nextElementSibling;
    const {x,y,width,height}=body.getBBox(),positiveLeft=Number(tip.getAttribute('x'))<x;
    body.remove();tip.remove();part.querySelector('text').remove();
    cell(part,x+width/2,y+height/2,width,height,positiveLeft?0:180,part.firstChild);
    const field=stage===9?'size':stage===10?'cells':'direction';
    hit(x+width/2,y+height/2,width,height+20,'[data-battery-field="'+field+'"][aria-pressed="false"]');
   }
  }else if(svg.matches('.garden-circuit-svg')){
   fixedCell(75,152,118,61);hit(216,89,85,74,'[data-garden-clamp][aria-pressed="false"]');
  }else if(svg.matches('.garden-design-svg')){
   fixedCell(80,187,130,62);
   for(const [x,y,key] of [[260,68,'link'],[210,205,'guardA'],[430,205,'guardB']])hit(x,y,120,60,'[data-garden-slot="'+key+'"]');
  }else if(svg.matches('.safety-svg')){
   fixedCell(85,183,113,48);
   for(const wire of svg.querySelectorAll('[data-line]')){
    const rect=wire.querySelector('rect').getBBox();
    hit(rect.x+15,rect.y+16,52,52,'[data-safe-wire="'+wire.dataset.line+'"]');
   }
  }else if(svg.matches('.dual-circuit-svg')){
   fixedCell(84,178,130,65);
   for(const [x,y,key] of [[84,178,'battery'],[291,90,'wire'],[524,175,'filament'],[291,270,'contact']])hit(x,y,100,62,'[data-dual-part="'+key+'"]');
  }else if(svg.matches('.finale-circuit-svg')){
   for(const [x,y,key] of [[259,63,'battery'],[485,63,'material'],[485,265,'contact']])hit(x,y,130,60,'[data-finale-station="'+key+'"]');
  }else if(svg.closest('.builder-board')){
   const network=svg.closest('.network-board');
   // Put equipment under student wires, including direct battery shorts.
   const layer=svg.querySelector('.student-wire,.builder-proof-path,.network-flow-layer');
   cell(svg,network?75:85,network?217:227,network?122:125,65,90,layer);
   if(network){hit(402,105,105,58,'[data-net-switch="a"]');hit(402,318,105,58,'[data-net-switch="b"]');}
  }
 }
 function mount(){
  const stage=Number(document.querySelector('#storyScene').dataset.stage);
  document.body.classList.toggle('village-workshop',stage>=4);
  if(stage<4)return;
  let scene=document.querySelector('#storyScene');
  let heading=document.querySelector('.quest-head');
  if(scene&&heading&&assets.scenery[scene.dataset.place])heading.style.setProperty('--location','url('+assets.scenery[scene.dataset.place]+')');
  for(const svg of root.querySelectorAll('.garden-circuit-svg,.garden-design-svg,.builder-board>svg,.battery-lab-svg,.safety-svg,.dual-circuit-svg,.finale-circuit-svg')){
   if(!svg.dataset.workshop){svg.dataset.workshop='true';paint(svg,stage);}
  }
 }
 new MutationObserver(mount).observe(root,{childList:true});
 mount();
})();
