import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TaskService } from '../../services/task.service';
import {
  Task,
  TaskFilters,
  TaskStats,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  CreateTaskRequest,
  UpdateTaskRequest
} from '../../models/task.models';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  tasks: Task[] = [];
  stats: TaskStats = {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    dueTodayTasks: 0
  };

  // UI State
  loading = true;
  loadingAction = false;
  showTaskForm = false;
  editingTask: Task | null = null;

  // Filters
  currentFilters: TaskFilters = {
    completed: undefined,
    category: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  };

  // Pagination
  totalCount = 0;
  totalPages = 0;

  // Constants
  categories = TASK_CATEGORIES;
  priorities = TASK_PRIORITIES;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data Loading
  loadTasks(): void {
    this.loading = true;

    this.taskService.getAllTasks(this.currentFilters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.tasks = response.data;
          this.totalCount = response.totalCount || 0;
          this.totalPages = response.pagination?.totalPages || 0;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          // TODO: Show error message to user
        }
      });
  }

  loadStats(): void {
    this.taskService.getTaskStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.stats = response.data;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      });
  }

  // Task Actions
  onCreateTask(taskData: CreateTaskRequest): void {
    this.loadingAction = true;

    this.taskService.createTask(taskData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingAction = false)
      )
      .subscribe({
        next: () => {
          this.showTaskForm = false;
          this.loadTasks();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error creating task:', error);
          // TODO: Show error message
        }
      });
  }

  onUpdateTask(taskId: string, taskData: UpdateTaskRequest): void {
    this.loadingAction = true;

    this.taskService.updateTask(taskId, taskData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingAction = false)
      )
      .subscribe({
        next: () => {
          this.editingTask = null;
          this.loadTasks();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
  }

  onToggleTask(task: Task): void {
    if (!task._id) return;

    this.taskService.toggleTaskCompletion(task._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local task state immediately for better UX
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date() : undefined;
          this.loadStats();
        },
        error: (error) => {
          console.error('Error toggling task:', error);
          // Revert local change on error
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date() : undefined;
        }
      });
  }

  onDeleteTask(task: Task): void {
    if (!task._id || !confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(task._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadTasks();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
  }

  // Filters
  onFiltersChange(filters: TaskFilters): void {
    this.currentFilters = { ...this.currentFilters, ...filters, page: 1 };
    this.loadTasks();
  }

  onSortChange(sortBy: string): void {
    const sortOrder = this.currentFilters.sortBy === sortBy && this.currentFilters.sortOrder === 'desc'
      ? 'asc'
      : 'desc';

    this.currentFilters = {
      ...this.currentFilters,
      sortBy: sortBy as any,
      sortOrder,
      page: 1
    };
    this.loadTasks();
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentFilters = { ...this.currentFilters, page };
    this.loadTasks();
  }

  // UI Actions
  openTaskForm(): void {
    this.showTaskForm = true;
    this.editingTask = null;
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  // Quick Filters
  showAllTasks(): void {
    this.currentFilters = { ...this.currentFilters, completed: undefined, page: 1 };
    this.loadTasks();
  }

  showActiveTasks(): void {
    this.currentFilters = { ...this.currentFilters, completed: false, page: 1 };
    this.loadTasks();
  }

  showCompletedTasks(): void {
    this.currentFilters = { ...this.currentFilters, completed: true, page: 1 };
    this.loadTasks();
  }

  // Utility
  get completionPercentage(): number {
    return this.stats.totalTasks > 0
      ? Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100)
      : 0;
  }

  get activeTasks(): Task[] {
    return this.tasks.filter(task => !task.completed);
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(task => task.completed);
  }

  // Task Form Handler
  onTaskFormSave(taskData: CreateTaskRequest | UpdateTaskRequest): void {
    if (this.editingTask && this.editingTask._id) {
      this.onUpdateTask(this.editingTask._id, taskData as UpdateTaskRequest);
    } else {
      this.onCreateTask(taskData as CreateTaskRequest);
    }
  }

  // Track by function for performance
  trackByTaskId(index: number, task: Task): string {
    return task._id || index.toString();
  }
}
