export interface Expense {
  //date: string | number | Date;
  id: string | number;
  title: string;
  category: string;
  amount: number;
  spentAt: string;
  description?: string;
  // Supporting invoice, receipt, or service reference numbers.
  references?: string[];
}
