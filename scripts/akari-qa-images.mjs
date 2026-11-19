// Emit small, exact screenshot contact sheets through the readable CI log.
// Full-resolution captures stay in the ordinary run artifact.
import{chromium}from'playwright';import{readdirSync,readFileSync,mkdirSync,writeFileSync}from'node:fs';
const dir='artifacts/akari-materials';mkdirSync(dir,{recursive:true});
const files=readdirSync(dir).filter(n=>n.endsWith('.png')&&/exploration|material-search|experiment-wood|lamp-lit|complete|one-contact|short/.test(n));
const b=await chromium.launch({headless:true});try{
 for(const engine of ['chromium','webkit']){
  const chosen=files.filter(f=>f.startsWith(engine+'-'));if(!chosen.length)continue;
  const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await p.setContent('<html><head><style>*{box-sizing:border-box}body{margin:0;background:#132d39;color:#fff;font:14px sans-serif;padding:12px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}figure{margin:0;background:#254c53;padding:5px}img{width:100%;height:auto;display:block}figcaption{padding:5px;color:#ffe2ac}</style></head><body><h2>'+engine+' — real Playwright game captures</h2><div class="grid">'+chosen.map(f=>'<figure><figcaption>'+f+'</figcaption><img src="data:image/png;base64,'+readFileSync(dir+'/'+f).toString('base64')+'"></figure>').join('')+'</div></body></html>');
  await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  const bytes=await p.screenshot({type:'jpeg',quality:72,fullPage:true});const name=engine+'-contact-sheet.jpg';writeFileSync(dir+'/'+name,bytes);
  console.log('AKARI_QA_IMAGE_BEGIN '+name);const data=bytes.toString('base64');for(let i=0;i<data.length;i+=6000)console.log('AKARI_QA_IMAGE_DATA '+data.slice(i,i+6000));console.log('AKARI_QA_IMAGE_END '+name);await p.close();
 }
 for(const width of [320,390,1440]){
  const page=await b.newPage({viewport:{width:840,height:1000}});
  const rows=['first-sockets','repair-sockets','first-look'].map(scene=>['artifacts/akari-before',dir].map(folder=>{
   const file=folder+'/chromium-'+width+'-'+scene+'.png';
   return '<figure><figcaption>'+scene+' / '+(folder===dir?'AFTER':'BEFORE')+'</figcaption><img src="data:image/png;base64,'+readFileSync(file).toString('base64')+'"></figure>';
  }).join('')).join('');
  await page.setContent('<style>*{box-sizing:border-box}body{margin:8px;background:#193c40;color:white;font:16px sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:8px}figure{margin:0}img{display:block;width:100%}</style>'+rows);
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  const name='compare-'+width+'.jpg',bytes=await page.screenshot({type:'jpeg',quality:74,fullPage:true});
  writeFileSync(dir+'/'+name,bytes);
  console.log('AKARI_QA_IMAGE_BEGIN '+name);
  for(const chunk of bytes.toString('base64').match(/.{1,6000}/g))console.log('AKARI_QA_IMAGE_DATA '+chunk);
  console.log('AKARI_QA_IMAGE_END '+name);await page.close();
 }
 const r=dir+'/results.json';try{console.log('AKARI_QA_RESULTS '+readFileSync(r,'utf8').replace(/\n/g,''));}catch{}
}finally{await b.close();}
