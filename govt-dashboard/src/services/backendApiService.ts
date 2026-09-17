const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_API_URL) ||
  'https://kabadiwala-connect-wg0t.onrender.com';

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
}

export const backendApi = {
  getOverview: () => request('/api/analytics/overview'),
  getCollections: () => request('/api/analytics/collections'),
  getMaterials: () => request('/api/analytics/materials'),
  getRecyclers: () => request('/api/recyclers'),
  getLots: () => request('/api/lots')
};
