import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TaskCategory,
  TaskPriority
} from '../../models/task.models';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit, OnChanges {
  @Input() task: Task | null = null;
  @Input() loading = false;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() save = new EventEmitter<CreateTaskRequest | UpdateTaskRequest>();
  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  categories = TASK_CATEGORIES;
  priorities = TASK_PRIORITIES;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.task) {
      this.mode = 'edit';
      this.populateForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.mode = 'edit';
      this.populateForm();
    } else if (changes['task'] && !this.task) {
      this.mode = 'create';
      this.resetForm();
    }
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      category: ['personal', Validators.required],
      priority: ['medium', Validators.required],
      deadline: ['']
    });
  }

  private populateForm(): void {
    if (!this.task) return;

    this.taskForm.patchValue({
      title: this.task.title,
      description: this.task.description || '',
      category: this.task.category,
      priority: this.task.priority,
      deadline: this.task.deadline ? this.formatDateForInput(new Date(this.task.deadline)) : ''
    });
  }

  private resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      deadline: ''
    });
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.taskForm.invalid || this.loading) return;

    const formValue = this.taskForm.value;
    const taskData: CreateTaskRequest | UpdateTaskRequest = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || undefined,
      category: formValue.category as TaskCategory,
      priority: formValue.priority as TaskPriority,
      deadline: formValue.deadline ? new Date(formValue.deadline) : undefined
    };

    this.save.emit(taskData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Form validation helpers
  get titleErrors(): string[] {
    const control = this.taskForm.get('title');
    const errors: string[] = [];

    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        errors.push('Title is required');
      }
      if (control.errors['maxlength']) {
        errors.push('Title cannot exceed 200 characters');
      }
    }

    return errors;
  }

  get descriptionErrors(): string[] {
    const control = this.taskForm.get('description');
    const errors: string[] = [];

    if (control?.errors && control.touched) {
      if (control.errors['maxlength']) {
        errors.push('Description cannot exceed 1000 characters');
      }
    }

    return errors;
  }

  // Utility methods
  get isValid(): boolean {
    return this.taskForm.valid;
  }

  get isDirty(): boolean {
    return this.taskForm.dirty;
  }

  get formTitle(): string {
    return this.mode === 'edit' ? 'Edit Task' : 'Create New Task';
  }

  get submitButtonText(): string {
    if (this.loading) {
      return this.mode === 'edit' ? 'Updating...' : 'Creating...';
    }
    return this.mode === 'edit' ? 'Update Task' : 'Create Task';
  }

  // Quick action methods
  setHighPriority(): void {
    this.taskForm.patchValue({ priority: 'high' });
  }

  setDueTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM

    this.taskForm.patchValue({
      deadline: this.formatDateForInput(tomorrow)
    });
  }

  setDueNextWeek(): void {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0); // Set to 9 AM

    this.taskForm.patchValue({
      deadline: this.formatDateForInput(nextWeek)
    });
  }

  clearDeadline(): void {
    this.taskForm.patchValue({ deadline: '' });
  }

  // Category and priority helpers
  getCategoryInfo(category: TaskCategory) {
    return this.categories.find(c => c.value === category);
  }

  getPriorityInfo(priority: TaskPriority) {
    return this.priorities.find(p => p.value === priority);
  }

  // Character count helpers
  get titleCharCount(): number {
    return this.taskForm.get('title')?.value?.length || 0;
  }

  get descriptionCharCount(): number {
    return this.taskForm.get('description')?.value?.length || 0;
  }
}
