import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, FileDown, LogIn, LogOut, UserRound, ChevronDown, UserCog, Share2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { logoSrc } from '../constants';

interface HeaderProps {
    onPurchaseAdvisor: () => void;
    onGeneratePDF: () => void;
    user: User | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    nickname: string;
    onOpenProfile: () => void;
    onOpenReferral: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onPurchaseAdvisor,
  onGeneratePDF,
  user,
  onOpenAuth,
  onLogout,
  nickname,
  onOpenProfile,
  onOpenReferral,
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setIsAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isAccountMenuOpen]);

  const runMenuAction = (action: () => void) => {
    setIsAccountMenuOpen(false);
    action();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <img src={logoSrc} alt="PoupaAI Logo" className="h-32 w-auto" />
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(open => !open)}
                  className="flex items-center gap-2 p-2 md:py-2 md:px-4 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-haspopup="menu"
                  aria-expanded={isAccountMenuOpen}
                  title="Abrir menu da conta"
                >
                  <UserRound size={18} />
                  <span className="max-w-28 truncate">{nickname || 'Minha conta'}</span>
                  <ChevronDown size={15} className={`transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAccountMenuOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                    <button type="button" role="menuitem" onClick={() => runMenuAction(onOpenProfile)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
                      <UserCog size={17} /> Meu perfil
                    </button>
                    <button type="button" role="menuitem" onClick={() => runMenuAction(onOpenReferral)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
                      <Share2 size={17} /> Indicar app
                    </button>
                    <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                    <button type="button" role="menuitem" onClick={() => runMenuAction(onLogout)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                      <LogOut size={17} /> Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 p-2 md:py-2 md:px-4 rounded-md text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Entrar"
              >
                <LogIn size={18} />
                <span className="hidden md:inline">Entrar</span>
              </button>
            )}
            <button
              id="tour-purchase-advisor"
              onClick={onPurchaseAdvisor}
              className="flex items-center gap-2 p-2 md:py-2 md:px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              title="Posso Comprar?"
            >
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Posso Comprar?</span>
            </button>
            <button
              id="tour-pdf-report"
              onClick={onGeneratePDF}
              className="flex items-center gap-2 p-2 md:py-2 md:px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Gerar Relatório PDF"
            >
              <FileDown size={18} />
              <span className="hidden md:inline">Relatório PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
