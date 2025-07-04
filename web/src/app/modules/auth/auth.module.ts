import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

import { LucideAngularModule, Shield, ShieldCheck, Mail, Lock, AlertCircle, XCircle, LogIn, Loader2, User, UserPlus } from 'lucide-angular';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({
      Shield,
      ShieldCheck,
      Mail,
      Lock,
      AlertCircle,
      XCircle,
      LogIn,
      Loader2,
      User,
      UserPlus
    })
  ]
})
export class AuthModule { }
