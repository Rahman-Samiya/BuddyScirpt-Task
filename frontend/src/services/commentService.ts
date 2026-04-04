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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

// Types
export interface CommentUser {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface CommentLike {
  id: number;
  user_id: number;
  comment_id: number;
  created_at: string;
  user: CommentUser;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  created_at: string;
  updated_at: string;
  user: CommentUser;
  replies?: Comment[];
  likes?: CommentLike[];
  likes_count?: number;
}

export interface CommentResponse {
  message: string;
  comment: Comment;
}

export interface CommentsListResponse {
  post_id: number;
  comments: Comment[];
}

export interface CommentLikeResponse {
  count: number;
  liked: boolean;
  users: CommentUser[];
  likes?: CommentLike[];
}

export interface CommentLikesListResponse {
  count: number;
  users: CommentUser[];
}

// Service methods
const commentService = {
  /**
   * Fetch all comments for a specific post
   */
  getCommentsByPost: async (postId: number): Promise<CommentsListResponse> => {
    try {
      const token = getToken();
      const response = await api.get(`/post/${postId}/comments`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  /**
   * Create a new comment or reply
   */
  createComment: async (
    postId: number,
    content: string,
    parentId?: number | null
  ): Promise<CommentResponse> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No auth token found');

      const response = await api.post(
        `/post/comments/${postId}`,
        {
          content,
          parent_id: parentId || null,
        },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  /**
   * Update a comment
   */
  updateComment: async (
    commentId: number,
    content: string
  ): Promise<CommentResponse> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No auth token found');

      const response = await api.put(
        `/post/comments/${commentId}`,
        { content },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: number): Promise<{ message: string }> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No auth token found');

      const response = await api.delete(
        `/post/comments/${commentId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  /**
   * Like/Unlike a comment
   */
  toggleCommentLike: async (commentId: number): Promise<CommentLikeResponse> => {
    try {
      const token = getToken();
      if (!token) throw new Error('No auth token found');

      const response = await api.post(
        `/like/comment/${commentId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  },

  /**
   * Get all likes for a comment
   */
  getCommentLikes: async (commentId: number): Promise<CommentLikesListResponse> => {
    try {
      const token = getToken();
      const response = await api.get(
        `/likes/comment/${commentId}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching comment likes:', error);
      throw error;
    }
  },
};

export default commentService;
