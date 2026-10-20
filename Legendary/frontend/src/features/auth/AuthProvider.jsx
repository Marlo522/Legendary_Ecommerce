import { useCallback, useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const restoreSession = useCallback(async (signal) => {
    setStatus('loading');
    setError(null);
    try {
      const account = await authService.me(signal);
      setUser(account);
      setStatus('authenticated');
    } catch (failure) {
      if (failure.name === 'AbortError') return;
      setUser(null);
      if (failure.status === 401) {
        setStatus('anonymous');
      } else {
        setError(failure.message);
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    restoreSession(controller.signal);
    function expireSession() {
      setUser(null);
      setStatus('anonymous');
    }
    window.addEventListener('auth:expired', expireSession);
    return () => {
      controller.abort();
      window.removeEventListener('auth:expired', expireSession);
    };
  }, [restoreSession]);

  async function login(credentials) {
    const account = await authService.login(credentials);
    setUser(account);
    setError(null);
    setStatus('authenticated');
    return account;
  }

  async function logout() {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      setUser(null);
      setStatus('anonymous');
    } catch (failure) {
      try {
        const account = await authService.me();
        setUser(account);
      } catch (checkFailure) {
        if (checkFailure.status === 401) {
          setUser(null);
          setStatus('anonymous');
        }
      }
      throw failure;

    } finally {
      setIsLoggingOut(false);
    }
  }

  return <AuthContext.Provider value={{ user, status, error, login, logout, isLoggingOut, restoreSession }}>
    {children}
  </AuthContext.Provider>;
}
