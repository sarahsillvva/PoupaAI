import React, { useMemo } from 'react';
import { Expense, Category } from '../types';
import { CATEGORIES } from '../constants';
import Card from './common/Card';
import { Lightbulb } from 'lucide-react';

interface SuggestionsProps {
  expenses: Expense[];
  totalIncome: number;
}

const Suggestions: React.FC<SuggestionsProps> = ({ expenses, totalIncome }) => {
  const suggestions = useMemo(() => {
    if (totalIncome === 0) {
        return ["Defina seu valor disponível para receber sugestões."];
    }
    
    // FIX: Use a generic argument for reduce to ensure `categoryTotals` is correctly typed as Record<string, number>.
    // This prevents potential runtime errors by ensuring `amount` is a number before arithmetic operations.
    const categoryTotals = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const newSuggestions: string[] = [];

    Object.keys(CATEGORIES).forEach(categoryKey => {
      const category = categoryKey as Category;
      if (category === Category.UNCATEGORIZED) return;

      const info = CATEGORIES[category];
      const amount = categoryTotals[category] || 0;

      if (info.target > 0) {
        const percentage = amount / totalIncome;
        if (percentage > info.target) {
          newSuggestions.push(
            `Você gastou ${(percentage * 100).toFixed(0)}% da sua renda em ${info.name}, acima da meta de ${(info.target * 100).toFixed(0)}%. Considere reduzir gastos aqui.`
          );
        }
      }
    });

    if (!categoryTotals[Category.INVESTMENTS]) {
        newSuggestions.push(`Lembre-se de alocar ${CATEGORIES.INVESTMENTS.target * 100}% para ${CATEGORIES.INVESTMENTS.name}. Fazer seu dinheiro trabalhar para você é fundamental.`);
    }

    if (!categoryTotals[Category.KNOWLEDGE]) {
        newSuggestions.push(`Considere reservar uma parte da sua renda para ${CATEGORIES.KNOWLEDGE.name}. Investir em si mesmo é sempre um bom negócio!`);
    }

    if (newSuggestions.length === 0) {
      return ["Seus gastos estão bem alinhados com as metas. Ótimo trabalho!"];
    }

    return newSuggestions;
  }, [expenses, totalIncome]);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <Lightbulb className="mr-2 text-yellow-400" />
            Sugestões Automáticas
        </h3>
        <ul className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">&#10003;</span>
              <p className="text-gray-600 dark:text-gray-300">{suggestion}</p>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default Suggestions;