import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task, TASK_CATEGORIES, TASK_PRIORITIES } from '../../models/task.models';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() loading = false;
  @Input() showDetails = true;
  @Input() compact = false;

  @Output() toggle = new EventEmitter<Task>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();

  showActions = false;

  get categoryInfo() {
    return TASK_CATEGORIES.find(c => c.value === this.task.category) || TASK_CATEGORIES[4];
  }

  get priorityInfo() {
    return TASK_PRIORITIES.find(p => p.value === this.task.priority) || TASK_PRIORITIES[1];
  }

  get isOverdue(): boolean {
    if (!this.task.deadline || this.task.completed) return false;
    return new Date() > new Date(this.task.deadline);
  }

  get deadlineStatus(): 'overdue' | 'due-today' | 'due-soon' | 'future' | null {
    if (!this.task.deadline || this.task.completed) return null;

    const now = new Date();
    const deadline = new Date(this.task.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays <= 3) return 'due-soon';
    return 'future';
  }

  get deadlineText(): string | null {
    if (!this.task.deadline) return null;

    const deadline = new Date(this.task.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;
    }

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;

    return deadline.toLocaleDateString();
  }

  get formattedCreatedAt(): string {
    if (!this.task.createdAt) return '';

    const created = new Date(this.task.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;

    return created.toLocaleDateString();
  }

  get priorityIcon(): string {
    switch (this.task.priority) {
      case 'high': return 'arrow-up';
      case 'low': return 'arrow-down';
      default: return 'minus';
    }
  }

  onToggle(): void {
    if (this.loading) return;
    this.toggle.emit(this.task);
  }

  onEdit(): void {
    if (this.loading) return;
    this.edit.emit(this.task);
  }

  onDelete(): void {
    if (this.loading) return;
    this.delete.emit(this.task);
  }

  toggleActions(): void {
    this.showActions = !this.showActions;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
