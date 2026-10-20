import { useCallback } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import AuthModal from '../../components/AuthModal';
import { useAuth } from './useAuth';
import { postLoginPath } from './authPaths';
import HomePage from '../../pages/HomePage';
import { ResourceState } from '../../components/ui/ResourceState';

export default function LoginPage() {
  const { user, login, status, error, restoreSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const close = useCallback(() => navigate('/', { replace: true }), [navigate]);
  const destination = (account) => postLoginPath(account, location.state?.from);
  if (status === 'loading') return <ResourceState loading label="Checking your session…" />;
  if (status === 'error') return <ResourceState error={error} onRetry={() => restoreSession()} />;
  if (user) return <Navigate to={destination(user)} replace />;
  return <>
    <HomePage />
    <AuthModal isOpen onClose={close} onLogin={login}
      initialMode={location.hash === '#register' ? 'register' : 'login'}
      onAuthSuccess={account => navigate(destination(account), { replace: true })} />
  </>;
}
