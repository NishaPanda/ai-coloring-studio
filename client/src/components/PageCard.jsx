/**
 * PageCard.jsx – Phase 5: Coloring page card component.
 *
 * Props:
 *   id          – page id, used to build the /studio/:id link
 *   title       – page title
 *   category    – category string (Animals, Nature, Space, Fantasy)
 *   difficulty  – 'Easy' | 'Medium' | 'Hard'
 *   description – short description text
 *   svgFile     – path to the static SVG served from /public
 *                 (used as the thumbnail image)
 */

import { Link } from 'react-router-dom';
import './PageCard.css';

/** Map difficulty to a CSS modifier class for colour coding. */
const difficultyClass = (difficulty) => {
  if (difficulty === 'Easy')   return 'badge--easy';
  if (difficulty === 'Medium') return 'badge--medium';
  if (difficulty === 'Hard')   return 'badge--hard';
  return '';
};

const PageCard = ({ id, title, category, difficulty, description, svgFile }) => {
  return (
    <div className="page-card">

      {/* ── Thumbnail ── */}
      <div className="card-image-container">
        <img
          src={svgFile}
          alt={`${title} coloring page preview`}
          className="card-image"
          draggable="false"
        />
      </div>

      {/* ── Content ── */}
      <div className="card-content">

        {/* Meta row: category + difficulty badge */}
        <div className="card-meta">
          <span className="card-category">{category}</span>
          <span className={`card-difficulty-badge ${difficultyClass(difficulty)}`}>
            {difficulty}
          </span>
        </div>

        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>

        <Link to={`/studio/${id}`} className="card-btn" aria-label={`Color ${title}`}>
          Color Now
        </Link>

      </div>
    </div>
  );
};

export default PageCard;
