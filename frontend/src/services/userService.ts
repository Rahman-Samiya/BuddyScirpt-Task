import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch custom event for token expiration
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  email: string;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const userService = {
  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<{ message: string; user: any }> {
    const response = await api.put('/user/update-profile', data);
    return response.data;
  },

  // Update user password
  async updatePassword(data: UpdatePasswordData): Promise<{ message: string }> {
    const response = await api.put('/user/update-password', data);
    return response.data;
  },
};
