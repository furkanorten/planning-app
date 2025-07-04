import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { AuthService } from "../../../auth/services/auth.service";
import { TokenService } from "../../../../core/services/token.service";
import { Router } from "@angular/router";
import {
  DashboardService,
  DashboardStats,
  RecentTask,
  RecentActivity,
  DashboardOverview
} from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  stats: DashboardStats = {
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    monthlyExpenses: 0,
    activeShoppingLists: 0,
    completionRate: 0
  };

  recentTasks: RecentTask[] = [];
  recentActivity: RecentActivity[] = [];

  // UI State
  loading = true;
  isEmpty = false;
  hasData = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Get main dashboard stats first
    this.dashboardService.getDashboardOverview()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (overview: DashboardOverview) => {
          this.stats = overview.stats;
          this.recentActivity = overview.recentActivity;
          this.isEmpty = overview.isEmpty;
          this.hasData = overview.hasData;

          // Get recent tasks separately
          if (this.hasData) {
            this.dashboardService.getRecentTasks().subscribe(tasks => {
              this.recentTasks = tasks;
            });
          }
        },
        error: (error) => {
          console.error('Dashboard loading error:', error);
          this.error = 'Failed to load dashboard data. Please try again.';

          // Set empty state
          this.isEmpty = true;
          this.hasData = false;
        }
      });
  }

  // Actions
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.tokenService.logout();
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Logout error:', err);
          // Logout API başarısız olsa bile local token'ı temizle
          this.tokenService.logout();
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }

  // Navigation
  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  navigateToNotes(): void {
    this.router.navigate(['/notes']);
  }

  navigateToExpenses(): void {
    this.router.navigate(['/expenses']);
  }

  navigateToShopping(): void {
    this.router.navigate(['/shopping']);
  }

  // Quick Actions
  createTask(): void {
    this.router.navigate(['/tasks'], { queryParams: { action: 'create' } });
  }

  createNote(): void {
    this.router.navigate(['/notes'], { queryParams: { action: 'create' } });
  }

  addExpense(): void {
    this.router.navigate(['/expenses'], { queryParams: { action: 'create' } });
  }

  createShoppingList(): void {
    this.router.navigate(['/shopping'], { queryParams: { action: 'create' } });
  }

  // Utility getters
  get completionPercentage(): number {
    return this.stats.totalTasks > 0
      ? Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100)
      : 0;
  }

  get activeTasks(): number {
    return this.stats.totalTasks - this.stats.completedTasks;
  }

  get hasRecentActivity(): boolean {
    return this.recentActivity.length > 0;
  }

  get hasRecentTasks(): boolean {
    return this.recentTasks.length > 0;
  }

  // Helper methods
  formatActivityTime(timestamp: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - timestamp.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'personal': '#3b82f6',
      'work': '#8b5cf6',
      'health': '#10b981',
      'education': '#f59e0b',
      'food': '#ef4444',
      'transport': '#06b6d4',
      'other': '#6b7280'
    };
    return colors[category] || colors['other'];
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444'
    };
    return colors[priority] || colors['medium'];
  }
}
