import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { registerUser, clearError } from '../redux/authSlice';
import { RootState } from '../store/store';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { RegisterRequest, UserGroup } from '../types/auth';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    group: 'user',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Если пользователь уже авторизован, перенаправляем на главную страницу
    if (isAuthenticated) {
      navigate('/');
    }

    // Очистка ошибок при монтировании компонента
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  // Разделяем обработчики для текстовых полей и селектов
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Отдельный обработчик для поля Select
  const handleGroupChange = (e: SelectChangeEvent<UserGroup>) => {
    setFormData((prev) => ({
      ...prev,
      group: e.target.value as UserGroup,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser(formData) as any);
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Регистрация
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Имя пользователя"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleTextFieldChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            type="email"
            value={formData.email}
            onChange={handleTextFieldChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleTextFieldChange}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="group-label">Группа</InputLabel>
            <Select
              labelId="group-label"
              id="group"
              name="group"
              value={formData.group}
              label="Группа"
              onChange={handleGroupChange}
            >
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            name="avatarUrl"
            label="URL аватара (опционально)"
            id="avatarUrl"
            value={formData.avatarUrl || ''}
            onChange={handleTextFieldChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link to="/login">
              <Typography variant="body2">
                Уже есть аккаунт? Войти
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
