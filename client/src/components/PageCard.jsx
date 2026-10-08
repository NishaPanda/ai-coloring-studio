import { Link } from 'react-router-dom';
import './PageCard.css';

const PageCard = ({ id, title, category, imageUrl }) => {
  return (
    <div className="page-card">
      <div className="card-image-container">
        {/* Placeholder image if none provided */}
        <img 
          src={imageUrl || 'https://via.placeholder.com/250x200?text=Coloring+Page'} 
          alt={title} 
          className="card-image"
        />
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <span className="card-category">{category}</span>
        <Link to={`/studio/${id}`} className="card-btn">Color Now</Link>
      </div>
    </div>
  );
};

export default PageCard;
