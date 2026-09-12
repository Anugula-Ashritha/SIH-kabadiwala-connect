const API_BASE = 'http://127.0.0.1:8001';

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
}

export const backendApi = {
  getOverview: () =>
    request('/api/analytics/overview'),

  getCollections: () =>
    request('/api/analytics/collections'),

  getMaterials: () =>
    request('/api/analytics/materials'),

  getRecyclers: () =>
    request('/api/recyclers'),

  getLots: () =>
    request('/api/lots')
};