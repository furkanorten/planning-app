import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TasksResponse,
  TaskResponse,
  TaskStatsResponse,
  TaskFilters
} from '../models/task.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // Get all tasks with filters
  getAllTasks(filters?: TaskFilters): Observable<TasksResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilters];
        if (value !== undefined && value !== null) {
          // Handle different types properly
          if (typeof value === 'string' && value.trim() === '') {
            return; // Skip empty strings
          }
          if (typeof value === 'boolean' || typeof value === 'number') {
            params = params.set(key, value.toString());
          } else if (typeof value === 'string') {
            params = params.set(key, value);
          } else if (value instanceof Date) {
            params = params.set(key, value.toISOString());
          }
        }
      });
    }

    return this.http.get<TasksResponse>(this.API_URL, { params });
  }

  // Get recent tasks for dashboard
  getRecentTasks(limit: number = 5): Observable<TasksResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TasksResponse>(`${this.API_URL}/recent`, { params });
  }

  // Get task statistics
  getTaskStats(): Observable<TaskStatsResponse> {
    return this.http.get<TaskStatsResponse>(`${this.API_URL}/stats`);
  }

  // Get specific task by ID
  getTaskById(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.API_URL}/${id}`);
  }

  // Create new task
  createTask(task: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.API_URL, task);
  }

  // Update task
  updateTask(id: string, task: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.API_URL}/${id}`, task);
  }

  // Toggle task completion
  toggleTaskCompletion(id: string): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.API_URL}/${id}/toggle`, {});
  }

  // Delete task
  deleteTask(id: string): Observable<TaskResponse> {
    return this.http.delete<TaskResponse>(`${this.API_URL}/${id}`);
  }

  // Utility methods
  getTasksCompletedToday(): Observable<TasksResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filters: TaskFilters = {
      completed: true,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    };

    return this.getAllTasks(filters);
  }

  getOverdueTasks(): Observable<TasksResponse> {
    const filters: TaskFilters = {
      completed: false,
      sortBy: 'deadline',
      sortOrder: 'asc'
    };

    return this.getAllTasks(filters);
  }

  getTasksByCategory(category: string): Observable<TasksResponse> {
    const filters: TaskFilters = {
      category: category as any,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    return this.getAllTasks(filters);
  }

  getTasksByPriority(priority: string): Observable<TasksResponse> {
    const filters: TaskFilters = {
      priority: priority as any,
      completed: false,
      sortBy: 'deadline',
      sortOrder: 'asc'
    };

    return this.getAllTasks(filters);
  }
}
