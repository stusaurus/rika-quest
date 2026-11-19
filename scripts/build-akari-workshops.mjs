// Isolated, offline review entry. The original build outputs stay available.
import './build-akari-preview.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const read=name=>readFileSync('games/akari/'+name,'utf8');
const uri=name=>'data:image/webp;base64,'+readFileSync('games/akari/assets/mission1/'+name+'.webp').toString('base64');
const source=readFileSync('artifacts/akari-mission1-painted.html','utf8');
const style='<style>:root{--workshop-wood:url('+uri('workbench')+')}\n'+read('workshops.css')+'</style>';
const script='<script>window.workshopArt='+JSON.stringify({battery:uri('battery')})+';document.addEventListener("DOMContentLoaded",()=>{'+read('workshops.js')+'});</script>';
writeFileSync('artifacts/akari-fourteen.html',source.replace('storageKey="rika-akari-quest-v2"','storageKey="akari-workshops-v1"').replace('</head>',()=>style+'</head>').replace('</body>',()=>script+'</body>'));
