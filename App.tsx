import React, { useState, useEffect, useCallback } from 'react';
import { FinancialData, Expense, Income } from './types';
import { fetchFinancialData, saveExpense, updateExpense, saveIncome } from './services/apiService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import { PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const financialData = await fetchFinancialData();
      setData(financialData);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar os dados financeiros.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await saveExpense(expenseData);
      await loadData(); // Reload all data to reflect changes
      closeExpenseModal();
    } catch (err) {
      console.error('Failed to add expense:', err);
    }
  };
  
  const handleUpdateExpense = async (expenseData: Expense) => {
    try {
      await updateExpense(expenseData);
      await loadData();
      closeExpenseModal();
    } catch(err) {
      console.error('Failed to update expense:', err);
    }
  }
  
  const handleSaveIncome = async (incomeData: Income) => {
    try {
      await saveIncome(incomeData);
      await loadData();
      setIsIncomeModalOpen(false);
    } catch(err) {
      console.error('Failed to save income:', err);
    }
  }
  
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
        {isLoading && <p className="text-center text-lg">Carregando dados...</p>}
        {error && <p className="text-center text-lg text-red-500">{error}</p>}
        {data && !isLoading && !error && (
          <Dashboard 
            data={data} 
            onEditExpense={openExpenseModalToEdit}
            onEditIncome={() => setIsIncomeModalOpen(true)}
          />
        )}
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
          onSaveAdd={handleAddExpense}
          onSaveEdit={handleUpdateExpense}
          expenseToEdit={editingExpense}
        />
      )}
      
      {isIncomeModalOpen && data && (
        <IncomeForm 
          onClose={() => setIsIncomeModalOpen(false)}
          onSave={handleSaveIncome}
          currentIncome={data.income}
        />
      )}
    </div>
  );
};

export default App;