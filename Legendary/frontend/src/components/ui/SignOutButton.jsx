import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/useAuth';

export default function SignOutButton({ className = 'button-secondary' }) {
  const { logout, isLoggingOut } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  async function handleLogout() {
    setError(null);
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (failure) {
      setError(failure.message);
    }
  }
  return <div>
    <button type="button" className={className} disabled={isLoggingOut} onClick={handleLogout}>
      {isLoggingOut ? 'Signing out…' : 'Sign out'}
    </button>
    {error && <p role="alert" className="mt-2 max-w-xs text-xs text-brand-danger">{error}</p>}
  </div>;
}
