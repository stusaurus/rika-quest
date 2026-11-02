"use strict";
(function(){
/*
 * Canonical Tiranon art, copied byte-for-byte from the existing Furiko Quest
 * character prototype.  The original 8 poses remain intact: no face, tooth,
 * spine or body warping is performed during animation.
 */
const SPRITE="./assets/tiranon-walk-prototype.webp";
window.AkariCharacter={
  render(){
    return '<span class="tiranon-sprite-frame" role="img" aria-label="ティラノン"><img class="tiranon-sprite-strip" src="'+SPRITE+'" alt="" draggable="false" loading="eager"></span>'+
'<svg class="tiranon-emote-fx" viewBox="0 0 144 145" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">'+
'<defs><radialGradient id="tiraFxGlow"><stop stop-color="#fff8c3" stop-opacity=".82"/><stop offset="1" stop-color="#ffe08c" stop-opacity="0"/></radialGradient></defs>'+
'<g class="fx-inspect"><circle cx="114" cy="27" r="19" fill="#a2e5db" fill-opacity=".26" stroke="#f6eed5" stroke-width="5"/><circle cx="114" cy="27" r="12" fill="#8dccda" fill-opacity=".32" stroke="#6aabb2" stroke-width="2"/><path d="M100 43L88 57" stroke="#dfba82" stroke-width="8" stroke-linecap="round"/><path d="M109 17Q114 11 119 17" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></g>'+
'<g class="fx-discover"><circle cx="106" cy="25" r="32" fill="url(#tiraFxGlow)"/><path d="M106 5L111 18L124 23L111 28L106 42L101 28L88 23L101 18Z" fill="#ffe7a0" stroke="#fff9d9" stroke-width="2"/><path d="M66 10L69 16L77 19L69 22L66 30L63 22L56 19L63 16Z" fill="#fff8d3"/><circle cx="129" cy="51" r="4" fill="#ffe298"/></g>'+
'<g class="fx-think"><path d="M97 6Q113-4 126 9Q136 22 126 35Q122 40 108 40L100 49L101 39Q84 33 88 19Q90 11 97 6Z" fill="#f5f3de" stroke="#c9dac4" stroke-width="3"/><text x="111" y="31" text-anchor="middle" fill="#527d7e" font-size="24" font-weight="900">?</text></g>'+
'<g class="fx-danger"><path d="M106 1Q110-4 114 1L137 42Q141 49 134 52H86Q79 49 83 42Z" fill="#f5a97e" stroke="#fff2d4" stroke-width="4" stroke-linejoin="round"/><path d="M110 17V32" stroke="#8e493d" stroke-width="6" stroke-linecap="round"/><circle cx="110" cy="41" r="4" fill="#8e493d"/><path d="M74 22L65 10M143 15L137 24" stroke="#ffe6a6" stroke-width="4" stroke-linecap="round"/></g>'+
'<g class="fx-celebrate"><circle cx="100" cy="30" r="48" fill="url(#tiraFxGlow)"/><path d="M103 2L108 18L123 23L108 28L103 43L97 28L82 23L97 18Z" fill="#ffe19a" stroke="#fff8c9" stroke-width="2"/><path d="M59 12L63 20L72 24L63 28L59 37L55 28L46 24L55 20Z" fill="#dcf9e8"/><path d="M131 69L136 76L143 78L136 82L131 89L126 82L119 78L126 75Z" fill="#ffe5a1"/><path d="M58 61L65 67M137 41L143 33M93 69L90 81" stroke="#fbc77d" stroke-width="4" stroke-linecap="round"/><circle cx="77" cy="2" r="4" fill="#f3b88f"/></g>'+
'</svg>';
  },
  moods:["idle","inspect","discover","think","danger","celebrate","walk"],
  message(mood){
    const map={idle:"",inspect:"よく見てみるノン！",discover:"発見したノン！",think:"もう一度調べるノン",danger:"あぶないノン！",celebrate:"やったノン！",walk:""};
    return map[mood]||"";
  }
};
})();
