/**
 * Browse.jsx – Phase 5: Coloring Pages & Browse
 *
 * Features:
 *   - Displays all sample coloring pages from coloringPages.js
 *   - Search bar (title + description)
 *   - Category filter pills
 *   - Difficulty filter pills
 *   - All three filters work together simultaneously
 *   - Friendly empty state when no pages match, with a "clear filters" button
 *   - Each PageCard links to /studio/:id
 */

import { useState } from 'react';
import { coloringPages, CATEGORIES, DIFFICULTIES } from '../data/coloringPages';
import PageCard from '../components/PageCard';
import './Browse.css';

const Browse = () => {
  const [searchQuery,      setSearchQuery]      = useState('');
  const [categoryFilter,   setCategoryFilter]   = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // ── Filtering logic ──────────────────────────────────────────────────────────
  // All three filters are applied together. The result is computed directly
  // (no separate state needed – this is fast enough for a small list).
  const filteredPages = coloringPages.filter((page) => {
    const matchesCategory   = categoryFilter   === 'All' || page.category   === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || page.difficulty === difficultyFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      page.title.toLowerCase().includes(query) ||
      page.description.toLowerCase().includes(query) ||
      page.category.toLowerCase().includes(query);

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setDifficultyFilter('All');
  };

  const hasActiveFilter =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'All' ||
    difficultyFilter !== 'All';

  // ── Difficulty → CSS modifier map ─────────────────────────────────────────────
  const difficultyClass = (d) => {
    if (d === 'Easy')   return 'filter-btn--easy';
    if (d === 'Medium') return 'filter-btn--medium';
    if (d === 'Hard')   return 'filter-btn--hard';
    return '';
  };

  return (
    <div className="browse-page">

      {/* ── Header ── */}
      <h1 className="browse-title">Browse Coloring Pages</h1>
      <p className="browse-subtitle">Pick a page and start coloring!</p>

      {/* ── Search ── */}
      <input
        id="browse-search"
        type="search"
        className="browse-search"
        placeholder="Search by title or description…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search coloring pages"
      />

      {/* ── Filters ── */}
      <div className="browse-filters" role="group" aria-label="Filter coloring pages">

        {/* Category filter */}
        <div className="filter-group">
          <span className="filter-group-label">Category</span>
          <div className="filter-btn-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-btn${categoryFilter === cat ? ' filter-btn--active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
              >
                {cat}
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
                className={`filter-btn ${difficultyClass(diff)}${difficultyFilter === diff ? ' filter-btn--active' : ''}`}
                onClick={() => setDifficultyFilter(diff)}
                aria-pressed={difficultyFilter === diff}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="browse-results-count">
        {filteredPages.length === 0
          ? 'No pages found'
          : `${filteredPages.length} page${filteredPages.length !== 1 ? 's' : ''} found`}
      </p>

      {/* ── Grid or empty state ── */}
      {filteredPages.length > 0 ? (
        <div className="browse-grid">
          {filteredPages.map((page) => (
            <PageCard key={page.id} {...page} />
          ))}
        </div>
      ) : (
        <div className="browse-empty" role="status" aria-live="polite">
          <span className="browse-empty-icon">🎨</span>
          <p className="browse-empty-title">No coloring pages match your filters.</p>
          <p className="browse-empty-msg">Try adjusting the search or filters above.</p>
          {hasActiveFilter && (
            <button className="browse-clear-btn" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default Browse;
