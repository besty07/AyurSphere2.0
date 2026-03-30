import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../components/PlantCard.jsx';
import { clearSession, request } from '../api/client.js';
import '../styles/dashboard.css';

const categories = ['all', 'Immunity', 'Digestive', 'Respiratory', 'Brain Tonic', 'Anti-inflammatory', 'Skin Care', 'Adaptogen'];

const DashboardPage = ({ user, onUserChange }) => {
  const [plants, setPlants] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const isFavorite = (plantId) => favorites.some((fav) => (fav._id || fav.id) === plantId);

  const fetchPlants = async (opts = {}) => {
    const params = new URLSearchParams();
    if (opts.search) params.append('search', opts.search);
    if (opts.category && opts.category !== 'all') params.append('category', opts.category);
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
    await fetchPlants({ search: value, category });
  };

  const handleCategory = async (cat) => {
    setCategory(cat);
    setSearchTerm('');
    await fetchPlants({ category: cat });
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
    <div>
      <header className="app-header">
        <div className="logo">
          <img src="/images/logo-final.png" alt="AyurSphere" />
          <div>
            <div style={{ fontWeight: 800 }}>AyurSphere</div>
            <small style={{ color: 'rgba(255,255,255,0.8)' }}>Virtual herbal garden</small>
          </div>
        </div>

        <div className="search-bar">
          <i className="fas fa-search" />
          <input
            placeholder="Search plants, properties, or categories..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="actions">
          <Link to="/favorites" className="secondary">
            <i className="fas fa-heart" /> Favorites ({favorites.length})
          </Link>
          <div className="user">
            <i className="fas fa-user-circle" /> {user?.username}
          </div>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-item ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategory(cat)}
              >
                <i className="fas fa-spa" /> {cat === 'all' ? 'All Plants' : cat}
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          <section className="hero">
            <div>
              <h2>Welcome back, {user?.username || 'explorer'}!</h2>
              <p>Continue exploring ancient Ayurvedic wisdom.</p>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                <span className="badge-soft"><i className="fas fa-heart" /> {favorites.length} favorites</span>
                <span className="badge-soft"><i className="fas fa-seedling" /> {plants.length} plants</span>
              </div>
            </div>
            <div className="secondary">Curate and save your medicinal garden</div>
          </section>

          {loading ? (
            <div className="card" style={{ padding: '1.2rem' }}>Loading plants...</div>
          ) : (
            <section>
              <div className="plants-grid">
                {filteredPlants.length === 0 ? (
                  <div className="card" style={{ padding: '1.2rem' }}>No plants found. Try another search or category.</div>
                ) : (
                  filteredPlants.map((plant) => (
                    <PlantCard
                      key={plant._id || plant.id}
                      plant={plant}
                      isFavorite={isFavorite(plant._id || plant.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
