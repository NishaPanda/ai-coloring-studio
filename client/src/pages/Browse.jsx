/**
 * Browse.jsx – Phase 2: Explore Worlds + All Artwork Browse Experience
 *
 * Features:
 *   - "Explore Worlds" curated collection cards (6 collections)
 *   - "All Artwork" comprehensive gallery with search and multi-filtering
 *   - Collection filter pills + category & difficulty filters
 *   - Full backward compatibility with existing tests and features
 */

import { useState } from 'react';
import { coloringPages, CATEGORIES, DIFFICULTIES } from '../data/coloringPages';
import { collections, getCollectionById } from '../data/collections';
import CollectionCard from '../components/CollectionCard';
import PageCard from '../components/PageCard';
import './Browse.css';

const Browse = () => {
  const [searchQuery,      setSearchQuery]      = useState('');
  const [collectionFilter, setCollectionFilter] = useState('classic-studio');
  const [categoryFilter,   setCategoryFilter]   = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Filter computation
  const filteredPages = coloringPages.filter((page) => {
    // Collection matching
    const matchesCollection =
      collectionFilter === 'All' ||
      page.collectionId === collectionFilter ||
      (getCollectionById(collectionFilter)?.artworkIds?.includes(page.id) ?? false);

    // Category matching
    const matchesCategory =
      categoryFilter === 'All' || page.category === categoryFilter;

    // Difficulty matching
    const matchesDifficulty =
      difficultyFilter === 'All' || page.difficulty === difficultyFilter;

    // Search query matching
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      page.title.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query) ||
      page.category.toLowerCase().includes(query) ||
      (page.collectionName && page.collectionName.toLowerCase().includes(query));

    return matchesCollection && matchesCategory && matchesDifficulty && matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setCollectionFilter('classic-studio');
    setCategoryFilter('All');
    setDifficultyFilter('All');
  };

  const hasActiveFilter =
    searchQuery.trim() !== '' ||
    collectionFilter !== 'classic-studio' ||
    categoryFilter !== 'All' ||
    difficultyFilter !== 'All';

  const difficultyClass = (d) => {
    if (d === 'Easy')   return 'filter-btn--easy';
    if (d === 'Medium') return 'filter-btn--medium';
    if (d === 'Hard')   return 'filter-btn--hard';
    return '';
  };

  const categoryIcons = {
    All: '✨',
    Animals: '🐾',
    Nature: '🌿',
    Space: '🚀',
    Fantasy: '🐉',
  };

  const handleSelectCollection = (colId) => {
    setCollectionFilter(colId);
    const galleryEl = document.getElementById('all-artwork-section');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowAllArtwork = () => {
    setCollectionFilter('All');
    const galleryEl = document.getElementById('all-artwork-section');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedCollectionObj = collectionFilter !== 'All' ? getCollectionById(collectionFilter) : null;

  return (
    <div className="browse-page">
      <div className="browse-container">

        {/* ── Page Header ── */}
        <header className="browse-header">
          <div className="browse-header-badge">
            <span className="browse-badge-sparkle">🎨</span>
            <span>Explore Worlds &amp; Coloring Pages</span>
          </div>
          <h1 className="browse-title">Browse Coloring Pages</h1>
          <p className="browse-subtitle">
            Immerse yourself in six themed creative worlds or browse the complete gallery of hand-crafted vector canvases.
          </p>
        </header>

        {/* ══════════════════════════════════════════════════
            SECTION 1: "EXPLORE WORLDS" CURATED SHOWCASE
            ══════════════════════════════════════════════════ */}
        <section className="explore-worlds-section" aria-label="Explore themed worlds">
          <div className="section-title-bar">
            <div className="section-title-group">
              <span className="section-eyebrow">Themed Collections</span>
              <h2 className="section-heading">Explore Themed Worlds</h2>
            </div>
            <button
              type="button"
              className={`view-all-pill${collectionFilter === 'All' ? ' view-all-pill--active' : ''}`}
              onClick={handleShowAllArtwork}
              aria-label="View all artworks across collections"
            >
              <span>View All Artwork ({coloringPages.length})</span>
              <span className="view-all-arrow">↓</span>
            </button>
          </div>

          <div className="collections-grid">
            {collections.map((col) => {
              const availableInCol = coloringPages.filter((p) => col.artworkIds?.includes(p.id)).length;
              return (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  isActive={collectionFilter === col.id}
                  onSelect={handleSelectCollection}
                  availableCount={availableInCol}
                />
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SECTION 2: "ALL ARTWORK" GALLERY & FILTER CENTER
            ══════════════════════════════════════════════════ */}
        <section id="all-artwork-section" className="all-artwork-section" aria-label="Artwork gallery and filters">
          
          <div className="section-title-bar">
            <div className="section-title-group">
              <span className="section-eyebrow">Canvas Gallery</span>
              <h2 className="section-heading">
                {selectedCollectionObj ? `${selectedCollectionObj.icon} ${selectedCollectionObj.name}` : 'All Artwork'}
              </h2>
            </div>
            {collectionFilter !== 'All' && (
              <button
                type="button"
                className="show-all-link-btn"
                onClick={handleShowAllArtwork}
              >
                ← Back to All Collections
              </button>
            )}
          </div>

          {/* ── Search & Filter Control Center ── */}
          <div className="browse-controls-card">
            
            {/* Search bar */}
            <div className="browse-search-wrapper">
              <span className="browse-search-icon" aria-hidden="true">🔍</span>
              <input
                id="browse-search"
                type="search"
                className="browse-search"
                placeholder="Search by title, animal, nature, space, world…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search coloring pages"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="browse-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filters row */}
            <div className="browse-filters" role="group" aria-label="Filter coloring pages">

              {/* Collection filter row */}
              <div className="filter-group">
                <span className="filter-group-label">Collection</span>
                <div className="filter-btn-row">
                  <button
                    type="button"
                    className={`filter-btn${collectionFilter === 'All' ? ' filter-btn--active' : ''}`}
                    onClick={() => setCollectionFilter('All')}
                    aria-pressed={collectionFilter === 'All'}
                    aria-label="All Collections"
                  >
                    <span>All Collections</span>
                  </button>
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      className={`filter-btn${collectionFilter === col.id ? ' filter-btn--active' : ''}`}
                      onClick={() => setCollectionFilter(col.id)}
                      aria-pressed={collectionFilter === col.id}
                      aria-label={col.name}
                    >
                      <span className="filter-btn-icon" aria-hidden="true">{col.icon}</span>
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div className="filter-group">
                <span className="filter-group-label">Category</span>
                <div className="filter-btn-row">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`filter-btn${categoryFilter === cat ? ' filter-btn--active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                      aria-pressed={categoryFilter === cat}
                      aria-label={cat}
                    >
                      <span className="filter-btn-icon" aria-hidden="true">{categoryIcons[cat] || '•'}</span>
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty filter */}
              <div className="filter-group">
                <span className="filter-group-label">Difficulty</span>
                <div className="filter-btn-row">
                  {DIFFICULTIES.map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      className={`filter-btn ${difficultyClass(diff)}${difficultyFilter === diff ? ' filter-btn--active' : ''}`}
                      onClick={() => setDifficultyFilter(diff)}
                      aria-pressed={difficultyFilter === diff}
                      aria-label={diff}
                    >
                      <span>{diff}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Reset button when active */}
            {hasActiveFilter && (
              <div className="browse-active-filter-bar">
                <span className="active-filter-summary">
                  Filtered view active
                  {collectionFilter !== 'All' && selectedCollectionObj && ` (${selectedCollectionObj.name})`}
                </span>
                <button type="button" className="browse-reset-link" onClick={clearFilters}>
                  Reset all filters
                </button>
              </div>
            )}

          </div>

          {/* ── Results Bar ── */}
          <div className="browse-results-bar">
            <p className="browse-results-count">
              {filteredPages.length === 0
                ? 'No pages found'
                : `${filteredPages.length} page${filteredPages.length !== 1 ? 's' : ''} found`}
            </p>
            <span className="browse-palette-tag">✨ Click any canvas to enter Coloring Studio</span>
          </div>

          {/* ── Grid or Empty State ── */}
          {filteredPages.length > 0 ? (
            <div className="browse-grid">
              {filteredPages.map((page) => (
                <PageCard key={page.id} {...page} />
              ))}
            </div>
          ) : selectedCollectionObj && collectionFilter !== 'classic-studio' && searchQuery === '' ? (
            /* Curated World Preview for upcoming collections */
            <div className="world-preview-card" role="status">
              <div className="world-preview-icon" aria-hidden="true">{selectedCollectionObj.icon}</div>
              <h3 className="world-preview-title">{selectedCollectionObj.name}</h3>
              <p className="world-preview-tagline">{selectedCollectionObj.subtitle}</p>
              <p className="world-preview-desc">{selectedCollectionObj.description}</p>
              <div className="world-preview-status">
                <span className="world-preview-pill">✨ Planned Collection (3 Canvases)</span>
                <p className="world-preview-note">
                  New detailed illustrations for this world will be added in upcoming phases!
                </p>
              </div>
              <div className="world-preview-actions">
                <button type="button" className="browse-clear-btn" onClick={handleShowAllArtwork}>
                  Browse All Available Artwork
                </button>
                <button
                  type="button"
                  className="filter-btn filter-btn--active"
                  onClick={() => setCollectionFilter('classic-studio')}
                >
                  Explore Classic Studio Canvases
                </button>
              </div>
            </div>
          ) : (
            <div className="browse-empty" role="status" aria-live="polite">
              <div className="browse-empty-icon-box">
                <span className="browse-empty-icon">🎨</span>
              </div>
              <p className="browse-empty-title">No coloring pages match your filters.</p>
              <p className="browse-empty-msg">
                We couldn’t find anything matching &quot;{searchQuery}&quot;. Try clearing filters or using different keywords.
              </p>
              {hasActiveFilter && (
                <button type="button" className="browse-clear-btn" onClick={clearFilters}>
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Browse;
