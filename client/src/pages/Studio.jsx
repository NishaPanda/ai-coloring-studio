/**
 * Studio.jsx – Phase 5: Dynamic page loading from coloringPages.js
 *
 * Changes from Phase 4C:
 *   – Reads :id from the URL via useParams().
 *   – Looks up the page in coloringPages.js.
 *   – Initialises regionColors from page.regionIds (not a hardcoded list).
 *   – Resets all coloring state (colors, undo, redo) when navigating between
 *     pages (via useEffect on the id param).
 *   – Renders the matching SVG component (CatSvg | FlowerSvg | RocketSvg |
 *     DragonSvg) via a lookup map — no hardcoded SVG in this file.
 *   – Shows the page title + category/difficulty in the header.
 *   – Shows a friendly "page not found" fallback for unknown ids.
 *
 * All Phase 4C behavior is fully preserved:
 *   – Color picker, swatch, hex label, active-color strip.
 *   – Fill tool and Eraser tool with active-state visual.
 *   – Undo / Redo with history stacks (no-op guard, MAX_HISTORY cap).
 *   – Reset that clears history.
 *   – SVG regions: onClick + onKeyDown handlers, cursor styles.
 *
 * Not implemented yet (Phase 6+):
 *   – Saving artwork, AI features, backend/API changes.
 */

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { coloringPages } from '../data/coloringPages';
import CatSvg    from '../components/svg/CatSvg';
import FlowerSvg from '../components/svg/FlowerSvg';
import RocketSvg from '../components/svg/RocketSvg';
import DragonSvg from '../components/svg/DragonSvg';
import './Studio.css';

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const BLANK_COLOR = '#ffffff';
const MAX_HISTORY = 50;

/** Inline stroke style applied to every region element — never changes with state. */
const REGION_STROKE = {
  stroke: '#1a1a1a',
  strokeWidth: 3,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
};

/**
 * SVG_COMPONENTS maps a page id to the matching JSX SVG component.
 * Add new pages here when more coloring pages are introduced.
 */
const SVG_COMPONENTS = {
  cat:    CatSvg,
  flower: FlowerSvg,
  rocket: RocketSvg,
  dragon: DragonSvg,
};

/** Build a blank regionColors object from a list of region ids. */
const buildColors = (regionIds) =>
  Object.fromEntries(regionIds.map((rid) => [rid, BLANK_COLOR]));

