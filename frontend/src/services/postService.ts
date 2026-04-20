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
interface Post {
  id: number;
  is_owner: boolean;
  content: string;
  image?: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
  likes_count?: number;
  likes?: Array<{
    id: number;
    user_id: number;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
    };
  }>;
}

export type { Post };

export interface CreatePostData {
  content: string;
  visibility: 'public' | 'private';
  image?: File;
}

export interface UpdatePostData {
  content?: string;
  visibility?: 'public' | 'private';
  image?: File;
  remove_image?: boolean;
}

interface PaginatedPostResponse {
  data: Post[];
  current_page: number;
  last_page: number;
}

interface PaginatedPostsPayload {
  data?: Post[];
  current_page?: number;
  last_page?: number;
  meta?: {
    current_page?: number;
    last_page?: number;
  };
}

function normalizePaginatedPostsResponse(payload: PaginatedPostsPayload): PaginatedPostResponse {
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    current_page: payload?.current_page ?? payload?.meta?.current_page ?? 1,
    last_page: payload?.last_page ?? payload?.meta?.last_page ?? 1,
  };
}

export const postService = {
  // Get all posts
  async getAllPosts(): Promise<Post[]> {
    const response = await api.get('/posts');
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  // Get paginated posts
  async getPostsPaginated(page = 1, perPage = 10): Promise<PaginatedPostResponse> {
      const response = await api.get('/posts', {
          params: { page, per_page: perPage }
      });
      return normalizePaginatedPostsResponse(response.data);
  },

  // Get paginated posts by user (for current user's own posts)
  async getPostsByUser(userId: number, page = 1, perPage = 10): Promise<PaginatedPostResponse> {
      const response = await api.get(`/posts/user/${userId}`, {
          params: { page, per_page: perPage }
      });
      return normalizePaginatedPostsResponse(response.data);
  },
  // Create a new post
  async createPost(data: CreatePostData): Promise<{ message: string; post: Post }> {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('visibility', data.visibility);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get a single post
  async getPost(id: number): Promise<Post> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Update a post
  async updatePost(id: number, data: UpdatePostData): Promise<{ message: string; post: Post }> {
    const formData = new FormData();
    
    if (data.content !== undefined) {
      formData.append('content', data.content);
    }
    
    if (data.visibility !== undefined) {
      formData.append('visibility', data.visibility);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }
    
    if (data.remove_image) {
      formData.append('remove_image', '1');
    }

    // Use POST for file uploads
    const response = await api.post(`/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a post
  async deletePost(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};
