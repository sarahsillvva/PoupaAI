import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import OnboardingTour from './components/OnboardingTour';
import type { TourStep } from './components/OnboardingTour';
import FinalOnboardingWarning from './components/FinalOnboardingWarning';
import AccountPromptModal from './components/AccountPromptModal';
import AuthModal, { type AuthMode } from './components/AuthModal';
import { auth } from './services/firebase';
import { logOut } from './services/authService';

const tourSteps: TourStep[] = [
  {
    selector: '#tour-edit-income',
    title: 'Defina seu Valor Disponível',
    content: 'Comece por aqui. Clique para inserir sua renda mensal ou o valor total que você tem disponível para gastar no mês.',
    position: 'bottom',
  },
  {
    selector: '#tour-add-expense',
    title: 'Adicione suas Despesas',
    content: 'Use este botão para adicionar todas as suas despesas. Você poderá informar se é recorrente, o número de parcelas e a data de vencimento.',
    position: 'left',
  },
  {
    selector: '#tour-purchase-advisor',
    title: 'Posso Comprar?',
    content: 'Ficou na dúvida sobre uma compra? Use esta ferramenta para verificar se o gasto cabe no seu orçamento para a categoria.',
    position: 'bottom',
  },
  {
    selector: '#tour-pdf-report',
    title: 'Exporte seu Relatório',
    content: 'Ao final do mês, você pode gerar um relatório em PDF com o resumo de suas finanças.',
    position: 'bottom',
  },
  {
    selector: '#tour-suggestions',
    title: 'Saúde Financeira',
    content: 'Receba aqui dicas e sugestões automáticas para melhorar a gestão do seu dinheiro com base nos seus gastos.',
    position: 'top',
  }
];

const TOUR_STORAGE_KEY = 'poupa-ai-tour-completed';
const FINAL_WARNING_STORAGE_KEY = 'poupa-ai-final-warning-seen';
const ACCOUNT_PROMPT_SESSION_KEY = 'poupa-ai-account-prompt-dismissed';

function App() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFinalWarningOpen, setIsFinalWarningOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAccountPromptOpen, setIsAccountPromptOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    return onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user && !sessionStorage.getItem(ACCOUNT_PROMPT_SESSION_KEY)) {
      setIsAccountPromptOpen(true);
      return;
    }

    if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
      const timeout = window.setTimeout(() => setIsTourOpen(true), 500);
      return () => window.clearTimeout(timeout);
    }
  }, [isAuthReady, user]);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAccountPromptOpen(false);
    setIsAuthModalOpen(true);
  };

  const dismissAccountPrompt = () => {
    sessionStorage.setItem(ACCOUNT_PROMPT_SESSION_KEY, 'true');
    setIsAccountPromptOpen(false);
    if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
      window.setTimeout(() => setIsTourOpen(true), 300);
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsTourOpen(false);

    const finalWarningSeen = localStorage.getItem(FINAL_WARNING_STORAGE_KEY);
    if (!finalWarningSeen) {
      setIsFinalWarningOpen(true);
    }
  };

  const handleCloseFinalWarning = () => {
    localStorage.setItem(FINAL_WARNING_STORAGE_KEY, 'true');
    setIsFinalWarningOpen(false);
  };

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans flex flex-col">
      {isTourOpen && <OnboardingTour steps={tourSteps} onComplete={handleTourComplete} />}
      {isFinalWarningOpen && <FinalOnboardingWarning onClose={handleCloseFinalWarning} />}
      {isAccountPromptOpen && (
        <AccountPromptModal
          onCreateAccount={() => openAuth('signup')}
          onDismiss={dismissAccountPrompt}
        />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      <Header
        onPurchaseAdvisor={handlePurchaseAdvisor}
        onGeneratePDF={handleGeneratePDF}
        user={user}
        onOpenAuth={() => openAuth('login')}
        onLogout={() => void logOut()}
      />
      <main className="flex-grow">
        <Dashboard />
      </main>

      <Footer />
      
      <button
        id="tour-add-expense"
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
