import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role.guard';
import { expenseResolver } from './features/expenses/resolvers/expense.resolver';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { adminGuard } from './core/guards/admin.guard';

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
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((m) => m.SettingsComponent),
    canActivate: [adminGuard],
    data: {
      title: 'Settings',
      showInNavigation: true,
      roles: ['Admin', 'Resident'],
    },
  },
  {
    path: 'dashboard',

    loadComponent: () =>
      import('./features/dashboard/dashboard').then((component) => component.DashboardComponent),

    canActivate: [authGuard],

    data: {
      title: 'Dashboard',
      showInNavigation: true,
      roles: ['Admin', 'Resident'],
    },
  },
  {
    path: 'expenses',

    loadComponent: () =>
      import('./features/expenses/expenses').then((component) => component.ExpensesComponent),

    canActivate: [authGuard, roleGuard],
    canDeactivate: [unsavedChangesGuard],
    data: {
      title: 'Expenses',
      showInNavigation: true,
      roles: ['Admin'],
    },
  },
  {
    path: 'expenses/:id',

    loadComponent: () =>
      import('./features/expenses/expense-details/expense-details').then(
        (component) => component.ExpenseDetailsComponent,
      ),

    resolve: {
      expense: expenseResolver,
    },

    canActivate: [authGuard, roleGuard],

    data: {
      title: 'Expense Details',
      showInNavigation: false,
      roles: ['Admin'],
    },
  },
  {
    path: 'billing',
    loadComponent: () => import('./features/billing/billing').then((m) => m.BillingComponent),
    canActivate: [authGuard, roleGuard],
    canDeactivate: [unsavedChangesGuard],
    data: {
      title: 'Billing',
      showInNavigation: true,
      roles: ['Admin', 'Resident'],
    },
  },
  {
    path: 'payments',
    loadComponent: () => import('./features/payments/payments').then((m) => m.PaymentsComponent),
    canActivate: [authGuard, roleGuard],
    data: {
      title: 'Payments',
      showInNavigation: true,
      roles: ['Admin'],
    },
  },
  {
    path: 'residents',
    loadComponent: () =>
      import('./features/residents/residents').then((m) => m.ResidentsComponent),
    canActivate: [authGuard, roleGuard],
    data: {
      title: 'Residents',
      showInNavigation: true,
      roles: ['Admin', 'Resident'],
    },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
