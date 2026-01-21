import { api } from './axios';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@/types';

export const productsApi = {
    getAll: async (): Promise<ProductDto[]> => {
        const response = await api.get<ProductDto[]>('/Products');
        return response.data;
    },
    getById: async (id: number): Promise<ProductDto> => {
        const response = await api.get<ProductDto>(`/Products/${id}`);
        return response.data;
    },
    create: async (data: CreateProductDto): Promise<ProductDto> => {
        const response = await api.post<ProductDto>('/Products', data);
        return response.data;
    },
    update: async (id: number, data: UpdateProductDto): Promise<ProductDto> => {
        const response = await api.put<ProductDto>(`/Products/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/Products/${id}`);
    },
};
