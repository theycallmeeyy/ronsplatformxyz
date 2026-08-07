import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';

import Navigation from './components/Navigation';
import CinematicIntro from './components/CinematicIntro';
import ContentModal from './components/ContentModal';

import Login from './pages/Login';
import Home from './pages/Home';
import Trending from './pages/Trending';
import Favorites from './pages/Favorites';
import SearchPage from './pages/SearchPage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const { authLoaded, isAuthenticated, playIntroAnimation, currentRoute, completeIntroAnimation } = useAuth();

  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-[#14121d] text-white flex items-center justify-center">
        <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/10 shadow-[0_12px_40px_rgba(124,58,237,0.2)]">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-300">Restoring your session...</p>
        </div>
      </div>
    );
  }

  // If user just logged in, display the 4-second Cinematic Logo Animation
  if (playIntroAnimation) {
    return <CinematicIntro onComplete={completeIntroAnimation} />;
  }

  // If not authenticated, render Login/Sign Up page (Navigation Home button is hidden)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#14121d] text-white">
        <Navigation />
        <Login />
      </div>
    );
  }

  // Authenticated state rendering
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
        {currentRoute === 'profile' && <Profile />}
        {currentRoute === 'admin' && <AdminDashboard />}
      </main>

      {/* Content Stream Player Modal */}
      <ContentModal />
    </div>
  );
}

export default function App() {
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
