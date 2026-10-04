import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense, Category } from '../types';
import { CATEGORIES } from '../constants';
import Card from './common/Card';

interface CategoryPieChartProps {
  expenses: Expense[];
  totalIncome: number;
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ expenses, totalIncome }) => {
  const data = useMemo(() => {
    // FIX: Explicitly type the accumulator in the reduce function to ensure correct type inference for categoryTotals.
    const categoryTotals = expenses.reduce((acc: Record<Category, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<Category, number>);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORIES[category as Category].name,
        value: Number(amount),
        color: CATEGORIES[category as Category].color,
        percentage: totalIncome > 0 ? (Number(amount) / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, totalIncome]);

  if (expenses.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Divisão de Gastos por Categoria</h3>
          <div className="flex h-48 items-center justify-center text-center text-gray-500 dark:text-gray-400 sm:h-64">
            Nenhuma despesa registrada para este mês.
          </div>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-700 p-2 border border-gray-200 dark:border-gray-600 rounded shadow-lg text-gray-800 dark:text-gray-200">
          <p className="font-bold text-gray-900 dark:text-white">{`${data.name}`}</p>
          <p className="text-sm">{`Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}`}</p>
          <p className="text-sm">{`Percentual da Renda: ${data.percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };
  

  return (
    <Card>
       <div className="p-4 sm:p-6">
        <h3 className="mb-3 text-base font-semibold text-gray-700 dark:text-gray-300 sm:text-lg">Divisão de Gastos por Categoria</h3>
        <div className="mx-auto h-52 w-full max-w-md sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="82%"
                fill="#8884d8"
                dataKey="value"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map(entry => (
            <div key={entry.name} className="flex min-w-0 items-center gap-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.name}</span>
              <span className="ml-auto flex-none font-medium">{entry.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CategoryPieChart;
