import React, { useState, useEffect } from 'react';
import NavBar from './components/navbar';
import Sidebar from './components/sidebar';
import InventoryList from './components/inventory_list';
import MyThemeProvider from './context/MyThemeProvider';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from "./store/store"
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import ProductPage from './pages/product';
import CategoriesPage from './pages/category';
import UserProfilePage from './pages/user_profile.tsx';
import { fetchAllProducts, silentFetchProducts, applyPendingProductUpdates } from './store/goodsSlice';
import { fetchAllCategories, silentFetchCategories, applyCategoriesPendingUpdates } from './store/categoriesSlice';
import { AppDispatch, RootState } from './store/store';
import { fetchProfile } from './redux/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthState } from './types/auth';
import Notifications from './components/Notifications';

// Интерфейсы для состояний slice'ов (упрощенная версия для типизации)
interface GoodsState {
  pendingUpdates: any | null;
}

interface CategoriesState {
  pendingUpdates: any | null;
}

// Расширяем тип RootState для обеспечения типизации
interface ExtendedRootState {
  goods: GoodsState;
  categories: CategoriesState;
  auth: AuthState;
}

// Компонент для инициализации данных
const DataInitializer: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Получаем информацию о ожидающих обновлениях
    const goodsPendingUpdates = useSelector((state: ExtendedRootState) => state.goods.pendingUpdates);
    const categoriesPendingUpdates = useSelector((state: ExtendedRootState) => state.categories.pendingUpdates);
    const { isAuthenticated } = useSelector((state: ExtendedRootState) => state.auth);

    // Эффект для проверки авторизации при запуске
    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    // Эффект для первоначальной загрузки данных
    useEffect(() => {
        // Загружаем товары и категории только если пользователь авторизован
        if (isAuthenticated) {
            dispatch(fetchAllProducts());
            dispatch(fetchAllCategories());

            // Периодически обновляем данные для синхронизации между пользователями
            const interval = setInterval(() => {
                dispatch(silentFetchProducts());
                dispatch(silentFetchCategories());
            }, 5000); // каждые 5 секунд

            return () => clearInterval(interval); // очищаем интервал при размонтировании компонента
        }
    }, [dispatch, isAuthenticated]);

    // Эффект для применения ожидающих обновлений товаров после короткой задержки
    useEffect(() => {
        if (goodsPendingUpdates) {
            // Добавляем задержку, чтобы лоадер был виден
            const timer = setTimeout(() => {
                dispatch(applyPendingProductUpdates());
            }, 800); // Задержка для видимости лоадера

            return () => clearTimeout(timer);
        }
    }, [goodsPendingUpdates, dispatch]);

    // Эффект для применения ожидающих обновлений категорий после короткой задержки
    useEffect(() => {
        if (categoriesPendingUpdates) {
            // Добавляем задержку, чтобы лоадер был виден
            const timer = setTimeout(() => {
                dispatch(applyCategoriesPendingUpdates());
            }, 800); // Задержка для видимости лоадера

            return () => clearTimeout(timer);
        }
    }, [categoriesPendingUpdates, dispatch]);

    return null; // Этот компонент не рендерит UI
};

// Основной компонент приложения, включающий роутинг и провайдеры
const AppContent: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { isAuthenticated } = useSelector((state: ExtendedRootState) => state.auth);

    const toggleSidebar = () => {
        setSidebarOpen((prevOpen) => !prevOpen);
    };

    return (
        <BrowserRouter>
            <DataInitializer />
            <NavBar toggleSidebar={toggleSidebar} />
            <Notifications />
            {isAuthenticated && (
                <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            )}
            <main style={{ padding: 16 }}>
                <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Защищенные маршруты */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/products" element={<InventoryList />} />
                        <Route path="/products/:id" element={<ProductPage />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                    </Route>

                    {/* Маршруты только для администраторов */}
                    <Route element={<ProtectedRoute requiredGroups={['admin']} />}>
                        <Route path="/admin" element={<AdminPanel />} />
                    </Route>

                    {/* Редирект на страницу с продуктами или логин */}
                    <Route
                        path="*"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/products" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                </Routes>
            </main>
        </BrowserRouter>
    );
};

// Оборачиваем приложение в необходимые провайдеры
const App: React.FC = () => {
    return (
        <Provider store={store}>
            <MyThemeProvider>
                <AppContent />
            </MyThemeProvider>
        </Provider>
    );
};

export default App;
