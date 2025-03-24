import { configureStore } from '@reduxjs/toolkit';
import goodsReducer from './goodsSlice';
import categoriesReducer from './categoriesSlice';
import authReducer from '../redux/authSlice';
import notificationReducer from '../redux/notificationSlice';

export const store = configureStore({
  reducer: {
    goods: goodsReducer,
    categories: categoriesReducer,
    auth: authReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
