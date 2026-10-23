/**
 * RocketSvg.jsx – Inline JSX SVG for the Space Rocket coloring page.
 *
 * Props:
 *   regionProps(id) – function from Studio.jsx that returns onClick, style,
 *                     aria-label, tabIndex, etc. for each clickable region.
 *
 * Region IDs (must match coloringPages.js):
 *   rocket-flame, rocket-fin-left, rocket-fin-right,
 *   rocket-body, rocket-nose, rocket-window
 *
 * Draw order: flame → fins → body → nose → window (+ detail lines on top).
 * Flame and fins are drawn before the body so the body edge cleanly covers
 * the join points.
 */

const DETAIL_LINE = {
  fill: 'none',
  stroke: '#1a1a1a',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
};

const RocketSvg = ({ regionProps }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 500"
    aria-label="Rocket coloring page – click a region to color or erase it"
    role="img"
  >
    {/* Flame (behind fins and body) */}
    <path
      {...regionProps('rocket-flame')}
      d="M 157,390 C 144,434 162,478 200,490 C 238,478 256,434 243,390 Z"
    />

    {/* Fins (behind body so body edge covers the attachment) */}
    <polygon {...regionProps('rocket-fin-left')}  points="157,332 97,422 157,398" />
    <polygon {...regionProps('rocket-fin-right')} points="243,332 303,422 243,398" />

    {/* Main fuselage body */}
    <rect {...regionProps('rocket-body')} x="157" y="178" width="86" height="212" rx="14" />

    {/* Nose cone */}
    <path {...regionProps('rocket-nose')} d="M 157,178 Q 200,55 243,178 Z" />

    {/* Porthole window */}
    <circle {...regionProps('rocket-window')} cx="200" cy="250" r="36" />

    {/* Panel lines on body (detail, non-interactive) */}
    <line style={DETAIL_LINE} x1="157" y1="320" x2="243" y2="320" />
    <line style={DETAIL_LINE} x1="157" y1="355" x2="243" y2="355" />

    {/* Window crosshair */}
    <line style={DETAIL_LINE} x1="200" y1="220" x2="200" y2="280" />
    <line style={DETAIL_LINE} x1="168" y1="250" x2="232" y2="250" />

    {/* Nose rivets */}
    <circle style={{ fill: '#1a1a1a' }} cx="192" cy="128" r="3.5" />
    <circle style={{ fill: '#1a1a1a' }} cx="208" cy="128" r="3.5" />
    <circle style={{ fill: '#1a1a1a' }} cx="200" cy="116" r="3.5" />

    {/* Inner flame detail */}
    <path style={DETAIL_LINE} d="M 177,405 C 174,432 186,462 200,470 C 214,462 226,432 223,405" />
  </svg>
);

export default RocketSvg;
