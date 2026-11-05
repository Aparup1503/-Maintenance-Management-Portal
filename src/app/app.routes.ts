import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },

  {
    path: 'expenses',
    loadComponent: () => import('./features/expenses/expenses').then((m) => m.ExpensesComponent),
    canActivate: [authGuard, roleGuard(['Admin'])],
  },

  {
    path: 'payments',
    loadComponent: () => import('./features/payments/payments').then((m) => m.PaymentsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'billing',
    loadComponent: () => import('./features/billing/billing').then((m) => m.BillingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payments',
    loadComponent: () => import('./features/payments/payments').then((m) => m.PaymentsComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
