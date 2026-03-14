const BASE_URL = 'https://ellaquest-backend.onrender.com';

const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

export const authAPI = {
  // Wake up Render free-tier server (call on login mount)
  ping: async () => {
    try {
      await fetchWithTimeout(`${BASE_URL}/`, { method: 'GET', mode: 'no-cors' }, 30000);
    } catch {
      // Silently ignore — just warming up the server
    }
  },

  // Register
  register: async (formData) => {
    const response = await fetchWithTimeout(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
      }),
    });
    return response;
  },

  // Login
  login: async (email, password) => {
    const response = await fetchWithTimeout(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });
    return response;
  },
};