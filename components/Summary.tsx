import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Scale, Edit } from 'lucide-react';
import Card from './common/Card';

interface SummaryProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  onEditIncome: () => void;
}

const SummaryCard: React.FC<{ title: string; amount: number; icon: React.ReactNode; colorClass: string; children?: React.ReactNode; id?: string;}> = ({ title, amount, icon, colorClass, children, id }) => {
    const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    return (
        <Card id={id} className="p-6 flex items-center space-x-4 relative">
            <div className={`p-3 rounded-full ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formattedAmount}</p>
            </div>
            {children}
        </Card>
    )
}

const Summary: React.FC<SummaryProps> = ({ totalIncome, totalExpenses, balance, onEditIncome }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
            title="Valor Disponível"
            amount={totalIncome}
            icon={<ArrowUpCircle className="h-8 w-8 text-white"/>}
            colorClass="bg-green-500"
        >
          <button id="tour-edit-income" onClick={onEditIncome} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white" aria-label="Editar Valor Disponível">
            <Edit size={20}/>
          </button>
        </SummaryCard>
        <SummaryCard 
            title="Total de Gastos"
            amount={totalExpenses}
            icon={<ArrowDownCircle className="h-8 w-8 text-white"/>}
            colorClass="bg-red-500"
        />
        <SummaryCard 
            title="Saldo"
            amount={balance}
            icon={<Scale className="h-8 w-8 text-white"/>}
            colorClass={balance >= 0 ? "bg-blue-500" : "bg-yellow-500"}
        />
    </div>
  );
};

export default Summary;