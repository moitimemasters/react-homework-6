import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CardProps } from '../types';
import { fetchProducts, createProduct, updateProduct as apiUpdateProduct, deleteProduct } from '../api/client';
import { handleApiError, showSuccessMessage } from '../utils/errorHandler';
import { AppDispatch } from './store';
// Импортируем объект store после его инициализации в setTimeout
let store: any;

// Константа для значения "Все категории"
export const ALL_CATEGORIES = "all";

interface FilterState {
    search: string;
    nonZeroStock: boolean;
    category: string;
}

interface GoodsState {
    items: CardProps[];
    filter: FilterState;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    pendingUpdates: CardProps[] | null; // Для хранения ожидающих обновлений
}

const initialState: GoodsState = {
    items: [], // Пустой массив вместо тестовых данных
    filter: {
        search: '',
        nonZeroStock: false,
        category: ALL_CATEGORIES,
    },
    status: 'idle',
    error: null,
    pendingUpdates: null
};

// Асинхронные thunks для работы с API
export const fetchAllProducts = createAsyncThunk(
    'goods/fetchAllProducts',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetchProducts();
            return response;
        } catch (error: any) {
            handleApiError(error, dispatch as AppDispatch);
            return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить товары');
        }
    }
);

export const addNewProduct = createAsyncThunk(
    'goods/addNewProduct',
    async (product: CardProps, { rejectWithValue, dispatch }) => {
        try {
            const id = await createProduct(product);
            showSuccessMessage('Товар успешно добавлен', dispatch as AppDispatch);
            return { ...product, id };
        } catch (error: any) {
            handleApiError(error, dispatch as AppDispatch);
            return rejectWithValue(error.response?.data?.error || 'Не удалось добавить товар');
        }
    }
);

export const editProduct = createAsyncThunk(
    'goods/editProduct',
    async (product: CardProps, { rejectWithValue, dispatch }) => {
        try {
            await apiUpdateProduct(product.id, product);
            showSuccessMessage('Товар успешно обновлен', dispatch as AppDispatch);
            return product;
        } catch (error: any) {
            handleApiError(error, dispatch as AppDispatch);
            return rejectWithValue(error.response?.data?.error || 'Не удалось обновить товар');
        }
    }
);

export const removeExistingProduct = createAsyncThunk(
    'goods/removeExistingProduct',
    async (id: string, { rejectWithValue, dispatch }) => {
        try {
            await deleteProduct(id);
            showSuccessMessage('Товар успешно удален', dispatch as AppDispatch);
            return id;
        } catch (error: any) {
            handleApiError(error, dispatch as AppDispatch);
            return rejectWithValue(error.response?.data?.error || 'Не удалось удалить товар');
        }
    }
);

// Для фонового получения товаров без блокировки UI
export const silentFetchProducts = createAsyncThunk(
    'goods/silentFetchProducts',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetchProducts();
            return response;
        } catch (error: any) {
            handleApiError(error, dispatch as AppDispatch);
            return rejectWithValue(error.response?.data?.error || 'Не удалось загрузить товары');
        }
    }
);

const goodsSlice = createSlice({
    name: 'goods',
    initialState,
    reducers: {
        setGoods(state, action: PayloadAction<CardProps[]>) {
            state.items = action.payload;
        },
        updateFilterCriteria(state, action: PayloadAction<FilterState>) {
            state.filter = { ...state.filter, ...action.payload };
        },
        resetFilterCriteria(state) {
            state.filter = { search: '', nonZeroStock: false, category: ALL_CATEGORIES };
        },
        addProduct(state, action: PayloadAction<CardProps>) {
            state.items.push(action.payload);
        },
        removeProduct(state, action: PayloadAction<string>) {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        updateProduct: (state, action: PayloadAction<CardProps>) => {
            const index = state.items.findIndex(
                (item) => item.id === action.payload.id
            );
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        // Редьюсер для обновления данных после фонового получения изменений
        updateProductsAfterFetch: (state, action: PayloadAction<CardProps[]>) => {
            state.items = action.payload;
            state.status = 'succeeded';
        },
        // Редьюсер для показа лоадера и установки ожидающих обновлений
        setProductsPendingUpdate: (state, action: PayloadAction<CardProps[]>) => {
            state.status = 'loading';
            state.pendingUpdates = action.payload;
        },
        // Редьюсер для применения ожидающих обновлений
        applyPendingProductUpdates: (state) => {
            if (state.pendingUpdates) {
                state.items = state.pendingUpdates;
                state.pendingUpdates = null;
                state.status = 'succeeded';
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllProducts
            .addCase(fetchAllProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Если с сервера пришли данные и они отличаются от текущих, обновляем состояние
                if (action.payload && action.payload.length > 0) {
                    // Просто обновляем данные при явном запросе
                    state.items = action.payload;
                }
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Что-то пошло не так';
            })
            // Тихое обновление, которое проверяет изменения
            .addCase(silentFetchProducts.fulfilled, (state, action) => {
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
                            existingItem.description !== newItem.description ||
                            existingItem.count !== newItem.count ||
                            existingItem.price !== newItem.price ||
                            existingItem.categoryId !== newItem.categoryId
                        );
                    });

                    // Если есть изменения, показываем лоадер и сохраняем новые данные для применения
                    if (hasNewItems || hasRemovedItems || hasUpdatedItems) {
                        state.status = 'loading';
                        state.pendingUpdates = action.payload;

                        // Это позволяет лоадеру отобразиться перед применением обновлений
                        // (будет обработано в компоненте App.tsx)
                    }
                }
            })
            // addNewProduct
            .addCase(addNewProduct.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // editProduct
            .addCase(editProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // removeExistingProduct
            .addCase(removeExistingProduct.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
            });
    }
});

export const {
    setGoods,
    updateFilterCriteria,
    resetFilterCriteria,
    addProduct,
    removeProduct,
    updateProduct,
    updateProductsAfterFetch,
    setProductsPendingUpdate,
    applyPendingProductUpdates,
} = goodsSlice.actions;
export default goodsSlice.reducer;
