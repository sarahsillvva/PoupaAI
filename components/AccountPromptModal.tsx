import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AccountPromptModalProps {
  onCreateAccount: () => void;
  onDismiss: () => void;
}

const AccountPromptModal: React.FC<AccountPromptModalProps> = ({ onCreateAccount, onDismiss }) => (
  <div
    className="fixed inset-0 h-screen w-screen bg-black/60 z-[10003] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="account-prompt-title"
  >
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
      <div className="p-6 sm:p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
          <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        </div>
        <h2 id="account-prompt-title" className="text-2xl font-bold text-gray-900 dark:text-white">
          Não perca o controle das suas finanças! 💸
        </h2>
        <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Notamos que você já está usando o <strong>Poupa Aí</strong> por aqui. Para garantir que seus dados fiquem seguros e você possa acessar de qualquer celular ou computador, crie sua conta gratuita agora mesmo. Leva menos de 1 minuto!
        </p>
        <button
          type="button"
          onClick={onCreateAccount}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Criar minha conta grátis
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-200"
        >
          Continuar navegando sem conta
        </button>
      </div>
    </div>
  </div>
);

export default AccountPromptModal;
