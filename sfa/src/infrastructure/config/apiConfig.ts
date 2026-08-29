const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8787';
  }
  return (import.meta as any).env?.VITE_API_URL || 'https://backend.ravishankar-clinic.workers.dev';
};

export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  timeoutMs: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
};
