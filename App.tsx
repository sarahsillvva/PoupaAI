import React from 'react';
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
        onAddExpense={handleAddExpense}
        onPurchaseAdvisor={handlePurchaseAdvisor}
        onGeneratePDF={handleGeneratePDF}
      />
      <Dashboard />
    </div>
  );
}

export default App;
