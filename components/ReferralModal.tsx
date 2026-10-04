import React, { useEffect, useState } from 'react';
import { Check, Copy, Share2, X } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  userId: string | null;
  onClose: () => void;
}

const SITE_URL = 'https://poupa-ai-org.vercel.app/';

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, userId, onClose }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [isOpen]);
  if (!isOpen || !userId) return null;

  const referralUrl = `${SITE_URL}?ref=${encodeURIComponent(userId)}`;
  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
  };
  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Poupa Aí', text: 'Conheça o Poupa Aí e organize melhor suas finanças!', url: referralUrl });
    } else {
      await copyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="referral-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 id="referral-title" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"><Share2 size={21} /> Indicar o Poupa Aí</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Fechar"><X size={20} /></button>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Compartilhe seu link pessoal. Quando alguém acessá-lo, poderemos identificar que conheceu o app por você.</p>
        <div className="mt-5 break-all rounded-lg bg-gray-100 p-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">{referralUrl}</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => void copyLink()} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copiado!' : 'Copiar link'}</button>
          <button type="button" onClick={() => void shareLink()} className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"><Share2 size={17} /> Compartilhar</button>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
