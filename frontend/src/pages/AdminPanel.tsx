import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  // Эти импорты нужны для типов, хотя компоненты напрямую не используются
  // @ts-ignore
  List,
  // @ts-ignore
  ListItem,
  // @ts-ignore
  ListItemText,
  Checkbox,
  // @ts-ignore
  ListItemIcon,
  OutlinedInput,
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import { UserGroup, User } from '../types/auth';
import * as authApi from '../api/auth.api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { Category } from '../types';
import { updateExistingCategory } from '../store/categoriesSlice';

// Доступные группы пользователей
const USER_GROUPS = ['user', 'admin'];

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Состояние для управления категориями
  const categories = useSelector((state: RootState) => state.categories.items);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['admin']);
  const [updatingCategory, setUpdatingCategory] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  // Загружаем список пользователей при монтировании компонента
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await authApi.getAllUsers();
        setUsers(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.error || 'Не удалось загрузить список пользователей');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleGroupChange = async (userId: string, newGroup: UserGroup) => {
    try {
      setUpdatingUserId(userId);
      await authApi.updateUserGroup(userId, newGroup);

      // Обновляем локальный список пользователей
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, group: newGroup } : user
        )
      );

      setAlert({
        message: `Группа пользователя успешно изменена на "${newGroup === 'admin' ? 'Администратор' : 'Пользователь'}"`,
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error updating user group:', err);
      setAlert({
        message: err.response?.data?.error || 'Не удалось обновить группу пользователя',
        severity: 'error'
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  // Функции для работы с категориями
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedGroups(category.allowedGroups || ['admin']);
    setCategoryDialogOpen(true);
  };

  const handleGroupsChange = (event: SelectChangeEvent<typeof selectedGroups>) => {
    const {
      target: { value },
    } = event;

    // При выборе admin, проверяем наличие необходимой группы
    const groups = typeof value === 'string' ? value.split(',') : value;
    setSelectedGroups(groups);
  };

  const handleSaveGroups = async () => {
    if (!selectedCategory) return;

    // Убедимся, что admin всегда добавлен
    let groups = [...selectedGroups];
    if (!groups.includes('admin')) {
      groups.push('admin');
    }

    setUpdatingCategory(true);

    try {
      // Обновляем категорию с новыми правами доступа
      const updatedCategory = {
        ...selectedCategory,
        allowedGroups: groups
      };

      await dispatch(updateExistingCategory(updatedCategory));

      setAlert({
        message: `Права доступа для категории "${selectedCategory.name}" успешно обновлены`,
        severity: 'success'
      });

      setCategoryDialogOpen(false);
    } catch (err: any) {
      console.error('Error updating category access:', err);
      setAlert({
        message: err.response?.data?.error || 'Не удалось обновить права доступа к категории',
        severity: 'error'
      });
    } finally {
      setUpdatingCategory(false);
    }
  };

  // Диалог для управления доступом к категории
  const renderCategoryAccessDialog = () => (
    <Dialog
      open={categoryDialogOpen}
      onClose={() => setCategoryDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Управление доступом к категории "{selectedCategory?.name}"
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="category-groups-label">Группы с доступом</InputLabel>
          <Select
            labelId="category-groups-label"
            id="category-groups"
            multiple
            value={selectedGroups}
            onChange={handleGroupsChange}
            input={<OutlinedInput label="Группы с доступом" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={value === 'admin' ? 'Администратор' : 'Пользователь'}
                    color={value === 'admin' ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            )}
            disabled={updatingCategory}
          >
            {USER_GROUPS.map((group) => (
              <MenuItem
                key={group}
                value={group}
                disabled={group === 'admin'} // Админ всегда имеет доступ
              >
                <Checkbox checked={selectedGroups.indexOf(group) > -1} />
                <ListItemText
                  primary={group === 'admin' ? 'Администратор' : 'Пользователь'}
                />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Группа "Администратор" всегда имеет доступ к категории
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setCategoryDialogOpen(false)}
          disabled={updatingCategory}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSaveGroups}
          variant="contained"
          color="primary"
          disabled={updatingCategory}
          startIcon={updatingCategory ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {updatingCategory ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Показываем индикатор загрузки, пока данные загружаются
  if (loading && !users.length) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Панель администратора
        </Typography>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="h5" component="h2" gutterBottom>
          Управление пользователями
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} elevation={3} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя пользователя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Группа</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.group === 'admin' ? 'Администратор' : 'Пользователь'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id={`group-select-${user.id}`}>Изменить группу</InputLabel>
                        <Select
                          labelId={`group-select-${user.id}`}
                          value={user.group}
                          label="Изменить группу"
                          onChange={(e) => handleGroupChange(user.id, e.target.value as UserGroup)}
                          disabled={updatingUserId === user.id}
                        >
                          <MenuItem value="user">Пользователь</MenuItem>
                          <MenuItem value="admin">Администратор</MenuItem>
                        </Select>
                      </FormControl>
                      {updatingUserId === user.id && (
                        <CircularProgress size={24} sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h5" component="h2" gutterBottom>
          Управление доступом к категориям
        </Typography>

        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {category.description}
                  </Typography>
                  <Box mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Группы с доступом:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {(category.allowedGroups || ['admin']).map((group) => (
                        <Chip
                          key={group}
                          label={group === 'admin' ? 'Администратор' : 'Пользователь'}
                          size="small"
                          color={group === 'admin' ? 'primary' : 'default'}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleCategorySelect(category)}
                  >
                    Настроить доступ
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Диалог для управления доступом к категории */}
      {renderCategoryAccessDialog()}

      <Snackbar
        open={!!alert}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {alert && (
          <Alert
            onClose={handleAlertClose}
            severity={alert.severity}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        ) || <span/>}
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;
