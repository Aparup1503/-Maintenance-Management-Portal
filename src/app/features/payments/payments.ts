import { Component, computed, inject, signal } from '@angular/core';
import { MaintenanceDataService } from '../../core/services/maintenance-data.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import type { PaymentStatus } from '../../shared/models/payment.model';

@Component({
  selector: 'app-payments',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class PaymentsComponent {
  readonly data = inject(MaintenanceDataService);

  //Filter State
  readonly searchTerm = signal('');
  readonly selectedPayment = signal('All');
  readonly selectedMonth = signal('All');
  readonly selectedStatus = signal<'All' | PaymentStatus>('All');

  // Get all available months from payment records
  readonly availableMonths = computed(() => {
    const month = this.data.payments().map((payment) => payment.month);

    return [...new Set(month)];
  });

  // Apply all filters
  readonly filteredPayments = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const paymentMode = this.selectedPayment();
    const month = this.selectedMonth();
    const status = this.selectedStatus();

    return this.data.payments().filter((payment) => {
      const resident = this.data.residents().find((resident) => resident.id === payment.residentId);

      const matchesSearch =
        !search ||
        resident?.name.toLowerCase().includes(search) ||
        resident?.flatNumber.toLowerCase().includes(search);

      const matchesMode = paymentMode === 'All' || payment.paymentMode === paymentMode;

      const matchesMonth = month === 'All' || payment.month === month;

      const matchesStatus = status === 'All' || payment.status === status;

      return matchesSearch && matchesMode && matchesMonth && matchesStatus;
    });
  });

  // Summary calculations based on filtered results
  readonly totalCollection = computed(() =>
    this.filteredPayments()
      .filter((payment) => payment.status === 'Paid')
      .reduce((total, payment) => total + payment.amount, 0),
  );

  readonly totalTransactions = computed(() => this.filteredPayments().length);

  readonly averagePayment = computed(() => {
    const paidPayments = this.filteredPayments().filter((payment) => payment.status === 'Paid');

    return paidPayments.length > 0 ? this.totalCollection() / paidPayments.length : 0;
  });
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onPaymentModeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPayment.set(select.value);
  }

  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedMonth.set(select.value);
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value as 'All' | PaymentStatus);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedPayment.set('All');
    this.selectedMonth.set('All');
    this.selectedStatus.set('All');
  }

  getResidentName(residentId: number): string {
    return (
      this.data.residents().find((resident) => resident.id === residentId)?.name ??
      'Unknown Resident'
    );
  }

  getFlatNumber(residentId: number): string {
    return this.data.residents().find((resident) => resident.id === residentId)?.flatNumber ?? '-';
  }
}
