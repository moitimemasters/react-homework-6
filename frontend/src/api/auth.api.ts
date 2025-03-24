import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

// API URL берем из переменных окружения или используем относительный путь
const API_URL = import.meta.env.VITE_API_URL || '';

// Создаем axios инстанс с поддержкой куки
const apiClient = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Интерфейс для ответа со списком пользователей
interface UsersResponse {
  users: AuthResponse[];
}

// Функция для регистрации пользователя
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/register', userData);
  return response.data;
};

// Функция для входа пользователя
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/login', credentials);
  return response.data;
};

// Функция для выхода пользователя
export const logout = async (): Promise<void> => {
  await apiClient.post('/logout');
};

// Функция для получения профиля пользователя
export const getProfile = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>('/profile');
  return response.data;
};

// Функция для получения списка всех пользователей (только для админов)
export const getAllUsers = async (): Promise<AuthResponse[]> => {
  const response = await apiClient.get<UsersResponse>('/users');
  return response.data.users;
};

// Функция для обновления группы пользователя (только для админов)
export const updateUserGroup = async (userId: string, group: string): Promise<AuthResponse> => {
  const response = await apiClient.put<AuthResponse>(`/users/${userId}/group`, { group });
  return response.data;
};
