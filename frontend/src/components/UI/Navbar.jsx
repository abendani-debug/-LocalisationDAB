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
    <nav className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-[1000] shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-base leading-none">
          💳
        </div>
        <span className="font-bold text-gray-900 text-[15px]">
          Localisation<span className="text-blue-600">DAB</span>
        </span>
      </Link>

      {/* Desktop nav */}
      {!isMobile && (
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="text-sm text-slate-500 hover:text-gray-900 no-underline transition-colors">
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500">{user?.nom}</span>
              <button
                onClick={handleLogout}
                className="h-[34px] px-4 rounded-lg border border-slate-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-500 hover:text-gray-900 no-underline transition-colors">
                Connexion
              </Link>
              <Link to="/register" className="h-[34px] px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors no-underline flex items-center">
                Inscription
              </Link>
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
          className="flex flex-col gap-[5px] justify-center p-2 bg-transparent border-none cursor-pointer"
        >
          <span className="block w-[22px] h-[2px] bg-gray-700 rounded-sm transition-transform duration-200"
            style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span className="block w-[22px] h-[2px] bg-gray-700 rounded-sm transition-opacity duration-150"
            style={{ opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-[22px] h-[2px] bg-gray-700 rounded-sm transition-transform duration-200"
            style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      )}

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 shadow-md z-[999] flex flex-col">
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}
              className="text-gray-700 no-underline px-5 py-4 text-base border-b border-slate-100 hover:bg-slate-50">
              ⚙️ Administration
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="text-slate-500 px-5 py-4 text-sm border-b border-slate-100">👤 {user?.nom}</span>
              <button onClick={handleLogout}
                className="bg-transparent border-none text-gray-700 px-5 py-4 text-left cursor-pointer text-base hover:bg-slate-50">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="text-gray-700 no-underline px-5 py-4 text-base border-b border-slate-100 hover:bg-slate-50">
                Connexion
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="text-white no-underline px-5 py-4 text-base bg-blue-600 hover:bg-blue-700">
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
