export interface Expense {
  //date: string | number | Date;
  id: number;
  title: string;
  category: string;
  amount: number;
  spentAt: string;
  description?: string;
}
