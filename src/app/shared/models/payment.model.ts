export type PaymentStatus = 'Paid' | 'Pending';
export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer';

export interface Payment {
  spentAt: string | number | Date;
  id: number;
  residentId: number;
  billId?: number | string;
  flatNumber?: string;
  amount: number;
  paymentDate: string;
  month: string;
  status: PaymentStatus;
  paidAt?: string;
  paymentMode?: PaymentMode;
  paymentMethod?: PaymentMode;
}

// export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer';

// export interface Payment {
//   id: number;
//   residentId: number;

//   amount: number;
//   paymentDate: string;
//   paymentMode: PaymentMode;

//   month: string;
//   status: 'Paid';
// }
