import axiosClient from '../interceptors/authInterceptor';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export const login = (data: LoginRequest) => {
    return axiosClient.post<AuthResponse>('/auth/login', data);
};

export const register = (data: RegisterRequest) => {
    return axiosClient.post<AuthResponse>('/auth/register', data);
};

export const logout = () => {
    return axiosClient.post('/auth/logout');
};
