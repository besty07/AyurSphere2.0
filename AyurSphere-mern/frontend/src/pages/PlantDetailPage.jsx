import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../api/client.js';
import '../styles/plantDetail.css';

/* ── Helpers ─────────────────────────────── */
const categoryMeta = {
  root:       { icon: 'fas fa-seedling',      color: '#8B5E3C', label: 'Root' },
  herb:       { icon: 'fas fa-leaf',          color: '#2d6a1f', label: 'Herb' },
  tree:       { icon: 'fas fa-tree',          color: '#1a5c5c', label: 'Tree' },
  flower:     { icon: 'fas fa-spa',           color: '#8b1a5c', label: 'Flower' },
  seed:       { icon: 'fas fa-apple-alt',     color: '#7c5e1a', label: 'Seed' },
  leaf:       { icon: 'fas fa-leaf',          color: '#2d6a1f', label: 'Leaf' },
  medicinal:  { icon: 'fas fa-mortar-pestle', color: '#2d7318', label: 'Medicinal' },
  digestive:  { icon: 'fas fa-stomach',       color: '#558b2f', label: 'Digestive' },
  adaptogen:  { icon: 'fas fa-yin-yang',      color: '#6d4c41', label: 'Adaptogen' },
  purifier:   { icon: 'fas fa-filter',        color: '#00695c', label: 'Purifier' },
  immunity:   { icon: 'fas fa-shield-alt',    color: '#1565c0', label: 'Immunity' },
  respiratory:{ icon: 'fas fa-lungs',         color: '#00838f', label: 'Respiratory' },
  cardiac:    { icon: 'fas fa-heartbeat',     color: '#c62828', label: 'Cardiac' },
  cooling:    { icon: 'fas fa-snowflake',     color: '#0277bd', label: 'Cooling' },
  energy:     { icon: 'fas fa-bolt',          color: '#e65100', label: 'Energy' },
};

const getCatMeta = (cat = '') => {
  const key = cat.toLowerCase().split(/[\s/&]/)[0];
  return categoryMeta[key] || { icon: 'fas fa-leaf', color: '#3e6c23', label: cat || 'Herb' };
};

const normalizeImagePath = (path) => {
  if (!path) return '/images/default-plant.svg';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
};

