/**
 * Studio.jsx – Phase 4C: Editing Tools (Eraser · Undo · Redo · Reset)
 *
 * State managed here:
 *   selectedColor  – active paint color (hex string)
 *   activeTool     – 'fill' | 'eraser'
 *   regionColors   – { regionId: hexColor } current fill state
 *   undoStack      – array of past regionColors snapshots (most-recent last)
 *   redoStack      – array of future regionColors snapshots (most-recent last)
 *
 * History rules:
 *   • Before any fill/erase action we push the current regionColors snapshot
 *     onto undoStack and clear redoStack (new action invalidates redo branch).
 *   • If the clicked region's color would not change we skip recording (no-op
 *     guard prevents pointless history entries).
 *   • Reset clears both stacks and restores all regions to white.
 *   • Undo/Redo swap the current snapshot with the top of the respective stack.
 *
 * Everything from Phase 4B is preserved:
 *   – Color picker, swatch, hex label, active-color strip.
 *   – Inline SVG with regionProps() attaching onClick to each region.
 *   – REGION_STROKE / DETAIL_LINE constants keeping outlines safe from state.
 *
 * Not implemented yet (Phase 5+):
 *   – Saving artwork, AI features, backend/API changes.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Studio.css';

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const REGION_IDS = [
  'cat-tail',
  'cat-body',
  'cat-belly',
  'cat-paw-left',
  'cat-paw-right',
  'cat-ear-left',
  'cat-ear-right',
  'cat-head',
  'cat-eye-left',
  'cat-eye-right',
  'cat-nose',
];

const BLANK_COLOR = '#ffffff';

/** Build a fresh all-white regionColors object. */
const buildInitialColors = () =>
  Object.fromEntries(REGION_IDS.map((id) => [id, BLANK_COLOR]));

/** Inline stroke style applied to every region element — never changes. */
const REGION_STROKE = {
  stroke: '#1a1a1a',
  strokeWidth: 3,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
};

/** Style for decorative non-clickable lines (whiskers, mouth, etc.). */
const DETAIL_LINE = {
  fill: 'none',
  stroke: '#1a1a1a',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
};

/* ─── Maximum undo/redo history length ───────────────────────────────────────── */
const MAX_HISTORY = 50;

