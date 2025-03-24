// Типы пользователей
export type UserGroup = 'user' | 'admin';

// Данные пользователя
export interface User {
  id: string;
  username: string;
  email: string;
  group: UserGroup;
  avatarUrl?: string;
}

// Данные для регистрации
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  group: UserGroup;
  avatarUrl?: string;
}

// Данные для входа
export interface LoginRequest {
  username: string;
  password: string;
}

// Ответ с данными пользователя
export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  group: UserGroup;
  avatarUrl?: string;
}

// Состояние авторизации
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
