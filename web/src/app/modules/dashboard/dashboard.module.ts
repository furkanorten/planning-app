import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import {
  LucideAngularModule,
  CheckSquare,
  FileText,
  ShoppingCart,
  DollarSign,
  Plus,
  PenTool,
  List,
  CreditCard,
  LogOut,
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Smile,
  Clock,
  ChevronRight,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  Edit2,
  Trash2,
  Calendar
} from 'lucide-angular';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LucideAngularModule.pick({
      CheckSquare,
      FileText,
      ShoppingCart,
      DollarSign,
      Plus,
      PenTool,
      List,
      CreditCard,
      LogOut,
      BarChart3,
      RefreshCw,
      CheckCircle,
      AlertCircle,
      Smile,
      Clock,
      ChevronRight,
      Search,
      Filter,
      ArrowUp,
      ArrowDown,
      X,
      Edit2,
      Trash2,
      Calendar
    })
  ]
})
export class DashboardModule { }
