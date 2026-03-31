import { Link } from 'react-router-dom';

const categoryColors = {
  root:   { bg: '#8B5E3C', text: '#fff', label: 'ROOT' },
  herb:   { bg: '#2d6a1f', text: '#fff', label: 'HERB' },
  tree:   { bg: '#1a5c5c', text: '#fff', label: 'TREE' },
  flower: { bg: '#8b1a5c', text: '#fff', label: 'FLOWER' },
  seed:   { bg: '#7c5e1a', text: '#fff', label: 'SEED' },
  leaf:   { bg: '#2d6a1f', text: '#fff', label: 'LEAF' },
};

const getCategoryStyle = (category = '') => {
  const key = category.toLowerCase().split(/[\s/&]/)[0];
  return categoryColors[key] || { bg: '#3e6c23', text: '#fff', label: (category || 'Herb').toUpperCase() };
};

const PlantCard = ({ plant, isFavorite, onToggleFavorite }) => {
  const uses = (plant.uses || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 4);

  const catStyle = getCategoryStyle(plant.category);
  const plantId = plant._id || plant.id;

  return (
    <Link to={`/plant/${plantId}`} className="plant-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="plant-card">
        <div className="plant-image">
          <img
            src={plant.imagePath || '/images/default-plant.svg'}
            alt={plant.plantName}
            onError={(e) => (e.currentTarget.src = '/images/default-plant.svg')}
          />

          {/* Favorite button */}
          <button
            className={`favorite-btn ${isFavorite ? 'favorite-btn--active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(plantId);
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`} />
          </button>

          {/* Category badge */}
          <span
            className="plant-badge"
            style={{ background: catStyle.bg, color: catStyle.text }}
          >
            {catStyle.label}
          </span>
        </div>

        <div className="plant-info">
          <h3 className="plant-name">{plant.plantName}</h3>
          <p className="scientific-name">{plant.scientificName}</p>
          <div className="plant-uses">
            {uses.length ? (
              uses.map((u) => (
                <span key={u} className="use-chip">{u}</span>
              ))
            ) : (
              <span className="muted-text">Uses not specified</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;

