import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchGoogleAuth } from '../utils/api';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20454C17.64 8.56364 17.5791 7.93182 17.4609 7.31818H9V10.6818H13.8436C13.6618 11.8182 12.9818 12.7618 12.0182 13.3455V15.7455H14.9636C16.7064 14.2327 17.64 11.9391 17.64 9.20454Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4555 17.1473 14.9636 15.7455L12.0182 13.3455C11.2409 13.8636 10.24 14.1636 9 14.1636C6.64818 14.1636 4.67818 12.6545 4.11818 10.4818H1.10909V12.9455C2.61091 15.9973 5.57455 18 9 18Z" fill="#34A853"/>
    <path d="M4.11818 10.4818C3.95455 9.86364 3.86364 9.20454 3.86364 8.51818C3.86364 7.83182 3.95455 7.17273 4.11818 6.55455V4.09091H1.10909C0.401818 5.45909 0 6.96727 0 8.51818C0 10.0691 0.401818 11.5773 1.10909 12.9455L4.11818 10.4818Z" fill="#FBBC05"/>
    <path d="M9 3.81818C10.3027 3.81818 11.4573 4.34091 12.3045 5.22273L15.0064 2.52091C13.4564 1.05455 11.4309 0 9 0C5.57455 0 2.61091 2.00273 1.10909 4.09091L4.11818 6.55455C4.67818 4.38182 6.64818 2.87273 9 2.87273V3.81818Z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const { login, signup, loginWithGoogleUser } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('ronkws_remembered_user') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('ronkws_remembered_user')));
  const [showPassword, setShowPassword] = useState(false);

  // Field errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const isGoogleConfigured = Boolean(googleClientId);
  const shouldFetchGoogleConfig = !import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!shouldFetchGoogleConfig) return;

    const fetchConfig = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/config`);
        const data = await response.json();
        if (data?.success && data?.config?.googleClientId) {
          setGoogleClientId(data.config.googleClientId);
        } else {
          setGoogleError('Google sign-in is not configured yet on the backend.');
        }
      } catch (error) {
        console.error('Failed to load Google config:', error);
        setGoogleError('Unable to load Google configuration from the server.');
      }
    };

    fetchConfig();
  }, [apiBaseUrl, shouldFetchGoogleConfig]);

  useEffect(() => {
    const scriptId = 'google-identity-script';
    if (document.getElementById(scriptId)) {
      setGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = scriptId;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => setGoogleError('Unable to load Google sign-in library.');
    document.body.appendChild(script);
  }, []);

  const handleGoogleCredential = async (response) => {
    if (!response?.credential) {
      setGoogleError('Google login failed to return a valid credential.');
      setGoogleLoading(false);
      return;
    }

    try {
      const result = await fetchGoogleAuth(response.credential);
      if (!result?.success) {
        setGoogleError(result?.error || 'Google authentication failed.');
        setGoogleLoading(false);
        return;
      }
      loginWithGoogleUser(result.user);
      setGoogleLoading(false);
    } catch (error) {
      setGoogleError('Unable to complete Google login. Please try again.');
      setGoogleLoading(false);
      console.error(error);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleError('');
    if (!googleLoaded || !window.google?.accounts?.id) {
      setGoogleError('Google sign-in is not ready yet. Please try again in a moment.');
      return;
    }

    if (!googleClientId) {
      setGoogleError('Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to .env and restart the dev server.');
      return;
    }

    setGoogleLoading(true);
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
      ux_mode: 'popup'
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleError('Google authentication prompt was canceled or blocked.');
        setGoogleLoading(false);
      }
    });
  };

  // Validate Email regex
  const validateEmail = (val) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) return 'Email is required';
    if (!regex.test(val)) return 'Please enter a valid email address';
    return '';
  };

  // Validate Password
  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  // Validate Name for signup
  const validateName = (val) => {
    if (mode === 'signup' && !val.trim()) return 'Full name is required';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const nErr = validateName(name);

    setEmailError(eErr);
    setPasswordError(pErr);
    setNameError(nErr);

    if (eErr || pErr || (mode === 'signup' && nErr)) {
      return;
    }

    if (mode === 'login') {
      login(email, password, rememberMe);
    } else {
      signup(name, email, password);
    }
  };

  return (
    <div className="bg-[#14121d] text-white min-h-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-purple-600 selection:text-white px-4 py-12">
      {/* Ambient background glows */}
      <div className="glow-bg-1" />
      <div className="glow-bg-2" />

      {/* Main Login Box */}
      <main className="w-full max-w-md z-10 relative">
        <div className="bg-[#181622]/85 backdrop-blur-xl border border-white/10 rounded-[28px] p-8 shadow-[0px_8px_32px_rgba(124,58,237,0.2)] flex flex-col items-center">
          
          {/* Logo Badge */}
          <div className="mb-6 flex flex-col items-center">
            <div className="h-20 w-20 bg-gradient-to-tr from-purple-700 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(124,58,237,0.5)] mb-3">
              <span className="font-black text-white text-4xl tracking-wider">R</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Ronkws Streaming Hub
            </h1>
          </div>

          {/* Subtitle */}
          <div className="text-center mb-6 w-full">
            <h2 className="text-xl font-bold text-white mb-1">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-zinc-400">
              {mode === 'login'
                ? 'Your streaming everything starts here.'
                : 'Join thousands enjoying unlimited entertainment.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Full Name Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <div className={`input-glass rounded-[24px] flex items-center px-4 py-3 ${nameError ? 'border-rose-500' : ''}`}>
                  <span className="material-symbols-outlined text-zinc-400 mr-3 text-[20px]">person</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError('');
                    }}
                    placeholder="Full name"
                    className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-zinc-500"
                  />
                </div>
                {nameError && <p className="text-xs text-rose-400 mt-1 pl-4">{nameError}</p>}
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className={`input-glass rounded-[24px] flex items-center px-4 py-3 ${emailError ? 'border-rose-500' : ''}`}>
                <span className="material-symbols-outlined text-zinc-400 mr-3 text-[20px]">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="Email address"
                  className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-zinc-500"
                />
              </div>
              {emailError && <p className="text-xs text-rose-400 mt-1 pl-4">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className={`input-glass rounded-[24px] flex items-center px-4 py-3 ${passwordError ? 'border-rose-500' : ''}`}>
                <span className="material-symbols-outlined text-zinc-400 mr-3 text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Password"
                  className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-purple-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {passwordError && <p className="text-xs text-rose-400 mt-1 pl-4">{passwordError}</p>}
            </div>

            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-[#181622] text-purple-500 focus:ring-purple-500"
              />
              <span>Remember me</span>
            </label>

            <div className="flex items-center gap-2 py-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] text-zinc-400 uppercase tracking-[0.2em]">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || !isGoogleConfigured}
              className={`w-full bg-[#2f1b66] ${isGoogleConfigured ? 'hover:bg-[#4b32a4] shadow-[0_4px_20px_rgba(79,63,218,0.35)] hover:shadow-[0_6px_28px_rgba(79,63,218,0.45)]' : 'opacity-60 cursor-not-allowed'} text-white font-bold text-sm rounded-[24px] py-3.5 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3`}
            >
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <GoogleIcon />
              </span>
              {googleLoading
                ? 'Signing in...'
                : isGoogleConfigured
                ? 'Continue with Google'
                : 'Google sign-in unavailable'}
            </button>
            {googleError && <p className="text-xs text-rose-400 mt-2">{googleError}</p>}
            {!isGoogleConfigured && (
              <div className="flex items-start gap-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 mt-3 text-[13px] text-yellow-200">
                <span className="material-symbols-outlined text-yellow-300 mt-0.5">warning</span>
                <div>
                  <p className="font-semibold text-yellow-100">Google sign-in is currently disabled.</p>
                  <p>
                    Add both <code className="text-[11px] text-yellow-200">VITE_GOOGLE_CLIENT_ID</code> and <code className="text-[11px] text-yellow-200">GOOGLE_CLIENT_ID</code> to your <code className="text-[11px] text-zinc-200">.env</code> file and restart the dev server.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-[24px] py-3.5 transition-all duration-300 shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.6)] active:scale-[0.98] mt-2"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Mode Switcher Link */}
          <div className="mt-6 w-full text-center">
            <p className="text-xs text-zinc-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setEmailError('');
                  setPasswordError('');
                  setNameError('');
                }}
                className="text-purple-300 font-semibold hover:text-purple-200 transition-colors ml-1"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
