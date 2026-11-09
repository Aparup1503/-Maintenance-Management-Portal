import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { finalize, catchError, of } from 'rxjs';

import { DashboardApiService } from '../../core/services/api/dashboard-api.service';
import { Expense } from '../../shared/models/expense.model';
import { Payment } from '../../shared/models/payment.model';
import { MaintenanceDataService } from '../../core/services/maintenance-data.service';
import { MaintenanceBill } from '../../shared/models/maintenance-bill.model';
import { MonthlyFinancialSummary } from '../../shared/models/monthly-financial-summary.model';
import { FinancialSummaryCardComponent } from './components/financial-summary-card/financial-summary-card';
import { MonthlyAnalyticsComponent } from './components/monthly-analytics/monthly-analytics';
import { Resident } from '../../shared/models/resident.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    RouterLink,
    FinancialSummaryCardComponent,
    MonthlyAnalyticsComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  ngOnInit(): void {
    this.loadDashboard();
  }
  //-- inject() retrieves the dependency from Angular's
  //-- dependency injection system.
  readonly data = inject(MaintenanceDataService);
  private readonly dashboardApiService = inject(DashboardApiService);

  private readonly destroyRef = inject(DestroyRef);
  readonly expenses = signal<Expense[]>([]);
  readonly residents = signal<Resident[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly bills = signal<MaintenanceBill[]>([]);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Total amount received from paid transactions
  // readonly totalCollection = computed(() =>
  //   this.data
  //     .payments()
  //     .filter((payment) => payment.status === 'Paid')
  //     .reduce((total, payment) => total + payment.amount, 0),
  // );

  readonly totalCollection = computed(() =>
    this.payments()
      .filter((payment) => payment.status === 'Paid')
      .reduce((total, payment) => total + payment.amount, 0),
  );

  // Total expenses
  // readonly totalExpenses = computed(() =>
  //   this.data.expenses().reduce((total, expense) => total + expense.amount, 0),
  // );
  readonly totalExpenses = computed(() =>
    this.expenses().reduce((total, expense) => total + expense.amount, 0),
  );

  // Total amount billed
  readonly totalBilled = computed(() =>
    this.bills().reduce((total, bill) => total + bill.amount, 0),
  );

  // Total outstanding amount
  readonly totalOutstanding = computed(() =>
    this.bills().reduce((total, bill) => total + (bill.amount - bill.paidAmount), 0),
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
    [...this.payments()]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5),
  );

  // Recent expenses - latest 5 expenses
  readonly recentExpenses = computed(() =>
    [...this.expenses()]
      .sort((a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime())
      .slice(0, 5),
  );

  getResidentName(payment: Payment): string {
    const residentId = this.getPaymentResidentId(payment);

    return (
      this.residents().find((resident) => String(resident.id) === String(residentId))?.name ??
      this.bills().find((bill) => String(bill.id) === String(payment.billId))?.residentName ??
      'Unknown Resident'
    );
  }

  getFlatNumber(payment: Payment): string {
    const residentId = this.getPaymentResidentId(payment);

    return (
      this.residents().find((resident) => String(resident.id) === String(residentId))?.flatNumber ??
      this.bills().find((bill) => String(bill.id) === String(payment.billId))?.flatNumber ??
      '-'
    );
  }

  private getPaymentResidentId(payment: Payment): number | undefined {
    if (payment.residentId !== undefined && payment.residentId !== null) {
      return payment.residentId;
    }

    return this.bills().find((bill) => String(bill.id) === String(payment.billId))?.residentId;
  }

  readonly monthlyFinancialSummary = computed<MonthlyFinancialSummary[]>(() => {
    const monthlyData = new Map<string, MonthlyFinancialSummary>();

    // Process payments
    this.payments().forEach((payment) => {
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
    this.expenses().forEach((expense) => {
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

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dashboardApiService
      .getDashboardData()
      .pipe(
        catchError((error) => {
          console.error('Unable to load dashboard data.', error);

          this.errorMessage.set('Unable to load dashboard data. Please try again.');

          return of(null);
        }),

        finalize(() => {
          this.isLoading.set(false);
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((dashboardData) => {
        console.log('Dashboard data loaded:', dashboardData);
        if (!dashboardData) {
          return;
        }

        this.expenses.set(dashboardData.expenses);
        this.bills.set(dashboardData.bills);
        this.residents.set(dashboardData.residents);
        this.payments.set(
          dashboardData.payments.map((payment) => {
            const bill = this.bills().find(
              (currentBill) => String(currentBill.id) === String(payment.billId),
            );

            return {
              ...payment,
              residentId: payment.residentId ?? bill?.residentId ?? 0,
              flatNumber: payment.flatNumber ?? bill?.flatNumber,
              month: payment.month || bill?.month || '',
              status: payment.status ?? 'Paid',
              paymentMode: payment.paymentMode ?? payment.paymentMethod,
              spentAt: payment.spentAt || payment.paymentDate,
            };
          }),
        );
      });
  }
}
