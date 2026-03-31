import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { request, clearSession, setSession, getToken } from '../api/client.js';
import LocationPickerModal from '../components/LocationPickerModal.jsx';
import '../styles/userProfile.css';

const UserProfilePage = ({ user, onUserChange }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    age: '',
    gender: '',
    address: '',
    medicalHistory: '',
    password: '',
  });
  
  const [profilePic, setProfilePic] = useState(null);
  const [picPreview, setPicPreview] = useState('/images/default-avatar.png');

  useEffect(() => {
    fetchProfile();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess('');

    try {
      const data = new FormData();
      if (formData.email) data.append('email', formData.email);
      if (formData.mobile) data.append('mobile', formData.mobile);
      if (formData.age) data.append('age', formData.age);
      if (formData.gender) data.append('gender', formData.gender);
      if (formData.address) data.append('address', formData.address);
      if (formData.medicalHistory) data.append('medicalHistory', formData.medicalHistory);
      if (formData.password) data.append('password', formData.password);
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
      
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
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
        </div>
      </div>
      
      <LocationPickerModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onConfirm={(addr) => setFormData(prev => ({ ...prev, address: addr }))} 
      />
    </div>
  );
};

export default UserProfilePage;
