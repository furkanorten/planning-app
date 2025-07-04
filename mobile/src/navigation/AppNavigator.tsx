import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { useAuth } from '../context/authContext';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type AppStackParamList = {
    Dashboard: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => {
    return (
        <AuthStack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <AppStack.Navigator
            screenOptions={{ headerShown: false }}
        >
            <AppStack.Screen name="Dashboard" component={DashboardScreen} />
        </AppStack.Navigator>
    );
};

const RootNavigator = () => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
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
        <NavigationContainer>
            {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default RootNavigator;