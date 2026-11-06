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
 ()=>window.AkariTownArt?window.AkariTownArt.render(3):rope(177,300)+lamp(385,298,108),
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

const landmarkDefs='<defs>'+
 '<linearGradient id="rkPlaster" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#ffe7bd"/><stop offset=".58" stop-color="#e5c59a"/><stop offset="1" stop-color="#bb967e"/></linearGradient>'+
 '<linearGradient id="rkStone" x1="0" y1="0" x2=".95" y2="1"><stop stop-color="#dbe0d6"/><stop offset=".48" stop-color="#adbcb9"/><stop offset="1" stop-color="#718f93"/></linearGradient>'+
 '<linearGradient id="rkRoof" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e5a089"/><stop offset=".56" stop-color="#bc655c"/><stop offset="1" stop-color="#874e53"/></linearGradient>'+
 '<linearGradient id="rkGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#96cad1"/><stop offset="1" stop-color="#426e88"/></linearGradient>'+
 '<linearGradient id="rkWood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#debb86"/><stop offset=".54" stop-color="#ac7e65"/><stop offset="1" stop-color="#6c5a58"/></linearGradient>'+
 '</defs>';
const landmarks={

 village:'<g><ellipse cx="148" cy="233" rx="122" ry="9" fill="#294f56" opacity=".27"/>'+
 '<path d="M44 100L44 211L78 230L78 103Z" fill="#ac8878"/>'+
 '<path d="M78 100L229 100L229 229L78 229Z" fill="url(#rkPlaster)" stroke="#fae1b2" stroke-width="3"/>'+
 '<path d="M80 133H228M80 197H228" stroke="#b38d7c" stroke-width="3" opacity=".6"/>'+
 '<path d="M38 101L130 22L251 93L229 104L129 46L67 113Z" fill="url(#rkRoof)" stroke="#f4c6aa" stroke-width="4"/>'+
 '<path d="M130 23L152 30L68 112L43 99Z" fill="#f2b08e" opacity=".75"/>'+
 '<path d="M148 32L169 41L169 15L185 15L185 49" fill="#aa6f61" stroke="#f6d2a5" stroke-width="3"/>'+
 '<path d="M87 73L210 73M111 56L220 83M74 89L235 89" fill="none" stroke="#8c4f53" stroke-width="2" opacity=".5"/>'+
 '<rect class="window" x="93" y="118" width="43" height="47" rx="5" stroke="#fff1c7" stroke-width="6"/>'+
 '<rect class="window" x="176" y="118" width="39" height="47" rx="5" stroke="#fff1c7" stroke-width="6"/>'+
 '<path d="M114 119V165M94 141H134M195 119V165M176 141H215" stroke="#b1c5bd" stroke-width="3"/>'+
 '<path d="M139 227V165Q156 145 173 165V227Z" fill="url(#rkWood)" stroke="#f2d3a3" stroke-width="4"/>'+
 '<circle cx="165" cy="198" r="3.5" fill="#ffe4a8"/>'+
 '<path d="M130 228H181L190 237H121Z" fill="#b9a18a" stroke="#efdcbe" stroke-width="3"/>'+
 '<path d="M83 218H129M184 218H224" stroke="#fff0ce" stroke-width="3" opacity=".5"/></g>',
 bridge:'<g><ellipse cx="145" cy="236" rx="141" ry="7" fill="#28576a" opacity=".22"/>'+
 '<path d="M0 222Q60 206 135 219T290 221" stroke="#9be0dc" stroke-width="6" fill="none"/>'+
 '<path d="M4 174Q145 62 286 174L286 224L249 224Q145 100 42 224H4Z" fill="url(#rkStone)" stroke="#e7e2c9" stroke-width="4"/>'+
 '<path d="M28 207Q145 92 262 207L246 225Q145 121 45 225Z" fill="#436b7d" opacity=".8"/>'+
 '<path d="M7 158Q142 66 281 158" fill="none" stroke="#dcc7a3" stroke-width="18"/>'+
 '<path d="M7 158Q145 68 281 158" fill="none" stroke="#fff0d1" stroke-width="5"/>'+
 '<path d="M35 155L35 115M254 155L254 115" stroke="#847d74" stroke-width="9"/>'+
 '<path d="M23 118L23 94L47 94L47 118M241 118L241 94L266 94L266 118" fill="#b2b7a9" stroke="#ecd5b0" stroke-width="3"/>'+
 '<rect class="window" x="29" y="96" width="12" height="18" rx="3"/><rect class="window" x="246" y="96" width="13" height="18" rx="3"/>'+
 '<path d="M34 183H66M224 183H259M72 123L83 134M207 133L216 122M105 107L112 121M170 113L178 102" stroke="#819a98" stroke-width="3" opacity=".75"/></g>',
 garden:'<g><ellipse cx="143" cy="232" rx="137" ry="9" fill="#355d58" opacity=".24"/>'+
 '<path d="M47 111L144 40L253 111L241 223H55Z" fill="#a4c0ad" stroke="#f4e4bd" stroke-width="4"/>'+
 '<path d="M144 40L248 111H153Z" fill="#75a6a0" stroke="#e4f4d9" stroke-width="4"/>'+
 '<path d="M46 111L144 40V111Z" fill="#8ac5ac" stroke="#f0e8bd" stroke-width="3"/>'+
 '<rect x="58" y="115" width="184" height="110" rx="6" fill="url(#rkWood)" stroke="#e9ceab" stroke-width="4"/>'+
 '<rect class="window" x="73" y="127" width="55" height="68" rx="6" stroke="#d4e6cc" stroke-width="7"/>'+
 '<rect class="window" x="172" y="127" width="55" height="68" rx="6" stroke="#d4e6cc" stroke-width="7"/>'+
 '<path d="M100 128V195M72 158H127M199 128V195M173 158H226" stroke="#a3c4a7" stroke-width="4"/>'+
 '<path d="M132 225V163Q149 146 165 163V225Z" fill="#6f9e8d" stroke="#e9c6a7" stroke-width="5"/>'+
 '<circle cx="157" cy="196" r="3" fill="#ffdc8d"/>'+
 '<path d="M15 229Q22 191 41 209Q52 181 68 225M212 227Q230 182 245 213Q259 190 280 230" fill="#4e9475" stroke="#82bfa0" stroke-width="4"/>'+
 '<circle cx="33" cy="198" r="7" fill="#ffd5c4"/><circle cx="264" cy="206" r="6" fill="#ffdca9"/></g>',
 tower:'<g><ellipse cx="146" cy="235" rx="98" ry="8" fill="#26485f" opacity=".3"/>'+
 '<path d="M102 52H197L215 231H85Z" fill="url(#rkStone)" stroke="#e9e5d0" stroke-width="4"/>'+
 '<path d="M170 54H197L215 231H177Z" fill="#7393a3" opacity=".48"/>'+
 '<path d="M89 57L149 12L212 57Z" fill="url(#rkRoof)" stroke="#ffe6c7" stroke-width="4"/>'+
 '<path d="M121 26L149 12L174 30" stroke="#ffd4a9" stroke-width="3" fill="none"/>'+
 '<circle cx="149" cy="103" r="42" fill="#bb9a81" stroke="#f7e6c4" stroke-width="7"/>'+
 '<circle cx="149" cy="103" r="34" fill="#fff6e0" stroke="#6b8994" stroke-width="3"/>'+
 '<path d="M149 103V76M149 103L168 110" stroke="#455b67" stroke-width="6" stroke-linecap="round"/>'+
 '<circle cx="149" cy="103" r="5" fill="#dcb480"/>'+
 '<path d="M149 69V78M149 129V138M115 103H125M173 103H183" stroke="#896b60" stroke-width="3"/>'+
 '<rect class="window" x="133" y="160" width="33" height="44" rx="14" stroke="#f2deb7" stroke-width="4"/>'+
 '<path d="M102 151H194M96 215H201" stroke="#f7ead3" stroke-width="5" opacity=".85"/>'+
 '<path d="M111 64V229M188 64V229" stroke="#7c9aa2" stroke-width="3" opacity=".45"/></g>',
 port:'<g><ellipse cx="144" cy="230" rx="140" ry="10" fill="#285d77" opacity=".35"/>'+
 '<path d="M18 194H281L240 225H62Z" fill="url(#rkWood)" stroke="#f0d5af" stroke-width="5"/>'+
 '<path d="M47 194H260M62 213H241" stroke="#886858" stroke-width="4"/>'+
 '<path d="M137 181V20" stroke="#6f807e" stroke-width="10"/>'+
 '<path d="M142 31L258 181H145Z" fill="#f3ebd6" stroke="#fffdf0" stroke-width="4"/>'+
 '<path d="M132 40L42 182H131Z" fill="#d5b69c" stroke="#ffe4ca" stroke-width="4"/>'+
 '<path d="M143 34V175" stroke="#adbaa5" stroke-width="3"/>'+
 '<path d="M173 93L226 163M185 118L243 174" stroke="#a0b5bc" stroke-width="3" opacity=".6"/>'+
 '<rect x="76" y="170" width="45" height="23" rx="5" fill="url(#rkWood)" stroke="#f1d9ad" stroke-width="3"/>'+
 '<rect class="window" x="85" y="175" width="19" height="13" rx="4"/>'+
 '<path d="M78 194L71 218M223 194L216 218" stroke="#665a56" stroke-width="7"/>'+
 '<path d="M8 231Q24 212 40 231T72 231T104 231T136 231T168 231T200 231T232 231T264 231" stroke="#b8e4df" stroke-width="5" fill="none"/></g>',
 museum:'<g><ellipse cx="146" cy="232" rx="132" ry="8" fill="#695b61" opacity=".25"/>'+
 '<path d="M19 94L146 19L274 94Z" fill="url(#rkRoof)" stroke="#ffddbb" stroke-width="5"/>'+
 '<path d="M43 90L146 36L250 90" fill="none" stroke="#f9e4cd" stroke-width="3"/>'+
 '<path d="M27 96H266V115H27Z" fill="#e5d1b9" stroke="#fff2dc" stroke-width="4"/>'+
 '<path d="M43 206V115H251V206Z" fill="#9eaaa9"/>'+
 '<path d="M60 115V205M104 115V205M189 115V205M234 115V205" stroke="#f3e9d5" stroke-width="20"/>'+
 '<path d="M57 116H66M101 116H110M187 116H195M231 116H239" stroke="#d4c1a8" stroke-width="28"/>'+
 '<path d="M127 205V151Q149 132 168 151V205Z" fill="#526a79" stroke="#f7e1c4" stroke-width="5"/>'+
 '<path class="window" d="M137 193V157Q150 146 160 157V193Z"/>'+
 '<path d="M26 207H268V220H26Z" fill="#d7c3a7"/>'+
 '<path d="M14 221H281V233H14Z" fill="#bfae9f" stroke="#eadbcb" stroke-width="3"/>'+
 '<path d="M35 105H257" stroke="#a89185" stroke-width="3"/></g>',
 lighthouse:'<g><ellipse cx="150" cy="235" rx="93" ry="9" fill="#34576c" opacity=".3"/>'+
 '<path d="M96 227L117 59H182L204 227Z" fill="#eee8d6" stroke="#fff6dd" stroke-width="5"/>'+
 '<path d="M153 61H182L205 227H169Z" fill="#a1a9a8" opacity=".4"/>'+
 '<path d="M111 97H188L192 123H106Z" fill="url(#rkRoof)"/>'+
 '<path d="M102 162H198L202 188H99Z" fill="url(#rkRoof)"/>'+
 '<path d="M106 215H199L207 229H95Z" fill="#71808b" stroke="#e7e1d0" stroke-width="3"/>'+
 '<path d="M123 60V32H177V60Z" fill="#637d8c" stroke="#e5d9b7" stroke-width="4"/>'+
 '<rect class="window" x="128" y="35" width="45" height="26" rx="4" stroke="#f4e2b8" stroke-width="4"/>'+
 '<path d="M120 28L150 10L183 28Z" fill="url(#rkRoof)" stroke="#f6e5c9" stroke-width="4"/>'+
 '<path d="M150 10V-2" stroke="#f5dca9" stroke-width="4"/>'+
 '<rect class="window" x="138" y="136" width="25" height="26" rx="10" stroke="#e6d5ba" stroke-width="3"/>'+
 '<path d="M132 229V194Q149 184 165 194V229Z" fill="#667a82" stroke="#efe0c8" stroke-width="4"/>'+
 '<circle cx="157" cy="212" r="2.5" fill="#f5d19a"/>'+
 '<path d="M117 63H182M119 129H187M119 194H191" stroke="#fff8e2" stroke-width="3" opacity=".65"/></g>'
};

window.AkariScenes={render(id){const index=Math.max(0,Math.min(13,(Number(id)||1)-1));const phone=typeof window.matchMedia==="function"&&window.matchMedia("(max-width: 740px)").matches;const town=index<=2&&!!window.AkariTownArt;const box=town?(phone?"208 0 484 340":"0 0 900 340"):phone?"0 0 500 340":"0 0 900 340";return '<svg class="scene-prop-svg'+(town?" town-illustration":"")+'" viewBox="'+box+'" preserveAspectRatio="'+(town?"xMidYMid slice":"none")+'" aria-hidden="true">'+(town?window.AkariTownArt.render(index+1):designs[index]())+'</svg>'}};
window.AkariScenes.landmark=place=>landmarkDefs+(landmarks[place]||landmarks.village);

})();