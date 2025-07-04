import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Dashboard Interfaces (Backend'e uygun)
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalNotes: number;
  monthlyExpenses: number;
  activeShoppingLists: number;
  completionRate: number;
}

export interface RecentTask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  category?: string;
  priority?: string;
}

export interface RecentActivity {
  type: 'task' | 'note' | 'expense' | 'shopping';
  action: string;
  title: string;
  timestamp: Date;
  icon: string;
  category?: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentTasks: RecentTask[];
  recentActivity: RecentActivity[];
  isEmpty: boolean;
  hasData: boolean;
  trends?: any;
  achievements?: any[];
}

// Backend API Response Interface
interface DashboardStatsResponse {
  success: boolean;
  data: {
    overview: {
      totalTasks: number;
      completedTasks: number;
      totalNotes: number;
      monthlyExpenses: number;
      activeShoppingLists: number;
      completionRate: number;
    };
    tasks: any;
    notes: any;
    expenses: any;
    shopping: any;
    recentActivity: RecentActivity[];
    trends: any;
    achievements: any[];
  };
  meta: {
    timeRange: number;
    generatedAt: string;
    userId: string;
  };
}

interface TasksResponse {
  success: boolean;
  data: RecentTask[];
  count: number;
}

interface ActivityResponse {
  success: boolean;
  data: RecentActivity[];
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get comprehensive dashboard data from single endpoint
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardStatsResponse>(`${this.API_URL}/dashboard/stats`)
      .pipe(
        map(response => {
          const data = response.data;
          const stats: DashboardStats = {
            totalTasks: data.overview.totalTasks,
            completedTasks: data.overview.completedTasks,
            totalNotes: data.overview.totalNotes,
            monthlyExpenses: data.overview.monthlyExpenses,
            activeShoppingLists: data.overview.activeShoppingLists,
            completionRate: data.overview.completionRate
          };

          const recentActivity = data.recentActivity.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }));

          const hasData = stats.totalTasks > 0 || stats.totalNotes > 0 || stats.monthlyExpenses > 0;
          const isEmpty = !hasData;

          return {
            stats,
            recentTasks: [], // Will get from separate endpoint
            recentActivity,
            isEmpty,
            hasData,
            trends: data.trends,
            achievements: data.achievements
          };
        }),
        catchError(error => {
          console.error('Dashboard stats error:', error);
          return of({
            stats: {
              totalTasks: 0,
              completedTasks: 0,
              totalNotes: 0,
              monthlyExpenses: 0,
              activeShoppingLists: 0,
              completionRate: 0
            },
            recentTasks: [],
            recentActivity: [],
            isEmpty: true,
            hasData: false
          });
        })
      );
  }

  // Get recent tasks from tasks endpoint
  getRecentTasks(limit: number = 5): Observable<RecentTask[]> {
    return this.http.get<TasksResponse>(`${this.API_URL}/tasks/recent?limit=${limit}`)
      .pipe(
        map(response => response.data.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }))),
        catchError(() => of([]))
      );
  }

  // Get recent activity from dashboard endpoint
  getRecentActivity(limit: number = 10): Observable<RecentActivity[]> {
    return this.http.get<ActivityResponse>(`${this.API_URL}/dashboard/activity?limit=${limit}`)
      .pipe(
        map(response => response.data.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))),
        catchError(() => of([]))
      );
  }

  // Get productivity analytics
  getProductivityAnalytics(period: 'week' | 'month' | 'year' = 'week'): Observable<any> {
    return this.http.get(`${this.API_URL}/dashboard/analytics/productivity?period=${period}`)
      .pipe(
        map((response: any) => response.data),
        catchError(() => of(null))
      );
  }

  // Get dashboard data with recent tasks
  getCompleteDashboard(): Observable<DashboardOverview> {
    return this.getDashboardOverview().pipe(
      map(overview => {
        // Get recent tasks separately and add to overview
        this.getRecentTasks().subscribe(tasks => {
          overview.recentTasks = tasks;
        });
        return overview;
      })
    );
  }

  // Refresh data
  refreshDashboard(): Observable<DashboardOverview> {
    return this.getDashboardOverview();
  }

}
