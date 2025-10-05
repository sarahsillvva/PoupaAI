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
import BudgetConfigModal from './BudgetConfigModal';
import ThirdPartyExpensesList from './ThirdPartyExpensesList';
import { Expense, Category, CategoryInfo } from '../types';
import * as api from '../services/apiService';
import { generatePDF } from '../utils/pdfGenerator';
import { CATEGORIES } from '../constants';

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

  const [categoryConfig, setCategoryConfig] = useState<Record<Category, CategoryInfo> | null>(null);
  const [isBudgetConfigOpen, setIsBudgetConfigOpen] = useState(false);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const mergeConfig = (customTargets: api.CategoryTargets) => {
      const newConfig = JSON.parse(JSON.stringify(CATEGORIES)); // Deep copy defaults
      for (const key in customTargets) {
          const categoryKey = key as Category;
          if (newConfig[categoryKey] && customTargets[categoryKey] !== undefined) {
              newConfig[categoryKey].target = customTargets[categoryKey]!.target;
          }
      }
      return newConfig;
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [{ totalAmount, expenses: fetchedExpenses }, customTargets] = await Promise.all([
        api.getFinancialData(),
        api.getCustomCategoryTargets()
      ]);
      setTotalIncome(totalAmount);
      setExpenses(fetchedExpenses);
      setCategoryConfig(mergeConfig(customTargets));
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

  // Efeito para corrigir o scroll inicial
  useEffect(() => {
    if (!isLoading) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [isLoading]);
  
  const { personalExpenses, thirdPartyExpenses, totalExpenses, balance } = useMemo(() => {
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.dueDate);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const personal = monthExpenses.filter(e => !e.payer);
    const thirdParty = monthExpenses.filter(e => !!e.payer);
    
    const total = personal.reduce((acc, expense) => acc + expense.amount, 0);
    
    return {
      personalExpenses: personal,
      thirdPartyExpenses: thirdParty,
      totalExpenses: total,
      balance: totalIncome - total,
    };
  }, [expenses, totalIncome, currentMonth, currentYear]);


  // Event listeners for header buttons
  useEffect(() => {
    const handleAddExpense = () => {
      setExpenseToEdit(null);
      setIsExpenseFormOpen(true);
    };
    const handleOpenPurchaseAdvisor = () => setIsPurchaseAdvisorOpen(true);
    const handleGeneratePDF = async () => {
        // @ts-ignore
        if (typeof jspdf !== 'undefined') {
            try {
                await generatePDF(totalIncome, personalExpenses);
            } catch (pdfError) {
                console.error("Failed to generate PDF:", pdfError);
                alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
            }
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
  }, [totalIncome, personalExpenses]);

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

  const handleSaveCategoryConfig = async (newTargets: api.CategoryTargets) => {
    try {
        await api.saveCustomCategoryTargets(newTargets);
        const customTargets = await api.getCustomCategoryTargets();
        setCategoryConfig(mergeConfig(customTargets));
        setIsBudgetConfigOpen(false);
    } catch (err) {
        setError('Falha ao salvar a configuração de metas.');
    }
  };

  const handleResetCategoryConfig = async () => {
      try {
          await api.resetCustomCategoryTargets();
          setCategoryConfig(JSON.parse(JSON.stringify(CATEGORIES)));
          setIsBudgetConfigOpen(false);
      } catch (err) {
          setError('Falha ao redefinir as metas.');
      }
  };

  if (isLoading || !categoryConfig) {
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
            expenses={personalExpenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteRequest}
          />
           <ThirdPartyExpensesList
            expenses={thirdPartyExpenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteRequest}
          />
        </div>
        <div className="space-y-6">
          <CategoryPieChart expenses={personalExpenses} totalIncome={totalIncome} />
          <InstallmentsTimeline allExpenses={expenses} />
        </div>
      </div>
      <Suggestions
        expenses={personalExpenses}
        totalIncome={totalIncome}
        categoryConfig={categoryConfig}
        onOpenBudgetConfig={() => setIsBudgetConfigOpen(true)}
      />

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
          currentExpenses={personalExpenses}
          categoryConfig={categoryConfig}
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
      {isBudgetConfigOpen && (
        <BudgetConfigModal
            isOpen={isBudgetConfigOpen}
            onClose={() => setIsBudgetConfigOpen(false)}
            onSave={handleSaveCategoryConfig}
            onReset={handleResetCategoryConfig}
            currentConfig={categoryConfig}
        />
      )}
    </main>
  );
};

export default Dashboard;
