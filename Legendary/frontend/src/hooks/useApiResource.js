import { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

export function useApiResource(path, { authenticate = true } = {}) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null, path: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null, path });
    apiRequest(path, { signal: controller.signal, authenticate }).then(data => {
      if (!controller.signal.aborted) setState({ data, loading: false, error: null, path });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ data: null, loading: false, error: error.message, path });
    });
    return () => controller.abort();
  }, [path, attempt, authenticate]);
  return { ...state, data: state.path === path ? state.data : null, error: state.path === path ? state.error : null, loading: state.loading || state.path !== path, retry: () => setAttempt(value => value + 1) };
}