/* ── Component ───────────────────────────── */
const PlantDetailPage = ({ user, onUserChange }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [productQty, setProductQty] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const data = await request(`/plants/${id}`);
        setPlant(data);
        try {
          const favs = await request('/favorites');
          const favIds = favs.map(f => f._id || f.id);
          setIsFavorite(favIds.includes(data._id || data.id));
        } catch (_) {}
        try {
          const prods = await request(`/products?plantId=${data._id || data.id}`);
          setProducts(prods);
          const initQty = {};
          prods.forEach(p => { initQty[p._id] = 1; });
          setProductQty(initQty);
        } catch (_) {}
      } catch (err) {
        setError(err.message || 'Failed to load plant');
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
    window.scrollTo(0, 0);
  }, [id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const toggleFavorite = async () => {
    if (!plant) return;
    const plantId = plant._id || plant.id;
    try {
      if (isFavorite) {
        await request(`/favorites/${plantId}`, { method: 'DELETE' });
      } else {
        await request('/favorites', { method: 'POST', body: { plantId } });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Fav toggle error', err);
    }
  };

  const handleAddToCart = async (productId) => {
    const qty = productQty[productId] || 1;
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await request('/cart/add', { method: 'POST', body: { productId, quantity: qty } });
      showToast('Added to cart!');
    } catch (err) {
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const changeQty = (productId, delta) => {
    setProductQty(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleShare = async () => {
    const shareData = {
      title: `AyurSphere: ${plant.plantName}`,
      text: `Check out this medicinal plant on AyurSphere: ${plant.plantName} (${plant.scientificName}). ${plant.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  if (loading) {
    return (
      <div className="pd-root">
        <div className="pd-loading">
          <div className="pd-spinner" />
          <p>Loading plant details...</p>
        </div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="pd-root">
        <div className="pd-error">
          <i className="fas fa-exclamation-circle" />
          <h3>Plant Not Found</h3>
          <p>{error || 'The plant you are looking for does not exist.'}</p>
          <button className="pd-back-btn" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-left" /> Back to Plants
          </button>
        </div>
      </div>
    );
  }

  /* ── All data comes from the API now ── */
  const catMeta = getCatMeta(plant.category);
  const uses = (plant.uses || '').split(',').map(u => u.trim()).filter(Boolean);
  const overview = plant.overview || [];
  const diseases = plant.diseases || [];
  const partsUsed = plant.partsUsed || [];
  const usageMethods = plant.usageMethods || [];
  const ayurvedicProfile = plant.ayurvedicProfile || {};

  const tabs = [
    { id: 'overview',   label: 'Overview',      icon: 'fas fa-info-circle' },
    { id: 'properties', label: 'Properties',     icon: 'fas fa-flask' },
    { id: 'usage',      label: 'How to Use',     icon: 'fas fa-hand-holding-medical' },
    { id: 'products',   label: 'Buy Products',   icon: 'fas fa-shopping-bag' },
  ];

  return (
    <div className="pd-root">
      {/* ── TOP NAV BAR ── */}
      <nav className="pd-topbar">
        <button className="pd-back-btn" onClick={() => navigate('/dashboard')}>
          <i className="fas fa-arrow-left" />
          <span>Back to Plants</span>
        </button>
        <div className="pd-topbar-right">
          <button
            className={`pd-fav-btn ${isFavorite ? 'pd-fav-btn--active' : ''}`}
            onClick={toggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`} />
          </button>
          <button className="pd-share-btn" title="Share" onClick={handleShare}>
            <i className="fas fa-share-alt" />
          </button>
        </div>
      </nav>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`pd-toast ${toast.type === 'error' ? 'pd-toast--error' : 'pd-toast--success'}`}>
          <i className={toast.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'} />
          {toast.msg}
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section className="pd-hero">
        <div className="pd-hero-bg">
          <div className="pd-hero-gradient" />
          <div className="pd-hero-pattern" />
        </div>

        <div className="pd-hero-content">
          <div className="pd-hero-image-wrap">
            <div className={`pd-hero-image ${imgLoaded ? 'pd-hero-image--loaded' : ''}`}>
              <img
                src={normalizeImagePath(plant.imagePath)}
                alt={plant.plantName}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => (e.currentTarget.src = '/images/default-plant.svg')}
              />
            </div>
            <span className="pd-category-badge" style={{ background: catMeta.color }}>
              <i className={catMeta.icon} /> {catMeta.label}
            </span>
          </div>

          <div className="pd-hero-info">
            <h1 className="pd-plant-name">{plant.plantName}</h1>
            <p className="pd-scientific-name">
              <i className="fas fa-dna" /> {plant.scientificName}
              {plant.aka && <span className="pd-aka"> — {plant.aka}</span>}
            </p>
            <div className="pd-uses-tags">
              {uses.map((u) => (
                <span key={u} className="pd-use-tag">{u}</span>
              ))}
            </div>
            {plant.description && (
              <div className="pd-desc-quote">
                <div className="pd-desc-accent" />
                <p>{plant.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── TAB NAVIGATION ── */}
      <div className="pd-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pd-tab ${activeTab === tab.id ? 'pd-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="pd-content">

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === 'overview' && (
          <div className="pd-tab-panel pd-animate-in">
            <div className="pd-card pd-card--full">
              <div className="pd-card-header">
                <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #2d7318, #4a7c2c)' }}>
                  <i className="fas fa-book-open" />
                </div>
                <h3>About {plant.plantName}</h3>
              </div>
              <div className="pd-card-body">
                <div className="pd-overview-points">
                  {overview.map((point, i) => (
                    <div key={i} className="pd-overview-point">
                      <div className="pd-overview-bullet">
                        <i className="fas fa-check-circle" />
                      </div>
                      <p>{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pd-info-grid">
              <div className="pd-stat-card">
                <div className="pd-stat-icon" style={{ background: 'rgba(45, 115, 24, 0.1)', color: '#2d7318' }}>
                  <i className="fas fa-leaf" />
                </div>
                <div className="pd-stat-content">
                  <span className="pd-stat-label">Category</span>
                  <span className="pd-stat-value">{plant.category || 'Herb'}</span>
                </div>
              </div>
              <div className="pd-stat-card">
                <div className="pd-stat-icon" style={{ background: 'rgba(139, 30, 92, 0.1)', color: '#8b1a5c' }}>
                  <i className="fas fa-heartbeat" />
                </div>
                <div className="pd-stat-content">
                  <span className="pd-stat-label">Medicinal Uses</span>
                  <span className="pd-stat-value">{uses.length} known</span>
                </div>
              </div>
              <div className="pd-stat-card">
                <div className="pd-stat-icon" style={{ background: 'rgba(26, 92, 92, 0.1)', color: '#1a5c5c' }}>
                  <i className="fas fa-globe-asia" />
                </div>
                <div className="pd-stat-content">
                  <span className="pd-stat-label">Origin</span>
                  <span className="pd-stat-value">South Asia</span>
                </div>
              </div>
              <div className="pd-stat-card">
                <div className="pd-stat-icon" style={{ background: 'rgba(124, 94, 26, 0.1)', color: '#7c5e1a' }}>
                  <i className="fas fa-history" />
                </div>
                <div className="pd-stat-content">
                  <span className="pd-stat-label">Tradition</span>
                  <span className="pd-stat-value">Ayurveda</span>
                </div>
              </div>
            </div>

            {ayurvedicProfile.rasa && (
              <div className="pd-card pd-card--full">
                <div className="pd-card-header">
                  <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #8B5E3C, #a67c52)' }}>
                    <i className="fas fa-om" />
                  </div>
                  <h3>Ayurvedic Profile</h3>
                </div>
                <div className="pd-card-body">
                  <div className="pd-ayur-grid pd-ayur-grid--four">
                    <div className="pd-ayur-item">
                      <span className="pd-ayur-label">Rasa (Taste)</span>
                      <span className="pd-ayur-value">{ayurvedicProfile.rasa}</span>
                    </div>
                    <div className="pd-ayur-item">
                      <span className="pd-ayur-label">Virya (Potency)</span>
                      <span className="pd-ayur-value">{ayurvedicProfile.virya}</span>
                    </div>
                    <div className="pd-ayur-item">
                      <span className="pd-ayur-label">Vipaka (Post-digestive)</span>
                      <span className="pd-ayur-value">{ayurvedicProfile.vipaka}</span>
                    </div>
                    <div className="pd-ayur-item">
                      <span className="pd-ayur-label">Dosha Effect</span>
                      <span className="pd-ayur-value">{ayurvedicProfile.dosha}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ PROPERTIES TAB ═══════════ */}
        {activeTab === 'properties' && (
          <div className="pd-tab-panel pd-animate-in">
            <div className="pd-two-col">
              <div className="pd-card">
                <div className="pd-card-header">
                  <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #1a5c5c, #2d8a8a)' }}>
                    <i className="fas fa-star-of-life" />
                  </div>
                  <h3>Therapeutic Uses</h3>
                </div>
                <div className="pd-card-body">
                  <ul className="pd-property-list">
                    {uses.map((use, i) => (
                      <li key={i} className="pd-property-item">
                        <span className="pd-property-bullet" style={{ background: '#2d7318' }} />
                        <span>{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pd-card">
                <div className="pd-card-header">
                  <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #c62828, #ef5350)' }}>
                    <i className="fas fa-notes-medical" />
                  </div>
                  <h3>Diseases & Conditions</h3>
                </div>
                <div className="pd-card-body">
                  <div className="pd-disease-grid">
                    {diseases.map((disease, i) => (
                      <div key={i} className="pd-disease-chip">
                        <i className="fas fa-stethoscope" />
                        <span>{disease}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pd-card pd-card--full">
              <div className="pd-card-header">
                <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #7c5e1a, #a07c2e)' }}>
                  <i className="fas fa-cut" />
                </div>
                <h3>Parts Used & Their Functions</h3>
              </div>
              <div className="pd-card-body">
                <div className="pd-parts-detail-list">
                  {partsUsed.map((item, i) => (
                    <div key={i} className="pd-part-detail">
                      <div className="pd-part-detail-header">
                        <span className="pd-part-icon">🌿</span>
                        <strong>{item.part}</strong>
                      </div>
                      <p>{item.uses}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pd-card pd-card--caution">
              <div className="pd-card-header">
                <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #d32f2f, #f44336)' }}>
                  <i className="fas fa-exclamation-triangle" />
                </div>
                <h3>Cautions & Contraindications</h3>
              </div>
              <div className="pd-card-body">
                <ul className="pd-caution-list">
                  <li><i className="fas fa-circle" /> Always consult a qualified Ayurvedic practitioner before starting any herbal regimen</li>
                  <li><i className="fas fa-circle" /> Use cautiously during pregnancy and breastfeeding</li>
                  <li><i className="fas fa-circle" /> May interact with prescription medications — inform your doctor</li>
                  <li><i className="fas fa-circle" /> Discontinue if any allergic reaction occurs and seek medical attention</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ HOW TO USE TAB ═══════════ */}
        {activeTab === 'usage' && (
          <div className="pd-tab-panel pd-animate-in">
            <div className="pd-card pd-card--full">
              <div className="pd-card-header">
                <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #2d7318, #5a9a38)' }}>
                  <i className="fas fa-mortar-pestle" />
                </div>
                <h3>How to Use {plant.plantName}</h3>
              </div>
              <div className="pd-card-body">
                <div className="pd-usage-methods">
                  {usageMethods.map((method, i) => (
                    <div key={i} className="pd-usage-method">
                      <div className="pd-usage-icon">{method.emoji}</div>
                      <div>
                        <strong>{method.name}</strong>
                        <p>{method.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pd-card pd-card--full">
              <div className="pd-card-header">
                <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #4e342e, #795548)' }}>
                  <i className="fas fa-puzzle-piece" />
                </div>
                <h3>Which Part for What</h3>
              </div>
              <div className="pd-card-body">
                <div className="pd-parts-usage-grid">
                  {partsUsed.map((item, i) => (
                    <div key={i} className="pd-part-usage-card">
                      <div className="pd-part-usage-icon">
                        {i === 0 ? '🍃' : i === 1 ? '🌱' : i === 2 ? '🪵' : '🌸'}
                      </div>
                      <h4>{item.part}</h4>
                      <p>{item.uses}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pd-card pd-card--research">
              <div className="pd-card-header">
                <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #1565c0, #42a5f5)' }}>
                  <i className="fas fa-microscope" />
                </div>
                <h3>Modern Research</h3>
              </div>
              <div className="pd-card-body">
                <div className="pd-research-quote">
                  <i className="fas fa-quote-left pd-research-quote-icon" />
                  <p>
                    {plant.plantName} has been the subject of numerous scientific studies validating its traditional uses.
                    Research highlights its potential in {uses.slice(0, 2).join(' and ').toLowerCase() || 'various therapeutic applications'},
                    with promising results in modern pharmacological investigations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ═══════════ PRODUCTS TAB ═══════════ */}
        {activeTab === 'products' && (
          <div className="pd-tab-panel pd-animate-in">
            <div className="pd-card pd-card--full">
              <div className="pd-card-header">
                <div className="pd-card-icon" style={{ background: 'linear-gradient(135deg, #2d7318, #4a9c28)' }}>
                  <i className="fas fa-shopping-bag" />
                </div>
                <h3>Available Products – {plant.plantName}</h3>
              </div>
              <div className="pd-card-body">
                {products.length === 0 ? (
                  <div className="pd-products-empty">
                    <i className="fas fa-box-open" />
                    <p>No products available for this plant yet.</p>
                  </div>
                ) : (
                  <div className="pd-products-grid">
                    {products.map((product) => (
                      <div key={product._id} className="pd-product-card">
                        <div className="pd-product-img">
                          <img
                            src={product.image || product.plantId?.imagePath || normalizeImagePath(plant.imagePath)}
                            alt={product.name}
                            onError={(e) => (e.currentTarget.src = '/images/default-plant.svg')}
                          />
                          <span className="pd-product-type-badge">{product.type}</span>
                        </div>
                        <div className="pd-product-info">
                          <h4 className="pd-product-name">{product.name}</h4>
                          <p className="pd-product-desc">{product.description}</p>
                          <p className="pd-product-price">₹{product.price}</p>
                          <div className="pd-product-actions">
                            <div className="pd-product-qty">
                              <button
                                className="pd-qty-btn"
                                onClick={() => changeQty(product._id, -1)}
                                aria-label="Decrease"
                              >−</button>
                              <span className="pd-qty-val">{productQty[product._id] || 1}</span>
                              <button
                                className="pd-qty-btn"
                                onClick={() => changeQty(product._id, 1)}
                                aria-label="Increase"
                              >+</button>
                            </div>
                            <button
                              className={`pd-add-cart-btn ${addingToCart[product._id] ? 'pd-add-cart-btn--loading' : ''}`}
                              onClick={() => handleAddToCart(product._id)}
                              disabled={addingToCart[product._id]}
                            >
                              {addingToCart[product._id]
                                ? <><i className="fas fa-spinner fa-spin" /> Adding...</>
                                : <><i className="fas fa-cart-plus" /> Add to Cart</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlantDetailPage;
