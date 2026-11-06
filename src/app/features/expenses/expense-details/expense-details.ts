import { Component, computed, inject, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import { Expense } from '../../../shared/models/expense.model';

@Component({
  selector: 'app-expense-details',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './expense-details.html',
  styleUrl: './expense-details.scss',
})
export class ExpenseDetailsComponent {
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly router = inject(Router);

  // Converts the route data Observable into a Signal.
  // The route data contains the expense loaded by our Route Resolver.
  private readonly routeData = toSignal(this.activatedRoute.data);

  // Stores the expense data that was loaded by the Route Resolver
  // before this component was activated.
  //readonly expense = signal<Expense | null>(null);

  // Extracts the resolved expense from the reactive route data.
  // This value automatically updates if the route data changes.
  readonly expense = computed<Expense | null>(() => {
    return (this.routeData()?.['expense'] as Expense) ?? null;
  });

  goBack(): void {
    // Navigate back to the Expenses list.
    this.router.navigate(['/expenses']);
  }
}
