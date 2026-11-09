import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { billingPeriodValidator } from '../../shared/validators/billing-period.validator';
import { MaintenanceDataService } from '../../core/services/maintenance-data.service';
import { PaymentMode } from '../../shared/models/payment.model';

type BillingStatusFilter = 'All' | 'Paid' | 'Pending' | 'Overdue';
type FeedbackType = 'success' | 'info' | 'error';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.scss',
})
export class BillingComponent {
  readonly data = inject(MaintenanceDataService);

  private readonly fb = inject(FormBuilder);
  // Selected billing month. Format: YYYY-MM
  readonly selectedMonth = signal('2026-11');

  // Selected status filter
  readonly selectedStatus = signal<BillingStatusFilter>('All');

  // Feedback message after bill generation
  readonly message = signal('');
  readonly messageType = signal<FeedbackType>('info');

  //Billing related signals
  readonly selectedBillId = signal<number | null>(null);

  readonly paymentAmount = signal<number>(0);

  readonly selectedPaymentMode = signal<PaymentMode>('UPI');

  readonly paymentError = signal('');

  // Bills belonging to the selected month
  readonly monthlyBills = computed(() =>
    this.data.bills().filter((bill) => bill.month === this.selectedMonth()),
  );

  // Apply status filter
  readonly filteredBills = computed(() => {
    const status = this.selectedStatus();

    if (status === 'All') {
      return this.monthlyBills();
    }

    return this.monthlyBills().filter((bill) => bill.status === status);
  });

  // Monthly billing calculations
  readonly totalBilled = computed(() =>
    this.monthlyBills().reduce((total, bill) => total + bill.amount, 0),
  );

  readonly totalCollected = computed(() =>
    this.monthlyBills().reduce((total, bill) => total + bill.paidAmount, 0),
  );

  readonly totalOutstanding = computed(() =>
    this.monthlyBills().reduce(
      (total, bill) => total + Math.max(0, bill.amount - bill.paidAmount),
      0,
    ),
  );

  readonly paidCount = computed(
    () => this.monthlyBills().filter((bill) => bill.status === 'Paid').length,
  );

  readonly pendingCount = computed(
    () => this.monthlyBills().filter((bill) => bill.status === 'Pending').length,
  );

  readonly overdueCount = computed(
    () => this.monthlyBills().filter((bill) => bill.status === 'Overdue').length,
  );

  //Typed Reactive Forms
  readonly billingForm = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(3)]],

      periodStart: ['', Validators.required],

      periodEnd: ['', Validators.required],

      amount: [0, [Validators.required, Validators.min(1)]],

      dueDate: ['', Validators.required],
    },
    {
      validators: [billingPeriodValidator()],
    },
  );

  onMonthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedMonth.set(input.value);
    this.message.set('');
    this.messageType.set('info');
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value as BillingStatusFilter);
  }

  generateBills(): void {
    const month = this.selectedMonth();

    if (!month) {
      this.message.set('Please select a billing month.');
      this.messageType.set('error');
      return;
    }

    const dueDate = `${month}-10`;

    try {
      const generatedCount = this.data.generateMonthlyBills(month, dueDate);

      if (generatedCount === 0) {
        this.message.set(
          'No new bills generated. Bills may already exist for this month, or there are no residents.',
        );
        this.messageType.set('info');
      } else {
        this.message.set(`${generatedCount} maintenance bill(s) generated successfully.`);
        this.messageType.set('success');
      }
    } catch (error) {
      console.error('Bill generation failed:', error);
      this.message.set('Unable to generate bills. Please check the selected month.');
      this.messageType.set('error');
    }
  }

  recordPayment(billId: number): void {
    const bill = this.data.bills().find((item) => item.id === billId);
    if (!bill) {
      return;
    }
    const outstanding = bill.amount - bill.paidAmount;
    this.selectedBillId.set(billId);
    // Default amount is the remaining balance
    this.paymentAmount.set(outstanding);
    this.paymentError.set('');
  }
  onPaymentAmountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.paymentAmount.set(Number(input.value));
    this.message.set('');
    this.messageType.set('info');
  }

  onPaymentModeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.selectedPaymentMode.set(select.value as PaymentMode);
  }

  submitPayment(): void {
    const billId = this.selectedBillId();

    if (!billId) {
      return;
    }

    try {
      this.data.recordBillPayment(billId, this.paymentAmount(), this.selectedPaymentMode());

      this.message.set('Payment recorded successfully.');
      this.messageType.set('success');

      this.cancelPayment();
    } catch (error) {
      this.paymentError.set(error instanceof Error ? error.message : 'Unable to record payment.');
    }
  }

  cancelPayment(): void {
    this.selectedBillId.set(null);
    this.paymentAmount.set(0);
    this.paymentError.set('');
  }

  onSubmit(): void {
    if (this.billingForm.invalid) {
      this.billingForm.markAllAsTouched();
      return;
    }

    const billData = this.billingForm.getRawValue();

    console.log('New bill:', billData);

    // Later, we'll connect this to our Billing API.
  }

  /**
   * Checks whether the user can safely leave the Expenses page.
   */
  canDeactivate(): boolean {
    // No form is currently open, so navigation is safe.

    // The form has not been modified, so navigation is safe.
    if (!this.billingForm.dirty) {
      return true;
    }

    // Ask the user before discarding unsaved changes.
    return window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
  }
}
