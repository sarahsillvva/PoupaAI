import React, { useMemo, useState } from 'react';
import { FinancialData, Expense } from '../types';
import Summary from './Summary';
import CategoryPieChart from './CategoryPieChart';
import InstallmentsTimeline from './InstallmentsTimeline';
import Suggestions from './Suggestions';
import ExpenseList from './ExpenseList';
import Card from './common/Card';

interface DashboardProps {
  data: FinancialData;
  onEditExpense: (expense: Expense) => void;
  onEditIncome: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onEditExpense, onEditIncome }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthlyData = useMemo(() => {
    const filteredExpenses = data.expenses.filter(expense => {
      const expenseDate = new Date(expense.dueDate);
      return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
    });
    return { ...data, expenses: filteredExpenses };
  }, [data, selectedMonth, selectedYear]);

  const totalIncome = data.income.salary + data.income.initialBalance;
  const totalExpenses = monthlyData.expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(0, i).toLocaleString('default', { month: 'long' })
  }));


  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-4 p-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Painel de Controle</h2>
          <div className="flex-grow"></div>
          <select value={selectedMonth} onChange={handleMonthChange} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input type="number" value={selectedYear} onChange={handleYearChange} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 w-24" />
        </div>
      </Card>

      <Summary totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} onEditIncome={onEditIncome}/>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryPieChart expenses={monthlyData.expenses} totalIncome={totalIncome} />
        </div>
        <Suggestions expenses={monthlyData.expenses} totalIncome={totalIncome} />
      </div>

      <ExpenseList expenses={monthlyData.expenses} onEdit={onEditExpense} />
      
      <InstallmentsTimeline allExpenses={data.expenses} />
    </div>
  );
};

export default Dashboard;