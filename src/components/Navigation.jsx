import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const { user, isAuthenticated, isAdmin, currentRoute, setCurrentRoute, logout } = useAuth();

  return (
    <>
      {/* Top Header - Mobile */}
      <header className="fixed top-0 w-full z-40 bg-[#14121d]/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 h-16 md:hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-700/80 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <span className="font-extrabold text-white text-xl tracking-wider">R</span>
          </div>
          <span className="font-bold text-xl text-purple-300 tracking-tight">Ronkws</span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => setCurrentRoute('profile')}
              className="w-9 h-9 rounded-full border border-purple-500/40 overflow-hidden bg-purple-900/30 flex items-center justify-center"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-purple-300 text-lg">person</span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentRoute('login')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Top Header - Desktop */}
      <header className="hidden md:flex fixed top-0 w-full z-40 bg-[#14121d]/85 backdrop-blur-xl border-b border-white/10 px-8 h-20 items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => isAuthenticated && setCurrentRoute('home')}>
          <div className="h-11 w-11 bg-gradient-to-tr from-purple-700 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <span className="font-black text-white text-2xl tracking-wider">R</span>
          </div>
          <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-purple-400 tracking-tight">
            Ronkws
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex items-center gap-8">
          {/* HOME BUTTON: Hidden BEFORE login, Visible AFTER login */}
          {isAuthenticated && (
            <button
              onClick={() => setCurrentRoute('home')}
              className={`font-semibold text-sm transition-all pb-1 flex items-center gap-1.5 ${
                currentRoute === 'home'
                  ? 'text-purple-300 border-b-2 border-purple-500'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              Home
            </button>
          )}

          {isAuthenticated && (
            <>
              <button
                onClick={() => setCurrentRoute('trending')}
                className={`font-semibold text-sm transition-all pb-1 flex items-center gap-1.5 ${
                  currentRoute === 'trending'
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-zinc-400 hover:text-purple-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                Trending
              </button>

              <button
                onClick={() => setCurrentRoute('favorites')}
                className={`font-semibold text-sm transition-all pb-1 flex items-center gap-1.5 ${
                  currentRoute === 'favorites'
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-zinc-400 hover:text-purple-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">star</span>
                Favorites
              </button>

              <button
                onClick={() => setCurrentRoute('search')}
                className={`font-semibold text-sm transition-all pb-1 flex items-center gap-1.5 ${
                  currentRoute === 'search'
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-zinc-400 hover:text-purple-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Search
              </button>

              {isAdmin && (
                <button
                  onClick={() => setCurrentRoute('admin')}
                  className={`font-semibold text-sm transition-all pb-1 flex items-center gap-1.5 ${
                    currentRoute === 'admin'
                      ? 'text-purple-300 border-b-2 border-purple-500'
                      : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Admin
                </button>
              )}
              <button
                onClick={() => setCurrentRoute('dmca')}
                className={`font-semibold text-sm transition-all pb-1 flex items-center gap-1.5 ${
                  currentRoute === 'dmca'
                    ? 'text-purple-300 border-b-2 border-purple-500'
                    : 'text-zinc-400 hover:text-purple-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                DMCA
              </button>
            </>
          )}
        </nav>

        {/* User Quick Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setCurrentRoute('profile')}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-900/50">
                  <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">{user?.name}</span>
              </button>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-zinc-400 hover:text-rose-400 transition-colors rounded-full hover:bg-rose-500/10"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentRoute('login')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition-all"
            >
              Log in
            </button>
          )}
        </div>
      </header>

      {/* Bottom Nav Bar - Mobile (Only rendered when authenticated) */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 w-full z-40 bg-[#181622]/90 backdrop-blur-xl border-t border-white/15 flex justify-around items-center px-2 py-2 pb-safe shadow-[0_-8px_24px_rgba(124,58,237,0.15)]">
          {/* HOME BUTTON: Hidden BEFORE login, Visible AFTER login */}
          <button
            onClick={() => setCurrentRoute('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentRoute === 'home'
                ? 'text-purple-300 bg-purple-600/20 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">home</span>
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <button
            onClick={() => setCurrentRoute('trending')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentRoute === 'trending'
                ? 'text-purple-300 bg-purple-600/20 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
            <span className="text-[10px] font-semibold">Trending</span>
          </button>

          <button
            onClick={() => setCurrentRoute('favorites')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentRoute === 'favorites'
                ? 'text-purple-300 bg-purple-600/20 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">star</span>
            <span className="text-[10px] font-semibold">Favorites</span>
          </button>

          <button
            onClick={() => setCurrentRoute('search')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentRoute === 'search'
                ? 'text-purple-300 bg-purple-600/20 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
            <span className="text-[10px] font-semibold">Search</span>
          </button>

          <button
            onClick={() => setCurrentRoute('profile')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              currentRoute === 'profile'
                ? 'text-purple-300 bg-purple-600/20 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="text-[10px] font-semibold">Profile</span>
          </button>
        </nav>
      )}
    </>
  );
}
