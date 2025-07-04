import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

class TokenService {
    private readonly TOKEN_KEY = 'access_token';

    async saveToken(token: string): Promise<void> {
        await AsyncStorage.setItem(this.TOKEN_KEY, token);
    }

    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(this.TOKEN_KEY);
    }

    async removeToken(): Promise<void> {
        await AsyncStorage.removeItem(this.TOKEN_KEY);
    }

    async isLoggedIn(): Promise<boolean> {
        const token = await this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            return expiry > now;
        } catch {
            return false;
        }
    }

    async refreshToken(): Promise<string> {
        const res = await axios.post<{ token: string }>(
            `${API_URL}/auth/refresh-token`,
            {},
            { withCredentials: true }
        );
        return res.data.token;
    }
}

export default new TokenService();
