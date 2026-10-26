import { useEffect, useRef, useState } from 'react';
import authImage from '../assets/auth-editorial.jpg';
import BrandLogo from './BrandLogo';

export default function AuthModal({ isOpen = false, onClose, onLogin, onAuthSuccess, initialMode = 'login' }) {
  const dialog = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = dialog.current?.querySelector('input, button');
    first?.focus();
    function handleKey(event) {
      if (event.key === 'Escape' && !pending) onClose();
      if (event.key !== 'Tab') return;
      const elements = dialog.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href]');
      if (!elements?.length) return;
      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault(); lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault(); firstElement.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [isOpen, onClose, pending]);

  if (!isOpen) return null;

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.password) nextErrors.password = 'Enter your password.';
    setErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length) return;
    setPending(true);
    try {
      const user = await onLogin({ ...form, email: form.email.trim() });
      setForm(current => ({ ...current, password: '' }));
      onAuthSuccess(user);
    } catch (failure) {
      setError(failure.message);
      if (failure.errors) {
        setErrors(Object.fromEntries(Object.entries(failure.errors).map(([field, messages]) => [field, messages[0]])));
      }
    } finally {
      setPending(false);
    }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-black/75 p-4 sm:p-6"
    onMouseDown={event => { if (event.target === event.currentTarget && !pending) onClose(); }}>
    <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="auth-title"
      className="relative my-auto grid max-h-[94vh] w-full max-w-4xl overflow-y-auto border border-brand-line bg-brand-white shadow-2xl lg:grid-cols-2">
      <div className="relative hidden min-h-[550px] bg-brand-black text-brand-white lg:block">
        <img src={authImage} alt="Legendary streetwear collection" className="absolute inset-0 h-full w-full object-cover object-top opacity-60" />
        <div className="relative flex h-full flex-col justify-between bg-brand-black/25 p-9">
          <BrandLogo className="w-36" />
          <div><p className="mb-4 text-xs uppercase tracking-[0.2em]">Your everyday legend</p>
            <p className="font-display text-6xl leading-none">Good to<br />have you back.</p>
            <p className="mt-5 max-w-xs text-sm text-white/80">Your orders, saved pieces, and next everyday favourites. All in one place.</p>
          </div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/70">Legendary Lifestyle / Member access</p>
        </div>
      </div>
      <div className="relative flex flex-col justify-center p-6 sm:p-10">
        <button type="button" aria-label="Close sign in" disabled={pending} onClick={onClose}
          className="absolute right-4 top-4 border border-brand-line px-3 py-1 text-xl hover:bg-brand-paper">×</button>
        <p className="editorial-caption mb-4">Member access</p>
        <h1 id="auth-title" className="font-display text-4xl">{mode === 'login' ? 'Sign in to Legendary' : mode === 'forgot' ? 'Password assistance' : 'Join Legendary'}</h1>
        {mode !== 'login' ? <div className="mt-6">
          <p role="status" className="text-sm text-brand-gray">{mode === 'forgot' ? 'Password recovery is currently unavailable.' : 'Account registration is currently unavailable.'}</p>
          <button type="button" className="button-primary mt-6" onClick={() => setMode('login')}>Back to sign in</button>
        </div> : <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
          {error && <p role="alert" className="border-l-2 border-brand-danger bg-brand-paper p-3 text-sm text-brand-danger">{error}</p>}
          <div>
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input id="login-email" className="form-input" type="email" autoComplete="username" maxLength={255} required
              value={form.email} disabled={pending} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined}
              onChange={event => setForm({ ...form, email: event.target.value })} />
            {errors.email && <p id="email-error" className="mt-1 text-xs text-brand-danger">{errors.email}</p>}
          </div>
          <div>
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="relative">
              <input id="login-password" className="form-input pr-16" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                required maxLength={1024} value={form.password} disabled={pending} aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                onChange={event => setForm({ ...form, password: event.target.value })} />
              <button type="button" className="absolute right-3 top-3 text-xs underline" aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={pending} onClick={() => setShowPassword(show => !show)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {errors.password && <p id="password-error" className="mt-1 text-xs text-brand-danger">{errors.password}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-black" checked={form.rememberMe}
              disabled={pending} onChange={event => setForm({ ...form, rememberMe: event.target.checked })} />Remember me</label>
            <button type="button" className="underline underline-offset-4" disabled={pending} onClick={() => setMode('forgot')}>Forgot password?</button>
          </div>
          <button type="submit" className="button-primary w-full" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
          <p className="pt-2 text-center text-xs text-brand-gray">New to Legendary? <button type="button" className="text-brand-black underline underline-offset-4"
            disabled={pending} onClick={() => setMode('register')}>Account registration</button></p>
        </form>}
      </div>
    </section>
  </div>;
}
