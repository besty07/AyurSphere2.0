import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard.jsx';
import { clearSession, request } from '../api/client.js';
import '../styles/dashboard.css';


const DashboardPage = ({ user, onUserChange }) => {
  const [plants, setPlants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSidebar, setActiveSidebar] = useState('browse');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isFavorite = (plantId) => favorites.some((fav) => (fav._id || fav.id) === plantId);

  const fetchPlants = async () => {
    const data = await request('/plants');
    const filtered = data.filter((plant) => {
      const name = (plant.plantName || plant.name || '').trim().toLowerCase();
      return name !== 'hhhhhh';
    });
    setPlants(filtered);
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

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleCategoryClick = (categoryValue) => {
    setActiveSidebar(categoryValue);
    setActiveCategory(categoryValue);
    setSearchTerm('');
  };

  const handleBrowseAll = () => {
    setActiveSidebar('browse');
    setActiveCategory(null);
    setSearchTerm('');
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

  const categoryOptions = useMemo(() => {
    const categories = plants
      .map((p) => (p.category || '').trim())
      .filter(Boolean);

    const uniqueCategories = Array.from(new Set(categories));
    return uniqueCategories.slice(0, 10); // limit to max 10 categories
  }, [plants]);

  const filteredPlants = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();

    return plants.filter((plant) => {
      const plantCategory = (plant.category || '').trim().toLowerCase();
      const active = (activeCategory || '').trim().toLowerCase();
      const categoryMatch = !active || plantCategory === active;
      if (!categoryMatch) return false;

      if (!lowerSearch) return true;

      const searchTarget = [
        plant.plantName,
        plant.scientificName,
        plant.description,
        plant.uses,
        plant.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchTarget.includes(lowerSearch);
    });
  }, [plants, activeCategory, searchTerm]);



  return (
    <div className="dashboard-root">
      <style>{`
        @keyframes modal-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modal-scale {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 760px) {
          .modal-card {
            grid-template-columns: 1fr !important;
            max-width: 100% !important;
          }

          .modal-image-wrapper {
            max-height: 260px !important;
          }
        }
      `}</style>

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
              {categoryOptions.map((categoryName) => (
                <li
                  key={categoryName}
                  className={`sidebar-item ${activeSidebar === categoryName ? 'sidebar-item--active' : ''}`}
                  onClick={() => handleCategoryClick(categoryName)}
                >
                  <i className="fas fa-leaf" />
                  <span>{categoryName}</span>
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
