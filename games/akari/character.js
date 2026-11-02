"use strict";
(function(){
const markup = String.raw`
<svg class="tiranon-svg" viewBox="0 0 165 177" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ミントグリーンの恐竜・ティラノン">
<defs>
  <linearGradient id="tir-mint" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#b8f2d4"/><stop offset=".34" stop-color="#83d8ae"/><stop offset=".72" stop-color="#5bbb97"/><stop offset="1" stop-color="#3d997f"/></linearGradient>
  <linearGradient id="tir-snout" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bdf1d0"/><stop offset="1" stop-color="#6acba3"/></linearGradient>
  <linearGradient id="tir-belly" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e7f8d7"/><stop offset="1" stop-color="#b5e4bc"/></linearGradient>
  <linearGradient id="tir-spike" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#68bda0"/><stop offset="1" stop-color="#3b9b88"/></linearGradient>
</defs>
<ellipse cx="85" cy="167" rx="62" ry="7" fill="#1d5656" opacity=".28"/>
<!-- Tail and small dorsal ridges are fixed to the body; they never float independently. -->
<g class="tiranon-tail">
 <path d="M59 120Q27 127 11 151Q37 159 61 148L78 136Z" fill="url(#tir-mint)" stroke="#3e9683" stroke-width="4" stroke-linejoin="round"/>
 <path d="M18 148Q35 141 50 137" fill="none" stroke="#d6f7d8" stroke-width="5" opacity=".6" stroke-linecap="round"/>
</g>
<path d="M56 81L42 73L57 60L68 73Z" fill="url(#tir-spike)" stroke="#398e80" stroke-width="3" stroke-linejoin="round"/>
<path d="M59 104L41 95L55 83L72 96Z" fill="url(#tir-spike)" stroke="#398e80" stroke-width="3" stroke-linejoin="round"/>
<path d="M67 125L51 118L64 105L81 121Z" fill="url(#tir-spike)" stroke="#398e80" stroke-width="3" stroke-linejoin="round"/>
<!-- Feet -->
<path d="M65 144Q55 152 56 159Q62 169 85 166L89 154Z" fill="#4da389" stroke="#358d7b" stroke-width="4"/>
<path d="M99 145Q100 154 105 160Q112 170 137 161Q141 153 131 148Z" fill="#4da389" stroke="#358d7b" stroke-width="4"/>
<path d="M61 162L67 163M74 164L80 164M114 164L120 164M126 162L132 159" stroke="#ecffe9" stroke-width="3" stroke-linecap="round"/>
<!-- Torso -->
<path d="M55 97Q53 79 73 72Q105 62 121 92L133 139Q130 159 111 159L74 157Q55 155 52 135Z" fill="url(#tir-mint)" stroke="#378e7b" stroke-width="4" stroke-linejoin="round"/>
<path d="M80 102Q98 91 117 110L119 147Q102 157 84 146Q75 132 80 102Z" fill="url(#tir-belly)" stroke="#a1d9ab" stroke-width="2"/>
<!-- Left arm -->
<path d="M59 115Q44 117 43 133L55 139Q65 128 73 128" fill="url(#tir-mint)" stroke="#3a987e" stroke-width="4" stroke-linecap="round"/>
<path d="M43 132L39 140M50 136L48 144" stroke="#378c79" stroke-width="3" stroke-linecap="round"/>
<!-- Head: a broad forehead and dinosaur snout, not a circular blob -->
<path d="M51 85Q37 65 47 41Q59 17 99 20Q130 19 135 45Q154 54 153 75Q150 94 132 102Q91 109 67 98Q53 96 51 85Z"
 fill="url(#tir-mint)" stroke="#3d9781" stroke-width="4" stroke-linejoin="round"/>
<path d="M112 66Q134 60 150 72Q153 86 140 93Q126 99 112 93Z" fill="url(#tir-snout)" opacity=".9"/>
<path d="M61 42Q83 24 104 31" fill="none" stroke="#e4ffdf" stroke-width="8" opacity=".54" stroke-linecap="round"/>
<!-- Consistent two-eye construction -->
<g class="tiranon-eyes">
 <ellipse cx="90" cy="58" rx="11" ry="15" fill="#fffaf0"/>
 <ellipse cx="117" cy="57" rx="9" ry="14" fill="#fffaf0"/>
 <g class="tiranon-pupils"><ellipse cx="93" cy="61" rx="5" ry="8" fill="#254d53"/><ellipse cx="119" cy="60" rx="4.5" ry="7" fill="#254d53"/></g>
 <circle cx="95" cy="56" r="2.6" fill="#fff"/><circle cx="120" cy="55" r="2" fill="#fff"/>
</g>
<path class="tiranon-eye-squint" d="M82 56Q91 45 101 55M110 55Q119 45 126 54" fill="none" stroke="#2b6b6c" stroke-width="4.5" stroke-linecap="round"/>
<ellipse cx="78" cy="85" rx="10" ry="6" fill="#f5b7a5" opacity=".53"/>
<ellipse cx="134" cy="72" rx="3.5" ry="2.8" fill="#4d8e7d"/>
<ellipse cx="143" cy="76" rx="2.5" ry="2" fill="#4d8e7d"/>
<path class="tiranon-mouth-smile" d="M115 85Q126 95 141 85" fill="none" stroke="#38746c" stroke-width="3.5" stroke-linecap="round"/>
<path class="tiranon-mouth-curious" d="M123 88Q130 84 137 88" fill="none" stroke="#38746c" stroke-width="3" stroke-linecap="round"/>
<path class="tiranon-mouth-worried" d="M119 89Q130 81 140 89" fill="none" stroke="#38746c" stroke-width="3.4" stroke-linecap="round"/>
<g class="tiranon-mouth-happy">
 <path d="M113 83Q124 108 143 85Q129 90 113 83Z" fill="#7f4753" stroke="#38746c" stroke-width="3" stroke-linejoin="round"/>
 <path d="M124 100Q130 93 137 99" fill="none" stroke="#ecb0b0" stroke-width="4" stroke-linecap="round"/>
 <path d="M123 88L128 92L133 88" fill="#fffef0" stroke="#fffef0" stroke-width="2" stroke-linejoin="round"/>
</g>
<!-- Right arm remains attached at its pivot -->
<g class="tiranon-right-arm">
 <path d="M113 114Q133 107 142 120L137 130Q123 125 116 129" fill="url(#tir-mint)" stroke="#3c987f" stroke-width="4" stroke-linecap="round"/>
 <path d="M138 129L144 135M132 129L137 139" stroke="#358e79" stroke-width="3" stroke-linecap="round"/>
</g>
<!-- Subtle explorer scarf distinguishes the game character without changing body anatomy -->
<path d="M72 100Q96 109 121 101" stroke="#f8dd95" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M83 104L82 124L93 119L94 106Z" fill="#f0bd75" stroke="#f9e5a9" stroke-width="2"/>
</svg>
`;
window.AkariCharacter = {
 render(){ return markup; },
 moods:["idle","inspect","discover","think","danger","celebrate"],
 message(mood){return ({idle:"",inspect:"よく見てみるノン！",discover:"発見したノン！",think:"もう一度調べるノン",danger:"あぶないノン！",celebrate:"やったノン！"})[mood]||"";}
};
})();
