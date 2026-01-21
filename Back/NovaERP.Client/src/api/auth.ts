import { api } from './axios';
import { LoginDto, AuthResponseDto } from '@/types';

export const authApi = {
    login: async (data: LoginDto): Promise<AuthResponseDto> => {
        const response = await api.post<AuthResponseDto>('/Auth/login', data);
        return response.data;
    },
};
