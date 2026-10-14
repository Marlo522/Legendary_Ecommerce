import { useState, useEffect } from 'react';
import authImage from '../assets/auth-editorial.jpg';

/**
 * AuthModal — High-fashion streetwear split-screen authentication interface.
 * Implements Design.md tokens, editorial aesthetics, and smooth transitions
 * between Login, Registration, and Password Recovery.
 *
 * Fields supported:
 * - Login: Email, Password, Remember Me, Forgot Password trigger
 * - Register: First Name, Middle Name, Last Name, Email, Password, Confirm Password, Terms agreement
 * - Forgot Password: Email with instant feedback
 */
export default function AuthModal({
  isOpen = false,
  onClose = () => {},
  initialMode = 'login',
  onAuthSuccess = () => {},
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [forgotForm, setForgotForm] = useState({
    email: '',
  });

  // Password visibility toggles
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegisterPass, setShowRegisterPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Form field errors
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [forgotErrors, setForgotErrors] = useState({});

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'NONE', color: 'bg-brand-line' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 1, label: 'WEAK', color: 'bg-brand-danger' };
    if (score === 2) return { score: 2, label: 'MODERATE', color: 'bg-brand-gray' };
    return { score: 3, label: 'STRONG', color: 'bg-brand-success' };
  };

  const strength = getPasswordStrength(registerForm.password);

  // Validation helpers
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);
    const errors = {};

    if (!loginForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(loginForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginForm.password) {
      errors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage('Welcome back! Successfully logged into Legendary.');
        onAuthSuccess({
          email: loginForm.email,
          name: loginForm.email.split('@')[0],
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      }, 1000);
    }
  };

  // Register submission
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);
    const errors = {};

    if (!registerForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!registerForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!registerForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!isValidEmail(registerForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!registerForm.password) {
      errors.password = 'Password is required';
    } else if (registerForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required';
    } else if (registerForm.confirmPassword !== registerForm.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!registerForm.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms to create an account';
    }

    setRegisterErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(
          `Welcome to the collective, ${registerForm.firstName}! Your account has been created.`
        );
        onAuthSuccess({
          email: registerForm.email,
          name: `${registerForm.firstName} ${registerForm.lastName}`,
        });
        setTimeout(() => {
          onClose();
        }, 1400);
      }, 1000);
    }
  };

  // Forgot password submission
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);
    const errors = {};

    if (!forgotForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!isValidEmail(forgotForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setForgotErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(
          `Recovery instructions have been dispatched to ${forgotForm.email}. Check your inbox.`
        );
      }, 800);
    }
  };

  const switchMode = (newMode) => {
    setGeneralError(null);
    setSuccessMessage(null);
    setLoginErrors({});
    setRegisterErrors({});
    setForgotErrors({});
    setMode(newMode);
  };

  return (
    <div
      id="auth-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-brand-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target.id === 'auth-modal-backdrop') onClose();
      }}
    >
      <div
        id="auth-modal-container"
        className="w-full max-w-5xl bg-brand-white border border-brand-line shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Announcement Stripe */}
        <div className="bg-brand-black text-brand-white px-4 py-1.5 text-center text-[0.625rem] font-medium tracking-[0.18em] uppercase flex items-center justify-between">
          <span className="opacity-70 hidden sm:inline">AUTHENTICATION GATEWAY // SECURE</span>
          <span className="mx-auto sm:mx-0">MEMBER ACCESS • EARLY DROPS &amp; OUTFIT ARCHIVE</span>
          <span className="opacity-70 hidden sm:inline">VER. 2026</span>
        </div>

        {/* Modal Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* ====================================================
              LEFT SIDE: High-Fashion Streetwear Editorial Visual
             ==================================================== */}
          <div className="hidden lg:flex lg:col-span-5 relative bg-brand-black overflow-hidden flex-col justify-between p-8 text-brand-white border-r border-brand-line select-none">
            {/* Background Image with Streetwear Editorial Mood */}
            <img
              src={authImage}
              alt="Legendary Streetwear Lookbook"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-55 mix-blend-luminosity scale-105 transition-all duration-700 ease-out"
            />

            {/* Editorial Contrast Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-brand-black/25 pointer-events-none" />
            <div className="absolute inset-0 border border-white/10 m-3 pointer-events-none" />

            {/* Top Brand Block */}
            <div className="relative z-10">
              <div className="editorial-caption text-white/70 tracking-[0.2em] mb-1">
                {mode === 'login'
                  ? 'DROP 01 // MEMBER ACCESS'
                  : mode === 'register'
                  ? 'COMMUNITY // NEW INITIATION'
                  : 'ACCOUNT ASSISTANCE // RESET'}
              </div>
              <h2 className="font-display text-4xl tracking-wider text-brand-white">
                LEGENDARY
              </h2>
            </div>

            {/* Dynamic Center Editorial Content */}
            <div className="relative z-10 my-auto py-8">
              <div className="inline-block px-2.5 py-1 bg-white/10 backdrop-blur-sm text-[0.5625rem] tracking-[0.2em] font-medium uppercase mb-4 border border-white/20">
                {mode === 'login'
                  ? 'STATUS: SIGN IN REQUIRED'
                  : mode === 'register'
                  ? 'STATUS: REGISTRATION OPEN'
                  : 'STATUS: RECOVERY MODE'}
              </div>

              <h3 className="text-2xl sm:text-3xl font-light tracking-tight leading-tight mb-3">
                {mode === 'login' && 'Wear your everyday legend.'}
                {mode === 'register' && 'Define your own aesthetic.'}
                {mode === 'forgot' && 'Seamless recovery.'}
              </h3>

              <p className="text-xs text-white/70 leading-relaxed font-light max-w-xs">
                {mode === 'login' &&
                  'Log in to synchronize your curated wishlist, saved outfit builds, and expedited checkout.'}
                {mode === 'register' &&
                  'Create an account to unlock exclusive seasonal drops, members-only perks, and outfit builder profiles.'}
                {mode === 'forgot' &&
                  'Enter your registered email address to receive immediate credentials reset instructions.'}
              </p>

              {/* Streetwear Badges */}
              <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 gap-3 text-[0.625rem] tracking-wider uppercase text-white/60">
                <div>
                  <span className="block text-white font-medium">01 // DROPS</span>
                  <span>Priority access</span>
                </div>
                <div>
                  <span className="block text-white font-medium">02 // ARCHIVE</span>
                  <span>Saved look builds</span>
                </div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[0.5625rem] text-white/50 tracking-widest uppercase">
              <span>MANILA / TOKYO / NYC</span>
              <span>© 2026 LEGENDARY</span>
            </div>
          </div>

          {/* ====================================================
              RIGHT SIDE: Interactive Forms with Smooth Transitions
             ==================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-brand-white p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-[calc(92vh-32px)]">
            {/* Header & Close Button Row */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-line">
                <div>
                  <div className="editorial-caption">
                    AUTHENTICATION // {mode.toUpperCase()}
                  </div>
                  <h1
                    id="auth-modal-title"
                    className="font-display text-2xl sm:text-3xl tracking-[0.04em] uppercase text-brand-black"
                  >
                    {mode === 'login' && 'MEMBER SIGN IN'}
                    {mode === 'register' && 'CREATE AN ACCOUNT'}
                    {mode === 'forgot' && 'RESET PASSWORD'}
                  </h1>
                </div>

                {/* Close Button */}
                <button
                  id="auth-modal-close-btn"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 text-brand-black hover:text-brand-gray transition-colors border border-brand-line hover:border-brand-black"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Segmented Mode Switcher (Tab Transitions) */}
              {mode !== 'forgot' && (
                <div className="mt-5 mb-6">
                  <div
                    role="tablist"
                    aria-label="Authentication modes"
                    className="grid grid-cols-2 p-1 bg-brand-paper border border-brand-line relative"
                  >
                    {/* Sliding Pill Indicator */}
                    <div
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-black transition-transform duration-300 ease-in-out ${
                        mode === 'login' ? 'translate-x-0' : 'translate-x-full'
                      }`}
                    />

                    <button
                      id="tab-sign-in"
                      role="tab"
                      aria-selected={mode === 'login'}
                      aria-controls="panel-login"
                      onClick={() => switchMode('login')}
                      className={`relative z-10 py-2.5 text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-200 text-center ${
                        mode === 'login'
                          ? 'text-brand-white font-semibold'
                          : 'text-brand-gray hover:text-brand-black'
                      }`}
                    >
                      SIGN IN
                    </button>
                    <button
                      id="tab-register"
                      role="tab"
                      aria-selected={mode === 'register'}
                      aria-controls="panel-register"
                      onClick={() => switchMode('register')}
                      className={`relative z-10 py-2.5 text-xs font-medium tracking-[0.14em] uppercase transition-colors duration-200 text-center ${
                        mode === 'register'
                          ? 'text-brand-white font-semibold'
                          : 'text-brand-gray hover:text-brand-black'
                      }`}
                    >
                      REGISTER
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback Alerts (Success & Error notifications) */}
              {successMessage && (
                <div
                  id="auth-success-banner"
                  role="status"
                  className="mb-5 p-3.5 bg-brand-paper border-l-2 border-brand-success text-brand-black text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <svg
                    className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              {generalError && (
                <div
                  id="auth-error-banner"
                  role="alert"
                  className="mb-5 p-3.5 bg-brand-paper border-l-2 border-brand-danger text-brand-danger text-xs flex items-start gap-2.5 animate-fadeIn"
                >
                  <svg
                    className="w-4 h-4 text-brand-danger flex-shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{generalError}</span>
                </div>
              )}

              {/* ====================================================
                  TRANSITION SLIDER WRAPPER (Login <-> Register)
                 ==================================================== */}
              <div className="relative overflow-hidden w-full">
                {mode === 'forgot' ? (
                  /* ================= FORGOT PASSWORD PANEL ================= */
                  <div
                    id="panel-forgot"
                    className="w-full animate-fadeIn transition-opacity duration-300"
                  >
                    <div className="mb-4">
                      <p className="text-xs text-brand-gray leading-relaxed">
                        Enter the email address tied to your Legendary account.
                        We will send a secure link to reset your password.
                      </p>
                    </div>

                    <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                      <div>
                        <label
                          htmlFor="forgot-email"
                          className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1.5"
                        >
                          Email Address *
                        </label>
                        <input
                          id="forgot-email"
                          type="email"
                          autoComplete="email"
                          value={forgotForm.email}
                          onChange={(e) =>
                            setForgotForm({ ...forgotForm, email: e.target.value })
                          }
                          placeholder="name@example.com"
                          className={`w-full h-11 px-3.5 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                            forgotErrors.email
                              ? 'border-brand-danger'
                              : 'border-brand-line focus:border-brand-black'
                          }`}
                        />
                        {forgotErrors.email && (
                          <p className="text-xs text-brand-danger mt-1">
                            {forgotErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex flex-col gap-3">
                        <button
                          type="submit"
                          id="forgot-submit-btn"
                          disabled={isLoading}
                          className="w-full h-11 bg-brand-black text-brand-white text-xs font-medium tracking-[0.16em] uppercase hover:bg-brand-gray transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-brand-white"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                              <span>SENDING INSTRUCTIONS...</span>
                            </>
                          ) : (
                            'SEND RESET INSTRUCTIONS'
                          )}
                        </button>

                        <button
                          type="button"
                          id="forgot-back-to-login"
                          onClick={() => switchMode('login')}
                          className="w-full h-11 bg-brand-paper border border-brand-line text-brand-black text-xs font-medium tracking-[0.12em] uppercase hover:border-brand-black transition-colors"
                        >
                          ← BACK TO SIGN IN
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* ================= LOGIN & REGISTER SLIDER ================= */
                  <div
                    className="flex w-[200%] transition-transform duration-500 ease-in-out"
                    style={{
                      transform:
                        mode === 'login' ? 'translateX(0%)' : 'translateX(-50%)',
                    }}
                  >
                    {/* -------------------- 1. LOGIN FORM PANEL -------------------- */}
                    <div
                      id="panel-login"
                      role="tabpanel"
                      aria-labelledby="tab-sign-in"
                      className="w-1/2 pr-3 sm:pr-4"
                    >
                      <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                        {/* Email */}
                        <div>
                          <label
                            htmlFor="login-email"
                            className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1.5"
                          >
                            Email Address *
                          </label>
                          <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, email: e.target.value })
                            }
                            placeholder="name@example.com"
                            className={`w-full h-11 px-3.5 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                              loginErrors.email
                                ? 'border-brand-danger'
                                : 'border-brand-line focus:border-brand-black'
                            }`}
                          />
                          {loginErrors.email && (
                            <p className="text-xs text-brand-danger mt-1">
                              {loginErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Password */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor="login-password"
                              className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black"
                            >
                              Password *
                            </label>
                            <button
                              type="button"
                              id="login-forgot-password-link"
                              onClick={() => switchMode('forgot')}
                              className="text-[0.6875rem] tracking-[0.05em] uppercase text-brand-gray hover:text-brand-black underline underline-offset-2 transition-colors"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              id="login-password"
                              type={showLoginPass ? 'text' : 'password'}
                              autoComplete="current-password"
                              value={loginForm.password}
                              onChange={(e) =>
                                setLoginForm({ ...loginForm, password: e.target.value })
                              }
                              placeholder="••••••••"
                              className={`w-full h-11 pl-3.5 pr-11 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                                loginErrors.password
                                  ? 'border-brand-danger'
                                  : 'border-brand-line focus:border-brand-black'
                              }`}
                            />
                            <button
                              type="button"
                              aria-label={
                                showLoginPass ? 'Hide password' : 'Show password'
                              }
                              onClick={() => setShowLoginPass(!showLoginPass)}
                              className="absolute right-0 top-0 h-11 px-3 text-brand-gray hover:text-brand-black transition-colors"
                            >
                              {showLoginPass ? (
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                              ) : (
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {loginErrors.password && (
                            <p className="text-xs text-brand-danger mt-1">
                              {loginErrors.password}
                            </p>
                          )}
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            id="login-remember-me"
                            type="checkbox"
                            checked={loginForm.rememberMe}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                rememberMe: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded-none border-brand-line text-brand-black focus:ring-0 cursor-pointer accent-brand-black"
                          />
                          <label
                            htmlFor="login-remember-me"
                            className="text-xs text-brand-gray select-none cursor-pointer hover:text-brand-black transition-colors"
                          >
                            Keep me signed in on this device
                          </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            id="login-submit-btn"
                            disabled={isLoading}
                            className="w-full h-12 bg-brand-black text-brand-white text-xs font-medium tracking-[0.16em] uppercase hover:bg-brand-gray transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            {isLoading ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4 text-brand-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  />
                                </svg>
                                <span>SIGNING IN...</span>
                              </>
                            ) : (
                              <>
                                <span>SIGN IN</span>
                                <span className="group-hover:translate-x-1 transition-transform">
                                  →
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Divider */}
                        <div className="relative py-2 flex items-center justify-center">
                          <div className="w-full border-t border-brand-line" />
                          <span className="absolute bg-brand-white px-3 text-[0.625rem] tracking-[0.18em] uppercase text-brand-gray">
                            OR QUICK ACCESS
                          </span>
                        </div>

                        {/* Social Buttons (Monochrome streetwear styling) */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsLoading(true);
                              setTimeout(() => {
                                setIsLoading(false);
                                setSuccessMessage('Signed in via Google.');
                                setTimeout(onClose, 1200);
                              }, 800);
                            }}
                            className="h-10 border border-brand-line hover:border-brand-black text-xs font-medium tracking-[0.08em] uppercase flex items-center justify-center gap-2 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M12.24 10.285V7.4h6.887C19.3 8.35 19.5 9.4 19.5 10.5c0 5.8-3.9 9.9-9.5 9.9-5.52 0-10-4.48-10-10s4.48-10 10-10c2.7 0 4.96.99 6.69 2.61l-2.71 2.61C12.98 4.67 11.66 4.2 10 4.2c-3.2 0-5.8 2.6-5.8 5.8s2.6 5.8 5.8 5.8c3.08 0 5.16-1.78 5.48-4.315H12.24z"
                              />
                            </svg>
                            <span>GOOGLE</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsLoading(true);
                              setTimeout(() => {
                                setIsLoading(false);
                                setSuccessMessage('Signed in via Apple.');
                                setTimeout(onClose, 1200);
                              }, 800);
                            }}
                            className="h-10 border border-brand-line hover:border-brand-black text-xs font-medium tracking-[0.08em] uppercase flex items-center justify-center gap-2 transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.79 1.09-1.89.97-2.99-1 .04-2.18.66-2.88 1.47-.62.71-1.16 1.83-1.01 2.91 1.12.09 2.27-.57 2.92-1.39z"
                              />
                            </svg>
                            <span>APPLE</span>
                          </button>
                        </div>

                        {/* Switch to Register link */}
                        <div className="pt-2 text-center text-xs text-brand-gray">
                          Don&apos;t have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('register')}
                            className="font-semibold text-brand-black hover:underline uppercase tracking-wider ml-1"
                          >
                            Create one now →
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* -------------------- 2. REGISTER FORM PANEL -------------------- */}
                    <div
                      id="panel-register"
                      role="tabpanel"
                      aria-labelledby="tab-register"
                      className="w-1/2 pl-3 sm:pl-4"
                    >
                      <form
                        onSubmit={handleRegisterSubmit}
                        noValidate
                        className="space-y-3.5"
                      >
                        {/* Name Fields Grid: First Name & Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="register-firstname"
                              className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1"
                            >
                              First Name *
                            </label>
                            <input
                              id="register-firstname"
                              type="text"
                              autoComplete="given-name"
                              value={registerForm.firstName}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  firstName: e.target.value,
                                })
                              }
                              placeholder="Alex"
                              className={`w-full h-10 px-3 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                                registerErrors.firstName
                                  ? 'border-brand-danger'
                                  : 'border-brand-line focus:border-brand-black'
                              }`}
                            />
                            {registerErrors.firstName && (
                              <p className="text-[0.6875rem] text-brand-danger mt-0.5">
                                {registerErrors.firstName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="register-lastname"
                              className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1"
                            >
                              Last Name *
                            </label>
                            <input
                              id="register-lastname"
                              type="text"
                              autoComplete="family-name"
                              value={registerForm.lastName}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  lastName: e.target.value,
                                })
                              }
                              placeholder="Rivera"
                              className={`w-full h-10 px-3 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                                registerErrors.lastName
                                  ? 'border-brand-danger'
                                  : 'border-brand-line focus:border-brand-black'
                              }`}
                            />
                            {registerErrors.lastName && (
                              <p className="text-[0.6875rem] text-brand-danger mt-0.5">
                                {registerErrors.lastName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Middle Name */}
                        <div>
                          <label
                            htmlFor="register-middlename"
                            className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1"
                          >
                            Middle Name{' '}
                            <span className="text-brand-gray font-normal">(Optional)</span>
                          </label>
                          <input
                            id="register-middlename"
                            type="text"
                            autoComplete="additional-name"
                            value={registerForm.middleName}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                middleName: e.target.value,
                              })
                            }
                            placeholder="Cruz"
                            className="w-full h-10 px-3 text-sm bg-brand-white border border-brand-line focus:border-brand-black transition-colors focus:outline-none placeholder:text-brand-gray/50"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            htmlFor="register-email"
                            className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1"
                          >
                            Email Address *
                          </label>
                          <input
                            id="register-email"
                            type="email"
                            autoComplete="email"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                email: e.target.value,
                              })
                            }
                            placeholder="name@example.com"
                            className={`w-full h-10 px-3 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                              registerErrors.email
                                ? 'border-brand-danger'
                                : 'border-brand-line focus:border-brand-black'
                            }`}
                          />
                          {registerErrors.email && (
                            <p className="text-[0.6875rem] text-brand-danger mt-0.5">
                              {registerErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Password & Confirm Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Password */}
                          <div>
                            <label
                              htmlFor="register-password"
                              className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1"
                            >
                              Password *
                            </label>
                            <div className="relative">
                              <input
                                id="register-password"
                                type={showRegisterPass ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={registerForm.password}
                                onChange={(e) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    password: e.target.value,
                                  })
                                }
                                placeholder="Min. 8 chars"
                                className={`w-full h-10 pl-3 pr-10 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                                  registerErrors.password
                                    ? 'border-brand-danger'
                                    : 'border-brand-line focus:border-brand-black'
                                }`}
                              />
                              <button
                                type="button"
                                aria-label={
                                  showRegisterPass ? 'Hide password' : 'Show password'
                                }
                                onClick={() => setShowRegisterPass(!showRegisterPass)}
                                className="absolute right-0 top-0 h-10 px-2.5 text-brand-gray hover:text-brand-black transition-colors"
                              >
                                {showRegisterPass ? (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  >
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            {registerErrors.password && (
                              <p className="text-[0.6875rem] text-brand-danger mt-0.5">
                                {registerErrors.password}
                              </p>
                            )}
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label
                              htmlFor="register-confirmpassword"
                              className="block text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-brand-black mb-1"
                            >
                              Confirm Password *
                            </label>
                            <div className="relative">
                              <input
                                id="register-confirmpassword"
                                type={showConfirmPass ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={registerForm.confirmPassword}
                                onChange={(e) =>
                                  setRegisterForm({
                                    ...registerForm,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                placeholder="Re-enter password"
                                className={`w-full h-10 pl-3 pr-10 text-sm bg-brand-white border transition-colors focus:outline-none placeholder:text-brand-gray/50 ${
                                  registerErrors.confirmPassword
                                    ? 'border-brand-danger'
                                    : 'border-brand-line focus:border-brand-black'
                                }`}
                              />
                              <button
                                type="button"
                                aria-label={
                                  showConfirmPass ? 'Hide password' : 'Show password'
                                }
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute right-0 top-0 h-10 px-2.5 text-brand-gray hover:text-brand-black transition-colors"
                              >
                                {showConfirmPass ? (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  >
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            {registerErrors.confirmPassword && (
                              <p className="text-[0.6875rem] text-brand-danger mt-0.5">
                                {registerErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {registerForm.password && (
                          <div className="bg-brand-paper p-2 border border-brand-line flex items-center justify-between text-[0.625rem]">
                            <span className="text-brand-gray uppercase tracking-wider">
                              SECURITY: {strength.label}
                            </span>
                            <div className="flex gap-1">
                              <span
                                className={`w-6 h-1 ${
                                  strength.score >= 1 ? strength.color : 'bg-brand-line'
                                }`}
                              />
                              <span
                                className={`w-6 h-1 ${
                                  strength.score >= 2 ? strength.color : 'bg-brand-line'
                                }`}
                              />
                              <span
                                className={`w-6 h-1 ${
                                  strength.score >= 3 ? strength.color : 'bg-brand-line'
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Terms Checkbox */}
                        <div className="pt-1">
                          <div className="flex items-start gap-2">
                            <input
                              id="register-terms"
                              type="checkbox"
                              checked={registerForm.acceptTerms}
                              onChange={(e) =>
                                setRegisterForm({
                                  ...registerForm,
                                  acceptTerms: e.target.checked,
                                })
                              }
                              className="mt-0.5 w-4 h-4 rounded-none border-brand-line text-brand-black focus:ring-0 cursor-pointer accent-brand-black flex-shrink-0"
                            />
                            <label
                              htmlFor="register-terms"
                              className="text-[0.6875rem] text-brand-gray leading-normal select-none cursor-pointer"
                            >
                              I agree to Legendary&apos;s{' '}
                              <a
                                href="#"
                                className="text-brand-black underline underline-offset-2"
                              >
                                Terms of Service
                              </a>{' '}
                              and{' '}
                              <a
                                href="#"
                                className="text-brand-black underline underline-offset-2"
                              >
                                Privacy Policy
                              </a>
                              .
                            </label>
                          </div>
                          {registerErrors.acceptTerms && (
                            <p className="text-[0.6875rem] text-brand-danger mt-0.5">
                              {registerErrors.acceptTerms}
                            </p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            id="register-submit-btn"
                            disabled={isLoading}
                            className="w-full h-12 bg-brand-black text-brand-white text-xs font-medium tracking-[0.16em] uppercase hover:bg-brand-gray transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            {isLoading ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4 text-brand-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  />
                                </svg>
                                <span>CREATING ACCOUNT...</span>
                              </>
                            ) : (
                              <>
                                <span>CREATE ACCOUNT</span>
                                <span className="group-hover:translate-x-1 transition-transform">
                                  →
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Switch to Sign In link */}
                        <div className="pt-2 text-center text-xs text-brand-gray">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchMode('login')}
                            className="font-semibold text-brand-black hover:underline uppercase tracking-wider ml-1"
                          >
                            Sign in here →
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="pt-4 mt-6 border-t border-brand-line flex items-center justify-between text-[0.625rem] text-brand-gray tracking-wider uppercase">
              <span className="flex items-center gap-1.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                256-BIT ENCRYPTED CONNECTION
              </span>
              <span>GUEST CHECKOUT SUPPORTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
