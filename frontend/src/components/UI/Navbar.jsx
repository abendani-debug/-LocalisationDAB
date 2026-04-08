import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useIsMobile from '../../hooks/useIsMobile';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={{
      background: '#1e40af', color: '#fff',
      padding: '0 1rem', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 1000,
    }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem' }}>
        🏧 {isMobile ? 'LocalDAB' : 'LocalisationDAB'}
      </Link>

      {/* Desktop nav */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAdmin && (
            <Link to="/admin" style={{ color: '#bfdbfe', textDecoration: 'none', fontSize: '0.9rem' }}>
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '0.9rem', color: '#bfdbfe' }}>{user?.nom}</span>
              <button onClick={handleLogout} style={{
                background: 'none', border: '1px solid #bfdbfe',
                color: '#bfdbfe', borderRadius: '0.375rem',
                padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem',
              }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#bfdbfe', textDecoration: 'none', fontSize: '0.9rem' }}>Connexion</Link>
              <Link to="/register" style={{
                background: '#2563eb', color: '#fff', padding: '0.3rem 0.75rem',
                borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.85rem',
              }}>Inscription</Link>
            </>
          )}
        </div>
      )}

      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          style={{
            background: 'none', border: 'none', color: '#fff',
            cursor: 'pointer', padding: '0.5rem', display: 'flex',
            flexDirection: 'column', gap: '5px', justifyContent: 'center',
          }}
        >
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#fff', borderRadius: '1px', transition: 'transform 0.2s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#fff', borderRadius: '1px', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.15s' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#fff', borderRadius: '1px', transition: 'transform 0.2s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      )}

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'absolute', top: '56px', left: 0, right: 0,
          background: '#1e3a8a', zIndex: 999,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              style={{ color: '#bfdbfe', textDecoration: 'none', padding: '0.9rem 1.25rem', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              ⚙️ Administration
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span style={{ color: '#bfdbfe', padding: '0.9rem 1.25rem', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                👤 {user?.nom}
              </span>
              <button onClick={handleLogout} style={{
                background: 'none', border: 'none', color: '#bfdbfe',
                padding: '0.9rem 1.25rem', textAlign: 'left', cursor: 'pointer', fontSize: '1rem',
              }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                style={{ color: '#bfdbfe', textDecoration: 'none', padding: '0.9rem 1.25rem', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              >
                Connexion
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                style={{ color: '#fff', textDecoration: 'none', padding: '0.9rem 1.25rem', fontSize: '1rem', background: '#2563eb' }}
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
