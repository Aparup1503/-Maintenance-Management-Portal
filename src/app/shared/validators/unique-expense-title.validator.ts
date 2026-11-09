import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { catchError, debounceTime, map, of, switchMap, timer } from 'rxjs';

import { ExpenseApiService } from '../../features/expenses/data-access/expense-api.service';

/**
 * Checks whether an expense title already exists.
 */
export function uniqueExpenseTitleValidator(
  expenseApiService: ExpenseApiService,
  getCurrentExpenseId: () => string | number | null,
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const title = control.value?.trim();

    // Don't call the API for an empty value.
    if (!title) {
      return of(null);
    }

    return timer(400).pipe(
      switchMap(() => expenseApiService.getExpenses()),
      map((expenses) => {
        // Get the latest editing expense ID.
        const currentExpenseId = getCurrentExpenseId();

        const duplicate = expenses.some(
          (expense) =>
            expense.id !== currentExpenseId && expense.title.toLowerCase() === title.toLowerCase(),
        );

        return duplicate ? { duplicateTitle: true } : null;
      }),

      // Don't block the user if the validation request fails.
      catchError(() => of(null)),
    );
  };
}
