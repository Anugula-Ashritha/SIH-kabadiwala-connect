const API_BASE = 'http://127.0.0.1:8001';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  return response.json();
}

export const backendApi = {
  getCollectors: () => request('/api/collectors'),
  getLots: () => request('/api/lots'),
  getRecyclers: () => request('/api/recyclers'),
  getTransactions: () => request('/api/transactions'),
  getHandovers: () => request('/api/handovers'),
  getOverview: () => request('/api/analytics/overview'),
  getMaterials: () => request('/api/analytics/materials'),
  getCollections: () => request('/api/analytics/collections'),

  updateLotStatus: (lotId: string, status: string, recyclerId?: number, finalPrice?: number) =>
    request(`/api/lots/${lotId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, recycler_id: recyclerId, final_price: finalPrice })
    }),

  updatePayment: (transactionId: string, status: string, utr?: string) =>
    request(`/api/transactions/${transactionId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ status, utr })
    })
};
