import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// Create axios instance with auth interceptors
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

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

export interface LikeUser {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface Like {
  id: number;
  user_id: number;
  post_id?: number;
  comment_id?: number;
  created_at: string;
  user: LikeUser;
}

export interface LikeResponse {
  count: number;
  likes?: Like[];
  users?: LikeUser[];
  liked: boolean;
}

export interface LikesListResponse {
  count: number;
  users: LikeUser[];
  likes?: Like[];
}

class LikeService {
  // Toggle like/unlike for a post or comment
  async toggleLike(type: 'post' | 'comment', id: number): Promise<LikeResponse> {
    try {
      const token = getToken();
      
      if (!token) {
        console.error('No auth token found in localStorage');
        throw new Error('Authentication token not found');
      }

      const res = await api.post(`/like/${type}/${id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return res.data;
    } catch (error) {
      console.error(`Error toggling like for ${type}/${id}:`, error);
      throw error;
    }
  }

  // Get all likes for a post or comment
  async getLikes(type: 'post' | 'comment', id: number): Promise<LikesListResponse> {
    try {
      const token = getToken();
      
      if (!token) {
        console.error('No auth token found in localStorage');
        throw new Error('Authentication token not found');
      }

      const res = await api.get(`/like/${type}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching likes for ${type}/${id}:`, error);
      throw error;
    }
  }
}

export const likeService = new LikeService();
