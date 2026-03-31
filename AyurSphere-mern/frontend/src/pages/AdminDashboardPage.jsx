import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request, clearSession } from '../api/client.js';
import AddPlantModal from '../components/AddPlantModal.jsx';
import '../styles/dashboard.css';
import '../styles/userProfile.css';

const AdminDashboardPage = ({ user, onUserChange }) => {
  const [activeTab, setActiveTab] = useState('plants');
  const [plants, setPlants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'plants' || activeTab === 'approvals') {
        const data = await request('/plants');
        setPlants(data);
      } else if (activeTab === 'users') {
        const data = await request('/users');
        setUsers(data);
      } else if (activeTab === 'orders') {
        const data = await request('/orders/all');
        setOrders(data);
      }
    } catch (err) {
      console.error('Admin fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await request(`/plants/${id}`, {
        method: 'PUT',
        body: { status: 'Approved' }
      });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleReject = async (id) => {
    try {
      await request(`/plants/${id}`, {
        method: 'PUT',
        body: { status: 'Rejected' }
      });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleDeletePlant = async (id) => {
    if (!window.confirm('Permanently delete this plant?')) return;
    try {
      await request(`/plants/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const logout = () => {
    clearSession();
    onUserChange(null);
    navigate('/portal');
  };

  const filteredPlants = plants.filter(p => activeTab === 'plants' ? p.status === 'Approved' : p.status === 'Pending');

  return (
    <div className="dashboard-root">
      <header className="app-header">
        <div className="header-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <img src="/images/logo-final.png" alt="AyurSphere" />
          <span className="header-brand">AyurSphere Admin</span>
        </div>
        <div className="header-actions">
           <button className="header-icon-btn" onClick={() => navigate('/dashboard')} title="User View">
            <i className="fas fa-eye" />
          </button>
          <span className="header-username" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>Admin: {user?.username}</span>
          <button className="header-logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="sidebar-label">ADMIN PANEL</p>
            <ul className="sidebar-list">
              <li className={`sidebar-item ${activeTab === 'plants' ? 'sidebar-item--active' : ''}`} onClick={() => setActiveTab('plants')}>
                <i className="fas fa-leaf" /> <span>Manage Plants</span>
              </li>
              <li className={`sidebar-item ${activeTab === 'approvals' ? 'sidebar-item--active' : ''}`} onClick={() => setActiveTab('approvals')}>
                <i className="fas fa-clipboard-check" /> 
                <span>Pending ({plants.filter(p => p.status === 'Pending').length})</span>
              </li>
              <li className={`sidebar-item ${activeTab === 'users' ? 'sidebar-item--active' : ''}`} onClick={() => setActiveTab('users')}>
                <i className="fas fa-users" /> <span>User Directory</span>
              </li>
              <li className={`sidebar-item ${activeTab === 'orders' ? 'sidebar-item--active' : ''}`} onClick={() => setActiveTab('orders')}>
                <i className="fas fa-shopping-bag" /> <span>Global Orders</span>
              </li>
            </ul>
          </div>
        </aside>

        <main className="content" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1b4d0c', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {activeTab === 'plants' && <><i className="fas fa-leaf"/> Plant Directory ({plants.filter(p => p.status === 'Approved').length})</>}
              {activeTab === 'approvals' && <><i className="fas fa-clock"/> Pending Submissions</>}
              {activeTab === 'users' && <><i className="fas fa-users"/> System Users ({users.length})</>}
              {activeTab === 'orders' && <><i className="fas fa-receipt"/> Checkout Records ({orders.length})</>}
            </h2>
            {activeTab === 'plants' && (
              <button className="hero-add-btn" onClick={() => setShowAddModal(true)}>
                <i className="fas fa-plus" /> Add New Plant
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}><i className="fas fa-spinner fa-spin fa-2x" /></div>
          ) : (
            <div className="up-card" style={{ padding: '1rem', overflowX: 'auto' }}>
              {activeTab === 'plants' || activeTab === 'approvals' ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Plant</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlants.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src={p.imagePath?.startsWith('http') ? p.imagePath : `http://localhost:4000${p.imagePath}`} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} onError={(e) => e.target.src='/images/logo-final.png'} />
                            <div>
                               <strong>{p.plantName}</strong>
                               <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#666' }}>{p.scientificName}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold',
                            backgroundColor: p.status === 'Approved' ? '#d4edda' : '#fff3cd',
                            color: p.status === 'Approved' ? '#155724' : '#856404'
                          }}>{p.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {activeTab === 'approvals' ? (
                              <>
                                <button onClick={() => handleApprove(p._id)} style={{ color: 'white', background: '#2d7318', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                <button onClick={() => handleReject(p._id)} style={{ color: 'white', background: '#dc3545', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => navigate(`/plant/${p._id}`)} style={{ background: '#eef9ee', border: '1px solid #cbe4cc', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                <button onClick={() => handleDeletePlant(p._id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}><i className="fas fa-trash"/></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPlants.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No records found.</td></tr>}
                  </tbody>
                </table>
              ) : activeTab === 'users' ? (
                <table className="admin-table">
                  <thead>
                     <tr>
                       <th>Username</th>
                       <th>Email</th>
                       <th>Role</th>
                       <th>Join Date</th>
                     </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.username}</strong></td>
                        <td>{u.email || 'N/A'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {orders.map(o => (
                     <div key={o._id} style={{ border: '1px solid #d4e8cc', borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                           <strong>Order #{o._id.toUpperCase()}</strong>
                           <span style={{ fontWeight: 'bold', color: '#1b4d0c' }}>₹{o.totalAmount}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                           Customer: {o.name} ({o.email}) | {o.mobile}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>
                           Address: {o.shippingAddress}
                        </div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                           {o.items.map((it, idx) => (
                             <span key={idx} style={{ background: '#f4f9f1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                               {it.name} x{it.quantity}
                             </span>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AddPlantModal 
        isOpen={activeTab === 'plants' && showAddModal}
        onClose={() => setShowAddModal(false)}
        onPlantAdded={fetchData}
      />

      <style>{`
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
        }
        .admin-table th {
          text-align: left;
          padding: 0.75rem;
          border-bottom: 2px solid #f0f5ee;
          color: #728c66;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .admin-table td {
          padding: 1rem 0.75rem;
          border-bottom: 1px solid #f0f5ee;
          font-size: 0.95rem;
          color: #4a5c43;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;
