import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Expense } from '../../../../shared/models/expense.model';

@Component({
  selector: 'app-expense-analytics',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './expense-analytics.html',
  styleUrl: './expense-analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseAnalyticsComponent {
  // Receives expenses from the parent.
  readonly expenses = input.required<Expense[]>();

  readonly totalExpenses = computed(() =>
    this.expenses().reduce((total, expense) => total + expense.amount, 0),
  );

  readonly expenseCount = computed(() => this.expenses().length);

  readonly highestExpense = computed(() => {
    const expenses = this.expenses();

    if (!expenses.length) {
      return null;
    }

    return expenses.reduce((highest, expense) =>
      expense.amount > highest.amount ? expense : highest,
    );
  });

  readonly categoryBreakdown = computed(() => {
    const breakdown = new Map<string, number>();

    for (const expense of this.expenses()) {
      const currentAmount = breakdown.get(expense.category) ?? 0;

      breakdown.set(expense.category, currentAmount + expense.amount);
    }

    return Array.from(breakdown, ([category, amount]) => ({
      category,
      amount,
    })).sort((a, b) => b.amount - a.amount);
  });
}
