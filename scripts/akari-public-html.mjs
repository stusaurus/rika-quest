import {createHash} from "node:crypto";

const closing="</body>\n</html>\n";
// This exact append-only Cloudflare JavaScript Detection bootstrap was observed
// on the approved public host. Its ray ID/time vary between requests. Compare
// every byte of the game; allow no edits, arbitrary scripts, or interstitials.
// The browser still receives/runs the original response with host checks intact.
const cloudflareBootstrap='<script>(function(){function c(){var b=a.contentDocument||(a.contentWindow&&a.contentWindow.document);if(b){var d=b.createElement(\'script\');d.innerHTML="window.__CF$cv$params={r:\'{{RAY}}\',t:\'{{TIME}}\'};var l=window.parent.location,o;try{o=new URL(l.origin).origin}catch(e){try{o=new URL(new URL(l.href).origin).origin}catch(e){o=\'\'}}var u=\'/cdn-cgi/challenge-platform/scripts/jsd/main.js?ray={{RAY}}\',a=document.createElement(\'script\');a.src=o?new URL(u,o).href:u;document.getElementsByTagName(\'head\')[0].appendChild(a);";b.getElementsByTagName(\'head\')[0].appendChild(d)}}if(document.body){var a=document.createElement(\'iframe\');a.height=1;a.width=1;a.style.position=\'absolute\';a.style.top=0;a.style.left=0;a.style.border=\'none\';a.style.visibility=\'hidden\';document.body.appendChild(a);if(\'loading\'!==document.readyState)c();else if(window.addEventListener)document.addEventListener(\'DOMContentLoaded\',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);\'loading\'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script>';
export function publicHTMLProof(expected,actual){
 const digest=b=>createHash("sha256").update(b).digest("hex");
 const base={expectedSha256:digest(expected),responseSha256:digest(actual)};
 if(expected.equals(actual))return{...base,matches:true,hostingAddition:null};
 const end=Buffer.from(closing);
 if(!expected.subarray(-end.length).equals(end))return{...base,matches:false};
 const prefix=expected.subarray(0,expected.length-end.length);
 if(!actual.subarray(0,prefix.length).equals(prefix))return{...base,matches:false};
 const tail=actual.subarray(prefix.length).toString("utf8");
 const ids=tail.match(/window\.__CF\$cv\$params=\{r:'([0-9a-f]{16})',t:'([A-Za-z0-9+/=]{8,40})'\}/);
 if(!ids)return{...base,matches:false};
 const addition=cloudflareBootstrap.replaceAll("{{RAY}}",ids[1]).replace("{{TIME}}",ids[2]);
 const matches=tail===addition+closing+"\n"||tail===addition+closing;
 return{...base,matches,hostingAddition:matches?"cloudflare-js-detection":null};
}
