import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Expense } from '../../../../shared/models/expense.model';

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './expense-card.html',
  styleUrl: './expense-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCardComponent {
  readonly showDetails = signal(false);
  // Receives the expense data from the parent component.
  // The child is responsible only for displaying this data.
  expense = input.required<Expense>();

  // Controls whether administrative actions should be displayed.
  isAdmin = input<boolean>(false);

  // Notifies the parent when the user wants to edit an expense.
  editExpense = output<Expense>();

  // Notifies the parent when the user wants to delete an expense.
  deleteExpense = output<Expense>();

  onEdit(): void {
    // Send the selected expense back to the parent.
    this.editExpense.emit(this.expense());
  }

  onDelete(): void {
    // Send the selected expense back to the parent.
    this.deleteExpense.emit(this.expense());
  }

  toggleDetails(): void {
    this.showDetails.update((currentValue) => !currentValue);
  }
}
