import React, { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, UserRound, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import { requestPasswordReset, updateNickname } from '../services/authService';

interface ProfileModalProps {
  isOpen: boolean;
  user: User | null;
  nickname: string;
  onClose: () => void;
  onNicknameChanged: (nickname: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, user, nickname, onClose, onNicknameChanged }) => {
  const [value, setValue] = useState(nickname);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue(nickname);
      setMessage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;
  const usesPassword = user.providerData.some(provider => provider.providerId === 'password');

  const saveNickname = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updatedNickname = await updateNickname(user, value);
      onNicknameChanged(updatedNickname);
      setMessage('Apelido atualizado com sucesso.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível atualizar o apelido.');
    } finally {
      setIsSaving(false);
    }
  };

  const sendPasswordLink = async () => {
    if (!user.email) return;
    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      await requestPasswordReset(user.email);
      setMessage(`Enviamos o link para ${user.email}.`);
    } catch {
      setError('Não foi possível enviar o link agora. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 id="profile-title" className="text-xl font-bold text-gray-900 dark:text-white">Meu perfil</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Fechar"><X size={20} /></button>
        </div>

        <form onSubmit={saveNickname} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Apelido
            <div className="relative mt-1">
              <UserRound size={17} className="absolute left-3 top-3 text-gray-400" />
              <input value={value} onChange={event => setValue(event.target.value)} minLength={2} maxLength={30} required className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">Este é o nome que aparecerá no cabeçalho.</p>
          <button type="submit" disabled={isSaving || value.trim() === nickname} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Salvar apelido</button>
        </form>

        {message && (
          <div role="status" aria-live="polite" className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
            <CheckCircle2 size={19} className="flex-none" />
            <span>{message}</span>
          </div>
        )}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><KeyRound size={18} /> Senha</h3>
          {usesPassword ? (
            <button type="button" disabled={isSaving} onClick={() => void sendPasswordLink()} className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Enviar link para alterar senha</button>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sua entrada é feita pelo Google. A senha é administrada na sua Conta Google.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
