import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    RefreshControl,
    StatusBar,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    CheckSquare,
    FileText,
    ShoppingCart,
    DollarSign,
    Plus,
    PenTool,
    CreditCard,
    LogOut,
    BarChart3
} from 'lucide-react-native';
import { useAuth } from '../context/authContext';
import { AppStackParamList } from '../navigation/AppNavigator';

type DashboardScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

interface Props {
    navigation: DashboardScreenNavigationProp;
}

interface DashboardStats {
    totalTasks: number;
    completedTasks: number;
    totalNotes: number;
    monthlyExpenses: number;
}

interface RecentTask {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}

const DashboardScreen = ({ navigation }: Props) => {
    const { logout } = useAuth();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState<DashboardStats>({
        totalTasks: 0,
        completedTasks: 0,
        totalNotes: 0,
        monthlyExpenses: 0
    });

    const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // TODO: Backend hazır olunca gerçek API çağrıları yapılacak
            // Şimdilik mock data
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalTasks: 12,
                completedTasks: 8,
                totalNotes: 5,
                monthlyExpenses: 1250
            });

            setRecentTasks([
                {
                    id: '1',
                    title: 'Complete project documentation',
                    completed: false,
                    createdAt: new Date('2025-01-15')
                },
                {
                    id: '2',
                    title: 'Review pull requests',
                    completed: true,
                    createdAt: new Date('2025-01-14')
                },
                {
                    id: '3',
                    title: 'Setup CI/CD pipeline',
                    completed: false,
                    createdAt: new Date('2025-01-13')
                }
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // Auth context will handle navigation automatically
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Logout failed. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="white"
                translucent={false}
            />

            {/* Header with manual safe area */}
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <LogOut size={14} color="white" />
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Section */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        {/* Total Tasks */}
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, styles.taskIcon]}>
                                <CheckSquare size={24} color="#1d4ed8" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber}>{stats.totalTasks}</Text>
                                <Text style={styles.statLabel}>Total Tasks</Text>
                            </View>
                        </View>

                        {/* Completed Tasks */}
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, styles.completedIcon]}>
                                <CheckSquare size={24} color="#16a34a" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber}>{stats.completedTasks}</Text>
                                <Text style={styles.statLabel}>Completed</Text>
                            </View>
                        </View>

                        {/* Notes */}
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, styles.notesIcon]}>
                                <FileText size={24} color="#d97706" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber}>{stats.totalNotes}</Text>
                                <Text style={styles.statLabel}>Notes</Text>
                            </View>
                        </View>

                        {/* Monthly Expenses */}
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, styles.expensesIcon]}>
                                <DollarSign size={24} color="#e91e63" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber}>${stats.monthlyExpenses}</Text>
                                <Text style={styles.statLabel}>This Month</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    <View style={styles.mainGrid}>
                        {/* Recent Tasks */}
                        <View style={styles.contentCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Recent Tasks</Text>
                                <TouchableOpacity>
                                    <Text style={styles.viewAllLink}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.cardContent}>
                                {recentTasks.length > 0 ? (
                                    recentTasks.map((task) => (
                                        <View key={task.id} style={styles.taskItem}>
                                            <View style={styles.taskInfo}>
                                                <Text style={styles.taskTitle}>{task.title}</Text>
                                                <Text style={styles.taskDate}>{formatDate(task.createdAt)}</Text>
                                            </View>
                                            <View style={[
                                                styles.taskStatus,
                                                task.completed ? styles.taskStatusCompleted : styles.taskStatusPending
                                            ]}>
                                                <Text style={[
                                                    styles.taskStatusText,
                                                    task.completed ? styles.taskStatusTextCompleted : styles.taskStatusTextPending
                                                ]}>
                                                    {task.completed ? 'Completed' : 'Pending'}
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyStateText}>
                                            No tasks yet. Start by creating your first task!
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.contentCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Quick Actions</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <View style={styles.quickActions}>
                                    <TouchableOpacity style={[styles.actionButton, styles.taskActionButton]}>
                                        <Plus size={20} color="#64748b" />
                                        <Text style={styles.actionButtonText}>Add Task</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.actionButton, styles.noteActionButton]}>
                                        <PenTool size={20} color="#64748b" />
                                        <Text style={styles.actionButtonText}>New Note</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.actionButton, styles.shoppingActionButton]}>
                                        <ShoppingCart size={20} color="#64748b" />
                                        <Text style={styles.actionButtonText}>Shopping List</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.actionButton, styles.expenseActionButton]}>
                                        <CreditCard size={20} color="#64748b" />
                                        <Text style={styles.actionButtonText}>Add Expense</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Chart Placeholder */}
                    <View style={[styles.contentCard, styles.fullWidthCard]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Monthly Expenses</Text>
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.chartPlaceholder}>
                                <BarChart3 size={48} color="#94a3b8" />
                                <Text style={styles.chartPlaceholderText}>
                                    Expense chart will be implemented here
                                </Text>
                                <Text style={styles.chartPlaceholderSubtext}>
                                    Coming soon with Chart.js integration
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    // Header Styles
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16, // Equal top and bottom padding
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Perfect vertical center alignment
        minHeight: 36, // Match button height
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#1e293b',
        lineHeight: 28, // Slightly larger for better text rendering
        includeFontPadding: false, // Android: Remove extra font padding
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#64748b',
        display: 'none', // Hide on mobile for space
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 6,
        gap: 4,
        minHeight: 36, // Increased for better text visibility
    },
    logoutButtonText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: 'white',
        lineHeight: 16, // Explicit lineHeight for proper text rendering
        includeFontPadding: false, // Android: Remove extra font padding
        textAlignVertical: 'center', // Android: Center text vertically
    },
    // Content Styles
    content: {
        flex: 1,
    },
    // Stats Section
    statsSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '48%',
        minWidth: 140,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    taskIcon: {
        backgroundColor: '#dbeafe',
    },
    completedIcon: {
        backgroundColor: '#dcfce7',
    },
    notesIcon: {
        backgroundColor: '#fef3c7',
    },
    expensesIcon: {
        backgroundColor: '#fce7f3',
    },
    statContent: {
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#1e293b',
        lineHeight: 24,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'Poppins-Regular',
        color: '#64748b',
        marginTop: 1,
    },
    // Main Content
    mainContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    mainGrid: {
        gap: 16,
        marginBottom: 16,
    },
    contentCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    fullWidthCard: {
        // Already full width in mobile layout
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 0,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#1e293b',
        flex: 1,
    },
    viewAllLink: {
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
        color: '#4f46e5',
        flexShrink: 0,
    },
    cardContent: {
        padding: 16,
    },
    // Task Items
    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    taskInfo: {
        flex: 1,
        gap: 4,
    },
    taskTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#1e293b',
        lineHeight: 18,
        flex: 1,
        marginRight: 8,
    },
    taskDate: {
        fontSize: 11,
        fontFamily: 'Poppins-Regular',
        color: '#64748b',
    },
    taskStatus: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginLeft: 12,
    },
    taskStatusCompleted: {
        backgroundColor: '#dcfce7',
    },
    taskStatusPending: {
        backgroundColor: '#fef3c7',
    },
    taskStatusText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
    },
    taskStatusTextCompleted: {
        color: '#16a34a',
    },
    taskStatusTextPending: {
        color: '#d97706',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#64748b',
        textAlign: 'center',
    },
    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    actionButton: {
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: '48%',
        minHeight: 70,
    },
    taskActionButton: {
        // Will be styled on press
    },
    noteActionButton: {
        // Will be styled on press
    },
    shoppingActionButton: {
        // Will be styled on press
    },
    expenseActionButton: {
        // Will be styled on press
    },
    actionButtonText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: '#1e293b',
        textAlign: 'center',
        lineHeight: 14,
    },
    // Chart Placeholder
    chartPlaceholder: {
        alignItems: 'center',
        paddingVertical: 48,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
    },
    chartPlaceholderText: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#64748b',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    chartPlaceholderSubtext: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#94a3b8',
        textAlign: 'center',
    },
});

export default DashboardScreen;