import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, Category } from '../types';
import { CATEGORIES } from '../constants';
import Card from './common/Card';

interface CategoryPieChartProps {
  expenses: Expense[];
  totalIncome: number;
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ expenses, totalIncome }) => {
  const data = useMemo(() => {
    // FIX: Provide generic type argument to `reduce` to ensure `categoryTotals` is correctly typed.
    // This resolves issues with arithmetic operations on `amount` later.
    const categoryTotals = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORIES[category as Category].name,
        value: amount,
        color: CATEGORIES[category as Category].color,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, totalIncome]);

  if (expenses.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Divisão de Gastos por Categoria</h3>
          <div className="h-80 flex items-center justify-center text-gray-500">
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
        <div className="bg-white dark:bg-gray-700 p-2 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
          <p className="font-bold">{`${data.name}`}</p>
          <p>{`Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}`}</p>
          <p>{`Percentual da Renda: ${data.percentage.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };
  

  return (
    <Card>
       <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Divisão de Gastos por Categoria</h3>
        <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default CategoryPieChart;
