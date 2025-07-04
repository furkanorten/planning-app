export interface Task {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: Date;
  userId?: string;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isOverdue?: boolean;
  daysUntilDeadline?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category: TaskCategory;
  priority?: TaskPriority;
  deadline?: Date;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  deadline?: Date;
  completed?: boolean;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  totalCount?: number;
  data: Task[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskResponse {
  success: boolean;
  data: Task;
  message?: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
}

export interface TaskStatsResponse {
  success: boolean;
  data: TaskStats;
}

export type TaskCategory = 'personal' | 'work' | 'health' | 'education' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskSortBy = 'createdAt' | 'updatedAt' | 'deadline' | 'title' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface TaskFilters {
  search?: string;
  completed?: boolean;
  category?: TaskCategory | 'all';
  priority?: TaskPriority | 'all';
  sortBy?: TaskSortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
  hasDeadline?: boolean;
  isOverdue?: boolean;
  dueDateStart?: Date;
  dueDateEnd?: Date;
}

export const TASK_CATEGORIES: { value: TaskCategory; label: string; color: string }[] = [
  { value: 'personal', label: 'Personal', color: '#3b82f6' },
  { value: 'work', label: 'Work', color: '#8b5cf6' },
  { value: 'health', label: 'Health', color: '#10b981' },
  { value: 'education', label: 'Education', color: '#f59e0b' },
  { value: 'other', label: 'Other', color: '#6b7280' }
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' }
];
