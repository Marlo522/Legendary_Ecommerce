export function postLoginPath(user, requestedPath) {
  if (typeof requestedPath === 'string' && /^\/products\/[a-zA-Z0-9_-]+$/.test(requestedPath)) return requestedPath;
  const home = user?.role === 'admin' ? '/admin' : '/account';
  if (typeof requestedPath !== 'string') return home;
  if (requestedPath === home || requestedPath.startsWith(home + '/') || requestedPath.startsWith(home + '?')) {
    return requestedPath;
  }
  return home;
}
