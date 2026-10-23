/**
 * FlowerSvg.jsx – Inline JSX SVG for the Garden Flower coloring page.
 *
 * Props:
 *   regionProps(id) – function from Studio.jsx that returns onClick, style,
 *                     aria-label, tabIndex, etc. for each clickable region.
 *
 * Region IDs (must match coloringPages.js):
 *   flower-petal-1 … flower-petal-8, flower-center, flower-stem,
 *   flower-leaf-left, flower-leaf-right
 *
 * Note: SVG transform="rotate(deg cx cy)" is a valid SVG presentation
 * attribute in JSX. It rotates the element around the given point.
 */

const DETAIL_LINE = {
  fill: 'none',
  stroke: '#1a1a1a',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
};

const FlowerSvg = ({ regionProps }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 500"
    aria-label="Flower coloring page – click a region to color or erase it"
    role="img"
  >
    {/*
      8 petals – each is the same ellipse shape, rotated every 45°
      around the flower centre at (200, 218).
      They are drawn before the centre circle so the centre sits on top.
    */}
    <ellipse {...regionProps('flower-petal-1')} cx="200" cy="142" rx="29" ry="68" transform="rotate(0 200 218)" />
    <ellipse {...regionProps('flower-petal-2')} cx="200" cy="142" rx="29" ry="68" transform="rotate(45 200 218)" />
    <ellipse {...regionProps('flower-petal-3')} cx="200" cy="142" rx="29" ry="68" transform="rotate(90 200 218)" />
    <ellipse {...regionProps('flower-petal-4')} cx="200" cy="142" rx="29" ry="68" transform="rotate(135 200 218)" />
    <ellipse {...regionProps('flower-petal-5')} cx="200" cy="142" rx="29" ry="68" transform="rotate(180 200 218)" />
    <ellipse {...regionProps('flower-petal-6')} cx="200" cy="142" rx="29" ry="68" transform="rotate(225 200 218)" />
    <ellipse {...regionProps('flower-petal-7')} cx="200" cy="142" rx="29" ry="68" transform="rotate(270 200 218)" />
    <ellipse {...regionProps('flower-petal-8')} cx="200" cy="142" rx="29" ry="68" transform="rotate(315 200 218)" />

    {/* Centre circle (drawn on top of petals) */}
    <circle {...regionProps('flower-center')} cx="200" cy="218" r="44" />

    {/* Stem */}
    <rect {...regionProps('flower-stem')} x="193" y="262" width="14" height="196" rx="7" />

    {/* Leaves */}
    <ellipse {...regionProps('flower-leaf-left')}  cx="152" cy="388" rx="54" ry="20" transform="rotate(-33 152 388)" />
    <ellipse {...regionProps('flower-leaf-right')} cx="248" cy="388" rx="54" ry="20" transform="rotate(33 248 388)" />

    {/* Leaf vein detail lines (non-interactive) */}
    <line style={DETAIL_LINE} x1="152" y1="376" x2="193" y2="352" />
    <line style={DETAIL_LINE} x1="248" y1="376" x2="207" y2="352" />

    {/* Centre seed dots */}
    <circle style={{ fill: '#1a1a1a' }} cx="194" cy="210" r="4" />
    <circle style={{ fill: '#1a1a1a' }} cx="206" cy="210" r="4" />
    <circle style={{ fill: '#1a1a1a' }} cx="200" cy="204" r="4" />
    <circle style={{ fill: '#1a1a1a' }} cx="200" cy="222" r="4" />
    <circle style={{ fill: '#1a1a1a' }} cx="194" cy="226" r="4" />
    <circle style={{ fill: '#1a1a1a' }} cx="206" cy="226" r="4" />
  </svg>
);

export default FlowerSvg;
