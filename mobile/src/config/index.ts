import Constants from 'expo-constants';

const getDeviceIP = () => {
    if (__DEV__ && Constants.expoConfig?.hostUri) {
        const ip = Constants.expoConfig.hostUri.split(':')[0];
        return ip;
    }

    return '192.168.1.103';
};

const getApiUrl = () => {
    const deviceIP = getDeviceIP();
    const backendPort = '5000';

    if (__DEV__) {
        return `http://${deviceIP}:${backendPort}/api`;
    } else {
        return process.env.EXPO_PUBLIC_API_URL || `http://${deviceIP}:${backendPort}/api`;
    }
};

export const API_URL = getApiUrl();

if (__DEV__) {
    console.log('🌐 Dynamic API URL:', API_URL);
    console.log('📱 Device IP:', getDeviceIP());
    console.log('🔧 Expo HostUri:', Constants.expoConfig?.hostUri);
}