import {test} from "node:test";
import assert from "node:assert/strict";
import {publicHTMLProof} from "../scripts/akari-public-html.mjs";

const game=Buffer.from('<!doctype html>\n<html lang="ja"><head><title>あかり</title></head>\n<body><script>const mission=1;</script>\n</body>\n</html>\n');
const bootstrap='<script>(function(){function c(){var b=a.contentDocument||(a.contentWindow&&a.contentWindow.document);if(b){var d=b.createElement(\'script\');d.innerHTML="window.__CF$cv$params={r:\'a594eb878f56fbef\',t:\'MTc5NDQ4MDA0Mg==\'};var l=window.parent.location,o;try{o=new URL(l.origin).origin}catch(e){try{o=new URL(new URL(l.href).origin).origin}catch(e){o=\'\'}}var u=\'/cdn-cgi/challenge-platform/scripts/jsd/main.js?ray=a594eb878f56fbef\',a=document.createElement(\'script\');a.src=o?new URL(u,o).href:u;document.getElementsByTagName(\'head\')[0].appendChild(a);";b.getElementsByTagName(\'head\')[0].appendChild(d)}}if(document.body){var a=document.createElement(\'iframe\');a.height=1;a.width=1;a.style.position=\'absolute\';a.style.top=0;a.style.left=0;a.style.border=\'none\';a.style.visibility=\'hidden\';document.body.appendChild(a);if(\'loading\'!==document.readyState)c();else if(window.addEventListener)document.addEventListener(\'DOMContentLoaded\',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);\'loading\'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script>';
const served=Buffer.from(game.toString().replace('</body>',bootstrap+'</body>')+'\n');
test('exact public game bytes are accepted',()=>assert.ok(publicHTMLProof(game,game).matches));
test('observed host bootstrap preserves the exact game payload',()=>{
 const proof=publicHTMLProof(game,served);assert.ok(proof.matches);
 assert.equal(proof.hostingAddition,'cloudflare-js-detection');
 assert.notEqual(proof.responseSha256,proof.expectedSha256);
});
test('variable host ray and time do not change game identity',()=>{
 const variant=Buffer.from(served.toString().replaceAll('a594eb878f56fbef','1234567890abcdef').replace('MTc5NDQ4MDA0Mg==','MTc5NDQ4MDA0Mw=='));
 assert.ok(publicHTMLProof(game,variant).matches);
});
test('one modified byte of the game is rejected',()=>{
 assert.equal(publicHTMLProof(game,Buffer.from(served.toString().replace('mission=1','mission=2'))).matches,false);
});
test('a different executable host addition is rejected',()=>{
 assert.equal(publicHTMLProof(game,Buffer.from(served.toString().replace("a.height=1","a.height=2"))).matches,false);
});
test('arbitrary appended executable code is rejected',()=>{
 assert.equal(publicHTMLProof(game,Buffer.from(served.toString().replace('</body>','<script>alert(1)</script></body>'))).matches,false);
});
test('sign-in pages cannot count as delivery success',()=>{
 assert.equal(publicHTMLProof(game,Buffer.from('<html>Sign in with ChatGPT</html>')).matches,false);
});
