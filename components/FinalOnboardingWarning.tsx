import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FinalOnboardingWarningProps {
  onClose: () => void;
  onCreateAccount: () => void;
}

const FinalOnboardingWarning: React.FC<FinalOnboardingWarningProps> = ({ onClose, onCreateAccount }) => {
  return (
    <div className="fixed inset-0 h-screen w-screen bg-black bg-opacity-60 z-[10002] flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md relative">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="text-yellow-500 h-12 w-12 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Não perca seus dados
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enquanto você estiver usando o Poupa Aí sem uma conta, seus registros financeiros ficarão salvos <strong>apenas neste navegador</strong>.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Para não perder seus dados e poder acessá-los de outros dispositivos, <strong>crie sua conta gratuita</strong>. Seus registros atuais serão levados com você.
            </p>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onCreateAccount}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Criar minha conta grátis
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalOnboardingWarning;
