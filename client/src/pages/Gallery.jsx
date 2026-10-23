/**
 * Gallery.jsx – Phase 6: User Artwork Gallery
 *
 * Requirements:
 *   - Display only the authenticated user's saved artworks
 *   - Render accurate colored previews using the saved region colors
 *   - Allow users to reopen saved artwork in Studio (/studio/:pageId?artworkId=:id)
 *   - Allow users to delete their own artwork with confirmation
 *   - Handle loading, success, empty, error, and unauthenticated states
 */

import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyArtworks, deleteArtwork } from '../services/artworkService';
import CatSvg    from '../components/svg/CatSvg';
import FlowerSvg from '../components/svg/FlowerSvg';
import RocketSvg from '../components/svg/RocketSvg';
import DragonSvg from '../components/svg/DragonSvg';
import './Gallery.css';

/** Map of page IDs to SVG components for miniature previews */
const SVG_COMPONENTS = {
  cat:    CatSvg,
  flower: FlowerSvg,
  rocket: RocketSvg,
  dragon: DragonSvg,
};

/**
 * ArtworkPreview – renders the SVG for a saved artwork with its custom colors
 */
const ArtworkPreview = ({ pageId, regionColors }) => {
  const SvgComponent = SVG_COMPONENTS[pageId];

  if (!SvgComponent) {
    return (
      <div className="gallery-preview-placeholder">
        <span>🎨</span>
      </div>
    );
  }

  // Provide regionProps so each region gets its saved color
  const previewRegionProps = (regionId) => ({
    id: `preview-${regionId}`,
    style: {
      fill: regionColors?.[regionId] || '#ffffff',
      stroke: '#1a1a1a',
      strokeWidth: 2.5,
      strokeLinejoin: 'round',
      strokeLinecap: 'round',
    },
  });

  return (
    <div className="gallery-card-preview-svg" aria-hidden="true">
      <SvgComponent regionProps={previewRegionProps} />
    </div>
  );
};

const Gallery = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [artworks, setArtworks]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [actionNotice, setActionNotice] = useState(null); // { type: 'success' | 'error', text: string }

  // Deletion modal state
  const [artworkToDelete, setArtworkToDelete] = useState(null);
  const [isDeleting, setIsDeleting]           = useState(false);

  // Helper to show transient notification
  const showNotice = (type, text) => {
    setActionNotice({ type, text });
    setTimeout(() => {
      setActionNotice((cur) => (cur?.text === text ? null : cur));
    }, 3500);
  };

  // ── Fetch artworks for the logged-in user ──────────────────────────────────
  const fetchArtworks = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getMyArtworks();
      if (data.success && Array.isArray(data.artworks)) {
        setArtworks(data.artworks);
      } else {
        setArtworks([]);
      }
    } catch (err) {
      console.error('Failed to fetch user artworks:', err);
      const msg = err.response?.data?.message || 'Failed to load your artworks. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // ── Confirm & Delete Artwork ───────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!artworkToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteArtwork(artworkToDelete._id);
      if (res.success) {
        setArtworks((prev) => prev.filter((a) => a._id !== artworkToDelete._id));
        showNotice('success', `"${artworkToDelete.title}" deleted.`);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      const msg = err.response?.data?.message || 'Could not delete artwork.';
      showNotice('error', msg);
    } finally {
      setIsDeleting(false);
      setArtworkToDelete(null);
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ── Unauthenticated State ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="gallery-page">
        <header className="gallery-header">
          <h1 className="gallery-title">My Gallery</h1>
        </header>

        <div className="gallery-auth-card">
          <span className="gallery-auth-icon">🔒</span>
          <h2>Log in to view your gallery</h2>
          <p>
            Your saved coloring artworks are private to your account.
            Log in to view, edit, and manage your creations!
          </p>
          <div className="gallery-auth-actions">
            <Link to="/login" className="btn-primary">
              Log In
            </Link>
            <Link to="/register" className="btn-secondary">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Authenticated View ────────────────────────────────────────────────
  return (
    <div className="gallery-page">

      {/* ── Top Header ── */}
      <header className="gallery-header">
        <div>
          <h1 className="gallery-title">My Gallery</h1>
          <p className="gallery-subtitle">
            {artworks.length > 0
              ? `${artworks.length} saved ${artworks.length === 1 ? 'artwork' : 'artworks'}`
              : 'Your personal coloring collection'}
          </p>
        </div>

        <Link to="/browse" className="gallery-browse-btn">
          + Color New Page
        </Link>
      </header>

      {/* ── Global Notification Banner ── */}
      {actionNotice && (
        <div className={`gallery-notice gallery-notice--${actionNotice.type}`} role="status">
          {actionNotice.text}
        </div>
      )}

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="gallery-state-panel">
          <div className="gallery-spinner" aria-hidden="true" />
          <p>Loading your saved artworks...</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!isLoading && errorMessage && (
        <div className="gallery-state-panel gallery-state-panel--error">
          <span className="gallery-state-icon">⚠️</span>
          <h2>Unable to load gallery</h2>
          <p>{errorMessage}</p>
          <button className="btn-retry" onClick={fetchArtworks}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !errorMessage && artworks.length === 0 && (
        <div className="gallery-state-panel gallery-empty-state">
          <span className="gallery-empty-icon">🎨</span>
          <h2>No saved artworks yet</h2>
          <p>
            You haven&apos;t saved any coloring pages yet. Pick a template from our
            collection, color it in the Studio, and click &quot;Save Artwork&quot;!
          </p>
          <Link to="/browse" className="btn-primary">
            Explore Coloring Pages
          </Link>
        </div>
      )}

      {/* ── Artworks Grid (Success State) ── */}
      {!isLoading && !errorMessage && artworks.length > 0 && (
        <div className="gallery-grid">
          {artworks.map((artwork) => {
            // Region colors can come as an Object or Map
            const regionColorsObj =
              artwork.regionColors instanceof Map
                ? Object.fromEntries(artwork.regionColors)
                : (artwork.regionColors || {});

            return (
              <article key={artwork._id} className="gallery-card">
                {/* SVG Preview */}
                <div className="gallery-card-preview">
                  <ArtworkPreview
                    pageId={artwork.pageId}
                    regionColors={regionColorsObj}
                  />
                </div>

                {/* Card Content */}
                <div className="gallery-card-body">
                  <div className="gallery-card-meta">
                    <span className="gallery-card-template">{artwork.pageTitle || artwork.pageId}</span>
                    <span className="gallery-card-date">{formatDate(artwork.updatedAt || artwork.createdAt)}</span>
                  </div>

                  <h3 className="gallery-card-title">{artwork.title || 'Untitled Artwork'}</h3>

                  {/* Actions */}
                  <div className="gallery-card-actions">
                    <button
                      className="btn-card-open"
                      onClick={() => navigate(`/studio/${artwork.pageId}?artworkId=${artwork._id}`)}
                      title="Open and edit this artwork in Studio"
                    >
                      ✏️ Open in Studio
                    </button>
                    <button
                      className="btn-card-delete"
                      onClick={() => setArtworkToDelete(artwork)}
                      title="Delete this artwork"
                      aria-label={`Delete ${artwork.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {artworkToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <span className="modal-icon">🗑️</span>
            <h2 id="modal-title" className="modal-title">Delete Artwork?</h2>
            <p className="modal-description">
              Are you sure you want to delete <strong>&quot;{artworkToDelete.title}&quot;</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setArtworkToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn-modal-delete"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;
