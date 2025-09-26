import React, { useMemo } from 'react';
import { Expense } from '../types';
import Summary from './Summary';
import CategoryPieChart from './CategoryPieChart';
import InstallmentsTimeline from './InstallmentsTimeline';
import Suggestions from './Suggestions';
import ExpenseList from './ExpenseList';
import Card from './common/Card';
import { HelpCircle, Download } from 'lucide-react';

interface DashboardProps {
  totalAmount: number;
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onEditIncome: () => void;
  onOpenAdvisor: () => void;
  onExportPDF: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  totalAmount,
  expenses,
  onEditExpense,
  onEditIncome,
  onOpenAdvisor,
  onExportPDF
}) => {
  
  const currentMonthExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.dueDate);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  }, [expenses]);

  const totalExpenses = currentMonthExpenses.reduce((acc, expense) => acc + expense.amount, 0);
  const balance = totalAmount - totalExpenses;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Seu Relatório Financeiro</h2>
          <div className="flex gap-2">
             <button
              onClick={onOpenAdvisor}
              className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <HelpCircle size={18} />
              Posso fazer essa compra?
            </button>
            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download size={18} />
              Exportar (PDF)
            </button>
          </div>
        </div>
      </Card>

      <Summary totalIncome={totalAmount} totalExpenses={totalExpenses} balance={balance} onEditIncome={onEditIncome}/>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryPieChart expenses={currentMonthExpenses} totalIncome={totalAmount} />
        </div>
        <Suggestions expenses={currentMonthExpenses} totalIncome={totalAmount} />
      </div>

      <ExpenseList expenses={currentMonthExpenses} onEdit={onEditExpense} />
      
      <InstallmentsTimeline allExpenses={expenses} />
    </div>
  );
};

export default Dashboard;