//--This is called a View Model / Derived Model pattern.
export interface MonthlyFinancialSummary {
  month: string;
  collection: number;
  expenses: number;
  balance: number;
}
