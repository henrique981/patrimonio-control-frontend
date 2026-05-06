const BASE = 'https://backend-production-32053.up.railway.app';

const api = {
  async get(path) {
    const res = await fetch(`${BASE}${path}`);
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  async put(path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  async delete(path) {
    const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
    return res.json();
  }
};

export default api;
