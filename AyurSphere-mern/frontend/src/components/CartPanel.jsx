import { useEffect, useRef } from 'react';
import '../styles/cartPanel.css';

const normalizeImg = (path) => {
  if (!path) return '/images/default-plant.svg';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
};

const CartPanel = ({ isOpen, onClose, cart, onAdd, onRemove, onUpdate, onCheckout }) => {
  const panelRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  /* Lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <>
      {/* Backdrop */}
      <div className={`cart-backdrop ${isOpen ? 'cart-backdrop--visible' : ''}`} onClick={onClose} />

      {/* Panel */}
      <div ref={panelRef} className={`cart-panel ${isOpen ? 'cart-panel--open' : ''}`}>
        {/* Header */}
        <div className="cp-header">
          <div className="cp-header-title">
            <i className="fas fa-shopping-cart cp-header-icon" />
            <h2>Shopping Cart</h2>
          </div>
          <button className="cp-close-btn" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>

        {/* Items */}
        <div className="cp-body">
          {items.length === 0 ? (
            <div className="cp-empty">
              <i className="fas fa-shopping-basket" />
              <p>Your cart is empty</p>
              <span>Browse plants and add products to get started</span>
              <button className="cp-browse-btn" onClick={onClose}>
                <i className="fas fa-leaf" /> Browse Plants
              </button>
            </div>
          ) : (
            <ul className="cp-items-list">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const plantName = product.plantId?.plantName || '';
                return (
                  <li key={product._id} className="cp-item">
                    <div className="cp-item-img">
                      <img
                        src={normalizeImg(product.image || product.plantId?.imagePath)}
                        alt={product.name}
                        onError={(e) => (e.currentTarget.src = '/images/default-plant.svg')}
                      />
                    </div>
                    <div className="cp-item-info">
                      <p className="cp-item-name">{product.name}</p>
                      {plantName && (
                        <p className="cp-item-plant">From: {plantName.toLowerCase()}</p>
                      )}
                      <p className="cp-item-price">₹{product.price}</p>
                    </div>
                    <div className="cp-item-qty">
                      <button
                        className="cp-qty-btn"
                        onClick={() => onUpdate(product._id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="cp-qty-val">{item.quantity}</span>
                      <button
                        className="cp-qty-btn"
                        onClick={() => onUpdate(product._id, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cp-footer">
            <div className="cp-total">
              <span>Total:</span>
              <span className="cp-total-amt">₹{total}</span>
            </div>
            <button className="cp-checkout-btn" onClick={onCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;
