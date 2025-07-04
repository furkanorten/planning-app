import React, { useState, useEffect } from 'react';
import RootNavigator from './src/navigation/AppNavigator';
import * as Font from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from './src/context/authContext';

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            try {
                await Font.loadAsync({
                    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
                    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
                    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
                });
                setFontsLoaded(true);
            } catch (error) {
                console.error('Font loading failed:', error);
                setFontsLoaded(true); // Fontlar yüklenemese bile devam et
            }
        }
        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9fafb'
            }}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}