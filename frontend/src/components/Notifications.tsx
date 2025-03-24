import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import { RootState } from '../store/store';
import { hideNotification } from '../redux/notificationSlice';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notification.notifications);

  const handleClose = (id: string) => {
    dispatch(hideNotification(id));
  };

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration || 6000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: notifications.indexOf(notification) * 8 }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.severity}
            sx={{ width: '100%' }}
            variant="filled"
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default Notifications;