/* ─── Studio component ───────────────────────────────────────────────────────── */
const Studio = () => {

  // ── Tool state ──────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [activeTool, setActiveTool]       = useState('fill'); // 'fill' | 'eraser'

  // ── Canvas state ────────────────────────────────────────────────────────────
  const [regionColors, setRegionColors] = useState(buildInitialColors);

  // ── History stacks ──────────────────────────────────────────────────────────
  // Each entry is a full regionColors snapshot (plain object).
  // undoStack[undoStack.length - 1] is the state just before the latest action.
  // redoStack[redoStack.length - 1] is the state just after the latest undo.
  const [undoStack, setUndoStack] = useState([]); // array of snapshots
  const [redoStack, setRedoStack] = useState([]); // array of snapshots

  // ── Derived flags (used to disable buttons) ──────────────────────────────────
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // ── Action handler ──────────────────────────────────────────────────────────
  /**
   * applyAction
   * Shared logic for fill and erase. Pushes a history entry only when the
   * region color actually changes.
   *
   * @param {string} regionId  – the id of the clicked SVG region
   * @param {string} newColor  – the color to apply ('#rrggbb' or BLANK_COLOR)
   */
  const applyAction = (regionId, newColor) => {
    // No-op guard: skip recording if color won't change
    if (regionColors[regionId] === newColor) return;

    // Push current state onto undo stack (cap at MAX_HISTORY)
    setUndoStack((prev) => {
      const updated = [...prev, regionColors];
      return updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated;
    });

    // New action always clears redo branch
    setRedoStack([]);

    // Apply the new color to just the clicked region
    setRegionColors((prev) => ({ ...prev, [regionId]: newColor }));
  };

  // ── Region click handler ─────────────────────────────────────────────────────
  const handleRegionClick = (regionId) => {
    if (activeTool === 'eraser') {
      applyAction(regionId, BLANK_COLOR);
    } else {
      applyAction(regionId, selectedColor);
    }
  };

  // ── Undo ─────────────────────────────────────────────────────────────────────
  const handleUndo = () => {
    if (!canUndo) return;

    const previousColors = undoStack[undoStack.length - 1];

    // Move current state to redo stack
    setRedoStack((prev) => [...prev, regionColors]);

    // Restore previous state
    setRegionColors(previousColors);

    // Pop the undo stack
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // ── Redo ─────────────────────────────────────────────────────────────────────
  const handleRedo = () => {
    if (!canRedo) return;

    const nextColors = redoStack[redoStack.length - 1];

    // Move current state back to undo stack
    setUndoStack((prev) => [...prev, regionColors]);

    // Restore next state
    setRegionColors(nextColors);

    // Pop the redo stack
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setRegionColors(buildInitialColors());
    setUndoStack([]);
    setRedoStack([]);
  };

  // ── regionProps helper ────────────────────────────────────────────────────────
  /**
   * Returns all JSX props needed for a colorable SVG region element.
   * The cursor class switches based on the active tool so the user always
   * gets a clear visual cue for what will happen on click.
   */
  const regionProps = (id) => ({
    id,
    // 'region' for the base CSS; 'region--eraser' when eraser is active
    className: `region${activeTool === 'eraser' ? ' region--eraser' : ''}`,
    style: { fill: regionColors[id], ...REGION_STROKE },
    onClick: () => handleRegionClick(id),
    role: 'button',
    'aria-label': `${activeTool === 'eraser' ? 'Erase' : 'Color'} ${id.replace('cat-', '').replace(/-/g, ' ')} region`,
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleRegionClick(id);
    },
  });

  /* ── JSX ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="studio-page">

      {/* ── Header ── */}
      <header className="studio-header">
        <Link to="/browse" className="studio-back-link" aria-label="Back to Browse">
          ← Browse
        </Link>
        <h1 className="studio-title">Coloring Studio</h1>
      </header>

      {/* ── Main body ── */}
      <div className="studio-body">

        {/* ══════════════════════════════════════════
            Left toolbar
            ══════════════════════════════════════════ */}
        <aside className="studio-toolbar" aria-label="Coloring tools">
          <p className="studio-toolbar-title">Tools</p>

          {/* ── Color picker ── */}
          <div className="tool-section">
            <span className="tool-section-label">🎨 Paint color</span>

            <div className="color-picker-wrapper">
              {/* Large swatch — clicking opens the native color picker */}
              <label
                htmlFor="color-input"
                className="color-swatch-preview"
                style={{ backgroundColor: selectedColor }}
                title="Click to open color picker"
                aria-label="Current color swatch – click to change"
              />

              <div className="color-input-row">
                <input
                  id="color-input"
                  type="color"
                  className="color-native-input"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  title="Pick a color"
                  aria-label="Color picker"
                />
                <span className="color-hex-label">{selectedColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* ── Active color indicator ── */}
          <div
            className="active-color-strip"
            aria-live="polite"
            aria-label={`Active color: ${selectedColor}`}
          >
            <span className="active-color-dot" style={{ backgroundColor: selectedColor }} />
            <span>Active color</span>
          </div>

          <hr className="toolbar-divider" />

          {/* ── Tool selector: Fill / Eraser ── */}
          <div className="tool-section">
            <span className="tool-section-label">✏️ Active tool</span>

            <div className="tool-btn-group">
              {/* Fill tool */}
              <button
                id="tool-fill"
                className={`tool-btn${activeTool === 'fill' ? ' tool-btn--active' : ''}`}
                onClick={() => setActiveTool('fill')}
                title="Fill tool – click a region to color it"
                aria-pressed={activeTool === 'fill'}
              >
                <span className="tool-icon">🪣</span>
                Fill
              </button>

              {/* Eraser tool */}
              <button
                id="tool-eraser"
                className={`tool-btn${activeTool === 'eraser' ? ' tool-btn--active tool-btn--eraser-active' : ''}`}
                onClick={() => setActiveTool('eraser')}
                title="Eraser – click a region to clear it back to white"
                aria-pressed={activeTool === 'eraser'}
              >
                <span className="tool-icon">🧹</span>
                Eraser
              </button>
            </div>
          </div>

          <hr className="toolbar-divider" />

          {/* ── History tools: Undo / Redo ── */}
          <div className="tool-btn-group">
            <button
              id="tool-undo"
              className="tool-btn tool-btn--action"
              onClick={handleUndo}
              disabled={!canUndo}
              title={canUndo ? `Undo (${undoStack.length} step${undoStack.length !== 1 ? 's' : ''})` : 'Nothing to undo'}
              aria-label="Undo last action"
            >
              <span className="tool-icon">↩️</span>
              Undo
            </button>

            <button
              id="tool-redo"
              className="tool-btn tool-btn--action"
              onClick={handleRedo}
              disabled={!canRedo}
              title={canRedo ? `Redo (${redoStack.length} step${redoStack.length !== 1 ? 's' : ''})` : 'Nothing to redo'}
              aria-label="Redo last undone action"
            >
              <span className="tool-icon">↪️</span>
              Redo
            </button>
          </div>

          <hr className="toolbar-divider" />

          {/* ── Reset ── */}
          <button
            id="tool-reset"
            className="tool-btn tool-btn--reset"
            onClick={handleReset}
            title="Reset – clear all colors and history"
            aria-label="Reset all coloring regions to white"
          >
            <span className="tool-icon">🔄</span>
            Reset all
          </button>
        </aside>

        {/* ══════════════════════════════════════════
            Central workspace — inline SVG
            ══════════════════════════════════════════ */}
        <section className="studio-workspace" aria-label="Coloring workspace">
          <span className="studio-canvas-label">Canvas</span>

          <div className="studio-svg-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 500"
              aria-label="Cat coloring page – click a region to color or erase it"
              role="img"
            >
              {/* ── Tail (drawn first so body sits on top) ── */}
              <path
                {...regionProps('cat-tail')}
                d="M 230 380
                   C 300 370, 340 320, 320 270
                   C 310 250, 290 255, 285 275
                   C 295 305, 265 340, 215 350
                   Z"
              />

              {/* ── Body ── */}
              <ellipse {...regionProps('cat-body')} cx="200" cy="360" rx="100" ry="110" />

              {/* ── Belly patch ── */}
              <ellipse {...regionProps('cat-belly')} cx="200" cy="375" rx="52" ry="68" />

              {/* ── Left front paw ── */}
              <ellipse {...regionProps('cat-paw-left')} cx="145" cy="455" rx="32" ry="18" />

              {/* ── Right front paw ── */}
              <ellipse {...regionProps('cat-paw-right')} cx="255" cy="455" rx="32" ry="18" />

              {/* ── Left ear ── */}
              <polygon {...regionProps('cat-ear-left')} points="130,185 110,120 170,165" />

              {/* ── Right ear ── */}
              <polygon {...regionProps('cat-ear-right')} points="270,185 290,120 230,165" />

              {/* ── Head ── */}
              <circle {...regionProps('cat-head')} cx="200" cy="210" r="90" />

              {/* ── Left eye ── */}
              <ellipse {...regionProps('cat-eye-left')} cx="168" cy="200" rx="18" ry="20" />

              {/* ── Right eye ── */}
              <ellipse {...regionProps('cat-eye-right')} cx="232" cy="200" rx="18" ry="20" />

              {/* ── Pupils (non-interactive – always black) ── */}
              <ellipse style={{ fill: '#1a1a1a' }} cx="170" cy="202" rx="9" ry="13" />
              <ellipse style={{ fill: '#1a1a1a' }} cx="234" cy="202" rx="9" ry="13" />

              {/* ── Eye shine ── */}
              <circle style={{ fill: '#ffffff' }} cx="174" cy="197" r="3" />
              <circle style={{ fill: '#ffffff' }} cx="238" cy="197" r="3" />

              {/* ── Nose ── */}
              <polygon {...regionProps('cat-nose')} points="200,238 192,250 208,250" />

              {/* ── Mouth curves (detail lines – no click) ── */}
              <path style={DETAIL_LINE} d="M 192 250 Q 185 262 178 260" />
              <path style={DETAIL_LINE} d="M 208 250 Q 215 262 222 260" />

              {/* ── Whiskers left ── */}
              <line style={DETAIL_LINE} x1="155" y1="248" x2="115" y2="240" />
              <line style={DETAIL_LINE} x1="155" y1="256" x2="112" y2="258" />
              <line style={DETAIL_LINE} x1="155" y1="264" x2="118" y2="272" />

              {/* ── Whiskers right ── */}
              <line style={DETAIL_LINE} x1="245" y1="248" x2="285" y2="240" />
              <line style={DETAIL_LINE} x1="245" y1="256" x2="288" y2="258" />
              <line style={DETAIL_LINE} x1="245" y1="264" x2="282" y2="272" />

              {/* ── Inner ear lines ── */}
              <line style={DETAIL_LINE} x1="128" y1="175" x2="148" y2="145" />
              <line style={DETAIL_LINE} x1="148" y1="145" x2="163" y2="168" />
              <line style={DETAIL_LINE} x1="272" y1="175" x2="252" y2="145" />
              <line style={DETAIL_LINE} x1="252" y1="145" x2="237" y2="168" />

              {/* ── Paw toe lines left ── */}
              <line style={DETAIL_LINE} x1="130" y1="450" x2="130" y2="462" />
              <line style={DETAIL_LINE} x1="145" y1="448" x2="145" y2="462" />
              <line style={DETAIL_LINE} x1="160" y1="450" x2="160" y2="462" />

              {/* ── Paw toe lines right ── */}
              <line style={DETAIL_LINE} x1="240" y1="450" x2="240" y2="462" />
              <line style={DETAIL_LINE} x1="255" y1="448" x2="255" y2="462" />
              <line style={DETAIL_LINE} x1="270" y1="450" x2="270" y2="462" />
            </svg>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Studio;
