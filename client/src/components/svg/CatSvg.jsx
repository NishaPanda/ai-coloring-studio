/**
 * CatSvg.jsx – Inline JSX SVG for the Sitting Cat coloring page.
 *
 * Props:
 *   regionProps(id) – function from Studio.jsx that returns onClick, style,
 *                     aria-label, tabIndex, etc. for each clickable region.
 *
 * The SVG markup is identical to the Phase 4C hardcoded version, extracted
 * here so Studio.jsx can swap between pages dynamically.
 */

const DETAIL_LINE = {
  fill: 'none',
  stroke: '#1a1a1a',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
};

const CatSvg = ({ regionProps }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 500"
    aria-label="Cat coloring page – click a region to color or erase it"
    role="img"
  >
    {/* Tail (drawn first so body sits on top) */}
    <path
      {...regionProps('cat-tail')}
      d="M 230 380
         C 300 370, 340 320, 320 270
         C 310 250, 290 255, 285 275
         C 295 305, 265 340, 215 350
         Z"
    />

    {/* Body */}
    <ellipse {...regionProps('cat-body')} cx="200" cy="360" rx="100" ry="110" />

    {/* Belly patch */}
    <ellipse {...regionProps('cat-belly')} cx="200" cy="375" rx="52" ry="68" />

    {/* Left front paw */}
    <ellipse {...regionProps('cat-paw-left')} cx="145" cy="455" rx="32" ry="18" />

    {/* Right front paw */}
    <ellipse {...regionProps('cat-paw-right')} cx="255" cy="455" rx="32" ry="18" />

    {/* Left ear */}
    <polygon {...regionProps('cat-ear-left')} points="130,185 110,120 170,165" />

    {/* Right ear */}
    <polygon {...regionProps('cat-ear-right')} points="270,185 290,120 230,165" />

    {/* Head */}
    <circle {...regionProps('cat-head')} cx="200" cy="210" r="90" />

    {/* Left eye */}
    <ellipse {...regionProps('cat-eye-left')} cx="168" cy="200" rx="18" ry="20" />

    {/* Right eye */}
    <ellipse {...regionProps('cat-eye-right')} cx="232" cy="200" rx="18" ry="20" />

    {/* Pupils (non-interactive) */}
    <ellipse style={{ fill: '#1a1a1a' }} cx="170" cy="202" rx="9" ry="13" />
    <ellipse style={{ fill: '#1a1a1a' }} cx="234" cy="202" rx="9" ry="13" />

    {/* Eye shine */}
    <circle style={{ fill: '#ffffff' }} cx="174" cy="197" r="3" />
    <circle style={{ fill: '#ffffff' }} cx="238" cy="197" r="3" />

    {/* Nose */}
    <polygon {...regionProps('cat-nose')} points="200,238 192,250 208,250" />

    {/* Mouth curves */}
    <path style={DETAIL_LINE} d="M 192 250 Q 185 262 178 260" />
    <path style={DETAIL_LINE} d="M 208 250 Q 215 262 222 260" />

    {/* Whiskers left */}
    <line style={DETAIL_LINE} x1="155" y1="248" x2="115" y2="240" />
    <line style={DETAIL_LINE} x1="155" y1="256" x2="112" y2="258" />
    <line style={DETAIL_LINE} x1="155" y1="264" x2="118" y2="272" />

    {/* Whiskers right */}
    <line style={DETAIL_LINE} x1="245" y1="248" x2="285" y2="240" />
    <line style={DETAIL_LINE} x1="245" y1="256" x2="288" y2="258" />
    <line style={DETAIL_LINE} x1="245" y1="264" x2="282" y2="272" />

    {/* Inner ear lines */}
    <line style={DETAIL_LINE} x1="128" y1="175" x2="148" y2="145" />
    <line style={DETAIL_LINE} x1="148" y1="145" x2="163" y2="168" />
    <line style={DETAIL_LINE} x1="272" y1="175" x2="252" y2="145" />
    <line style={DETAIL_LINE} x1="252" y1="145" x2="237" y2="168" />

    {/* Paw toe lines left */}
    <line style={DETAIL_LINE} x1="130" y1="450" x2="130" y2="462" />
    <line style={DETAIL_LINE} x1="145" y1="448" x2="145" y2="462" />
    <line style={DETAIL_LINE} x1="160" y1="450" x2="160" y2="462" />

    {/* Paw toe lines right */}
    <line style={DETAIL_LINE} x1="240" y1="450" x2="240" y2="462" />
    <line style={DETAIL_LINE} x1="255" y1="448" x2="255" y2="462" />
    <line style={DETAIL_LINE} x1="270" y1="450" x2="270" y2="462" />
  </svg>
);

export default CatSvg;
