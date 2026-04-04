export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
