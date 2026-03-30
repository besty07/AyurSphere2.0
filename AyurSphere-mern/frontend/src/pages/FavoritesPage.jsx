import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard.jsx';
import { clearSession, request } from '../api/client.js';
import '../styles/dashboard.css';

const FavoritesPage = ({ user, onUserChange }) => {
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
    <div className="dashboard-root">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-logo">
          <img src="/images/logo-final.png" alt="AyurSphere" />
          <span className="header-brand">AyurSphere</span>
        </div>

        <div className="search-bar">
          <i className="fas fa-search search-icon" />
          <input
            placeholder="Search in favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button className="header-icon-btn" onClick={() => navigate('/')}>
            <i className="fas fa-spa" />
          </button>
          <button className="header-icon-btn" onClick={() => navigate('/favorites')}>
            <i className="fas fa-heart" />
            {favorites.length > 0 && (
              <span className="header-badge header-badge--red">{favorites.length}</span>
            )}
          </button>
          <button className="header-icon-btn">
            <i className="fas fa-shopping-cart" />
          </button>
          <span className="header-username">{user?.username}</span>
          <button className="header-logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="content" style={{ padding: '1.4rem' }}>
        <div className="favorites-header">
          <h2><i className="fas fa-heart" /> My Favorite Plants</h2>
          <p>Your curated list of medicinal plants</p>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <i className="fas fa-heart-broken" />
            <h3>No favorites yet</h3>
            <p>Start adding plants by tapping the heart icon on any plant card.</p>
            <Link to="/" className="browse-btn">
              <i className="fas fa-leaf" /> Browse Plants
            </Link>
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
