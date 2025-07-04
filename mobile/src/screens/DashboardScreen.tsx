import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
    StatusBar,
    Platform,
    ActivityIndicator,
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
    List,
    ChevronRight,
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
    totalShoppingLists: number;
    monthlyExpenses: number;
}

interface RecentTask {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
}

interface RecentNote {
    id: string;
    title: string;
    category: string;
    createdAt: Date;
}

interface LastShoppingList {
    id: string;
    name: string;
    itemCount: number;
    completedItems: number;
    createdAt: Date;
}

interface MonthlyExpenseData {
    month: string;
    amount: number;
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
        totalShoppingLists: 0,
        monthlyExpenses: 0
    });

    const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
    const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
    const [lastShoppingList, setLastShoppingList] = useState<LastShoppingList | null>(null);
    const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpenseData[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // TODO: Backend hazır olunca gerçek API çağrıları yapılacak
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalTasks: 12,
                completedTasks: 8,
                totalNotes: 5,
                totalShoppingLists: 3,
                monthlyExpenses: 1250
            });

            setRecentTasks([
                {
                    id: '1',
                    title: 'Complete project documentation',
                    completed: false,
                    createdAt: new Date('2025-07-03')
                },
                {
                    id: '2',
                    title: 'Review pull requests',
                    completed: true,
                    createdAt: new Date('2025-07-02')
                },
                {
                    id: '3',
                    title: 'Setup CI/CD pipeline',
                    completed: false,
                    createdAt: new Date('2025-07-01')
                }
            ]);

            setRecentNotes([
                {
                    id: '1',
                    title: 'Meeting notes with client',
                    category: 'Work',
                    createdAt: new Date('2025-07-03')
                },
                {
                    id: '2',
                    title: 'Recipe for chocolate cake',
                    category: 'Personal',
                    createdAt: new Date('2025-07-02')
                },
                {
                    id: '3',
                    title: 'Book recommendations',
                    category: 'Education',
                    createdAt: new Date('2025-07-01')
                }
            ]);

            setLastShoppingList({
                id: '1',
                name: 'Weekly Groceries',
                itemCount: 12,
                completedItems: 7,
                createdAt: new Date('2025-07-03')
            });

            setMonthlyExpenses([
                { month: 'Jan', amount: 1100 },
                { month: 'Feb', amount: 950 },
                { month: 'Mar', amount: 1300 },
                { month: 'Apr', amount: 1150 },
                { month: 'May', amount: 1400 },
                { month: 'Jun', amount: 1250 }
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
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
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const navigateToTasks = () => {
        console.log('Navigate to Tasks');
    };

    const navigateToNotes = () => {
        console.log('Navigate to Notes');
    };

    const navigateToShopping = () => {
        console.log('Navigate to Shopping Lists');
    };

    const navigateToExpenses = () => {
        console.log('Navigate to Expenses');
    };

    const openAddTask = () => {
        console.log('Open Add Task Modal');
    };

    const openAddNote = () => {
        console.log('Open Add Note Modal');
    };

    const openAddShoppingList = () => {
        console.log('Open Add Shopping List Modal');
    };

    const openAddExpense = () => {
        console.log('Open Add Expense Modal');
    };

    const getShoppingProgress = (): number => {
        if (!lastShoppingList) return 0;
        return (lastShoppingList.completedItems / lastShoppingList.itemCount) * 100;
    };

    const getMonthlyAverage = (): number => {
        if (monthlyExpenses.length === 0) return 0;
        const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        return total / monthlyExpenses.length;
    };

    const getBarHeight = (amount: number): number => {
        if (monthlyExpenses.length === 0) return 20;
        const max = Math.max(...monthlyExpenses.map(e => e.amount));
        return Math.max((amount / max) * 100, 20);
    };

    const toggleTaskComplete = (taskId: string) => {
        setRecentTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <LogOut size={16} color="white" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Stats Cards */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        {/* Tasks Card */}
                        <TouchableOpacity style={[styles.statCard, styles.tasksCard]} onPress={navigateToTasks}>
                            <View style={[styles.statIcon, styles.tasksIcon]}>
                                <CheckSquare size={20} color="#1d4ed8" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber} numberOfLines={1}>{stats.completedTasks}/{stats.totalTasks}</Text>
                                <Text style={styles.statLabel} numberOfLines={1}>Completed Tasks</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Notes Card */}
                        <TouchableOpacity style={[styles.statCard, styles.notesCard]} onPress={navigateToNotes}>
                            <View style={[styles.statIcon, styles.notesIcon]}>
                                <FileText size={20} color="#059669" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber} numberOfLines={1}>{stats.totalNotes}</Text>
                                <Text style={styles.statLabel} numberOfLines={1}>Total Notes</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Shopping Lists Card */}
                        <TouchableOpacity style={[styles.statCard, styles.shoppingCard]} onPress={navigateToShopping}>
                            <View style={[styles.statIcon, styles.shoppingIcon]}>
                                <ShoppingCart size={16} color="#d97706" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber} numberOfLines={1}>{stats.totalShoppingLists}</Text>
                                <Text style={styles.statLabel} numberOfLines={1}>Shopping List</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Expenses Card */}
                        <TouchableOpacity style={[styles.statCard, styles.expensesCard]} onPress={navigateToExpenses}>
                            <View style={[styles.statIcon, styles.expensesIcon]}>
                                <DollarSign size={24} color="#be185d" />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statNumber}>{formatCurrency(stats.monthlyExpenses)}</Text>
                                <Text style={styles.statLabel}>This Month</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={styles.actionButton} onPress={openAddTask}>
                            <View style={[styles.actionIcon, styles.tasksIcon]}>
                                <Plus size={20} color="#1d4ed8" />
                            </View>
                            <Text style={styles.actionButtonText} numberOfLines={1}>Add Task</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={openAddNote}>
                            <View style={[styles.actionIcon, styles.notesIcon]}>
                                <PenTool size={20} color="#059669" />
                            </View>
                            <Text style={styles.actionButtonText} numberOfLines={1}>Add Note</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={openAddShoppingList}>
                            <View style={[styles.actionIcon, styles.shoppingIcon]}>
                                <List size={20} color="#d97706" />
                            </View>
                            <Text style={styles.actionButtonText} numberOfLines={1}>Add Shopping List</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={openAddExpense}>
                            <View style={[styles.actionIcon, styles.expensesIcon]}>
                                <CreditCard size={20} color="#be185d" />
                            </View>
                            <Text style={styles.actionButtonText} numberOfLines={1}>Add Expense</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content Cards */}
                <View style={styles.contentSection}>
                    {/* Recent Tasks */}
                    <View style={styles.contentCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Recent Tasks</Text>
                            <TouchableOpacity style={styles.viewAllButton} onPress={navigateToTasks}>
                                <Text style={styles.viewAllText}>View All</Text>
                                <ChevronRight size={14} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cardContent}>
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task) => (
                                    <View key={task.id} style={styles.taskItem}>
                                        <View style={styles.taskInfo}>
                                            <TouchableOpacity
                                                style={styles.taskCheckbox}
                                                onPress={() => toggleTaskComplete(task.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[
                                                    styles.checkbox,
                                                    task.completed && styles.checkboxCompleted
                                                ]}>
                                                    {task.completed && <CheckSquare size={12} color="white" />}
                                                </View>
                                            </TouchableOpacity>
                                            <View style={styles.taskDetails}>
                                                <Text style={[
                                                    styles.taskTitle,
                                                    task.completed && styles.taskTitleCompleted
                                                ]} numberOfLines={1}>
                                                    {task.title}
                                                </Text>
                                                <Text style={styles.taskDate}>{formatDate(task.createdAt)}</Text>
                                            </View>
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
                                    <CheckSquare size={32} color="#cbd5e1" />
                                    <Text style={styles.emptyStateText}>No tasks yet. Create your first task!</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Recent Notes */}
                    <View style={styles.contentCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Recent Notes</Text>
                            <TouchableOpacity style={styles.viewAllButton} onPress={navigateToNotes}>
                                <Text style={styles.viewAllText}>View All</Text>
                                <ChevronRight size={14} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cardContent}>
                            {recentNotes.length > 0 ? (
                                recentNotes.map((note) => (
                                    <View key={note.id} style={styles.noteItem}>
                                        <View style={styles.noteIcon}>
                                            <FileText size={16} color="#059669" />
                                        </View>
                                        <View style={styles.noteInfo}>
                                            <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                                            <View style={styles.noteMeta}>
                                                <Text style={styles.noteCategory}>{note.category}</Text>
                                                <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <FileText size={32} color="#cbd5e1" />
                                    <Text style={styles.emptyStateText}>No notes yet. Create your first note!</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Last Shopping List */}
                    <View style={styles.contentCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Last Shopping List</Text>
                            <TouchableOpacity style={styles.viewAllButton} onPress={navigateToShopping}>
                                <Text style={styles.viewAllText}>View Lists</Text>
                                <ChevronRight size={14} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cardContent}>
                            {lastShoppingList ? (
                                <View style={styles.shoppingList}>
                                    <View style={styles.shoppingHeader}>
                                        <View style={styles.shoppingIconContainer}>
                                            <ShoppingCart size={20} color="#d97706" />
                                        </View>
                                        <View style={styles.shoppingInfo}>
                                            <Text style={styles.shoppingTitle} numberOfLines={1}>{lastShoppingList.name}</Text>
                                            <Text style={styles.shoppingSubtitle}>
                                                {lastShoppingList.completedItems}/{lastShoppingList.itemCount} items completed
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.shoppingProgress}>
                                        <View style={styles.progressBar}>
                                            <View style={[
                                                styles.progressFill,
                                                { width: `${getShoppingProgress()}%` }
                                            ]} />
                                        </View>
                                        <Text style={styles.progressText}>{Math.round(getShoppingProgress())}%</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <ShoppingCart size={32} color="#cbd5e1" />
                                    <Text style={styles.emptyStateText}>No shopping lists yet. Create your first list!</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Monthly Expenses Chart */}
                    <View style={[styles.contentCard, styles.chartCard]}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>Monthly Expenses</Text>
                            <TouchableOpacity style={styles.viewAllButton} onPress={navigateToExpenses}>
                                <Text style={styles.viewAllText}>View Details</Text>
                                <ChevronRight size={14} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.cardContent}>
                            {monthlyExpenses.length > 0 ? (
                                <View style={styles.chart}>
                                    <View style={styles.chartBars}>
                                        {monthlyExpenses.map((expense) => (
                                            <View key={expense.month} style={styles.chartBar}>
                                                <View
                                                    style={[
                                                        styles.barFill,
                                                        { height: `${getBarHeight(expense.amount)}%` }
                                                    ]}
                                                />
                                                <Text style={styles.barLabel}>{expense.month}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.chartInfo}>
                                        <Text style={styles.chartInfoText}>
                                            Average: {formatCurrency(Math.round(getMonthlyAverage()))}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <DollarSign size={32} color="#cbd5e1" />
                                    <Text style={styles.emptyStateText}>No expense data available</Text>
                                </View>
                            )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '400',
        fontFamily: 'Poppins-Regular',
    },
    content: {
        flex: 1,
    },

    headerContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },

    statsSection: {
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '48%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    tasksIcon: {
        backgroundColor: '#dbeafe',
    },
    notesIcon: {
        backgroundColor: '#ecfdf5',
    },
    shoppingIcon: {
        backgroundColor: '#fef3c7',
    },
    expensesIcon: {
        backgroundColor: '#fce7f3',
    },
    statContent: {
        flex: 1,
        gap: 2,
        minWidth: 0,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        fontFamily: 'Poppins-SemiBold',
        numberOfLines: 1,
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '400',
        fontFamily: 'Poppins-Regular',
        numberOfLines: 1,
        flexShrink: 1,
    },

    quickActionsSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    quickActionsGrid: {
        flexDirection: 'column',
        gap: 12,
    },
    actionButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    actionIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
        fontFamily: 'Poppins-Medium',
        numberOfLines: 1,
    },

    contentSection: {
        padding: 16,
        gap: 16,
    },
    contentCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    chartCard: {
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 0,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4f46e5',
    },
    cardContent: {
        padding: 16,
    },

    taskItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    taskInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    taskCheckbox: {
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    checkboxCompleted: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    taskDetails: {
        flex: 1,
        gap: 2,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        fontFamily: 'Poppins-Medium',
        numberOfLines: 1,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#64748b',
    },
    taskDate: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'Poppins-Regular',
    },
    taskStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    taskStatusCompleted: {
        backgroundColor: '#dcfce7',
    },
    taskStatusPending: {
        backgroundColor: '#fef3c7',
    },
    taskStatusText: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
    },
    taskStatusTextCompleted: {
        color: '#15803d',
    },
    taskStatusTextPending: {
        color: '#d97706',
    },

    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    noteIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#ecfdf5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noteInfo: {
        flex: 1,
        gap: 2,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        fontFamily: 'Poppins-Medium',
        numberOfLines: 1,
    },
    noteMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    noteCategory: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: 'Poppins-Medium',
    },
    noteDate: {
        fontSize: 12,
        color: '#94a3b8',
        fontFamily: 'Poppins-Regular',
    },

    shoppingList: {
        gap: 12,
    },
    shoppingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    shoppingIconContainer: {
        width: 32,
        height: 32,
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shoppingInfo: {
        flex: 1,
        gap: 2,
    },
    shoppingTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        fontFamily: 'Poppins-Medium',
        numberOfLines: 1,
    },
    shoppingSubtitle: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'Poppins-Regular',
    },
    shoppingProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10b981',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
        minWidth: 36,
        textAlign: 'right',
        fontFamily: 'Poppins-SemiBold',
    },

    chart: {
        marginTop: 20,
        gap: 16,
    },
    chartBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 6,
        height: 100,
        paddingHorizontal: 4,
        paddingBottom: 4,
    },
    barFill: {
        width: '100%',
        backgroundColor: '#be185d',
        borderRadius: 4,
        minHeight: 8,
    },
    barLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        fontFamily: 'Poppins-Medium',
    },
    chartInfo: {
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    chartInfoText: {
        fontSize: 14,
        color: '#64748b',
        fontFamily: 'Poppins-Regular',
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
});

export default DashboardScreen;