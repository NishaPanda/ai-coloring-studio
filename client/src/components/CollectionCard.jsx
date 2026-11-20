/**
 * CollectionCard.jsx – Curated collection card for "Explore Worlds" on the Browse page.
 */

import './CollectionCard.css';

const CollectionCard = ({ collection, isActive, onSelect, availableCount = 0 }) => {
  const totalCount = collection.artworkIds ? collection.artworkIds.length : 0;

  return (
    <div
      className={`collection-card${isActive ? ' collection-card--active' : ''}`}
      style={{ '--card-accent': collection.accentColor }}
    >
      {/* ── Card Header Banner ── */}
      <div className="collection-card-banner" style={{ background: collection.gradient }}>
        <span className="collection-card-icon" aria-hidden="true">{collection.icon}</span>
        <div className="collection-card-badges">
          <span className="collection-card-badge">
            {totalCount} {totalCount === 1 ? 'Canvas' : 'Canvases'}
          </span>
          {isActive && (
            <span className="collection-card-active-pill">Active</span>
          )}
        </div>
      </div>

      {/* ── Content Body ── */}
      <div className="collection-card-body">
        <div className="collection-card-heading-group">
          <h3 className="collection-card-title">{collection.name}</h3>
          <p className="collection-card-subtitle">{collection.subtitle}</p>
        </div>

        <p className="collection-card-description">{collection.description}</p>

        {/* ── Footer / CTA ── */}
        <div className="collection-card-footer">
          <button
            type="button"
            className="collection-card-btn"
            onClick={() => onSelect(collection.id)}
            aria-label={`Explore ${collection.name}`}
          >
            <span>{isActive ? 'Viewing World' : 'Explore World'}</span>
            <span className="collection-card-btn-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
