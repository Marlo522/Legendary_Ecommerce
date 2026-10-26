import { useRef, useState } from 'react';
import { apiRequest } from '../services/apiClient';

export function useAdminMutation() {
  const active = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  async function mutate(path, options, onSuccess, message = 'Changes saved.') {
    if (active.current) return;
    active.current = true;
    setPending(true);
    setError(null);
    setSuccess('');
    try {
      const result = await apiRequest(path, options);
      setSuccess(message);
      onSuccess?.(result);
    } catch (failure) {
      setError(failure);
    } finally {
      active.current = false;
      setPending(false);
    }
  }
  return { pending, error, success, mutate };
}
