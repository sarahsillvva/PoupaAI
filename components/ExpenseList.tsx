import React from 'react';
import { Expense } from '../types';
import { CATEGORIES } from '../constants';
import { Edit, Trash2, Repeat } from 'lucide-react';
import Card from './common/Card';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Despesas do Mês</h3>
        {sortedExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Vencimento</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full" style={{ backgroundColor: `${CATEGORIES[expense.category].color}20` }}>
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORIES[expense.category].color }}></div>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{expense.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">{CATEGORIES[expense.category].name}</div>
                            {expense.installments && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-medium px-2 py-0.5 rounded-full">
                                    {expense.installments.current}/{expense.installments.total}
                                </span>
                            )}
                            {expense.recurrence === 'monthly' && (
                                <span title="Despesa Recorrente">
                                    <Repeat size={14} className="inline ml-2 text-blue-500" />
                                </span>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ color: CATEGORIES[expense.category].color, backgroundColor: `${CATEGORIES[expense.category].color}20` }}>
                            {CATEGORIES[expense.category].name}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {new Date(expense.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600 dark:text-red-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button onClick={() => onEdit(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="Editar Despesa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => onDelete(expense)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="Excluir Despesa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa registrada para este mês.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Clique em "Adicionar Despesa" para começar.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExpenseList;
