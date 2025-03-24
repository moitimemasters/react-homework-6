import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../types';
import { fetchCategories, createCategory, updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory } from '../api/client';
import { store } from './store';
import { handleApiError, showSuccessMessage } from '../utils/errorHandler';
import { AppDispatch } from './store';

interface CategoriesState {
    items: Category[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    pendingUpdates: Category[] | null; // Для хранения ожидающих обновлений
}

const initialState: CategoriesState = {
    items: [
        { id: '1', name: 'Вещи' },
        { id: '2', name: 'Животные', description: 'Животные' },
    ],
    status: 'idle',
    error: null,
    pendingUpdates: null
};

// Асинхронные thunks для работы с API
export const fetchAllCategories = createAsyncThunk(
    'categories/fetchAllCategories',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetchCategories();
            return response;
        } catch (error: any) {
            handleApiError(error, dispatch as any);
            return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить категории');
        }
    }
);

export const addNewCategory = createAsyncThunk(
    'categories/addNewCategory',
    async (category: Category, { rejectWithValue, dispatch }) => {
        try {
            const id = await createCategory(category);
            showSuccessMessage('Категория успешно добавлена', dispatch as any);
            return { ...category, id };
        } catch (error: any) {
            handleApiError(error, dispatch as any);
            return rejectWithValue(error.response?.data?.error || 'Не удалось добавить категорию');
        }
    }
);

export const updateExistingCategory = createAsyncThunk(
    'categories/updateExistingCategory',
    async (category: Category, { rejectWithValue, dispatch }) => {
        try {
            // Проверяем что id существует
            if (!category.id) {
                throw new Error('ID категории не указан');
            }
            await apiUpdateCategory(category.id, category);
            showSuccessMessage('Категория успешно обновлена', dispatch as any);
            return category;
        } catch (error: any) {
            handleApiError(error, dispatch as any);
            return rejectWithValue(error.response?.data?.error || 'Не удалось обновить категорию');
        }
    }
);

export const removeCategory = createAsyncThunk(
    'categories/removeCategory',
    async (id: string, { rejectWithValue, dispatch }) => {
        try {
            await apiDeleteCategory(id);
            showSuccessMessage('Категория успешно удалена', dispatch as any);
            return id;
        } catch (error: any) {
            handleApiError(error, dispatch as any);
            return rejectWithValue(error.response?.data?.error || 'Не удалось удалить категорию');
        }
    }
);

// Для фонового получения категорий без блокировки UI
export const silentFetchCategories = createAsyncThunk(
    'categories/silentFetchCategories',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetchCategories();
            return response;
        } catch (error: any) {
            handleApiError(error, dispatch as any);
            return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить категории');
        }
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        addCategory: (state, action: PayloadAction<Category>) => {
            state.items.push(action.payload);
        },
        updateCategory: (state, action: PayloadAction<Category>) => {
            const index = state.items.findIndex(cat => cat.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteCategory: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(cat => cat.id !== action.payload);
        },
        // Редьюсер для обновления данных после фонового получения изменений
        updateCategoriesAfterFetch: (state, action: PayloadAction<Category[]>) => {
            state.items = action.payload;
            state.status = 'succeeded';
        },
        // Редьюсер для применения ожидающих обновлений
        applyCategoriesPendingUpdates: (state) => {
            if (state.pendingUpdates) {
                state.items = state.pendingUpdates;
                state.pendingUpdates = null;
                state.status = 'succeeded';
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllCategories
            .addCase(fetchAllCategories.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllCategories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (action.payload && action.payload.length > 0) {
                    // Просто обновляем данные при явном запросе
                    state.items = action.payload;
                }
            })
            .addCase(fetchAllCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch categories';
            })
            // silentFetchCategories - теперь возвращает информацию об изменениях
            .addCase(silentFetchCategories.pending, (state) => {
                // Не меняем статус на loading при старте запроса
            })
            .addCase(silentFetchCategories.fulfilled, (state, action) => {
                if (action.payload && action.payload.length > 0) {
                    // Проверяем, есть ли изменения
                    const currentIds = new Set(state.items.map(item => item.id));
                    const hasNewItems = action.payload.some(item => !currentIds.has(item.id));
                    const hasRemovedItems = state.items.some(item =>
                        !action.payload.find(p => p.id === item.id)
                    );

                    // Проверяем изменения в существующих элементах
                    const hasUpdatedItems = action.payload.some(newItem => {
                        const existingItem = state.items.find(item => item.id === newItem.id);
                        if (!existingItem) return false;

                        return (
                            existingItem.name !== newItem.name ||
                            existingItem.description !== newItem.description
                        );
                    });

                    // Если есть изменения, показываем лоадер и сохраняем новые данные для применения
                    if (hasNewItems || hasRemovedItems || hasUpdatedItems) {
                        state.status = 'loading';
                        state.pendingUpdates = action.payload;
                    }
                }
            })
            // addNewCategory
            .addCase(addNewCategory.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // updateExistingCategory
            .addCase(updateExistingCategory.fulfilled, (state, action) => {
                const index = state.items.findIndex(cat => cat.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // removeCategory
            .addCase(removeCategory.fulfilled, (state, action) => {
                state.items = state.items.filter(cat => cat.id !== action.payload);
            });
    }
});

export const { addCategory, updateCategory, deleteCategory, updateCategoriesAfterFetch, applyCategoriesPendingUpdates } = categoriesSlice.actions;
export default categoriesSlice.reducer;
