import React, { useState, useCallback } from 'react';
// FIX: Import `Category` enum to correctly type initial expenses.
import { Expense, Category } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import PurchaseAdvisor from './components/PurchaseAdvisor';
import { generatePDF } from './utils/pdfGenerator';
import { PlusCircle } from 'lucide-react';

const initialExpenses: Expense[] = [
    // FIX: Use `Category` enum instead of raw strings to match the `Expense` type.
    { id: '1', name: 'Aluguel', amount: 1200, category: Category.FIXED_COSTS, dueDate: '2024-07-05', recurrence: 'monthly' },
    { id: '2', name: 'Supermercado', amount: 800, category: Category.COMFORT, dueDate: '2024-07-15' },
    { id: '3', name: 'Netflix', amount: 39.90, category: Category.FIXED_COSTS, dueDate: '2024-07-20', recurrence: 'monthly' },
    { id: '4', name: 'Celular Novo', amount: 400, category: Category.GOALS, dueDate: '2024-07-28', installments: { current: 3, total: 10 } },
];

const App: React.FC = () => {
  const [totalAmount, setTotalAmount] = useState<number>(6500);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState<boolean>(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState<boolean>(false);
  
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (expenseData.installments && expenseData.installments.total > 1) {
        const newExpenses: Expense[] = [];
        const baseId = crypto.randomUUID();
        for (let i = 0; i < expenseData.installments.total; i++) {
            const expenseDate = new Date(expenseData.dueDate);
            expenseDate.setMonth(expenseDate.getMonth() + i);
            newExpenses.push({
                ...expenseData,
                id: `${baseId}-${i}`,
                dueDate: expenseDate.toISOString().split('T')[0],
                installments: { current: i + 1, total: expenseData.installments.total },
            });
        }
        setExpenses(prev => [...prev, ...newExpenses]);
    } else {
        const newExpense: Expense = { ...expenseData, id: crypto.randomUUID() };
        setExpenses(prev => [...prev, newExpense]);
    }
    closeExpenseModal();
  };
  
  const handleUpdateExpense = (expenseData: Expense) => {
    setExpenses(prev => prev.map(e => e.id === expenseData.id ? expenseData : e));
    closeExpenseModal();
  }
  
  const handleSaveIncome = (newTotal: number) => {
    setTotalAmount(newTotal);
    setIsIncomeModalOpen(false);
  }

  const handleExportPDF = () => {
    generatePDF(totalAmount, expenses);
  };
  
  const openExpenseModalToEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <Dashboard 
          totalAmount={totalAmount}
          expenses={expenses}
          onEditExpense={openExpenseModalToEdit}
          onEditIncome={() => setIsIncomeModalOpen(true)}
          onOpenAdvisor={() => setIsAdvisorModalOpen(true)}
          onExportPDF={handleExportPDF}
        />
      </main>

      <button
        onClick={() => setIsExpenseModalOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="Adicionar Despesa"
      >
        <PlusCircle size={28} />
      </button>

      {isExpenseModalOpen && (
        <ExpenseForm
          onClose={closeExpenseModal}
          onSaveAdd={handleSaveExpense}
          onSaveEdit={handleUpdateExpense}
          expenseToEdit={editingExpense}
        />
      )}
      
      {isIncomeModalOpen && (
        <IncomeForm 
          onClose={() => setIsIncomeModalOpen(false)}
          onSave={handleSaveIncome}
          currentTotalAmount={totalAmount}
        />
      )}

      {isAdvisorModalOpen && (
        <PurchaseAdvisor
          onClose={() => setIsAdvisorModalOpen(false)}
          totalAmount={totalAmount}
          currentExpenses={expenses}
        />
      )}
    </div>
  );
};

export default App;