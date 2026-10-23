/**
 * DragonSvg.jsx – Inline JSX SVG for the Friendly Dragon coloring page.
 *
 * Props:
 *   regionProps(id) – function from Studio.jsx that returns onClick, style,
 *                     aria-label, tabIndex, etc. for each clickable region.
 *
 * Region IDs (must match coloringPages.js):
 *   dragon-wing-left, dragon-wing-right, dragon-tail,
 *   dragon-body, dragon-belly, dragon-head,
 *   dragon-eye-left, dragon-eye-right
 *
 * Draw order: wings → tail → body → belly → head → eyes → details.
 * Wings and tail are drawn before the body so the body cleanly overlaps
 * their attachment points.
 */

const DETAIL_LINE = {
  fill: 'none',
  stroke: '#1a1a1a',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
};

const DragonSvg = ({ regionProps }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 500"
    aria-label="Dragon coloring page – click a region to color or erase it"
    role="img"
  >
    {/* Wings (behind body) */}
    <path
      {...regionProps('dragon-wing-left')}
      d="M 97,288 C 46,238 17,158 65,108 C 98,76 140,95 148,147 C 156,198 142,272 97,288 Z"
    />
    <path
      {...regionProps('dragon-wing-right')}
      d="M 303,288 C 354,238 383,158 335,108 C 302,76 260,95 252,147 C 244,198 258,272 303,288 Z"
    />

    {/* Tail */}
    <path
      {...regionProps('dragon-tail')}
      d="M 290,422 C 340,402 382,370 392,330 C 402,290 387,262 368,276
         C 352,287 360,315 344,328 C 328,341 297,360 268,400 Z"
    />

    {/* Body */}
    <ellipse {...regionProps('dragon-body')}  cx="200" cy="350" rx="112" ry="122" />

    {/* Belly patch */}
    <ellipse {...regionProps('dragon-belly')} cx="200" cy="362" rx="70"  ry="88"  />

    {/* Head */}
    <circle {...regionProps('dragon-head')} cx="200" cy="174" r="82" />

    {/* Eyes */}
    <ellipse {...regionProps('dragon-eye-left')}  cx="172" cy="162" rx="18" ry="20" />
    <ellipse {...regionProps('dragon-eye-right')} cx="228" cy="162" rx="18" ry="20" />

    {/* Pupils (non-interactive) */}
    <ellipse style={{ fill: '#1a1a1a' }} cx="173" cy="164" rx="9" ry="13" />
    <ellipse style={{ fill: '#1a1a1a' }} cx="229" cy="164" rx="9" ry="13" />

    {/* Eye shine */}
    <circle style={{ fill: '#ffffff' }} cx="178" cy="157" r="3.5" />
    <circle style={{ fill: '#ffffff' }} cx="234" cy="157" r="3.5" />

    {/* Nose */}
    <ellipse style={{ fill: '#ffffff', stroke: '#1a1a1a', strokeWidth: 2.5 }} cx="200" cy="213" rx="20" ry="11" />
    <circle  style={{ fill: '#1a1a1a' }} cx="193" cy="212" r="4.5" />
    <circle  style={{ fill: '#1a1a1a' }} cx="207" cy="212" r="4.5" />

    {/* Smile */}
    <path style={DETAIL_LINE} d="M 178,234 Q 200,248 222,234" />

    {/* Horns */}
    <path style={DETAIL_LINE} d="M 168,96 L 152,52" />
    <path style={DETAIL_LINE} d="M 232,96 L 248,52" />
    <path style={DETAIL_LINE} d="M 152,52 L 162,68" />
    <path style={DETAIL_LINE} d="M 248,52 L 238,68" />

    {/* Wing veins */}
    <path style={DETAIL_LINE} d="M 97,288 C 72,255 52,195 72,148" />
    <path style={DETAIL_LINE} d="M 303,288 C 328,255 348,195 328,148" />

    {/* Belly scale lines */}
    <path style={DETAIL_LINE} d="M 165,310 Q 200,300 235,310" />
    <path style={DETAIL_LINE} d="M 155,338 Q 200,326 245,338" />
    <path style={DETAIL_LINE} d="M 153,366 Q 200,352 247,366" />
    <path style={DETAIL_LINE} d="M 158,394 Q 200,380 242,394" />

    {/* Tail tip spikes */}
    <path style={DETAIL_LINE} d="M 378,302 L 395,282" />
    <path style={DETAIL_LINE} d="M 390,318 L 408,302" />
  </svg>
);

export default DragonSvg;
