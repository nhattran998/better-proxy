import xior from 'xior';

export const http = xior.create({
  baseURL: '/api',
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

function getSessionToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/session=([^;]+)/);
  return match?.[1] || null;
}

function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export { xior };