/* ─── Studio component ───────────────────────────────────────────────────────── */
const Studio = () => {

  // ── URL param ────────────────────────────────────────────────────────────────
  const { id } = useParams();

  // Look up this page in the data file (undefined if id is invalid)
  const page = coloringPages.find((p) => p.id === id);

  // ── Tool state ──────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [activeTool, setActiveTool]       = useState('fill'); // 'fill' | 'eraser'

  // ── Canvas state ─────────────────────────────────────────────────────────────
  // Initialised from the page's regionIds so every region starts white.
  const [regionColors, setRegionColors] = useState(() =>
    page ? buildColors(page.regionIds) : {}
  );

  // ── History stacks ───────────────────────────────────────────────────────────
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // ── Reset coloring state when the user navigates to a different page ─────────
  // Dependency: id (the URL string). Runs whenever the URL param changes.
  useEffect(() => {
    if (page) {
      setRegionColors(buildColors(page.regionIds));
      setUndoStack([]);
      setRedoStack([]);
      setActiveTool('fill');
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived flags ────────────────────────────────────────────────────────────
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // ── Action handler ───────────────────────────────────────────────────────────
  /**
   * applyAction – shared logic for fill and erase.
   * Skips recording when the region color wouldn't actually change (no-op guard).
   */
  const applyAction = (regionId, newColor) => {
    if ((regionColors[regionId] ?? BLANK_COLOR) === newColor) return;

    // Push current snapshot onto undo stack (cap at MAX_HISTORY)
    setUndoStack((prev) => {
      const updated = [...prev, regionColors];
      return updated.length > MAX_HISTORY
        ? updated.slice(updated.length - MAX_HISTORY)
        : updated;
    });

    // New action always clears redo branch
    setRedoStack([]);

    // Apply new color to just the clicked region
    setRegionColors((prev) => ({ ...prev, [regionId]: newColor }));
  };

  // ── Region click handler ─────────────────────────────────────────────────────
  const handleRegionClick = (regionId) => {
    applyAction(regionId, activeTool === 'eraser' ? BLANK_COLOR : selectedColor);
  };

  // ── Undo ─────────────────────────────────────────────────────────────────────
  const handleUndo = () => {
    if (!canUndo) return;
    const previousColors = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, regionColors]);
    setRegionColors(previousColors);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // ── Redo ─────────────────────────────────────────────────────────────────────
  const handleRedo = () => {
    if (!canRedo) return;
    const nextColors = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, regionColors]);
    setRegionColors(nextColors);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (!page) return;
    setRegionColors(buildColors(page.regionIds));
    setUndoStack([]);
    setRedoStack([]);
  };

  // ── regionProps helper ───────────────────────────────────────────────────────
  /**
   * Returns all JSX props for a colorable SVG region element.
   * Passed down to each SVG component so regions are interactive.
   */
  const regionProps = (regionId) => ({
    id: regionId,
    className: `region${activeTool === 'eraser' ? ' region--eraser' : ''}`,
    style: { fill: regionColors[regionId] ?? BLANK_COLOR, ...REGION_STROKE },
    onClick: () => handleRegionClick(regionId),
    role: 'button',
    'aria-label': `${activeTool === 'eraser' ? 'Erase' : 'Color'} ${regionId
      .replace(/^[^-]+-/, '')
      .replace(/-/g, ' ')} region`,
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleRegionClick(regionId);
    },
  });

  // ── Resolve the SVG component for this page ───────────────────────────────────
  const SvgComponent = page ? SVG_COMPONENTS[page.id] : null;

  /* ── Page not found fallback ──────────────────────────────────────────────── */
  if (!page) {
    return (
      <div className="studio-page">
        <header className="studio-header">
          <Link to="/browse" className="studio-back-link" aria-label="Back to Browse">
            ← Browse
          </Link>
          <h1 className="studio-title">Coloring Studio</h1>
        </header>
        <div className="studio-not-found">
          <span className="studio-not-found-icon">🎨</span>
          <p className="studio-not-found-msg">
            Coloring page <strong>&quot;{id}&quot;</strong> was not found.
          </p>
          <Link to="/browse" className="studio-back-link">
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────────────────────────── */
  return (
    <div className="studio-page">

      {/* ── Header: back link + page title + meta ── */}
      <header className="studio-header">
        <Link to="/browse" className="studio-back-link" aria-label="Back to Browse">
          ← Browse
        </Link>
        <h1 className="studio-title">{page.title}</h1>
        <div className="studio-page-meta">
          <span className="studio-category-label">{page.category}</span>
          <span className={`studio-difficulty-badge studio-difficulty-badge--${page.difficulty.toLowerCase()}`}>
            {page.difficulty}
          </span>
        </div>
      </header>

      {/* ── Main body: toolbar + workspace ── */}
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

          {/* ── History: Undo / Redo ── */}
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
            Central workspace — dynamic SVG component
            ══════════════════════════════════════════ */}
        <section className="studio-workspace" aria-label="Coloring workspace">
          <span className="studio-canvas-label">Canvas</span>

          <div className="studio-svg-wrapper">
            {/*
             * SvgComponent is one of: CatSvg | FlowerSvg | RocketSvg | DragonSvg
             * It receives regionProps — the function that attaches fill state,
             * click handlers, and keyboard handlers to each SVG region element.
             * No SVG markup lives in Studio.jsx itself.
             */}
            {SvgComponent && <SvgComponent regionProps={regionProps} />}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Studio;
