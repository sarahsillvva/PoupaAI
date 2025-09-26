import { Expense, Category } from '../types';

export type NewExpenseData = Omit<Expense, 'id'>;

const STORAGE_KEY = 'poupa-ai-financials';

type StoredData = {
  totalAmount: number;
  expenses: Expense[];
};

const getStoredData = (): StoredData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const initialData: StoredData = { totalAmount: 0, expenses: [] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

const setStoredData = (data: StoredData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getFinancialData = async (): Promise<StoredData> => {
  return Promise.resolve(getStoredData());
};

export const updateTotalAmount = async (amount: number): Promise<{ totalAmount: number }> => {
  const data = getStoredData();
  data.totalAmount = amount;
  setStoredData(data);
  return Promise.resolve({ totalAmount: data.totalAmount });
};

export const addExpense = async (expenseData: NewExpenseData): Promise<Expense[]> => {
  const data = getStoredData();
  const newExpense: Expense = {
    ...expenseData,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  data.expenses.push(newExpense);
  setStoredData(data);
  return Promise.resolve(data.expenses);
};

export const updateExpense = async (expense: Expense): Promise<Expense> => {
  const data = getStoredData();
  const index = data.expenses.findIndex(e => e.id === expense.id);
  if (index > -1) {
    data.expenses[index] = expense;
    setStoredData(data);
    return Promise.resolve(expense);
  }
  return Promise.reject(new Error('Despesa não encontrada para atualização.'));
};

export const deleteExpense = async (id: string): Promise<void> => {
  const data = getStoredData();
  data.expenses = data.expenses.filter(e => e.id !== id);
  setStoredData(data);
  return Promise.resolve();
};

// A função de sugestão de categoria é local e não precisa de API
export const suggestCategory = async (description: string): Promise<{ category: Category }> => {
  // Esta função não é usada, pois a lógica está diretamente em ExpenseForm.tsx,
  // mas a mantemos para a integridade da interface da API simulada.
  return Promise.resolve({ category: Category.UNCATEGORIZED });
};
