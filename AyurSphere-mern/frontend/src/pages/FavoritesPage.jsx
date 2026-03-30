import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../components/PlantCard.jsx';
import { clearSession, request } from '../api/client.js';
import '../styles/dashboard.css';
import '../styles/favorites.css';

const FavoritesPage = ({ user, onUserChange }) => {
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFavorites = async () => {
    const data = await request('/favorites');
    setFavorites(data);
  };

  useEffect(() => {
    fetchFavorites().catch(console.error);
  }, []);

  const filtered = favorites.filter((p) =>
    p.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = async (plantId) => {
    await request(`/favorites/${plantId}`, { method: 'DELETE' });
    await fetchFavorites();
  };

  const logout = () => {
    clearSession();
    onUserChange(null);
  };

  return (
    <div>
      <header className="app-header">
        <div className="logo">
          <img src="/images/logo-final.png" alt="AyurSphere" />
          <div>
            <div style={{ fontWeight: 800 }}>AyurSphere</div>
            <small style={{ color: 'rgba(255,255,255,0.8)' }}>My favorites</small>
          </div>
        </div>
        <div className="search-bar">
          <i className="fas fa-search" />
          <input
            placeholder="Search in favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="actions">
          <Link to="/" className="secondary">
            <i className="fas fa-spa" /> Browse plants
          </Link>
          <div className="user"><i className="fas fa-user-circle" /> {user?.username}</div>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="content">
        <div className="favorites-header">
          <div>
            <h2><i className="fas fa-heart" /> My Favorite Plants</h2>
            <p>Your curated list of medicinal plants</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <i className="fas fa-heart-broken" />
            <h3>No favorites yet</h3>
            <p>Start adding plants by tapping the heart icon.</p>
            <Link to="/" className="browse-btn"><i className="fas fa-spa" /> Browse plants</Link>
          </div>
        ) : (
          <div className="plants-grid">
            {filtered.map((plant) => (
              <PlantCard
                key={plant._id || plant.id}
                plant={plant}
                isFavorite
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
