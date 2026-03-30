import { useNavigate } from 'react-router-dom';
import '../styles/portal.css';

const PortalPage = () => {
  const navigate = useNavigate();

  return (
    <div className="portal-page">
      <div className="portal-card">
        <div className="portal-logo">
          <img src="/images/logo-final.png" alt="AyurSphere" />
        </div>

        <p className="portal-tagline">The sphere of healing, reimagined</p>
        <h2 className="portal-heading">Choose Your Portal</h2>
        <p className="portal-subtext">Select your access level to continue</p>

        <div className="portal-buttons">
          <button
            className="portal-btn portal-btn--admin"
            onClick={() => navigate('/login?role=admin')}
          >
            <div className="portal-btn__left">
              <span className="portal-btn__icon portal-btn__icon--admin">
                <i className="fas fa-user-shield" />
              </span>
              <div className="portal-btn__text">
                <span className="portal-btn__title">Administrator</span>
                <span className="portal-btn__sub">Full system access &amp; management</span>
              </div>
            </div>
            <i className="fas fa-arrow-right portal-btn__arrow" />
          </button>

          <button
            className="portal-btn portal-btn--user"
            onClick={() => navigate('/login?role=user')}
          >
            <div className="portal-btn__left">
              <span className="portal-btn__icon portal-btn__icon--user">
                <i className="fas fa-user" />
              </span>
              <div className="portal-btn__text">
                <span className="portal-btn__title">User Portal</span>
                <span className="portal-btn__sub">Explore the virtual herbal garden</span>
              </div>
            </div>
            <i className="fas fa-arrow-right portal-btn__arrow" />
          </button>
        </div>

        <p className="portal-footer">
          <i className="fas fa-leaf" /> Connecting you with nature's wisdom
        </p>
      </div>
    </div>
  );
};

export default PortalPage;
