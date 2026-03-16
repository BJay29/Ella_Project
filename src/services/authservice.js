const BASE_URL = 'https://ellaquest-backend.onrender.com';

const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

export const authAPI = {
  // Wake up Render server (Call this on app mount)
  ping: async () => {
    try {
      await fetchWithTimeout(`${BASE_URL}/`, { method: 'GET', mode: 'no-cors' }, 30000);
    } catch {
      // Silently ignore
    }
  },

  /**
   * 1. SEND OTP 
   * Endpoint: /api/user/send-code
   * Description: Nagse-send ng 6-digit code sa email ng user.
   */
  sendVerificationCode: async (email) => {
    const response = await fetchWithTimeout(`${BASE_URL}/api/user/send-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    return response;
  },

  /**
   * 2. REGISTER
   * Endpoint: /api/user/register
   * Description: Dito na ipapasa ang user details KASAMA ang verification code.
   * Ang backend na ang bahalang mag-verify kung tama ang code bago i-save ang user.
   */
  register: async (formData) => {
    const response = await fetchWithTimeout(`${BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        code: formData.code // Ang 6-digit code na nakuha sa email
      }),
    });
    return response;
  },

  /**
   * 3. LOGIN
   * Endpoint: /api/user/login
   */
  login: async (email, password) => {
    const response = await fetchWithTimeout(`${BASE_URL}/api/user/login`, {
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