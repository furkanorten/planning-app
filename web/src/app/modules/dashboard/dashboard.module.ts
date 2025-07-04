import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Lucide Icons Import
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
  // Missing icons
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Smile,
  Clock
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
      // Missing icons added
      RefreshCw,
      CheckCircle,
      AlertCircle,
      Smile,
      Clock
    })
  ]
})
export class DashboardModule { }
