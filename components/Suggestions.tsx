import React, { useMemo } from 'react';
import { Expense, Category, CategoryInfo } from '../types';
import Card from './common/Card';
import { Lightbulb, CheckCircle, AlertTriangle, Settings } from 'lucide-react';

interface SuggestionsProps {
  expenses: Expense[];
  totalIncome: number;
  categoryConfig: Record<Category, CategoryInfo>;
  onOpenBudgetConfig: () => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ expenses, totalIncome, categoryConfig, onOpenBudgetConfig }) => {
  const suggestions = useMemo(() => {
    if (totalIncome === 0) {
        return ["Defina seu valor disponível para receber sugestões."];
    }
    
    // FIX: Explicitly type the accumulator in the reduce function to ensure correct type inference for categoryTotals.
    const categoryTotals = expenses.reduce((acc: Record<string, number>, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const newSuggestions: string[] = [];

    Object.keys(categoryConfig).forEach(categoryKey => {
      const category = categoryKey as Category;
      if (category === Category.UNCATEGORIZED) return;

      const info = categoryConfig[category];
      const amount = categoryTotals[category] || 0;
      const targetPercent = info.target * 100;

      if (info.target > 0) {
        const spentPercent = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
        // Check if spent percentage is strictly greater than the target.
        // This avoids warnings for spending exactly the target amount.
        if (spentPercent > targetPercent) {
          newSuggestions.push(
            `Você gastou ${spentPercent.toFixed(2)}% da sua renda em ${info.name}, acima da meta de ${targetPercent.toFixed(0)}%. Considere reavaliar seus gastos nesta categoria.`
          );
        }
      }
    });

    if (!categoryTotals[Category.INVESTMENTS]) {
        newSuggestions.push(`Lembre-se de alocar ${(categoryConfig.INVESTMENTS.target * 100).toFixed(0)}% para ${categoryConfig.INVESTMENTS.name}. Fazer seu dinheiro trabalhar para você é fundamental.`);
    }

    if (!categoryTotals[Category.KNOWLEDGE]) {
        newSuggestions.push(`Considere reservar uma parte da sua renda para ${categoryConfig.KNOWLEDGE.name}. Investir em si mesmo é sempre um bom negócio!`);
    }

    if (newSuggestions.length === 0) {
      return ["Seus gastos estão bem alinhados com as metas. Ótimo trabalho!"];
    }

    return newSuggestions;
  }, [expenses, totalIncome, categoryConfig]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getSuggestionIcon = (suggestion: string) => {
    if (suggestion.includes("Ótimo trabalho")) {
      return <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />;
    }
    if (suggestion.includes("acima da meta")) {
      return <AlertTriangle className="text-orange-500 mr-3 flex-shrink-0" size={20} />;
    }
    // Default icon for reminders
    return <Lightbulb className="text-blue-500 mr-3 flex-shrink-0" size={20} />;
  };

  return (
    <Card id="tour-suggestions">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <Lightbulb className="mr-2 text-yellow-400" />
                Saúde Financeira
            </h3>
            {totalIncome > 0 && (
                <button
                onClick={onOpenBudgetConfig}
                className="flex items-center gap-2 py-1 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Configurar Metas de Orçamento"
                >
                <Settings size={16} />
                <span className="hidden sm:inline">Configurar Metas</span>
                </button>
            )}
        </div>
        
        {totalIncome > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Sugestão de Orçamento (com base em {formatCurrency(totalIncome)})
            </h4>
            <ul className="space-y-2">
              {/* FIX: Cast the result of Object.entries to ensure correct types for `info`, `a`, and `b` in chained methods. */}
              {(Object.entries(categoryConfig) as [Category, CategoryInfo][])
                .filter(([key, info]) => key !== Category.UNCATEGORIZED && info.target > 0)
                .sort(([, a], [, b]) => b.target - a.target)
                .map(([key, info]) => (
                  <li key={key} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                       <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: info.color }}></span>
                       <span className="text-gray-600 dark:text-gray-300">{info.name} ({(info.target * 100).toFixed(0)}%)</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalIncome * info.target)}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
        
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Análise dos seus gastos
        </h4>
        <ul className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              {getSuggestionIcon(suggestion)}
              <p className="text-gray-600 dark:text-gray-300">{suggestion}</p>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default Suggestions;