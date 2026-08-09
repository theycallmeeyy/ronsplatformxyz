import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_USERS } from '../data/initialData';
import { useToast } from './ToastContext';
import { fetchCurrentUser, logoutBackend, refreshSession } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();

  // Load registered users from localStorage or default
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ronkws_users');
    const defaultAdmin = INITIAL_USERS.find((u) => u.id === 'usr-002');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalized = parsed.map((u) => {
          if (u.id === defaultAdmin.id || u.email.toLowerCase() === defaultAdmin.email) {
            return { ...defaultAdmin };
          }
          return u;
        });

        const hasAdmin = normalized.some(
          (u) => u.id === defaultAdmin.id || u.email.toLowerCase() === defaultAdmin.email
        );
        const nextUsers = hasAdmin ? normalized : [...normalized, { ...defaultAdmin }];

        if (JSON.stringify(nextUsers) !== JSON.stringify(parsed)) {
          localStorage.setItem('ronkws_users', JSON.stringify(nextUsers));
        }
        return nextUsers;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  // Active session from backend; localStorage is no longer the primary auth source for server sessions.
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('ronkws_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved preferences.', e);
      }
    }
    return {
      darkMode: true,
      notifications: true,
      autoplay: true
    };
  });
  const [authLoaded, setAuthLoaded] = useState(false);
  const refreshTimeout = useRef(null);

  useEffect(() => {
    localStorage.setItem('ronkws_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const body = document.body;
    body.classList.toggle('dark-mode', preferences.darkMode);
    body.classList.toggle('light-mode', !preferences.darkMode);
  }, [preferences.darkMode]);

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    const label = key === 'darkMode' ? 'Dark Mode' : key === 'notifications' ? 'Notifications' : 'Autoplay Next Episode';
    showToast(`${label} ${value ? 'enabled' : 'disabled'}`, 'info');
  };

  const scheduleRefresh = (expiresAt) => {
    if (!expiresAt) return;
    const expiresMs = new Date(expiresAt).getTime();
    const refreshMs = expiresMs - Date.now() - 60 * 1000; // refresh 1 minute before expiry
    const delay = Math.max(refreshMs, 30 * 1000);

    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    refreshTimeout.current = window.setTimeout(async () => {
      try {
        const refreshResult = await refreshSession();
        if (refreshResult?.success && refreshResult.user) {
          setUser(refreshResult.user);
          if (refreshResult.expiresAt) {
            scheduleRefresh(refreshResult.expiresAt);
          }
        }
      } catch (error) {
        console.warn('Session refresh failed:', error);
      }
    }, delay);
  };

  useEffect(() => {
    async function initializeAuth() {
      try {
        const result = await fetchCurrentUser();
        if (result?.success && result.user) {
          setUser(result.user);
          setCurrentRoute('home');
          if (result.expiresAt) {
            scheduleRefresh(result.expiresAt);
          }
          setAuthLoaded(true);
          return;
        }
      } catch (error) {
        console.warn('Unable to restore backend auth session:', error);
      }

      const rememberedEmail = localStorage.getItem('ronkws_remembered_user');
      if (rememberedEmail) {
        const localUser = users.find(
          (u) => u.email.toLowerCase() === rememberedEmail.toLowerCase()
        );
        if (localUser) {
          setUser(localUser);
          setCurrentRoute('home');
          setAuthLoaded(true);
          return;
        }
      }

      setAuthLoaded(true);
    }

    initializeAuth();

    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [users]);

  // Controls triggering the cinematic startup animation after login
  const [playIntroAnimation, setPlayIntroAnimation] = useState(false);
  const [introSoundPlayedOnce, setIntroSoundPlayedOnce] = useState(false);
  const introStartedRef = useRef(false);

  // Active view/route navigation state
  const [currentRoute, setCurrentRoute] = useState(() => {
    return user ? 'home' : 'login';
  });

  // Save users array to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem('ronkws_users', JSON.stringify(users));
  }, [users]);

  const playIntroSound = () => {
    if (introSoundPlayedOnce || introStartedRef.current) return;
    introStartedRef.current = true;
    setIntroSoundPlayedOnce(true);

    try {
      const audio = new Audio('/sounds/the-hunger-games-rues-whistle.mp3');
      audio.volume = 0.85;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          console.warn('Intro audio playback was blocked by the browser.');
        });
      }
    } catch (error) {
      console.warn('Unable to play intro audio:', error);
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Login handler
  const login = (email, password, rememberMe = false) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      showToast('Please enter a valid email address', 'error');
      return { success: false, error: 'Invalid email' };
    }

    const foundUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!foundUser) {
      showToast('Invalid email or password', 'error');
      return { success: false, error: 'Invalid email or password' };
    }

    if (foundUser.password !== password) {
      showToast('Invalid email or password', 'error');
      return { success: false, error: 'Invalid email or password' };
    }

    playIntroSound();
    setUser(foundUser);
    setPlayIntroAnimation(true); // Trigger 4-second logo intro
    if (rememberMe) {
      localStorage.setItem('ronkws_remembered_user', foundUser.email);
    } else {
      localStorage.removeItem('ronkws_remembered_user');
    }
    showToast(`Welcome back, ${foundUser.name}!`, 'success');
    return { success: true };
  };

  // Sign up handler
  const signup = (name, email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === trimmedEmail);

    if (exists) {
      showToast('An account with this email already exists', 'error');
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      password: password,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      memberSince: new Date().getFullYear().toString(),
      bio: 'New Ronkws Streaming Hub Enthusiast'
    };

    playIntroSound();
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    setPlayIntroAnimation(true); // Trigger logo animation
    showToast('Account created successfully!', 'success');
    return { success: true };
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutBackend();
    } catch (error) {
      console.warn('Logout backend failed, clearing local session anyway:', error);
      showToast('Signed out locally. Server logout may have failed.', 'warning');
    } finally {
      setUser(null);
      setPlayIntroAnimation(false);
      setIntroSoundPlayedOnce(false);
      setCurrentRoute('login');
      showToast('Logged out successfully', 'info');
    }
  };

  // Login with Google Backend User
  const loginWithGoogleUser = (serverUser, expiresAt) => {
    if (!serverUser) return;

    const normalizedUser = {
      ...serverUser,
      avatar: serverUser.profile_photo || serverUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(serverUser.name || serverUser.email)}`,
      role: serverUser.role || 'user'
    };

    if (!playIntroAnimation) {
      playIntroSound();
      setPlayIntroAnimation(true);
    }

    setUser(normalizedUser);
    setUsers((prev) => {
      const existingIndex = prev.findIndex(
        (u) => u.id === normalizedUser.id || u.email.toLowerCase() === normalizedUser.email.toLowerCase()
      );
      if (existingIndex !== -1) {
        const nextUsers = prev.map((u) =>
          u.id === normalizedUser.id || u.email.toLowerCase() === normalizedUser.email.toLowerCase()
            ? normalizedUser
            : u
        );
        localStorage.setItem('ronkws_users', JSON.stringify(nextUsers));
        return nextUsers;
      }
      const nextUsers = [...prev, normalizedUser];
      localStorage.setItem('ronkws_users', JSON.stringify(nextUsers));
      return nextUsers;
    });
    if (expiresAt) {
      setTimeout(() => {}, 0); // placeholder; refresh timer will be handled by auth load on update
    }
    setCurrentRoute('home');
  };

  // Profile Update
  const updateProfile = (updatedFields) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    setUsers((prev) => {
      const nextUsers = prev.map((u) => (u.id === user.id ? updatedUser : u));
      localStorage.setItem('ronkws_users', JSON.stringify(nextUsers));
      return nextUsers;
    });
    showToast('Profile updated successfully!', 'success');
  };

  // Change Password
  const changePassword = (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'No active user' };
    if (user.password !== currentPassword) {
      showToast('Current password is incorrect', 'error');
      return { success: false, error: 'Incorrect current password' };
    }
    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);
    setUsers((prev) => {
      const nextUsers = prev.map((u) => (u.id === user.id ? updatedUser : u));
      localStorage.setItem('ronkws_users', JSON.stringify(nextUsers));
      return nextUsers;
    });
    showToast('Password changed successfully!', 'success');
    return { success: true };
  };

  // Admin User Management
  const toggleUserRole = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === 'admin' ? 'user' : 'admin';
          showToast(`Role updated for ${u.name} to ${newRole}`, 'success');
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('User account deleted', 'info');
  };

  const completeIntroAnimation = () => {
    setPlayIntroAnimation(false);
    setCurrentRoute('home');
    introStartedRef.current = false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        preferences,
        authLoaded,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        playIntroAnimation,
        currentRoute,
        setCurrentRoute,
        login,
        signup,
        logout,
        loginWithGoogleUser,
        updateProfile,
        changePassword,
        toggleUserRole,
        deleteUser,
        updatePreference,
        completeIntroAnimation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
