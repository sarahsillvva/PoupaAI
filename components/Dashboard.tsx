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
import MonthNavigator from './MonthNavigator';
import FeedbackModal from './FeedbackModal';
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
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  const [viewDate, setViewDate] = useState(new Date());


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
    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();
    const endOfViewMonth = new Date(viewYear, viewMonth + 1, 0);

    const displayedExpenses: Expense[] = [];

    expenses.forEach(expense => {
      const expenseStartDate = new Date(expense.dueDate);
      expenseStartDate.setUTCHours(0, 0, 0, 0);

      if (expense.recurrence === 'monthly') {
        if (expenseStartDate <= endOfViewMonth) {
          if (expense.recurrenceEndDate) {
            const recurrenceEndDate = new Date(expense.recurrenceEndDate);
            if (viewDate > recurrenceEndDate) return; 
          }
          const recurringInstance = { ...expense };
          const newDate = new Date(expense.dueDate);
          
          newDate.setFullYear(viewYear);
          newDate.setMonth(viewMonth);
          
          if (newDate.getMonth() !== viewMonth) {
              newDate.setDate(0);
          }
          
          recurringInstance.dueDate = newDate.toISOString().split('T')[0];
          recurringInstance.id = `${expense.id}-recurring-${viewYear}-${viewMonth}`;
          recurringInstance.originalId = expense.id; // Mantém o ID original
          displayedExpenses.push(recurringInstance);
        }
      } else {
        const expenseDate = new Date(expense.dueDate);
        if (expenseDate.getUTCFullYear() === viewYear && expenseDate.getUTCMonth() === viewMonth) {
          displayedExpenses.push(expense);
        }
      }
    });

    const personal = displayedExpenses.filter(e => !e.payer);
    const thirdParty = displayedExpenses.filter(e => !!e.payer);
    const total = personal.reduce((acc, expense) => acc + expense.amount, 0);
    
    return {
      personalExpenses: personal,
      thirdPartyExpenses: thirdParty,
      totalExpenses: total,
      balance: totalIncome - total,
    };
  }, [expenses, totalIncome, viewDate]);


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
                await generatePDF(totalIncome, expenses); // Pass all expenses
            } catch (pdfError) {
                console.error("Failed to generate PDF:", pdfError);
                alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
            }
        } else {
            console.error("jsPDF not loaded");
            alert("Ocorreu um erro ao gerar o PDF. A biblioteca PDF não foi carregada.");
        }
    };

    const handleOpenFeedbackModal = () => setIsFeedbackModalOpen(true);

    window.addEventListener('add-expense', handleAddExpense);
    window.addEventListener('open-purchase-advisor', handleOpenPurchaseAdvisor);
    window.addEventListener('generate-pdf', handleGeneratePDF);
    window.addEventListener('open-feedback-modal', handleOpenFeedbackModal);

    return () => {
      window.removeEventListener('add-expense', handleAddExpense);
      window.removeEventListener('open-purchase-advisor', handleOpenPurchaseAdvisor);
      window.removeEventListener('generate-pdf', handleGeneratePDF);
      window.removeEventListener('open-feedback-modal', handleOpenFeedbackModal);
    };
  }, [totalIncome, expenses]);

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
      const newExpenses = await api.updateExpense(expense);
      setExpenses(newExpenses);
      setIsExpenseFormOpen(false);
      setExpenseToEdit(null);
    } catch (err) {
      setError('Falha ao atualizar despesa.');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    // If it's a recurring expense, find the original template
    if (expense.id.includes('-recurring-')) {
        const originalId = expense.id.split('-recurring-')[0];
        const originalExpense = expenses.find(e => e.id === originalId);
        if (originalExpense) {
            setExpenseToEdit(originalExpense);
            setIsExpenseFormOpen(true);
        }
        return;
    }

    // If it's an installment, find the first one in the group to get start date
    if (expense.groupId) {
        const firstInstallment = expenses
            .filter(e => e.groupId === expense.groupId)
            .sort((a, b) => (a.installments?.current ?? 0) - (b.installments?.current ?? 0))[0];
        
        if (firstInstallment) {
            setExpenseToEdit(firstInstallment);
            setIsExpenseFormOpen(true);
        }
        return;
    }

    // It's a regular, single expense
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
      // Se for uma despesa recorrente, define uma data de término em vez de excluir
      if (expenseToDelete.recurrence === 'monthly' && expenseToDelete.originalId) {
        const originalExpense = expenses.find(e => e.id === expenseToDelete.originalId);
        if (originalExpense) {
          const deletionDate = new Date(expenseToDelete.dueDate);
          // Define o fim da recorrência para o último dia do mês ANTERIOR à exclusão.
          const recurrenceEndDate = new Date(deletionDate.getFullYear(), deletionDate.getMonth(), 0);
          
          const updatedExpense = {
            ...originalExpense,
            recurrenceEndDate: recurrenceEndDate.toISOString().split('T')[0],
          };
          await api.updateExpense(updatedExpense);
        }
      } else {
        // Lógica de exclusão padrão para despesas normais e parceladas
        await api.deleteExpense(expenseToDelete.originalId ?? expenseToDelete.id);
      }
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
  
  const handlePreviousMonth = () => {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 15));
  };

  const handleNextMonth = () => {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 15));
  };


  if (isLoading || !categoryConfig) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl text-gray-500 dark:text-gray-400">Carregando dados...</div></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen"><div className="text-xl text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-4 rounded-md">{error}</div></div>;
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <MonthNavigator 
        viewDate={viewDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
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
          {expenseToDelete.recurrence === 'monthly' && <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">Atenção: Esta é uma despesa recorrente. A exclusão irá <strong>encerrar</strong> a recorrência a partir deste mês, mas o histórico será mantido.</p>}
          {(expenseToDelete.installments || expenseToDelete.groupId) && <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">Atenção: Esta despesa faz parte de um parcelamento. A exclusão removerá <strong>todas</strong> as parcelas relacionadas a esta compra.</p>}
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
      {isFeedbackModalOpen && (
        <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}
    </main>
  );
};

export default Dashboard;