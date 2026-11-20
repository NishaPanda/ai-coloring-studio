/**
 * PageCard.jsx – Coloring page card component with collection badge (Lavender Edition).
 *
 * Props:
 *   id             – page id, used to build the /studio/:id link
 *   title          – page title
 *   category       – category string (Animals, Nature, Space, Fantasy)
 *   difficulty     – 'Easy' | 'Medium' | 'Hard'
 *   description    – short description text
 *   svgFile        – path to the static SVG served from /public
 *   collectionName – name of the parent collection (e.g. 'Classic Studio')
 */

import { Link } from 'react-router-dom';
import { getCollectionByArtworkId } from '../data/collections';
import './PageCard.css';

const difficultyClass = (difficulty) => {
  if (difficulty === 'Easy')   return 'badge--easy';
  if (difficulty === 'Medium') return 'badge--medium';
  if (difficulty === 'Hard')   return 'badge--hard';
  return '';
};

const PageCard = ({ id, title, category, difficulty, description, svgFile, collectionName }) => {
  const resolvedCollection = collectionName || getCollectionByArtworkId(id)?.name || 'Classic Studio';

  return (
    <div className="page-card">

      {/* ── Thumbnail Frame ── */}
      <div className="card-image-container">
        <img
          src={svgFile}
          alt={`${title} coloring page preview`}
          className="card-image"
          draggable="false"
        />
        <div className="card-image-glow" aria-hidden="true" />
      </div>

      {/* ── Content Body ── */}
      <div className="card-content">

        {/* Meta row: collection badge + category + difficulty badge */}
        <div className="card-meta">
          <span className="card-collection-badge">
            {resolvedCollection}
          </span>
          <div className="card-meta-right">
            <span className="card-category">{category}</span>
            <span className={`card-difficulty-badge ${difficultyClass(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>

        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>

        <Link to={`/studio/${id}`} className="card-btn" aria-label={`Color ${title}`}>
          <span>Color Now</span>
          <span className="card-btn-arrow">→</span>
        </Link>

      </div>
    </div>
  );
};

export default PageCard;
