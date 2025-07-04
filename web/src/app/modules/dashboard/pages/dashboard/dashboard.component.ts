import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../../auth/services/auth.service";
import { TokenService } from "../../../../core/services/token.service";
import { Router } from "@angular/router";

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
    totalShoppingLists: 0,
    monthlyExpenses: 0
  };

  recentTasks: RecentTask[] = [];
  recentNotes: RecentNote[] = [];
  lastShoppingList: LastShoppingList | null = null;
  monthlyExpenses: MonthlyExpenseData[] = [];
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
    setTimeout(() => {
      this.stats = {
        totalTasks: 12,
        completedTasks: 8,
        totalNotes: 5,
        totalShoppingLists: 3,
        monthlyExpenses: 1250
      };

      this.recentTasks = [
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
      ];

      this.recentNotes = [
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
      ];

      this.lastShoppingList = {
        id: '1',
        name: 'Weekly Groceries',
        itemCount: 12,
        completedItems: 7,
        createdAt: new Date('2025-07-03')
      };

      this.monthlyExpenses = [
        { month: 'Jan', amount: 1100 },
        { month: 'Feb', amount: 950 },
        { month: 'Mar', amount: 1300 },
        { month: 'Apr', amount: 1150 },
        { month: 'May', amount: 1400 },
        { month: 'Jun', amount: 1250 }
      ];

      this.loading = false;
    }, 1000);
  }

  navigateToTasks(): void {
    // TODO: Tasks modülü oluşturulunca routing eklenecek
    console.log('Navigate to Tasks');
  }

  navigateToNotes(): void {
    // TODO: Notes modülü oluşturulunca routing eklenecek
    console.log('Navigate to Notes');
  }

  navigateToShopping(): void {
    // TODO: Shopping modülü oluşturulunca routing eklenecek
    console.log('Navigate to Shopping Lists');
  }

  navigateToExpenses(): void {
    // TODO: Expenses modülü oluşturulunca routing eklenecek
    console.log('Navigate to Expenses');
  }

  openAddTask(): void {
    // TODO: Task add modal açılacak
    console.log('Open Add Task Modal');
  }

  openAddNote(): void {
    // TODO: Note add modal açılacak
    console.log('Open Add Note Modal');
  }

  openAddShoppingList(): void {
    // TODO: Shopping list add modal açılacak
    console.log('Open Add Shopping List Modal');
  }

  openAddExpense(): void {
    // TODO: Expense add modal açılacak
    console.log('Open Add Expense Modal');
  }

  viewAllTasks(): void {
    this.navigateToTasks();
  }

  viewAllNotes(): void {
    this.navigateToNotes();
  }

  viewShoppingList(): void {
    this.navigateToShopping();
  }

  getShoppingProgress(): number {
    if (!this.lastShoppingList) return 0;
    return (this.lastShoppingList.completedItems / this.lastShoppingList.itemCount) * 100;
  }

  getMonthlyAverage(): number {
    if (this.monthlyExpenses.length === 0) return 0;
    const total = this.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return total / this.monthlyExpenses.length;
  }

  getBarHeight(amount: number): number {
    if (this.monthlyExpenses.length === 0) return 0;
    const max = Math.max(...this.monthlyExpenses.map(e => e.amount));
    return (amount / max) * 100;
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
          this.tokenService.logout();
          this.router.navigate(['/auth/login']);
        }
      });
    }
  }
}
