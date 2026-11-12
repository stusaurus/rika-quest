# Fonts embedded in the review HTML

The game's original typefaces are retained. Production `style.css` is unchanged;
only the offline/online review compiler replaces its Google Fonts import with
embedded font data. This prevents a font service outage or a file viewer's
network restrictions from changing the reviewed appearance.

Sources from the official `google/fonts` repository (retrieved 2026-11-12):

- `apache/kosugimaru/KosugiMaru-Regular.ttf`, Git blob
  `bc2c935463067d87087791ad22ed10b444fc8ceb`, Apache 2.0.
- `ofl/nunito/Nunito[wght].ttf`, Git blob
  `2ec1f4b0676c83ef33049db87b311171699e9192`, SIL OFL 1.1.

Each source blob was verified with its Git SHA-1 before subsetting. The included
license texts are also embedded in each HTML and shipped as `font-licenses.txt`.
The original font names, weights, metrics and glyph outlines are preserved.

WOFF subsets were made with FontTools `subset` using all characters present in
`games/akari/*.{html,js,css}`, plus U+0020–024F, U+3000–30FF and U+FF00–FFEE.
Nunito retains its variable weight axis and Latin U+0020–024F/U+2000–206F.
All layout features and font naming/license records are retained.
New lesson text should be checked for glyph coverage before rebuilding these
subsets. Characters outside the subset continue to use the existing system
font fallback.
