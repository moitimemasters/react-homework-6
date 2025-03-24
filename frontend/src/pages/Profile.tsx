import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Box, Paper, Avatar, Divider, Chip } from '@mui/material';
import { RootState } from '../store/store';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
          Пользователь не найден
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Профиль пользователя
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            alt={user.username}
            src={user.avatarUrl}
            sx={{ width: 100, height: 100, mr: 3 }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box>
            <Typography variant="h5" component="h2">
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            <Chip
              label={user.group === 'admin' ? 'Администратор' : 'Пользователь'}
              color={user.group === 'admin' ? 'primary' : 'default'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" component="h3" gutterBottom>
          Информация об аккаунте
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 200 }}>
              ID пользователя:
            </Typography>
            <Typography variant="body1">{user.id}</Typography>
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 200 }}>
              Имя пользователя:
            </Typography>
            <Typography variant="body1">{user.username}</Typography>
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 200 }}>
              Email:
            </Typography>
            <Typography variant="body1">{user.email}</Typography>
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 200 }}>
              Группа:
            </Typography>
            <Typography variant="body1">
              {user.group === 'admin' ? 'Администратор' : 'Пользователь'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
