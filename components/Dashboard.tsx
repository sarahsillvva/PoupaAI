import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Summary from './Summary';
import CategoryPieChart from './CategoryPieChart';
import InstallmentsTimeline from './InstallmentsTimeline';
import Suggestions from './Suggestions';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import IncomeForm from './IncomeForm';
import PurchaseAdvisor from './PurchaseAdvisor';
import WarningModal from './WarningModal';
import { Expense } from '../types';
import * as api from '../services/apiService';
import { generatePDF } from '../utils/pdfGenerator';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [isPurchaseAdvisorOpen, setIsPurchaseAdvisorOpen] = useState(false);
  
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { totalAmount, expenses: fetchedExpenses } = await api.getFinancialData();
      setTotalIncome(totalAmount);
      setExpenses(fetchedExpenses);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar dados financeiros. Tente novamente mais tarde.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Event listeners for header buttons
  useEffect(() => {
    const handleAddExpense = () => {
      setExpenseToEdit(null);
      setIsExpenseFormOpen(true);
    };
    const handleOpenPurchaseAdvisor = () => setIsPurchaseAdvisorOpen(true);
    const handleGeneratePDF = () => {
        // @ts-ignore
        if (typeof jspdf !== 'undefined') {
            generatePDF(totalIncome, expenses);
        } else {
            console.error("jsPDF not loaded");
            alert("Ocorreu um erro ao gerar o PDF. A biblioteca PDF não foi carregada.");
        }
    };

    window.addEventListener('add-expense', handleAddExpense);
    window.addEventListener('open-purchase-advisor', handleOpenPurchaseAdvisor);
    window.addEventListener('generate-pdf', handleGeneratePDF);

    return () => {
      window.removeEventListener('add-expense', handleAddExpense);
      window.removeEventListener('open-purchase-advisor', handleOpenPurchaseAdvisor);
      window.removeEventListener('generate-pdf', handleGeneratePDF);
    };
  }, [totalIncome, expenses]);

  const { currentMonthExpenses, totalExpenses, balance } = useMemo(() => {
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.dueDate);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    const total = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0);
    return {
      currentMonthExpenses: filteredExpenses,
      totalExpenses: total,
      balance: totalIncome - total,
    };
  }, [expenses, totalIncome, currentMonth, currentYear]);

  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      const newExpenses = await api.addExpense(expenseData);
      setExpenses(newExpenses);
      setIsExpenseFormOpen(false);
    } catch (err) {
      setError('Falha ao adicionar despesa.');
    }
  };

  const handleUpdateExpense = async (expense: Expense) => {
    try {
      await api.updateExpense(expense);
      await fetchData(); // Refetch all data to ensure consistency
      setIsExpenseFormOpen(false);
      setExpenseToEdit(null);
    } catch (err) {
      setError('Falha ao atualizar despesa.');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseFormOpen(true);
  };

  const handleDeleteRequest = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsWarningModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    try {
      await api.deleteExpense(expenseToDelete.id);
      await fetchData(); // Refetch
      setIsWarningModalOpen(false);
      setExpenseToDelete(null);
    } catch (err) {
      setError('Falha ao deletar despesa.');
    }
  };

  const handleSaveIncome = async (newTotal: number) => {
    try {
      const { totalAmount } = await api.updateTotalAmount(newTotal);
      setTotalIncome(totalAmount);
      setIsIncomeFormOpen(false);
    } catch (err) {
      setError('Falha ao atualizar o valor disponível.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500 dark:text-gray-400">Carregando dados...</div></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-4 rounded-md">{error}</div></div>;
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Summary
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        onEditIncome={() => setIsIncomeFormOpen(true)}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ExpenseList
            expenses={currentMonthExpenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteRequest}
          />
        </div>
        <div className="space-y-6">
          <CategoryPieChart expenses={currentMonthExpenses} totalIncome={totalIncome} />
          <InstallmentsTimeline allExpenses={expenses} />
        </div>
      </div>
      <Suggestions expenses={currentMonthExpenses} totalIncome={totalIncome} />

      {isExpenseFormOpen && (
        <ExpenseForm
          onClose={() => setIsExpenseFormOpen(false)}
          onSaveAdd={handleSaveExpense}
          onSaveEdit={handleUpdateExpense}
          expenseToEdit={expenseToEdit}
        />
      )}
      {isIncomeFormOpen && (
        <IncomeForm
          onClose={() => setIsIncomeFormOpen(false)}
          onSave={handleSaveIncome}
          currentTotalAmount={totalIncome}
        />
      )}
      {isPurchaseAdvisorOpen && (
        <PurchaseAdvisor 
          onClose={() => setIsPurchaseAdvisorOpen(false)}
          totalAmount={totalIncome}
          currentExpenses={currentMonthExpenses}
        />
      )}
      {isWarningModalOpen && expenseToDelete && (
        <WarningModal
          isOpen={isWarningModalOpen}
          onClose={() => setIsWarningModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirmar Exclusão"
        >
          <p>Você tem certeza que deseja excluir a despesa "{expenseToDelete.name}"?</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Esta ação não pode ser desfeita.</p>
        </WarningModal>
      )}
    </main>
  );
};

export default Dashboard;
