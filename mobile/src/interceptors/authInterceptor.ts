import axios from 'axios';
import tokenService from '../services/tokenService';
import { API_URL } from '../config';

const axiosClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

axiosClient.interceptors.request.use(
    async (config) => {
        const token = await tokenService.getToken();
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await tokenService.refreshToken();
                await tokenService.saveToken(newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                await tokenService.removeToken();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
