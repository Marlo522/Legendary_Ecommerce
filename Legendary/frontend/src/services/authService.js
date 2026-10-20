import { apiRequest, clearCsrf } from './apiClient';

function checkedUser(data) {
  if (!data?.user?.id || !['customer', 'admin'].includes(data.user.role)) {
    throw new Error('Your account could not be verified. Please try signing in again.');
  }
  return data.user;
}

export const authService = {
  async me(signal) {
    return checkedUser(await apiRequest('auth/me', { signal }));
  },
  async login(credentials) {
    return checkedUser(await apiRequest('auth/login', { method: 'POST', body: credentials, authenticate: false }));
  },
  async logout() {
    try {
      await apiRequest('auth/logout', { method: 'POST', authenticate: false });
    } finally {
      clearCsrf();
    }
  },
};
