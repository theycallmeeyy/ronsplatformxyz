import React, { useState } from 'react';
import {
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PUBLIC_LINKS = [
  ['home', 'Directory'],
  ['trending', 'Trending'],
  ['favorites', 'Favorites'],
  ['search', 'Search'],
  ['dmca', 'DMCA']
];

export default function Navigation() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    ageVerified,
    preferences,
    updatePreference,
    currentRoute,
    setCurrentRoute,
    logout
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const canBrowse = isAuthenticated || ageVerified;

  const navigateTo = (route) => {
    setCurrentRoute(route);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="directory-header">
        <div className="directory-header-inner">
          <button className="directory-wordmark" onClick={() => navigateTo('home')} aria-label="Ronkws directory home">
            <span className="directory-wordmark-icon"><img src="/logo/ronkws-glass-mark.svg" alt="" /></span>
            <span>Ronkws</span>
          </button>

          <div className="directory-header-actions">
            <button
              type="button"
              onClick={() => navigateTo('search')}
              className="header-icon-button header-search-button"
              title="Search providers"
              aria-label="Search providers"
            >
              <Search size={19} />
              <span>Search</span>
              <kbd>/</kbd>
            </button>
            <a
              className="header-icon-button header-social-link"
              href="https://discord.gg/bazxR8fA43"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open Ronkws community"
              title="Community"
            >
              <span className="social-glyph">D</span>
            </a>
            <a
              className="header-icon-button header-social-link"
              href="https://www.reddit.com/r/tbcpl/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open community on Reddit"
              title="Reddit"
            >
              <span className="social-glyph">r/</span>
            </a>
            <button
              type="button"
              className="header-icon-button"
              onClick={() => updatePreference('darkMode', !preferences.darkMode)}
              title={preferences.darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={preferences.darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {preferences.darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated && (
              <button
                type="button"
                className="header-icon-button account-button"
                onClick={() => navigateTo('profile')}
                title="Profile"
                aria-label="Profile"
              >
                {user?.avatar ? <img src={user.avatar} alt="" /> : <UserRound size={18} />}
              </button>
            )}
            <button
              type="button"
              className={`header-icon-button menu-button ${menuOpen ? 'is-open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              title={menuOpen ? 'Close menu' : 'Open menu'}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && canBrowse && (
        <>
          <button
            className="directory-menu-scrim"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <nav className="directory-menu" aria-label="Main navigation">
            {PUBLIC_LINKS.map(([route, label]) => (
              <button
                type="button"
                key={route}
                className={currentRoute === route ? 'is-active' : ''}
                onClick={() => navigateTo(route)}
              >
                {label}
              </button>
            ))}
            {isAdmin && <button type="button" onClick={() => navigateTo('admin')}>Admin dashboard</button>}
            {isAuthenticated && (
              <button type="button" onClick={() => { setMenuOpen(false); logout(); }}>
                <LogOut size={16} /> Sign out
              </button>
            )}
          </nav>
        </>
      )}
    </>
  );
}
