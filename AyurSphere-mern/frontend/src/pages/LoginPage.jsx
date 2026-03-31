import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { request, setSession } from '../api/client.js';
import '../styles/auth.css';

const LoginPage = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'user';
  const isAdmin = role === 'admin';

  const submitLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = await request('/auth/login', { method: 'POST', body: { username, password } });
      setSession(data);
      onAuth(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const data = await request('/auth/signup', { method: 'POST', body: { username, password, role } });
      setSession(data);
      onAuth(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-area">
          <img src="/images/logo-final.png" alt="AyurSphere" />
          <h3 className="auth-portal-label">
            {isAdmin ? (
              <><i className="fas fa-user-shield" /> Administrator Access</>
            ) : (
              <><i className="fas fa-leaf" /> User Portal</>
            )}
          </h3>
          <p>The sphere of healing, reimagined</p>
        </div>

        <div className="toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Create account
          </button>
        </div>

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={submitLogin}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter username" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
            </label>
            {message && <div className="auth-message">{message}</div>}
            <button type="submit" className="primary">
              <i className="fas fa-sign-in-alt" /> Access Portal
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submitSignup}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Choose a username" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a password" />
            </label>
            <label>
              Confirm password
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm your password" />
            </label>
            {message && <div className="auth-message">{message}</div>}
            <button type="submit" className="primary">
              <i className="fas fa-user-plus" /> Create Account
            </button>
          </form>
        )}

        <button className="auth-back-btn" onClick={() => navigate('/portal')}>
          <i className="fas fa-arrow-left" /> Back to Portal Selection
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
