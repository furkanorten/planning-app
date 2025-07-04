import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../../auth/services/auth.service";
import { TokenService } from "../../../../core/services/token.service";
import { Router } from "@angular/router";

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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    monthlyExpenses: 0
  };

  recentTasks: RecentTask[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // TODO: Backend hazır olunca gerçek API çağrıları yapılacak
    // Şimdilik mock data
    setTimeout(() => {
      this.stats = {
        totalTasks: 12,
        completedTasks: 8,
        totalNotes: 5,
        monthlyExpenses: 1250
      };

      this.recentTasks = [
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
      ];

      this.loading = false;
    }, 1000);
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
}
