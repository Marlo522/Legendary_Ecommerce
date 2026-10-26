import { useSearchParams } from 'react-router';

export function useAdminListEndpoint(endpoint) {
  const [params] = useSearchParams();
  const filters = new URLSearchParams();
  if (params.get('search')) filters.set('search', params.get('search'));
  if (params.get('status')) filters.set('status', params.get('status'));
  return endpoint + '?' + filters;
}
