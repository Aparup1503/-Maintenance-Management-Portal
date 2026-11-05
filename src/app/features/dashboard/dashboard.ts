import { Component, computed, inject } from '@angular/core';

import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';

import { MaintenanceDataService } from '../../core/services/maintenance-data.service';
import { MonthlyFinancialSummary } from '../../shared/models/monthly-financial-summary.model';
import { FinancialSummaryCardComponent } from './components/financial-summary-card/financial-summary-card';
import { MonthlyAnalyticsComponent } from './components/monthly-analytics/monthly-analytics';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    FinancialSummaryCardComponent,
    MonthlyAnalyticsComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  //-- inject() retrieves the dependency from Angular's
  //-- dependency injection system.
  readonly data = inject(MaintenanceDataService);

  // Total amount received from paid transactions
  readonly totalCollection = computed(() =>
    this.data
      .payments()
      .filter((payment) => payment.status === 'Paid')
      .reduce((total, payment) => total + payment.amount, 0),
  );

  // Total expenses
  readonly totalExpenses = computed(() =>
    this.data.expenses().reduce((total, expense) => total + expense.amount, 0),
  );

  // Total amount billed
  readonly totalBilled = computed(() =>
    this.data.bills().reduce((total, bill) => total + bill.amount, 0),
  );

  // Total outstanding amount
  readonly totalOutstanding = computed(() =>
    this.data.bills().reduce((total, bill) => total + (bill.amount - bill.paidAmount), 0),
  );

  // Collection percentage
  readonly collectionPercentage = computed(() => {
    const billed = this.totalBilled();

    if (billed === 0) {
      return 0;
    }

    return this.totalCollection() / billed;
  });

  // Current available balance
  readonly availableBalance = computed(() => this.totalCollection() - this.totalExpenses());

  // Get the latest payment date
  readonly lastPaymentDate = computed(() => {
    const payments = this.data.payments();

    if (payments.length === 0) {
      return null;
    }

    return [...payments].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    )[0].paymentDate;
  });

  // Recent payments - latest 5 transactions
  readonly recentPayments = computed(() =>
    [...this.data.payments()]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5),
  );

  // Recent expenses - latest 5 expenses
  readonly recentExpenses = computed(() =>
    [...this.data.expenses()]
      .sort((a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime())
      .slice(0, 5),
  );

  getResidentName(residentId: number): string {
    return (
      this.data.residents().find((resident) => resident.id === residentId)?.name ??
      'Unknown Resident'
    );
  }

  getFlatNumber(residentId: number): string {
    return this.data.residents().find((resident) => resident.id === residentId)?.flatNumber ?? '-';
  }

  readonly monthlyFinancialSummary = computed<MonthlyFinancialSummary[]>(() => {
    const monthlyData = new Map<string, MonthlyFinancialSummary>();

    // Process payments
    this.data.payments().forEach((payment) => {
      const month = new Date(payment.paymentDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          month,
          collection: 0,
          expenses: 0,
          balance: 0,
        });
      }

      const summary = monthlyData.get(month)!;

      summary.collection += payment.amount;
      summary.balance = summary.collection - summary.expenses;
    });

    // Process expenses
    this.data.expenses().forEach((expense) => {
      const month = new Date(expense.spentAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          month,
          collection: 0,
          expenses: 0,
          balance: 0,
        });
      }

      const summary = monthlyData.get(month)!;

      summary.expenses += expense.amount;
      summary.balance = summary.collection - summary.expenses;
    });

    return Array.from(monthlyData.values()).sort((a, b) => {
      const dateA = new Date(`01 ${a.month}`);
      const dateB = new Date(`01 ${b.month}`);

      return dateB.getTime() - dateA.getTime();
    });
  });
}
