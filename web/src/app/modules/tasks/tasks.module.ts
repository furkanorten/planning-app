import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Lucide Icons Import
import {
  LucideAngularModule,
  // Basic icons
  Plus, Edit2, Trash2, Check, X, Search, Filter, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, MoreVertical, ArrowUp, ArrowDown, Minus,
  // Task-specific icons
  CheckSquare, CheckCircle, List, Clock, Calendar, CalendarDays, Target,
  AlertTriangle, AlertCircle, Zap, Briefcase, User, Save, Loader2,
  // Filter icons
  Sliders, Sunrise, Info,
  // Priority and status icons
  ArrowUpDown
} from 'lucide-angular';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskListComponent } from './pages/task-list/task-list.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { TaskStatsComponent } from './components/task-stats/task-stats.component';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskFormComponent,
    TaskItemComponent,
    TaskFiltersComponent,
    TaskStatsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule.pick({
      // Basic icons
      Plus, Edit2, Trash2, Check, X, Search, Filter, ChevronDown, ChevronUp,
      ChevronLeft, ChevronRight, MoreVertical, ArrowUp, ArrowDown, Minus,
      // Task-specific icons
      CheckSquare, CheckCircle, List, Clock, Calendar, CalendarDays, Target,
      AlertTriangle, AlertCircle, Zap, Briefcase, User, Save, Loader2,
      // Filter icons
      Sliders, Sunrise, Info,
      // Priority and status icons
      ArrowUpDown
    }),
    TasksRoutingModule
  ],
  exports: [
    TaskStatsComponent,
    TaskItemComponent
  ]
})
export class TasksModule { }
