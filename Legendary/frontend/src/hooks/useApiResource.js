import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { invalidateResource, loadResource, peekResource, subscribeResourceCache } from '../services/resourceCache';

export function useApiResource(path, { authenticate = true, keepPreviousData = false } = {}) {
  const { user } = useAuth();
  const scope = authenticate ? user?.id : 'public';
  const [attempt, setAttempt] = useState(0);
  const cached = peekResource(path, authenticate);
  const [state, setState] = useState({ data: cached, loading: cached === undefined, error: null, path, scope, attempt });

  useEffect(() => subscribeResourceCache(() => setAttempt(value => value + 1)), []);

  useEffect(() => {
    let active = true;
    loadResource(path, { authenticate }).then(result => {
      if (active) setState({ data: result, loading: false, error: null, path, scope, attempt });
    }).catch(error => {
      if (active && error.name !== 'AbortError') setState(previous => ({
        data: keepPreviousData && previous.path === path && previous.scope === scope ? previous.data : null,
        loading: false, error: error.message, path, scope, attempt,
      }));
    });
    // Keep shared requests alive across navigation and StrictMode remounts.
    return () => { active = false; };
  }, [path, attempt, authenticate, scope, keepPreviousData]);

  const current = state.path === path && state.scope === scope && state.attempt === attempt;
  return {
    data: current ? state.data : cached ?? (keepPreviousData && state.path === path && state.scope === scope ? state.data : undefined),
    error: current ? state.error : null,
    loading: current ? state.loading : cached === undefined,
    retry: () => { invalidateResource(path, authenticate); setAttempt(value => value + 1); },
  };
}
