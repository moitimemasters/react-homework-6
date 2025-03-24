import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthResponse, AuthState, LoginRequest, RegisterRequest, User } from '../types/auth';
import * as authApi from '../api/auth.api';
import { handleApiError, showSuccessMessage } from '../utils/errorHandler';

// Начальное состояние
const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Асинхронная функция для регистрации
export const registerUser = createAsyncThunk<AuthResponse, RegisterRequest>(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await authApi.register(userData);
      showSuccessMessage('Регистрация прошла успешно!', dispatch as any);
      return response;
    } catch (error: any) {
      handleApiError(error, dispatch as any);
      return rejectWithValue(error.response?.data?.error || 'Не удалось зарегистрироваться');
    }
  }
);

// Асинхронная функция для входа
export const loginUser = createAsyncThunk<AuthResponse, LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await authApi.login(credentials);
      showSuccessMessage('Вход выполнен успешно!', dispatch as any);
      return response;
    } catch (error: any) {
      handleApiError(error, dispatch as any);
      return rejectWithValue(error.response?.data?.error || 'Неверное имя пользователя или пароль');
    }
  }
);

// Асинхронная функция для выхода
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await authApi.logout();
      showSuccessMessage('Вы успешно вышли из системы', dispatch as any);
      return null;
    } catch (error: any) {
      handleApiError(error, dispatch as any);
      return rejectWithValue(error.response?.data?.error || 'Не удалось выйти из системы');
    }
  }
);

// Асинхронная функция для получения профиля пользователя
export const fetchProfile = createAsyncThunk(
  'auth/profile',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Всегда делаем запрос к API, бэкенд сам проверит наличие и валидность кук
      return await authApi.getProfile();
    } catch (error: any) {
      if (error.response?.status !== 401) { // Не показываем сообщение об ошибке при 401, т.к. это ожидаемое поведение при проверке авторизации
        handleApiError(error, dispatch as any);
      }
      return rejectWithValue(error.response?.data?.error || 'Не удалось получить профиль');
    }
  }
);

// Создание slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Регистрация
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Вход
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Выход
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Получение профиля
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
