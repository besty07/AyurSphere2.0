import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantCard from '../components/PlantCard.jsx';
import AddPlantModal from '../components/AddPlantModal.jsx';
import CartPanel from '../components/CartPanel.jsx';
import VoiceAssistant from '../components/VoiceAssistant.jsx';
import { clearSession, request } from '../api/client.js';
import '../styles/dashboard.css';


const DashboardPage = ({ user, onUserChange }) => {
  const [plants, setPlants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSidebar, setActiveSidebar] = useState('browse');
  const [loading, setLoading] = useState(true);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [cart, setCart] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const plantOfTheDay = useMemo(() => {
    if (!plants || plants.length === 0) return null;
    const index = new Date().getDate() % plants.length;
    return plants[index];
  }, [plants]);

  const handlePlantOfTheDayClick = () => {
    if (!plantOfTheDay) return;
    const plantId = plantOfTheDay._id || plantOfTheDay.id;
    if (!plantId) return;
    navigate(`/plant/${plantId}`);
  };

  const isProfileComplete = Boolean(user?.mobile && user?.email && user?.address);

  const isFavorite = (plantId) => favorites.some((fav) => (fav._id || fav.id) === plantId);
  const cartCount = cart?.items?.filter(i => i.product).length || 0;

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

  const fetchCart = useCallback(async () => {
    try {
      const data = await request('/cart');
      setCart(data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchPlants(), fetchFavorites(), fetchCart()]);
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

  const handleCartUpdate = async (productId, quantity) => {
    try {
      const data = await request('/cart/update', {
        method: 'PATCH',
        body: { productId, quantity },
      });
      setCart(data);
    } catch (err) {
      console.error('Cart update error', err);
    }
  };

  const handleCartRemove = async (productId) => {
    try {
      const data = await request(`/cart/remove/${productId}`, { method: 'DELETE' });
      setCart(data);
    } catch (err) {
      console.error('Cart remove error', err);
    }
  };

  const handleCartOpen = async () => {
    await fetchCart();
    setCartOpen(true);
  };

  const handleCheckout = () => {
    navigate('/checkout');
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

        .section-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .plant-of-day-card {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 6px 10px;
          border-radius: 8px;
          background: #eef9ee;
          border: 1px solid #cbe4cc;
          font-size: 0.95rem;
          line-height: 1.3;
          color: #1a4b26;
          cursor: pointer;
          transition: background-color 0.12s ease, transform 0.12s ease;
          max-height: 34px;
          height: min-content;
          margin-bottom: 0.5rem;
        }

        .plant-of-day-card:hover {
          background-color: #dff3dd;
          text-decoration: underline;
          transform: translateY(-1px);
        }

        .plant-of-day-card .pod-title {
          font-weight: 600;
          margin-right: 4px;
        }

        .plant-of-day-card .pod-plant-name {
          font-weight: 700;
        }

        .plant-of-day-card .pod-scientific {
          font-style: italic;
          color: #3f6e53;
        }

        /* remove old image rules */
        .plant-of-day-card img {
          display: none;
        }

        .pod-label {
          font-weight: 700;
          margin-bottom: 8px;
          color: #1d6b2b;
          width: 100%;
          text-align: left;
        }

        .pod-text h4 {
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.3;
        }

        .pod-text p {
          margin: 4px 0 0;
          color: #3c3c3c;
          font-style: italic;
        }

        .pod-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 16px;
        }

        .pod-modal {
          max-width: 400px;
          width: 100%;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
          padding: 18px;
          position: relative;
          text-align: center;
        }

        .pod-modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: transparent;
          color: #777;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .pod-modal img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .pod-modal h3 {
          margin: 0 0 8px;
        }

        .pod-modal-scientific {
          margin: 4px 0 12px;
          font-weight: 600;
          color: #3d6d4a;
        }

        .pod-modal-action {
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          background: #2c7d34;
          color: #fff;
          cursor: pointer;
          margin-top: 10px;
        }

        @media (max-width: 760px) {
          .modal-card {
            grid-template-columns: 1fr !important;
            max-width: 100% !important;
          }

          .modal-image-wrapper {
            max-height: 260px !important;
          }

          .section-top {
            flex-direction: column;
            align-items: stretch;
          }

          .plant-of-day-card {
            width: 100%;
          }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
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

          <button className="header-icon-btn" onClick={handleCartOpen} title="Shopping Cart">
            <i className="fas fa-shopping-cart" />
            {cartCount > 0 && (
              <span className="header-badge header-badge--red">{cartCount}</span>
            )}
          </button>

          <span className="header-username" onClick={() => navigate('/profile')} style={{cursor: 'pointer'}} title="Go to Profile">{user?.username}</span>
          <button className="header-logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {!isProfileComplete && (
        <div className="profile-warning-banner" onClick={() => navigate('/profile')}>
          <i className="fas fa-exclamation-triangle" /> 
          <span>Your profile is incomplete! Adding your Email, Mobile, and Address unlocks seamless Checkout.</span>
          <span className="pwd-link">Complete Now <i className="fas fa-arrow-right"/></span>
        </div>
      )}

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
              <button className="hero-add-btn" onClick={() => setShowAddPlant(true)}>
                <i className="fas fa-plus" /> Add New Plant
              </button>
            </div>
          </section>

          <div className="section-top">
            <div className="section-heading">
              <h3>Featured Medicinal Plants</h3>
              <p>Discover these powerful healing plants from ancient Ayurvedic traditions</p>
            </div>

            {activeSidebar === 'browse' && plantOfTheDay && (
              <button
                className="plant-of-day-card"
                onClick={handlePlantOfTheDayClick}
                type="button"
              >
                <span className="pod-title">🌿 Plant of the Day:</span>
                <span className="pod-plant-name">{plantOfTheDay.plantName}</span>
                <span className="pod-scientific">({plantOfTheDay.scientificName || 'Unknown'})</span>
              </button>
            )}
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

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={showAddPlant}
        onClose={() => setShowAddPlant(false)}
        onPlantAdded={() => fetchPlants()}
      />

      {/* Cart Panel */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdate={handleCartUpdate}
        onRemove={handleCartRemove}
        onCheckout={handleCheckout}
      />

      {/* Voice Assistant Widget */}
      <VoiceAssistant />
    </div>
  );
};

export default DashboardPage;
