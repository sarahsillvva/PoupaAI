import React, { useEffect, useState } from 'react';
import { CheckCircle2, LockKeyhole, MailCheck, X } from 'lucide-react';
import { requestPasswordReset, signIn, signInWithGoogle, signUp } from '../services/authService';
import googleIcon from '../assets/google.png';
export type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

type EmailNotice = {
  title: string;
  email: string;
  description: string;
};

const authErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente entrar na sua conta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/invalid-email': 'Digite um endereço de e-mail válido.',
    'auth/email-not-verified': 'Seu e-mail ainda não foi confirmado. Enviamos um novo link de confirmação.',
    'auth/missing-password': 'Digite sua senha.',
    'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente.',
    'auth/popup-closed-by-user': 'A entrada com Google foi cancelada.',
    'auth/unauthorized-domain': 'Este endereço ainda não está autorizado para entrar com Google. Avise o suporte do Poupa Aí.',
    'auth/operation-not-allowed': 'A entrada com Google não está habilitada neste ambiente.',
    'auth/network-request-failed': 'Não foi possível conectar ao Google. Verifique sua internet e tente novamente.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/weak-password': 'Use uma senha com pelo menos 6 caracteres.',
  };
  return messages[code] ?? 'Não foi possível concluir. Confira os dados e tente novamente.';
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
  const [emailNotice, setEmailNotice] = useState<EmailNotice | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMessage(null);
      setAwaitingEmailVerification(false);
      setEmailNotice(null);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (mode === 'signup' && password.length < 6) {
      setMessage({ type: 'error', text: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp({ name, phone, email, password });
        setAwaitingEmailVerification(true);
        setMessage({ type: 'success', text: `Enviamos um link de confirmação para ${email.trim()}.` });
        setEmailNotice({
          title: 'Confirme seu e-mail',
          email: email.trim(),
          description: 'Enviamos um link para confirmar sua conta.',
        });
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code === 'auth/email-not-verified') {
        setEmailNotice({
          title: 'Confirme seu e-mail',
          email: email.trim(),
          description: 'Seu e-mail ainda não foi confirmado. Enviamos um novo link.',
        });
      }
      setMessage({ type: 'error', text: authErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Digite seu e-mail para recuperar a senha.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setMessage({ type: 'success', text: 'Enviamos as instruções de recuperação para seu e-mail.' });
      setEmailNotice({
        title: 'Redefina sua senha',
        email: email.trim(),
        description: 'Enviamos um link para você criar uma nova senha.',
      });
    } catch (error) {
      setMessage({ type: 'error', text: authErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      setMessage({ type: 'error', text: authErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationConfirmed = async () => {
    setMessage(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      onClose();
    } catch (error) {
      setMessage({ type: 'error', text: authErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white';
  const normalizedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isSignupValid = name.trim().length >= 2
    && isEmailValid
    && password.length >= 6
    && confirmPassword.length >= 6
    && password === confirmPassword;
  const isLoginValid = isEmailValid && password.length >= 6;
  const isSubmitDisabled = isSubmitting || (mode === 'signup' ? !isSignupValid : !isLoginValid);
  const requiredMark = <span className="text-red-500" aria-hidden="true"> *</span>;

  return (
    <div data-clarity-mask="true" className="fixed inset-0 h-screen w-screen bg-black/60 z-[10004] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <LockKeyhole className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <h2 id="auth-title" className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'signup' ? 'Criar conta grátis' : 'Entrar'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        {awaitingEmailVerification ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"><MailCheck size={28} /></div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Confirme seu e-mail</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Enviamos um link para <strong>{normalizedEmail}</strong>. Abra o e-mail, confirme seu endereço e depois volte aqui.</p>
            {message && <p role="status" className={`mt-4 text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{message.text}</p>}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleVerificationConfirmed()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <CheckCircle2 size={18} /> {isSubmitting ? 'Verificando...' : 'Já confirmei meu e-mail'}
            </button>
            <button type="button" onClick={() => { setAwaitingEmailVerification(false); setMode('login'); setMessage(null); }} className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Voltar para entrar</button>
          </div>
        ) : <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <span className="flex h-5 w-5 items-center justify-center font-bold text-blue-600" aria-hidden="true"><img src={googleIcon} alt="Google" /></span>
            Continuar com Google
          </button>

          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs uppercase tracking-wide text-gray-400">ou</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="auth-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome{requiredMark}</label>
                <input id="auth-name" value={name} onChange={event => setName(event.target.value)} className={inputClass} autoComplete="name" minLength={2} required aria-required="true" />
              </div>
              <div>
                <label htmlFor="auth-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone <span className="font-normal text-gray-400">(opcional)</span></label>
                <input id="auth-phone" value={phone} onChange={event => setPhone(event.target.value)} className={inputClass} inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" />
              </div>
            </>
          )}
          <div>
            <label htmlFor="auth-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail{requiredMark}</label>
            <input id="auth-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className={inputClass} autoComplete="email" required aria-required="true" />
          </div>
          <div>
            <label htmlFor="auth-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Senha{requiredMark}</label>
            <input id="auth-password" type="password" value={password} onChange={event => setPassword(event.target.value)} className={inputClass} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required aria-required="true" />
            {mode === 'signup' && <p className={`mt-1 text-xs ${password && password.length < 6 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>Mínimo de 6 caracteres.</p>}
          </div>
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar senha{requiredMark}</label>
              <input id="auth-confirm-password" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={inputClass} autoComplete="new-password" minLength={6} required aria-required="true" />
              {confirmPassword && password !== confirmPassword && <p className="mt-1 text-xs text-red-500">As senhas não coincidem.</p>}
            </div>
          )}

          {message && (
            <p role="status" className={`text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {message.text}
            </p>
          )}

          {mode === 'login' && (
            <button type="button" onClick={handlePasswordReset} disabled={isSubmitting} className="text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50 dark:text-indigo-400">
              Esqueci minha senha
            </button>
          )}

          <button type="submit" disabled={isSubmitDisabled} className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? 'Aguarde...' : mode === 'signup' ? 'Criar minha conta grátis' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(current => current === 'login' ? 'signup' : 'login');
              setMessage(null);
            }}
            className="w-full text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}
          </button>
        </form>}
      </div>
      {emailNotice && (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/65 p-4" role="alertdialog" aria-modal="true" aria-labelledby="email-notice-title" aria-describedby="email-notice-description">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-gray-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <MailCheck size={28} aria-hidden="true" />
            </div>
            <h3 id="email-notice-title" className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{emailNotice.title}</h3>
            <p id="email-notice-description" className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {emailNotice.description}<br />
              Confira a caixa de entrada de <strong>{emailNotice.email}</strong>.
            </p>
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Não encontrou? Verifique também a caixa de Spam ou Lixo eletrônico.
            </p>
            <button type="button" onClick={() => setEmailNotice(null)} autoFocus className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;
