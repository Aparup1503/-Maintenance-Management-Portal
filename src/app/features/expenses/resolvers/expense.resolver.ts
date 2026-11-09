import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';

import { EMPTY, catchError, tap } from 'rxjs';
import { Expense } from '../../../shared/models/expense.model';
import { ExpenseApiService } from '../data-access/expense-api.service';

export const expenseResolver: ResolveFn<Expense> = (route: ActivatedRouteSnapshot) => {
  const expenseApiService = inject(ExpenseApiService);

  const router = inject(Router);

  // Read the expense ID from the route URL.
  const expenseId = route.paramMap.get('id');

  console.log('🔄 Expense Resolver is running for ID:', expenseId);
  // Stop navigation when the route does not contain a valid ID.
  if (!expenseId) {
    router.navigate(['/expenses']);
    return EMPTY;
  }

  // Load the expense before activating the details route.
  return expenseApiService.getExpenseById(expenseId).pipe(
    tap((expense) => {
      console.log('✅ Resolver loaded expense:', expense);
    }),
    catchError(() => {
      // Return the user to the Expenses page when the expense
      // cannot be loaded or no longer exists.
      router.navigate(['/expenses']);

      return EMPTY;
    }),
  );
};
