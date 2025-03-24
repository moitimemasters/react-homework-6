import { AxiosError } from 'axios';
import { AppDispatch } from '../store/store';
import { showNotification } from '../redux/notificationSlice';

// Функция для обработки общих ошибок API
export const handleApiError = (error: unknown, dispatch: AppDispatch): void => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || error.message;

    if (status === 401) {
      dispatch(
        showNotification({
          message: 'Отказано в доступе: Вы не авторизованы',
          severity: 'error',
          autoHideDuration: 6000,
        })
      );
    } else if (status === 403) {
      dispatch(
        showNotification({
          message: 'Доступ запрещен: У вас недостаточно прав для выполнения этого действия',
          severity: 'error',
          autoHideDuration: 6000,
        })
      );
    } else {
      dispatch(
        showNotification({
          message: `Ошибка: ${errorMessage}`,
          severity: 'error',
          autoHideDuration: 6000,
        })
      );
    }
  } else {
    // Для не-Axios ошибок
    const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
    dispatch(
      showNotification({
        message: `Ошибка: ${errorMessage}`,
        severity: 'error',
        autoHideDuration: 6000,
      })
    );
  }
};

// Функция для показа уведомления об успешной операции
export const showSuccessMessage = (message: string, dispatch: AppDispatch): void => {
  dispatch(
    showNotification({
      message,
      severity: 'success',
      autoHideDuration: 4000,
    })
  );
};
