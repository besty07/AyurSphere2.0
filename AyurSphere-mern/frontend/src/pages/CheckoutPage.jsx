import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api/client.js';
import LocationPickerModal from '../components/LocationPickerModal.jsx';
import '../styles/checkout.css';

const CheckoutPage = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Form State initialized fully empty, populated from user profile inside useEffect
  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: '',
    mobile: '',
    shippingAddress: '',
    paymentMode: 'COD'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, cartData] = await Promise.all([
        request('/users/profile'),
        request('/cart')
      ]);

      if (!cartData || cartData.items.length === 0) {
        alert("Your cart is empty. Redirecting to dashboard.");
        navigate('/dashboard');
        return;
      }

      setCart(cartData);
      setFormData(prev => ({
        ...prev,
        email: profileData.email || '',
        mobile: profileData.mobile || '',
        shippingAddress: profileData.address || ''
      }));

    } catch (err) {
      setError(err.message || 'Error loading checkout details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.shippingAddress) {
      setError("Please fill all required shipping details.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        subTotal,
        gstAmount,
        shippingAmount,
        totalAmount
      };

      await request('/orders/checkout', {
        method: 'POST',
        body: payload
      });

      // Checkout Success
      alert('Order placed successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error finalizing checkout');
    } finally {
      setSubmitting(false);
    }
  };

  const items = (cart?.items || []).filter(i => i.product);
  const subTotal = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  const gstAmount = Math.round(subTotal * 0.05); // 5% Standard Ayurvedic GST Placeholder
  const shippingAmount = subTotal > 0 ? 50 : 0; // Standard 50 shipping
  const totalAmount = subTotal + gstAmount + shippingAmount;

  if (loading) {
    return (
      <div className="checkout-page" style={{ display: 'grid', placeItems: 'center' }}>
        <h2 style={{ color: '#2d7318' }}><i className="fas fa-spinner fa-spin" /> Loading secure checkout...</h2>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="co-content">
        <div className="co-header">
          <button className="up-back-btn" onClick={() => navigate('/dashboard')} style={{ marginBottom: 0 }}>
            <i className="fas fa-arrow-left" /> Back to Cart
          </button>
          <h2>Secure Checkout</h2>
        </div>

        <div className="co-main-form">
          {error && <div className="up-alert up-alert--error" style={{ marginBottom: '1rem' }}><i className="fas fa-exclamation-circle" /> {error}</div>}
          
          <form id="checkoutForm" onSubmit={handleSubmit}>
            <div className="co-card">
              <h3><i className="fas fa-truck" /> Shipping Information</h3>
              <div className="co-grid">
                <div className="co-field co-field-full">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="co-field">
                  <label>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="co-field">
                  <label>Mobile Number *</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required />
                </div>
                <div className="co-field co-field-full">
                  <label>Shipping Address *</label>
                  <div className="co-input-group">
                    <input type="text" name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} required placeholder="123 Ayurveda Street, City" />
                    <button type="button" className="co-map-icon-btn" onClick={() => setIsMapOpen(true)} title="Pick location from map">
                      <i className="fas fa-map-marker-alt" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="co-card">
              <h3><i className="fas fa-credit-card" /> Payment Method</h3>
              <div className="co-radio-group">
                <label className="co-radio-label">
                  <input type="radio" name="paymentMode" value="COD" checked={formData.paymentMode === 'COD'} onChange={handleChange} />
                  Cash on Delivery
                </label>
                <label className="co-radio-label">
                  <input type="radio" name="paymentMode" value="Online" checked={formData.paymentMode === 'Online'} onChange={handleChange} />
                  Pay Online (Card/UPI)
                </label>
              </div>
              {formData.paymentMode === 'Online' && (
                <p style={{ fontSize: '0.85rem', color: '#728c66', marginTop: '0.8rem' }}>
                  <i className="fas fa-info-circle"/> Mock Integration: This will simply succeed for this demo.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="co-sidebar">
          <div className="co-card co-summary">
            <h3><i className="fas fa-receipt" /> Order Summary</h3>
            
            <ul className="co-summary-list">
              {items.map(item => (
                <li key={item.product?._id || Math.random()} className="co-summary-item">
                  <span className="co-summary-item-name">{item.product?.name} x{item.quantity}</span>
                  <span className="co-summary-item-price">₹{item.product?.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <div className="co-totals">
              <div className="co-total-row">
                <span>Subtotal</span>
                <span>₹{subTotal}</span>
              </div>
              <div className="co-total-row">
                <span>GST (5%)</span>
                <span>₹{gstAmount}</span>
              </div>
              <div className="co-total-row">
                <span>Shipping</span>
                <span>₹{shippingAmount}</span>
              </div>
              <div className="co-total-final">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <button type="submit" form="checkoutForm" className="co-submit-btn" disabled={submitting}>
              {submitting ? <><i className="fas fa-spinner fa-spin"/> Processing...</> : `Confirm Order ₹${totalAmount}`}
            </button>
          </div>
        </div>
      </div>
      
      <LocationPickerModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onConfirm={(addr) => setFormData(prev => ({ ...prev, shippingAddress: addr }))} 
      />
    </div>
  );
};

export default CheckoutPage;
