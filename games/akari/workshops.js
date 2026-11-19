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
 function lamp(svg,x,top,bottom){
  const symbol=svg.querySelector('circle[cx="'+x+'"][r]:not([r="8"]):not([r="7"])');
  if(!symbol)return;
  let cross=symbol.nextElementSibling;
  if(cross?.tagName==='circle')cross=cross.nextElementSibling;
  const state=svg.dataset.lampState;
  // The upper lead reaches the metal SIDE of the socket, never the glass.
  const h=bottom-top,w=h*.51,left=x-w/2;
  const layer=element('g',{'pointer-events':'none'});
  layer.append(element('path',{d:'M'+x+' '+top+'h-'+(w*.7)+'v'+(h*.80)+'H'+(left+w*.25),fill:'none',stroke:'#c6bd9e','stroke-width':5}));
  layer.append(element('image',{href:['bright','lit','dim'].includes(state)?assets.bulbLit:assets.bulbDark,x:left,y:top,width:w,height:h,preserveAspectRatio:'none',opacity:state==='dim'?.65:1}));
  symbol.replaceWith(layer);if(cross?.tagName==='path')cross.remove();
 }
 function fire(svg,x,y){
  if(svg.dataset.lampState!=='short')return;
  const panel=element('foreignObject',{x:x-76,y:y-120,width:152,height:152,'pointer-events':'none','aria-label':'ショートによる発熱の危険'});
  const frame=document.createElement('div');frame.className='workshop-fire';frame.style.backgroundImage='url('+assets.fire+')';panel.append(frame);svg.append(panel);
 }
 function paint(svg,stage){
  const lamps=[['.battery-lab-svg',521,94,206],['.garden-circuit-svg',495,101,204],['.garden-design-svg',590,125,239],['.safety-svg',475,149,217],['.dual-circuit-svg',524,118,232],['.finale-circuit-svg',672,106,216],['.network-board svg',820,157,273],['.builder-board svg',888,170,286]];
  const spec=lamps.find(([selector])=>svg.matches(selector));
  if(spec)lamp(svg,...spec.slice(1));
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
  if(svg.matches('.logic-art')){
   const battery=svg.querySelector('.diagram-battery');
   cell(battery,44,120,64,32,90);
   const parallel=root.querySelector('[data-design="parallel"]')?.getAttribute('aria-pressed')==='true';
   hit(169,parallel?90:58,62,45,'[data-switch="a"]');
   hit(parallel?169:247,parallel?144:58,62,45,'[data-switch="b"]');
  }else if(svg.matches('.battery-lab-svg')){
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
   fixedCell(80,187,130,62);fire(svg,80,187);
   for(const [x,y,key] of [[260,68,'link'],[210,205,'guardA'],[430,205,'guardB']])hit(x,y,120,60,'[data-garden-slot="'+key+'"]');
  }else if(svg.matches('.safety-svg')){
   fixedCell(85,183,113,48);fire(svg,85,183);
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
   fire(svg,network?75:85,network?217:227);
   if(network){hit(402,105,105,58,'[data-net-switch="a"]');hit(402,318,105,58,'[data-net-switch="b"]');}
  }
 }
 function mount(){
  const stage=Number(document.querySelector('#storyScene').dataset.stage);
  document.body.classList.toggle('village-workshop',stage>=4);
  if(stage<4)return;
  let scene=document.querySelector('#storyScene');
  const heading=document.querySelector('.main');
  if(scene&&heading&&assets.scenery[scene.dataset.place])heading.style.setProperty('--location','url('+assets.scenery[scene.dataset.place]+')');
  for(const svg of root.querySelectorAll('.logic-art,.garden-circuit-svg,.garden-design-svg,.builder-board>svg,.battery-lab-svg,.safety-svg,.dual-circuit-svg,.finale-circuit-svg')){
   if(!svg.dataset.workshop){svg.dataset.workshop='true';paint(svg,stage);}
  }
 }
 new MutationObserver(mount).observe(root,{childList:true});
 mount();
})();
