import { Injectable, computed, signal } from '@angular/core';

import { Expense } from '../../../shared/models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseStoreService {
  // Private writable state.
  // Components should not directly modify the expense collection.
  private readonly _expenses = signal<Expense[]>([]);

  // Public readonly state exposed to components.
  readonly expenses = this._expenses.asReadonly();

  // Derived state that automatically recalculates when expenses change.
  readonly totalExpenses = computed(() =>
    this._expenses().reduce((total, expense) => total + expense.amount, 0),
  );

  // Updates the complete expense collection.
  setExpenses(expenses: Expense[]): void {
    this._expenses.set(expenses);
  }

  // Adds a newly created expense to the shared state.
  addExpense(expense: Expense): void {
    this._expenses.update((expenses) => [...expenses, expense]);
  }

  // Updates an existing expense in the shared state.
  updateExpense(updatedExpense: Expense): void {
    this._expenses.update((expenses) =>
      expenses.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)),
    );
  }

  // Removes an expense from the shared state.
  removeExpense(expenseId: string | Number): void {
    this._expenses.update((expenses) => expenses.filter((expense) => expense.id !== expenseId));
  }
}
