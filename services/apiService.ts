import { Expense, Category } from '../types';

export type NewExpenseData = Omit<Expense, 'id'>;

const STORAGE_KEY = 'poupa-ai-financials';
const CATEGORY_TARGETS_KEY = 'poupa-ai-category-targets';

type StoredData = {
  totalAmount: number;
  expenses: Expense[];
};

export type CategoryTargets = Partial<Record<Category, { target: number }>>;


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
  const totalInstallments = expenseData.installments?.total ?? 1;

  if (totalInstallments > 1) {
    const groupId = `${Date.now()}-group-${Math.random().toString(36).substr(2, 9)}`;
    const originalDate = new Date(expenseData.dueDate);
    for (let i = 1; i <= totalInstallments; i++) {
      const installmentDate = new Date(originalDate.getUTCFullYear(), originalDate.getUTCMonth() + i - 1, originalDate.getUTCDate());
      
      if (installmentDate.getUTCDate() !== originalDate.getUTCDate()) {
        installmentDate.setDate(0);
      }

      const newExpense: Expense = {
        ...expenseData,
        id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        groupId,
        dueDate: installmentDate.toISOString().split('T')[0],
        installments: {
          current: i,
          total: totalInstallments,
        },
        recurrence: undefined,
      };
      data.expenses.push(newExpense);
    }
  } else {
    const newExpense: Expense = {
      ...expenseData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    data.expenses.push(newExpense);
  }

  setStoredData(data);
  return Promise.resolve(data.expenses);
};


export const updateExpense = async (updatedExpense: Expense): Promise<Expense[]> => {
  const data = getStoredData();
  const originalExpense = data.expenses.find(e => e.id === updatedExpense.id);
  
  if (!originalExpense) {
    return Promise.reject(new Error('Despesa não encontrada para atualização.'));
  }
  
  const originalGroupId = originalExpense.groupId;
  
  // Delete old entries (the entire group if it was an installment, or the single expense)
  if (originalGroupId) {
    data.expenses = data.expenses.filter(e => e.groupId !== originalGroupId);
  } else {
    data.expenses = data.expenses.filter(e => e.id !== originalExpense.id);
  }
  
  // Re-add the expense(s) based on the updated data.
  const totalInstallments = updatedExpense.installments?.total ?? 1;

  if (totalInstallments > 1) {
    const groupId = originalGroupId || `${Date.now()}-group-${Math.random().toString(36).substr(2, 9)}`;
    const baseDate = new Date(updatedExpense.dueDate);

    for (let i = 1; i <= totalInstallments; i++) {
      const installmentDate = new Date(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + i - 1, baseDate.getUTCDate());
      if (installmentDate.getUTCDate() !== baseDate.getUTCDate()) {
        installmentDate.setDate(0);
      }

      const newInstallment: Expense = {
        name: updatedExpense.name,
        amount: updatedExpense.amount,
        category: updatedExpense.category,
        payer: updatedExpense.payer,
        id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        groupId: groupId,
        dueDate: installmentDate.toISOString().split('T')[0],
        installments: {
          current: i,
          total: totalInstallments,
        },
      };
      data.expenses.push(newInstallment);
    }
  } else {
    // It's a single expense now
    const newSingleExpense: Expense = {
      ...updatedExpense,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Give it a new ID
      installments: undefined,
      groupId: undefined,
    };
    data.expenses.push(newSingleExpense);
  }
  
  setStoredData(data);
  return Promise.resolve(data.expenses);
};

export const deleteExpense = async (id: string): Promise<void> => {
  const data = getStoredData();
  const expenseToDelete = data.expenses.find(e => e.id === id);

  if (!expenseToDelete) return Promise.resolve();

  if (expenseToDelete.groupId) {
    data.expenses = data.expenses.filter(e => e.groupId !== expenseToDelete.groupId);
  } else {
    data.expenses = data.expenses.filter(e => e.id !== id);
  }

  setStoredData(data);
  return Promise.resolve();
};

export const getCustomCategoryTargets = async (): Promise<CategoryTargets> => {
    const stored = localStorage.getItem(CATEGORY_TARGETS_KEY);
    if (stored) {
        return Promise.resolve(JSON.parse(stored));
    }
    return Promise.resolve({});
};

export const saveCustomCategoryTargets = async (targets: CategoryTargets): Promise<void> => {
    localStorage.setItem(CATEGORY_TARGETS_KEY, JSON.stringify(targets));
    return Promise.resolve();
};

export const resetCustomCategoryTargets = async (): Promise<void> => {
    localStorage.removeItem(CATEGORY_TARGETS_KEY);
    return Promise.resolve();
};


// A função de sugestão de categoria é local e não precisa de API
export const suggestCategory = async (description: string): Promise<{ category: Category }> => {
  // Esta função não é usada, pois a lógica está diretamente em ExpenseForm.tsx,
  // mas a mantemos para a integridade da interface da API simulada.
  return Promise.resolve({ category: Category.UNCATEGORIZED });
};