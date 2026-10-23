/**
 * Studio.jsx – Phase 6: Artwork Saving & Loading
 *
 * Preserves all Phase 4 & Phase 5 features:
 *   – Dynamic page loading from coloringPages.js based on URL param (:id)
 *   – Color picker, swatch, hex label, active-color indicator
 *   – Fill tool and Eraser tool with active visual state
 *   – Undo / Redo with history stacks (no-op guard, MAX_HISTORY cap)
 *   – Reset all that clears history
 *   – Interactive SVG regions with click and keyboard support
 *
 * Phase 6 additions:
 *   – Reopen saved artwork via ?artworkId= query param
 *   – Fetches saved region colors and restores state
 *   – Resets undo/redo history upon loading saved artwork
 *   – Saves new artwork or updates existing record without duplicates
 *   – Loading, saving, success, and error feedback states
 *   – Auth awareness: prompts guest users to log in to save
 */

import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { coloringPages } from '../data/coloringPages';
import { createArtwork, updateArtwork, getArtworkById } from '../services/artworkService';
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
  const { user } = useContext(AuthContext);

  // ── URL param & Query param ──────────────────────────────────────────────────
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const artworkIdParam = searchParams.get('artworkId');

  // Look up this page in the data file (undefined if id is invalid)
  const page = coloringPages.find((p) => p.id === id);

  // ── Tool state ──────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  const [activeTool, setActiveTool]       = useState('fill'); // 'fill' | 'eraser'

  // ── Canvas state ─────────────────────────────────────────────────────────────
  const [regionColors, setRegionColors] = useState(() =>
    page ? buildColors(page.regionIds) : {}
  );

  // ── History stacks ───────────────────────────────────────────────────────────
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // ── Artwork persistence state ────────────────────────────────────────────────
  const [currentArtworkId, setCurrentArtworkId] = useState(artworkIdParam || null);
  const [artworkTitle, setArtworkTitle]         = useState('');
  const [isSaving, setIsSaving]                 = useState(false);
  const [isLoadingArtwork, setIsLoadingArtwork] = useState(false);
  const [saveFeedback, setSaveFeedback]         = useState(null); // { type: 'success' | 'error' | 'info', message: string }
  const [loadError, setLoadError]               = useState(null);

  // ── Helper to clear feedback banner after a delay ────────────────────────────
  const showFeedback = (type, message, duration = 4000) => {
    setSaveFeedback({ type, message });
    if (duration > 0) {
      setTimeout(() => {
        setSaveFeedback((current) => (current?.message === message ? null : current));
      }, duration);
    }
  };

  // ── Reopen saved artwork if artworkIdParam is present ────────────────────────
  const loadSavedArtwork = useCallback(async (artId) => {
    if (!artId || !page) return;
    setIsLoadingArtwork(true);
    setLoadError(null);

    try {
      const response = await getArtworkById(artId);
      const loadedArtwork = response.artwork;

      if (loadedArtwork) {
        setCurrentArtworkId(loadedArtwork._id);
        setArtworkTitle(loadedArtwork.title || `${page.title} Artwork`);

        // Convert Map to plain object if needed, and merge over blank defaults
        const rawColors = loadedArtwork.regionColors;
        const colorMap = rawColors instanceof Map ? Object.fromEntries(rawColors) : (rawColors || {});

        setRegionColors({
          ...buildColors(page.regionIds),
          ...colorMap,
        });

        // Reset undo and redo history for the newly loaded artwork baseline
        setUndoStack([]);
        setRedoStack([]);
        setActiveTool('fill');
      }
    } catch (err) {
      console.error('Failed to load saved artwork:', err);
      const msg = err.response?.data?.message || 'Could not load the saved artwork.';
      setLoadError(msg);
      showFeedback('error', msg, 6000);
    } finally {
      setIsLoadingArtwork(false);
    }
  }, [page]);

  // ── Reset state when page ID changes or initialize saved artwork ──────────────
  useEffect(() => {
    if (page) {
      if (artworkIdParam) {
        loadSavedArtwork(artworkIdParam);
      } else {
        // Fresh blank canvas for this page
        setCurrentArtworkId(null);
        setArtworkTitle(`${page.title} Artwork`);
        setRegionColors(buildColors(page.regionIds));
        setUndoStack([]);
        setRedoStack([]);
        setActiveTool('fill');
        setSaveFeedback(null);
        setLoadError(null);
      }
    }
  }, [id, artworkIdParam, page, loadSavedArtwork]);

  // ── Derived flags ────────────────────────────────────────────────────────────
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  // ── Action handler ───────────────────────────────────────────────────────────
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

  // ── Save or Update Artwork ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) {
      showFeedback('error', 'Please log in to save your artwork.', 5000);
      return;
    }

    if (!page) return;

    const trimmedTitle = artworkTitle.trim() || `${page.title} Artwork`;
    setIsSaving(true);
    setSaveFeedback(null);

    try {
      if (currentArtworkId) {
        // Update existing artwork record (no duplicate creation)
        const response = await updateArtwork(currentArtworkId, {
          title: trimmedTitle,
          regionColors,
        });

        if (response.success) {
          showFeedback('success', 'Artwork changes saved successfully!');
          if (response.artwork?.title) {
            setArtworkTitle(response.artwork.title);
          }
        }
      } else {
        // Create new artwork record
        const response = await createArtwork({
          pageId: page.id,
          pageTitle: page.title,
          title: trimmedTitle,
          regionColors,
        });

        if (response.success && response.artwork?._id) {
          setCurrentArtworkId(response.artwork._id);
          setArtworkTitle(response.artwork.title);
          showFeedback('success', 'Artwork saved to your Gallery!');
        }
      }
    } catch (err) {
      console.error('Failed to save artwork:', err);
      const errMsg = err.response?.data?.message || 'Failed to save artwork. Please try again.';
      showFeedback('error', errMsg, 6000);
    } finally {
      setIsSaving(false);
    }
  };

  // ── regionProps helper ───────────────────────────────────────────────────────
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

      {/* ── Header: navigation + title + meta + editing badge ── */}
      <header className="studio-header">
        <div className="studio-header-nav">
          <Link to="/browse" className="studio-back-link" aria-label="Back to Browse">
            ← Browse
          </Link>
          {user && (
            <Link to="/gallery" className="studio-gallery-link" aria-label="Go to My Gallery">
              🖼️ My Gallery
            </Link>
          )}
        </div>

        <div className="studio-title-group">
          <h1 className="studio-title">{page.title}</h1>
          {currentArtworkId && (
            <span className="studio-saved-badge" title="You are editing an existing saved artwork">
              Saved Artwork
            </span>
          )}
        </div>

        <div className="studio-page-meta">
          <span className="studio-category-label">{page.category}</span>
          <span className={`studio-difficulty-badge studio-difficulty-badge--${page.difficulty.toLowerCase()}`}>
            {page.difficulty}
          </span>
        </div>
      </header>

      {/* ── Saved artwork load error alert ── */}
      {loadError && (
        <div className="studio-alert studio-alert--error" role="alert">
          <span>⚠️ {loadError}</span>
          <Link to="/gallery" className="studio-alert-link">Return to Gallery</Link>
        </div>
      )}

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

          <hr className="toolbar-divider" />

          {/* ── Phase 6: Save Artwork Section ── */}
          <div className="tool-section studio-save-section">
            <span className="tool-section-label">💾 Save artwork</span>

            <div className="artwork-title-field">
              <label htmlFor="artwork-title-input" className="artwork-title-label">
                Artwork Name
              </label>
              <input
                id="artwork-title-input"
                type="text"
                className="artwork-title-input"
                value={artworkTitle}
                onChange={(e) => setArtworkTitle(e.target.value)}
                placeholder="Name your artwork"
                maxLength={40}
              />
            </div>

            <button
              id="tool-save"
              className="tool-btn tool-btn--save"
              onClick={handleSave}
              disabled={isSaving || isLoadingArtwork}
              title={currentArtworkId ? 'Update this artwork' : 'Save artwork to Gallery'}
              aria-label={currentArtworkId ? 'Update artwork' : 'Save artwork'}
            >
              <span className="tool-icon">{isSaving ? '⏳' : '💾'}</span>
              {isSaving ? 'Saving...' : currentArtworkId ? 'Update Artwork' : 'Save Artwork'}
            </button>

            {/* Save Feedback Banner */}
            {saveFeedback && (
              <div
                className={`studio-feedback studio-feedback--${saveFeedback.type}`}
                role="status"
                aria-live="polite"
              >
                {saveFeedback.message}
              </div>
            )}

            {/* Hint for unauthenticated users */}
            {!user && (
              <p className="studio-login-hint">
                <Link to="/login" className="studio-login-link">Log in</Link> to save to your personal Gallery.
              </p>
            )}
          </div>
        </aside>

        {/* ══════════════════════════════════════════
            Central workspace — dynamic SVG component
            ══════════════════════════════════════════ */}
        <section className="studio-workspace" aria-label="Coloring workspace">
          <span className="studio-canvas-label">
            {isLoadingArtwork ? 'Loading artwork...' : 'Canvas'}
          </span>

          <div className="studio-svg-wrapper">
            {isLoadingArtwork ? (
              <div className="studio-canvas-loading">
                <div className="studio-spinner" aria-hidden="true" />
                <p>Loading your saved artwork...</p>
              </div>
            ) : (
              SvgComponent && <SvgComponent regionProps={regionProps} />
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Studio;
