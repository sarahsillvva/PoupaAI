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
import ProfileModal from './components/ProfileModal';
import ReferralModal from './components/ReferralModal';
import { auth } from './services/firebase';
import { getNickname, logOut } from './services/authService';
import { migrateLocalDataToUser } from './services/apiService';
import { captureReferralFromUrl } from './services/referralService';

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
  const [isDataReady, setIsDataReady] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async currentUser => {
      setIsAuthReady(false);
      setIsDataReady(false);
      setMigrationError(null);

      try {
        if (currentUser) {
          await migrateLocalDataToUser(currentUser.uid);
          setNickname(await getNickname(currentUser));
        } else {
          setNickname('');
          captureReferralFromUrl();
        }
        setUser(currentUser);
        setIsDataReady(true);
      } catch (error) {
        console.error('Falha ao migrar os dados locais:', error);
        setUser(currentUser);
        setMigrationError(error instanceof Error ? error.message : 'Não foi possível proteger seus dados agora.');
      } finally {
        setIsAuthReady(true);
      }
    });
  }, []);

  const retryMigration = async () => {
    if (!auth.currentUser) return;
    setIsAuthReady(false);
    setMigrationError(null);
    try {
      await migrateLocalDataToUser(auth.currentUser.uid);
      setIsDataReady(true);
    } catch (error) {
      setMigrationError(error instanceof Error ? error.message : 'Não foi possível proteger seus dados agora.');
    } finally {
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    if (!isAuthReady || !isDataReady) return;

    if (!user && !sessionStorage.getItem(ACCOUNT_PROMPT_SESSION_KEY)) {
      setIsAccountPromptOpen(true);
      return;
    }

    if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
      const timeout = window.setTimeout(() => setIsTourOpen(true), 500);
      return () => window.clearTimeout(timeout);
    }
  }, [isAuthReady, isDataReady, user]);

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
      <ProfileModal
        isOpen={isProfileOpen}
        user={user}
        nickname={nickname}
        onClose={() => setIsProfileOpen(false)}
        onNicknameChanged={setNickname}
      />
      <ReferralModal
        isOpen={isReferralOpen}
        userId={user?.uid ?? null}
        onClose={() => setIsReferralOpen(false)}
      />
      
      <Header
        onPurchaseAdvisor={handlePurchaseAdvisor}
        onGeneratePDF={handleGeneratePDF}
        user={user}
        onOpenAuth={() => openAuth('login')}
        onLogout={() => void logOut()}
        nickname={nickname}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
      />
      <main className="flex-grow">
        {!isAuthReady ? (
          <div className="flex min-h-[60vh] items-center justify-center p-6 text-center text-gray-600 dark:text-gray-300">
            Protegendo e sincronizando seus dados...
          </div>
        ) : migrationError ? (
          <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seus dados continuam seguros neste navegador</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{migrationError}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Nada foi apagado. Verifique sua conexão e tente novamente.</p>
            <button type="button" onClick={() => void retryMigration()} className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Tentar novamente
            </button>
          </div>
        ) : isDataReady ? (
          <Dashboard key={user?.uid ?? 'guest'} />
        ) : null}
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
