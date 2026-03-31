import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { request, clearSession, setSession, getToken } from '../api/client.js';
import LocationPickerModal from '../components/LocationPickerModal.jsx';
import '../styles/userProfile.css';
import '../styles/checkout.css';

const UserProfilePage = ({ user, onUserChange }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    age: '',
    gender: '',
    address: '',
    medicalHistory: '',
    password: '',
  });
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [profilePic, setProfilePic] = useState(null);
  const [picPreview, setPicPreview] = useState('/images/default-avatar.png');

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await request('/users/profile');
      setFormData({
        email: data.email || '',
        mobile: data.mobile || '',
        age: data.age || '',
        gender: data.gender || '',
        address: data.address || '',
        medicalHistory: data.medicalHistory || '',
        password: '',
      });
      if (data.profilePicture) {
        // Assume backend is running on same host but port 4000 if dev, otherwise relative
        setPicPreview(`http://localhost:4000${data.profilePicture}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await request('/orders/me');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e, bypassOtp = false, verifiedOtp = '') => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess('');

    // If typing new password and haven't entered OTP yet
    if (formData.password && !bypassOtp) {
      if (!formData.mobile) {
        setError("Please enter a mobile number first to receive your secure OTP.");
        return;
      }
      try {
        setSaving(true);
        await request('/users/send-otp', { method: 'POST' });
        setShowOtpModal(true);
      } catch (err) {
        setError(err.message || 'Failed to dispatch OTP.');
      } finally {
        setSaving(false); // Wait for modal input
      }
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      if (formData.email) data.append('email', formData.email);
      if (formData.mobile) data.append('mobile', formData.mobile);
      if (formData.age) data.append('age', formData.age);
      if (formData.gender) data.append('gender', formData.gender);
      if (formData.address) data.append('address', formData.address);
      if (formData.medicalHistory) data.append('medicalHistory', formData.medicalHistory);
      if (formData.password) {
        data.append('password', formData.password);
        data.append('otp', verifiedOtp);
      }
      if (profilePic) data.append('profilePicture', profilePic);

      const updatedUser = await request('/users/profile', {
        method: 'PUT',
        body: data,
      });

      // Update local storage session just in case username wasn't changed but it keeps objects in sync
      setSession({ token: getToken(), user: updatedUser });
      onUserChange(updatedUser);
      
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
      setOtp('');
      setShowOtpModal(false);
      setSuccess('Profile updated successfully!');
      
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const verifyOtpAndSubmit = () => {
    if (!otp) return alert("Please enter the OTP.");
    setShowOtpModal(false);
    handleSubmit(null, true, otp);
  };

  const logout = () => {
    clearSession();
    onUserChange(null);
  };

  return (
    <div className="dashboard-root user-profile-page">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-logo">
          <img src="/images/logo-final.png" alt="AyurSphere" />
          <span className="header-brand">AyurSphere</span>
        </div>

        <div className="header-actions" style={{ marginLeft: 'auto' }}>
          <button className="header-icon-btn" onClick={() => navigate('/dashboard')} title="Dashboard">
            <i className="fas fa-spa" />
          </button>
          <button className="header-icon-btn" onClick={() => navigate('/favorites')} title="Favorites">
            <i className="fas fa-heart" />
          </button>
          <span className="header-username">{user?.username}</span>
          <button className="header-logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="up-content">
        <div className="up-container">
          <div className="up-header">
            <button className="up-back-btn" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-left" /> Back
            </button>
            <h2>My Profile</h2>
          </div>

          {loading ? (
            <div className="up-loading">
              <i className="fas fa-spinner fa-spin" />
              <p>Loading profile...</p>
            </div>
          ) : (
            <div className="up-card">
              <div className="up-profile-pic-section">
                <div className="up-pic-wrapper">
                  <img src={picPreview} alt="Profile" className="up-pic" onError={(e) => { e.target.src = '/images/logo-final.png'; }} />
                  <button type="button" className="up-pic-edit" onClick={() => fileInputRef.current?.click()} title="Change Picture">
                    <i className="fas fa-camera" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                <h3 className="up-username-display">@{user?.username}</h3>
                <p className="up-role-display">{user?.role?.toUpperCase()}</p>
              </div>

              <form className="up-form" onSubmit={handleSubmit}>
                {error && <div className="up-alert up-alert--error"><i className="fas fa-exclamation-circle" /> {error}</div>}
                {success && <div className="up-alert up-alert--success"><i className="fas fa-check-circle" /> {success}</div>}
                
                <h4 className="up-section-title">Personal Information</h4>
                <div className="up-grid">
                  <div className="up-field">
                    <label>Username</label>
                    <input type="text" value={user?.username || ''} disabled className="up-input-disabled" />
                  </div>
                  <div className="up-field">
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                  <div className="up-field">
                    <label>Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+1234567890" />
                  </div>
                  <div className="up-field up-field-half">
                    <label>Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 28" min="1" max="120" />
                  </div>
                  <div className="up-field up-field-half">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="up-field">
                  <label>Residential Address</label>
                  <div className="co-input-group">
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Ayurveda Street, City" />
                    <button type="button" className="co-map-icon-btn" onClick={() => setIsMapOpen(true)} title="Pick Location from Map">
                      <i className="fas fa-map-marker-alt" />
                    </button>
                  </div>
                </div>

                <h4 className="up-section-title">Health & Security</h4>
                <div className="up-field">
                  <label>Medical History / Allergies</label>
                  <textarea 
                    name="medicalHistory" 
                    value={formData.medicalHistory} 
                    onChange={handleChange} 
                    placeholder="E.g., Allergic to peanuts, high blood pressure..."
                    rows="3"
                  />
                </div>

                <div className="up-field">
                  <label>Change Password (leave blank to keep current)</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Enter new password to change"
                    minLength="6"
                  />
                </div>

                <div className="up-actions">
                  <button type="submit" className="up-save-btn" disabled={saving}>
                    {saving ? <><i className="fas fa-spinner fa-spin"/> Saving...</> : <><i className="fas fa-save"/> Save Profile</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── ORDER HISTORY PORTAL ── */}
          {!loading && (
            <div className="up-card" style={{ marginTop: '2rem' }}>
              <h3 className="up-section-title" style={{ marginTop: 0 }}><i className="fas fa-box-open" /> Previously Placed Orders</h3>
              {loadingOrders ? (
                <div style={{ textAlign: 'center', color: '#728c66', padding: '1rem' }}>
                  <i className="fas fa-spinner fa-spin" /> Fetching order history...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', backgroundColor: '#f4f9f1', padding: '2rem', borderRadius: '8px', border: '1px dashed #cbe4cc' }}>
                  <i className="fas fa-shopping-basket" style={{ fontSize: '2rem', color: '#8ba37f', marginBottom: '0.5rem' }} />
                  <p style={{ color: '#4a5c43' }}>You have not placed any orders yet!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map(order => (
                    <div key={order._id} style={{ border: '1px solid #d4e8cc', borderRadius: '8px', padding: '1.2rem', backgroundColor: '#fcfdfc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f5ee', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                        <div>
                          <strong style={{ color: '#2d7318', fontSize: '1.1rem' }}>Order #{order._id.substring(18).toUpperCase()}</strong>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#728c66' }}>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold',
                            backgroundColor: order.status === 'Pending' ? '#fff3cd' : '#d4edda',
                            color: order.status === 'Pending' ? '#856404' : '#155724'
                          }}>{order.status}</span>
                          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: '#1b4d0c' }}>Total: ₹{order.totalAmount}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px', backgroundColor: '#f4f9f1', padding: '6px 10px', borderRadius: '6px' }}>
                            <img src={item.image ? (item.image.startsWith('http') ? item.image : `http://localhost:4000${item.image}`) : '/images/default-plant.svg'} alt={item.name} style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => e.currentTarget.src='/images/default-plant.svg'} />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4a5c43', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{item.name}</span>
                              <span style={{ fontSize: '0.75rem', color: '#728c66' }}>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <LocationPickerModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onConfirm={(addr) => setFormData(prev => ({ ...prev, address: addr }))} 
      />

      {/* ── OTP Modal ── */}
      {showOtpModal && (
        <div className="loc-modal-overlay">
          <div className="loc-modal-content" style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ color: '#2d7318', marginBottom: '1rem' }}><i className="fas fa-lock" /> Security Verification</h3>
            <p style={{ color: '#4a5c43', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              We've dispatched a 6-digit verification code to your registered mobile number: <br/><strong>{formData.mobile}</strong>
            </p>
            <input 
              type="text" 
              maxLength="6"
              style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1.5px solid #d4e8cc', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', marginBottom: '1.5rem' }} 
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="loc-btn loc-btn-current" style={{ flex: 1 }} onClick={() => setShowOtpModal(false)}>Cancel</button>
              <button className="loc-btn loc-btn-confirm" style={{ flex: 1 }} onClick={verifyOtpAndSubmit} disabled={otp.length < 5}>Verify & Save</button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#728c66', marginTop: '1rem' }}>Demo Hint: Try OTP 123456</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
