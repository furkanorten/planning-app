import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  TaskFilters,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TaskCategory,
  TaskPriority,
  TaskSortBy,
  SortOrder
} from '../../models/task.models';

@Component({
  selector: 'app-task-filters',
  templateUrl: './task-filters.component.html',
  styleUrls: ['./task-filters.component.scss']
})
export class TaskFiltersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() filters: TaskFilters = {};
  @Output() filtersChange = new EventEmitter<TaskFilters>();

  filtersForm!: FormGroup;
  showAdvancedFilters = false;

  // Constants
  categories = [
    { value: 'all', label: 'All Categories', color: '#6b7280' },
    ...TASK_CATEGORIES
  ];

  priorities = [
    { value: 'all', label: 'All Priorities', color: '#6b7280' },
    ...TASK_PRIORITIES
  ];

  sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' }
  ];;

  completionOptions = [
    { value: undefined, label: 'All Tasks' },
    { value: false, label: 'Active Only' },
    { value: true, label: 'Completed Only' }
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.populateForm();
    this.setupFormSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.filtersForm = this.fb.group({
      // Basic filters
      search: [''],
      completed: [undefined],
      category: ['all'],
      priority: ['all'],

      // Advanced filters
      sortBy: ['createdAt'],
      sortOrder: ['desc'],
      hasDeadline: [undefined],
      isOverdue: [false],
      dueDateRange: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  private populateForm(): void {
    if (!this.filters) return;

    this.filtersForm.patchValue({
      search: this.filters.search || '',
      completed: this.filters.completed,
      category: this.filters.category || 'all',
      priority: this.filters.priority || 'all',
      sortBy: this.filters.sortBy || 'createdAt',
      sortOrder: this.filters.sortOrder || 'desc',
      hasDeadline: this.filters.hasDeadline,
      isOverdue: this.filters.isOverdue || false,
      dueDateRange: {
        start: this.filters.dueDateStart ? this.formatDateForInput(new Date(this.filters.dueDateStart)) : '',
        end: this.filters.dueDateEnd ? this.formatDateForInput(new Date(this.filters.dueDateEnd)) : ''
      }
    });
  }

  private setupFormSubscription(): void {
    // Search with debounce
    this.filtersForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.emitFilters());

    // Other filters without debounce
    this.filtersForm.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.emitFilters());
  }

  private emitFilters(): void {
    const formValue = this.filtersForm.value;
    const dueDateRange = formValue.dueDateRange;

    const filters: TaskFilters = {
      search: formValue.search?.trim() || undefined,
      completed: formValue.completed,
      category: formValue.category === 'all' ? undefined : formValue.category,
      priority: formValue.priority === 'all' ? undefined : formValue.priority,
      sortBy: formValue.sortBy,
      sortOrder: formValue.sortOrder,
      hasDeadline: formValue.hasDeadline,
      isOverdue: formValue.isOverdue || undefined,
      dueDateStart: dueDateRange.start ? new Date(dueDateRange.start) : undefined,
      dueDateEnd: dueDateRange.end ? new Date(dueDateRange.end) : undefined
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    this.filtersChange.emit(cleanFilters);
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // UI Actions
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearAllFilters(): void {
    this.filtersForm.reset({
      search: '',
      completed: undefined,
      category: 'all',
      priority: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      hasDeadline: undefined,
      isOverdue: false,
      dueDateRange: {
        start: '',
        end: ''
      }
    });
  }

  clearSearch(): void {
    this.filtersForm.patchValue({ search: '' });
  }

  // Quick filter presets
  showOverdueTasks(): void {
    this.filtersForm.patchValue({
      completed: false,
      isOverdue: true,
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
  }

  showDueTodayTasks(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.filtersForm.patchValue({
      completed: false,
      dueDateRange: {
        start: this.formatDateForInput(today),
        end: this.formatDateForInput(tomorrow)
      },
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
  }

  showHighPriorityTasks(): void {
    this.filtersForm.patchValue({
      priority: 'high',
      completed: false,
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
  }

  showRecentTasks(): void {
    this.filtersForm.patchValue({
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  // Utility methods
  get hasActiveFilters(): boolean {
    const formValue = this.filtersForm.value;
    const dueDateRange = formValue.dueDateRange;

    return !!(
      formValue.search?.trim() ||
      formValue.completed !== undefined ||
      (formValue.category && formValue.category !== 'all') ||
      (formValue.priority && formValue.priority !== 'all') ||
      formValue.hasDeadline !== undefined ||
      formValue.isOverdue ||
      dueDateRange.start ||
      dueDateRange.end
    );
  }

  get activeFilterCount(): number {
    let count = 0;
    const formValue = this.filtersForm.value;
    const dueDateRange = formValue.dueDateRange;

    if (formValue.search?.trim()) count++;
    if (formValue.completed !== undefined) count++;
    if (formValue.category && formValue.category !== 'all') count++;
    if (formValue.priority && formValue.priority !== 'all') count++;
    if (formValue.hasDeadline !== undefined) count++;
    if (formValue.isOverdue) count++;
    if (dueDateRange.start || dueDateRange.end) count++;

    return count;
  }

  get selectedCategoryInfo() {
    const category = this.filtersForm.get('category')?.value;
    return this.categories.find(c => c.value === category);
  }

  get selectedPriorityInfo() {
    const priority = this.filtersForm.get('priority')?.value;
    return this.priorities.find(p => p.value === priority);
  }

  // Helper methods for templates
  getClearButtonText(): string {
    if (this.activeFilterCount > 0) {
      const count = this.activeFilterCount;
      const plural = count > 1 ? 's' : '';
      return `Clear ${count} filter${plural}`;
    }
    return 'No active filters';
  }

  getClearButtonTitle(): string {
    if (this.activeFilterCount > 0) {
      const count = this.activeFilterCount;
      const plural = count > 1 ? 's' : '';
      return `Clear ${count} filter${plural}`;
    }
    return 'No active filters';
  }
}
