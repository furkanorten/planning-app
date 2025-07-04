import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Mail, Lock, AlertCircle, XCircle, LogIn } from 'lucide-react-native';
import { colors } from '../config/colors';
import { useAuth } from '../context/authContext';
import { login as loginApi } from '../services/authService';
import { AuthStackParamList } from '../navigation/AppNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({ email: false, password: false });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { login: loginContext } = useAuth();

    // Android back button handling
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // Exit app instead of going back in auth stack
                BackHandler.exitApp();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const handleLogin = async () => {
        setErrorMessage('');

        if (!email || !password) {
            setTouched({ email: true, password: true });
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage('Valid email is required');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Minimum 6 characters required');
            return;
        }

        setLoading(true);
        try {
            const response = await loginApi({ email, password });
            await loginContext(response.data.token);
            // Auth context will handle navigation automatically
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Login failed. Please try again.';
            setErrorMessage(message);
            Alert.alert('Login Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#f8fafc', '#e0e7ff']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Background Decoration */}
                        <View style={styles.decorationContainer}>
                            <View style={[styles.decorationCircle, styles.circle1]} />
                            <View style={[styles.decorationCircle, styles.circle2]} />
                            <View style={[styles.decorationCircle, styles.circle3]} />
                        </View>

                        {/* Auth Card */}
                        <View style={styles.authCard}>
                            {/* Header */}
                            <View style={styles.authHeader}>
                                <View style={styles.authIcon}>
                                    <Shield size={28} color="white" />
                                </View>
                                <Text style={styles.title}>Welcome Back!</Text>
                                <Text style={styles.subtitle}>Please sign in to your account</Text>
                            </View>

                            {/* Form */}
                            <View style={styles.formContainer}>
                                {/* Email Field */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputIcon}>
                                            <Mail size={18} color={touched.email && email && !validateEmail(email) ? colors.error : colors.text} />
                                        </View>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                touched.email && (!email || !validateEmail(email)) && styles.inputError
                                            ]}
                                            placeholder="Enter your email"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={setEmail}
                                            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                        />
                                    </View>
                                    {touched.email && (!email || !validateEmail(email)) && (
                                        <View style={styles.errorContainer}>
                                            <AlertCircle size={16} color={colors.error} />
                                            <Text style={styles.errorText}>Valid email is required</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Password Field */}
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.inputIcon}>
                                            <Lock size={18} color={touched.password && password.length < 6 ? colors.error : colors.text} />
                                        </View>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                touched.password && password.length < 6 && styles.inputError
                                            ]}
                                            placeholder="Enter your password"
                                            placeholderTextColor="#94a3b8"
                                            secureTextEntry
                                            value={password}
                                            onChangeText={setPassword}
                                            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                                        />
                                    </View>
                                    {touched.password && password.length < 6 && (
                                        <View style={styles.errorContainer}>
                                            <AlertCircle size={16} color={colors.error} />
                                            <Text style={styles.errorText}>Minimum 6 characters required</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Global Error */}
                                {errorMessage ? (
                                    <View style={styles.globalError}>
                                        <XCircle size={18} color={colors.error} />
                                        <Text style={styles.globalErrorText}>{errorMessage}</Text>
                                    </View>
                                ) : null}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        (loading || !email || !password || !validateEmail(email) || password.length < 6) && styles.submitButtonDisabled
                                    ]}
                                    onPress={handleLogin}
                                    disabled={loading || !email || !password || !validateEmail(email) || password.length < 6}
                                >
                                    <LinearGradient
                                        colors={['#4f46e5', '#6366f1']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {loading ? (
                                            <View style={styles.buttonContent}>
                                                <ActivityIndicator color="white" size="small" />
                                                <Text style={styles.buttonText}>Signing in...</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.buttonContent}>
                                                <LogIn size={18} color="white" />
                                                <Text style={styles.buttonText}>Sign In</Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    Don't have an account?{' '}
                                    <Text
                                        style={styles.footerLink}
                                        onPress={() => navigation.navigate('Register')}
                                    >
                                        Create one here
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        minHeight: '100%',
    },
    decorationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    decorationCircle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
    },
    circle1: {
        width: 320,
        height: 320,
        top: -160,
        left: -160,
    },
    circle2: {
        width: 256,
        height: 256,
        bottom: -128,
        right: -128,
    },
    circle3: {
        width: 192,
        height: 192,
        top: '50%',
        left: -96,
    },
    authCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 40,
        marginHorizontal: 20,
        maxWidth: 440,
        alignSelf: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 20,
        },
        shadowOpacity: 0.1,
        shadowRadius: 25,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    authHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    authIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#4f46e5',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Poppins-Bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
    },
    formContainer: {
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#334155',
        marginBottom: 8,
        letterSpacing: 0.25,
    },
    inputContainer: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        width: 24,
        height: '100%',
    },
    input: {
        height: 56,
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingLeft: 48,
        paddingRight: 16,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        backgroundColor: 'white',
        color: '#1e293b',
        textAlignVertical: 'center', // Android için
        includeFontPadding: false, // Android için
    },
    inputError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    errorText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.error,
        marginLeft: 8,
        flex: 1,
    },
    globalError: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    globalErrorText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: colors.error,
        flex: 1,
        marginLeft: 12,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#4f46e5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0.1,
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 24, // Icon boyutuna eşit
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: 'white',
        marginLeft: 8,
        lineHeight: 20, // Font size'a yakın değer
        includeFontPadding: false, // Android için
    },
    footer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#64748b',
        textAlign: 'center',
    },
    footerLink: {
        color: '#4f46e5',
        fontFamily: 'Poppins-Bold',
    },
});

export default LoginScreen;