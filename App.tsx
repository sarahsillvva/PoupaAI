import React from 'react';
import { PlusCircle } from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

function App() {

  const handleAddExpense = () => {
    window.dispatchEvent(new CustomEvent('add-expense'));
  }

  const handlePurchaseAdvisor = () => {
    window.dispatchEvent(new CustomEvent('open-purchase-advisor'));
  }

  const handleGeneratePDF = () => {
    window.dispatchEvent(new CustomEvent('generate-pdf'));
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Header
        onPurchaseAdvisor={handlePurchaseAdvisor}
        onGeneratePDF={handleGeneratePDF}
      />
      <Dashboard />
      
      <button
        onClick={handleAddExpense}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg z-50 flex items-center justify-center transition-transform transform hover:scale-110"
        aria-label="Adicionar Nova Despesa"
        title="Adicionar Nova Despesa"
      >
        <PlusCircle size={24} />
      </button>
    </div>
  );
}

export default App;