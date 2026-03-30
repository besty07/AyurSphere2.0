import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard.jsx';
import { clearSession, request } from '../api/client.js';
import '../styles/dashboard.css';

const sidebarCategories = [
  { id: 'roots', label: 'Roots & Rhizomes', icon: 'fas fa-seedling', category: 'Root' },
  { id: 'leaves', label: 'Leaves & Herbs', icon: 'fas fa-leaf', category: 'Herb' },
  { id: 'flowers', label: 'Flowers & Buds', icon: 'fas fa-spa', category: 'Flower' },
  { id: 'seeds', label: 'Seeds & Fruits', icon: 'fas fa-apple-alt', category: 'Seed' },
  { id: 'bark', label: 'Bark & Wood', icon: 'fas fa-tree', category: 'Tree' },
];

const DashboardPage = ({ user, onUserChange }) => {
  const [plants, setPlants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSidebar, setActiveSidebar] = useState('browse');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isFavorite = (plantId) => favorites.some((fav) => (fav._id || fav.id) === plantId);

  const fetchPlants = async (opts = {}) => {
    const params = new URLSearchParams();
    if (opts.search) params.append('search', opts.search);
    if (opts.category) params.append('category', opts.category);
    const query = params.toString();
    const data = await request(`/plants${query ? `?${query}` : ''}`);
    setPlants(data);
  };

  const fetchFavorites = async () => {
    const data = await request('/favorites');
    setFavorites(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchPlants(), fetchFavorites()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    await fetchPlants({ search: value, category: activeCategory });
  };

  const handleCategoryClick = async (cat) => {
    setActiveSidebar(cat.id);
    setActiveCategory(cat.category);
    setSearchTerm('');
    await fetchPlants({ category: cat.category });
  };

  const handleBrowseAll = async () => {
    setActiveSidebar('browse');
    setActiveCategory(null);
    setSearchTerm('');
    await fetchPlants();
  };

  const toggleFavorite = async (plantId) => {
    try {
      if (isFavorite(plantId)) {
        await request(`/favorites/${plantId}`, { method: 'DELETE' });
      } else {
        await request('/favorites', { method: 'POST', body: { plantId } });
      }
      await fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    clearSession();
    onUserChange(null);
  };

  const filteredPlants = useMemo(() => plants, [plants]);

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
            placeholder="Search plants, properties, or categories..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button className="header-icon-btn" onClick={() => navigate('/favorites')}>
            <i className="fas fa-heart" />
            {favorites.length > 0 && (
              <span className="header-badge header-badge--red">{favorites.length}</span>
            )}
          </button>

          <button className="header-icon-btn">
            <i className="fas fa-shopping-cart" />
            <span className="header-badge header-badge--red">1</span>
          </button>

          <span className="header-username">{user?.username}</span>
          <button className="header-logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="main-layout">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-label">MY LIBRARY</p>
            <ul className="sidebar-list">
              <li
                className={`sidebar-item ${activeSidebar === 'browse' ? 'sidebar-item--active' : ''}`}
                onClick={handleBrowseAll}
              >
                <i className="fas fa-leaf" />
                <span>Browse All Plants</span>
              </li>
              <li
                className={`sidebar-item ${activeSidebar === 'favorites' ? 'sidebar-item--active' : ''}`}
                onClick={() => { setActiveSidebar('favorites'); navigate('/favorites'); }}
              >
                <i className="far fa-heart" />
                <span>My Favorites</span>
              </li>
              <li
                className={`sidebar-item ${activeSidebar === 'garden' ? 'sidebar-item--active' : ''}`}
                onClick={() => setActiveSidebar('garden')}
              >
                <i className="fas fa-map-marker-alt" />
                <span>Virtual Garden</span>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">CATEGORIES</p>
            <ul className="sidebar-list">
              {sidebarCategories.map((cat) => (
                <li
                  key={cat.id}
                  className={`sidebar-item ${activeSidebar === cat.id ? 'sidebar-item--active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <i className={cat.icon} />
                  <span>{cat.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <main className="content">
          {/* Hero */}
          <section className="hero">
            <div className="hero-overlay" />
            <div className="hero-body">
              <div>
                <h2 className="hero-title">
                  Welcome back, <span className="hero-username">{user?.username || 'explorer'}!</span>
                </h2>
                <p className="hero-subtitle">Continue exploring the ancient wisdom of Ayurvedic medicine</p>
              </div>
              <button className="hero-add-btn">
                <i className="fas fa-plus" /> Add New Plant
              </button>
            </div>
          </section>

          {/* Section heading */}
          <div className="section-heading">
            <h3>Featured Medicinal Plants</h3>
            <p>Discover these powerful healing plants from ancient Ayurvedic traditions</p>
          </div>

          {/* Plants grid */}
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin" />
              <span>Loading plants...</span>
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-seedling" />
              <p>No plants found. Try another search or category.</p>
            </div>
          ) : (
            <div className="plants-grid">
              {filteredPlants.map((plant) => (
                <PlantCard
                  key={plant._id || plant.id}
                  plant={plant}
                  isFavorite={isFavorite(plant._id || plant.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
