import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';
import { ResourceState } from '../../components/ui/ResourceState';
import { ForbiddenPage } from '../../pages/StatusPages';

export default function RequireAuth({ role }) {
  const { user, status, error, restoreSession } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <ResourceState loading label="Checking your session…" />;
  if (status === 'error') return <ResourceState error={error} onRetry={() => restoreSession()} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (role && user.role !== role) return <ForbiddenPage />;
  return <Outlet />;
}
