import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request, setSession } from '../api/client.js';
import '../styles/auth.css';

const LoginPage = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const submitLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const data = await request('/auth/login', { method: 'POST', body: { username, password } });
      setSession(data);
      onAuth(data.user);
      navigate('/');
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
      const data = await request('/auth/signup', { method: 'POST', body: { username, password } });
      setSession(data);
      onAuth(data.user);
      navigate('/');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="logo-area">
          <img src="/images/logo-final.png" alt="AyurSphere" />
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
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {message && <div className="auth-message">{message}</div>}
            <button type="submit" className="primary">Access portal</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submitSignup}>
            <label>
              Username
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <label>
              Confirm password
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>
            {message && <div className="auth-message">{message}</div>}
            <button type="submit" className="primary">Create account</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
