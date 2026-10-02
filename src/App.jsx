import React, { useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';

import Navigation from './components/Navigation';
import CinematicIntro from './components/CinematicIntro';
import ContentModal from './components/ContentModal';
import AgeGate from './components/AgeGate';

import Home from './pages/DirectoryHome';
import Trending from './pages/Trending';
import Favorites from './pages/Favorites';
import SearchPage from './pages/SearchPage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Dmca from './pages/Dmca';
import RequestSite from './pages/RequestSite';

function MainApp() {
  const { authLoaded, isAuthenticated, isAdmin, ageVerified, confirmAge, playIntroAnimation, currentRoute, completeIntroAnimation } = useAuth();

  if (!ageVerified) {
    return <AgeGate onContinue={confirmAge} />;
  }

  if (playIntroAnimation) {
    return <CinematicIntro onComplete={completeIntroAnimation} />;
  }

  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-[#14121d] text-white flex items-center justify-center">
        <div
          className="session-loader text-center p-6 rounded-3xl bg-white/5 border border-white/10 shadow-[0_12px_40px_rgba(124,58,237,0.2)]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <img
            src="/logo/ronkws-glass-mark.svg"
            alt=""
            className="session-loader__logo mx-auto mb-4 h-14 w-14 object-contain"
          />
          <div
            className="session-loader__track mx-auto mb-4"
            role="progressbar"
            aria-label="Restoring your session"
            aria-valuetext="Loading"
          >
            <span className="session-loader__bar" />
          </div>
          <p className="text-sm text-zinc-300">Restoring your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14121d] text-white selection:bg-purple-600 selection:text-white">
      {/* Navigation Top Header & Mobile Nav Bar (Home button is now VISIBLE) */}
      <Navigation />

      {/* Main Page Router */}
      <main className="min-h-[calc(100vh-80px)]">
        {currentRoute === 'home' && <Home />}
        {currentRoute === 'trending' && <Trending />}
        {currentRoute === 'favorites' && <Favorites />}
        {currentRoute === 'search' && <SearchPage />}
        {currentRoute === 'profile' && isAuthenticated && <Profile />}
        {currentRoute === 'admin' && isAdmin && <AdminDashboard />}
        {currentRoute === 'dmca' && <Dmca />}
        {currentRoute === 'request' && <RequestSite />}
        {/* Fallback: if currentRoute is invalid/undefined, show Home */}
        {(!['home', 'trending', 'favorites', 'search', 'profile', 'admin', 'dmca', 'request'].includes(currentRoute) || (currentRoute === 'admin' && !isAdmin) || (currentRoute === 'profile' && !isAuthenticated)) && <Home />}
      </main>

      {/* Content Stream Player Modal */}
      <ContentModal />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
      });
    }
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <ContentProvider>
          <MainApp />
        </ContentProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
