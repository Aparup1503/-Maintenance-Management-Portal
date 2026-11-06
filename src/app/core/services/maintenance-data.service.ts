import { Injectable, computed, effect, signal } from '@angular/core';

import type { Resident } from '../../shared/models/resident.model';
import type { Payment, PaymentMode } from '../../shared/models/payment.model';
import type { Expense } from '../../shared/models/expense.model';
import { MaintenanceBill } from '../../shared/models/maintenance-bill.model';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceDataService {
  private readonly storageKey = 'maintenance-portal-data';
  private readonly storageVersion = 2;
  readonly bills = signal<MaintenanceBill[]>([
    {
      id: 1,
      residentId: 1,
      flatNumber: 'A-101',
      residentName: 'Rahul Sharma',
      month: '2026-11',
      amount: 3000,
      paidAmount: 3000,
      dueDate: '2026-11-10',
      status: 'Paid',
      generatedAt: '2026-11-01T00:00:00.000Z',
    },
    {
      id: 2,
      residentId: 2,
      flatNumber: 'A-102',
      residentName: 'Priya Das',
      month: '2026-11',
      amount: 3000,
      paidAmount: 0,
      dueDate: '2026-11-10',
      status: 'Pending',
      generatedAt: '2026-11-01T00:00:00.000Z',
    },
    {
      id: 3,
      residentId: 3,
      flatNumber: 'B-201',
      residentName: 'Amit Kumar',
      month: '2026-11',
      amount: 3000,
      paidAmount: 0,
      dueDate: '2026-11-10',
      status: 'Pending',
      generatedAt: '2026-11-01T00:00:00.000Z',
    },
    {
      id: 4,
      residentId: 4,
      flatNumber: 'B-202',
      residentName: 'Sneha Patnaik',
      month: '2026-11',
      amount: 3000,
      paidAmount: 0,
      dueDate: '2026-11-10',
      status: 'Pending',
      generatedAt: '2026-11-01T00:00:00.000Z',
    },
  ]);

  constructor() {
    // 1. Restore previously saved data
    this.loadFromLocalStorage();

    // 2. Automatically persist changes to Signals
    effect(() => {
      const data = {
        version: this.storageVersion,
        residents: this.residents(),
        payments: this.payments(),
        expenses: this.expenses(),
        bills: this.bills(),
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    });
  }
  // ==========================================
  // 1. RESIDENT DATA
  // ==========================================

  readonly residents = signal<Resident[]>([
    {
      id: 1,
      flatNumber: 'A-101',
      name: 'Rahul Sharma',
      phone: '9876543210',
      monthlyMaintenance: 3000,
    },
    {
      id: 2,
      flatNumber: 'A-102',
      name: 'Priya Das',
      phone: '9876543211',
      monthlyMaintenance: 3000,
    },
    {
      id: 3,
      flatNumber: 'B-201',
      name: 'Amit Kumar',
      phone: '9876543212',
      monthlyMaintenance: 3000,
    },
    {
      id: 4,
      flatNumber: 'B-202',
      name: 'Sneha Patnaik',
      phone: '9876543213',
      monthlyMaintenance: 3000,
    },
  ]);

  // ==========================================
  // 2. PAYMENT DATA
  // ==========================================

  readonly payments = signal<Payment[]>([
    {
      id: 1,
      residentId: 1,
      flatNumber: 'A-101',
      amount: 3000,
      month: 'November 2026',
      status: 'Paid',
      paidAt: '2026-11-02T10:30:00',
      paymentMode: 'UPI',
      paymentDate: '',
      spentAt: '',
    },
    {
      id: 2,
      residentId: 2,
      flatNumber: 'A-102',
      amount: 3000,
      month: 'November 2026',
      status: 'Pending',
      paymentDate: '',
      spentAt: '',
    },
    {
      id: 3,
      residentId: 3,
      flatNumber: 'B-201',
      amount: 3000,
      month: 'November 2026',
      status: 'Pending',
      paymentDate: '',
      spentAt: '',
    },
    {
      id: 4,
      residentId: 4,
      flatNumber: 'B-202',
      amount: 3000,
      month: 'November 2026',
      status: 'Pending',
      paymentDate: '',
      spentAt: '',
    },
  ]);

  // ==========================================
  // 3. EXPENSE DATA
  // ==========================================

  readonly expenses = signal<Expense[]>([
    {
      id: 1,
      title: 'Electricity Bill',
      category: 'Electricity',
      amount: 2500,
      spentAt: '2026-11-01',
      description: 'Common area electricity',
    },
    {
      id: 2,
      title: 'Security Salary',
      category: 'Security',
      amount: 4000,
      spentAt: '2026-11-02',
      description: 'Monthly security salary',
    },
    {
      id: 3,
      title: 'Cleaning Expenses',
      category: 'Cleaning',
      amount: 1500,
      spentAt: '2026-11-03',
      description: 'Common area cleaning',
    },
  ]);

  // ==========================================
  // 4. DASHBOARD CALCULATIONS
  // ==========================================

  readonly totalCollection = computed(() =>
    this.payments()
      .filter((payment) => payment.status === 'Paid')
      .reduce((total, payment) => total + payment.amount, 0),
  );

  readonly totalExpenses = computed(() =>
    this.expenses().reduce((total, expense) => total + expense.amount, 0),
  );

  readonly pendingPayments = computed(() =>
    this.payments()
      .filter((payment) => payment.status === 'Pending')
      .reduce((total, payment) => total + payment.amount, 0),
  );

  readonly availableBalance = computed(() => this.totalCollection() - this.totalExpenses());

  readonly paidResidentCount = computed(() => {
    const paidResidentIds = new Set(
      this.payments()
        .filter((payment) => payment.status === 'Paid')
        .map((payment) => payment.residentId),
    );

    return paidResidentIds.size;
  });

  readonly collectionPercentage = computed(() => {
    const totalResidents = this.residents().length;

    if (totalResidents === 0) {
      return 0;
    }

    return this.paidResidentCount() / totalResidents;
  });

  readonly lastPaymentDate = computed(() => {
    const timestamps = this.payments()
      .filter((payment) => payment.status === 'Paid' && payment.paidAt)
      .map((payment) => new Date(payment.paidAt!).getTime())
      .filter((timestamp) => Number.isFinite(timestamp));

    if (timestamps.length === 0) {
      return null;
    }

    return new Date(Math.max(...timestamps));
  });
  //Monthly Bill Generation
  readonly totalBilledAmount = computed(() =>
    this.bills().reduce((total, bill) => total + bill.amount, 0),
  );

  readonly totalBillCollection = computed(() =>
    this.bills().reduce((total, bill) => total + bill.paidAmount, 0),
  );

  readonly totalOutstanding = computed(() =>
    this.bills().reduce((total, bill) => total + Math.max(0, bill.amount - bill.paidAmount), 0),
  );

  readonly paidBillsCount = computed(
    () => this.bills().filter((bill) => bill.status === 'Paid').length,
  );

  readonly pendingBillsCount = computed(
    () => this.bills().filter((bill) => bill.status === 'Pending').length,
  );

  // ==========================================
  // 5. EXPENSE CRUD OPERATIONS
  // ==========================================

  addExpense(expense: Omit<Expense, 'id'>): void {
    const nextId =
      this.expenses().reduce(
        (maxId, item) => (typeof item.id === 'number' ? Math.max(maxId, item.id) : maxId),
        0,
      ) + 1;

    this.expenses.update((currentExpenses) => [
      ...currentExpenses,
      {
        ...expense,
        id: nextId,
      },
    ]);
  }

  updateExpense(id: string | number, updatedExpense: Omit<Expense, 'id'>): void {
    this.expenses.update((currentExpenses) =>
      currentExpenses.map((expense) => (expense.id === id ? { ...updatedExpense, id } : expense)),
    );
  }
  deleteExpense(id: string | number): void {
    this.expenses.update((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id),
    );
  }

  private loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const savedData = localStorage.getItem(this.storageKey);

      if (!savedData) {
        return;
      }

      const parsedData = JSON.parse(savedData);

      if (Array.isArray(parsedData.residents)) {
        this.residents.set(parsedData.residents);
      }

      if (Array.isArray(parsedData.payments)) {
        this.payments.set(parsedData.payments);
      }

      if (Array.isArray(parsedData.expenses)) {
        this.expenses.set(parsedData.expenses);
      }

      if (Array.isArray(parsedData.bills) && parsedData.bills.length > 0) {
        this.bills.set(parsedData.bills);
      }

      if (parsedData.version !== this.storageVersion) {
        this.migrateNovemberPendingSamples();
      }
    } catch (error) {
      console.error('Failed to load maintenance data:', error);
    }
  }

  private migrateNovemberPendingSamples(): void {
    const month = '2026-11';
    const monthLabel = 'November 2026';
    const pendingResidentIds = new Set([2, 3, 4]);

    this.bills.update((bills) => {
      const updatedBills = bills.map((bill) =>
        bill.month === month && pendingResidentIds.has(bill.residentId)
          ? { ...bill, paidAmount: 0, status: 'Pending' as const }
          : bill,
      );
      const existingKeys = new Set(updatedBills.map((bill) => `${bill.residentId}-${bill.month}`));
      const nextId = Math.max(0, ...updatedBills.map((bill) => bill.id)) + 1;
      const sampleBills = [
        {
          residentId: 2,
          flatNumber: 'A-102',
          residentName: 'Priya Das',
        },
        {
          residentId: 3,
          flatNumber: 'B-201',
          residentName: 'Amit Kumar',
        },
        {
          residentId: 4,
          flatNumber: 'B-202',
          residentName: 'Sneha Patnaik',
        },
      ]
        .filter(({ residentId }) => !existingKeys.has(`${residentId}-${month}`))
        .map(({ residentId, flatNumber, residentName }, index) => ({
          id: nextId + index,
          residentId,
          flatNumber,
          residentName,
          month,
          amount: 3000,
          paidAmount: 0,
          dueDate: `${month}-10`,
          status: 'Pending' as const,
          generatedAt: new Date().toISOString(),
        }));

      return [...updatedBills, ...sampleBills];
    });

    this.payments.update((payments) => {
      const pendingResidents = new Set(
        payments
          .filter((payment) => payment.month === monthLabel && payment.status === 'Pending')
          .map((payment) => payment.residentId),
      );
      const nextId = Math.max(0, ...payments.map((payment) => payment.id)) + 1;
      const samplePayments = [
        { residentId: 2, flatNumber: 'A-102' },
        { residentId: 3, flatNumber: 'B-201' },
        { residentId: 4, flatNumber: 'B-202' },
      ]
        .filter(({ residentId }) => !pendingResidents.has(residentId))
        .map(({ residentId, flatNumber }, index) => ({
          id: nextId + index,
          residentId,
          flatNumber,
          amount: 3000,
          month: monthLabel,
          status: 'Pending' as const,
          paymentDate: '',
          spentAt: '',
        }));

      return [...payments, ...samplePayments];
    });
  }

  generateMonthlyBills(month: string, dueDate: string): number {
    // Expected month format: YYYY-MM
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw new Error('Invalid billing month. Expected YYYY-MM.');
    }

    // Prevent duplicate bills for the same flat and month.
    const existingBillKeys = new Set(
      this.bills().map((bill) => `${bill.residentId}-${bill.month}`),
    );

    const monthLabel = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${month}-01T12:00:00`));

    const newBills: MaintenanceBill[] = this.residents()
      .filter((resident) => !existingBillKeys.has(`${resident.id}-${month}`))
      .map((resident, index) => {
        // Match existing payment records for this resident and month.
        const paidAmount = this.payments()
          .filter(
            (payment) =>
              payment.residentId === resident.id &&
              payment.month === monthLabel &&
              payment.status === 'Paid',
          )
          .reduce((total, payment) => total + payment.amount, 0);

        const amount = resident.monthlyMaintenance;
        const actualPaidAmount = Math.min(paidAmount, amount);

        return {
          id: Date.now() + index,
          residentId: resident.id,
          flatNumber: resident.flatNumber,
          residentName: resident.name,
          month,
          amount,
          paidAmount: actualPaidAmount,
          dueDate,
          status: actualPaidAmount >= amount ? 'Paid' : 'Pending',
          generatedAt: new Date().toISOString(),
        };
      });

    if (newBills.length > 0) {
      this.bills.update((current) => [...current, ...newBills]);
    }

    return newBills.length;
  }

  recordBillPayment(billId: number, paymentAmount: number, paymentMode: PaymentMode): void {
    const bill = this.bills().find((bill) => bill.id === billId);

    if (!bill) {
      throw new Error('Bill not found.');
    }

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const outstandingAmount = bill.amount - bill.paidAmount;

    if (paymentAmount > outstandingAmount) {
      throw new Error(`Payment cannot exceed the outstanding amount of ₹${outstandingAmount}.`);
    }

    const updatedPaidAmount = bill.paidAmount + paymentAmount;

    const isFullyPaid = updatedPaidAmount >= bill.amount;

    // Update the bill
    this.bills.update((bills) =>
      bills.map((currentBill) =>
        currentBill.id === billId
          ? {
              ...currentBill,
              paidAmount: updatedPaidAmount,
              status: isFullyPaid ? 'Paid' : 'Pending',
            }
          : currentBill,
      ),
    );

    // Create a payment transaction
    const payment: Payment = {
      id: Date.now(),
      residentId: bill.residentId,
      amount: paymentAmount,
      paymentDate: new Date().toISOString(),
      paymentMode,
      month: this.getMonthLabel(bill.month),
      status: 'Paid',
      spentAt: new Date().toISOString(),
    };

    this.payments.update((payments) => [...payments, payment]);
  }

  private getMonthLabel(month: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${month}-01T12:00:00`));
  }
}
