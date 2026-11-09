import { Injectable, computed, inject, signal, DestroyRef } from '@angular/core';
import { catchError, EMPTY, finalize, tap } from 'rxjs';

import { ExpenseApiService } from './expense-api.service';
import { Expense } from '../../../shared/models/expense.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStoreService {
  private readonly expenseApiService = inject(ExpenseApiService);
  private readonly destroyRef = inject(DestroyRef);

  // =========================
  // EXPENSE STATE
  // =========================

  private readonly _expenses = signal<Expense[]>([]);

  readonly expenses = this._expenses.asReadonly();

  readonly totalExpenses = computed(() =>
    this.expenses().reduce((total, expense) => total + expense.amount, 0),
  );

  // =========================
  // OPERATION STATES
  // =========================

  private readonly loadingState = signal(false);
  readonly isLoading = this.loadingState.asReadonly();

  private readonly savingState = signal(false);
  readonly isSaving = this.savingState.asReadonly();

  private readonly deletingExpenseIdState = signal<string | number | null>(null);

  readonly deletingExpenseId = this.deletingExpenseIdState.asReadonly();

  private readonly errorState = signal<string | null>(null);
  readonly errorMessage = this.errorState.asReadonly();

  // =========================
  // STATE UPDATE METHODS
  // =========================

  setExpenses(expenses: Expense[]): void {
    this._expenses.set(expenses);
  }

  addExpense(expense: Expense): void {
    this._expenses.update((expenses) => [expense, ...expenses]);
  }

  updateExpense(updatedExpense: Expense): void {
    this._expenses.update((expenses) =>
      expenses.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)),
    );
  }

  removeExpense(expenseId: string | number): void {
    this._expenses.update((expenses) => expenses.filter((expense) => expense.id !== expenseId));
  }

  // =========================
  // LOAD EXPENSES
  // Calls the API.
  // Receives the result.
  // Updates Signals.
  // Updates loading/error state.
  // =========================

  loadExpenses(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.expenseApiService
      .getExpenses()
      .pipe(
        // Side effect: update the application state.
        tap((expenses) => {
          this._expenses.set(expenses);
        }),
        // Handle API errors.
        catchError((error) => {
          console.error('Unable to load expenses.', error);

          this.errorState.set('Unable to load expenses. Please try again.');

          // Stop the Observable without sending an error to subscribe().
          return EMPTY;
        }),
        // Always stop the loading indicator.
        finalize(() => {
          // Runs whether the API succeeds, fails, or is unsubscribed.
          this.loadingState.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (expenses) => {
          const sortedExpenses = [...expenses].sort(
            (a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime(),
          );

          this.setExpenses(sortedExpenses);
        },
      });
  }

  // =========================
  // CREATE EXPENSE
  // =========================

  createExpense(expense: Omit<Expense, 'id'>, onSuccess?: () => void): void {
    this.savingState.set(true);
    this.errorState.set(null);

    this.expenseApiService
      .addExpense(expense)
      .pipe(
        finalize(() => {
          this.savingState.set(false);
        }),
      )
      .subscribe({
        next: (createdExpense) => {
          this.addExpense(createdExpense);
          onSuccess?.();
        },

        error: (error) => {
          console.error('Unable to create expense.', error);

          this.errorState.set('Unable to create expense. Please try again.');
        },
      });
  }

  // =========================
  // UPDATE EXPENSE
  // =========================

  saveExpense(id: string | number, expense: Partial<Expense>, onSuccess?: () => void): void {
    this.savingState.set(true);
    this.errorState.set(null);

    this.expenseApiService
      .updateExpense(id, expense)
      .pipe(
        finalize(() => {
          this.savingState.set(false);
        }),
      )
      .subscribe({
        next: (updatedExpense) => {
          this.updateExpense(updatedExpense);
          onSuccess?.();
        },

        error: (error) => {
          console.error('Unable to update expense.', error);

          this.errorState.set('Unable to update expense. Please try again.');
        },
      });
  }

  // =========================
  // DELETE EXPENSE
  // =========================

  deleteExpense(expenseId: string | number): void {
    this.deletingExpenseIdState.set(expenseId);
    this.errorState.set(null);

    this.expenseApiService
      .deleteExpense(expenseId)
      .pipe(
        finalize(() => {
          this.deletingExpenseIdState.set(null);
        }),
      )
      .subscribe({
        next: () => {
          // Update the Signal only after the API succeeds.
          this.removeExpense(expenseId);
        },

        error: (error) => {
          console.error('Unable to delete expense.', error);

          this.errorState.set('Unable to delete expense. Please try again.');
        },
      });
  }
}
