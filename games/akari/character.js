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
    return '<span class="tiranon-sprite-frame" role="img" aria-label="ティラノン"><img class="tiranon-sprite-strip" src="'+SPRITE+'" alt="" draggable="false" loading="eager"></span>';
  },
  moods:["idle","inspect","discover","think","danger","celebrate","walk"],
  message(mood){
    const map={idle:"",inspect:"よく見てみるノン！",discover:"発見したノン！",think:"もう一度調べるノン",danger:"あぶないノン！",celebrate:"やったノン！",walk:""};
    return map[mood]||"";
  }
};
})();
