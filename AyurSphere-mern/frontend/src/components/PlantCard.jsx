const PlantCard = ({ plant, isFavorite, onToggleFavorite }) => {
  const categoryClass = (plant.category || 'Herb').toLowerCase().replace(/\s+/g, '-');
  const uses = (plant.uses || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="plant-card card">
      <div className="plant-image">
        <img
          src={plant.imagePath || '/images/default-plant.svg'}
          alt={plant.plantName}
          onError={(e) => (e.currentTarget.src = '/images/default-plant.svg')}
        />
        <button className={`favorite-btn ${isFavorite ? 'active' : ''}`} onClick={() => onToggleFavorite(plant._id || plant.id)}>
          <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`} />
        </button>
        <span className={`plant-badge ${categoryClass}`}>{plant.category || 'Herb'}</span>
      </div>
      <div className="plant-info">
        <h3>{plant.plantName}</h3>
        <p className="scientific-name">{plant.scientificName}</p>
        <p className="plant-description">{plant.description || 'No description provided yet.'}</p>
        <div className="plant-uses">
          {uses.length ? (
            uses.map((u) => (
              <span key={u} className="use-chip">
                <i className="fas fa-leaf" /> {u}
              </span>
            ))
          ) : (
            <span className="muted-text">Uses not specified</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
