import { useSearchParams } from 'react-router';
import { useApiResource } from './useApiResource';

export function usePagedResource(endpoint) {
  const [params, setParams] = useSearchParams();
  const parsedPage = Number(params.get('page') || 1);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 && parsedPage <= 10000 ? parsedPage : 1;
  const resource = useApiResource(endpoint + '?page=' + page + '&per_page=12');
  return {
    ...resource,
    changePage(nextPage) {
      const next = new URLSearchParams(params);
      next.set('page', String(nextPage));
      setParams(next);
    },
  };
}
