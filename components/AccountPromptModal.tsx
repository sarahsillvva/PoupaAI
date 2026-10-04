import React from 'react';
import pigLogoSrc from '../assets/pig-poupa-ai.svg';

interface AccountPromptModalProps {
  onCreateAccount: () => void;
  onLogin: () => void;
  onDismiss: () => void;
}

const AccountPromptModal: React.FC<AccountPromptModalProps> = ({ onCreateAccount, onLogin, onDismiss }) => (
  <div
    className="fixed inset-0 h-screen w-screen bg-black/60 z-[10003] flex items-center justify-center p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="account-prompt-title"
  >
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800 transition-all">
      <div className="p-6 sm:p-8 text-center">
        
        {/* Logo menor e mais elegante */}
        <div className="mx-auto mb-4 flex h-20 items-center justify-center">
          <img src={pigLogoSrc} alt="Símbolo do Poupa Aí" className="h-20 w-24 object-contain" />
        </div>

        <h2 id="account-prompt-title" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Que bom ter você no Poupa Aí!
        </h2>

        {/* Texto unificado e limpo */}
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Crie sua conta gratuita para salvar suas movimentações na nuvem e acessar seu histórico de qualquer lugar.
        </p>

        {/* Botão principal de Ação */}
        <button
          type="button"
          onClick={onCreateAccount}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Criar minha conta grátis
        </button>

        {/* Ações secundárias organizadas lado a lado ou mais limpas */}
        <div className="mt-5 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
          <button
            type="button"
            onClick={onDismiss}
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Agora não
          </button>
          
          <button
            type="button"
            onClick={onLogin}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400 transition-colors"
          >
            Já tenho uma conta
          </button>
        </div>

      </div>
    </div>
  </div>
);

export default AccountPromptModal;
