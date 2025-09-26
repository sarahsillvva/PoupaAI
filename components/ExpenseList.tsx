import React from 'react';
import { Expense } from '../types';
import { CATEGORIES } from '../constants';
import Card from './common/Card';
import { Edit, List } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit }) => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <List className="mr-2" />
            Despesas do Mês
        </h3>
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vencimento</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Editar</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{expense.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span style={{color: CATEGORIES[expense.category].color}}>●</span> {CATEGORIES[expense.category].name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(expense.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => onEdit(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mt-4">Nenhuma despesa registrada para este mês.</p>
        )}
      </div>
    </Card>
  );
};

export default ExpenseList;
