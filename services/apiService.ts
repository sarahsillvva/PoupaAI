import { FinancialData, Expense, Category, Income } from '../types';

// Mock database
let mockData: FinancialData = {
  income: {
    salary: 5000,
    initialBalance: 1500,
  },
  expenses: [
    { id: '1', name: 'Aluguel', amount: 1200, category: Category.FIXED_COSTS, dueDate: '2024-07-05' },
    { id: '2', name: 'Conta de Luz', amount: 150, category: Category.FIXED_COSTS, dueDate: '2024-07-10' },
    { id: '3', name: 'Internet', amount: 100, category: Category.FIXED_COSTS, dueDate: '2024-07-12' },
    { id: '4', name: 'Supermercado', amount: 800, category: Category.COMFORT, dueDate: '2024-07-15' },
    { id: '5', name: 'Netflix', amount: 39.90, category: Category.FIXED_COSTS, dueDate: '2024-07-20' },
    { id: '6', name: 'Jantar fora', amount: 250, category: Category.PLEASURES, dueDate: '2024-07-22' },
    { id: '7', name: 'Curso de React', amount: 97, category: Category.KNOWLEDGE, dueDate: '2024-07-25' },
    { id: '8', name: 'Aporte Tesouro Selic', amount: 500, category: Category.INVESTMENTS, dueDate: '2024-07-01' },
    { id: '9', name: 'Viagem Fim de Ano', amount: 300, category: Category.GOALS, dueDate: '2024-07-10' },
    { id: '10', name: 'Celular Novo', amount: 400, category: Category.GOALS, dueDate: '2024-07-28', installments: { current: 3, total: 10 } },
    { id: '11', name: 'Playstation 5', amount: 500, category: Category.PLEASURES, dueDate: '2024-08-15', installments: { current: 8, total: 12 } },
  ],
};

export const fetchFinancialData = async (): Promise<FinancialData> => {
  console.log('Fetching financial data...');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockData))); // Deep copy
    }, 500);
  });
};

export const saveIncome = async (income: Income): Promise<Income> => {
  console.log('Saving income:', income);
  return new Promise((resolve) => {
    setTimeout(() => {
      mockData.income = income;
      resolve(mockData.income);
    }, 300);
  });
};

export const saveExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    console.log('Saving expense:', expense);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (expense.installments && expense.installments.total > 1) {
                const newExpenses: Expense[] = [];
                const baseId = crypto.randomUUID();
                for (let i = 0; i < expense.installments.total; i++) {
                    const expenseDate = new Date(expense.dueDate);
                    expenseDate.setMonth(expenseDate.getMonth() + i);
                    const newExpense: Expense = {
                        ...expense,
                        id: `${baseId}-${i}`,
                        dueDate: expenseDate.toISOString().split('T')[0],
                        installments: {
                            current: i + 1,
                            total: expense.installments.total,
                        },
                    };
                    mockData.expenses.push(newExpense);
                    newExpenses.push(newExpense);
                }
                resolve(newExpenses[0]);
            } else {
                const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
                mockData.expenses.push(newExpense);
                resolve(newExpense);
            }
        }, 300);
    });
};

export const updateExpense = async (expense: Expense): Promise<Expense> => {
    console.log('Updating expense:', expense);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockData.expenses.findIndex(e => e.id === expense.id);
            if (index !== -1) {
                // For simplicity, we are not handling installment updates here.
                // A real implementation would need to decide how to handle changes to installment counts.
                mockData.expenses[index] = expense;
                resolve(expense);
            } else {
                reject(new Error('Expense not found'));
            }
        }, 300);
    });
};


export const suggestCategory = async (description: string): Promise<Category> => {
  console.log('Suggesting category for:', description);
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerDesc = description.toLowerCase();
      if (/(aluguel|luz|água|internet|condomínio|gás)/.test(lowerDesc)) {
        resolve(Category.FIXED_COSTS);
      } else if (/(supermercado|feira|padaria|transporte|gasolina)/.test(lowerDesc)) {
        resolve(Category.COMFORT);
      } else if (/(restaurante|bar|cinema|show|festa|viagem curta|ifood)/.test(lowerDesc)) {
        resolve(Category.PLEASURES);
      } else if (/(curso|livro|workshop|palestra)/.test(lowerDesc)) {
        resolve(Category.KNOWLEDGE);
      } else if (/(aporte|investimento|tesouro|cdb|ações|fii)/.test(lowerDesc)) {
        resolve(Category.INVESTMENTS);
      } else if (/(viagem|carro|casa|reforma|meta)/.test(lowerDesc)) {
        resolve(Category.GOALS);
      } else {
        resolve(Category.UNCATEGORIZED);
      }
    }, 200);
  });
};