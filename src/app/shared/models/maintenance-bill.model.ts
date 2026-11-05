export type BillStatus = 'Paid' | 'Pending' | 'Overdue';

export interface MaintenanceBill {
  id: number;
  residentId: number;
  flatNumber: string;
  residentName: string;

  month: string;
  amount: number;
  paidAmount: number;

  dueDate: string;
  status: BillStatus;

  generatedAt: string;
}
