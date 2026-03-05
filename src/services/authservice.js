const BASE_URL = 'https://ellaquest-backend.onrender.com';

export const authAPI = {
  // Wake up Render free-tier server (call on app/login mount)
  ping: async () => {
    try {
      await fetch(`${BASE_URL}/`, { method: 'GET' });
    } catch {
      // Silently ignore — just warming up the server
    }
  },

  // Register
  register: async (formData) => {
    const response = await fetch(`${BASE_URL}/register`, {
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
    const response = await fetch(`${BASE_URL}/login`, {
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