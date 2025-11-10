const API_BASE = import.meta.env.VITE_API || 'http://localhost:4000';

async function request(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = opts.headers || {};
  headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;
  
  try {
    const res = await fetch(`${API_BASE}${path}`, { 
      ...opts, 
      headers,
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (err) {
    if (err.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Make sure backend is running on port 4000.');
    }
    throw err;
  }
}

export const register = (data) => request('/api/register', { method: 'POST', body: JSON.stringify(data) });
export const login = (data) => request('/api/login', { method: 'POST', body: JSON.stringify(data) });
export const profile = () => request('/api/profile');
export const updateBg = (bg_color) => request('/api/profile/bg', { method: 'POST', body: JSON.stringify({ bg_color }) });
export const pay = (payload) => request('/api/pay', { method: 'POST', body: JSON.stringify(payload) });
export const redeem = (payload) => request('/api/redeem', { method: 'POST', body: JSON.stringify(payload) });
export const getLoyaltyInfo = () => request('/api/loyalty/info');