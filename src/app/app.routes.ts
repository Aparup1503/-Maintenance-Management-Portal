import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
  },

  {
    path: 'expenses',
    loadComponent: () => import('./features/expenses/expenses').then((m) => m.ExpensesComponent),
  },

  {
    path: 'payments',
    loadComponent: () => import('./features/payments/payments').then((m) => m.PaymentsComponent),
  },
  {
    path: 'billing',
    loadComponent: () => import('./features/billing/billing').then((m) => m.BillingComponent),
  },
  {
    path: 'payments',
    loadComponent: () => import('./features/payments/payments').then((m) => m.PaymentsComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
