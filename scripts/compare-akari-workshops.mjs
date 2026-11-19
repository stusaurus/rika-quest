import {readFileSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
const b=await chromium.launch(),p=await b.newPage({viewport:{width:960,height:800}});
try{
 for(let first=1;first<=14;first+=2){
  const cells=[];
  for(const stage of [first,first+1])for(const suffix of ['-before','']){
   const file='artifacts/workshop-chromium-768'+suffix+'/mission-'+stage+'.jpg';
   cells.push('<figure><b>MISSION '+stage+' / '+(suffix?'BEFORE':'AFTER')+'</b><img src="data:image/jpeg;base64,'+readFileSync(file).toString('base64')+'"></figure>');
  }
  await p.setContent('<style>body{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#16393f;color:white;font:16px sans-serif}figure{margin:0}img{display:block;width:100%}</style>'+cells.join(''));
  await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  const data=await p.screenshot({type:'jpeg',quality:72,fullPage:true});
  writeFileSync('artifacts/workshop-chromium-768/pair-'+first+'.jpg',data);
  for(const chunk of data.toString('base64').match(/.{1,6000}/g))console.log('PAIR_'+first+' '+chunk);
 }
}finally{await b.close()}
