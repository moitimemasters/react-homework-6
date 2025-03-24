import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { UserGroup } from '../types/auth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  requiredGroups?: UserGroup[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredGroups }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Если идет загрузка, показываем индикатор загрузки
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если требуются определенные группы и пользователь не входит в них
  if (requiredGroups && user && !requiredGroups.includes(user.group)) {
    return <Navigate to="/" replace />;
  }

  // Если все проверки пройдены, рендерим защищенный контент
  return <Outlet />;
};

export default ProtectedRoute;
