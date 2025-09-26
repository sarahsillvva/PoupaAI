
export enum Category {
  INVESTMENTS = 'INVESTMENTS',
  FIXED_COSTS = 'FIXED_COSTS',
  COMFORT = 'COMFORT',
  GOALS = 'GOALS',
  PLEASURES = 'PLEASURES',
  KNOWLEDGE = 'KNOWLEDGE',
  UNCATEGORIZED = 'UNCATEGORIZED',
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  dueDate: string; // YYYY-MM-DD
  installments?: {
    current: number;
    total: number;
  };
}

export interface Income {
  salary: number;
  initialBalance: number;
}

export interface FinancialData {
  income: Income;
  expenses: Expense[];
}

export interface CategoryInfo {
  name: string;
  target: number;
  color: string;
}
