import axios from 'axios';
import { CardProps, Category } from '../types';
import { ALL_CATEGORIES } from '../store/goodsSlice';

// API URL берем из переменных окружения или используем относительный путь
// Теперь мы можем использовать относительные пути, т.к. Caddy будет проксировать запросы
const API_URL = import.meta.env.VITE_API_URL || '';

// Создаем axios инстанс
const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерфейсы для ответов API
interface CategoriesResponse {
    categories: Array<{
        _id: string;
        name: string;
        description?: string | null;
        allowedGroups?: string[]
    }>;
}

interface CategoryResponse {
    category: {
        _id: string;
        name: string;
        description?: string | null;
        allowedGroups?: string[]
    };
}

interface ProductsResponse {
    products: Array<{
        _id: string;
        name: string;
        description?: string | null;
        categoryId?: string | null;
        quantity: number;
        price: number;
    }>;
}

interface ProductResponse {
    product: {
        _id: string;
        name: string;
        description?: string | null;
        categoryId?: string | null;
        quantity: number;
        price: number;
    };
}

// Конвертеры данных между форматами backend и frontend
const convertBackendCategoryToFrontend = (category: any): Category => {
    return {
        id: category._id,
        name: category.name.toString(),
        description: category.description?.toString(),
        allowedGroups: category.allowedGroups || ['admin'],
    };
};

const convertFrontendCategoryToBackend = (category: Category) => {
    return {
        name: category.name,
        description: category.description,
        allowedGroups: category.allowedGroups,
    };
};

const convertBackendProductToFrontend = (product: any): CardProps => {
    return {
        id: product._id,
        name: product.name.toString(),
        description: product.description?.toString(),
        categoryId: product.categoryId || ALL_CATEGORIES,
        count: product.quantity,
        units: 'шт',
        price: product.price,
        imageUrl: product.imageUrl,
    };
};

const convertFrontendProductToBackend = (product: CardProps) => {
    return {
        name: product.name,
        description: product.description,
        categoryId: product.categoryId !== ALL_CATEGORIES ? product.categoryId : null,
        quantity: product.count,
        price: product.price,
    };
};

// API функции для категорий
export const fetchCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get<CategoriesResponse>('/categories');
    return response.data.categories.map(convertBackendCategoryToFrontend);
};

export const fetchCategory = async (id: string): Promise<Category> => {
    const response = await apiClient.get<CategoryResponse>(`/categories/${id}`);
    return convertBackendCategoryToFrontend(response.data.category);
};

export const createCategory = async (category: Category): Promise<string> => {
    const response = await apiClient.post<{ id: string }>('/categories', convertFrontendCategoryToBackend(category));
    return response.data.id;
};

export const updateCategory = async (id: string, category: Category): Promise<boolean> => {
    const response = await apiClient.put<{ updated: boolean }>(`/categories/${id}`, convertFrontendCategoryToBackend(category));
    return response.data.updated;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<{ deleted: boolean }>(`/categories/${id}`);
    return response.data.deleted;
};

// API функции для товаров
export const fetchProducts = async (limit?: number, offset?: number): Promise<CardProps[]> => {
    let params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await apiClient.get<ProductsResponse>('/products', { params });
    return response.data.products.map(convertBackendProductToFrontend);
};

export const fetchProduct = async (id: string): Promise<CardProps> => {
    const response = await apiClient.get<ProductResponse>(`/products/${id}`);
    return convertBackendProductToFrontend(response.data.product);
};

export const createProduct = async (product: CardProps): Promise<string> => {
    const response = await apiClient.post<{ id: string }>('/products', convertFrontendProductToBackend(product));
    return response.data.id;
};

export const updateProduct = async (id: string, product: CardProps): Promise<boolean> => {
    const response = await apiClient.put<{ updated: boolean }>(`/products/${id}`, convertFrontendProductToBackend(product));
    return response.data.updated;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
    const response = await apiClient.delete<{ deleted: boolean }>(`/products/${id}`);
    return response.data.deleted;
};
