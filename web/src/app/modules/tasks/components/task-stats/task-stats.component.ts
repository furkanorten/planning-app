import { Component, Input } from '@angular/core';
import { TaskStats } from '../../models/task.models';

@Component({
  selector: 'app-task-stats',
  templateUrl: './task-stats.component.html',
  styleUrls: ['./task-stats.component.scss']
})
export class TaskStatsComponent {
  @Input() stats: TaskStats = {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    dueTodayTasks: 0
  };
  @Input() loading = false;

  get completionPercentage(): number {
    return this.stats.totalTasks > 0
      ? Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100)
      : 0;
  }

  get activeTasks(): number {
    return this.stats.totalTasks - this.stats.completedTasks;
  }

  get progressBarWidth(): string {
    return `${this.completionPercentage}%`;
  }

  get progressBarColor(): string {
    if (this.completionPercentage >= 80) return '#10b981'; // green
    if (this.completionPercentage >= 60) return '#f59e0b'; // yellow
    if (this.completionPercentage >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  get productivityStatus(): string {
    if (this.stats.totalTasks === 0) return 'No tasks yet';
    if (this.completionPercentage >= 80) return 'Excellent progress! 🎉';
    if (this.completionPercentage >= 60) return 'Good progress! 👍';
    if (this.completionPercentage >= 40) return 'Keep it up! 💪';
    return 'Let\'s get started! 🚀';
  }

  get hasOverdueTasks(): boolean {
    return this.stats.overdueTasks > 0;
  }

  get hasDueTodayTasks(): boolean {
    return this.stats.dueTodayTasks > 0;
  }

  get urgentTasksCount(): number {
    return this.stats.overdueTasks + this.stats.dueTodayTasks;
  }

  get showUrgentAlert(): boolean {
    return this.urgentTasksCount > 0;
  }

  get urgentAlertText(): string {
    if (this.stats.overdueTasks > 0 && this.stats.dueTodayTasks > 0) {
      return `${this.stats.overdueTasks} overdue, ${this.stats.dueTodayTasks} due today`;
    } else if (this.stats.overdueTasks > 0) {
      return `${this.stats.overdueTasks} overdue task${this.stats.overdueTasks > 1 ? 's' : ''}`;
    } else if (this.stats.dueTodayTasks > 0) {
      return `${this.stats.dueTodayTasks} due today`;
    }
    return '';
  }
}
