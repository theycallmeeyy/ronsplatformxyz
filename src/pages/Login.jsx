import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchGoogleAuth } from '../utils/api';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function Login() {
  const { login, signup, loginWithGoogleUser, setCurrentRoute, emailPasswordAuthEnabled } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => {
    const rememberedEmail = localStorage.getItem('ronkws_remembered_user') || '';
    if (rememberedEmail.toLowerCase() === 'admin@ronkws.com') {
      localStorage.removeItem('ronkws_remembered_user');
      return '';
    }
    return rememberedEmail;
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => Boolean(
    localStorage.getItem('ronkws_remembered_user') &&
    localStorage.getItem('ronkws_remembered_user').toLowerCase() !== 'admin@ronkws.com'
  ));
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showBrowserHelp, setShowBrowserHelp] = useState(false);

  // Field errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [authError, setAuthError] = useState('');
  const [blockedBanner, setBlockedBanner] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const googleButtonRef = useRef(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const isGoogleConfigured = Boolean(googleClientId);
  const shouldFetchGoogleConfig = !import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isMessengerBrowser = typeof navigator !== 'undefined' &&
    /FBAN|FBAV|Messenger|FB_IAB|Instagram/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

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

  const handleGoogleCredential = useCallback(async (response) => {
    setGoogleError('');
    setGoogleLoading(true);
    if (!response?.credential) {
      setGoogleError('Google login failed to return a valid credential.');
      setGoogleLoading(false);
      return;
    }

    try {
      const result = await fetchGoogleAuth(response.credential);
      if (!result?.success) {
        const blocked = Boolean(result?.error?.toLowerCase().includes('blocked'));
        setBlockedBanner(blocked);
        setGoogleError(result?.error || 'Google authentication failed.');
        setGoogleLoading(false);
        return;
      }
      setBlockedBanner(false);
      loginWithGoogleUser(result.user);
      setGoogleLoading(false);
    } catch (error) {
      setGoogleError('Unable to complete Google login. Please try again.');
      setBlockedBanner(false);
      setGoogleLoading(false);
      console.error(error);
    }
  }, [loginWithGoogleUser]);

  useEffect(() => {
    if (!googleLoaded || !googleClientId || !window.google?.accounts?.id || !googleButtonRef.current) return;

    const button = googleButtonRef.current;
    button.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
      ux_mode: 'popup'
    });
    window.google.accounts.id.renderButton(button, {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      text: mode === 'signup' ? 'signup_with' : 'signin_with',
      shape: 'pill',
      logo_alignment: 'left',
      width: Math.floor(button.getBoundingClientRect().width)
    });
  }, [googleLoaded, googleClientId, handleGoogleCredential, mode]);

  const openInExternalBrowser = () => {
    setShowBrowserHelp(true);
    const externalUrl = new URL(window.location.href);
    externalUrl.searchParams.set('externalAuth', '1');

    if (isAndroid) {
      const intentUrl = `intent://${externalUrl.host}${externalUrl.pathname}${externalUrl.search}#Intent;scheme=${externalUrl.protocol.slice(0, -1)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(externalUrl.href)};end`;
      window.location.href = intentUrl;
      return;
    }

    if (isIOS) {
      const chromeUrl = `googlechrome://navigate?url=${encodeURIComponent(externalUrl.href)}`;
      window.location.href = chromeUrl;
      return;
    }

    window.open(externalUrl.href, '_blank', 'noopener,noreferrer');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setGoogleError('');

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const nErr = validateName(name);

    setEmailError(eErr);
    setPasswordError(pErr);
    setNameError(nErr);

    if (eErr || pErr || (mode === 'signup' && nErr)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = mode === 'login'
        ? await login(email, password, rememberMe)
        : await signup(name, email, password);

      if (!result?.success) {
        setAuthError(result.error || 'Unable to complete authentication.');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setAuthError('Unable to complete authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <button
            type="button"
            onClick={() => setCurrentRoute('home')}
            className="mb-5 inline-flex self-start items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-purple-400/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300"
          >
            <ArrowLeft size={14} /> Back to browsing
          </button>

          {/* Logo Badge */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#08090b] shadow-[0_0_24px_rgba(0,0,0,0.5)]">
              <img src="/logo/ronkws-glass-mark.svg" alt="" className="h-14 w-12 object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Ronkws Streaming Hub
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              {!emailPasswordAuthEnabled
                ? 'Sign in or create your account securely with Google.'
                : mode === 'login'
                ? 'Welcome back. Sign in to your account.'
                : 'Create an account to get started.'}
            </p>
          </div>

          {blockedBanner && (
            <div className="w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 mb-4 text-left text-sm text-rose-100">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl">block</span>
                <div>
                  <p className="font-semibold">Blocked Account</p>
                  <p className="text-xs text-rose-200 mt-1">
                    Your account has been blocked by an administrator. If you believe this is a mistake, contact support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {authError && !blockedBanner && (
            <div className="w-full rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4 text-left text-sm text-yellow-100">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {!emailPasswordAuthEnabled && (
              <div className="w-full rounded-2xl border border-purple-400/20 bg-purple-500/[0.08] p-4 text-left">
                <p className="text-sm font-semibold text-purple-100">Use Google to continue</p>
                <p className="mt-1 text-xs leading-5 text-zinc-300">
                  Email and password sign-in isn’t configured for this app. Your first Google sign-in creates your account. Admin access is limited to the authorized Google account.
                </p>
              </div>
            )}

            {emailPasswordAuthEnabled && (
              <>
            {/* Full Name Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <div className={`input-glass rounded-[24px] flex items-center px-4 py-3 ${nameError ? 'border-rose-500' : ''}`}>
                  <span className="material-symbols-outlined text-zinc-400 mr-3 text-[20px]">person</span>
                  <input
                    type="text"
                    autoComplete="name"
                    required={mode === 'signup'}
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
                  autoComplete="email"
                  required
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
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
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
              <span>Remember email</span>
            </label>
              </>
            )}

            {emailPasswordAuthEnabled && (
              <div className="flex items-center gap-2 py-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] text-zinc-400 uppercase tracking-[0.2em]">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            )}

            {isMessengerBrowser ? (
              <button
                type="button"
                onClick={openInExternalBrowser}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[24px] bg-white px-5 text-sm font-bold text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition hover:bg-zinc-100 active:scale-[0.98]"
              >
                <ExternalLink size={17} />
                Open sign-in in your browser
              </button>
            ) : isGoogleConfigured ? (
              <div className="relative min-h-11 w-full" ref={googleButtonRef} />
            ) : (
              <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                Google sign-in is unavailable because the Google Client ID isn’t configured.
              </div>
            )}
            {isMessengerBrowser && (
              <p className="text-center text-xs leading-5 text-zinc-400">
                Messenger blocks Google sign-in inside its built-in browser. This opens the same page in your browser—no copying or pasting.
              </p>
            )}
            {showBrowserHelp && (isIOS || isAndroid) && (
              <p role="status" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-zinc-300">
                If Chrome didn’t open, tap the <strong>•••</strong> menu in Messenger and choose <strong>Open in external browser</strong>. Then tap Continue with Google.
              </p>
            )}
            {googleLoading && <p role="status" className="text-center text-xs text-zinc-400">Signing you in…</p>}
            {googleError && <p role="alert" className="text-xs text-rose-400 mt-2">{googleError}</p>}
            {/* Submit Button */}
            {emailPasswordAuthEnabled && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-[24px] bg-purple-600 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all duration-300 hover:bg-purple-500 hover:shadow-[0_6px_28px_rgba(124,58,237,0.6)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create Account'}
              </button>
            )}
          </form>

          {/* Mode Switcher Link */}
          {emailPasswordAuthEnabled && <div className="mt-6 w-full text-center">
            <p className="text-xs text-zinc-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setPassword('');
                  setEmailError('');
                  setPasswordError('');
                  setNameError('');
                  setAuthError('');
                  setGoogleError('');
                }}
                className="text-purple-300 font-semibold hover:text-purple-200 transition-colors ml-1"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>}

        </div>
      </main>
    </div>
  );
}
