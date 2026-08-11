import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

export default function Profile() {
  const { user, isAdmin, updateProfile, changePassword, logout, setCurrentRoute, preferences, updatePreference } = useAuth();
  const { watchHistory, favorites } = useContent();
  const savedBadgeTimeout = useRef(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [preferenceSaved, setPreferenceSaved] = useState(false);
  const [savedPreferenceMessage, setSavedPreferenceMessage] = useState('');
  const [badgeFadingOut, setBadgeFadingOut] = useState(false);

  // Edit Profile Form
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');
  const [avatarFileError, setAvatarFileError] = useState('');

  useEffect(() => {
    setEditName(user?.name || '');
    setEditBio(user?.bio || '');
    setEditAvatar(user?.avatar || '');
    setAvatarFileError('');
  }, [user]);

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarFileError('Please choose an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
        setAvatarFileError('');
      }
    };
    reader.onerror = () => {
      setAvatarFileError('Unable to read the selected image. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Change Password Form
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Preference Toggles are persisted via AuthContext and localStorage
  const darkMode = preferences.darkMode;
  const notifications = preferences.notifications;
  const autoplay = preferences.autoplay;

  // Preset Avatar Options
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      bio: editBio,
      avatar: editAvatar
    });
    setShowEditModal(false);
    showSavedBadge('Profile saved');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPassError('');
    if (!currPassword) {
      setPassError('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }

    const res = changePassword(currPassword, newPassword);
    if (res.success) {
      setShowPassModal(false);
      setCurrPassword('');
      setNewPassword('');
      showSavedBadge('Password updated');
    } else {
      setPassError(res.error);
    }
  };

  const showSavedBadge = (message) => {
    setSavedPreferenceMessage(message);
    setBadgeFadingOut(false);
    setPreferenceSaved(true);
    clearTimeout(savedBadgeTimeout.current);
    savedBadgeTimeout.current = window.setTimeout(() => {
      setBadgeFadingOut(true);
    }, 1600);
    savedBadgeTimeout.current = window.setTimeout(() => {
      setPreferenceSaved(false);
      setBadgeFadingOut(false);
    }, 2200);
  };

  const handlePreferenceChange = (key, value, label) => {
    updatePreference(key, value);
    showSavedBadge(`${label} saved`);
  };

  return (
    <div className="pt-24 md:pt-28 px-5 max-w-screen-md mx-auto w-full space-y-6 pb-28">
      {/* Profile Header Card */}
      <section className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(124,58,237,0.15)]">
        <div className="absolute inset-0 bg-purple-600/10 blur-[40px] pointer-events-none rounded-full transform -translate-y-1/2 scale-150" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full border-2 border-purple-500 overflow-hidden shadow-[0_0_20px_rgba(124,58,237,0.4)] mb-3 bg-purple-950">
            <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
          </div>

          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {user?.name}
            {isAdmin && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase">
                Admin
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
          <p className="text-xs text-purple-300/80 mt-1 italic max-w-xs">{user?.bio || 'Streaming enthusiast'}</p>

          <div className="mt-6 flex gap-4 w-full">
            <div className="flex-1 bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <span className="block text-xl font-extrabold text-purple-300">{watchHistory.length}</span>
              <span className="text-[11px] font-semibold text-zinc-400">Watched</span>
            </div>
            <div className="flex-1 bg-white/5 rounded-2xl p-3 text-center border border-white/5">
              <span className="block text-xl font-extrabold text-purple-300">{favorites.length}</span>
              <span className="text-[11px] font-semibold text-zinc-400">Favorites</span>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Dashboard Action Button (If Admin) */}
      {isAdmin && (
        <button
          onClick={() => setCurrentRoute('admin')}
          className="w-full bg-gradient-to-r from-amber-600/30 via-purple-600/30 to-amber-600/30 hover:from-amber-600/50 hover:to-purple-600/50 text-amber-200 font-bold text-sm py-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          Open Admin Control Dashboard
        </button>
      )}

      {/* Account Settings List */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">
          Account Settings
        </h3>

        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col divide-y divide-white/10 border border-white/10">
          {/* Edit Profile */}
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center justify-between p-4 w-full text-left hover:bg-purple-900/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </div>
              <span className="text-sm font-semibold text-white">Edit Profile</span>
            </div>
            <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
          </button>

          {/* Change Password */}
          <button
            onClick={() => setShowPassModal(true)}
            className="flex items-center justify-between p-4 w-full text-left hover:bg-purple-900/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <span className="text-sm font-semibold text-white">Change Password</span>
            </div>
            <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
          </button>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
              </div>
              <span className="text-sm font-semibold text-white">Dark Mode</span>
            </div>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => handlePreferenceChange('darkMode', !darkMode, 'Dark mode')}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </div>
              <span className="text-sm font-semibold text-white">Notifications</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => handlePreferenceChange('notifications', !notifications, 'Notifications')}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          {/* Autoplay Toggle */}
          <div className="flex items-center justify-between p-4 w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300">
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
              </div>
              <span className="text-sm font-semibold text-white">Autoplay Next Episode</span>
            </div>
            <input
              type="checkbox"
              checked={autoplay}
              onChange={() => handlePreferenceChange('autoplay', !autoplay, 'Autoplay')}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {(preferenceSaved || badgeFadingOut) && (
          <div className={`mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 px-4 py-2 text-emerald-100 text-xs font-semibold shadow-sm transform transition-all duration-300 ${badgeFadingOut ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <span className="material-symbols-outlined text-emerald-300 text-[18px]">check_circle</span>
            {savedPreferenceMessage}
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="w-full mt-4 py-4 rounded-2xl font-bold text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#181622] border border-white/15 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Bio / Status</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-2">Avatar URL or Preset</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 mb-2"
                />
                <div className="mb-3">
                  <label className="text-xs font-semibold text-zinc-400 block mb-2">Upload Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="w-full text-xs text-white file:bg-purple-600 file:text-white file:px-3 file:py-2 file:rounded-full file:border-0"
                  />
                  {avatarFileError && <p className="text-xs text-rose-400 mt-2">{avatarFileError}</p>}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(preset)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                        editAvatar === preset ? 'border-purple-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 rounded-xl border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-3 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#181622] border border-white/15 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Change Password</h3>
              <button onClick={() => setShowPassModal(false)} className="text-zinc-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Current Password</label>
                <input
                  type={showCurrPassword ? 'text' : 'password'}
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  aria-label={showCurrPassword ? 'Hide current password' : 'Show current password'}
                >
                  <span className="material-symbols-outlined">{showCurrPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-zinc-400 block mb-1">New Password (min 6 chars)</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  <span className="material-symbols-outlined">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {passError && <p className="text-xs text-rose-400 font-semibold">{passError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 rounded-xl border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-3 rounded-xl"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
