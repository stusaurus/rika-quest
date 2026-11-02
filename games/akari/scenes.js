"use strict";
(function(){
const lamp=(x,y,h=102)=>'<g transform="translate('+x+' '+y+')"><path d="M0 2V'+h+'" stroke="#41596a" stroke-width="8" stroke-linecap="round"/><path d="M-22 7 0-5 22 7 17 29H-17Z" fill="#647985" stroke="#e3c795" stroke-width="4"/><rect class="scene-bulb" x="-13" y="8" width="26" height="17" rx="5"/><path d="M-12 1 0-10 12 1" stroke="#e9d8ae" stroke-width="4" fill="none"/><ellipse cx="0" cy="'+(h+3)+'" rx="28" ry="6" fill="#324f59" opacity=".25"/></g>';
const flower=(x,y,color)=>'<g transform="translate('+x+' '+y+')"><path d="M0 0V-42M0-11Q-25-36-23-14M0-24Q26-50 25-28" stroke="#41816d" stroke-width="6" fill="none"/><circle cx="0" cy="-43" r="14" fill="'+color+'"/><circle cx="0" cy="-43" r="7" fill="#ffeeb8"/></g>';
const bench=(x,y)=>'<g transform="translate('+x+' '+y+')"><path d="M-34-35H34M-35-19H35" stroke="#b78e65" stroke-width="10" stroke-linecap="round"/><path d="M-27-14V9M27-14V9" stroke="#3f616b" stroke-width="7"/></g>';
const rope=(x,y)=>'<g transform="translate('+x+' '+y+')"><path d="M-55-45Q-10 5 55-45" stroke="#dbba86" stroke-width="4" stroke-dasharray="8 4" fill="none"/><path d="M-55-60V1M55-60V1" stroke="#5a6f76" stroke-width="7"/></g>';
const box=(x,y,label)=>'<g transform="translate('+x+' '+y+')"><path d="M-35-48H31L42-32V5H-35Z" fill="#ba916a" stroke="#f9d7a6" stroke-width="4"/><path d="M-35-48 42-32M31-48 42-32M-35-32H42M-4-38V5" stroke="#785c51" stroke-width="3"/><text x="0" y="-12" fill="#ffefc6" text-anchor="middle" font-weight="900" font-size="17">'+label+'</text></g>';
const sign=(x,y,label)=>'<g transform="translate('+x+' '+y+')"><path d="M0 5V-91" stroke="#6d6863" stroke-width="8"/><rect x="-53" y="-97" width="106" height="42" rx="6" fill="#d1a879" stroke="#fbe3b8" stroke-width="3"/><text x="0" y="-68" text-anchor="middle" font-weight="900" fill="#36566a" font-size="17">'+label+'</text></g>';
const sea=(x,y)=>'<g transform="translate('+x+' '+y+')"><path d="M-60 4Q-39-14-18 4T24 4T66 4" stroke="#a0e1de" stroke-width="7" fill="none" opacity=".85"/><path d="M-30-20 0-30 30-20 14-5H-12Z" fill="#daae84" stroke="#ffdbad" stroke-width="3"/></g>';
const gear=(x,y)=>'<g transform="translate('+x+' '+y+')"><circle r="32" fill="#b3a88f" stroke="#f0d6a9" stroke-width="8" stroke-dasharray="11 6"/><circle r="17" fill="#5e8192"/><circle r="6" fill="#e7c798"/></g>';
const beacon=(x,y)=>'<g transform="translate('+x+' '+y+')"><path d="M0-100V-3" stroke="#657486" stroke-width="9"/><path d="M-23-102H23L16-125H-16Z" fill="#a5b5ae" stroke="#f3deb2" stroke-width="3"/><ellipse class="scene-bulb" cx="0" cy="-114" rx="16" ry="9"/></g>';
const designs=[
 ()=>lamp(117,306)+bench(310,310)+flower(32,322,"#f9cc8f"),
 ()=>lamp(110,305,120)+lamp(378,308,135)+sign(235,320,"街灯"),
 ()=>rope(177,300)+lamp(385,298,108),
 ()=>flower(112,315,"#faafbb")+flower(172,325,"#e9cd83")+flower(327,320,"#ecd8e9"),
 ()=>box(146,317,"？")+flower(295,317,"#fbe6a0")+sign(360,330,"実験"),
 ()=>gear(170,252)+gear(226,305)+lamp(363,314),
 ()=>gear(165,262)+sign(325,320,"A・B")+lamp(424,319,115),
 ()=>sea(154,312)+beacon(358,318),
 ()=>box(145,318,"1.5V")+box(235,325,"1.5V")+sea(380,314),
 ()=>lamp(140,308,115)+box(310,315,"3V"),
 ()=>sign(143,312,"＋ / −")+lamp(356,314,100),
 ()=>sign(155,319,"注意")+sea(379,318)+beacon(485,318),
 ()=>rope(193,308)+lamp(345,310,140),
 ()=>beacon(120,314)+lamp(332,319,138)+lamp(430,319,110)
];
window.AkariScenes={render(id){const index=Math.max(0,Math.min(13,(Number(id)||1)-1));const phone=typeof window.matchMedia==="function"&&window.matchMedia("(max-width: 740px)").matches;const box=phone?"0 0 500 340":"0 0 900 340";return '<svg class="scene-prop-svg" viewBox="'+box+'" preserveAspectRatio="none" aria-hidden="true">'+designs[index]()+'</svg>'}};
})();