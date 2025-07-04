import Constants from 'expo-constants';

// Expo development server'ın IP'sini al
const getDeviceIP = () => {
    if (__DEV__ && Constants.expoConfig?.hostUri) {
        // Expo dev server'ın IP'sini parse et (192.168.1.103:8081 -> 192.168.1.103)
        const ip = Constants.expoConfig.hostUri.split(':')[0];
        return ip;
    }

    // Fallback IP (production veya IP bulunamazsa)
    return '192.168.1.103';
};

// Backend API URL'ini dinamik olarak oluştur
const getApiUrl = () => {
    const deviceIP = getDeviceIP();
    const backendPort = '5000';

    if (__DEV__) {
        // Development'ta dinamik IP kullan
        return `http://${deviceIP}:${backendPort}/api`;
    } else {
        // Production'da environment variable veya static URL
        return process.env.EXPO_PUBLIC_API_URL || `http://${deviceIP}:${backendPort}/api`;
    }
};

export const API_URL = getApiUrl();

// Debug için console'da göster
if (__DEV__) {
    console.log('🌐 Dynamic API URL:', API_URL);
    console.log('📱 Device IP:', getDeviceIP());
    console.log('🔧 Expo HostUri:', Constants.expoConfig?.hostUri);
}